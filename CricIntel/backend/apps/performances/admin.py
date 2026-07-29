from django.contrib import admin

from .models import Performance


@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = [
        'player', 'match', 'runs_scored', 'wickets_taken', 'did_bat', 'did_bowl', 'created_at'
    ]
    readonly_fields = ['created_at']
    list_filter = ['did_bat', 'did_bowl']
    search_fields = ['player__name', 'match__opponent']
