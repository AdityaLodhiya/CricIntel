"""
Feature engineering pipeline.

Orchestrates all feature generators and produces derived features.
This pipeline is stateless — it only reads and creates columns.
"""

import pandas as pd
from ml.feature_engine.feature_generator import FeatureGenerator


class FeatureEngineeringPipeline:
    """
    Master pipeline for feature engineering.
    Applies all modular feature builders in sequence.
    """

    def __init__(self):
        self.generator = FeatureGenerator()

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Run the full feature engineering sequence."""
        df_out = df.copy()
        df_out = self.generator.generate_features(df_out)
        return df_out
