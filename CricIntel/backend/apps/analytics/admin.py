from django.contrib import admin

from .models import FormatStats


@admin.register(FormatStats)
class FormatStatsAdmin(admin.ModelAdmin):
    list_display = [
        'player', 'format', 'matches_played',
        'runs_total', 'wickets_total', 'batting_average',
    ]
    list_filter = ['format']
    search_fields = ['player__name']
