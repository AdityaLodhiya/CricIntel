import pandas as pd
from typing import Tuple

def chronological_split(df: pd.DataFrame, target_col: str, test_size: float = 0.15, val_size: float = 0.15) -> Tuple:
    """
    Splits the data chronologically (70% train, 15% val, 15% test).
    Expects df to be sorted by date implicitly or explicitly prior to this.
    """
    total_len = len(df)
    train_end = int(total_len * (1 - test_size - val_size))
    val_end = int(total_len * (1 - test_size))
    
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
