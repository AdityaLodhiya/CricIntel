# ML Pipeline Documentation & User Guide

Welcome to the **CricIntel Machine Learning Backend**. This directory (`CricIntel/backend/ml/`) contains the complete, production-ready AI Cricket Prediction System. This guide explains every file, every function, and exactly how to train your models when you are ready.

---

## 📁 1. Directory & File Breakdown

### `config/`
- **`settings.py`**: The core configuration hub. It defines exactly where data is stored, lists every single feature column (categorical, boolean, dates, targets), and stores the hyperparameter dictionaries for XGBoost, LightGBM, and CatBoost.

### `data/`
- **Where Datasets Go**: This folder is empty except for the mock data file. When you are ready to train on real data, **place your final CSV files in this directory**.

### `feature_engineering/`
- **`indices.py`**: Contains the `IndicesGenerator` class. It mathematically calculates the normalized (0-100) scores for:
  - `calculate_recent_form`: Uses last 5/10 match data.
  - `calculate_venue_rating`: Measures historical success at the current stadium.
  - `calculate_opponent_rating`: Measures historical success against the opposition.
  - `calculate_career_rating`: Overall historic stability.
  - `calculate_impact_player_index`: The proprietary, overall impact score combining form, venue, and opponent ratings.
- **`pipeline.py`**: Contains `FeatureEngineeringPipeline`. It orchestrates the entire feature creation process and passes the enriched dataset to the next stage.

### `preprocessing/`
- **`cleaner.py`**: Contains `DataCleaner`. Automatically splits `match_date` into day/month/year/season. Replaces missing numbers with median, and missing text with the mode. Drops identifiers like `player_name` before training to prevent data leakage.
- **`encoders.py`**: Contains `CategoricalEncoder`. Automatically applies LabelEncoding to all categorical variables listed in `config/settings.py`. It also saves these encoders (`.pkl`) so inference uses the exact same mappings.
- **`splitter.py`**: Contains `chronological_split()`. Enforces strict time-series splitting (70% train, 15% validation, 15% test) to guarantee the model never learns from "future" matches.

### `training/`
- **`trainer.py`**: Contains the unified `ModelTrainer`. It takes the preprocessed data and dynamically trains multiple algorithms (XGBoost, LightGBM, CatBoost) for either Classification (Playing XI) or Regression (Runs/Wickets). It calculates Accuracy, F1, RMSE, and R2, and **automatically saves the best-performing model**.

### `explainability/`
- **`shap_explainer.py`**: Contains `SHAPExplainer`. Connects to the trained models and extracts Shapley values to figure out exactly *why* a player was predicted to score runs or be selected.

### `prediction/`
- **`inference.py`**: Contains `InferenceEngine`. This is what Django will call in production. It loads the saved models and encoders, takes a raw player row, runs it through preprocessing, and returns the probabilities for `target_runs`, `target_wickets`, and `selected_in_playing_xi`.
- **`team_balancer.py`**: Contains `TeamBalanceEngine`. Takes the AI probabilities and guarantees the final selected XI has a realistic balance (e.g., minimum 1 Wicketkeeper, 3 Bowlers, 5 Batters).
- **`explanation_engine.py`**: Contains `AIExplanationEngine`. Takes the SHAP values and impact indices and translates them into a human-readable English sentence justifying the prediction.

### `utils/`
- **`logger.py`**: Sets up standardized logging to print traces to the terminal and save them to the `logs/` directory.
- **`visualizations.py`**: Provides Plotly/Graph_Objects functions to generate beautiful ROC curves, Confusion Matrices, Heatmaps, and Feature Importance bar charts.

### Root Level
- **`main.py`**: The master execution script. It glues `DataCleaner -> Encoders -> Splitter -> ModelTrainer -> Explainer` together in one seamless pipeline.
- **`mock_data_generator.py`**: A helper script that generates fake dataset rows matching your exact schema so you can test the pipeline without needing real data.

---

## 🚀 2. How to Train the Model Perfectly

When your backend database is fully populated and you have generated your massive CSV containing Men/Women ODI/T20/Test data, follow these steps exactly:

### Step 1: Place Your Dataset
Put your generated CSV file into the data folder:
`CricIntel/backend/ml/data/my_cricket_dataset.csv`

### Step 2: Open `main.py`
Open `CricIntel/backend/ml/main.py`. Scroll down to the bottom where `run_training_pipeline()` is called. Update the path to point to your new file:

```python
if __name__ == '__main__':
    real_data_path = DATA_DIR / "my_cricket_dataset.csv"
    run_training_pipeline(str(real_data_path))
```

### Step 3: Verify Settings
Open `CricIntel/backend/ml/config/settings.py`. Ensure that `CATEGORICAL_COLS`, `TARGET_COLS`, and `IDENTIFIER_COLS` perfectly match the column headers in your actual CSV file. If you added a new column like `weather_condition`, add it to `CATEGORICAL_COLS`.

### Step 4: Run the Training Pipeline
Open your terminal, ensure your virtual environment is active, navigate to `CricIntel/backend/`, and run:
```bash
python -m ml.main
```

### What Happens Next?
1. The script will load your CSV and sort it strictly by date.
2. It will engineer the proprietary *Impact Player Index*, *Venue Rating*, etc.
3. It will clean all missing data, encode words into numbers, and split 70% of the older matches for training, saving the newest 15% for testing.
4. It will race XGBoost against LightGBM and CatBoost.
5. It will pick the winner and save the compiled `.joblib` model file into `CricIntel/backend/ml/saved_models/`.
6. You can now use `ml.prediction.inference.InferenceEngine` inside your Django views to get real-time AI predictions!
