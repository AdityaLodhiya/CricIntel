"""
Weather API views — placeholder for OpenWeatherMap integration.
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import WeatherCache
from .serializers import WeatherCacheSerializer


class WeatherViewSet(viewsets.ModelViewSet):
    """
    ViewSet for weather cache.

    TODO: Integrate OpenWeatherMap API and cache results in WeatherCache.
    """

    queryset = WeatherCache.objects.select_related('venue').all()
    serializer_class = WeatherCacheSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if queryset.exists():
            return super().list(request, *args, **kwargs)
        return Response({
            'status': 'placeholder',
            'message': 'Weather API — Coming Soon',
            'count': 0,
            'results': [],
        })

    @action(detail=False, methods=['get'])
    def forecast(self, request):
        """Placeholder for venue weather forecast."""
        venue_id = request.query_params.get('venue_id')
        date = request.query_params.get('date')
        return Response({
            'status': 'placeholder',
            'message': 'Weather forecast — Coming Soon',
            'venue_id': venue_id,
            'date': date,
            'forecast': {},
        })
