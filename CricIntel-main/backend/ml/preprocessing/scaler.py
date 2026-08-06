"""Feature scaling utilities."""


def scale_features(features: dict, scaler_path: str | None = None) -> dict:
    """
    Scale numeric features using StandardScaler or MinMaxScaler.

    Args:
        features: Feature dictionary with numeric fields.
        scaler_path: Path to saved scaler artifact.

    Returns:
        Scaled feature dictionary.

    TODO: Implement fit/transform with joblib persistence.
    """
    raise NotImplementedError('Feature scaling — Coming Soon')
