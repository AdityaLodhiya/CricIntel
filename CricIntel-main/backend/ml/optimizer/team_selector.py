import pandas as pd
from typing import List, Dict

class TeamBalanceEngine:
    """Ensures the selected Playing XI maintains realistic team balance and adapts to conditions."""
    
    def __init__(self):
        self.base_balance = {
            'Batter': 5,
            'Wicketkeeper': 1,
            'Pace_Allrounder': 1,
            'Spin_Allrounder': 1,
            'Pace_Bowler': 2,
            'Spin_Bowler': 1
        }

    def _map_role(self, role_str: str, style_str: str) -> str:
        role_str = str(role_str).lower()
        style_str = str(style_str).lower()
        
        is_pace = 'fast' in style_str or 'medium' in style_str or 'seam' in style_str or 'pace' in style_str
        
        if 'keep' in role_str: 
            return 'Wicketkeeper'
        if 'all' in role_str: 
            return 'Pace_Allrounder' if is_pace else 'Spin_Allrounder'
        if 'bowl' in role_str: 
            return 'Pace_Bowler' if is_pace else 'Spin_Bowler'
            
        return 'Batter'

    def _adjust_for_conditions(self, weather_data: dict, pitch_type: str) -> Dict[str, int]:
        target = self.base_balance.copy()
        
        # Weather adjustments
        if weather_data:
            cloud_cover = weather_data.get('cloud_cover', 0)
            if cloud_cover > 60.0:
                # Overcast -> Prefer Pace
                target['Pace_Bowler'] += 1
                if target['Spin_Bowler'] > 0:
                    target['Spin_Bowler'] -= 1
                elif target['Batter'] > 4:
                    target['Batter'] -= 1
                    
        # Pitch adjustments
        if pitch_type:
            pitch_type = pitch_type.lower()
            if 'spin' in pitch_type or 'dry' in pitch_type:
                # Dry pitch -> Prefer Spin
                target['Spin_Bowler'] += 1
                if target['Pace_Bowler'] > 1:
                    target['Pace_Bowler'] -= 1
                elif target['Pace_Allrounder'] > 0:
                    target['Pace_Allrounder'] -= 1
            elif 'flat' in pitch_type:
                # Flat pitch -> Extra batsman
                target['Batter'] += 1
                if target['Spin_Bowler'] > 0:
                    target['Spin_Bowler'] -= 1
                elif target['Pace_Bowler'] > 2:
                    target['Pace_Bowler'] -= 1
                    
        return target

    def balance_team(self, df_predictions: pd.DataFrame, weather_data: dict = None, pitch_type: str = None) -> pd.DataFrame:
        """
        Takes probabilities and selects exactly 11 players ensuring dynamic role requirements.
        """
        if 'selection_probability' not in df_predictions.columns:
            df_predictions['selection_probability'] = 0.5 # fallback
            
        df_sorted = df_predictions.sort_values(by='selection_probability', ascending=False)
        target_balance = self._adjust_for_conditions(weather_data, pitch_type)
        
        selected_indices = []
        role_counts = {k: 0 for k in target_balance.keys()}
        
        # Pass 1: Strict Minimums
        for idx, row in df_sorted.iterrows():
            if len(selected_indices) == 11:
                break
                
            role = self._map_role(row.get('player_role', 'Batter'), row.get('bowling_style', 'Unknown'))
            if role in target_balance and role_counts[role] < target_balance[role]:
                selected_indices.append(idx)
                role_counts[role] += 1
                
        # Pass 2: Fill remaining spots with highest probability (fallback if exact constraints impossible)
        for idx, row in df_sorted.iterrows():
            if len(selected_indices) == 11:
                break
            if idx not in selected_indices:
                selected_indices.append(idx)
                
        df_final = df_predictions.copy()
        df_final['final_playing_xi'] = 0
        df_final.loc[selected_indices, 'final_playing_xi'] = 1
        
        return df_final

    def get_injury_replacement(self, injured_player_name: str, df_squad_predictions: pd.DataFrame) -> dict:
        """
        Finds the highest-probability like-for-like replacement for an injured player.
        """
        # Assume df_squad_predictions already ran through balance_team() and has 'final_playing_xi'
        if 'final_playing_xi' not in df_squad_predictions.columns:
            return {"error": "Predictions dataframe missing final_playing_xi."}
            
        # Find injured player
        injured_row = df_squad_predictions[df_squad_predictions['player_name'] == injured_player_name]
        if injured_row.empty:
            return {"error": f"Player {injured_player_name} not found in squad."}
            
        injured = injured_row.iloc[0]
        
        if injured.get('final_playing_xi', 0) == 0:
            return {"error": f"Player {injured_player_name} was not selected in the XI originally."}
            
        target_role = self._map_role(injured.get('player_role', 'Batter'), injured.get('bowling_style', 'Unknown'))
        
        # Find bench players
        bench = df_squad_predictions[df_squad_predictions['final_playing_xi'] == 0].copy()
        
        if bench.empty:
            return {"error": "No bench players available."}
            
        # Map roles for bench
        bench['mapped_role'] = bench.apply(lambda r: self._map_role(r.get('player_role', 'Batter'), r.get('bowling_style', 'Unknown')), axis=1)
        
        # Try finding exact match
        exact_matches = bench[bench['mapped_role'] == target_role].sort_values(by='selection_probability', ascending=False)
        
        if not exact_matches.empty:
            replacement = exact_matches.iloc[0]
            match_type = "Exact Like-for-Like"
        else:
            # Fallback: Just get highest probability bench player
            bench_sorted = bench.sort_values(by='selection_probability', ascending=False)
            replacement = bench_sorted.iloc[0]
            match_type = "Highest Probability Fallback (No exact role match found)"
            
        return {
            "injured_player": injured_player_name,
            "injured_role_profile": target_role,
            "replacement_player": replacement['player_name'],
            "replacement_role_profile": replacement['mapped_role'],
            "replacement_probability": replacement['selection_probability'],
            "match_type": match_type
        }
