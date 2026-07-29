"""
Venue record feature computation.

Computes a normalised venue performance index from historical
batting and bowling statistics at the specific venue.
"""

import pandas as pd
from .utils import normalize


def _get(df: pd.DataFrame, col: str, default: float = 0.0) -> pd.Series:
    """Return column as Series, or a constant Series when column is absent."""
    if col in df.columns:
        return df[col].fillna(default)
    return pd.Series(default, index=df.index)


def compute_venue_record(df: pd.DataFrame) -> pd.Series:
    """
    Compute a venue performance composite index.

    Combines runs scored, batting average, and wickets taken at
    the match venue into a normalised 0-100 score.
    """
    venue_score = (
        _get(df, "runs_at_venue") * 0.4
        + _get(df, "average_at_venue") * 0.3
        + _get(df, "wickets_at_venue") * 25 * 0.3
    )
    return normalize(venue_score)
