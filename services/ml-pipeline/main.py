import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from src.config import settings
from src.database import database, engine, metadata
from src.models import PredictionRequest, PredictionResponse, TrainingRequest, ModelInfo
from src.ml_service import MLService
from src.monitoring import setup_monitoring, logger
from src.exceptions import MLServiceException

# Metrics
PREDICTION_COUNTER = Counter('ml_predictions_total', 'Total number of predictions made', ['model_type', 'status'])
PREDICTION_DURATION = Histogram('ml_prediction_duration_seconds', 'Time spent on predictions', ['model_type'])
TRAINING_COUNTER = Counter('ml_training_jobs_total', 'Total number of training jobs', ['model_type', 'status'])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting ML Pipeline Service")
    
    # Connect to database
    await database.connect()
    
    # Create tables
    metadata.create_all(bind=engine)
    
    # Initialize ML service
    app.state.ml_service = MLService()
    await app.state.ml_service.initialize()
    
    # Setup monitoring
    setup_monitoring()
    
    logger.info("✅ ML Pipeline Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down ML Pipeline Service")
    
    await app.state.ml_service.cleanup()
    await database.disconnect()
    
    logger.info("✅ ML Pipeline Service stopped")

# Create FastAPI app
app = FastAPI(
    title="Zoptal ML Pipeline Service",
    description="Machine Learning Pipeline for Predictive Analytics",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Dependency to get ML service
def get_ml_service():
    return app.state.ml_service

# Health endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        ml_service = get_ml_service()
        health_status = await ml_service.health_check()
        
        return {
            "status": "healthy" if health_status["healthy"] else "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "ml-pipeline",
            "version": "1.0.0",
            "checks": health_status
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ml-pipeline"
    }

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# ML Prediction endpoints
@app.post("/predict/user-behavior", response_model=PredictionResponse)
async def predict_user_behavior(
    request: PredictionRequest,
    ml_service: MLService = Depends(get_ml_service)
):
    """Predict user behavior patterns"""
    with PREDICTION_DURATION.labels(model_type='user_behavior').time():
        try:
            logger.info(f"Starting user behavior prediction for user: {request.user_id}")
            
            result = await ml_service.predict_user_behavior(
                user_id=request.user_id,
                features=request.features,
                model_version=request.model_version
            )
            
            PREDICTION_COUNTER.labels(model_type='user_behavior', status='success').inc()
            
            logger.info(f"User behavior prediction completed successfully for user: {request.user_id}")
            
            return PredictionResponse(
                prediction_id=result["prediction_id"],
                model_type="user_behavior",
                predictions=result["predictions"],
                confidence_scores=result["confidence_scores"],
                metadata=result["metadata"]
            )
            
        except Exception as e:
            PREDICTION_COUNTER.labels(model_type='user_behavior', status='error').inc()
            logger.error(f"User behavior prediction failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/project-success", response_model=PredictionResponse)
async def predict_project_success(
    request: PredictionRequest,
    ml_service: MLService = Depends(get_ml_service)
):
    """Predict project success probability"""
    with PREDICTION_DURATION.labels(model_type='project_success').time():
        try:
            logger.info(f"Starting project success prediction for project: {request.project_id}")
            
            result = await ml_service.predict_project_success(
                project_id=request.project_id,
                features=request.features,
                model_version=request.model_version
            )
            
            PREDICTION_COUNTER.labels(model_type='project_success', status='success').inc()
            
            return PredictionResponse(
                prediction_id=result["prediction_id"],
                model_type="project_success",
                predictions=result["predictions"],
                confidence_scores=result["confidence_scores"],
                metadata=result["metadata"]
            )
            
        except Exception as e:
            PREDICTION_COUNTER.labels(model_type='project_success', status='error').inc()
            logger.error(f"Project success prediction failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/resource-usage", response_model=PredictionResponse)
async def predict_resource_usage(
    request: PredictionRequest,
    ml_service: MLService = Depends(get_ml_service)
):
    """Predict future resource usage"""
    with PREDICTION_DURATION.labels(model_type='resource_usage').time():
        try:
            logger.info("Starting resource usage prediction")
            
            result = await ml_service.predict_resource_usage(
                features=request.features,
                forecast_horizon=request.forecast_horizon,
                model_version=request.model_version
            )
            
            PREDICTION_COUNTER.labels(model_type='resource_usage', status='success').inc()
            
            return PredictionResponse(
                prediction_id=result["prediction_id"],
                model_type="resource_usage",
                predictions=result["predictions"],
                confidence_scores=result["confidence_scores"],
                metadata=result["metadata"]
            )
            
        except Exception as e:
            PREDICTION_COUNTER.labels(model_type='resource_usage', status='error').inc()
            logger.error(f"Resource usage prediction failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/anomaly-detection", response_model=PredictionResponse)
async def detect_anomalies(
    request: PredictionRequest,
    ml_service: MLService = Depends(get_ml_service)
):
    """Detect anomalies in system behavior"""
    with PREDICTION_DURATION.labels(model_type='anomaly_detection').time():
        try:
            logger.info("Starting anomaly detection")
            
            result = await ml_service.detect_anomalies(
                features=request.features,
                threshold=request.threshold,
                model_version=request.model_version
            )
            
            PREDICTION_COUNTER.labels(model_type='anomaly_detection', status='success').inc()
            
            return PredictionResponse(
                prediction_id=result["prediction_id"],
                model_type="anomaly_detection",
                predictions=result["predictions"],
                confidence_scores=result["confidence_scores"],
                metadata=result["metadata"]
            )
            
        except Exception as e:
            PREDICTION_COUNTER.labels(model_type='anomaly_detection', status='error').inc()
            logger.error(f"Anomaly detection failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

# Model Management endpoints
@app.post("/models/train")
async def train_model(
    request: TrainingRequest,
    background_tasks: BackgroundTasks,
    ml_service: MLService = Depends(get_ml_service)
):
    """Start model training job"""
    try:
        logger.info(f"Starting training job for model: {request.model_type}")
        
        job_id = await ml_service.start_training_job(
            model_type=request.model_type,
            training_data=request.training_data,
            hyperparameters=request.hyperparameters,
            validation_split=request.validation_split,
            cross_validation=request.cross_validation
        )
        
        TRAINING_COUNTER.labels(model_type=request.model_type, status='started').inc()
        
        return {
            "job_id": job_id,
            "model_type": request.model_type,
            "status": "started",
            "message": "Training job started successfully"
        }
        
    except Exception as e:
        TRAINING_COUNTER.labels(model_type=request.model_type, status='error').inc()
        logger.error(f"Failed to start training job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/{model_type}/info", response_model=ModelInfo)
async def get_model_info(
    model_type: str,
    ml_service: MLService = Depends(get_ml_service)
):
    """Get model information"""
    try:
        info = await ml_service.get_model_info(model_type)
        return ModelInfo(**info)
        
    except Exception as e:
        logger.error(f"Failed to get model info: {e}")
        raise HTTPException(status_code=404, detail=f"Model {model_type} not found")

@app.get("/models")
async def list_models(ml_service: MLService = Depends(get_ml_service)):
    """List all available models"""
    try:
        models = await ml_service.list_models()
        return {"models": models}
        
    except Exception as e:
        logger.error(f"Failed to list models: {e}")
        raise HTTPException(status_code=500, detail="Failed to list models")

@app.post("/models/{model_type}/deploy")
async def deploy_model(
    model_type: str,
    version: str,
    ml_service: MLService = Depends(get_ml_service)
):
    """Deploy a model version"""
    try:
        logger.info(f"Deploying model {model_type} version {version}")
        
        result = await ml_service.deploy_model(model_type, version)
        
        return {
            "model_type": model_type,
            "version": version,
            "status": "deployed",
            "deployment_info": result
        }
        
    except Exception as e:
        logger.error(f"Failed to deploy model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Data Pipeline endpoints
@app.post("/data/ingest")
async def ingest_data(
    source: str,
    data_type: str,
    background_tasks: BackgroundTasks,
    ml_service: MLService = Depends(get_ml_service)
):
    """Ingest data from various sources"""
    try:
        logger.info(f"Starting data ingestion from {source}")
        
        job_id = await ml_service.start_data_ingestion(source, data_type)
        
        return {
            "job_id": job_id,
            "source": source,
            "data_type": data_type,
            "status": "started"
        }
        
    except Exception as e:
        logger.error(f"Data ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/data/preprocess")
async def preprocess_data(
    dataset_id: str,
    preprocessing_config: Dict[str, Any],
    ml_service: MLService = Depends(get_ml_service)
):
    """Preprocess dataset"""
    try:
        logger.info(f"Starting data preprocessing for dataset: {dataset_id}")
        
        job_id = await ml_service.start_preprocessing_job(dataset_id, preprocessing_config)
        
        return {
            "job_id": job_id,
            "dataset_id": dataset_id,
            "status": "started"
        }
        
    except Exception as e:
        logger.error(f"Data preprocessing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Monitoring and Analytics endpoints
@app.get("/analytics/model-performance")
async def get_model_performance(
    model_type: str,
    start_date: str = None,
    end_date: str = None,
    ml_service: MLService = Depends(get_ml_service)
):
    """Get model performance analytics"""
    try:
        performance = await ml_service.get_model_performance(
            model_type, start_date, end_date
        )
        return performance
        
    except Exception as e:
        logger.error(f"Failed to get model performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/predictions")
async def get_prediction_analytics(
    model_type: str = None,
    start_date: str = None,
    end_date: str = None,
    ml_service: MLService = Depends(get_ml_service)
):
    """Get prediction analytics"""
    try:
        analytics = await ml_service.get_prediction_analytics(
            model_type, start_date, end_date
        )
        return analytics
        
    except Exception as e:
        logger.error(f"Failed to get prediction analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Job status endpoints
@app.get("/jobs/{job_id}/status")
async def get_job_status(
    job_id: str,
    ml_service: MLService = Depends(get_ml_service)
):
    """Get job status"""
    try:
        status = await ml_service.get_job_status(job_id)
        return status
        
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
        raise HTTPException(status_code=404, detail="Job not found")

@app.delete("/jobs/{job_id}")
async def cancel_job(
    job_id: str,
    ml_service: MLService = Depends(get_ml_service)
):
    """Cancel a running job"""
    try:
        result = await ml_service.cancel_job(job_id)
        return {"job_id": job_id, "status": "cancelled", "result": result}
        
    except Exception as e:
        logger.error(f"Failed to cancel job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(MLServiceException)
async def ml_service_exception_handler(request, exc: MLServiceException):
    logger.error(f"ML Service error: {exc}")
    return Response(
        status_code=exc.status_code,
        content={"error": exc.message, "details": exc.details}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )