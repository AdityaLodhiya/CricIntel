"""
Offline Pipeline: Player Statistics Builder.

Aggregates parsed match data into per-player statistical summaries
stored in the database and datasets/processed/.

Usage:
    python -m pipelines.offline.build_player_stats --format odi

TODO: Compute career stats, format stats, opponent/venue breakdowns.
"""

import argparse
import logging

logger = logging.getLogger(__name__)


def build_player_stats(format_type: str) -> int:
    """
    Build aggregated player statistics for a format.

    Args:
        format_type: Match format (test, odi, t20).

    Returns:
        Number of players processed.

    TODO: Aggregate from parsed match data into FormatStats records.
    """
    raise NotImplementedError('Player stats builder — Coming Soon')


def main():
    parser = argparse.ArgumentParser(description='Build player statistics')
    parser.add_argument('--format', required=True, choices=['test', 'odi', 't20'])
    args = parser.parse_args()

    logger.info('Player stats builder — Coming Soon')
    logger.info('Format: %s', args.format)


if __name__ == '__main__':
    main()
