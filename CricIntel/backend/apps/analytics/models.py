"""
Analytics domain models.

Aggregated format-level statistics for players and teams.
"""

from django.db import models


class FormatStats(models.Model):
    """Placeholder model for aggregated player statistics per format."""

    player = models.ForeignKey(
        'players.Player',
        on_delete=models.CASCADE,
        related_name='format_stats',
    )
    format = models.CharField(max_length=4)
    matches_played = models.PositiveIntegerField(default=0)
    runs_total = models.PositiveIntegerField(default=0)
    wickets_total = models.PositiveIntegerField(default=0)
    batting_average = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    bowling_average = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    strike_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    economy_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    highest_score = models.PositiveIntegerField(default=0)
    best_bowling = models.CharField(max_length=20, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-matches_played']
        unique_together = [['player', 'format']]
        verbose_name_plural = 'Format stats'
        indexes = [
            models.Index(fields=['player', 'format']),
        ]

    def __str__(self):
        return f'{self.player.name} — {self.format}'
