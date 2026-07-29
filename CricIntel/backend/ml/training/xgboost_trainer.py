"""
XGBoost model trainer with Optuna hyperparameter optimisation.

Trains a single XGBoost model (classifier or regressor) for a given
format and target column. Uses early stopping and Optuna for tuning.

Compatible with XGBoost >= 2.0 (early_stopping_rounds set on constructor).
"""

import time
import warnings
import numpy as np
import pandas as pd
import optuna
from typing import Any, Dict, Tuple

from xgboost import XGBClassifier, XGBRegressor
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score,
)

from ml.config.settings import (
    OPTUNA_TRIALS, EARLY_STOPPING_ROUNDS, RANDOM_SEED,
)
from ml.utils.logger import get_logger

# Suppress Optuna verbose output
optuna.logging.set_verbosity(optuna.logging.WARNING)
warnings.filterwarnings("ignore", category=UserWarning)

logger = get_logger("XGBoostTrainer")


# ---------------------------------------------------------------------------
# Model builders (XGBoost 2.x compatible — early_stopping_rounds in __init__)
# ---------------------------------------------------------------------------

def _build_classifier(params: Dict[str, Any], early_stopping: bool = True) -> XGBClassifier:
    """Build an XGBClassifier with given hyperparameters."""
    return XGBClassifier(
        n_estimators=params.get("n_estimators", 500),
        max_depth=params.get("max_depth", 5),
        learning_rate=params.get("learning_rate", 0.05),
        subsample=params.get("subsample", 0.8),
        colsample_bytree=params.get("colsample_bytree", 0.8),
        reg_alpha=params.get("reg_alpha", 0.1),
        reg_lambda=params.get("reg_lambda", 5.0),
        min_child_weight=params.get("min_child_weight", 5),
        random_state=RANDOM_SEED,
        n_jobs=-1,
        eval_metric="logloss",
        verbosity=0,
        early_stopping_rounds=EARLY_STOPPING_ROUNDS if early_stopping else None,
    )


def _build_regressor(params: Dict[str, Any], early_stopping: bool = True) -> XGBRegressor:
    """Build an XGBRegressor with given hyperparameters."""
    return XGBRegressor(
        n_estimators=params.get("n_estimators", 500),
        max_depth=params.get("max_depth", 5),
        learning_rate=params.get("learning_rate", 0.05),
        subsample=params.get("subsample", 0.8),
        colsample_bytree=params.get("colsample_bytree", 0.8),
        reg_alpha=params.get("reg_alpha", 0.1),
        reg_lambda=params.get("reg_lambda", 5.0),
        min_child_weight=params.get("min_child_weight", 5),
        random_state=RANDOM_SEED,
        n_jobs=-1,
        eval_metric="rmse",
        verbosity=0,
        early_stopping_rounds=EARLY_STOPPING_ROUNDS if early_stopping else None,
    )


# ---------------------------------------------------------------------------
# Optuna objectives
# ---------------------------------------------------------------------------

def _optuna_objective_classifier(
    trial: optuna.Trial,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
) -> float:
    """Optuna objective: maximise validation F1 score."""
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 200, 600),
        "max_depth": trial.suggest_int("max_depth", 3, 7),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
        "subsample": trial.suggest_float("subsample", 0.6, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 0.0, 2.0),
        "reg_lambda": trial.suggest_float("reg_lambda", 1.0, 20.0),
        "min_child_weight": trial.suggest_int("min_child_weight", 3, 15),
    }
    model = _build_classifier(params, early_stopping=True)
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )
    preds = model.predict(X_val)
    return f1_score(y_val, preds, zero_division=0)


def _optuna_objective_regressor(
    trial: optuna.Trial,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
) -> float:
    """Optuna objective: minimise validation RMSE (returned negative for maximisation)."""
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 200, 600),
        "max_depth": trial.suggest_int("max_depth", 3, 7),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
        "subsample": trial.suggest_float("subsample", 0.6, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 0.0, 2.0),
        "reg_lambda": trial.suggest_float("reg_lambda", 1.0, 20.0),
        "min_child_weight": trial.suggest_int("min_child_weight", 3, 15),
    }
    model = _build_regressor(params, early_stopping=True)
    model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )
    preds = model.predict(X_val)
    rmse = np.sqrt(mean_squared_error(y_val, preds))
    return -rmse  # Optuna maximises; negate RMSE


# ---------------------------------------------------------------------------
# Main training function
# ---------------------------------------------------------------------------

