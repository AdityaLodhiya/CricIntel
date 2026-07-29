"""
CrickIntel Main ML Training Pipeline.

Trains 15 independent XGBoost models:
  - 5 models × 3 formats (ODI, T20, Test)

Models per format:
  1. Playing XI  — XGBClassifier (binary classification)
  2. Runs        — XGBRegressor
  3. Wickets     — XGBRegressor
  4. Strike Rate — XGBRegressor (target: career_strike_rate)
  5. Economy     — XGBRegressor (target: career_economy)

Usage:
    python -m ml.main
    python -m ml.main --format odi        # Train only ODI models
    python -m ml.main --trials 30         # Custom Optuna trial count
"""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd

from ml.config.settings import (
    DATASET_PATHS,
    IDENTIFIER_COLS,
    OPTUNA_TRIALS,
    RANDOM_SEED,
    SUPPORTED_FORMATS,
    TARGET_COLUMN_MAP,
    TARGET_EXCLUDED_COLS,
    TARGET_TASK_TYPE,
)
from ml.feature_engine.pipeline import FeatureEngineeringPipeline
from ml.preprocessing.cleaner import DataCleaner
from ml.preprocessing.encoders import CategoricalEncoder
from ml.preprocessing.splitter import (
    chronological_split,
    stratified_train_val_test_split,
)
from ml.training.model_saver import save_preprocessor
from ml.training.trainer import ModelTrainer
from ml.utils.logger import get_logger

logger = get_logger("MainPipeline")


# ---------------------------------------------------------------------------
# Per-format pipeline
# ---------------------------------------------------------------------------

def run_format_pipeline(
    format_type: str,
    n_trials: int = OPTUNA_TRIALS,
) -> Dict[str, Any]:
    """
    Execute the complete training pipeline for a single cricket format.

    Steps:
      1. Load dataset
      2. Sort chronologically (prevents data leakage)
      3. Feature engineering
      4. Cleaning (fit)
      5. Categorical encoding (fit)
      6. Save preprocessors
      7. For each of the 5 targets:
           a. Remove all target-derived and excluded features for this target
           b. Filter dataset to selected_in_playing_xi == 1 for in-match targets (runs, wickets)
           c. Split (stratified for classification, chronological for regression)
           d. Train XGBoost model with Optuna tuning
           e. Evaluate, compute SHAP explanations, and save

    Returns:
        Dict mapping target_name → training result dict.
    """
    fmt = format_type.lower()
    dataset_path = DATASET_PATHS.get(fmt)
    if dataset_path is None or not dataset_path.exists():
        logger.error(f"Dataset not found for format '{fmt}': {dataset_path}")
        return {}

    logger.info(f"\n{'#'*70}")
    logger.info(f"# Starting pipeline for format: {fmt.upper()}")
    logger.info(f"# Dataset: {dataset_path}")
    logger.info(f"{'#'*70}")

    # ------------------------------------------------------------------
    # 1. Load data
    # ------------------------------------------------------------------
    logger.info(f"[{fmt}] Loading dataset...")
    df = pd.read_csv(dataset_path)
    logger.info(f"[{fmt}] Loaded {len(df):,} rows × {df.shape[1]} columns")

    # ------------------------------------------------------------------
    # 2. Chronological sort (prevents future leakage)
    # ------------------------------------------------------------------
    if "match_date" in df.columns:
        df["match_date"] = pd.to_datetime(df["match_date"], errors="coerce")
        df = df.sort_values("match_date").reset_index(drop=True)
        logger.info(
            f"[{fmt}] Date range: {df['match_date'].min().date()} to "
            f"{df['match_date'].max().date()}"
        )

    # ------------------------------------------------------------------
    # 3. Feature engineering (before cleaning — works on raw columns)
    # ------------------------------------------------------------------
    logger.info(f"[{fmt}] Running feature engineering...")
    fe = FeatureEngineeringPipeline()
    df = fe.transform(df)
    logger.info(f"[{fmt}] After feature engineering: {df.shape[1]} columns")

    # ------------------------------------------------------------------
    # 4. Cleaning (fit_transform — records state for inference)
    # ------------------------------------------------------------------
    logger.info(f"[{fmt}] Cleaning data...")
    cleaner = DataCleaner()
    df = cleaner.fit_transform(df)
    logger.info(
        f"[{fmt}] After cleaning: {df.shape[1]} columns. "
        f"Empty cols dropped: {cleaner.dropped_empty_cols}"
    )

    # ------------------------------------------------------------------
    # 5. Categorical encoding (fit_transform — records state for inference)
    # ------------------------------------------------------------------
    logger.info(f"[{fmt}] Encoding categorical features...")
    encoder = CategoricalEncoder()
    df = encoder.fit_transform(df)
    logger.info(f"[{fmt}] Encoding complete.")

    # ------------------------------------------------------------------
    # 6. Save preprocessors for inference
    # ------------------------------------------------------------------
    prep_path = save_preprocessor(cleaner, encoder, fmt)
    logger.info(f"[{fmt}] Preprocessors saved to {prep_path}")

    # ------------------------------------------------------------------
    # 7. Train one model per target
    # ------------------------------------------------------------------
    results: Dict[str, Any] = {}

    for target_name, target_col in TARGET_COLUMN_MAP.items():
        task_type = TARGET_TASK_TYPE[target_name]

        if target_col not in df.columns:
            logger.warning(
                f"[{fmt}/{target_name}] Target column '{target_col}' not found. Skipping."
            )
            results[target_name] = {"status": "skipped", "reason": "column_not_found"}
            continue

        # For in-match performance targets (runs, wickets), train ONLY on players who played
        df_target = df.copy()
        if target_name in ["runs", "wickets"] and "selected_in_playing_xi" in df_target.columns:
            df_target = df_target[df_target["selected_in_playing_xi"] == 1].copy()

        n_valid = df_target[target_col].notna().sum()
        if n_valid < 100:
            logger.warning(
                f"[{fmt}/{target_name}] Too few valid samples ({n_valid}). Skipping."
            )
            results[target_name] = {
                "status": "skipped",
                "reason": f"insufficient_samples ({n_valid})",
            }
            continue

        if task_type == "classification" and df_target[target_col].nunique() < 2:
            logger.warning(
                f"[{fmt}/{target_name}] Target has only 1 unique value. Skipping."
            )
            results[target_name] = {"status": "skipped", "reason": "single_class"}
            continue

        # Strict feature matrix construction using TARGET_EXCLUDED_COLS & IDENTIFIER_COLS
        excluded = TARGET_EXCLUDED_COLS.get(target_name, [])
        id_cols = [c for c in IDENTIFIER_COLS if c in df_target.columns]
        drop_cols = [c for c in set(excluded + id_cols) if c in df_target.columns and c != target_col]

        df_model = df_target.drop(columns=drop_cols).dropna(subset=[target_col])

        n_samples = len(df_model)
        n_features = df_model.shape[1] - 1  # minus target
        logger.info(
            f"[{fmt}/{target_name}] Samples: {n_samples:,} | Features: {n_features}"
        )

        # Split
        if task_type == "classification":
            X_train, X_val, X_test, y_train, y_val, y_test = (
                stratified_train_val_test_split(df_model, target_col)
            )
        else:
            X_train, X_val, X_test, y_train, y_val, y_test = chronological_split(
                df_model, target_col
            )

        # Train
        t_start = time.time()
        trainer = ModelTrainer(task_type=task_type)
        trainer.fit(
            format_type=fmt,
            target_name=target_name,
            X_train=X_train,
            y_train=y_train,
            X_val=X_val,
            y_val=y_val,
            X_test=X_test,
            y_test=y_test,
            n_trials=n_trials,
        )
        elapsed = time.time() - t_start

        results[target_name] = {
            "status": "trained",
            "format": fmt,
            "task_type": task_type,
            "target_col": target_col,
            "n_samples": n_samples,
            "n_features": n_features,
            "training_time_seconds": round(elapsed, 2),
            "best_params": trainer.best_params,
            "cv_results": trainer.cv_results,
            "test_metrics": trainer.test_metrics,
            "top_features": trainer.feature_importances,
            "shap_summary": getattr(trainer, "shap_summary", []),
        }

        logger.info(f"[{fmt}/{target_name}] Done in {elapsed:.1f}s")

    return results


