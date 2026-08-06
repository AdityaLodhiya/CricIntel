import pandas as pd
from .utils import normalize

def compute_rolling_stats(df: pd.DataFrame, format_type: str = None) -> pd.DataFrame:
    """
    Compute rolling statistics, format-specific ratings, and pressure indices.
    """
    out_df = pd.DataFrame(index=df.index)
    
    # Pressure Index (Big Match Player)
    base_pressure = normalize(df.get('career_matches', 0) * df.get('career_average', 0))
    icc_boost = df.get('is_icc_tournament', 0) * 1.2
    knockout_boost = df.get('is_knockout', 0) * 1.5
    icc_multiplier = icc_boost.replace(0, 1)
    knockout_multiplier = knockout_boost.replace(0, 1)
    out_df['pressure_index'] = normalize(base_pressure * icc_multiplier * knockout_multiplier)
    
    # Format-Specific Indices
    # T20 Impact
    t20_impact = (
        df.get('career_strike_rate', 0) * 0.3 +
        df.get('last5_strike_rate', 0) * 0.2 +
        df.get('career_fours', 0) * 0.1 +
        df.get('career_sixes', 0) * 0.2 +
        df.get('career_wickets', 0) * 20 * 0.1 -
        df.get('career_economy', 0) * 10 * 0.1
    )
    out_df['t20_impact_score'] = normalize(t20_impact)
    
    # ODI Stability
    odi_stability = (
        df.get('career_average', 0) * 0.4 +
        df.get('career_runs', 0) * 0.3 +
        df.get('career_strike_rate', 0) * 0.1 +
        df.get('career_wickets', 0) * 25 * 0.2 -
        df.get('career_economy', 0) * 5 * 0.1
    )
    out_df['odi_stability_score'] = normalize(odi_stability)
    
    # Test Endurance
    test_endurance = (
        df.get('career_average', 0) * 0.5 +
        df.get('career_runs', 0) * 0.3 +
        df.get('career_maidens', 0) * 10 * 0.1 +
        df.get('career_wickets', 0) * 25 * 0.2 -
        df.get('career_economy', 0) * 20 * 0.1
    )
    out_df['test_endurance_score'] = normalize(test_endurance)
    
    out_df['experience_score'] = normalize(df.get('career_matches', 0))
    
    return out_df
