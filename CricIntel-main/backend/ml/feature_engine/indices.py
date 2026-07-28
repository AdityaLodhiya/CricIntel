import pandas as pd
import numpy as np

class IndicesGenerator:
    """
    Generates customized indices (0-100 scales) for Recent Form, Venue Rating, Opponent Rating, 
    Career Rating, Consistency Index, Pressure Performance, Match Importance, Experience, 
    Format Specialist, and Impact Player Index.
    """
    def __init__(self):
        pass

    def _normalize(self, series: pd.Series, min_val=0, max_val=100) -> pd.Series:
        """Min-Max scaler returning 0-100"""
        s_min = series.min()
        s_max = series.max()
        if s_min == s_max:
            return pd.Series(50, index=series.index)
        return ((series - s_min) / (s_max - s_min)) * max_val

    def calculate_recent_form(self, df: pd.DataFrame) -> pd.Series:
        """
        Uses runs, average, sr, wickets, econ from last 5 and last 10.
        """
        form_score = (
            df.get('last5_runs', 0) * 0.3 + 
            df.get('last5_average', 0) * 0.2 + 
            df.get('last10_runs', 0) * 0.15 + 
            df.get('last5_wickets', 0) * 20 * 0.25 - 
            df.get('last5_economy', 0) * 5 * 0.1
        )
        return self._normalize(form_score)

    def calculate_venue_rating(self, df: pd.DataFrame) -> pd.Series:
        """Historical venue success."""
        venue_score = (
            df.get('runs_at_venue', 0) * 0.4 +
            df.get('average_at_venue', 0) * 0.3 +
            df.get('wickets_at_venue', 0) * 25 * 0.3
        )
        return self._normalize(venue_score)

    def calculate_opponent_rating(self, df: pd.DataFrame) -> pd.Series:
        """Historical opponent success."""
        opp_score = (
            df.get('runs_vs_opponent', 0) * 0.4 +
            df.get('average_vs_opponent', 0) * 0.3 +
            df.get('wickets_vs_opponent', 0) * 25 * 0.3
        )
        return self._normalize(opp_score)

    def calculate_career_rating(self, df: pd.DataFrame) -> pd.Series:
        career_score = (
            df.get('career_runs', 0) * 0.4 +
            df.get('career_average', 0) * 0.2 +
            df.get('career_wickets', 0) * 25 * 0.4
        )
        return self._normalize(career_score)

    def calculate_impact_player_index(self, df: pd.DataFrame) -> pd.Series:
        """
        Proprietary Impact Player Index.
        Combines batting, bowling, pressure ratings.
        """
        impact = (
            self.calculate_recent_form(df) * 0.4 +
            self.calculate_venue_rating(df) * 0.2 +
            self.calculate_opponent_rating(df) * 0.2 +
            self.calculate_career_rating(df) * 0.2
        )
        return self._normalize(impact)
        
    def calculate_t20_impact(self, df: pd.DataFrame) -> pd.Series:
        """T20 specific: Heavy focus on Strike Rate, boundaries, taking game deep, low econ, PP/Death."""
        impact = (
            df.get('career_strike_rate', 0) * 0.3 +
            df.get('last5_strike_rate', 0) * 0.2 +
            df.get('career_fours', 0) * 0.1 +
            df.get('career_sixes', 0) * 0.2 +
            df.get('career_wickets', 0) * 20 * 0.1 -
            df.get('career_economy', 0) * 10 * 0.1
        )
        return self._normalize(impact)

    def calculate_odi_stability(self, df: pd.DataFrame) -> pd.Series:
        """ODI specific: Stable bat, big runs, average, rotate strike, middle overs wickets."""
        stability = (
            df.get('career_average', 0) * 0.4 +
            df.get('career_runs', 0) * 0.3 +
            df.get('career_strike_rate', 0) * 0.1 +
            df.get('career_wickets', 0) * 25 * 0.2 -
            df.get('career_economy', 0) * 5 * 0.1
        )
        return self._normalize(stability)

    def calculate_test_endurance(self, df: pd.DataFrame) -> pd.Series:
        """Test specific: Stays long, good average, score big, maidens, build pressure, ignore SR."""
        endurance = (
            df.get('career_average', 0) * 0.5 +
            df.get('career_runs', 0) * 0.3 +
            df.get('career_maidens', 0) * 10 * 0.1 +
            df.get('career_wickets', 0) * 25 * 0.2 -
            df.get('career_economy', 0) * 20 * 0.1 # Heavily penalize high econ in tests
        )
        return self._normalize(endurance)

    def calculate_pressure_index(self, df: pd.DataFrame) -> pd.Series:
        """Big Match Player: boosts rating if performs in ICC Tournaments / Knockouts."""
        base_pressure = self._normalize(df.get('career_matches', 0) * df.get('career_average', 0))
        # Boost if they play in ICC/Knockout
        icc_boost = df.get('is_icc_tournament', 0) * 1.2
        knockout_boost = df.get('is_knockout', 0) * 1.5
        
        # Replace 0s with 1s so multiplication works safely
        icc_multiplier = icc_boost.replace(0, 1)
        knockout_multiplier = knockout_boost.replace(0, 1)
        
        return self._normalize(base_pressure * icc_multiplier * knockout_multiplier)
        
    def calculate_overall_rating(self, df: pd.DataFrame) -> pd.Series:
        """
        Overall Player Rating based on a weighted combination of general indices.
        """
        overall = (
            self.career_rating * 0.2 +
            self.recent_form * 0.3 +
            self.venue_rating * 0.15 +
            self.opponent_rating * 0.15 +
            self.impact_index * 0.2
        )
        return self._normalize(overall)

    def generate_all(self, df: pd.DataFrame) -> pd.DataFrame:
        """Appends all calculated indices to the dataframe."""
        df_out = df.copy()
        
        # Calculate base indices and store as instance variables so overall_rating can use them
        self.recent_form = self.calculate_recent_form(df_out)
        self.venue_rating = self.calculate_venue_rating(df_out)
        self.opponent_rating = self.calculate_opponent_rating(df_out)
        self.career_rating = self.calculate_career_rating(df_out)
        self.impact_index = self.calculate_impact_player_index(df_out)
        
        df_out['recent_form_index'] = self.recent_form
        df_out['venue_rating'] = self.venue_rating
        df_out['opponent_rating'] = self.opponent_rating
        df_out['career_rating'] = self.career_rating
        df_out['impact_player_index'] = self.impact_index
        df_out['overall_player_rating'] = self.calculate_overall_rating(df_out)
        
        # New Format-Specific & Pressure Indices
        df_out['t20_impact_score'] = self.calculate_t20_impact(df_out)
        df_out['odi_stability_score'] = self.calculate_odi_stability(df_out)
        df_out['test_endurance_score'] = self.calculate_test_endurance(df_out)
        df_out['pressure_index'] = self.calculate_pressure_index(df_out)
        
        df_out['experience_score'] = self._normalize(df_out.get('career_matches', 0))
        
        return df_out
