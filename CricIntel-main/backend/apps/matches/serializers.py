from rest_framework import serializers

from .models import Match, MatchFormat


class MatchFormatQuerySerializer(serializers.Serializer):
    format = serializers.ChoiceField(
        choices=[choice[0] for choice in MatchFormat.choices],
        default=MatchFormat.ODI,
    )


class MatchSerializer(serializers.ModelSerializer):
    venue_name = serializers.CharField(source='venue.name', read_only=True, default=None)

    class Meta:
        model = Match
        fields = [
            'id',
            'format',
            'opponent',
            'venue',
            'venue_name',
            'match_date',
            'status',
            'series_name',
            'is_home',
            'cricsheet_identifier',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
