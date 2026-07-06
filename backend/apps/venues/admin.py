from django.contrib import admin

from .models import Venue


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'country', 'pitch_type', 'capacity']
    list_filter = ['country', 'pitch_type']
    search_fields = ['name', 'city']
