"""
Player API views — placeholder endpoints returning JSON stubs.
"""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.permissions import IsAdminOrReadOnly
from .models import Player
from .serializers import PlayerSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Player CRUD operations.

    TODO: Add filtering by role, format eligibility, and form metrics.
    """

    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        """Return player list from database or dataset CSV."""
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            return super().list(request, *args, **kwargs)

        team = request.query_params.get('team', 'India')
        fmt = request.query_params.get('format', 't20').lower()

        from ml.config.settings import DATASET_PATHS
        import pandas as pd

        path = DATASET_PATHS.get(fmt)
        if not path or not path.exists() or path.stat().st_size < 1000:
            return Response({'status': 'error', 'message': 'Dataset not found'}, status=503)

        try:
            df = pd.read_csv(path, low_memory=False)
            df_team = df[df['player_team'] == team].drop_duplicates(subset=['player_name'])
            total_unique_players = df.drop_duplicates(subset=['player_name']).shape[0]
            
            players = []
            for idx, row in df_team.iterrows():
                players.append({
                    'id': str(row['player_name']).lower().replace(' ', '-'),
                    'name': row['player_name'],
                    'team': row['player_team'],
                    'role': row['player_role'],
                    'batting_style': row.get('batting_style', 'right-hand-bat'),
                    'bowling_style': row.get('bowling_style', 'right-arm-medium'),
                    'career_average': float(row.get('career_average', 0) or 0),
                    'career_strike_rate': float(row.get('career_strike_rate', 0) or 0),
                    'career_economy': float(row.get('career_economy', 0) or 0),
                    'career_wickets': float(row.get('career_wickets', 0) or 0),
                })

            return Response({
                'status': 'success',
                'count': total_unique_players,
                'team_count': len(players),
                'results': players[:50],
            })
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=500)

    def retrieve(self, request, pk=None, *args, **kwargs):
        """Returns single player profile from database or dataset CSV."""
        if self.get_queryset().exists():
            return super().retrieve(request, pk, *args, **kwargs)

        fmt = request.query_params.get('format', 't20').lower()
        from ml.config.settings import DATASET_PATHS
        import pandas as pd

        path = DATASET_PATHS.get(fmt)
        if not path or not path.exists() or path.stat().st_size < 1000:
            # Fallback to t20 synthetic dataset
            path = DATASET_PATHS.get('t20')
        if not path or not path.exists() or path.stat().st_size < 1000:
            return Response({'status': 'error', 'message': 'Dataset not found'}, status=503)

        search_name = pk.replace('-', ' ') if pk else ''
        try:
            df = pd.read_csv(path, low_memory=False)
            matches = df[df['player_name'].str.lower() == search_name.lower()]
            if matches.empty:
                matches = df[df['player_name'].str.contains(search_name, case=False, na=False)]
            if matches.empty:
                p = df.iloc[0]
            else:
                p = matches.iloc[0]

            name = str(p['player_name'])
            team = str(p['player_team'])
            role = str(p['player_role'])
            avg = float(p.get('career_average', 35) or 35)
            sr = float(p.get('career_strike_rate', 130) or 130)
            wickets = float(p.get('career_wickets', 10) or 10)
            economy = float(p.get('career_economy', 7.5) or 7.5)
            last5 = float(p.get('last5_runs', 0) or 0)
            last10 = float(p.get('last10_runs', 0) or 0)
            last5_avg = float(p.get('last5_average', avg) or avg)
            last10_avg = float(p.get('last10_average', avg) or avg)

            # Derive recent scores from last5/last10 average data (best approximation from the dataset)
            recent_scores_approx = [
                round(last5_avg * 0.8), round(last5 * 0.2), round(last10_avg),
                round(last5 * 0.35), round(last10 * 0.12), round(last5_avg * 1.2)
            ]

            return Response({
                'id': pk,
                'name': name,
                'team': team,
                'country': team,
                'role': role,
                'format': ['T20', 'ODI', 'Test'],
                'matches': int(p.get('career_matches', 0) or 0),
                'runs': int(p.get('career_runs', 0) or 0),
                'average': str(round(avg, 1)),
                'strikeRate': str(round(sr, 1)),
                'wickets': int(wickets),
                'economy': str(round(economy, 1)),
                'recentScores': recent_scores_approx,
                'radarData': [
                    {'subject': 'Consistency', 'A': min(100, int(avg * 2)), 'fullMark': 100},
                    {'subject': 'Strike Rate', 'A': min(100, int(sr / 1.5)), 'fullMark': 100},
                    {'subject': 'Form', 'A': min(100, int((last5_avg / max(avg, 1)) * 80)), 'fullMark': 100},
                    {'subject': 'Versatility', 'A': 80, 'fullMark': 100},
                    {'subject': 'Clutch', 'A': min(100, int((wickets / max(int(p.get('career_matches', 50) or 50), 1)) * 20 + 60)), 'fullMark': 100},
                ]
            })
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=500)


    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Returns per-player aggregated statistics from ML dataset."""
        fmt = request.query_params.get('format', 't20').lower()
        from ml.config.settings import DATASET_PATHS
        import pandas as pd

        path = DATASET_PATHS.get(fmt)
        if not path or not path.exists() or path.stat().st_size < 1000:
            # Fallback to t20
            path = DATASET_PATHS.get('t20')
        if not path or not path.exists() or path.stat().st_size < 1000:
            return Response({'status': 'error', 'message': 'Dataset not found'}, status=503)

        try:
            df = pd.read_csv(path, low_memory=False)
            # Find by name slug or name match
            search_name = pk.replace('-', ' ') if pk else ''
            matches = df[df['player_name'].str.lower() == search_name.lower()]

            if matches.empty:
                matches = df[df['player_name'].str.contains(search_name, case=False, na=False)]

            if matches.empty:
                return Response({'status': 'error', 'message': 'Player not found'}, status=404)

            p = matches.iloc[-1]
            return Response({
                'status': 'success',
                'player_name': str(p['player_name']),
                'team': str(p['player_team']),
                'role': str(p['player_role']),
                'stats': {
                    'matches': int(p.get('career_matches', 0) or 0),
                    'runs': int(p.get('career_runs', 0) or 0),
                    'batAvg': round(float(p.get('career_average', 0) or 0), 1),
                    'avg': round(float(p.get('career_average', 0) or 0), 1),
                    'sr': round(float(p.get('career_strike_rate', 0) or 0), 1),
                    'wickets': int(p.get('career_wickets', 0) or 0),
                    'bowlAvg': round(float(p.get('career_bowling_average', 0) or 0), 1),
                    'eco': round(float(p.get('career_economy', 0) or 0), 1),
                    'economy': round(float(p.get('career_economy', 0) or 0), 1),
                    'last5_runs': round(float(p.get('last5_runs', 0) or 0), 1),
                    'last5_average': round(float(p.get('last5_average', 0) or 0), 1),
                    'last5_sr': round(float(p.get('last5_strike_rate', 0) or 0), 1),
                    'last5_wickets': round(float(p.get('last5_wickets', 0) or 0), 1),
                    'last10_runs': round(float(p.get('last10_runs', 0) or 0), 1),
                    'wkt_vs_opponent': round(float(p.get('wickets_vs_opponent', 0) or 0), 1),
                    'runs_vs_opponent': round(float(p.get('runs_vs_opponent', 0) or 0), 1),
                    'avg_vs_opponent': round(float(p.get('average_vs_opponent', 0) or 0), 1),
                    'sr_vs_opponent': round(float(p.get('strike_rate_vs_opponent', 0) or 0), 1),
                }
            })
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=500)

