# Performance Testing Suite

This directory contains comprehensive performance and load testing for the Zoptal platform using K6 and Artillery.

## Test Structure

```
tests/performance/
├── k6/                         # K6 performance tests
│   ├── scenarios/             # Test scenarios
│   ├── utils/                 # K6 utilities and helpers
│   └── configs/               # K6 configuration files
├── artillery/                 # Artillery load tests
│   ├── scenarios/             # Artillery test scenarios
│   ├── processors/            # Custom processors
│   └── configs/               # Artillery configuration files
├── results/                   # Test results and reports
├── scripts/                   # Test execution scripts
└── docker/                    # Docker setup for testing
```

## Testing Tools

### K6 (JavaScript-based)
- **Best for**: API performance testing, complex scenarios, custom metrics
- **Strengths**: Excellent for CI/CD integration, detailed metrics, developer-friendly
- **Use cases**: API endpoint testing, authentication flows, complex business logic

### Artillery (Node.js-based)
- **Best for**: High-scale load testing, WebSocket testing, real-time features
- **Strengths**: Excellent WebSocket support, plugin ecosystem, realistic load patterns
- **Use cases**: WebSocket load testing, file uploads, real-time collaboration

## Test Categories

### 1. API Performance Tests
- Individual endpoint performance
- Authentication and authorization overhead
- Database query performance
- Cache hit/miss ratios

### 2. Load Testing
- Concurrent user simulation
- Gradual load increase (ramp-up)
- Sustained load testing
- Peak load testing

### 3. Stress Testing
- System breaking point identification
- Resource exhaustion scenarios
- Recovery testing
- Failover behavior

### 4. Real-time Feature Testing
- WebSocket connection load
- Real-time collaboration performance
- Event streaming performance
- Notification delivery performance

## Running Tests

```bash
# Install dependencies
npm install

# Run K6 tests
npm run test:k6:api
npm run test:k6:load
npm run test:k6:stress

# Run Artillery tests
npm run test:artillery:load
npm run test:artillery:websocket
npm run test:artillery:realtime

# Run all performance tests
npm run test:performance:all

# Generate performance report
npm run report:performance
```

## Test Environment

Performance tests can run against:
- Local development environment
- Staging environment
- Load testing environment
- Production (with caution and proper controls)

## Metrics and Reporting

### Key Performance Indicators (KPIs)
- **Response Time**: P50, P95, P99 percentiles
- **Throughput**: Requests per second (RPS)
- **Error Rate**: Percentage of failed requests
- **Concurrency**: Active virtual users
- **Resource Usage**: CPU, Memory, Database connections

### Reports Generated
- HTML performance reports
- CSV data exports
- Grafana dashboards
- CI/CD integration reports
- Trend analysis over time

## Configuration

Tests use environment-specific configuration:
- `development.json` - Local testing
- `staging.json` - Staging environment
- `production.json` - Production load testing
- `ci.json` - CI/CD pipeline testing