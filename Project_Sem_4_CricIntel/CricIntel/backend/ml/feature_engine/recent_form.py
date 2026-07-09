import pandas as pd
from .utils import normalize

def compute_recent_form(df: pd.DataFrame) -> pd.Series:
    """
    Compute recent form features for a player.
    Uses runs, average, sr, wickets, econ from last 5 and last 10.
    """
    form_score = (
        df.get('last5_runs', 0) * 0.3 + 
        df.get('last5_average', 0) * 0.2 + 
        df.get('last10_runs', 0) * 0.15 + 
        df.get('last5_wickets', 0) * 20 * 0.25 - 
        df.get('last5_economy', 0) * 5 * 0.1
    )
    return normalize(form_score)
