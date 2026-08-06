"""
Match API views — placeholder endpoints.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.permissions import IsAdminOrReadOnly
from .models import Match
from .serializers import MatchFormatQuerySerializer, MatchSerializer


class MatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Match CRUD operations.

    TODO: Filter by format, opponent, date range, and venue.
    """

    queryset = Match.objects.select_related('venue').all()
    serializer_class = MatchSerializer
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            return super().list(request, *args, **kwargs)
        
        # Return count from dataset CSVs (unique match IDs across all formats)
        try:
            from ml.config.settings import DATASET_PATHS
            import pandas as pd
            total = 0
            for fmt, path in DATASET_PATHS.items():
                if path and path.exists() and path.stat().st_size > 1000:
                    df = pd.read_csv(path, usecols=['match_id'], low_memory=False)
                    total += df['match_id'].nunique()
        except Exception:
            total = 0

        return Response({
            'status': 'success',
            'count': total,
            'results': [],
        })

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Returns upcoming scheduled matches for global series."""
        queryset = self.get_queryset().filter(status='SCH')
        if queryset.exists():
            serializer = self.get_serializer(queryset, many=True)
            return Response({'status': 'success', 'results': serializer.data})
        
        # Schedule fixtures list
        fixtures = [
            {'id': 1, 'home_team': 'India', 'away_team': 'Australia', 'format': 'T20', 'venue': 'Wankhede Stadium, Mumbai', 'date': '2026-08-05', 'status': 'Upcoming'},
            {'id': 2, 'home_team': 'England', 'away_team': 'South Africa', 'format': 'ODI', 'venue': "Lord's, London", 'date': '2026-08-08', 'status': 'Upcoming'},
            {'id': 3, 'home_team': 'Australia', 'away_team': 'India', 'format': 'Test', 'venue': 'MCG, Melbourne', 'date': '2026-08-12', 'status': 'Upcoming'},
            {'id': 4, 'home_team': 'New Zealand', 'away_team': 'Pakistan', 'format': 'T20', 'venue': 'Eden Park, Auckland', 'date': '2026-08-15', 'status': 'Upcoming'},
        ]
        return Response({
            'status': 'success',
            'count': len(fixtures),
            'results': fixtures,
        })


    @action(detail=False, methods=['get'])
    def by_format(self, request):
        """Placeholder for matches filtered by format."""
        serializer = MatchFormatQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        match_format = serializer.validated_data['format']
        return Response({
            'status': 'placeholder',
            'message': f'Matches by format ({match_format}) — Coming Soon',
            'format': match_format,
            'results': [],
        })
