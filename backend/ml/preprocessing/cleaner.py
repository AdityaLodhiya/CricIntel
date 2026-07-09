import pandas as pd
from typing import List, Tuple
from ml.config.settings import IDENTIFIER_COLS, DATE_COLS

class DataCleaner:
    """Handles missing values, dates, and identifiers."""
    def __init__(self):
        pass

    def extract_date_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Converts match_date into year, month, day, season."""
        for col in DATE_COLS:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors='coerce')
                df[f'{col}_year'] = df[col].dt.year
                df[f'{col}_month'] = df[col].dt.month
                df[f'{col}_day'] = df[col].dt.day
                # simple season mapping: 1 for summer-ish, 0 for winter-ish (mock logic)
                df[f'{col}_season'] = df[col].dt.month.apply(lambda x: 1 if 4 <= x <= 9 else 0)
                df.drop(columns=[col], inplace=True)
        return df

    def handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Fills missing values automatically based on dtype."""
        for col in df.columns:
            if df[col].isnull().sum() > 0:
                if df[col].dtype in ['float64', 'int64']:
                    df[col] = df[col].fillna(df[col].median())
                else:
                    df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
        return df

    def drop_identifiers(self, df: pd.DataFrame, keep: bool = False) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Removes identifiers for training but returns them for mapping later."""
        identifiers = pd.DataFrame()
        cols_to_drop = [col for col in IDENTIFIER_COLS if col in df.columns]
        
        if keep:
            identifiers = df[cols_to_drop].copy()
            
        df_clean = df.drop(columns=cols_to_drop)
        return df_clean, identifiers

    def fit_transform(self, df: pd.DataFrame, training: bool = True) -> Tuple[pd.DataFrame, pd.DataFrame]:
        df = self.extract_date_features(df)
        df = self.handle_missing_values(df)
        return self.drop_identifiers(df, keep=not training)
