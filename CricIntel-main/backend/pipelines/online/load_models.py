"""
Online Pipeline: Model Loader.

Loads trained XGBoost model artifacts from ml/models/ into memory for
inference. Uses a module-level cache to avoid repeated disk reads.

Usage (from Django view or prediction pipeline):
    models = load_models('odi')
    playing_xi_model = models['playing_xi']
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional

from ml.config.settings import SUPPORTED_FORMATS, TARGET_COLUMN_MAP

logger = logging.getLogger(__name__)

# Module-level in-memory cache: format → {target_name → model}
_model_cache: Dict[str, Dict[str, Any]] = {}


def load_models(format_type: str) -> Dict[str, Any]:
    """
    Load all 5 XGBoost models for the given cricket format.

    Returns cached models on subsequent calls to avoid repeated disk I/O.

    Args:
        format_type: 'odi', 't20', or 'test' (case-insensitive).

    Returns:
        Dict mapping target name → loaded model object.
        Keys: 'playing_xi', 'runs', 'wickets', 'strike_rate', 'economy'.

    Raises:
        ValueError: If format_type is not recognised.
        FileNotFoundError: If one or more model files are missing.
    """
    from ml.training.model_saver import load_model, model_exists

    fmt = format_type.lower()
    if fmt not in SUPPORTED_FORMATS:
        raise ValueError(f"Unknown format '{fmt}'. Supported: {SUPPORTED_FORMATS}")

    if fmt in _model_cache:
        logger.debug(f"Returning cached models for {fmt}")
        return _model_cache[fmt]

    logger.info(f"Loading {fmt.upper()} models from disk...")
    loaded: Dict[str, Any] = {}

    for target_name in TARGET_COLUMN_MAP:
        if model_exists(fmt, target_name):
            loaded[target_name] = load_model(fmt, target_name)
            logger.info(f"  Loaded: {fmt}/{target_name}")
        else:
            logger.warning(f"  Missing: {fmt}/{target_name} — model not yet trained")

    if not loaded:
        raise FileNotFoundError(
            f"No trained models found for format '{fmt}'. "
            "Run the training pipeline first: python -m ml.main --format " + fmt
        )

    _model_cache[fmt] = loaded
    logger.info(f"Loaded {len(loaded)}/5 models for {fmt.upper()}")
    return loaded


def load_preprocessor(format_type: str) -> dict:
    """
    Load the saved preprocessing bundle (cleaner + encoder) for a given format.

    Args:
        format_type: 'odi', 't20', or 'test'.

    Returns:
        Dict with keys 'cleaner' and 'encoder'.
    """
    from ml.training.model_saver import load_preprocessor as _load
    return _load(format_type)


def clear_model_cache() -> None:
    """Clear the in-memory model cache (forces next call to reload from disk)."""
    _model_cache.clear()
    logger.info("Model cache cleared")
