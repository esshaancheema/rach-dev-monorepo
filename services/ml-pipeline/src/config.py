import os
from typing import List
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Zoptal ML Pipeline"
    VERSION: str = "1.0.0"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://zoptal.com",
        "https://*.zoptal.com",
        "https://app.zoptal.com"
    ]
    
    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://mluser:mlpassword@localhost:5432/zoptal_ml"
    )
    
    # Redis Configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # ML Model Configuration
    MODEL_STORAGE_PATH: str = os.getenv("MODEL_STORAGE_PATH", "/app/models")
    MODEL_REGISTRY_URL: str = os.getenv("MODEL_REGISTRY_URL", "")
    
    # MLflow Configuration
    MLFLOW_TRACKING_URI: str = os.getenv("MLFLOW_TRACKING_URI", "sqlite:///mlruns.db")
    MLFLOW_EXPERIMENT_NAME: str = os.getenv("MLFLOW_EXPERIMENT_NAME", "zoptal-ml")
    
    # Weights & Biases Configuration
    WANDB_PROJECT: str = os.getenv("WANDB_PROJECT", "zoptal-ml")
    WANDB_API_KEY: str = os.getenv("WANDB_API_KEY", "")
    
    # Training Configuration
    MAX_TRAINING_TIME: int = int(os.getenv("MAX_TRAINING_TIME", "3600"))  # seconds
    MAX_CONCURRENT_JOBS: int = int(os.getenv("MAX_CONCURRENT_JOBS", "5"))
    AUTO_ML_ENABLED: bool = os.getenv("AUTO_ML_ENABLED", "true").lower() == "true"
    
    # Prediction Configuration
    PREDICTION_CACHE_TTL: int = int(os.getenv("PREDICTION_CACHE_TTL", "300"))  # seconds
    MAX_BATCH_SIZE: int = int(os.getenv("MAX_BATCH_SIZE", "1000"))
    
    # Data Configuration
    DATA_STORAGE_PATH: str = os.getenv("DATA_STORAGE_PATH", "/app/data")
    MAX_DATA_SIZE: int = int(os.getenv("MAX_DATA_SIZE", "1073741824"))  # 1GB
    
    # Security Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Monitoring Configuration
    PROMETHEUS_PORT: int = int(os.getenv("PROMETHEUS_PORT", "9090"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # External Services
    FEATURE_STORE_URL: str = os.getenv("FEATURE_STORE_URL", "")
    DATA_WAREHOUSE_URL: str = os.getenv("DATA_WAREHOUSE_URL", "")
    
    # Model Serving Configuration
    MODEL_SERVER_WORKERS: int = int(os.getenv("MODEL_SERVER_WORKERS", "4"))
    MODEL_SERVER_TIMEOUT: int = int(os.getenv("MODEL_SERVER_TIMEOUT", "60"))
    
    # Notification Configuration
    SLACK_WEBHOOK_URL: str = os.getenv("SLACK_WEBHOOK_URL", "")
    EMAIL_NOTIFICATIONS: bool = os.getenv("EMAIL_NOTIFICATIONS", "false").lower() == "true"
    
    # Resource Limits
    MAX_MEMORY_USAGE: str = os.getenv("MAX_MEMORY_USAGE", "8GB")
    MAX_CPU_USAGE: int = int(os.getenv("MAX_CPU_USAGE", "8"))
    GPU_ENABLED: bool = os.getenv("GPU_ENABLED", "false").lower() == "true"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# Create settings instance
settings = Settings()