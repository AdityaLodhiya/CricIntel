"""Model persistence utilities using joblib."""

from pathlib import Path


def save_model(model, path: str, metadata: dict | None = None) -> str:
    """
    Serialize model to disk using joblib.

    Args:
        model: Trained model object.
        path: Output file path.
        metadata: Optional metadata to save alongside model.

    Returns:
        Absolute path to saved model.

    TODO: Implement with joblib.dump and metadata sidecar JSON.
    """
    output = Path(path)
    output.parent.mkdir(parents=True, exist_ok=True)
    raise NotImplementedError('Model saving — Coming Soon')


def load_model(path: str):
    """
    Deserialize model from disk.

    Args:
        path: Path to saved model file.

    Returns:
        Loaded model object.

    TODO: Implement with joblib.load.
    """
    raise NotImplementedError('Model loading — Coming Soon')
