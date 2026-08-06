import pandas as pd
from sklearn.preprocessing import LabelEncoder
import pickle
from ml.config.settings import CATEGORICAL_COLS, BOOLEAN_COLS, SAVED_MODELS_DIR

class CategoricalEncoder:
    """Encodes categorical features using Label Encoding (optimal for tree models)."""
    def __init__(self):
        self.encoders = {}

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df_encoded = df.copy()
        
        # Handle booleans
        for col in BOOLEAN_COLS:
            if col in df_encoded.columns:
                df_encoded[col] = df_encoded[col].astype(int)
                
        # Handle categoricals
        for col in CATEGORICAL_COLS:
            if col in df_encoded.columns:
                # Convert to string just in case
                df_encoded[col] = df_encoded[col].astype(str)
                le = LabelEncoder()
                df_encoded[col] = le.fit_transform(df_encoded[col])
                self.encoders[col] = le
                
        self.save_encoders()
        return df_encoded

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        df_encoded = df.copy()
        
        for col in BOOLEAN_COLS:
            if col in df_encoded.columns:
                df_encoded[col] = df_encoded[col].astype(int)
                
        for col in CATEGORICAL_COLS:
            if col in df_encoded.columns and col in self.encoders:
                df_encoded[col] = df_encoded[col].astype(str)
                le = self.encoders[col]
                # Handle unseen labels by assigning them to a special class or mapping to default
                # Simple workaround for now: mapping unseen to -1
                classes = list(le.classes_)
                df_encoded[col] = df_encoded[col].apply(lambda x: classes.index(x) if x in classes else -1)
                
        return df_encoded
        
    def save_encoders(self):
        path = SAVED_MODELS_DIR / "label_encoders.pkl"
        with open(path, 'wb') as f:
            pickle.dump(self.encoders, f)

    def load_encoders(self):
        path = SAVED_MODELS_DIR / "label_encoders.pkl"
        if path.exists():
            with open(path, 'rb') as f:
                self.encoders = pickle.load(f)
