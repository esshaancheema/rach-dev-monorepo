# A/B Testing Service

A comprehensive A/B testing and feature flag management service for the Zoptal platform, providing statistical analysis, user segmentation, and real-time experiment monitoring.

## Features

### Experiments
- **A/B Testing**: Classic two-variation testing with statistical significance
- **Multivariate Testing**: Test multiple variables simultaneously
- **Split URL Testing**: Test different page variations
- **Feature Flag Integration**: Gradual rollouts and kill switches

### Statistical Analysis
- **Frequentist Statistics**: Z-tests, t-tests, chi-square tests
- **Bayesian Analysis**: Posterior probability calculations
- **Sequential Testing**: Early stopping rules
- **Multiple Testing Corrections**: Bonferroni, Benjamini-Hochberg
- **Sample Size Calculations**: Power analysis and MDE calculations

### Feature Flags
- **Multi-environment Support**: Production, staging, development
- **Advanced Targeting**: User attributes, groups, custom rules
- **Gradual Rollouts**: Percentage-based incremental releases
- **Kill Switches**: Emergency flag deactivation
- **Real-time Evaluation**: Fast flag resolution with caching

### Analytics & Monitoring
- **Real-time Metrics**: Live experiment performance
- **Conversion Tracking**: Multiple goal types and funnels
- **User Segmentation**: Cohort analysis and targeting
- **Performance Monitoring**: Service health and metrics

## Quick Start

### Using Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd services/ab-testing-service

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f ab-testing-service
```

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## API Endpoints

### Experiments

```http
GET    /api/experiments           # List experiments
POST   /api/experiments           # Create experiment
GET    /api/experiments/:id       # Get experiment
PUT    /api/experiments/:id       # Update experiment
DELETE /api/experiments/:id       # Delete experiment
POST   /api/experiments/:id/start # Start experiment
POST   /api/experiments/:id/pause # Pause experiment
POST   /api/experiments/:id/stop  # Stop experiment
GET    /api/experiments/:id/results # Get results
POST   /api/experiments/:id/assign  # Assign user
POST   /api/experiments/:id/track   # Track conversion
```

### Feature Flags

```http
GET    /api/flags                 # List flags
POST   /api/flags                 # Create flag
GET    /api/flags/:id             # Get flag
PUT    /api/flags/:id             # Update flag
DELETE /api/flags/:id             # Delete flag
POST   /api/flags/:id/toggle      # Toggle flag
POST   /api/flags/evaluate/:key   # Evaluate flag
POST   /api/flags/evaluate        # Evaluate all flags
POST   /api/flags/bulk-evaluate   # Bulk evaluate
GET    /api/flags/:id/analytics   # Flag analytics
```

## Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3004

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=2
REDIS_PASSWORD=

# Security
JWT_SECRET=your-secret-key

# CORS
CORS_ORIGINS=https://app.zoptal.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000

# Feature Flags
FEATURE_FLAGS_MAX_FLAGS=5000
FEATURE_FLAGS_CACHE_TTL=3600

# Experiments
EXPERIMENTS_MAX_EXPERIMENTS=2000
METRICS_RETENTION_DAYS=365

# Logging
LOG_LEVEL=info
```

### Redis Configuration

```conf
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Architecture

### Core Services

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Experiment     │    │  Feature Flag    │    │  Statistics     │
│  Service        │    │  Service         │    │  Service        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│                                 │                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  │  Database       │    │  Cache           │    │  Logger         │
│  │  Service        │    │  Service         │    │  Service        │
│  └─────────────────┘    └──────────────────┘    └─────────────────┘
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Authentication**: JWT token validation
2. **Validation**: Request schema validation
3. **Processing**: Business logic execution
4. **Caching**: Redis-based response caching
5. **Logging**: Structured logging with metrics
6. **Response**: JSON API response

## Statistical Methods

### Frequentist Statistics

```typescript
// Two-proportion Z-test
const result = statisticsService.twoProportionZTest(
  controlConversions, controlVisitors,
  treatmentConversions, treatmentVisitors,
  0.05 // significance level
);

