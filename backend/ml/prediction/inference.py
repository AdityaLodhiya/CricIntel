import joblib
import pandas as pd
from ml.config.settings import SAVED_MODELS_DIR
from ml.preprocessing.encoders import CategoricalEncoder
from ml.feature_engine.pipeline import FeatureEngineeringPipeline

class InferenceEngine:
    """Loads models and encoders, applies identical preprocessing, and outputs predictions."""
    def __init__(self):
        self.encoder = CategoricalEncoder()
        self.encoder.load_encoders()
        self.fe_pipeline = FeatureEngineeringPipeline()
        
    def _load_model_for_segment(self, gender: str, fmt: str, role: str):
        """Dynamically loads the saved model for a specific segmented combination."""
        try:
            from ml.config.settings import MODELS_DIR
            g = gender.lower()
            f = fmt.lower()
            r = role.lower()
            
            filename = "best_classification_model.joblib"
            path = MODELS_DIR / f / g / r / filename
            
            if path.exists():
                return joblib.load(path)
            else:
                # Fallback to general model if segmented one is missing
                fallback_path = MODELS_DIR / f / filename
                if fallback_path.exists():
                    return joblib.load(fallback_path)
                return None
        except Exception as e:
            print(f"Warning: Failed to load model for {gender}_{fmt}_{role}: {e}")
            return None

    def predict(self, df_raw: pd.DataFrame) -> pd.DataFrame:
        """Runs the entire inference pipeline, automatically routing players to their segmented models."""
        
        if df_raw.empty:
            return df_raw
            
        # 1. Filter Active Players heuristics
        df_active = df_raw.copy()
        if 'is_active' in df_active.columns:
            # We only predict for active players
            df_active = df_active[df_active['is_active'] == True].copy()
            
        if 'match_date' in df_active.columns:
             # Just in case `is_active` wasn't perfectly set
             # Assuming this is future prediction, so max date logic isn't as clean.
             pass
             
        if df_active.empty:
            return df_raw
            
        df_engineered = self.fe_pipeline.transform(df_active)
        df_encoded = self.encoder.transform(df_engineered)
        
        from ml.config.settings import IDENTIFIER_COLS, TARGET_COLS
        cols_to_drop = [c for c in IDENTIFIER_COLS + TARGET_COLS if c in df_encoded.columns]
        
        results = df_active.copy()
        results['selection_probability'] = 0.0
        
        # Route predictions by segment
        if 'gender' in df_active.columns and 'match_type' in df_active.columns and 'player_role' in df_active.columns:
            # Group by segment
            for (gender, fmt, role), group_indices in df_active.groupby(['gender', 'match_type', 'player_role']).groups.items():
                
                clf = self._load_model_for_segment(str(gender), str(fmt), str(role))
                if clf is None:
                    print(f"Skipping group {gender}_{fmt}_{role} - no model found.")
                    continue
                    
                # Extract features for this group
                X_group = df_encoded.loc[group_indices].drop(columns=cols_to_drop)
                
                # Predict
                if hasattr(clf, "predict_proba"):
                    probs = clf.predict_proba(X_group)[:, 1]
                else:
                    probs = clf.predict(X_group)
                    
                results.loc[group_indices, 'selection_probability'] = probs
                
        else:
            # Fallback if demographic columns are missing (unlikely, but safe)
            fmt = str(df_active['match_type'].iloc[0]) if 'match_type' in df_active.columns else 'T20'
            clf = self._load_model_for_segment('men', fmt, 'batsman') # ultimate fallback
            if clf:
                X = df_encoded.drop(columns=cols_to_drop)
                results['selection_probability'] = clf.predict_proba(X)[:, 1] if hasattr(clf, "predict_proba") else clf.predict(X)
                
        return results
