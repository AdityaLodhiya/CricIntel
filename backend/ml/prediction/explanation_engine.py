import pandas as pd

class AIExplanationEngine:
    """
    Translates SHAP values and engineered indices into human-readable explanations
    for player selection or rejection.
    """
    def __init__(self):
        pass

    def generate_explanation(self, player_row: pd.Series, format_name: str = 'T20') -> str:
        """
        Generates a paragraph explaining why a player was selected or rejected based on their features.
        """
        prob = player_row.get('selection_probability', 0)
        name = player_row.get('player_name', 'Unknown Player')
        
        form = player_row.get('recent_form_index', 50)
        venue = player_row.get('venue_rating', 50)
        
        # Load format specific index
        if format_name.upper() == 'T20':
            format_score = player_row.get('t20_impact_score', 50)
        elif format_name.upper() == 'ODI':
            format_score = player_row.get('odi_stability_score', 50)
        else:
            format_score = player_row.get('test_endurance_score', 50)
            
        pressure = player_row.get('pressure_index', 50)
        
        explanation = f"AI Analysis for {name} ({format_name}): "
        
        if prob > 0.5:
            explanation += f"Selected with {prob*100:.1f}% confidence. "
            reasons = []
            if form > 70: reasons.append("excellent recent form")
            if venue > 70: reasons.append("strong historical venue performance")
            if format_score > 75: reasons.append(f"elite {format_name} specific metrics")
            if pressure > 75: reasons.append("proven big-match pressure player")
            
            if reasons:
                explanation += "Primary factors driving this decision include " + ", ".join(reasons) + "."
            else:
                explanation += "Selected based on solid overall balance across metrics."
        else:
            explanation += f"Rejected (Selection probability: {prob*100:.1f}%). "
            reasons = []
            if form < 40: reasons.append("poor recent form")
            if venue < 40: reasons.append("weak venue record")
            if format_score < 50: reasons.append(f"low overall {format_name} impact rating compared to peers")
            
            if reasons:
                explanation += "Primary factors against selection include " + ", ".join(reasons) + "."
            else:
                explanation += "Rejected due to better alternatives available for this specific role and venue."
                
        return explanation
