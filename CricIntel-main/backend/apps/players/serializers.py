from rest_framework import serializers

from .models import Player


class PlayerSerializer(serializers.ModelSerializer):
    """Serializer for Player model — placeholder, no business logic."""

    class Meta:
        model = Player
        fields = [
            'id',
            'name',
            'cricsheet_identifier',
            'role',
            'batting_style',
            'bowling_style',
            'date_of_birth',
            'is_active',
            'debut_year',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
