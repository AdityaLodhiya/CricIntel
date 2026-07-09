"""
Recent Form Feature Builder.

Computes rolling performance metrics over the last N matches.
"""


def compute_recent_form(player_id: int, format_type: str, window: int = 5) -> dict:
    """
    Compute recent form features for a player.

    Args:
        player_id: Database player identifier.
        format_type: Match format (TEST, ODI, T20I).
        window: Number of recent matches to consider.

    Returns:
        Dictionary of recent form features.

    TODO: Implement using processed performance data.
    """
    raise NotImplementedError('Recent form computation — Coming Soon')
