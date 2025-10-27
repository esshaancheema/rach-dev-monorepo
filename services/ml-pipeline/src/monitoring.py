import structlog
import logging
import sys
from datetime import datetime
from typing import Any, Dict
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from prometheus_client import Counter, Histogram, Gauge, start_http_server
from .config import settings

# Configure structured logging
def configure_logging():
    """Configure structured logging with structlog"""
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper()),
    )
    
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=False,
    )
    
    return structlog.get_logger("ml-pipeline")

# Create logger instance
logger = configure_logging()

# Prometheus metrics
ml_predictions_total = Counter(
    'ml_predictions_total',
    'Total number of ML predictions made',
    ['model_type', 'status']
)

ml_prediction_duration = Histogram(
    'ml_prediction_duration_seconds',
    'Time spent making ML predictions',
    ['model_type']
)

ml_training_jobs_total = Counter(
    'ml_training_jobs_total',
    'Total number of ML training jobs',
    ['model_type', 'status']
)

ml_training_duration = Histogram(
    'ml_training_duration_seconds',
    'Time spent training ML models',
    ['model_type']
)

ml_model_performance = Gauge(
    'ml_model_performance',
    'Current ML model performance metrics',
    ['model_type', 'metric', 'version']
)

ml_data_ingestion_records = Counter(
    'ml_data_ingestion_records_total',
    'Total number of records ingested',
    ['source', 'data_type', 'status']
)

ml_feature_extraction_duration = Histogram(
    'ml_feature_extraction_duration_seconds',
    'Time spent extracting features',
    ['feature_type']
)

ml_anomaly_detection_alerts = Counter(
    'ml_anomaly_detection_alerts_total',
    'Total number of anomaly detection alerts',
    ['severity', 'anomaly_type']
)

ml_resource_usage = Gauge(
    'ml_resource_usage',
    'Current ML service resource usage',
    ['resource_type']
)

ml_cache_hits = Counter(
    'ml_cache_hits_total',
    'Total number of ML cache hits',
    ['cache_type']
)

ml_cache_misses = Counter(
    'ml_cache_misses_total',
    'Total number of ML cache misses',
    ['cache_type']
)

def setup_monitoring():
    """Setup monitoring and observability"""
    
    # Setup OpenTelemetry tracing
    trace.set_tracer_provider(TracerProvider())
    tracer = trace.get_tracer(__name__)
    
    # Setup OpenTelemetry metrics
    prometheus_reader = PrometheusMetricReader()
    metrics.set_meter_provider(MeterProvider(metric_readers=[prometheus_reader]))
    
    # Start Prometheus metrics server
    start_http_server(settings.PROMETHEUS_PORT)
    
    logger.info(
        "Monitoring setup completed",
        prometheus_port=settings.PROMETHEUS_PORT,
        log_level=settings.LOG_LEVEL
    )
    
    return tracer

class MLMetrics:
    """ML-specific metrics collector"""
    
    def __init__(self):
        self.tracer = trace.get_tracer(__name__)
        self.meter = metrics.get_meter(__name__)
        
    def record_prediction(self, model_type: str, duration: float, status: str = "success"):
        """Record prediction metrics"""
        ml_predictions_total.labels(model_type=model_type, status=status).inc()
        ml_prediction_duration.labels(model_type=model_type).observe(duration)
        
        logger.info(
            "Prediction recorded",
            model_type=model_type,
            duration=duration,
            status=status
        )
    
    def record_training_job(self, model_type: str, duration: float, status: str):
        """Record training job metrics"""
        ml_training_jobs_total.labels(model_type=model_type, status=status).inc()
        
        if status == "completed":
            ml_training_duration.labels(model_type=model_type).observe(duration)
        
        logger.info(
            "Training job recorded",
            model_type=model_type,
            duration=duration,
            status=status
        )
    
    def update_model_performance(self, model_type: str, version: str, metrics: Dict[str, float]):
        """Update model performance metrics"""
        for metric_name, value in metrics.items():
            ml_model_performance.labels(
                model_type=model_type,
                metric=metric_name,
                version=version
            ).set(value)
        
        logger.info(
            "Model performance updated",
            model_type=model_type,
            version=version,
            metrics=metrics
        )
    
    def record_data_ingestion(self, source: str, data_type: str, records: int, status: str):
        """Record data ingestion metrics"""
        ml_data_ingestion_records.labels(
            source=source,
            data_type=data_type,
            status=status
        ).inc(records)
        
        logger.info(
            "Data ingestion recorded",
            source=source,
            data_type=data_type,
            records=records,
            status=status
        )
    
    def record_feature_extraction(self, feature_type: str, duration: float):
        """Record feature extraction metrics"""
        ml_feature_extraction_duration.labels(feature_type=feature_type).observe(duration)
        
        logger.info(
            "Feature extraction recorded",
            feature_type=feature_type,
            duration=duration
        )
    
    def record_anomaly_alert(self, severity: str, anomaly_type: str):
        """Record anomaly detection alert"""
        ml_anomaly_detection_alerts.labels(
            severity=severity,
            anomaly_type=anomaly_type
        ).inc()
        
        logger.warning(
            "Anomaly detected",
            severity=severity,
            anomaly_type=anomaly_type
        )
    
    def update_resource_usage(self, resource_type: str, usage: float):
        """Update resource usage metrics"""
        ml_resource_usage.labels(resource_type=resource_type).set(usage)
        
        logger.debug(
            "Resource usage updated",
            resource_type=resource_type,
            usage=usage
        )
    
    def record_cache_hit(self, cache_type: str):
        """Record cache hit"""
        ml_cache_hits.labels(cache_type=cache_type).inc()
    
    def record_cache_miss(self, cache_type: str):
        """Record cache miss"""
        ml_cache_misses.labels(cache_type=cache_type).inc()

