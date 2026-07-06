"""
CricIntel URL Configuration.

Aggregates API routes from all Django apps under /api/ prefix.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/players/', include('apps.players.urls')),
    path('api/matches/', include('apps.matches.urls')),
    path('api/venues/', include('apps.venues.urls')),
    path('api/predict/', include('apps.predictions.urls')),
    path('api/weather/', include('apps.weather.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
]
