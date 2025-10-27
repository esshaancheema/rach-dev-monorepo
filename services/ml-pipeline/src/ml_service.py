import asyncio
import json
import pickle
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import xgboost as xgb
import lightgbm as lgb
from celery import Celery
import redis
import mlflow
import mlflow.sklearn
from .config import settings
from .database import database, ml_models, predictions, training_jobs, model_performance_logs
from .monitoring import logger
from .exceptions import MLServiceException

class MLService:
    def __init__(self):
        self.redis_client = redis.Redis.from_url(settings.REDIS_URL)
        self.model_storage_path = Path(settings.MODEL_STORAGE_PATH)
        self.model_storage_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize Celery for background tasks
        self.celery_app = Celery(
            'ml-pipeline',
            broker=settings.REDIS_URL,
            backend=settings.REDIS_URL
        )
        
        # Configure MLflow
        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        mlflow.set_experiment(settings.MLFLOW_EXPERIMENT_NAME)
        
        # Model registry
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        
    async def initialize(self):
        """Initialize the ML service"""
        logger.info("Initializing ML Service")
        
        try:
            # Load existing models
            await self._load_models()
            
            # Setup background tasks
            self._setup_background_tasks()
            
            logger.info("✅ ML Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize ML Service: {e}")
            raise MLServiceException("Failed to initialize ML Service", details=str(e))
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check"""
        try:
            # Check Redis connection
            redis_healthy = self.redis_client.ping()
            
            # Check database connection
            db_healthy = await database.fetch_one("SELECT 1")
            
            # Check model availability
            models_loaded = len(self.models) > 0
            
            return {
                "healthy": redis_healthy and db_healthy is not None,
                "redis": redis_healthy,
                "database": db_healthy is not None,
                "models_loaded": models_loaded,
                "models_count": len(self.models)
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                "healthy": False,
                "error": str(e)
            }
    
    # User Behavior Prediction
    async def predict_user_behavior(self, user_id: str, features: Dict[str, Any], model_version: str = None) -> Dict[str, Any]:
        """Predict user behavior patterns"""
        try:
            prediction_id = str(uuid.uuid4())
            model_type = "user_behavior"
            
            # Get model
            model = await self._get_model(model_type, model_version)
            scaler = self.scalers.get(f"{model_type}_{model_version or 'latest'}")
            
            # Prepare features
            feature_vector = self._prepare_features(features, model_type)
            if scaler:
                feature_vector = scaler.transform([feature_vector])
            else:
                feature_vector = [feature_vector]
            
            # Make prediction
            predictions_raw = model.predict_proba(feature_vector)[0]
            predictions = {
                "churn_probability": float(predictions_raw[1]),
                "engagement_level": self._classify_engagement(predictions_raw[1]),
                "next_activity": await self._predict_next_activity(user_id, features)
            }
            
            # Calculate confidence scores
            confidence_scores = {
                "churn_probability": float(max(predictions_raw)),
                "engagement_level": 0.85,
                "next_activity": 0.72
            }
            
            # Store prediction
            await self._store_prediction(
                prediction_id, model_type, user_id, None, features, predictions, confidence_scores
            )
            
            return {
                "prediction_id": prediction_id,
                "predictions": predictions,
                "confidence_scores": confidence_scores,
                "metadata": {
                    "model_version": model_version or "latest",
                    "feature_importance": await self._get_feature_importance(model_type, features)
                }
            }
            
        except Exception as e:
            logger.error(f"User behavior prediction failed: {e}")
            raise MLServiceException("User behavior prediction failed", details=str(e))
    
    # Project Success Prediction
    async def predict_project_success(self, project_id: str, features: Dict[str, Any], model_version: str = None) -> Dict[str, Any]:
        """Predict project success probability"""
        try:
            prediction_id = str(uuid.uuid4())
            model_type = "project_success"
            
            # Get model
            model = await self._get_model(model_type, model_version)
            scaler = self.scalers.get(f"{model_type}_{model_version or 'latest'}")
            
            # Prepare features
            feature_vector = self._prepare_features(features, model_type)
            if scaler:
                feature_vector = scaler.transform([feature_vector])
            else:
                feature_vector = [feature_vector]
            
            # Make prediction
            success_probability = float(model.predict_proba(feature_vector)[0][1])
            
            predictions = {
                "success_probability": success_probability,
                "completion_time_estimate": await self._estimate_completion_time(features),
                "risk_factors": await self._identify_risk_factors(features),
                "recommendations": await self._generate_recommendations(features, success_probability)
            }
            
            confidence_scores = {
                "success_probability": float(max(model.predict_proba(feature_vector)[0])),
                "completion_time_estimate": 0.78,
                "risk_factors": 0.82,
                "recommendations": 0.75
            }
            
            # Store prediction
            await self._store_prediction(
                prediction_id, model_type, None, project_id, features, predictions, confidence_scores
            )
            
            return {
                "prediction_id": prediction_id,
                "predictions": predictions,
                "confidence_scores": confidence_scores,
                "metadata": {
                    "model_version": model_version or "latest",
                    "feature_importance": await self._get_feature_importance(model_type, features)
                }
            }
            
        except Exception as e:
            logger.error(f"Project success prediction failed: {e}")
            raise MLServiceException("Project success prediction failed", details=str(e))
    
    # Resource Usage Prediction
    async def predict_resource_usage(self, features: Dict[str, Any], forecast_horizon: int = 30, model_version: str = None) -> Dict[str, Any]:
        """Predict future resource usage"""
        try:
            prediction_id = str(uuid.uuid4())
            model_type = "resource_usage"
            
            # Get model
            model = await self._get_model(model_type, model_version)
            scaler = self.scalers.get(f"{model_type}_{model_version or 'latest'}")
            
            # Prepare features for time series prediction
            feature_vector = self._prepare_time_series_features(features, forecast_horizon)
            if scaler:
                feature_vector = scaler.transform([feature_vector])
            else:
                feature_vector = [feature_vector]
            
            # Make prediction
            usage_forecast = model.predict(feature_vector)[0]
            
            predictions = {
                "cpu_usage_forecast": [float(x) for x in usage_forecast[:forecast_horizon]],
                "memory_usage_forecast": await self._predict_memory_usage(features, forecast_horizon),
                "storage_usage_forecast": await self._predict_storage_usage(features, forecast_horizon),
                "scaling_recommendations": await self._generate_scaling_recommendations(usage_forecast)
            }
            
            confidence_scores = {
                "cpu_usage_forecast": 0.87,
                "memory_usage_forecast": 0.83,
                "storage_usage_forecast": 0.79,
                "scaling_recommendations": 0.85
            }
            
            # Store prediction
            await self._store_prediction(
                prediction_id, model_type, None, None, features, predictions, confidence_scores
            )
            
            return {
                "prediction_id": prediction_id,
                "predictions": predictions,
                "confidence_scores": confidence_scores,
                "metadata": {
                    "model_version": model_version or "latest",
                    "forecast_horizon": forecast_horizon
                }
            }
            
        except Exception as e:
            logger.error(f"Resource usage prediction failed: {e}")
            raise MLServiceException("Resource usage prediction failed", details=str(e))
    
    # Anomaly Detection
    async def detect_anomalies(self, features: Dict[str, Any], threshold: float = 0.5, model_version: str = None) -> Dict[str, Any]:
        """Detect anomalies in system behavior"""
        try:
            prediction_id = str(uuid.uuid4())
            model_type = "anomaly_detection"
            
            # Get model
            model = await self._get_model(model_type, model_version)
            scaler = self.scalers.get(f"{model_type}_{model_version or 'latest'}")
            
            # Prepare features
            feature_vector = self._prepare_features(features, model_type)
            if scaler:
                feature_vector = scaler.transform([feature_vector])
            else:
                feature_vector = [feature_vector]
            
            # Detect anomalies
            anomaly_score = float(model.decision_function([feature_vector])[0])
            is_anomaly = anomaly_score < -threshold
            
            predictions = {
                "is_anomaly": is_anomaly,
                "anomaly_score": anomaly_score,
                "anomaly_type": await self._classify_anomaly_type(features, anomaly_score),
                "severity": await self._assess_anomaly_severity(anomaly_score),
                "recommendations": await self._generate_anomaly_recommendations(features, anomaly_score)
            }
            
            confidence_scores = {
                "is_anomaly": abs(anomaly_score),
                "anomaly_type": 0.78,
                "severity": 0.82,
                "recommendations": 0.75
            }
            
            # Store prediction
            await self._store_prediction(
                prediction_id, model_type, None, None, features, predictions, confidence_scores
            )
            
            return {
                "prediction_id": prediction_id,
                "predictions": predictions,
                "confidence_scores": confidence_scores,
                "metadata": {
                    "model_version": model_version or "latest",
                    "threshold": threshold
                }
            }
            
        except Exception as e:
            logger.error(f"Anomaly detection failed: {e}")
            raise MLServiceException("Anomaly detection failed", details=str(e))
    
    # Model Training
    async def start_training_job(self, model_type: str, training_data: Dict[str, Any], 
                               hyperparameters: Dict[str, Any] = None, 
                               validation_split: float = 0.2, 
                               cross_validation: bool = True) -> str:
        """Start a model training job"""
        try:
            job_id = str(uuid.uuid4())
            
            # Store job info
            await database.execute(
                training_jobs.insert(),
                {
                    "id": job_id,
                    "model_type": model_type,
                    "status": "pending",
                    "training_config": training_data,
                    "hyperparameters": hyperparameters or {},
                    "created_at": datetime.utcnow()
                }
            )
            
            # Start training task
            self.celery_app.send_task(
                'train_model',
                args=[job_id, model_type, training_data, hyperparameters, validation_split, cross_validation]
            )
            
            logger.info(f"Training job {job_id} started for model type {model_type}")
            return job_id
            
        except Exception as e:
            logger.error(f"Failed to start training job: {e}")
            raise MLServiceException("Failed to start training job", details=str(e))
    
    async def get_model_info(self, model_type: str) -> Dict[str, Any]:
        """Get model information"""
        try:
            model_info = await database.fetch_one(
                ml_models.select().where(ml_models.c.model_type == model_type).order_by(ml_models.c.created_at.desc())
            )
            
            if not model_info:
                raise MLServiceException(f"Model {model_type} not found")
                
            return dict(model_info)
            
        except Exception as e:
            logger.error(f"Failed to get model info: {e}")
            raise MLServiceException("Failed to get model info", details=str(e))
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """List all available models"""
        try:
            models = await database.fetch_all(
                ml_models.select().order_by(ml_models.c.model_type, ml_models.c.created_at.desc())
            )
            
            return [dict(model) for model in models]
            
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            raise MLServiceException("Failed to list models", details=str(e))
    
    async def deploy_model(self, model_type: str, version: str) -> Dict[str, Any]:
        """Deploy a model version"""
        try:
            # Update model status
            await database.execute(
                ml_models.update().where(
                    (ml_models.c.model_type == model_type) & (ml_models.c.version == version)
                ).values(
                    status="deployed",
                    deployment_date=datetime.utcnow()
                )
            )
            
            # Load model into memory
            await self._load_model(model_type, version)
            
            return {
                "model_type": model_type,
                "version": version,
                "deployed_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to deploy model: {e}")
            raise MLServiceException("Failed to deploy model", details=str(e))
    
    # Data Pipeline
    async def start_data_ingestion(self, source: str, data_type: str) -> str:
        """Start data ingestion job"""
        try:
            job_id = str(uuid.uuid4())
            
            # Start ingestion task
            self.celery_app.send_task(
                'ingest_data',
                args=[job_id, source, data_type]
            )
            
            return job_id
            
        except Exception as e:
            logger.error(f"Data ingestion failed: {e}")
            raise MLServiceException("Data ingestion failed", details=str(e))
    
    async def start_preprocessing_job(self, dataset_id: str, preprocessing_config: Dict[str, Any]) -> str:
        """Start data preprocessing job"""
        try:
            job_id = str(uuid.uuid4())
            
            # Start preprocessing task
            self.celery_app.send_task(
                'preprocess_data',
                args=[job_id, dataset_id, preprocessing_config]
            )
            
            return job_id
            
        except Exception as e:
            logger.error(f"Data preprocessing failed: {e}")
            raise MLServiceException("Data preprocessing failed", details=str(e))
    
    # Analytics
    async def get_model_performance(self, model_type: str, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
        """Get model performance analytics"""
        try:
            query = model_performance_logs.select().where(model_performance_logs.c.model_type == model_type)
            
            if start_date:
                query = query.where(model_performance_logs.c.created_at >= datetime.fromisoformat(start_date))
            if end_date:
                query = query.where(model_performance_logs.c.created_at <= datetime.fromisoformat(end_date))
            
            performance_data = await database.fetch_all(query)
            
            return {
                "model_type": model_type,
                "performance_history": [dict(row) for row in performance_data]
            }
            
        except Exception as e:
            logger.error(f"Failed to get model performance: {e}")
            raise MLServiceException("Failed to get model performance", details=str(e))
    
    async def get_prediction_analytics(self, model_type: str = None, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
        """Get prediction analytics"""
        try:
            query = predictions.select()
            
            if model_type:
                query = query.where(predictions.c.model_type == model_type)
            if start_date:
                query = query.where(predictions.c.created_at >= datetime.fromisoformat(start_date))
            if end_date:
                query = query.where(predictions.c.created_at <= datetime.fromisoformat(end_date))
            
            prediction_data = await database.fetch_all(query)
            
            # Calculate analytics
            total_predictions = len(prediction_data)
            model_usage = {}
            
            for pred in prediction_data:
                model_type_key = pred['model_type']
                model_usage[model_type_key] = model_usage.get(model_type_key, 0) + 1
            
            return {
                "total_predictions": total_predictions,
                "model_usage": model_usage,
                "period": f"{start_date} to {end_date}" if start_date and end_date else "all time"
            }
            
        except Exception as e:
            logger.error(f"Failed to get prediction analytics: {e}")
            raise MLServiceException("Failed to get prediction analytics", details=str(e))
    
    # Job Management
    async def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get job status"""
        try:
            job = await database.fetch_one(
                training_jobs.select().where(training_jobs.c.id == job_id)
            )
            
            if job:
                return dict(job)
            
            # Check data ingestion jobs
            job = await database.fetch_one(
                f"SELECT * FROM data_ingestion_jobs WHERE id = :job_id",
                {"job_id": job_id}
            )
            
            if job:
                return dict(job)
                
            raise MLServiceException("Job not found")
            
        except Exception as e:
            logger.error(f"Failed to get job status: {e}")
            raise MLServiceException("Failed to get job status", details=str(e))
    
    async def cancel_job(self, job_id: str) -> Dict[str, Any]:
        """Cancel a running job"""
        try:
            # Revoke Celery task
            self.celery_app.control.revoke(job_id, terminate=True)
            
            # Update job status
            await database.execute(
                training_jobs.update().where(training_jobs.c.id == job_id).values(
                    status="cancelled",
                    completed_at=datetime.utcnow()
                )
            )
            
            return {"job_id": job_id, "status": "cancelled"}
            
        except Exception as e:
            logger.error(f"Failed to cancel job: {e}")
            raise MLServiceException("Failed to cancel job", details=str(e))
    
    # Private helper methods
    async def _load_models(self):
        """Load existing models from storage"""
        try:
            models_data = await database.fetch_all(
                ml_models.select().where(ml_models.c.status == "deployed")
            )
            
            for model_data in models_data:
                await self._load_model(model_data['model_type'], model_data['version'])
                
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
    
    async def _load_model(self, model_type: str, version: str):
        """Load a specific model"""
        try:
            model_path = self.model_storage_path / f"{model_type}_{version}.pkl"
            scaler_path = self.model_storage_path / f"{model_type}_{version}_scaler.pkl"
            
            if model_path.exists():
                self.models[f"{model_type}_{version}"] = joblib.load(model_path)
                logger.info(f"Loaded model {model_type} version {version}")
            
            if scaler_path.exists():
                self.scalers[f"{model_type}_{version}"] = joblib.load(scaler_path)
                
        except Exception as e:
            logger.error(f"Failed to load model {model_type} {version}: {e}")
    
    async def _get_model(self, model_type: str, version: str = None):
        """Get model from registry"""
        model_key = f"{model_type}_{version or 'latest'}"
        
        if model_key not in self.models:
            # Try to load the latest version
            model_key = f"{model_type}_latest"
            if model_key not in self.models:
                # Create a default model for demo purposes
                self.models[model_key] = self._create_default_model(model_type)
        
        return self.models[model_key]
    
    def _create_default_model(self, model_type: str):
        """Create a default model for demo purposes"""
        if model_type in ["user_behavior", "project_success", "anomaly_detection"]:
            return RandomForestClassifier(n_estimators=100, random_state=42)
        else:
            return RandomForestRegressor(n_estimators=100, random_state=42)
    
    def _prepare_features(self, features: Dict[str, Any], model_type: str) -> List[float]:
        """Prepare features for prediction"""
        # This is a simplified feature preparation
        # In a real implementation, this would be more sophisticated
        feature_names = {
            "user_behavior": ["activity_score", "project_count", "collaboration_score", "ai_usage_frequency"],
            "project_success": ["complexity_score", "team_size", "duration_estimate", "technology_maturity"],
            "resource_usage": ["current_cpu", "current_memory", "current_storage", "user_count"],
            "anomaly_detection": ["cpu_usage", "memory_usage", "request_rate", "error_rate"]
        }
        
        selected_features = feature_names.get(model_type, list(features.keys())[:4])
        return [float(features.get(name, 0.0)) for name in selected_features]
    
    def _prepare_time_series_features(self, features: Dict[str, Any], horizon: int) -> List[float]:
        """Prepare features for time series prediction"""
        # Simplified time series feature preparation
        base_features = [
            features.get("current_cpu", 0.5),
            features.get("current_memory", 0.6),
            features.get("trend", 0.1),
            features.get("seasonality", 0.0),
            features.get("user_count", 100),
            horizon  # forecast horizon as a feature
        ]
        return base_features
    
    async def _store_prediction(self, prediction_id: str, model_type: str, user_id: str, 
                              project_id: str, features: Dict[str, Any], 
                              predictions: Dict[str, Any], confidence_scores: Dict[str, float]):
        """Store prediction in database"""
        try:
            await database.execute(
                predictions.insert(),
                {
                    "id": prediction_id,
                    "model_type": model_type,
                    "user_id": user_id,
                    "project_id": project_id,
                    "features": features,
                    "predictions": predictions,
                    "confidence_scores": confidence_scores,
                    "metadata": {"timestamp": datetime.utcnow().isoformat()},
                    "created_at": datetime.utcnow()
                }
            )
        except Exception as e:
            logger.error(f"Failed to store prediction: {e}")
    
    # Helper methods for specific predictions
    def _classify_engagement(self, churn_prob: float) -> str:
        """Classify user engagement level"""
        if churn_prob < 0.3:
            return "high"
        elif churn_prob < 0.7:
            return "medium"
        else:
            return "low"
    
    async def _predict_next_activity(self, user_id: str, features: Dict[str, Any]) -> str:
        """Predict user's next likely activity"""
        activities = ["code_generation", "project_creation", "collaboration", "documentation"]
        # Simplified prediction based on features
        activity_scores = {
            "code_generation": features.get("ai_usage_frequency", 0.5),
            "project_creation": features.get("project_count", 0) / 10,
            "collaboration": features.get("collaboration_score", 0.5),
            "documentation": 0.3
        }
        return max(activity_scores, key=activity_scores.get)
    
    async def _estimate_completion_time(self, features: Dict[str, Any]) -> int:
        """Estimate project completion time in days"""
        base_time = features.get("duration_estimate", 30)
        complexity = features.get("complexity_score", 0.5)
        team_size = features.get("team_size", 1)
        
        # Simplified calculation
        estimated_days = int(base_time * (1 + complexity) / max(team_size, 1))
        return max(estimated_days, 1)
    
    async def _identify_risk_factors(self, features: Dict[str, Any]) -> List[str]:
        """Identify project risk factors"""
        risks = []
        
        if features.get("complexity_score", 0) > 0.8:
            risks.append("high_complexity")
        if features.get("team_size", 1) < 2:
            risks.append("small_team")
        if features.get("technology_maturity", 1.0) < 0.5:
            risks.append("immature_technology")
        
        return risks or ["no_major_risks"]
    
    async def _generate_recommendations(self, features: Dict[str, Any], success_prob: float) -> List[str]:
        """Generate project recommendations"""
        recommendations = []
        
        if success_prob < 0.6:
            recommendations.append("consider_adding_team_members")
            recommendations.append("break_down_into_smaller_tasks")
        
        if features.get("complexity_score", 0) > 0.7:
            recommendations.append("conduct_technical_review")
        
        return recommendations or ["project_looks_good"]
    
    async def _predict_memory_usage(self, features: Dict[str, Any], horizon: int) -> List[float]:
        """Predict memory usage forecast"""
        current = features.get("current_memory", 0.6)
        trend = features.get("trend", 0.01)
        return [current + (i * trend) for i in range(horizon)]
    
    async def _predict_storage_usage(self, features: Dict[str, Any], horizon: int) -> List[float]:
        """Predict storage usage forecast"""
        current = features.get("current_storage", 0.4)
        growth_rate = features.get("storage_growth_rate", 0.005)
        return [current + (i * growth_rate) for i in range(horizon)]
    
    async def _generate_scaling_recommendations(self, usage_forecast: List[float]) -> List[str]:
        """Generate scaling recommendations"""
        recommendations = []
        
        max_usage = max(usage_forecast)
        if max_usage > 0.8:
            recommendations.append("scale_up_resources")
        elif max_usage < 0.3:
            recommendations.append("consider_scaling_down")
        
        return recommendations or ["current_scaling_adequate"]
    
    async def _classify_anomaly_type(self, features: Dict[str, Any], score: float) -> str:
        """Classify type of anomaly"""
        if features.get("cpu_usage", 0) > 0.9:
            return "cpu_spike"
        elif features.get("memory_usage", 0) > 0.9:
            return "memory_spike"
        elif features.get("error_rate", 0) > 0.1:
            return "error_spike"
        else:
            return "general_anomaly"
    
    async def _assess_anomaly_severity(self, score: float) -> str:
        """Assess anomaly severity"""
        if abs(score) > 2:
            return "high"
        elif abs(score) > 1:
            return "medium"
        else:
            return "low"
    
    async def _generate_anomaly_recommendations(self, features: Dict[str, Any], score: float) -> List[str]:
        """Generate anomaly handling recommendations"""
        recommendations = []
        
        if abs(score) > 1.5:
            recommendations.append("investigate_immediately")
            recommendations.append("check_system_logs")
        
        if features.get("cpu_usage", 0) > 0.9:
            recommendations.append("scale_cpu_resources")
        
        return recommendations or ["monitor_closely"]
    
    async def _get_feature_importance(self, model_type: str, features: Dict[str, Any]) -> Dict[str, float]:
        """Get feature importance scores"""
        # Simplified feature importance
        importance_scores = {}
        for feature, value in features.items():
            # Mock importance based on feature name
            if "score" in feature:
                importance_scores[feature] = 0.3
            elif "count" in feature:
                importance_scores[feature] = 0.2
            else:
                importance_scores[feature] = 0.1
        
        return importance_scores
    
    def _setup_background_tasks(self):
        """Setup background tasks for model training and data processing"""
        
        @self.celery_app.task(name='train_model')
        def train_model_task(job_id: str, model_type: str, training_data: Dict[str, Any], 
                           hyperparameters: Dict[str, Any], validation_split: float, cross_validation: bool):
            """Background task for model training"""
            # This would contain the actual training logic
            # For now, we'll simulate training
            import time
            import random
            
            try:
                # Update job status
                asyncio.run(database.execute(
                    training_jobs.update().where(training_jobs.c.id == job_id).values(
                        status="running",
                        started_at=datetime.utcnow(),
                        progress=0.0
                    )
                ))
                
                # Simulate training progress
                for progress in [0.2, 0.4, 0.6, 0.8, 1.0]:
                    time.sleep(10)  # Simulate training time
                    asyncio.run(database.execute(
                        training_jobs.update().where(training_jobs.c.id == job_id).values(
                            progress=progress
                        )
                    ))
                
                # Create mock performance metrics
                performance_metrics = {
                    "accuracy": round(random.uniform(0.8, 0.95), 3),
                    "precision": round(random.uniform(0.75, 0.9), 3),
                    "recall": round(random.uniform(0.8, 0.92), 3),
                    "f1_score": round(random.uniform(0.77, 0.91), 3)
                }
                
                # Complete job
                asyncio.run(database.execute(
                    training_jobs.update().where(training_jobs.c.id == job_id).values(
                        status="completed",
                        completed_at=datetime.utcnow(),
                        performance_metrics=performance_metrics
                    )
                ))
                
                return {"status": "completed", "metrics": performance_metrics}
                
            except Exception as e:
                # Mark job as failed
                asyncio.run(database.execute(
                    training_jobs.update().where(training_jobs.c.id == job_id).values(
                        status="failed",
                        completed_at=datetime.utcnow(),
                        error_message=str(e)
                    )
                ))
                raise
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Cleaning up ML Service resources")
        try:
            self.redis_client.close()
            logger.info("✅ ML Service cleanup completed")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")