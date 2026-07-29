"""
Data cleaning utilities.

Handles:
- Completely empty column detection and removal
- Date feature extraction
- career_best_bowling string parsing
- Missing value imputation
- Identifier column removal
- State persistence for consistent train/inference preprocessing
"""

import pickle
import re
import pandas as pd
from pathlib import Path
from typing import List, Optional, Tuple

from ml.config.settings import IDENTIFIER_COLS, DATE_COLS, SAVED_MODELS_DIR


class DataCleaner:
    """
    Stateful data cleaner that records which columns were dropped during
    training so inference applies identical transformations.
    """

    def __init__(self):
        self.dropped_empty_cols: List[str] = []
        self.dropped_identifier_cols: List[str] = []
        self._fitted: bool = False

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fit the cleaner on training data and transform it.
        Records all state (dropped columns) for later inference.
        """
        df = df.copy()
        df = self._drop_empty_columns(df, fit=True)
        df = self._parse_career_best_bowling(df)
        df = self._extract_date_features(df)
        df = self._handle_missing_values(df)
        df = self._drop_identifiers(df, fit=True)
        self._fitted = True
        return df

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transform new data using the fitted cleaner state.
        Must call fit_transform first.
        """
        if not self._fitted:
            raise RuntimeError("DataCleaner must be fit_transform'd before calling transform.")
        df = df.copy()
        df = self._drop_columns(df, self.dropped_empty_cols)
        df = self._parse_career_best_bowling(df)
        df = self._extract_date_features(df)
        df = self._handle_missing_values(df)
        df = self._drop_columns(df, self.dropped_identifier_cols)
        return df

    def save(self, format_type: str) -> None:
        """Persist cleaner state so inference uses identical transforms."""
        path = SAVED_MODELS_DIR / f"{format_type}_cleaner.pkl"
        with open(path, "wb") as f:
            pickle.dump(self, f)

    @classmethod
    def load(cls, format_type: str) -> "DataCleaner":
        """Load a previously saved cleaner."""
        path = SAVED_MODELS_DIR / f"{format_type}_cleaner.pkl"
        if not path.exists():
            raise FileNotFoundError(f"No saved cleaner found at {path}")
        with open(path, "rb") as f:
            return pickle.load(f)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _drop_empty_columns(self, df: pd.DataFrame, fit: bool = False) -> pd.DataFrame:
        """Remove columns where every row is null."""
        if fit:
            self.dropped_empty_cols = [
                col for col in df.columns if df[col].isnull().all()
            ]
        return self._drop_columns(df, self.dropped_empty_cols)

    def _parse_career_best_bowling(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Parse 'career_best_bowling' (e.g. '5/22') into two numeric columns:
        'best_bowling_wickets' and 'best_bowling_runs'.
        The original string column is then dropped.
        """
        col = "career_best_bowling"
        if col not in df.columns:
            return df

        def _parse(val) -> Tuple[int, int]:
            val_str = str(val).strip()
            match = re.match(r"(\d+)/(\d+)", val_str)
            if match:
                return int(match.group(1)), int(match.group(2))
            return 0, 0

        parsed = df[col].apply(_parse)
        df["best_bowling_wickets"] = parsed.apply(lambda x: x[0])
        df["best_bowling_runs"] = parsed.apply(lambda x: x[1])
        df.drop(columns=[col], inplace=True)
        return df

    def _extract_date_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Decompose date columns into numeric year, month, day, season."""
        for col in DATE_COLS:
            if col not in df.columns:
                continue
            dates = pd.to_datetime(df[col], errors="coerce")
            df[f"{col}_year"] = dates.dt.year
            df[f"{col}_month"] = dates.dt.month
            df[f"{col}_day"] = dates.dt.day
            # Simple season flag: 1 = Apr–Sep (NH summer), 0 = Oct–Mar
            df[f"{col}_season"] = dates.dt.month.apply(lambda m: 1 if 4 <= m <= 9 else 0)
            df.drop(columns=[col], inplace=True)
        return df

    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Fill missing values: median for numeric, mode for categorical."""
        for col in df.columns:
            if df[col].isnull().sum() == 0:
                continue
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
            else:
                mode = df[col].mode()
                fill_val = mode.iloc[0] if not mode.empty else "Unknown"
                df[col] = df[col].fillna(fill_val)
        return df

    def _drop_identifiers(self, df: pd.DataFrame, fit: bool = False) -> pd.DataFrame:
        """Remove identifier columns (match_id, player_name, etc.)."""
        if fit:
            self.dropped_identifier_cols = [
                col for col in IDENTIFIER_COLS if col in df.columns
            ]
        return self._drop_columns(df, self.dropped_identifier_cols)

    @staticmethod
    def _drop_columns(df: pd.DataFrame, cols: List[str]) -> pd.DataFrame:
        existing = [c for c in cols if c in df.columns]
        return df.drop(columns=existing) if existing else df
