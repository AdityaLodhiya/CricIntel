from rest_framework import serializers

from .models import Performance


class PerformanceSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)
    match_info = serializers.CharField(source='match.__str__', read_only=True)
    strike_rate = serializers.FloatField(read_only=True)
    economy = serializers.FloatField(read_only=True)

    class Meta:
        model = Performance
        fields = [
            'id',
            'player',
            'player_name',
            'match',
            'match_info',
            'runs_scored',
            'balls_faced',
            'wickets_taken',
            'overs_bowled',
            'runs_conceded',
            'catches',
            'stumpings',
            'did_bat',
            'did_bowl',
            'batting_position',
            'strike_rate',
            'economy',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
