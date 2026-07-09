import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
MODELS_DIR = BASE_DIR / "models"
PLOTS_DIR = BASE_DIR / "plots"
LOGS_DIR = BASE_DIR / "logs"

# Create directories if they don't exist
for d in [DATA_DIR, SAVED_MODELS_DIR, MODELS_DIR, PLOTS_DIR, LOGS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Dataset Columns Configuration
IDENTIFIER_COLS = ["match_id", "player_name"]

TARGET_COLS = [
    "selected_in_playing_xi",
    "target_runs",
    "target_wickets"
]

CATEGORICAL_COLS = [
    "match_type",
    "gender",
    "series_name",
    "tournament_name",
    "venue_name",
    "venue_country",
    "player_team",
    "opponent_team",
    "player_role",
    "batting_style",
    "bowling_style",
    "toss_decision",
    "home_or_away",
    "pitch_type"
]

BOOLEAN_COLS = [
    "is_captain",
    "is_wicketkeeper",
    "is_active",
    "is_icc_tournament",
    "is_knockout"
]

DATE_COLS = [
    "match_date"
]

# Numeric columns (anything else that is not categorical, boolean, date, target, or identifier)
# Will be automatically detected in preprocessing, but we can explicitly list core ones here if needed.

# Model Hyperparameters Configuration (Tuned to Prevent Overfitting & Underfitting)
OPTUNA_TRIALS = 20

CLASSIFIER_PARAMS = {
    'xgboost': {
        'n_estimators': 300, # higher estimators, controlled by early stopping
        'max_depth': 4,      # Shallow trees prevent overfitting
        'learning_rate': 0.05,
        'subsample': 0.8,    # Random subset of data prevents overfitting
        'colsample_bytree': 0.8, # Random subset of features
        'reg_alpha': 0.1,    # L1 Regularization
        'reg_lambda': 10.0,  # Strong L2 Regularization
        'random_state': 42
    },
    'lightgbm': {
        'n_estimators': 300,
        'max_depth': 4,
        'learning_rate': 0.05,
        'subsample': 0.8,
        'reg_alpha': 0.1,
        'reg_lambda': 10.0,
        'random_state': 42
    },
    'catboost': {
        'iterations': 300,
        'depth': 4,
        'learning_rate': 0.05,
        'l2_leaf_reg': 10.0, # Strong L2 Regularization
        'random_seed': 42,
        'verbose': 0
    },
    'random_forest': {
        'n_estimators': 150,
        'max_depth': 8,      # Restricted depth to prevent overfitting
        'min_samples_leaf': 4, # Requires more samples per leaf
        'random_state': 42
    }
}

REGRESSOR_PARAMS = CLASSIFIER_PARAMS.copy()
