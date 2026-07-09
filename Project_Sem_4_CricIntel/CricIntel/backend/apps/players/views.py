"""
Player API views — placeholder endpoints returning JSON stubs.
"""

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Player
from .serializers import PlayerSerializer


class PlayerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Player CRUD operations.

    TODO: Add filtering by role, format eligibility, and form metrics.
    """

    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

    def list(self, request, *args, **kwargs):
        """Return placeholder player list when DB is empty."""
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            return super().list(request, *args, **kwargs)
        return Response({
            'status': 'placeholder',
            'message': 'Player API — Coming Soon',
            'count': 0,
            'results': [],
        })

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Placeholder for per-player aggregated statistics."""
        return Response({
            'status': 'placeholder',
            'message': 'Player stats — Coming Soon',
            'player_id': pk,
            'stats': {},
        })

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Placeholder for currently active squad players."""
        return Response({
            'status': 'placeholder',
            'message': 'Active players — Coming Soon',
            'results': [],
        })
