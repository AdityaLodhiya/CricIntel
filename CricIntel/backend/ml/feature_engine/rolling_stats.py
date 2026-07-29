"""
Rolling statistics and format-specific composite scores.

All features are derived from pre-match available columns only.
Uses safe column access via _get_col() to handle missing columns
gracefully regardless of which format's dataset is loaded.
"""

import pandas as pd
import numpy as np
from .utils import normalize


def _get_col(df: pd.DataFrame, col: str, default: float = 0.0) -> pd.Series:
    """
    Safely retrieve a column as a Series.
    Returns a Series of 'default' values when the column is missing,
    avoiding AttributeError when df.get() returns a scalar.
    """
    if col in df.columns:
        return df[col].fillna(default)
    return pd.Series(default, index=df.index)


def compute_rolling_stats(df: pd.DataFrame, format_type: str = None) -> pd.DataFrame:
    """
    Compute rolling statistics, format-specific ratings, and pressure indices.

    Args:
        df: DataFrame containing pre-match player statistics.
        format_type: Optional hint (not used — all indices computed regardless).

    Returns:
        DataFrame of engineered columns aligned to df's index.
    """
    out = pd.DataFrame(index=df.index)

    # ------------------------------------------------------------------
    # Pressure Index (Big Match Player)
    # ------------------------------------------------------------------
    career_matches = _get_col(df, "career_matches")
    career_average = _get_col(df, "career_average")
    base_pressure = normalize(career_matches * career_average)

    is_icc = _get_col(df, "is_icc_tournament")
    is_knockout = _get_col(df, "is_knockout")

    # Boost multipliers: 1.2 if ICC tournament, 1.5 if knockout, else 1.0
    icc_multiplier = is_icc.apply(lambda x: 1.2 if x else 1.0)
    knockout_multiplier = is_knockout.apply(lambda x: 1.5 if x else 1.0)
    out["pressure_index"] = normalize(base_pressure * icc_multiplier * knockout_multiplier)

    # ------------------------------------------------------------------
    # T20 Impact Score
    # ------------------------------------------------------------------
    t20_impact = (
        _get_col(df, "career_strike_rate") * 0.3
        + _get_col(df, "last5_strike_rate") * 0.2
        + _get_col(df, "career_fours") * 0.1
        + _get_col(df, "career_sixes") * 0.2
        + _get_col(df, "career_wickets") * 20 * 0.1
        - _get_col(df, "career_economy") * 10 * 0.1
    )
    out["t20_impact_score"] = normalize(t20_impact)

    # ------------------------------------------------------------------
    # ODI Stability Score
    # ------------------------------------------------------------------
    odi_stability = (
        _get_col(df, "career_average") * 0.4
        + _get_col(df, "career_runs") * 0.3
        + _get_col(df, "career_strike_rate") * 0.1
        + _get_col(df, "career_wickets") * 25 * 0.2
        - _get_col(df, "career_economy") * 5 * 0.1
    )
    out["odi_stability_score"] = normalize(odi_stability)

    # ------------------------------------------------------------------
    # Test Endurance Score
    # ------------------------------------------------------------------
    test_endurance = (
        _get_col(df, "career_average") * 0.5
        + _get_col(df, "career_runs") * 0.3
        + _get_col(df, "career_maidens") * 10 * 0.1
        + _get_col(df, "career_wickets") * 25 * 0.2
        - _get_col(df, "career_economy") * 20 * 0.1
    )
    out["test_endurance_score"] = normalize(test_endurance)

    # ------------------------------------------------------------------
    # Experience Score
    # ------------------------------------------------------------------
    out["experience_score"] = normalize(_get_col(df, "career_matches"))

    return out
