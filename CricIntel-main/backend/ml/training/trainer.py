"""
ModelTrainer — XGBoost-only training orchestrator.

Wraps xgboost_trainer functions to provide a clean single-model
training interface used by the main pipeline.
"""

import time
import pandas as pd
import numpy as np
from typing import Any, Dict, Optional, Tuple

from ml.config.settings import (
    TARGET_TASK_TYPE, OPTUNA_TRIALS,
)
from ml.training.xgboost_trainer import train_xgboost, evaluate_model, get_top_features
from ml.training.cross_validator import cross_validate_model
from ml.training.model_saver import save_model
from ml.utils.logger import get_logger

logger = get_logger("ModelTrainer")


class ModelTrainer:
    """
    Orchestrates training, cross-validation, evaluation, and saving
    for a single XGBoost model (one format + one target).
    """

    def __init__(self, task_type: str = "classification"):
        self.task_type = task_type
        self.model: Optional[Any] = None
        self.best_params: Dict[str, Any] = {}
        self.cv_results: Dict[str, Any] = {}
        self.test_metrics: Dict[str, Any] = {}
        self.feature_importances: list = []

    # ------------------------------------------------------------------
    # Main entry point
    # ------------------------------------------------------------------

    def fit(
        self,
        format_type: str,
        target_name: str,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: pd.DataFrame,
        y_val: pd.Series,
        X_test: pd.DataFrame,
        y_test: pd.Series,
        n_trials: int = OPTUNA_TRIALS,
    ) -> "ModelTrainer":
        """
        Train, cross-validate, evaluate, and save an XGBoost model.

        Args:
            format_type: 'odi', 't20', or 'test'.
            target_name: e.g. 'playing_xi', 'runs', 'wickets'.
            X_train, y_train: Training split.
            X_val, y_val: Validation split (used by Optuna + early stopping).
            X_test, y_test: Held-out test split for final evaluation.
            n_trials: Optuna hyperparameter tuning trials.

        Returns:
            Self (for chaining).
        """
        label = f"{format_type.upper()} / {target_name}"
        logger.info(f"{'='*60}")
        logger.info(f"[{label}] Training started")
        logger.info(
            f"[{label}] Train: {len(X_train):,} | Val: {len(X_val):,} | Test: {len(X_test):,}"
        )
        logger.info(f"[{label}] Features: {X_train.shape[1]}")

        # 1. Optuna-tuned XGBoost training
        self.model, self.best_params = train_xgboost(
            format_type=format_type,
            target_name=target_name,
            task_type=self.task_type,
            X_train=X_train,
            y_train=y_train,
            X_val=X_val,
            y_val=y_val,
            n_trials=n_trials,
        )

        # 2. Cross-validation on training data for robust metric estimation
        logger.info(f"[{label}] Running cross-validation...")
        # Use a fresh model instance (same params, no early stopping) for CV
        from ml.training.xgboost_trainer import _build_classifier, _build_regressor
        cv_model = (
            _build_classifier(self.best_params, early_stopping=False)
            if self.task_type == "classification"
            else _build_regressor(self.best_params, early_stopping=False)
        )
        X_cv = pd.concat([X_train, X_val], axis=0)
        y_cv = pd.concat([y_train, y_val], axis=0)
        self.cv_results = cross_validate_model(
            cv_model, X_cv, y_cv, task_type=self.task_type
        )
        logger.info(f"[{label}] CV results: {self._format_cv(self.cv_results)}")

        # 3. Final evaluation on held-out test set
        self.test_metrics = evaluate_model(self.model, X_test, y_test, self.task_type)
        logger.info(f"[{label}] Test metrics: {self.test_metrics}")

        # 4. Feature importance & SHAP summary
        from ml.training.xgboost_trainer import get_shap_explanations
        self.feature_importances = get_top_features(
            self.model, list(X_train.columns), top_n=20
        )
        self.shap_summary = get_shap_explanations(
            self.model, X_test, top_n=10
        )

        # 5. Save model
        path = save_model(self.model, format_type, target_name)
        logger.info(f"[{label}] Model saved to {path}")

        return self

    # ------------------------------------------------------------------
    # Helper
    # ------------------------------------------------------------------

    @staticmethod
    def _format_cv(cv_results: Dict) -> str:
        parts = []
        for metric, stats in cv_results.items():
            parts.append(f"{metric}={stats['mean']:.4f}±{stats['std']:.4f}")
        return ", ".join(parts)
