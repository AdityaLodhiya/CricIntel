"""
Venue API views — placeholder endpoints.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.permissions import IsAdminOrReadOnly
from .models import Venue
from .serializers import VenueSerializer


class VenueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Venue CRUD operations.

    TODO: Add pitch analysis and historical match outcomes per venue.
    """

    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            return super().list(request, *args, **kwargs)
        return Response({
            'status': 'placeholder',
            'message': 'Venue API — Coming Soon',
            'count': 0,
            'results': [],
        })

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Placeholder for venue-level batting/bowling statistics."""
        return Response({
            'status': 'placeholder',
            'message': 'Venue stats — Coming Soon',
            'venue_id': pk,
            'stats': {},
        })
