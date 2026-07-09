import pandas as pd
from .utils import normalize

def compute_venue_record(df: pd.DataFrame) -> pd.Series:
    """
    Compute venue-specific record features.
    Historical venue success.
    """
    venue_score = (
        df.get('runs_at_venue', 0) * 0.4 +
        df.get('average_at_venue', 0) * 0.3 +
        df.get('wickets_at_venue', 0) * 25 * 0.3
    )
    return normalize(venue_score)
