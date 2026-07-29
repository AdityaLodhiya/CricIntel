"""
Player domain models.

Represents Indian cricket players eligible for Playing XI selection.
"""

from django.db import models


class PlayerRole(models.TextChoices):
    BATSMAN = 'BAT', 'Batsman'
    BOWLER = 'BWL', 'Bowler'
    ALL_ROUNDER = 'AR', 'All-Rounder'
    WICKET_KEEPER = 'WK', 'Wicket-Keeper'


class BattingStyle(models.TextChoices):
    RIGHT_HAND = 'RH', 'Right-Hand Bat'
    LEFT_HAND = 'LH', 'Left-Hand Bat'


class BowlingStyle(models.TextChoices):
    RIGHT_ARM_FAST = 'RF', 'Right-Arm Fast'
    RIGHT_ARM_MEDIUM = 'RM', 'Right-Arm Medium'
    RIGHT_ARM_SPIN = 'RS', 'Right-Arm Spin'
    LEFT_ARM_FAST = 'LF', 'Left-Arm Fast'
    LEFT_ARM_MEDIUM = 'LM', 'Left-Arm Medium'
    LEFT_ARM_SPIN = 'LS', 'Left-Arm Spin'
    NONE = 'NA', 'None'


class Player(models.Model):
    """Placeholder model for an Indian international cricket player."""

    name = models.CharField(max_length=200)
    cricsheet_identifier = models.CharField(max_length=100, unique=True, blank=True)
    role = models.CharField(max_length=3, choices=PlayerRole.choices, default=PlayerRole.BATSMAN)
    batting_style = models.CharField(
        max_length=2, choices=BattingStyle.choices, default=BattingStyle.RIGHT_HAND
    )
    bowling_style = models.CharField(
        max_length=2, choices=BowlingStyle.choices, default=BowlingStyle.NONE
    )
    date_of_birth = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    debut_year = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name
