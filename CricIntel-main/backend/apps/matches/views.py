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
        return Response({
            'status': 'placeholder',
            'message': 'Match API — Coming Soon',
            'count': 0,
            'results': [],
        })

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Placeholder for upcoming scheduled matches."""
        return Response({
            'status': 'placeholder',
            'message': 'Upcoming matches — Coming Soon',
            'results': [],
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
