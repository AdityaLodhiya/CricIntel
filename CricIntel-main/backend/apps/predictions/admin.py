from django.contrib import admin

from .models import PlayerPrediction, Prediction


class PlayerPredictionInline(admin.TabularInline):
    model = PlayerPrediction
    extra = 0
    readonly_fields = ['player', 'selection_probability', 'confidence_score', 'is_selected']


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ['match_date', 'format', 'opponent', 'venue', 'status', 'created_at']
    readonly_fields = ['created_at']
    list_filter = ['format', 'status']
    inlines = [PlayerPredictionInline]


@admin.register(PlayerPrediction)
class PlayerPredictionAdmin(admin.ModelAdmin):
    list_display = [
        'prediction', 'player', 'selection_probability',
        'confidence_score', 'is_selected',
    ]
    list_filter = ['is_selected']
