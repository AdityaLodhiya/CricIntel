import logging
import sys
from pathlib import Path
from ml.config.settings import LOGS_DIR
import datetime

def get_logger(name: str) -> logging.Logger:
    """
    Returns a configured logger with console and file handlers.
    Logs are saved to the 'logs/' directory with a timestamp.
    """
    logger = logging.getLogger(name)
    
    # If logger already has handlers, return it to avoid duplicate logs
    if logger.handlers:
        return logger
        
    logger.setLevel(logging.INFO)
    
    # Create formatters
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File Handler
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")
    log_file = LOGS_DIR / f"ml_pipeline_{today_str}.log"
    file_handler = logging.FileHandler(log_file, mode='a')
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    return logger
