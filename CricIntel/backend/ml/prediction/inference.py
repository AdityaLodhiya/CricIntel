"""
Inference Engine.

Loads trained XGBoost models and applies identical preprocessing to raw
player data, producing predictions for all 5 targets per player.

Supports all three cricket formats: ODI, T20, Test.
"""

import pandas as pd
import numpy as np
from typing import Any, Dict, Optional

from ml.config.settings import (
    IDENTIFIER_COLS,
    SUPPORTED_FORMATS,
    TARGET_COLUMN_MAP,
    TARGET_TASK_TYPE,
)
from ml.feature_engine.pipeline import FeatureEngineeringPipeline


class InferenceEngine:
    """
    Loads models and preprocessors, applies identical feature engineering
    and preprocessing used during training, and returns predictions.

    Example:
        engine = InferenceEngine()
        results = engine.predict(df_raw, format_type='odi')
    """

    def __init__(self):
        self._fe_pipeline = FeatureEngineeringPipeline()
        # Lazy-loaded per format
        self._models: Dict[str, Dict[str, Any]] = {}
        self._preprocessors: Dict[str, dict] = {}

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def predict(
        self,
        df_raw: pd.DataFrame,
        format_type: str,
    ) -> pd.DataFrame:
        """
        Run the full inference pipeline for a given cricket format.

        Args:
            df_raw: Raw player data (same schema as training dataset).
            format_type: 'odi', 't20', or 'test'.

        Returns:
            Copy of df_raw with prediction columns appended:
                - predicted_playing_xi (0 or 1)
                - selection_probability (float, 0–1)
                - predicted_runs (float)
                - predicted_wickets (float)
                - predicted_strike_rate (float)
                - predicted_economy (float)
        """
        if df_raw.empty:
            return df_raw.copy()

        fmt = format_type.lower()
        if fmt not in SUPPORTED_FORMATS:
            raise ValueError(f"Unknown format '{fmt}'. Supported: {SUPPORTED_FORMATS}")

        # Load models and preprocessors (cached after first call)
        models = self._get_models(fmt)
        preprocessor = self._get_preprocessor(fmt)
        cleaner = preprocessor["cleaner"]
        encoder = preprocessor["encoder"]

        # Feature engineering (same as training)
        df_engineered = self._fe_pipeline.transform(df_raw)

        # Preprocessing (transform only — uses fitted state from training)
        df_clean = cleaner.transform(df_engineered)
        df_encoded = encoder.transform(df_clean)

        # Drop identifier and target columns if present
        all_target_cols = list(TARGET_COLUMN_MAP.values())
        id_cols = [c for c in IDENTIFIER_COLS if c in df_encoded.columns]
        drop_cols = [c for c in all_target_cols + id_cols if c in df_encoded.columns]
        X = df_encoded.drop(columns=drop_cols)

        # Build result dataframe
        results = df_raw.copy()
        results["predicted_playing_xi"] = 0
        results["selection_probability"] = 0.0
        results["predicted_runs"] = 0.0
        results["predicted_wickets"] = 0.0
        results["predicted_strike_rate"] = 0.0
        results["predicted_economy"] = 0.0

        # Run each model
        prediction_map = {
            "playing_xi": ("predicted_playing_xi", "selection_probability"),
            "runs": ("predicted_runs", None),
            "wickets": ("predicted_wickets", None),
            "strike_rate": ("predicted_strike_rate", None),
            "economy": ("predicted_economy", None),
        }

        for target_name, model in models.items():
            if target_name not in prediction_map:
                continue

            task_type = TARGET_TASK_TYPE.get(target_name, "regression")

            # Align columns with training feature set (handle new/missing cols)
            X_aligned = self._align_features(X, model)

            try:
                if task_type == "classification":
                    preds = model.predict(X_aligned)
                    col_pred, col_proba = prediction_map[target_name]
                    results[col_pred] = preds
                    if col_proba and hasattr(model, "predict_proba"):
                        results[col_proba] = model.predict_proba(X_aligned)[:, 1]
                else:
                    raw_preds = model.predict(X_aligned)
                    col_pred = prediction_map[target_name][0]
                    results[col_pred] = np.clip(raw_preds, 0, None)  # non-negative
            except Exception as e:
                print(f"Warning: Prediction failed for {fmt}/{target_name}: {e}")

        return results

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_models(self, fmt: str) -> Dict[str, Any]:
        if fmt not in self._models:
            from pipelines.online.load_models import load_models
            self._models[fmt] = load_models(fmt)
        return self._models[fmt]

    def _get_preprocessor(self, fmt: str) -> dict:
        if fmt not in self._preprocessors:
            from ml.training.model_saver import load_preprocessor
            self._preprocessors[fmt] = load_preprocessor(fmt)
        return self._preprocessors[fmt]

    @staticmethod
    def _align_features(X: pd.DataFrame, model: Any) -> pd.DataFrame:
        """
        Align inference feature matrix to match training feature names/order.

        - Drops columns present in X but not in training features.
        - Fills missing columns with 0.
        """
        try:
            train_features = model.feature_names_in_
        except AttributeError:
            return X  # XGBoost might not always expose this; use as-is

        missing = [f for f in train_features if f not in X.columns]
        extra = [f for f in X.columns if f not in train_features]

        X_out = X.copy()

        if extra:
            X_out = X_out.drop(columns=extra)
        for col in missing:
            X_out[col] = 0.0

        return X_out[list(train_features)]
