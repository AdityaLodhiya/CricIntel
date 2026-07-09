import pandas as pd
from ml.config.settings import DATA_DIR
from ml.preprocessing.cleaner import DataCleaner
from ml.preprocessing.encoders import CategoricalEncoder
from ml.preprocessing.splitter import chronological_split
from ml.feature_engine.pipeline import FeatureEngineeringPipeline
from ml.training.trainer import ModelTrainer
from ml.utils.logger import get_logger

logger = get_logger("MainPipeline")

def run_training_pipeline(data_path: str):
    logger.info("Starting ML Training Pipeline...")
    
    # 1. Load Data
    df = pd.read_csv(data_path)
    # Sort chronologically to prevent data leakage
    if 'match_date' in df.columns:
        df['match_date'] = pd.to_datetime(df['match_date'], errors='coerce')
        df = df.sort_values(by='match_date')
    logger.info(f"Loaded {len(df)} rows of data.")
    
    # 2. Feature Engineering
    logger.info("Running Feature Engineering...")
    fe_pipeline = FeatureEngineeringPipeline()
    df_engineered = fe_pipeline.transform(df)
    
    # 3. Preprocessing
    logger.info("Running Preprocessing...")
    cleaner = DataCleaner()
    df_clean, _ = cleaner.fit_transform(df_engineered, training=True)
    
    encoder = CategoricalEncoder()
    df_encoded = encoder.fit_transform(df_clean)
    
    # 4. Filter by Active Players (if applicable, drop retired)
    if 'is_active' in df_encoded.columns:
        # Standard filter if is_active is cleanly provided
        df_encoded = df_encoded[df_encoded['is_active'] == 1]
    
    # 4b. Heuristic fallback for active players: Drop if last match was > 3 years ago
    if 'match_date' in df.columns:
        max_date = df['match_date'].max()
        # Find the latest match date for each player
        player_latest_match = df.groupby('player_name')['match_date'].max()
        # Active if played in the last 3 years (approx 1095 days)
        active_players = player_latest_match[player_latest_match > (max_date - pd.Timedelta(days=1095))].index
        df_encoded = df_encoded[df_encoded['player_name'].isin(active_players)]
        logger.info(f"Filtered out inactive players. Rows remaining: {len(df_encoded)}")
    
    # The columns we split by are encoded, so we need to map the string categories to find the indices
    # Or simply iterate through the original df, find indices, and slice df_encoded.
    genders = ['Men', 'Women']
    formats = ['T20', 'ODI', 'Test']
    roles = ['Batsman', 'Bowler', 'Allrounder']
    
    for gender in genders:
        for fmt in formats:
            for role in roles:
                segment_name = f"{gender}_{fmt}_{role}".lower()
                logger.info(f"--- Starting Pipeline for Segment: {segment_name} ---")
                
                # Filter original dataframe for specific segments
                # Handle cases where column might not exist gracefully
                mask = pd.Series(True, index=df.index)
                if 'gender' in df.columns:
                    mask &= (df['gender'].str.upper() == gender.upper())
                if 'match_type' in df.columns:
                    mask &= (df['match_type'].str.upper() == fmt.upper())
                if 'player_role' in df.columns:
                    mask &= (df['player_role'].str.upper() == role.upper())
                    
                segment_indices = df[mask].index
                # Intersect with df_encoded (since some rows might have been dropped in cleaning/active filter)
                segment_indices = segment_indices.intersection(df_encoded.index)
                
                df_segment = df_encoded.loc[segment_indices].copy()
                
                if len(df_segment) < 20: # Lowered threshold slightly because segments are smaller
                    logger.warning(f"Not enough data to train {segment_name} model (rows: {len(df_segment)}). Skipping.")
                    continue
                    
                target_col = 'selected_in_playing_xi'
                from ml.config.settings import TARGET_COLS, IDENTIFIER_COLS
                
                other_targets = [t for t in TARGET_COLS if t != target_col and t in df_segment.columns]
                ids_to_drop = [c for c in IDENTIFIER_COLS if c in df_segment.columns]
                cols_to_drop = other_targets + ids_to_drop
                
                df_segment = df_segment.drop(columns=cols_to_drop)
                
                # 5. Splitting
                logger.info(f"Chronological Split for {segment_name}...")
                X_train, X_val, X_test, y_train, y_val, y_test = chronological_split(df_segment, target_col=target_col)
                
                # 6. Training
                logger.info(f"Training Classifier for {segment_name}...")
                trainer = ModelTrainer(task_type='classification')
                best_model = trainer.train_and_evaluate(X_train, y_train, X_val, y_val, format_name=segment_name)
                
    logger.info("Pipeline Execution Complete! All partitioned models generated.")

if __name__ == '__main__':
    # Default to mock data if no real data provided
    mock_file = DATA_DIR / "mock_cricket_data.csv"
    if not mock_file.exists():
        from ml.mock_data_generator import generate_mock_data
        generate_mock_data()
        
    run_training_pipeline(str(mock_file))
