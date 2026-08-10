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
        """Returns upcoming scheduled (or recent) matches from synthetic global series."""
        try:
            from ml.config.settings import BASE_DIR
            import pandas as pd
            import random
            
            synthetic_dir = BASE_DIR.parent.parent / 'Dataset'
            file_paths = [
                synthetic_dir / 'T20_Synthetic.csv',
                synthetic_dir / 'ODI_Synthetic.csv',
                synthetic_dir / 'TEST_Synthetic.csv'
            ]
            
            all_matches = []
            
            for path in file_paths:
                if path.exists() and path.stat().st_size > 1000:
                    df = pd.read_csv(path, usecols=['match_id', 'match_date', 'player_team', 'opponent_team', 'venue_name', 'match_type', 'tournament_name'], low_memory=False)
                    # Deduplicate by match_id
                    unique_matches = df.drop_duplicates(subset=['match_id']).sort_values('match_date', ascending=False).head(8)
                    for col in unique_matches.columns:
                        unique_matches[col] = unique_matches[col].fillna('')
                    
                    for _, row in unique_matches.iterrows():
                        all_matches.append({
                            'id': str(row['match_id']),
                            'home_team': str(row['player_team']),
                            'away_team': str(row['opponent_team']),
                            'format': str(row['match_type']),
                            'venue': str(row['venue_name']),
                            'date': str(row['match_date']),
                            'tournament': str(row.get('tournament_name', '')),
                            'status': 'Upcoming'
                        })
            
            # Sort by date descending and take top 12
            all_matches.sort(key=lambda x: x['date'], reverse=True)
            fixtures = all_matches[:12]
            
        except Exception as e:
            print("Error loading synthetic fixtures:", e)
            fixtures = []

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
