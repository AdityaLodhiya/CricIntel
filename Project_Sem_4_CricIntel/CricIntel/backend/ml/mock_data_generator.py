import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
from ml.config.settings import DATA_DIR

def generate_mock_data(n_rows=1000, filename="mock_cricket_data.csv"):
    """Generates mock data strictly adhering to the requested column structure."""
    
    np.random.seed(42)
    random.seed(42)
    
    match_types = ['ODI', 'T20', 'Test']
    genders = ['Men', 'Women']
    roles = ['Batter', 'Bowler', 'Allrounder', 'Wicketkeeper']
    batting_styles = ['Right-hand bat', 'Left-hand bat']
    bowling_styles = ['Right-arm fast', 'Right-arm offbreak', 'Legbreak', 'Left-arm fast', 'None']
    
    data = []
    
    base_date = datetime.now() - timedelta(days=365)
    
    for i in range(n_rows):
        match_type = random.choice(match_types)
        is_batter = random.random() > 0.4
        
        row = {
            'match_id': f"M_{random.randint(1000, 9999)}",
            'match_date': (base_date + timedelta(days=random.randint(0, 365))).strftime("%Y-%m-%d"),
            'match_type': match_type,
            'gender': random.choice(genders),
            'series_name': f"Series_{random.randint(1, 20)}",
            'tournament_name': 'World Cup' if random.random() > 0.8 else 'Bilateral',
            'venue_name': f"Stadium_{random.randint(1, 10)}",
            'venue_country': random.choice(['India', 'Australia', 'England', 'South Africa']),
            'player_name': f"Player_{i}",
            'player_team': random.choice(['India', 'Australia', 'England', 'South Africa']),
            'opponent_team': random.choice(['New Zealand', 'Pakistan', 'Sri Lanka', 'West Indies']),
            'player_role': random.choice(roles),
            'batting_style': random.choice(batting_styles),
            'bowling_style': random.choice(bowling_styles),
            'is_captain': random.choice([True, False]),
            'is_wicketkeeper': random.choice([True, False]),
            'is_active': random.random() > 0.1, # 90% active
            'is_icc_tournament': random.random() > 0.8,
            'is_knockout': random.random() > 0.9,
            'batting_position': random.randint(1, 11),
            
            # Historical Stats
            'career_matches': random.randint(1, 200),
            'career_innings': random.randint(1, 190),
            'career_runs': random.randint(0, 10000),
            'career_average': round(random.uniform(10.0, 60.0), 2),
            'career_strike_rate': round(random.uniform(60.0, 150.0), 2),
            'career_fours': random.randint(0, 1000),
            'career_sixes': random.randint(0, 300),
            'last5_runs': random.randint(0, 400),
            'last5_average': round(random.uniform(0.0, 100.0), 2),
            'last5_strike_rate': round(random.uniform(50.0, 200.0), 2),
            'last10_runs': random.randint(0, 800),
            'last10_average': round(random.uniform(0.0, 100.0), 2),
            'last10_strike_rate': round(random.uniform(50.0, 200.0), 2),
            
            'matches_vs_opponent': random.randint(0, 30),
            'runs_vs_opponent': random.randint(0, 1500),
            'average_vs_opponent': round(random.uniform(0.0, 80.0), 2),
            'strike_rate_vs_opponent': round(random.uniform(50.0, 160.0), 2),
            'fours_vs_opponent': random.randint(0, 150),
            'sixes_vs_opponent': random.randint(0, 50),
            
            'matches_at_venue': random.randint(0, 15),
            'runs_at_venue': random.randint(0, 800),
            'average_at_venue': round(random.uniform(0.0, 100.0), 2),
            'strike_rate_at_venue': round(random.uniform(50.0, 160.0), 2),
            
            'career_wickets': random.randint(0, 400) if not is_batter else 0,
            'career_bowling_average': round(random.uniform(20.0, 50.0), 2) if not is_batter else 0.0,
            'career_economy': round(random.uniform(4.0, 10.0), 2),
            'career_best_bowling': f"{random.randint(1, 7)}/{random.randint(10, 60)}",
            'career_maidens': random.randint(0, 50),
            
            'last5_wickets': random.randint(0, 15),
            'last5_bowling_average': round(random.uniform(15.0, 60.0), 2),
            'last5_economy': round(random.uniform(4.0, 12.0), 2),
            'last10_wickets': random.randint(0, 30),
            'last10_bowling_average': round(random.uniform(15.0, 60.0), 2),
            'last10_economy': round(random.uniform(4.0, 12.0), 2),
            
            'wickets_vs_opponent': random.randint(0, 50),
            'bowling_average_vs_opponent': round(random.uniform(15.0, 60.0), 2),
            'economy_vs_opponent': round(random.uniform(4.0, 12.0), 2),
            
            'wickets_at_venue': random.randint(0, 20),
            'bowling_average_at_venue': round(random.uniform(15.0, 60.0), 2),
            'economy_at_venue': round(random.uniform(4.0, 12.0), 2),
            
            'career_catches': random.randint(0, 150),
            'career_stumpings': random.randint(0, 50) if row.get('is_wicketkeeper') else 0,
            
            'toss_decision': random.choice(['bat', 'field']),
            'home_or_away': random.choice(['Home', 'Away', 'Neutral']),
            'temperature': round(random.uniform(15.0, 40.0), 1),
            'humidity': round(random.uniform(20.0, 90.0), 1),
            'wind_speed': round(random.uniform(0.0, 30.0), 1),
            'rain_probability': round(random.uniform(0.0, 100.0), 1),
            'cloud_cover': round(random.uniform(0.0, 100.0), 1),
            'pitch_type': random.choice(['Batting Friendly', 'Bowling Friendly', 'Balanced']),
            
            # Targets
            'selected_in_playing_xi': random.choice([0, 1]),
            'target_runs': random.randint(0, 150) if is_batter else random.randint(0, 30),
            'target_wickets': random.randint(0, 5) if not is_batter else 0
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    path = DATA_DIR / filename
    df.to_csv(path, index=False)
    print(f"Generated {n_rows} mock rows at {path}")
    return path

if __name__ == '__main__':
    generate_mock_data()