# Create metrics instance
ml_metrics = MLMetrics()

class MLLogger:
    """ML-specific structured logger"""
    
    def __init__(self):
        self.logger = logger
    
    def log_prediction_request(self, model_type: str, features: Dict[str, Any], user_id: str = None, project_id: str = None):
        """Log prediction request"""
        self.logger.info(
            "Prediction request received",
            event_type="prediction_request",
            model_type=model_type,
            user_id=user_id,
            project_id=project_id,
            feature_count=len(features)
        )
    
    def log_prediction_response(self, prediction_id: str, model_type: str, confidence: float, duration: float):
        """Log prediction response"""
        self.logger.info(
            "Prediction completed",
            event_type="prediction_response",
            prediction_id=prediction_id,
            model_type=model_type,
            confidence=confidence,
            duration=duration
        )
    
    def log_training_start(self, job_id: str, model_type: str, training_config: Dict[str, Any]):
        """Log training job start"""
        self.logger.info(
            "Model training started",
            event_type="training_start",
            job_id=job_id,
            model_type=model_type,
            training_config=training_config
        )
    
    def log_training_progress(self, job_id: str, model_type: str, progress: float, metrics: Dict[str, float] = None):
        """Log training progress"""
        self.logger.info(
            "Training progress update",
            event_type="training_progress",
            job_id=job_id,
            model_type=model_type,
            progress=progress,
            metrics=metrics or {}
        )
    
    def log_training_completion(self, job_id: str, model_type: str, final_metrics: Dict[str, float], duration: float):
        """Log training completion"""
        self.logger.info(
            "Model training completed",
            event_type="training_completion",
            job_id=job_id,
            model_type=model_type,
            final_metrics=final_metrics,
            duration=duration
        )
    
    def log_model_deployment(self, model_type: str, version: str, performance_metrics: Dict[str, float]):
        """Log model deployment"""
        self.logger.info(
            "Model deployed",
            event_type="model_deployment",
            model_type=model_type,
            version=version,
            performance_metrics=performance_metrics
        )
    
    def log_data_ingestion(self, source: str, data_type: str, records_processed: int, duration: float):
        """Log data ingestion"""
        self.logger.info(
            "Data ingestion completed",
            event_type="data_ingestion",
            source=source,
            data_type=data_type,
            records_processed=records_processed,
            duration=duration
        )
    
    def log_anomaly_detection(self, anomaly_type: str, severity: str, details: Dict[str, Any]):
        """Log anomaly detection"""
        self.logger.warning(
            "Anomaly detected",
            event_type="anomaly_detection",
            anomaly_type=anomaly_type,
            severity=severity,
            details=details
        )
    
    def log_error(self, error_type: str, error_message: str, context: Dict[str, Any] = None):
        """Log errors"""
        self.logger.error(
            "ML service error",
            event_type="error",
            error_type=error_type,
            error_message=error_message,
            context=context or {}
        )
    
    def log_performance_degradation(self, model_type: str, metric: str, current_value: float, threshold: float):
        """Log model performance degradation"""
        self.logger.warning(
            "Model performance degradation detected",
            event_type="performance_degradation",
            model_type=model_type,
            metric=metric,
            current_value=current_value,
            threshold=threshold
        )

# Create ML logger instance
ml_logger = MLLogger()

def create_span(name: str, attributes: Dict[str, Any] = None):
    """Create a tracing span"""
    tracer = trace.get_tracer(__name__)
    span = tracer.start_span(name)
    
    if attributes:
        for key, value in attributes.items():
            span.set_attribute(key, value)
    
    return span

class PerformanceMonitor:
    """Monitor ML model performance and detect drift"""
    
    def __init__(self):
        self.performance_thresholds = {
            "accuracy": 0.8,
            "precision": 0.75,
            "recall": 0.75,
            "f1_score": 0.75
        }
        self.drift_thresholds = {
            "feature_drift": 0.1,
            "concept_drift": 0.15
        }
    
    def check_model_performance(self, model_type: str, current_metrics: Dict[str, float]) -> Dict[str, Any]:
        """Check if model performance meets thresholds"""
        alerts = []
        status = "healthy"
        
        for metric, value in current_metrics.items():
            threshold = self.performance_thresholds.get(metric)
            if threshold and value < threshold:
                alerts.append({
                    "type": "performance_degradation",
                    "metric": metric,
                    "current_value": value,
                    "threshold": threshold,
                    "severity": "high" if value < threshold * 0.9 else "medium"
                })
                status = "degraded"
                
                # Log the degradation
                ml_logger.log_performance_degradation(model_type, metric, value, threshold)
        
        return {
            "status": status,
            "alerts": alerts,
            "checked_at": datetime.utcnow().isoformat()
        }
    
    def detect_data_drift(self, model_type: str, feature_statistics: Dict[str, Any]) -> Dict[str, Any]:
        """Detect data drift in model features"""
        drift_detected = False
        drift_details = {}
        
        # Simplified drift detection logic
        for feature, stats in feature_statistics.items():
            drift_score = stats.get("drift_score", 0.0)
            if drift_score > self.drift_thresholds["feature_drift"]:
                drift_detected = True
                drift_details[feature] = {
                    "drift_score": drift_score,
                    "threshold": self.drift_thresholds["feature_drift"]
                }
        
        if drift_detected:
            ml_logger.log_error(
                "data_drift",
                f"Data drift detected for model {model_type}",
                {"drift_details": drift_details}
            )
        
        return {
            "drift_detected": drift_detected,
            "drift_details": drift_details,
            "checked_at": datetime.utcnow().isoformat()
        }

# Create performance monitor instance
performance_monitor = PerformanceMonitor()