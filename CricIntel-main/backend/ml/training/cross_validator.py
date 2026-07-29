"""
Cross-validation utilities.

Provides time-series-aware cross-validation for regression models and
stratified k-fold cross-validation for classification models.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.model_selection import TimeSeriesSplit, StratifiedKFold
from sklearn.metrics import (
    accuracy_score, f1_score, roc_auc_score,
    mean_absolute_error, mean_squared_error, r2_score,
)

from ml.config.settings import CV_FOLDS, RANDOM_SEED


def cross_validate_model(
    model,
    X: pd.DataFrame,
    y: pd.Series,
    task_type: str,
    cv_folds: int = CV_FOLDS,
) -> Dict[str, Any]:
    """
    Perform cross-validation on a model.

    Uses TimeSeriesSplit for regression (preserves temporal order)
    and StratifiedKFold for classification (preserves class balance).

    Args:
        model: Unfitted sklearn-compatible estimator.
        X: Feature matrix.
        y: Target series.
        task_type: 'classification' or 'regression'.
        cv_folds: Number of CV folds.

    Returns:
        Dictionary with per-fold scores and aggregate statistics.
    """
    if task_type == "classification":
        cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=RANDOM_SEED)
        splits = list(cv.split(X, y))
        metric_names = ["accuracy", "f1", "roc_auc"]
    else:
        cv = TimeSeriesSplit(n_splits=cv_folds)
        splits = list(cv.split(X))
        metric_names = ["mae", "rmse", "r2"]

    fold_scores: Dict[str, list] = {m: [] for m in metric_names}

    for fold_idx, (train_idx, val_idx) in enumerate(splits):
        X_tr, X_vl = X.iloc[train_idx], X.iloc[val_idx]
        y_tr, y_vl = y.iloc[train_idx], y.iloc[val_idx]

        # Disable early stopping for CV — no separate eval_set per fold
        try:
            model.set_params(early_stopping_rounds=None)
        except Exception:
            pass

        model.fit(X_tr, y_tr)
        preds = model.predict(X_vl)

        if task_type == "classification":
            proba = (
                model.predict_proba(X_vl)[:, 1]
                if hasattr(model, "predict_proba")
                else preds
            )
            fold_scores["accuracy"].append(accuracy_score(y_vl, preds))
            fold_scores["f1"].append(f1_score(y_vl, preds, zero_division=0))
            fold_scores["roc_auc"].append(
                roc_auc_score(y_vl, proba) if len(np.unique(y_vl)) > 1 else 0.5
            )
        else:
            fold_scores["mae"].append(mean_absolute_error(y_vl, preds))
            fold_scores["rmse"].append(
                np.sqrt(mean_squared_error(y_vl, preds))
            )
            fold_scores["r2"].append(r2_score(y_vl, preds))

    results: Dict[str, Any] = {}
    for metric, scores in fold_scores.items():
        arr = np.array(scores)
        results[metric] = {
            "mean": float(arr.mean()),
            "std": float(arr.std()),
            "folds": [float(s) for s in scores],
        }

    return results
