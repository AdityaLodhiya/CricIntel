"""
Online Pipeline: Prediction Explainer.

Generates SHAP-based explanations for each player in the predicted XI.

TODO: Delegate to ml.explainability module.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


def explain_prediction(
    prediction_result: dict[str, Any],
    models: dict[str, Any],
) -> dict[str, Any]:
    """
    Attach explanations to a prediction result.

    Args:
        prediction_result: Output from predict_xi pipeline.
        models: Loaded model dictionary.

    Returns:
        Prediction result enriched with per-player explanations.

    TODO: Call ml.explainability for each selected player.
    """
    raise NotImplementedError('Prediction explanation — Coming Soon')
