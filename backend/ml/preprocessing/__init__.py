"""
Data Preprocessing Module.

Responsible for:
    - Cleaning
    - Encoding
    - Scaling
    - Missing Value Imputation
"""

from .cleaner import clean_dataset
from .encoder import encode_categorical
from .scaler import scale_features
from .imputer import impute_missing

__all__ = ['clean_dataset', 'encode_categorical', 'scale_features', 'impute_missing']
