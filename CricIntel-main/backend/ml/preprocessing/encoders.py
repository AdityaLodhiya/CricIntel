"""
Categorical feature encoder.

Uses OrdinalEncoder (sklearn) which handles unseen categories during
inference by mapping them to -1 rather than raising an error.

Each format's encoders are saved separately to prevent cross-format
category leakage.
"""

import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import OrdinalEncoder

from ml.config.settings import CATEGORICAL_COLS, BOOLEAN_COLS, SAVED_MODELS_DIR


class CategoricalEncoder:
    """
    Fits OrdinalEncoder on categorical columns and converts boolean columns
    to integers. State is saved/loaded per-format so training encoders are
    reused exactly during inference.
    """

    def __init__(self):
        self._encoder: OrdinalEncoder = OrdinalEncoder(
            handle_unknown="use_encoded_value",
            unknown_value=-1,
            dtype=np.float64,
        )
        self._fitted_cols: list[str] = []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Fit on training data and encode."""
        df = df.copy()
        df = self._encode_booleans(df)
        df, self._fitted_cols = self._fit_encode_categoricals(df)
        return df

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Encode new data using fitted encoder."""
        df = df.copy()
        df = self._encode_booleans(df)
        df = self._apply_encode_categoricals(df)
        return df

    def save(self, format_type: str) -> None:
        """Persist encoder to disk keyed by format."""
        path = SAVED_MODELS_DIR / f"{format_type}_encoder.pkl"
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @classmethod
    def load(cls, format_type: str) -> "CategoricalEncoder":
        """Load a previously saved encoder."""
        path = SAVED_MODELS_DIR / f"{format_type}_encoder.pkl"
        if not path.exists():
            raise FileNotFoundError(f"No saved encoder found at {path}")
        with open(path, "rb") as f:
            return pickle.load(f)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _encode_booleans(self, df: pd.DataFrame) -> pd.DataFrame:
        for col in BOOLEAN_COLS:
            if col in df.columns:
                df[col] = df[col].astype(float).astype(int)
        return df

    def _fit_encode_categoricals(self, df: pd.DataFrame):
        present_cols = [c for c in CATEGORICAL_COLS if c in df.columns]
        if not present_cols:
            return df, []

        # Ensure string type before encoding
        df[present_cols] = df[present_cols].astype(str)

        encoded = self._encoder.fit_transform(df[present_cols])
        df[present_cols] = encoded.astype(int)
        return df, present_cols

    def _apply_encode_categoricals(self, df: pd.DataFrame) -> pd.DataFrame:
        if not self._fitted_cols:
            return df
        present = [c for c in self._fitted_cols if c in df.columns]
        if not present:
            return df
        df[present] = df[present].astype(str)
        df[present] = self._encoder.transform(df[present]).astype(int)
        return df
