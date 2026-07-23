from django.contrib import admin

from .models import Player


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'batting_style', 'bowling_style', 'is_active', 'created_at']
    readonly_fields = ['created_at']
    list_filter = ['role', 'is_active', 'batting_style']
    search_fields = ['name', 'cricsheet_identifier']
