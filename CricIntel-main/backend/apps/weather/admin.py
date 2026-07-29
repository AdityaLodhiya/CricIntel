from django.contrib import admin

from .models import WeatherCache


@admin.register(WeatherCache)
class WeatherCacheAdmin(admin.ModelAdmin):
    list_display = [
        'venue', 'forecast_date', 'temperature_celsius',
        'conditions', 'fetched_at',
    ]
    list_filter = ['forecast_date']
    search_fields = ['venue__name']
