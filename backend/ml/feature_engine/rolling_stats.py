"""
Rolling Statistics Feature Builder.

Computes time-windowed rolling aggregates for batting and bowling metrics.
"""


def compute_rolling_stats(
    player_id: int,
    format_type: str,
    windows: list[int] | None = None,
) -> dict:
    """
    Compute rolling statistics across multiple time windows.

    Args:
        player_id: Database player identifier.
        format_type: Match format (TEST, ODI, T20I).
        windows: List of window sizes (e.g., [3, 5, 10]).

    Returns:
        Dictionary of rolling stat features keyed by window size.

    TODO: Implement using pandas rolling aggregations on performance data.
    """
    windows = windows or [3, 5, 10]
    raise NotImplementedError('Rolling stats computation — Coming Soon')
