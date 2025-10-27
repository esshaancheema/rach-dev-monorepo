from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from pydantic import BaseModel, Field, validator
from enum import Enum

class ModelType(str, Enum):
    USER_BEHAVIOR = "user_behavior"
    PROJECT_SUCCESS = "project_success"
    RESOURCE_USAGE = "resource_usage"
    ANOMALY_DETECTION = "anomaly_detection"
    CHURN_PREDICTION = "churn_prediction"
    RECOMMENDATION = "recommendation"

class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class DataType(str, Enum):
    USER_EVENTS = "user_events"
    PROJECT_METRICS = "project_metrics"
    SYSTEM_METRICS = "system_metrics"
    USAGE_LOGS = "usage_logs"
    COLLABORATION_DATA = "collaboration_data"

# Request Models
class PredictionRequest(BaseModel):
    user_id: Optional[str] = None
    project_id: Optional[str] = None
    features: Dict[str, Any]
    model_version: Optional[str] = None
    forecast_horizon: Optional[int] = Field(default=30, ge=1, le=365)
    threshold: Optional[float] = Field(default=0.5, ge=0.0, le=1.0)
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "user_123",
                "project_id": "proj_456",
                "features": {
                    "activity_score": 0.8,
                    "project_count": 5,
                    "collaboration_score": 0.6,
                    "ai_usage_frequency": 0.7
                },
                "model_version": "v1.2.0",
                "forecast_horizon": 30,
                "threshold": 0.5
            }
        }

class TrainingRequest(BaseModel):
    model_type: ModelType
    training_data: Dict[str, Any]
    hyperparameters: Optional[Dict[str, Any]] = {}
    validation_split: float = Field(default=0.2, ge=0.1, le=0.5)
    cross_validation: bool = True
    auto_hyperparameter_tuning: bool = True
    
    class Config:
        schema_extra = {
            "example": {
                "model_type": "user_behavior",
                "training_data": {
                    "source": "user_events",
                    "start_date": "2024-01-01",
                    "end_date": "2024-06-01",
                    "filters": {"active_users_only": True}
                },
                "hyperparameters": {
                    "learning_rate": 0.01,
                    "n_estimators": 100,
                    "max_depth": 10
                },
                "validation_split": 0.2,
                "cross_validation": True,
                "auto_hyperparameter_tuning": True
            }
        }

# Response Models
class PredictionResponse(BaseModel):
    prediction_id: str
    model_type: str
    predictions: Dict[str, Any]
    confidence_scores: Dict[str, float]
    metadata: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        schema_extra = {
            "example": {
                "prediction_id": "pred_789",
                "model_type": "user_behavior",
                "predictions": {
                    "churn_probability": 0.15,
                    "next_activity": "code_generation",
                    "engagement_level": "high"
                },
                "confidence_scores": {
                    "churn_probability": 0.85,
                    "next_activity": 0.72,
                    "engagement_level": 0.91
                },
                "metadata": {
                    "model_version": "v1.2.0",
                    "feature_importance": {
                        "activity_score": 0.4,
                        "project_count": 0.3,
                        "collaboration_score": 0.2,
                        "ai_usage_frequency": 0.1
                    }
                }
            }
        }

class ModelInfo(BaseModel):
    model_type: str
    version: str
    status: str
    performance_metrics: Dict[str, float]
    training_date: datetime
    deployment_date: Optional[datetime] = None
    feature_names: List[str]
    target_names: List[str]
    hyperparameters: Dict[str, Any]
    
    class Config:
        schema_extra = {
            "example": {
                "model_type": "user_behavior",
                "version": "v1.2.0",
                "status": "deployed",
                "performance_metrics": {
                    "accuracy": 0.89,
                    "precision": 0.85,
                    "recall": 0.92,
                    "f1_score": 0.88,
                    "auc_roc": 0.94
                },
                "training_date": "2024-06-01T10:00:00Z",
                "deployment_date": "2024-06-02T14:30:00Z",
                "feature_names": [
                    "activity_score",
                    "project_count",
                    "collaboration_score",
                    "ai_usage_frequency"
                ],
                "target_names": ["churn_probability", "engagement_level"],
                "hyperparameters": {
                    "learning_rate": 0.01,
                    "n_estimators": 100,
                    "max_depth": 10
                }
            }
        }

class JobInfo(BaseModel):
    job_id: str
    job_type: str
    status: JobStatus
    progress: float = Field(ge=0.0, le=1.0)
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    results: Optional[Dict[str, Any]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "job_id": "job_123",
                "job_type": "training",
                "status": "running",
                "progress": 0.65,
                "created_at": "2024-06-01T10:00:00Z",
                "started_at": "2024-06-01T10:01:00Z",
                "completed_at": None,
                "error_message": None,
                "results": None
            }
        }

