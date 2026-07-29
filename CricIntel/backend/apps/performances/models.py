"""
Performance domain models.

Stores per-player, per-match statistical records.
"""

from django.db import models


class Performance(models.Model):
    """Placeholder model for a player's performance in a specific match."""

    player = models.ForeignKey(
        'players.Player',
        on_delete=models.CASCADE,
        related_name='performances',
    )
    match = models.ForeignKey(
        'matches.Match',
        on_delete=models.CASCADE,
        related_name='performances',
    )
    runs_scored = models.PositiveIntegerField(default=0)
    balls_faced = models.PositiveIntegerField(default=0)
    wickets_taken = models.PositiveIntegerField(default=0)
    overs_bowled = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    runs_conceded = models.PositiveIntegerField(default=0)
    catches = models.PositiveIntegerField(default=0)
    stumpings = models.PositiveIntegerField(default=0)
    did_bat = models.BooleanField(default=False)
    did_bowl = models.BooleanField(default=False)
    batting_position = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-match__match_date']
        unique_together = [['player', 'match']]
        indexes = [
            models.Index(fields=['player', 'match']),
        ]

    def __str__(self):
        return f'{self.player.name} — {self.match}'

    @property
    def strike_rate(self):
        """Placeholder computed property — no business logic."""
        if self.balls_faced == 0:
            return 0.0
        return round((self.runs_scored / self.balls_faced) * 100, 2)

    @property
    def economy(self):
        """Placeholder computed property — no business logic."""
        if self.overs_bowled == 0:
            return 0.0
        return round(self.runs_conceded / float(self.overs_bowled), 2)
