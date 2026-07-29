"""
Train/validation/test splitting utilities.

Provides:
- chronological_split: time-ordered split for regression/time-series data
- stratified_train_val_test_split: class-balanced split for classification
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from typing import Tuple

from ml.config.settings import TRAIN_RATIO, VAL_RATIO, TEST_RATIO, RANDOM_SEED


def chronological_split(
    df: pd.DataFrame,
    target_col: str,
    train_ratio: float = TRAIN_RATIO,
    val_ratio: float = VAL_RATIO,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame,
           pd.Series, pd.Series, pd.Series]:
    """
    Split data in chronological order (no shuffling) to prevent future leakage.

    Expects df to already be sorted by date ascending before calling this.
    Returns (X_train, X_val, X_test, y_train, y_val, y_test).
    """
    n = len(df)
    train_end = int(n * train_ratio)
    val_end = int(n * (train_ratio + val_ratio))

    train = df.iloc[:train_end]
    val = df.iloc[train_end:val_end]
    test = df.iloc[val_end:]

    X_train = train.drop(columns=[target_col])
    y_train = train[target_col]

    X_val = val.drop(columns=[target_col])
    y_val = val[target_col]

    X_test = test.drop(columns=[target_col])
    y_test = test[target_col]

    return X_train, X_val, X_test, y_train, y_val, y_test


def stratified_train_val_test_split(
    df: pd.DataFrame,
    target_col: str,
    train_ratio: float = TRAIN_RATIO,
    val_ratio: float = VAL_RATIO,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame,
           pd.Series, pd.Series, pd.Series]:
    """
    Stratified split that preserves class proportions across train/val/test.
    Used for the binary Playing XI classifier.

    Returns (X_train, X_val, X_test, y_train, y_val, y_test).
    """
    test_ratio = 1.0 - train_ratio - val_ratio

    X = df.drop(columns=[target_col])
    y = df[target_col]

    # First split: separate test set
    X_tmp, X_test, y_tmp, y_test = train_test_split(
        X, y, test_size=test_ratio, stratify=y, random_state=RANDOM_SEED
    )

    # Second split: separate val from remaining
    val_ratio_adjusted = val_ratio / (train_ratio + val_ratio)
    X_train, X_val, y_train, y_val = train_test_split(
        X_tmp, y_tmp, test_size=val_ratio_adjusted, stratify=y_tmp,
        random_state=RANDOM_SEED
    )

    return X_train, X_val, X_test, y_train, y_val, y_test
