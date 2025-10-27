# Zoptal ML Pipeline Service

A comprehensive Machine Learning pipeline service for predictive analytics, featuring automated model training, deployment, and monitoring capabilities.

## Features

### 🤖 Machine Learning Models
- **User Behavior Prediction**: Predict user churn, engagement levels, and next activities
- **Project Success Prediction**: Estimate project completion probability and timeline
- **Resource Usage Forecasting**: Predict future CPU, memory, and storage requirements
- **Anomaly Detection**: Detect unusual patterns in system behavior
- **Recommendation Engine**: Personalized content and feature recommendations

### 🔄 MLOps Capabilities
- **Automated Model Training**: Background training jobs with hyperparameter optimization
- **Model Versioning**: Complete model lifecycle management
- **A/B Testing**: Model comparison and gradual rollout
- **Performance Monitoring**: Real-time model performance tracking
- **Data Drift Detection**: Automatic detection of data distribution changes

### 📊 Data Pipeline
- **Multi-source Ingestion**: Support for databases, APIs, and file systems
- **Feature Engineering**: Automated feature extraction and transformation
- **Data Validation**: Comprehensive data quality checks
- **Feature Store**: Centralized feature management and sharing

### 🔍 Monitoring & Observability
- **Prometheus Metrics**: Comprehensive performance and business metrics
- **Structured Logging**: Detailed execution logs with correlation IDs
- **Health Checks**: Application and dependency health monitoring
- **Alerting**: Automated alerts for model degradation and system issues

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI       │    │   ML Service    │    │   Data Pipeline │
│   Web Server    │◄──►│   Core Logic    │◄──►│   Ingestion     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Model Store   │    │   Redis Cache   │    │   PostgreSQL    │
│   (File System) │    │   & Queue       │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Development Setup

1. **Clone and Setup**:
```bash
git clone https://github.com/zoptal/ml-pipeline.git
cd ml-pipeline
```

2. **Start with Docker Compose**:
```bash
docker-compose up -d
```

3. **Access Services**:
- ML Pipeline API: http://localhost:8080
- API Documentation: http://localhost:8080/docs
- MLflow UI: http://localhost:5000
- Grafana Dashboard: http://localhost:3001 (admin/admin123)
- Jupyter Notebooks: http://localhost:8888 (token: ml-pipeline-jupyter)
- Celery Flower: http://localhost:5555

### Production Deployment

1. **Deploy to Kubernetes**:
```bash
kubectl apply -f k8s/deployment.yaml
```

2. **Configure Secrets**:
```bash
kubectl create secret generic ml-pipeline-secrets \
  --from-literal=database-url="postgresql://user:pass@host:5432/db" \
  --from-literal=redis-url="redis://host:6379/1"
```

## API Usage

### User Behavior Prediction

```python
import requests

response = requests.post("http://localhost:8080/predict/user-behavior", json={
    "user_id": "user_123",
    "features": {
        "activity_score": 0.8,
        "project_count": 5,
        "collaboration_score": 0.6,
        "ai_usage_frequency": 0.7
    },
    "model_version": "v1.2.0"
})

print(response.json())
# {
#   "prediction_id": "pred_789",
#   "predictions": {
#     "churn_probability": 0.15,
#     "engagement_level": "high",
#     "next_activity": "code_generation"
#   },
#   "confidence_scores": {
#     "churn_probability": 0.85,
#     "engagement_level": 0.91,
#     "next_activity": 0.72
#   }
# }
```

### Project Success Prediction

```python
response = requests.post("http://localhost:8080/predict/project-success", json={
    "project_id": "proj_456",
    "features": {
        "complexity_score": 0.7,
        "team_size": 3,
        "duration_estimate": 45,
        "technology_maturity": 0.8
    }
})

print(response.json())
# {
#   "predictions": {
#     "success_probability": 0.82,
#     "completion_time_estimate": 38,
#     "risk_factors": ["no_major_risks"],
#     "recommendations": ["project_looks_good"]
#   }
# }
```

### Resource Usage Forecasting

```python
response = requests.post("http://localhost:8080/predict/resource-usage", json={
    "features": {
        "current_cpu": 0.65,
        "current_memory": 0.72,
        "current_storage": 0.45,
        "user_count": 150,
        "trend": 0.02
    },
    "forecast_horizon": 30
})

print(response.json())
# {
#   "predictions": {
#     "cpu_usage_forecast": [0.67, 0.69, 0.71, ...],
#     "memory_usage_forecast": [0.74, 0.76, 0.78, ...],
#     "scaling_recommendations": ["current_scaling_adequate"]
#   }
# }
```

### Anomaly Detection

