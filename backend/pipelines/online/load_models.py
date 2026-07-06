"""
Online Pipeline: Model Loader.

Loads trained model artifacts from ml/models/ into memory for inference.
Called by the Django prediction view during request handling.

TODO: Implement lazy loading with caching and format-aware model selection.
"""

import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_model_cache: dict[str, Any] = {}


def load_models(format_type: str, models_dir: str | Path = 'ml/models') -> dict[str, Any]:
    """
    Load all models required for prediction in a given format.

    Args:
        format_type: Match format (TEST, ODI, T20I).
        models_dir: Base directory for model artifacts.

    Returns:
        Dictionary mapping model names to loaded model objects.

    TODO: Use ml.training.model_saver.load_model with caching.
    """
    cache_key = format_type.upper()
    if cache_key in _model_cache:
        return _model_cache[cache_key]

    raise NotImplementedError('Model loading — Coming Soon')


def clear_model_cache():
    """Clear the in-memory model cache."""
    _model_cache.clear()
    logger.info('Model cache cleared')
