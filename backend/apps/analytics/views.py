"""
Analytics API views — placeholder for aggregated statistics endpoints.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.permissions import IsAdminOrReadOnly
from .models import FormatStats
from .serializers import FormatStatsSerializer, LeaderboardQuerySerializer, PlayerSummaryQuerySerializer


class AnalyticsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for format-level analytics.

    TODO: Serve aggregated stats, leaderboards, and trend data.
    """

    queryset = FormatStats.objects.select_related('player').all()
    serializer_class = FormatStatsSerializer
    permission_classes = [IsAdminOrReadOnly]

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
        serializer = LeaderboardQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        match_format = serializer.validated_data['format']
        metric = serializer.validated_data['metric']
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
        serializer = PlayerSummaryQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        player_id = serializer.validated_data['player_id']
        return Response({
            'status': 'placeholder',
            'message': 'Player summary — Coming Soon',
            'player_id': player_id,
            'summary': {},
        })
