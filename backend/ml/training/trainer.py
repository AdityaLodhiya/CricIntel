import optuna
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
import joblib
from xgboost import XGBClassifier, XGBRegressor
from lightgbm import LGBMClassifier, LGBMRegressor
from catboost import CatBoostClassifier, CatBoostRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from ml.config.settings import SAVED_MODELS_DIR, CLASSIFIER_PARAMS, REGRESSOR_PARAMS, OPTUNA_TRIALS
from ml.utils.logger import get_logger

logger = get_logger("ModelTrainer")

class ModelTrainer:
    """Handles training, hyperparameter optimization, and evaluation."""
    def __init__(self, task_type: str = 'classification'):
        self.task_type = task_type
        self.best_model = None
        self.best_model_name = ""
        self.metrics = {}

    def get_models(self):
        if self.task_type == 'classification':
            return {
                'xgboost': XGBClassifier(**CLASSIFIER_PARAMS['xgboost']),
                'lightgbm': LGBMClassifier(**CLASSIFIER_PARAMS['lightgbm']),
                'catboost': CatBoostClassifier(**CLASSIFIER_PARAMS['catboost']),
                'random_forest': RandomForestClassifier(**CLASSIFIER_PARAMS['random_forest'])
            }
        else:
            return {
                'xgboost': XGBRegressor(**REGRESSOR_PARAMS['xgboost']),
                'lightgbm': LGBMRegressor(**REGRESSOR_PARAMS['lightgbm']),
                'catboost': CatBoostRegressor(**REGRESSOR_PARAMS['catboost']),
                'random_forest': RandomForestRegressor(**REGRESSOR_PARAMS['random_forest'])
            }

    def train_and_evaluate(self, X_train, y_train, X_val, y_val, format_name: str = ""):
        models = self.get_models()
        best_score = float('-inf') if self.task_type == 'classification' else float('inf')
        
        results = []

        for name, model in models.items():
            logger.info(f"Training {name} [{format_name}]...")
            
            # Early stopping to prevent overfitting
            try:
                if name in ['xgboost', 'lightgbm', 'catboost']:
                    model.fit(
                        X_train, y_train,
                        eval_set=[(X_val, y_val)],
                        early_stopping_rounds=20,
                        verbose=False
                    )
                else:
                    model.fit(X_train, y_train)
            except Exception as e:
                logger.warning(f"Early stopping failed or not supported for {name}, falling back to standard fit. Error: {e}")
                model.fit(X_train, y_train)
                
            preds = model.predict(X_val)
            
            if self.task_type == 'classification':
                preds_proba = model.predict_proba(X_val)[:, 1] if hasattr(model, 'predict_proba') else preds
                acc = accuracy_score(y_val, preds)
                f1 = f1_score(y_val, preds)
                roc_auc = roc_auc_score(y_val, preds_proba)
                logger.info(f"{name} [{format_name}] - Acc: {acc:.4f}, F1: {f1:.4f}, AUC: {roc_auc:.4f}")
                
                results.append({'model': name, 'accuracy': acc, 'f1': f1, 'roc_auc': roc_auc})
                
                # Maximizing F1
                if f1 > best_score:
                    best_score = f1
                    self.best_model = model
                    self.best_model_name = name
                    self.metrics = {'accuracy': acc, 'f1': f1, 'roc_auc': roc_auc}
                    
            else:
                mae = mean_absolute_error(y_val, preds)
                rmse = np.sqrt(mean_squared_error(y_val, preds))
                r2 = r2_score(y_val, preds)
                logger.info(f"{name} [{format_name}] - MAE: {mae:.4f}, RMSE: {rmse:.4f}, R2: {r2:.4f}")
                
                results.append({'model': name, 'mae': mae, 'rmse': rmse, 'r2': r2})
                
                # Minimizing RMSE
                if rmse < best_score:
                    best_score = rmse
                    self.best_model = model
                    self.best_model_name = name
                    self.metrics = {'mae': mae, 'rmse': rmse, 'r2': r2}

        comparison_df = pd.DataFrame(results)
        logger.info(f"\nModel Comparison for {format_name}:\n{comparison_df.to_string()}")
        logger.info(f"Best Model Selected for {format_name}: {self.best_model_name}")
        
        self.save_model(f"best_{self.task_type}_model", format_name=format_name)
        return self.best_model

    def save_model(self, filename: str, format_name: str = ""):
        if self.best_model:
            from ml.config.settings import MODELS_DIR
            
            # format_name is expected to be 'gender_format_role', e.g. 'men_t20_batsman'
            # If it's the old style or just 'general', handle it gracefully.
            parts = format_name.lower().split('_')
            
            if len(parts) == 3:
                gender, fmt, role = parts
                target_dir = MODELS_DIR / fmt / gender / role
            else:
                fmt = format_name.lower() if format_name else "general"
                target_dir = MODELS_DIR / fmt
                
            target_dir.mkdir(parents=True, exist_ok=True)
            
            path = target_dir / f"{filename}.joblib"
            joblib.dump(self.best_model, path)
            logger.info(f"Model saved to {path}")
