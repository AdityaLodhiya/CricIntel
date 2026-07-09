from rest_framework import serializers

from .models import WeatherCache


class WeatherCacheSerializer(serializers.ModelSerializer):
    venue_name = serializers.CharField(source='venue.name', read_only=True)

    class Meta:
        model = WeatherCache
        fields = [
            'id',
            'venue',
            'venue_name',
            'forecast_date',
            'temperature_celsius',
            'humidity_percent',
            'wind_speed_kmh',
            'precipitation_mm',
            'conditions',
            'fetched_at',
            'expires_at',
        ]
        read_only_fields = ['id', 'fetched_at']
