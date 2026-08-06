from django.contrib import admin

from .models import Match


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['match_date', 'format', 'opponent', 'venue', 'status', 'is_home', 'created_at']
    readonly_fields = ['created_at']
    list_filter = ['format', 'status', 'is_home']
    search_fields = ['opponent', 'series_name']
    date_hierarchy = 'match_date'
