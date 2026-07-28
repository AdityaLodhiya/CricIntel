"""
Opponent record feature computation.

Computes a normalised opponent performance index from historical
batting and bowling statistics against the specific opponent.
"""

import pandas as pd
from .utils import normalize


def _get(df: pd.DataFrame, col: str, default: float = 0.0) -> pd.Series:
    """Return column as Series, or a constant Series when column is absent."""
    if col in df.columns:
        return df[col].fillna(default)
    return pd.Series(default, index=df.index)


def compute_opponent_record(df: pd.DataFrame) -> pd.Series:
    """
    Compute an opponent performance composite index.

    Combines runs scored, batting average, and wickets taken against
    the match opponent into a normalised 0-100 score.
    """
    opp_score = (
        _get(df, "runs_vs_opponent") * 0.4
        + _get(df, "average_vs_opponent") * 0.3
        + _get(df, "wickets_vs_opponent") * 25 * 0.3
    )
    return normalize(opp_score)
