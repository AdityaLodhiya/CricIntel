"""
Recent form feature computation.

Uses batting and bowling stats from the player's last 5 and last 10 matches.
All columns are pre-match historical data (no leakage).
"""

import pandas as pd
from .utils import normalize


def _get(df: pd.DataFrame, col: str, default: float = 0.0) -> pd.Series:
    """Return column as Series, or a constant Series when column is absent."""
    if col in df.columns:
        return df[col].fillna(default)
    return pd.Series(default, index=df.index)


def compute_recent_form(df: pd.DataFrame) -> pd.Series:
    """
    Compute a recent form composite index for each player.

    Combines batting (runs, average) and bowling (wickets, economy)
    from the last 5 and last 10 matches into a normalised 0-100 score.
    """
    form_score = (
        _get(df, "last5_runs") * 0.3
        + _get(df, "last5_average") * 0.2
        + _get(df, "last10_runs") * 0.15
        + _get(df, "last5_wickets") * 20 * 0.25
        - _get(df, "last5_economy") * 5 * 0.1
    )
    return normalize(form_score)
