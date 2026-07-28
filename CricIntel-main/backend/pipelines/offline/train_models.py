"""
Offline Pipeline: Model Trainer.

Trains format-specific XGBoost models using the production datasets
and saves artifacts to ml/models/{format}/.

Usage:
    python -m pipelines.offline.train_models --format odi
    python -m pipelines.offline.train_models --format t20
    python -m pipelines.offline.train_models --format test
    python -m pipelines.offline.train_models --format all
    python -m pipelines.offline.train_models --format all --trials 30
"""

import argparse
import logging
import sys
from typing import Optional

from ml.config.settings import SUPPORTED_FORMATS, OPTUNA_TRIALS

logger = logging.getLogger(__name__)


def train_models(
    format_type: str,
    n_trials: int = OPTUNA_TRIALS,
) -> list[str]:
    """
    Train all 5 XGBoost models for a given cricket format.

    Delegates to ml.main.run_format_pipeline, which handles:
      - Data loading
      - Feature engineering
      - Preprocessing (fit)
      - Training Playing XI, Runs, Wickets, Strike Rate, Economy models
      - Saving models and preprocessors

    Args:
        format_type: 'odi', 't20', 'test', or 'all'.
        n_trials: Number of Optuna hyperparameter tuning trials.

    Returns:
        List of saved model file paths.
    """
    from ml.config.settings import MODELS_DIR
    from ml.main import run_training_pipeline

    fmt_list = SUPPORTED_FORMATS if format_type == "all" else [format_type]
    results = run_training_pipeline(formats=fmt_list, n_trials=n_trials)

    saved_paths = []
    for fmt, targets in results.items():
        for target, info in targets.items():
            if info.get("status") == "trained":
                model_path = str(MODELS_DIR / fmt / f"{target}.joblib")
                saved_paths.append(model_path)

    return saved_paths


def main() -> None:
    parser = argparse.ArgumentParser(
        description="CrickIntel Offline Training Pipeline — trains XGBoost models"
    )
    parser.add_argument(
        "--format",
        required=True,
        choices=SUPPORTED_FORMATS + ["all"],
        help="Cricket format to train models for",
    )
    parser.add_argument(
        "--trials",
        type=int,
        default=OPTUNA_TRIALS,
        help=f"Optuna tuning trials per model (default: {OPTUNA_TRIALS})",
    )
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    saved = train_models(format_type=args.format, n_trials=args.trials)
    logger.info(f"Training complete. {len(saved)} model(s) saved:")
    for path in saved:
        logger.info(f"  {path}")


if __name__ == "__main__":
    main()
