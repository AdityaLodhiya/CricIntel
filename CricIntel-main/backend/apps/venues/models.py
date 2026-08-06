"""
Venue domain models.

Represents cricket stadiums and grounds.
"""

from django.db import models


class PitchType(models.TextChoices):
    BATTING = 'BAT', 'Batting Friendly'
    BOWLING = 'BWL', 'Bowling Friendly'
    BALANCED = 'BAL', 'Balanced'
    UNKNOWN = 'UNK', 'Unknown'


class Venue(models.Model):
    """Placeholder model for a cricket venue."""

    name = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    capacity = models.PositiveIntegerField(null=True, blank=True)
    pitch_type = models.CharField(
        max_length=3, choices=PitchType.choices, default=PitchType.UNKNOWN
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['city']),
            models.Index(fields=['country']),
        ]

    def __str__(self):
        return f'{self.name}, {self.city}'