def train_xgboost(
    format_type: str,
    target_name: str,
    task_type: str,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_val: pd.DataFrame,
    y_val: pd.Series,
    n_trials: int = OPTUNA_TRIALS,
) -> Tuple[Any, Dict[str, Any]]:
    """
    Train an XGBoost model with Optuna hyperparameter optimisation.

    Args:
        format_type: 'odi', 't20', or 'test'.
        target_name: Model target name (e.g. 'playing_xi', 'runs').
        task_type: 'classification' or 'regression'.
        X_train, y_train: Training features and labels.
        X_val, y_val: Validation features and labels.
        n_trials: Number of Optuna optimisation trials.

    Returns:
        Tuple of (trained_model, best_hyperparameters_dict).
    """
    label = f"{format_type}/{target_name}"
    logger.info(f"[{label}] Starting Optuna tuning ({n_trials} trials)...")
    t0 = time.time()

    study = optuna.create_study(
        direction="maximize",
        sampler=optuna.samplers.TPESampler(seed=RANDOM_SEED),
    )

    if task_type == "classification":
        objective = lambda trial: _optuna_objective_classifier(
            trial, X_train, y_train, X_val, y_val
        )
    else:
        objective = lambda trial: _optuna_objective_regressor(
            trial, X_train, y_train, X_val, y_val
        )

    # Raise exceptions from failed trials so we can diagnose issues early
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)

    best_params = study.best_params
    elapsed_tune = time.time() - t0
    logger.info(
        f"[{label}] Tuning done in {elapsed_tune:.1f}s. "
        f"Best value: {study.best_value:.4f}"
    )

    # Re-train with best params (early stopping still active on val set)
    logger.info(f"[{label}] Re-training with best hyperparameters...")
    t1 = time.time()

    if task_type == "classification":
        final_model = _build_classifier(best_params, early_stopping=True)
    else:
        final_model = _build_regressor(best_params, early_stopping=True)

    final_model.fit(
        X_train, y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )

    elapsed_train = time.time() - t1
    best_iter = getattr(final_model, "best_iteration", "N/A")
    logger.info(
        f"[{label}] Training complete in {elapsed_train:.1f}s. "
        f"Best iteration: {best_iter}"
    )

    return final_model, best_params


# ---------------------------------------------------------------------------
# Evaluation & feature importance helpers
# ---------------------------------------------------------------------------

def evaluate_model(
    model: Any,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    task_type: str,
) -> Dict[str, Any]:
    """
    Compute evaluation metrics on the held-out test set.

    Returns a dict of metrics appropriate to task_type:
      - Classification: accuracy, precision, recall, f1, roc_auc, confusion_matrix
      - Regression: mae, rmse, r2
    """
    preds = model.predict(X_test)

    if task_type == "classification":
        proba = (
            model.predict_proba(X_test)[:, 1]
            if hasattr(model, "predict_proba")
            else preds.astype(float)
        )
        auc = roc_auc_score(y_test, proba) if len(np.unique(y_test)) > 1 else 0.5
        cm = confusion_matrix(y_test, preds).tolist()
        return {
            "accuracy": float(accuracy_score(y_test, preds)),
            "precision": float(precision_score(y_test, preds, zero_division=0)),
            "recall": float(recall_score(y_test, preds, zero_division=0)),
            "f1": float(f1_score(y_test, preds, zero_division=0)),
            "roc_auc": float(auc),
            "confusion_matrix": cm,
        }
    else:
        return {
            "mae": float(mean_absolute_error(y_test, preds)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, preds))),
            "r2": float(r2_score(y_test, preds)),
        }


def get_top_features(
    model: Any,
    feature_names: list,
    top_n: int = 10,
) -> list:
    """
    Return the top N most important features from a fitted XGBoost model.

    Returns:
        List of (feature_name, importance_score) tuples sorted descending.
    """
    try:
        importances = model.feature_importances_
        paired = sorted(
            zip(feature_names, importances), key=lambda x: x[1], reverse=True
        )
        return [(name, round(float(score), 4)) for name, score in paired[:top_n]]
    except Exception:
        return []


def get_shap_explanations(
    model: Any,
    X_sample: pd.DataFrame,
    top_n: int = 10,
) -> list:
    """
    Compute mean absolute SHAP values for features using TreeExplainer.

    Returns:
        List of (feature_name, mean_abs_shap_value) tuples sorted descending.
    """
    try:
        import shap
        # Limit sample size to 500 rows for performance
        if len(X_sample) > 500:
            X_sample = X_sample.sample(500, random_state=42)

        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_sample)

        # Handle multiclass or 2D shap values
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # positive class for binary classification
        elif len(shap_values.shape) == 3:
            shap_values = shap_values[:, :, 1]

        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        feature_names = list(X_sample.columns)
        paired = sorted(
            zip(feature_names, mean_abs_shap), key=lambda x: x[1], reverse=True
        )
        return [(name, round(float(score), 4)) for name, score in paired[:top_n]]
    except Exception as e:
        logger.warning(f"SHAP explanation computation failed: {e}")
        return []