# Data Pipeline Models
class DataIngestionRequest(BaseModel):
    source: str
    data_type: DataType
    source_config: Dict[str, Any]
    target_location: str
    transformation_rules: Optional[List[Dict[str, Any]]] = []
    
    class Config:
        schema_extra = {
            "example": {
                "source": "postgresql://user:pass@host:5432/db",
                "data_type": "user_events",
                "source_config": {
                    "table": "user_events",
                    "batch_size": 10000,
                    "incremental_column": "created_at"
                },
                "target_location": "s3://zoptal-ml-data/user_events/",
                "transformation_rules": [
                    {
                        "type": "filter",
                        "condition": "event_type != 'system'"
                    },
                    {
                        "type": "aggregate",
                        "group_by": ["user_id", "date"],
                        "metrics": ["count", "sum"]
                    }
                ]
            }
        }

class FeatureEngineeringRequest(BaseModel):
    dataset_id: str
    feature_definitions: List[Dict[str, Any]]
    target_variable: str
    feature_store_config: Optional[Dict[str, Any]] = {}
    
    class Config:
        schema_extra = {
            "example": {
                "dataset_id": "dataset_123",
                "feature_definitions": [
                    {
                        "name": "activity_score",
                        "type": "aggregation",
                        "source_columns": ["login_count", "action_count"],
                        "function": "weighted_sum",
                        "weights": [0.3, 0.7]
                    },
                    {
                        "name": "collaboration_score",
                        "type": "ratio",
                        "numerator": "shared_projects",
                        "denominator": "total_projects"
                    }
                ],
                "target_variable": "churn_flag",
                "feature_store_config": {
                    "store_features": True,
                    "feature_group": "user_behavior_features"
                }
            }
        }

# Analytics Models
class ModelPerformanceAnalytics(BaseModel):
    model_type: str
    version: str
    period: str
    metrics: Dict[str, float]
    drift_detection: Dict[str, Any]
    prediction_distribution: Dict[str, int]
    error_analysis: Dict[str, Any]
    
    class Config:
        schema_extra = {
            "example": {
                "model_type": "user_behavior",
                "version": "v1.2.0",
                "period": "2024-06",
                "metrics": {
                    "accuracy": 0.89,
                    "precision": 0.85,
                    "recall": 0.92,
                    "f1_score": 0.88
                },
                "drift_detection": {
                    "feature_drift_detected": False,
                    "concept_drift_detected": True,
                    "drift_score": 0.15
                },
                "prediction_distribution": {
                    "low_risk": 1500,
                    "medium_risk": 800,
                    "high_risk": 200
                },
                "error_analysis": {
                    "false_positives": 45,
                    "false_negatives": 23,
                    "common_error_patterns": ["new_user_bias", "seasonal_effects"]
                }
            }
        }

class PredictionAnalytics(BaseModel):
    period: str
    total_predictions: int
    model_usage: Dict[str, int]
    accuracy_trends: Dict[str, List[float]]
    latency_metrics: Dict[str, float]
    error_rates: Dict[str, float]
    
    class Config:
        schema_extra = {
            "example": {
                "period": "2024-06",
                "total_predictions": 15000,
                "model_usage": {
                    "user_behavior": 8000,
                    "project_success": 4000,
                    "resource_usage": 2000,
                    "anomaly_detection": 1000
                },
                "accuracy_trends": {
                    "user_behavior": [0.89, 0.91, 0.88, 0.90],
                    "project_success": [0.75, 0.77, 0.76, 0.78]
                },
                "latency_metrics": {
                    "p50": 120.5,
                    "p95": 450.2,
                    "p99": 890.1
                },
                "error_rates": {
                    "user_behavior": 0.02,
                    "project_success": 0.05
                }
            }
        }

# Configuration Models
class HyperparameterConfig(BaseModel):
    learning_rate: float = Field(default=0.01, ge=0.0001, le=1.0)
    n_estimators: int = Field(default=100, ge=10, le=1000)
    max_depth: int = Field(default=10, ge=1, le=50)
    min_samples_split: int = Field(default=2, ge=2, le=100)
    min_samples_leaf: int = Field(default=1, ge=1, le=50)
    regularization: float = Field(default=0.01, ge=0.0, le=1.0)
    
    @validator('learning_rate')
    def validate_learning_rate(cls, v):
        if v <= 0:
            raise ValueError('Learning rate must be positive')
        return v

class AutoMLConfig(BaseModel):
    time_budget: int = Field(default=3600, ge=300, le=86400)  # seconds
    metric: str = Field(default="accuracy")
    algorithms: Optional[List[str]] = None
    feature_selection: bool = True
    hyperparameter_tuning: bool = True
    ensemble: bool = True
    
    @validator('metric')
    def validate_metric(cls, v):
        allowed_metrics = ['accuracy', 'precision', 'recall', 'f1', 'auc_roc', 'mse', 'mae']
        if v not in allowed_metrics:
            raise ValueError(f'Metric must be one of {allowed_metrics}')
        return v