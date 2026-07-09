import pandas as pd
from .utils import normalize

def compute_opponent_record(df: pd.DataFrame) -> pd.Series:
    """
    Compute opponent-specific record features.
    Historical opponent success.
    """
    opp_score = (
        df.get('runs_vs_opponent', 0) * 0.4 +
        df.get('average_vs_opponent', 0) * 0.3 +
        df.get('wickets_vs_opponent', 0) * 25 * 0.3
    )
    return normalize(opp_score)
