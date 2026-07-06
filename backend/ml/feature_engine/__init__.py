"""
Feature Engineering Module.

Responsible for:
    - Recent Form
    - Career Average
    - Opponent Record
    - Venue Record
    - Rolling Statistics
    - Feature Generation

TODO: Implement feature builders per format (Test, ODI, T20I).
"""

from .recent_form import compute_recent_form
from .career_average import compute_career_average
from .opponent_record import compute_opponent_record
from .venue_record import compute_venue_record
from .rolling_stats import compute_rolling_stats
from .feature_generator import generate_features

__all__ = [
    'compute_recent_form',
    'compute_career_average',
    'compute_opponent_record',
    'compute_venue_record',
    'compute_rolling_stats',
    'generate_features',
]
