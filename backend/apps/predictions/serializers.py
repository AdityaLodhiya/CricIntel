from rest_framework import serializers

from .models import PlayerPrediction, Prediction


class PlayerPredictionSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)

    class Meta:
        model = PlayerPrediction
        fields = [
            'id',
            'player',
            'player_name',
            'predicted_runs',
            'predicted_wickets',
            'predicted_strike_rate',
            'predicted_economy',
            'selection_probability',
            'confidence_score',
            'explanation',
            'is_selected',
            'batting_order',
        ]
        read_only_fields = ['id']


class PredictionSerializer(serializers.ModelSerializer):
    player_predictions = PlayerPredictionSerializer(many=True, read_only=True)
    venue_name = serializers.CharField(source='venue.name', read_only=True, default=None)

    class Meta:
        model = Prediction
        fields = [
            'id',
            'match',
            'format',
            'opponent',
            'venue',
            'venue_name',
            'match_date',
            'status',
            'playing_xi',
            'metadata',
            'player_predictions',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'status', 'playing_xi', 'metadata', 'created_at', 'updated_at']


class PredictionRequestSerializer(serializers.Serializer):
    """Input serializer for prediction requests — placeholder validation only."""

    format = serializers.ChoiceField(choices=['TEST', 'ODI', 'T20I'])
    opponent = serializers.CharField(max_length=100)
    venue_id = serializers.IntegerField(required=False, allow_null=True)
    match_date = serializers.DateField()
