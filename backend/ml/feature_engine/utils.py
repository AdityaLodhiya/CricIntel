import pandas as pd

def normalize(series: pd.Series, min_val=0, max_val=100) -> pd.Series:
    """Min-Max scaler returning 0-100 scale."""
    s_min = series.min()
    s_max = series.max()
    if s_min == s_max:
        return pd.Series(50, index=series.index)
    return ((series - s_min) / (s_max - s_min)) * max_val
