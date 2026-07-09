import pandas as pd
from .utils import normalize
from .career_average import compute_career_rating
from .recent_form import compute_recent_form
from .venue_record import compute_venue_record
from .opponent_record import compute_opponent_record
from .rolling_stats import compute_rolling_stats

class FeatureGenerator:
    """
    Orchestrates the modular feature builders to compute unified player indices.
    Replaces the monolithic indices.py approach.
    """
    
    def generate_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Appends all calculated indices to the dataframe."""
        df_out = df.copy()
        
        # 1. Base Ratings
        df_out['recent_form_index'] = compute_recent_form(df_out)
        df_out['venue_rating'] = compute_venue_record(df_out)
        df_out['opponent_rating'] = compute_opponent_record(df_out)
        df_out['career_rating'] = compute_career_rating(df_out)
        
        # 2. Impact Player Index
        impact = (
            df_out['recent_form_index'] * 0.4 +
            df_out['venue_rating'] * 0.2 +
            df_out['opponent_rating'] * 0.2 +
            df_out['career_rating'] * 0.2
        )
        df_out['impact_player_index'] = normalize(impact)
        
        # 3. Overall Player Rating
        overall = (
            df_out['career_rating'] * 0.2 +
            df_out['recent_form_index'] * 0.3 +
            df_out['venue_rating'] * 0.15 +
            df_out['opponent_rating'] * 0.15 +
            df_out['impact_player_index'] * 0.2
        )
        df_out['overall_player_rating'] = normalize(overall)
        
        # 4. Rolling / Format Specific / Pressure Stats
        rolling_df = compute_rolling_stats(df_out)
        df_out = pd.concat([df_out, rolling_df], axis=1)
        
        return df_out
