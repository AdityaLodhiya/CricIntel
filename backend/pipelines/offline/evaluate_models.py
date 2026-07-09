"""
Offline Pipeline: Model Evaluator.

Evaluates trained models against holdout test sets and logs metrics.

Usage:
    python -m pipelines.offline.evaluate_models --format odi

TODO: Compute accuracy, precision, recall, F1, MAE, RMSE per model.
"""

import argparse
import logging

logger = logging.getLogger(__name__)


def evaluate_models(format_type: str, test_data_path: str | None = None) -> dict:
    """
    Evaluate all models for a given format.

    Args:
        format_type: Match format (test, odi, t20).
        test_data_path: Optional path to holdout test dataset.

    Returns:
        Dictionary of evaluation metrics per model.

    TODO: Load models from ml/models/{format}/ and evaluate on test set.
    """
    raise NotImplementedError('Model evaluation — Coming Soon')


def main():
    parser = argparse.ArgumentParser(description='Evaluate ML models')
    parser.add_argument('--format', required=True, choices=['test', 'odi', 't20'])
    parser.add_argument('--test-data', default=None, help='Holdout test dataset path')
    args = parser.parse_args()

    logger.info('Model evaluator — Coming Soon')
    logger.info('Format: %s', args.format)


if __name__ == '__main__':
    main()
