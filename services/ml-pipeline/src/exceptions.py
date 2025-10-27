from typing import Any, Dict, Optional

class MLServiceException(Exception):
    """Base exception for ML service errors"""
    
    def __init__(
        self, 
        message: str, 
        status_code: int = 500, 
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class ModelNotFoundError(MLServiceException):
    """Raised when a requested model is not found"""
    
    def __init__(self, model_type: str, version: str = None):
        message = f"Model {model_type}"
        if version:
            message += f" version {version}"
        message += " not found"
        
        super().__init__(
            message=message,
            status_code=404,
            details={"model_type": model_type, "version": version}
        )

class InvalidFeatureError(MLServiceException):
    """Raised when invalid features are provided for prediction"""
    
    def __init__(self, missing_features: list = None, invalid_features: list = None):
        message = "Invalid features provided"
        details = {}
        
        if missing_features:
            message += f". Missing features: {', '.join(missing_features)}"
            details["missing_features"] = missing_features
            
        if invalid_features:
            message += f". Invalid features: {', '.join(invalid_features)}"
            details["invalid_features"] = invalid_features
        
        super().__init__(
            message=message,
            status_code=400,
            details=details
        )

class TrainingJobError(MLServiceException):
    """Raised when training job fails"""
    
    def __init__(self, job_id: str, error_message: str):
        super().__init__(
            message=f"Training job {job_id} failed: {error_message}",
            status_code=500,
            details={"job_id": job_id, "error": error_message}
        )

class DataIngestionError(MLServiceException):
    """Raised when data ingestion fails"""
    
    def __init__(self, source: str, error_message: str):
        super().__init__(
            message=f"Data ingestion from {source} failed: {error_message}",
            status_code=500,
            details={"source": source, "error": error_message}
        )

class ModelDeploymentError(MLServiceException):
    """Raised when model deployment fails"""
    
    def __init__(self, model_type: str, version: str, error_message: str):
        super().__init__(
            message=f"Failed to deploy model {model_type} version {version}: {error_message}",
            status_code=500,
            details={"model_type": model_type, "version": version, "error": error_message}
        )

class FeatureExtractionError(MLServiceException):
    """Raised when feature extraction fails"""
    
    def __init__(self, feature_type: str, error_message: str):
        super().__init__(
            message=f"Feature extraction for {feature_type} failed: {error_message}",
            status_code=500,
            details={"feature_type": feature_type, "error": error_message}
        )

class ResourceLimitError(MLServiceException):
    """Raised when resource limits are exceeded"""
    
    def __init__(self, resource_type: str, current_usage: float, limit: float):
        super().__init__(
            message=f"Resource limit exceeded for {resource_type}: {current_usage} > {limit}",
            status_code=429,
            details={
                "resource_type": resource_type,
                "current_usage": current_usage,
                "limit": limit
            }
        )

class ValidationError(MLServiceException):
    """Raised when data validation fails"""
    
    def __init__(self, validation_errors: Dict[str, str]):
        error_messages = [f"{field}: {error}" for field, error in validation_errors.items()]
        message = f"Validation failed: {', '.join(error_messages)}"
        
        super().__init__(
            message=message,
            status_code=422,
            details={"validation_errors": validation_errors}
        )

class ConfigurationError(MLServiceException):
    """Raised when configuration is invalid"""
    
    def __init__(self, config_item: str, error_message: str):
        super().__init__(
            message=f"Configuration error for {config_item}: {error_message}",
            status_code=500,
            details={"config_item": config_item, "error": error_message}
        )

class PredictionError(MLServiceException):
    """Raised when prediction fails"""
    
    def __init__(self, model_type: str, error_message: str, features: Dict[str, Any] = None):
        super().__init__(
            message=f"Prediction failed for model {model_type}: {error_message}",
            status_code=500,
            details={
                "model_type": model_type,
                "error": error_message,
                "features": features or {}
            }
        )

class ModelPerformanceError(MLServiceException):
    """Raised when model performance is below acceptable thresholds"""
    
    def __init__(self, model_type: str, metric: str, current_value: float, threshold: float):
        super().__init__(
            message=f"Model {model_type} performance below threshold: {metric} = {current_value} < {threshold}",
            status_code=503,
            details={
                "model_type": model_type,
                "metric": metric,
                "current_value": current_value,
                "threshold": threshold
            }
        )

class DataDriftError(MLServiceException):
    """Raised when significant data drift is detected"""
    
    def __init__(self, model_type: str, drift_details: Dict[str, Any]):
        super().__init__(
            message=f"Data drift detected for model {model_type}",
            status_code=503,
            details={
                "model_type": model_type,
                "drift_details": drift_details
            }
        )

def handle_ml_exception(e: Exception) -> MLServiceException:
    """Convert generic exceptions to ML service exceptions"""
    
    if isinstance(e, MLServiceException):
        return e
    
    # Map common exceptions
    if isinstance(e, FileNotFoundError):
        return ModelNotFoundError("unknown", "unknown")
    
    if isinstance(e, ValueError):
        return ValidationError({"value": str(e)})
    
    if isinstance(e, KeyError):
        return InvalidFeatureError(missing_features=[str(e)])
    
    # Generic exception
    return MLServiceException(
        message=f"Unexpected error: {str(e)}",
        status_code=500,
        details={"original_error": str(e), "error_type": type(e).__name__}
    )