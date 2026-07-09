"""
Analytics API views — placeholder for aggregated statistics endpoints.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import FormatStats
from .serializers import FormatStatsSerializer


class AnalyticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for format-level analytics.

    TODO: Serve aggregated stats, leaderboards, and trend data.
    """

    queryset = FormatStats.objects.select_related('player').all()
    serializer_class = FormatStatsSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            return super().list(request, *args, **kwargs)
        return Response({
            'status': 'placeholder',
            'message': 'Analytics API — Coming Soon',
            'count': 0,
            'results': [],
        })

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Placeholder for format-specific leaderboards."""
        match_format = request.query_params.get('format', 'ODI')
        metric = request.query_params.get('metric', 'runs_total')
        return Response({
            'status': 'placeholder',
            'message': 'Leaderboard — Coming Soon',
            'format': match_format,
            'metric': metric,
            'results': [],
        })

    @action(detail=False, methods=['get'])
    def player_summary(self, request):
        """Placeholder for cross-format player summary."""
        player_id = request.query_params.get('player_id')
        return Response({
            'status': 'placeholder',
            'message': 'Player summary — Coming Soon',
            'player_id': player_id,
            'summary': {},
        })
