"""Global and local feature importance extraction."""


def get_feature_importance(model, top_n: int = 10) -> list[dict]:
    """
    Extract top feature importances from a trained model.

    Args:
        model: Trained tree-based model with feature_importances_.
        top_n: Number of top features to return.

    Returns:
        List of {feature_name, importance} dicts sorted descending.

    TODO: Implement for Random Forest and XGBoost models.
    """
    raise NotImplementedError('Feature importance — Coming Soon')
