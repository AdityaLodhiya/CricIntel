from rest_framework import serializers

from apps.matches.models import MatchFormat
from .models import FormatStats


ALLOWED_LEADERBOARD_METRICS = [
    'matches_played',
    'runs_total',
    'wickets_total',
    'batting_average',
    'bowling_average',
    'strike_rate',
    'economy_rate',
    'highest_score',
]


class LeaderboardQuerySerializer(serializers.Serializer):
    format = serializers.ChoiceField(
        choices=[choice[0] for choice in MatchFormat.choices],
        default=MatchFormat.ODI,
    )
    metric = serializers.ChoiceField(choices=ALLOWED_LEADERBOARD_METRICS, default='runs_total')


class PlayerSummaryQuerySerializer(serializers.Serializer):
    player_id = serializers.IntegerField(min_value=1)


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
