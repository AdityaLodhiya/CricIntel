"""
Model persistence utilities.

Provides format-aware save/load for XGBoost models and their
associated preprocessors (cleaner + encoder).
"""

import joblib
import pickle
from pathlib import Path
from typing import Any, Optional

from ml.config.settings import MODELS_DIR, SAVED_MODELS_DIR


# ---------------------------------------------------------------------------
# Model save / load
# ---------------------------------------------------------------------------

def save_model(model: Any, format_type: str, target_name: str) -> Path:
    """
    Serialize a trained model to disk.

    Saves to: ml/models/{format_type}/{target_name}.joblib

    Args:
        model: Trained XGBoost model object.
        format_type: 'odi', 't20', or 'test'.
        target_name: One of 'playing_xi', 'runs', 'wickets', 'strike_rate', 'economy'.

    Returns:
        Absolute path to saved model file.
    """
    fmt = format_type.lower()
    target = target_name.lower()

    out_dir = MODELS_DIR / fmt
    out_dir.mkdir(parents=True, exist_ok=True)

    path = out_dir / f"{target}.joblib"
    joblib.dump(model, path)
    return path


def load_model(format_type: str, target_name: str) -> Any:
    """
    Deserialize a model from disk.

    Args:
        format_type: 'odi', 't20', or 'test'.
        target_name: One of 'playing_xi', 'runs', 'wickets', 'strike_rate', 'economy'.

    Returns:
        Loaded model object.

    Raises:
        FileNotFoundError: If the model file does not exist.
    """
    fmt = format_type.lower()
    target = target_name.lower()

    path = MODELS_DIR / fmt / f"{target}.joblib"
    if not path.exists():
        raise FileNotFoundError(
            f"Model not found: {path}. Run the training pipeline first."
        )
    return joblib.load(path)


def model_exists(format_type: str, target_name: str) -> bool:
    """Return True if a saved model file exists for the given format and target."""
    fmt = format_type.lower()
    target = target_name.lower()
    return (MODELS_DIR / fmt / f"{target}.joblib").exists()


# ---------------------------------------------------------------------------
# Preprocessor save / load
# ---------------------------------------------------------------------------

def save_preprocessor(cleaner: Any, encoder: Any, format_type: str) -> Path:
    """
    Serialize the fitted cleaner and encoder as a single preprocessor bundle.

    Saves to: ml/saved_models/{format_type}_preprocessor.pkl

    Args:
        cleaner: Fitted DataCleaner instance.
        encoder: Fitted CategoricalEncoder instance.
        format_type: 'odi', 't20', or 'test'.

    Returns:
        Absolute path to saved preprocessor file.
    """
    fmt = format_type.lower()
    SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    path = SAVED_MODELS_DIR / f"{fmt}_preprocessor.pkl"

    bundle = {"cleaner": cleaner, "encoder": encoder}
    with open(path, "wb") as f:
        pickle.dump(bundle, f)
    return path


def load_preprocessor(format_type: str) -> dict:
    """
    Load the saved preprocessor bundle for a given format.

    Args:
        format_type: 'odi', 't20', or 'test'.

    Returns:
        Dict with keys 'cleaner' (DataCleaner) and 'encoder' (CategoricalEncoder).

    Raises:
        FileNotFoundError: If the preprocessor file does not exist.
    """
    fmt = format_type.lower()
    path = SAVED_MODELS_DIR / f"{fmt}_preprocessor.pkl"
    if not path.exists():
        raise FileNotFoundError(
            f"Preprocessor not found: {path}. Run the training pipeline first."
        )
    with open(path, "rb") as f:
        return pickle.load(f)


def preprocessor_exists(format_type: str) -> bool:
    """Return True if a saved preprocessor file exists for the given format."""
    fmt = format_type.lower()
    return (SAVED_MODELS_DIR / f"{fmt}_preprocessor.pkl").exists()
