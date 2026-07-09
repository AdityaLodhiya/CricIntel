from rest_framework import serializers

from .models import FormatStats


class FormatStatsSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)

    class Meta:
        model = FormatStats
        fields = [
            'id',
            'player',
            'player_name',
            'format',
            'matches_played',
            'runs_total',
            'wickets_total',
            'batting_average',
            'bowling_average',
            'strike_rate',
            'economy_rate',
            'highest_score',
            'best_bowling',
            'last_updated',
        ]
        read_only_fields = ['id', 'last_updated']
