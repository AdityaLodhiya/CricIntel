"""
Prediction domain models.

Stores Playing XI predictions and per-player prediction outputs.
"""

from django.db import models


class PredictionStatus(models.TextChoices):
    PENDING = 'PND', 'Pending'
    COMPLETED = 'CMP', 'Completed'
    FAILED = 'FLD', 'Failed'


class Prediction(models.Model):
    """Placeholder model for a Playing XI prediction request and result."""

    match = models.ForeignKey(
        'matches.Match',
        on_delete=models.CASCADE,
        related_name='predictions',
        null=True,
        blank=True,
    )
    format = models.CharField(max_length=4)
    opponent = models.CharField(max_length=100)
    venue = models.ForeignKey(
        'venues.Venue',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='predictions',
    )
    match_date = models.DateField()
    status = models.CharField(
        max_length=3,
        choices=PredictionStatus.choices,
        default=PredictionStatus.PENDING,
    )
    playing_xi = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['format', 'match_date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'Prediction: India vs {self.opponent} ({self.format}) — {self.match_date}'


class PlayerPrediction(models.Model):
    """Placeholder for per-player prediction outputs within a Prediction."""

    prediction = models.ForeignKey(
        Prediction,
        on_delete=models.CASCADE,
        related_name='player_predictions',
    )
    player = models.ForeignKey(
        'players.Player',
        on_delete=models.CASCADE,
        related_name='predictions',
    )
    predicted_runs = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    predicted_wickets = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    predicted_strike_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    predicted_economy = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    selection_probability = models.DecimalField(max_digits=5, decimal_places=4, default=0)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=4, default=0)
    explanation = models.JSONField(default=dict, blank=True)
    is_selected = models.BooleanField(default=False)
    batting_order = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-selection_probability']
        unique_together = [['prediction', 'player']]

    def __str__(self):
        return f'{self.player.name} — {self.prediction}'