# ---------------------------------------------------------------------------
# Full pipeline entry point
# ---------------------------------------------------------------------------

def run_training_pipeline(
    formats: Optional[List[str]] = None,
    n_trials: int = OPTUNA_TRIALS,
) -> Dict[str, Dict[str, Any]]:
    """
    Train all models for the specified formats (default: all three).

    Args:
        formats: List of formats to train, e.g. ['odi', 't20']. None = all.
        n_trials: Number of Optuna trials per model.

    Returns:
        Nested dict: {format → {target → result}}.
    """
    if formats is None:
        formats = SUPPORTED_FORMATS

    pipeline_start = time.time()
    all_results: Dict[str, Dict[str, Any]] = {}

    logger.info(f"CrickIntel ML Training Pipeline started at {datetime.now().isoformat()}")
    logger.info(f"Formats: {formats} | Optuna trials: {n_trials}")

    for fmt in formats:
        fmt = fmt.lower()
        if fmt not in SUPPORTED_FORMATS:
            logger.warning(f"Unknown format '{fmt}'. Supported: {SUPPORTED_FORMATS}")
            continue
        all_results[fmt] = run_format_pipeline(fmt, n_trials=n_trials)

    total_elapsed = time.time() - pipeline_start
    logger.info(f"\n{'='*70}")
    logger.info(f"Pipeline complete in {total_elapsed/60:.1f} minutes.")

    # Print compact summary
    _print_summary(all_results)

    return all_results


def _print_summary(results: Dict[str, Dict[str, Any]]) -> None:
    """Print a concise training summary to the logger."""
    logger.info("\n=== TRAINING SUMMARY ===")
    for fmt, targets in results.items():
        logger.info(f"\n  {fmt.upper()}:")
        for target, info in targets.items():
            status = info.get("status", "unknown")
            if status == "trained":
                metrics = info.get("test_metrics", {})
                metric_str = " | ".join(
                    f"{k}={v:.4f}" for k, v in metrics.items()
                    if isinstance(v, float)
                )
                logger.info(f"    [OK] {target:15s} | {metric_str}")
            else:
                reason = info.get("reason", "unknown")
                logger.info(f"    [SKIPPED] {target:15s} | {reason}")


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="CrickIntel XGBoost ML Training Pipeline"
    )
    parser.add_argument(
        "--format",
        choices=SUPPORTED_FORMATS + ["all"],
        default="all",
        help="Cricket format to train (default: all)",
    )
    parser.add_argument(
        "--trials",
        type=int,
        default=OPTUNA_TRIALS,
        help=f"Number of Optuna tuning trials per model (default: {OPTUNA_TRIALS})",
    )
    args = parser.parse_args()

    fmt_list = SUPPORTED_FORMATS if args.format == "all" else [args.format]
    results = run_training_pipeline(formats=fmt_list, n_trials=args.trials)
    sys.exit(0)
