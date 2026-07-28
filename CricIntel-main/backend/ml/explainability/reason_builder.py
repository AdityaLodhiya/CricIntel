"""Human-readable selection reason builder."""

from typing import Any


def build_selection_reasons(
    player_name: str,
    shap_values: dict[str, Any],
    feature_importance: list[dict],
) -> list[str]:
    """
    Build natural-language reasons for player selection/deselection.

    Args:
        player_name: Player display name.
        shap_values: Per-feature SHAP contributions.
        feature_importance: Global feature importance rankings.

    Returns:
        List of human-readable explanation strings.

    TODO: Template-based narrative generation from SHAP values.
    """
    raise NotImplementedError('Selection reason builder — Coming Soon')