```python
response = requests.post("http://localhost:8080/predict/anomaly-detection", json={
    "features": {
        "cpu_usage": 0.95,
        "memory_usage": 0.88,
        "request_rate": 1500,
        "error_rate": 0.15
    },
    "threshold": 0.5
})

print(response.json())
# {
#   "predictions": {
#     "is_anomaly": true,
#     "anomaly_score": -1.8,
#     "anomaly_type": "cpu_spike",
#     "severity": "high",
#     "recommendations": ["investigate_immediately", "scale_cpu_resources"]
#   }
# }
```

## Model Training

### Start Training Job

```python
response = requests.post("http://localhost:8080/models/train", json={
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
    "cross_validation": True
})

job_id = response.json()["job_id"]
```

### Check Training Status

```python
response = requests.get(f"http://localhost:8080/jobs/{job_id}/status")
print(response.json())
# {
#   "job_id": "job_123",
#   "status": "running",
#   "progress": 0.65,
#   "created_at": "2024-06-01T10:00:00Z"
# }
```

### Deploy Trained Model

```python
response = requests.post("http://localhost:8080/models/user_behavior/deploy", json={
    "version": "v1.3.0"
})
```

## Data Pipeline

### Data Ingestion

```python
response = requests.post("http://localhost:8080/data/ingest", json={
    "source": "postgresql://user:pass@host:5432/db",
    "data_type": "user_events"
})

job_id = response.json()["job_id"]
```

### Data Preprocessing

```python
response = requests.post("http://localhost:8080/data/preprocess", json={
    "dataset_id": "dataset_123",
    "preprocessing_config": {
        "normalize": True,
        "handle_missing": "median",
        "feature_scaling": "standard"
    }
})
```

## Monitoring

### Model Performance

```python
response = requests.get("http://localhost:8080/analytics/model-performance", params={
    "model_type": "user_behavior",
    "start_date": "2024-06-01",
    "end_date": "2024-06-30"
})
```

### Prediction Analytics

```python
response = requests.get("http://localhost:8080/analytics/predictions", params={
    "model_type": "user_behavior",
    "start_date": "2024-06-01"
})
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `MODEL_STORAGE_PATH` | Path for model files | `/app/models` |
| `MAX_TRAINING_TIME` | Max training time (seconds) | `3600` |
| `MAX_CONCURRENT_JOBS` | Max parallel training jobs | `5` |
| `PREDICTION_CACHE_TTL` | Prediction cache TTL (seconds) | `300` |
| `AUTO_ML_ENABLED` | Enable AutoML features | `true` |
| `GPU_ENABLED` | Enable GPU acceleration | `false` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Model Configuration

```python
# models/config.yaml
user_behavior:
  algorithm: "random_forest"
  hyperparameters:
    n_estimators: 100
    max_depth: 10
    min_samples_split: 2
  features:
    - activity_score
    - project_count
    - collaboration_score
    - ai_usage_frequency
  target: churn_flag
```

## Development

### Local Development

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run Database Migrations**:
```bash
alembic upgrade head
```

3. **Start Development Server**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

4. **Run Celery Worker**:
```bash
celery -A src.ml_service.celery_app worker --loglevel=info
```

### Testing

```bash
# Run unit tests
pytest tests/unit/

# Run integration tests
pytest tests/integration/

# Run load tests
pytest tests/load/

# Generate coverage report
pytest --cov=src tests/
```

### Model Development

Use the included Jupyter environment for model experimentation:

```bash
# Access Jupyter
open http://localhost:8888

# Develop models in notebooks/
- data_exploration.ipynb
- model_training.ipynb
- model_evaluation.ipynb
```

## Performance

### Benchmarks

- **Prediction Latency**: < 100ms (p95)
- **Training Throughput**: 10+ concurrent jobs
- **Data Ingestion**: 1M+ records/hour
- **Model Accuracy**: 85%+ across all models

### Scaling

- **Horizontal Scaling**: Auto-scaling based on CPU/memory
- **GPU Acceleration**: Automatic GPU detection and usage
- **Caching**: Redis-based prediction caching
- **Load Balancing**: Kubernetes service mesh integration

## Security

- **Authentication**: JWT-based API authentication
- **Authorization**: Role-based access control
- **Data Privacy**: Encrypted data at rest and in transit
- **Audit Logging**: Complete audit trail for all operations
- **Network Security**: Service mesh with mTLS

## Troubleshooting

### Common Issues

1. **High Memory Usage**:
   - Reduce batch sizes
   - Enable model quantization
   - Increase memory limits

2. **Slow Predictions**:
   - Enable prediction caching
   - Use model optimization
   - Scale horizontally

3. **Training Failures**:
   - Check data quality
   - Adjust hyperparameters
   - Increase resource limits

### Debugging

```bash
# Check logs
kubectl logs -f deployment/ml-pipeline -n zoptal-production

# Monitor metrics
curl http://localhost:8080/metrics

# Health check
curl http://localhost:8080/health
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: https://docs.zoptal.com/ml-pipeline
- Issues: https://github.com/zoptal/ml-pipeline/issues
- Slack: #ml-pipeline channel