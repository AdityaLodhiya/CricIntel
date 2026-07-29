"""
Offline Pipeline: Model Evaluator.

Loads all trained XGBoost models and their preprocessors, evaluates
them on a held-out test split, and prints a detailed metrics report.

Usage:
    python -m pipelines.offline.evaluate_models --format odi
    python -m pipelines.offline.evaluate_models --format all
"""

import argparse
import logging
import sys
import numpy as np
import pandas as pd
from typing import Any, Dict, List

from ml.config.settings import (
    DATASET_PATHS,
    IDENTIFIER_COLS,
    OPTUNA_TRIALS,
    RANDOM_SEED,
    SUPPORTED_FORMATS,
    TARGET_COLUMN_MAP,
    TARGET_EXCLUDED_COLS,
    TARGET_TASK_TYPE,
    TRAIN_RATIO,
    VAL_RATIO,
)
from ml.feature_engine.pipeline import FeatureEngineeringPipeline
from ml.preprocessing.splitter import chronological_split, stratified_train_val_test_split
from ml.training.model_saver import load_model, load_preprocessor, model_exists
from ml.training.xgboost_trainer import evaluate_model, get_top_features, get_shap_explanations

logger = logging.getLogger(__name__)


def _prepare_test_split(fmt: str, target_name: str, target_col: str) -> tuple:
    """
    Reload dataset, apply saved preprocessors, and extract the test split
    for the specified target matching training configuration.

    Returns (X_test, y_test) or (None, None) if loading fails.
    """
    dataset_path = DATASET_PATHS.get(fmt)
    if not dataset_path or not dataset_path.exists():
        logger.error(f"Dataset not found: {dataset_path}")
        return None, None

    try:
        preprocessor = load_preprocessor(fmt)
    except FileNotFoundError as e:
        logger.error(str(e))
        return None, None

    cleaner = preprocessor["cleaner"]
    encoder = preprocessor["encoder"]

    df = pd.read_csv(dataset_path)
    if "match_date" in df.columns:
        df["match_date"] = pd.to_datetime(df["match_date"], errors="coerce")
        df = df.sort_values("match_date").reset_index(drop=True)

    fe = FeatureEngineeringPipeline()
    df = fe.transform(df)
    df = cleaner.transform(df)
    df = encoder.transform(df)

    if target_name in ["runs", "wickets"] and "selected_in_playing_xi" in df.columns:
        df = df[df["selected_in_playing_xi"] == 1].copy()

    excluded = TARGET_EXCLUDED_COLS.get(target_name, [])
    id_cols = [c for c in IDENTIFIER_COLS if c in df.columns]
    drop_cols = [c for c in set(excluded + id_cols) if c in df.columns and c != target_col]

    df_model = df.drop(columns=drop_cols).dropna(subset=[target_col])

    task_type = TARGET_TASK_TYPE[target_name]
    if task_type == "classification":
        _, _, X_test, _, _, y_test = stratified_train_val_test_split(df_model, target_col)
    else:
        _, _, X_test, _, _, y_test = chronological_split(df_model, target_col)

    return X_test, y_test


def evaluate_format(fmt: str) -> Dict[str, Any]:
    """Evaluate all 5 models for a given format."""
    fmt = fmt.lower()
    logger.info(f"\n{'='*60}")
    logger.info(f"Evaluating {fmt.upper()} models")
    logger.info(f"{'='*60}")

    format_results: Dict[str, Any] = {}

    for target_name, target_col in TARGET_COLUMN_MAP.items():
        task_type = TARGET_TASK_TYPE[target_name]

        if not model_exists(fmt, target_name):
            logger.warning(f"  [{fmt}/{target_name}] No saved model — skipping.")
            format_results[target_name] = {"status": "not_trained"}
            continue

        model = load_model(fmt, target_name)
        X_test, y_test = _prepare_test_split(fmt, target_name, target_col)

        if X_test is None or len(X_test) == 0:
            logger.warning(f"  [{fmt}/{target_name}] Could not prepare test split.")
            format_results[target_name] = {"status": "error"}
            continue

        metrics = evaluate_model(model, X_test, y_test, task_type)
        top_features = get_top_features(model, list(X_test.columns), top_n=5)

        format_results[target_name] = {
            "status": "evaluated",
            "task_type": task_type,
            "target_col": target_col,
            "n_test_samples": len(X_test),
            "metrics": metrics,
            "top_features": top_features,
        }

        _log_metrics(fmt, target_name, task_type, metrics, top_features)

    return format_results


def _log_metrics(fmt, target_name, task_type, metrics, top_features):
    label = f"{fmt.upper()}/{target_name}"
    if task_type == "classification":
        cm = metrics.pop("confusion_matrix", [])
        logger.info(
            f"  [{label}] "
            f"Acc={metrics.get('accuracy', 0):.4f} | "
            f"Prec={metrics.get('precision', 0):.4f} | "
            f"Rec={metrics.get('recall', 0):.4f} | "
            f"F1={metrics.get('f1', 0):.4f} | "
            f"AUC={metrics.get('roc_auc', 0):.4f}"
        )
        logger.info(f"    Confusion Matrix: {cm}")
    else:
        logger.info(
            f"  [{label}] "
            f"MAE={metrics.get('mae', 0):.4f} | "
            f"RMSE={metrics.get('rmse', 0):.4f} | "
            f"R²={metrics.get('r2', 0):.4f}"
        )
    logger.info(f"    Top features: {[f[0] for f in top_features]}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate trained CrickIntel XGBoost models"
    )
    parser.add_argument(
        "--format",
        required=True,
        choices=SUPPORTED_FORMATS + ["all"],
        help="Format to evaluate",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    fmt_list = SUPPORTED_FORMATS if args.format == "all" else [args.format]
    for fmt in fmt_list:
        evaluate_format(fmt)


if __name__ == "__main__":
    main()
