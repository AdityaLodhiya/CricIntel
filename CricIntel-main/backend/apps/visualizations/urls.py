from django.urls import path
from .views import MatchupRadarView, AnalyticsView, PredictionAnalysisView, VenueStatsView, FilterOptionsView

urlpatterns = [
    path('matchup-radar/', MatchupRadarView.as_view(), name='matchup-radar'),
    path('analytics/', AnalyticsView.as_view(), name='analytics-trends'),
    path('prediction-analysis/', PredictionAnalysisView.as_view(), name='prediction-analysis'),
    path('venue-stats/', VenueStatsView.as_view(), name='venue-stats'),
    path('options/', FilterOptionsView.as_view(), name='filter-options'),
]
