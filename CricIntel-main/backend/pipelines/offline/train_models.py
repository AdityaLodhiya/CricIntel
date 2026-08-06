"""
Offline Pipeline: Model Trainer.

Trains format-specific ML models using feature datasets and saves
artifacts to ml/models/{format}/.

Usage:
    python -m pipelines.offline.train_models --format odi --model xgboost

TODO: Train selection classifier, runs regressor, wickets regressor per format.
"""

import argparse
import logging

logger = logging.getLogger(__name__)


def train_models(
    format_type: str,
    model_type: str = 'xgboost',
    features_path: str | None = None,
) -> list[str]:
    """
    Train all models for a given format.

    Args:
        format_type: Match format (test, odi, t20).
        model_type: Model algorithm (random_forest, xgboost).
        features_path: Optional path to feature dataset.

    Returns:
        List of paths to saved model artifacts.

    TODO: Train selection, runs, wickets, strike_rate, economy models.
    """
    raise NotImplementedError('Model training pipeline — Coming Soon')


def main():
    parser = argparse.ArgumentParser(description='Train ML models')
    parser.add_argument('--format', required=True, choices=['test', 'odi', 't20'])
    parser.add_argument('--model', default='xgboost', choices=['random_forest', 'xgboost'])
    parser.add_argument('--features', default=None, help='Feature dataset path')
    args = parser.parse_args()

    logger.info('Model trainer — Coming Soon')
    logger.info('Format: %s, Model: %s', args.format, args.model)


if __name__ == '__main__':
    main()
