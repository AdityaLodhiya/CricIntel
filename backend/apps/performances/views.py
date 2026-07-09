"""
Performance API views — internal use, not exposed at root URL.

TODO: Expose via nested routes under players or matches when needed.
"""

from rest_framework import viewsets
from rest_framework.response import Response

from .models import Performance
from .serializers import PerformanceSerializer


class PerformanceViewSet(viewsets.ModelViewSet):
    """ViewSet for Performance records — placeholder."""

    queryset = Performance.objects.select_related('player', 'match').all()
    serializer_class = PerformanceSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            return super().list(request, *args, **kwargs)
        return Response({
            'status': 'placeholder',
            'message': 'Performance API — Coming Soon',
            'count': 0,
            'results': [],
        })
