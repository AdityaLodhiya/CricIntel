"""Shared ML utility functions."""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

SUPPORTED_FORMATS = ('TEST', 'ODI', 'T20I')


def get_model_path(format_type: str, model_name: str, base_dir: str | Path) -> Path:
    """
    Resolve model artifact path for a given format.

    Args:
        format_type: Match format (TEST, ODI, T20I).
        model_name: Model identifier (e.g., selection_classifier).
        base_dir: Base models directory.

    Returns:
        Resolved Path to model file.
    """
    format_map = {'TEST': 'test', 'ODI': 'odi', 'T20I': 't20'}
    fmt_dir = format_map.get(format_type.upper(), format_type.lower())
    return Path(base_dir) / fmt_dir / f'{model_name}.joblib'


def validate_format(format_type: str) -> str:
    """Validate and normalize format type string."""
    normalized = format_type.upper()
    if normalized not in SUPPORTED_FORMATS:
        raise ValueError(f'Unsupported format: {format_type}. Must be one of {SUPPORTED_FORMATS}')
    return normalized
