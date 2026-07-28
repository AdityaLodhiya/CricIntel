"""
Feature generator.

Orchestrates all modular feature builders and computes derived features.
All features produced here must be calculable from pre-match available data
(career stats, recent form, venue records, opponent records, context).
"""

import pandas as pd
import numpy as np

from .utils import normalize
from .career_average import compute_career_rating
from .recent_form import compute_recent_form
from .venue_record import compute_venue_record
from .opponent_record import compute_opponent_record
from .rolling_stats import compute_rolling_stats


def _get(df: pd.DataFrame, col: str, default: float = 0.0) -> pd.Series:
    """Return column as Series, or a constant Series when column is absent."""
    if col in df.columns:
        return df[col].fillna(default)
    return pd.Series(default, index=df.index)


class FeatureGenerator:
    """
    Generates all engineered features from raw dataset columns.
    Every feature produced here is derived from pre-match historical data only.
    """

    def generate_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Compute and append all feature columns."""
        df_out = df.copy()

        # ------------------------------------------------------------------
        # 1. Base composite ratings
        # ------------------------------------------------------------------
        df_out["recent_form_index"] = compute_recent_form(df_out)
        df_out["venue_rating"] = compute_venue_record(df_out)
        df_out["opponent_rating"] = compute_opponent_record(df_out)
        df_out["career_rating"] = compute_career_rating(df_out)

        # ------------------------------------------------------------------
        # 2. Impact Player Index (weighted composite)
        # ------------------------------------------------------------------
        impact = (
            df_out["recent_form_index"] * 0.4
            + df_out["venue_rating"] * 0.2
            + df_out["opponent_rating"] * 0.2
            + df_out["career_rating"] * 0.2
        )
        df_out["impact_player_index"] = normalize(impact)

        # ------------------------------------------------------------------
        # 3. Overall Player Rating
        # ------------------------------------------------------------------
        overall = (
            df_out["career_rating"] * 0.2
            + df_out["recent_form_index"] * 0.3
            + df_out["venue_rating"] * 0.15
            + df_out["opponent_rating"] * 0.15
            + df_out["impact_player_index"] * 0.2
        )
        df_out["overall_player_rating"] = normalize(overall)

        # ------------------------------------------------------------------
        # 4. Rolling / format-specific / pressure stats
        # ------------------------------------------------------------------
        rolling_df = compute_rolling_stats(df_out)
        df_out = pd.concat([df_out, rolling_df], axis=1)

        # ------------------------------------------------------------------
        # 5. Derived ratio features (safe division avoids /0)
        # ------------------------------------------------------------------
        # Batting: recent vs career runs ratio (form vs historical average)
        last5_runs = _get(df_out, "last5_runs")
        career_runs = _get(df_out, "career_runs")
        df_out["recent_vs_career_runs"] = last5_runs / career_runs.replace(0, np.nan).fillna(0)

        # Bowling: recent vs career wickets ratio
        last5_wkts = _get(df_out, "last5_wickets")
        career_wkts = _get(df_out, "career_wickets")
        df_out["recent_vs_career_wickets"] = last5_wkts / career_wkts.replace(0, np.nan).fillna(0)

        # Bat / bowl performance ratio (career runs vs career wickets * 25)
        bat_score = _get(df_out, "career_runs")
        bowl_score = _get(df_out, "career_wickets") * 25
        total = bat_score + bowl_score
        df_out["bat_bowl_ratio"] = (bat_score / total.replace(0, np.nan)).fillna(0.5)

        # Venue form bonus: recent average vs venue average
        df_out["venue_form_bonus"] = (
            _get(df_out, "last5_average") - _get(df_out, "average_at_venue")
        )

        # Opponent pressure delta: average vs opponent minus career average
        df_out["opponent_pressure_delta"] = (
            _get(df_out, "average_vs_opponent") - _get(df_out, "career_average")
        )

        # Clip extreme ratio values to prevent outliers degrading the model
        ratio_cols = [
            "recent_vs_career_runs",
            "recent_vs_career_wickets",
            "bat_bowl_ratio",
        ]
        for col in ratio_cols:
            if col in df_out.columns:
                df_out[col] = df_out[col].clip(-10, 10)

        return df_out
