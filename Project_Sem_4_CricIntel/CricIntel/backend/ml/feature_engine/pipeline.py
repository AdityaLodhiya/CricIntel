from typing import Any
import pandas as pd
from ml.feature_engine.feature_generator import FeatureGenerator

class FeatureEngineeringPipeline:
    """
    Master pipeline for feature engineering.
    """
    def __init__(self):
        self.generator = FeatureGenerator()
        
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Runs the entire feature engineering sequence."""
        df_out = df.copy()
        df_out = self.generator.generate_features(df_out)
        
        # Add basic feature interaction columns (example)
        if 'career_runs' in df_engineered.columns and 'career_innings' in df_engineered.columns:
            df_engineered['derived_average'] = df_engineered['career_runs'] / df_engineered['career_innings'].replace(0, 1)
            
        return df_engineered
