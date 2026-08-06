"""
Weather domain models.

Caches weather data from OpenWeatherMap API for match venues.
"""

from django.db import models


class WeatherCache(models.Model):
    """Placeholder model for cached weather data at a venue."""

    venue = models.ForeignKey(
        'venues.Venue',
        on_delete=models.CASCADE,
        related_name='weather_cache',
    )
    forecast_date = models.DateField()
    temperature_celsius = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    humidity_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    wind_speed_kmh = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    precipitation_mm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    conditions = models.CharField(max_length=100, blank=True)
    raw_response = models.JSONField(default=dict, blank=True)
    fetched_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-forecast_date']
        unique_together = [['venue', 'forecast_date']]
        indexes = [
            models.Index(fields=['venue', 'forecast_date']),
        ]

    def __str__(self):
        return f'{self.venue.name} — {self.forecast_date}: {self.conditions}'
