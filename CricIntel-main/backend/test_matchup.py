import json
import os
import sys

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.test import RequestFactory
from apps.visualizations.views import MatchupRadarView

def check_matchup_radar():
    factory = RequestFactory()
    request = factory.get('/api/visualizations/matchup-radar/', {'teamA': 'India', 'teamB': 'Australia', 'format': 'T20'})
    view = MatchupRadarView.as_view()
    response = view(request)
    
    if response.status_code != 200:
        print(f"Error {response.status_code}: {response.data}")
        return False
        
    data = response.data
    # Print the specific keys returned
    print("Keys in response:", data.keys())
    # Verify metadata and matchup list
    print("Metadata:", data.get('metadata'))
    matchups = data.get('matchupsList', [])
    print(f"Number of matchups: {len(matchups)}")
    if matchups:
        print("First matchup sample:", matchups[0])
    
    return True

if __name__ == "__main__":
    check_matchup_radar()