// Sample size calculation
const sampleSize = statisticsService.calculateSampleSize(
  0.05, // minimum detectable effect
  0.8,  // power
  0.05, // significance level
  0.1   // baseline conversion rate
);
```

### Bayesian Analysis

```typescript
// Bayesian A/B test
const bayesianResult = statisticsService.bayesianABTest(
  controlData,
  treatmentData,
  { alpha: 1, beta: 1 } // prior parameters
);

// Probability of improvement
const probability = bayesianResult.probabilityOfImprovement;
```

## Feature Flag Evaluation

### Basic Evaluation

```typescript
// Evaluate single flag
const evaluation = await featureFlagService.evaluateFlag(
  'new-checkout-flow',
  {
    id: 'user123',
    email: 'user@example.com',
    custom: { plan: 'premium' }
  },
  'production'
);

// Use the flag value
if (evaluation.value) {
  // Show new checkout flow
}
```

### Bulk Evaluation

```typescript
// Evaluate multiple flags
const evaluations = await featureFlagService.bulkEvaluate({
  user: { id: 'user123' },
  flags: ['feature-a', 'feature-b', 'feature-c'],
  environment: 'production'
});
```

### Targeting Rules

```typescript
const flag = {
  targeting: {
    enabled: true,
    rules: [
      {
        conditions: [
          {
            attribute: 'custom.plan',
            operator: 'equals',
            values: ['premium']
          }
        ],
        serve: {
          variationId: 'premium-variation'
        }
      }
    ],
    fallthrough: {
      variationId: 'default-variation'
    }
  }
};
```

## Monitoring & Observability

### Health Checks

```bash
# Service health
curl http://localhost:3004/health

# Detailed metrics
curl http://localhost:3004/metrics
```

### Prometheus Metrics

- Request latency and throughput
- Error rates and status codes
- Cache hit/miss rates
- Database query performance
- Flag evaluation counts
- Experiment assignment rates

### Logging

```typescript
// Structured logging
logger.info('Experiment started', {
  experimentId: 'exp_123',
  userId: 'user_456',
  variations: ['control', 'treatment'],
  timestamp: new Date().toISOString()
});
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "ExperimentService"
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Test with real Redis
REDIS_URL=redis://localhost:6379 npm run test:integration
```

### Load Testing

```bash
# Install k6
brew install k6

# Run load tests
k6 run tests/load/experiment-creation.js
k6 run tests/load/flag-evaluation.js
```

## Deployment

### Kubernetes

```bash
# Apply production configuration
kubectl apply -f k8s/production/ab-testing-service.yaml

# Check deployment status
kubectl get pods -n zoptal -l app=ab-testing-service

# View logs
kubectl logs -n zoptal -l app=ab-testing-service -f
```

### Docker

```bash
# Build image
docker build -t zoptal/ab-testing-service:latest .

# Run container
docker run -d \
  --name ab-testing-service \
  -p 3004:3004 \
  -e REDIS_URL=redis://host.docker.internal:6379 \
  zoptal/ab-testing-service:latest
```

## Security

### Authentication

- JWT token validation
- API key support for SDK integrations
- Role-based access control (RBAC)
- Organization-based isolation

### Input Validation

- Request schema validation
- SQL injection prevention
- XSS protection
- Rate limiting

### Data Protection

- Sensitive data encryption
- PII anonymization
- GDPR compliance features
- Audit logging

## Performance

### Caching Strategy

- Redis-based response caching
- Flag evaluation caching
- Database query caching
- CDN integration for static assets

### Optimization

- Connection pooling
- Query optimization
- Batch processing
- Background job processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Code Style

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

## License

Copyright (c) 2024 Zoptal. All rights reserved.

## Support

- Documentation: https://docs.zoptal.com/ab-testing
- API Reference: https://ab-testing.zoptal.com/api/docs
- Support: support@zoptal.com
- Issues: GitHub Issues