import pandas as pd
from .utils import normalize

def compute_career_rating(df: pd.DataFrame) -> pd.Series:
    """
    Compute career average features for a player.
    """
    career_score = (
        df.get('career_runs', 0) * 0.4 +
        df.get('career_average', 0) * 0.2 +
        df.get('career_wickets', 0) * 25 * 0.4
    )
    return normalize(career_score)
