"""
Explainability Module.

Reserved for:
    - SHAP value computation
    - Feature Importance ranking
    - Selection Explanation generation
    - Prediction Reason narratives
"""

from .shap_explainer import explain_prediction
from .feature_importance import get_feature_importance
from .reason_builder import build_selection_reasons

__all__ = ['explain_prediction', 'get_feature_importance', 'build_selection_reasons']
