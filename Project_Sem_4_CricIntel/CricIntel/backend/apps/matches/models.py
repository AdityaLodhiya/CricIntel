"""
Match domain models.

Represents international cricket matches involving India.
"""

from django.db import models


class MatchFormat(models.TextChoices):
    TEST = 'TEST', 'Test'
    ODI = 'ODI', 'ODI'
    T20I = 'T20I', 'T20 International'


class MatchStatus(models.TextChoices):
    SCHEDULED = 'SCH', 'Scheduled'
    LIVE = 'LIV', 'Live'
    COMPLETED = 'CMP', 'Completed'
    ABANDONED = 'ABN', 'Abandoned'


class Match(models.Model):
    """Placeholder model for an international cricket match."""

    format = models.CharField(max_length=4, choices=MatchFormat.choices)
    opponent = models.CharField(max_length=100)
    venue = models.ForeignKey(
        'venues.Venue',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='matches',
    )
    match_date = models.DateField()
    status = models.CharField(
        max_length=3, choices=MatchStatus.choices, default=MatchStatus.SCHEDULED
    )
    series_name = models.CharField(max_length=200, blank=True)
    is_home = models.BooleanField(default=True)
    cricsheet_identifier = models.CharField(max_length=100, blank=True, unique=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-match_date']
        indexes = [
            models.Index(fields=['format', 'match_date']),
            models.Index(fields=['opponent']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'India vs {self.opponent} ({self.format}) — {self.match_date}'
