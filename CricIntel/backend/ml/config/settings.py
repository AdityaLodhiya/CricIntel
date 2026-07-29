"""
ML Pipeline Configuration Settings.

Centralised configuration for paths, column definitions,
XGBoost hyperparameters, model target mappings, and target-specific feature exclusion rules to prevent data & target leakage.
"""

import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"
MODELS_DIR = BASE_DIR / "models"
PLOTS_DIR = BASE_DIR / "plots"
LOGS_DIR = BASE_DIR / "logs"

# Create directories if they don't exist
for _d in [DATA_DIR, SAVED_MODELS_DIR, MODELS_DIR, PLOTS_DIR, LOGS_DIR]:
    _d.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Dataset Paths (original CSV files)
# ---------------------------------------------------------------------------
DATASET_ROOT = BASE_DIR.parent.parent / "Dataset"

DATASET_PATHS = {
    "odi": DATASET_ROOT / "final_cricket_ml_dataset_odi.csv",
    "t20": DATASET_ROOT / "final_cricket_ml_dataset_t20.csv",
    "test": DATASET_ROOT / "final_cricket_ml_dataset_test.csv",
}

SUPPORTED_FORMATS = ["odi", "t20", "test"]

# ---------------------------------------------------------------------------
# Column Definitions
# ---------------------------------------------------------------------------

# Columns that identify a record — never used as features
IDENTIFIER_COLS = ["match_id", "player_name", "match_date", "match_type", "gender"]

# Post-selection attributes — only assigned after team selection
POST_SELECTION_COLS = ["batting_position"]

# All target columns across all models
TARGET_COLS = [
    "selected_in_playing_xi",  # Playing XI — classification
    "target_runs",             # Runs — regression
    "target_wickets",          # Wickets — regression
    "career_strike_rate",      # Strike Rate — regression
    "career_economy",          # Economy — regression
]

# Maps model/target name → column name in dataset
TARGET_COLUMN_MAP = {
    "playing_xi": "selected_in_playing_xi",
    "runs": "target_runs",
    "wickets": "target_wickets",
    "strike_rate": "career_strike_rate",
    "economy": "career_economy",
}

# Maps target name → task type
TARGET_TASK_TYPE = {
    "playing_xi": "classification",
    "runs": "regression",
    "wickets": "regression",
    "strike_rate": "regression",
    "economy": "regression",
}

# ---------------------------------------------------------------------------
# STRICT TARGET-SPECIFIC FEATURE EXCLUSION RULES (LEAKAGE AUDIT)
# ---------------------------------------------------------------------------
# Excludes target-derived features, post-selection attributes, and other target columns.
TARGET_EXCLUDED_COLS = {
    "playing_xi": [
        "selected_in_playing_xi", "target_runs", "target_wickets",
        "career_strike_rate", "career_economy", "batting_position",
        "career_matches", "career_innings", "career_runs", "career_average",
        "career_fours", "career_sixes", "career_wickets", "career_bowling_average",
        "career_maidens", "career_catches", "career_stumpings", "career_rating",
        "overall_player_rating", "experience_score", "impact_player_index",
        "recent_vs_career_runs", "recent_vs_career_wickets",
        "best_bowling_wickets", "best_bowling_runs"
    ],
    "runs": [
        "selected_in_playing_xi", "target_runs", "target_wickets",
        "career_strike_rate", "career_economy", "batting_position"
    ],
    "wickets": [
        "selected_in_playing_xi", "target_runs", "target_wickets",
        "career_strike_rate", "career_economy", "batting_position"
    ],
    "strike_rate": [
        "selected_in_playing_xi", "target_runs", "target_wickets",
        "career_strike_rate", "career_economy", "batting_position",
        "last5_strike_rate", "last10_strike_rate", "strike_rate_vs_opponent",
        "strike_rate_at_venue", "t20_impact_score"
    ],
    "economy": [
        "selected_in_playing_xi", "target_runs", "target_wickets",
        "career_strike_rate", "career_economy", "batting_position",
        "last5_economy", "last10_economy", "economy_vs_opponent",
        "economy_at_venue", "t20_impact_score", "odi_stability_score", "test_endurance_score"
    ],
}

# Categorical features (label-encoded for tree models)
CATEGORICAL_COLS = [
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
    "pitch_type",
]

# Boolean features (cast to int)
BOOLEAN_COLS = [
    "is_captain",
    "is_wicketkeeper",
]

# Date columns — will be decomposed into year/month/day/season features
DATE_COLS = ["match_date"]

# ---------------------------------------------------------------------------
# XGBoost Hyperparameters
# ---------------------------------------------------------------------------
XGBOOST_BASE_PARAMS = {
    "n_estimators": 500,
    "max_depth": 5,
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "reg_alpha": 0.1,
    "reg_lambda": 5.0,
    "min_child_weight": 5,
    "random_state": 42,
    "n_jobs": -1,
}

CLASSIFIER_BASE_PARAMS = {
    **XGBOOST_BASE_PARAMS,
    "eval_metric": "logloss",
    "use_label_encoder": False,
}

REGRESSOR_BASE_PARAMS = {
    **XGBOOST_BASE_PARAMS,
    "eval_metric": "rmse",
}

# Optuna tuning budget
OPTUNA_TRIALS = 15

# Early stopping rounds
EARLY_STOPPING_ROUNDS = 50

# Random seed for reproducibility
RANDOM_SEED = 42

# Cross-validation folds
CV_FOLDS = 5

# Train / val / test split ratios (chronological / stratified)
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15
