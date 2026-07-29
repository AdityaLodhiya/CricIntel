"""
Career average composite rating.

Combines career batting and bowling statistics into a normalised 0-100 score.
"""

import pandas as pd
from .utils import normalize


def _get(df: pd.DataFrame, col: str, default: float = 0.0) -> pd.Series:
    """Return column as Series, or a constant Series when column is absent."""
    if col in df.columns:
        return df[col].fillna(default)
    return pd.Series(default, index=df.index)


def compute_career_rating(df: pd.DataFrame) -> pd.Series:
    """
    Compute career rating composite index.

    Weights career runs (batting) and career wickets (bowling) equally.
    """
    career_score = (
        _get(df, "career_runs") * 0.4
        + _get(df, "career_average") * 0.2
        + _get(df, "career_wickets") * 25 * 0.4
    )
    return normalize(career_score)
