# Performance Testing Guide

This guide provides comprehensive instructions for conducting performance testing on the Zoptal Authentication Service using K6.

## Overview

The Zoptal Auth Service includes automated performance testing tools to ensure the system can handle expected load, identify performance bottlenecks, and verify scalability requirements. This guide covers:

- Performance testing methodologies
- K6 test execution
- Performance analysis and interpretation
- Optimization strategies
- CI/CD integration

## Performance Testing Tools

### K6 Test Scripts

The performance testing suite includes several specialized K6 scripts:

1. **k6-load-test.js** - Comprehensive load testing with multiple scenarios
2. **k6-stress-test.js** - Stress testing to find system limits
3. **k6-config.js** - Configuration and utilities for all tests
4. **run-performance-tests.sh** - Orchestration script for test execution

### Test Types

#### 1. Smoke Test
**Purpose**: Verify basic functionality with minimal load
```bash
./scripts/performance/run-performance-tests.sh smoke
```
- **Duration**: 1 minute
- **Virtual Users**: 5
- **Focus**: Basic functionality validation

#### 2. Load Test
**Purpose**: Test system under normal expected load
```bash
./scripts/performance/run-performance-tests.sh load --vus 50 --duration 5m
```
- **Duration**: 5 minutes
- **Virtual Users**: 50
- **Focus**: Normal operational capacity

#### 3. Stress Test
**Purpose**: Test system beyond normal capacity
```bash
./scripts/performance/run-performance-tests.sh stress --vus 100 --duration 10m
```
- **Duration**: 10 minutes
- **Virtual Users**: 100+
- **Focus**: Find breaking points and system limits

#### 4. Spike Test
**Purpose**: Test system response to sudden load increases
```bash
./scripts/performance/run-performance-tests.sh spike
```
- **Pattern**: Gradual → Sudden spike → Return to normal
- **Focus**: System resilience and recovery

#### 5. Volume Test
**Purpose**: Test system with large amounts of data
```bash
./scripts/performance/run-performance-tests.sh volume --duration 15m
```
- **Duration**: 15 minutes
- **Focus**: Data processing capacity

#### 6. Endurance Test
**Purpose**: Test system stability over extended periods
```bash
./scripts/performance/run-performance-tests.sh endurance --duration 30m
```
- **Duration**: 30+ minutes
- **Focus**: Memory leaks, resource cleanup

## Installation and Setup

### Prerequisites

1. **Install K6**
```bash
# On macOS
brew install k6

# On Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

2. **Verify Installation**
```bash
k6 version
```

### Environment Setup

1. **Start the Auth Service**
```bash
cd services/auth-service
npm run dev
```

2. **Verify Service Health**
```bash
curl http://localhost:3000/health
```

## Running Performance Tests

### Using the Test Runner Script

The `run-performance-tests.sh` script provides a comprehensive interface for executing performance tests:

```bash
# Basic usage
./scripts/performance/run-performance-tests.sh [TEST_TYPE] [OPTIONS]

# Examples
./scripts/performance/run-performance-tests.sh load
./scripts/performance/run-performance-tests.sh stress --vus 200 --duration 10m
./scripts/performance/run-performance-tests.sh spike --env staging
```

### Script Options

```bash
Options:
  -e, --env ENV          Environment (local, dev, staging, prod)
  -p, --profile PROFILE  Test profile
  -u, --url URL          API base URL
  -d, --duration TIME    Test duration
  -v, --vus NUMBER       Virtual users
  -r, --rps NUMBER       Target requests per second
  -t, --tag TAG          Add custom tag to test run
  -w, --warmup TIME      Warmup duration before test
  -s, --setup            Run setup phase (create test data)
  -k, --keep-data        Keep test data after completion
  -q, --quiet            Quiet mode (minimal output)
```

### Direct K6 Execution

You can also run K6 tests directly:

```bash
# Load test
k6 run \
  --vus 50 \
  --duration 5m \
  -e API_URL=http://localhost:3000 \
  scripts/performance/k6-load-test.js

# Stress test
k6 run \
  -e API_URL=http://localhost:3000 \
  -e STRESS_LEVEL=high \
  scripts/performance/k6-stress-test.js
```

## Test Configuration

### Environment Configurations

```javascript
// Available in k6-config.js
const ENVIRONMENTS = {
  local: {
    baseUrl: 'http://localhost:3000',
    maxUsers: 50,
    testDuration: '2m'
  },
  staging: {
    baseUrl: 'https://staging-auth.zoptal.com',
    maxUsers: 200,
    testDuration: '10m'
  }
  // ... more environments
};
```

### Test Profiles

```javascript
const TEST_PROFILES = {
  smoke: {
    vus: 5,
    duration: '1m',
    thresholds: {
      http_req_duration: ['p(95)<500'],
      http_req_failed: ['rate<0.01']
    }
  },
  load: {
    vus: 50,
    duration: '5m',
    thresholds: {
      http_req_duration: ['p(95)<1000'],
      http_req_failed: ['rate<0.05']
    }
  }
  // ... more profiles
};
```

### Custom Configuration

Create custom test configurations by modifying the environment variables:

```bash
export API_URL=https://your-custom-url.com
export MAX_VUS=100
export TEST_DURATION=10m
export STRESS_LEVEL=extreme
```

## Performance Metrics

### Key Metrics Tracked

1. **Response Time Metrics**
   - Average response time
   - 95th percentile response time
   - 99th percentile response time
   - Maximum response time

2. **Throughput Metrics**
   - Requests per second (RPS)
   - Total requests completed
   - Request success rate

3. **Error Metrics**
   - HTTP error rate
   - Authentication success rate
   - API error rate

4. **System Metrics**
   - Memory usage
   - CPU usage
   - Active connections
   - System stability

### Performance Thresholds

#### Authentication Endpoints
```javascript
const AUTH_THRESHOLDS = {
  '/api/auth/login': {
    p95: 500,    // 95th percentile < 500ms
    p99: 1000,   // 99th percentile < 1000ms
    errorRate: 0.01  // Error rate < 1%
  },
  '/api/auth/register': {
    p95: 800,
    p99: 1500,
    errorRate: 0.02
  }
};
```

#### User Management Endpoints
```javascript
const USER_THRESHOLDS = {
  '/api/users/profile': {
    p95: 300,
    p99: 600,
    errorRate: 0.02
  },
  '/api/users/export': {
    p95: 3000,   // Data export takes longer
    p99: 5000,
    errorRate: 0.05
  }
};
```

## Analyzing Results

### Report Generation

Performance tests automatically generate multiple report formats:

1. **HTML Report** - Interactive visual report
2. **JSON Results** - Machine-readable metrics
3. **Text Summary** - Human-readable summary

### Report Location

Reports are saved in timestamped directories:
```
performance-reports/
├── test_load_20240127_143022/
│   ├── performance-report.html
│   ├── performance-results.json
│   ├── performance-summary.txt
│   └── test-metadata.json
```

### Key Analysis Points

#### 1. Response Time Analysis
```javascript
// Check 95th percentile response times
const p95 = results.metrics.http_req_duration['p(95)'];
if (p95 > 1000) {
  console.log('⚠️ High response times detected');
}
```

#### 2. Error Rate Analysis
```javascript
// Check error rates
const errorRate = results.metrics.http_req_failed.rate;
if (errorRate > 0.05) {
  console.log('⚠️ High error rate detected');
}
```

#### 3. Throughput Analysis
```javascript
// Check requests per second
const rps = results.metrics.http_reqs.rate;
console.log(`Throughput: ${rps} RPS`);
```

### Performance Baselines

#### Expected Performance Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Login Response Time (p95) | < 500ms | > 1s | > 2s |
| Registration Response Time (p95) | < 800ms | > 1.5s | > 3s |
| Profile Fetch (p95) | < 300ms | > 600ms | > 1s |
| Error Rate | < 1% | > 2% | > 5% |
| Throughput (Login) | > 100 RPS | < 50 RPS | < 20 RPS |

## Load Patterns and User Behaviors

### Business Hours Pattern
```javascript
const businessHours = {
  stages: [
    { duration: '30s', target: 5 },   // Early morning
    { duration: '2m', target: 20 },   // Morning ramp-up
    { duration: '3m', target: 50 },   // Peak morning
    { duration: '2m', target: 30 },   // Mid-day drop
    { duration: '3m', target: 60 },   // Afternoon peak
    { duration: '2m', target: 20 },   // Evening drop
    { duration: '30s', target: 0 }    // Night
  ]
};
```

### User Behavior Simulation
```javascript
const regularUserFlow = {
  actions: [
    { endpoint: '/api/auth/login', weight: 1, pause: 1 },
    { endpoint: '/api/users/profile', weight: 0.8, pause: 2 },
    { endpoint: '/api/users/preferences', weight: 0.5, pause: 3 },
    { endpoint: '/api/auth/logout', weight: 0.9, pause: 1 }
  ]
};
```

## Optimization Strategies

### 1. Database Optimization

**Connection Pooling**
```javascript
// Optimize database connections
const dbConfig = {
  maxConnections: 20,
  idleTimeout: 30000,
  connectionTimeout: 5000
};
```

**Query Optimization**
- Add database indexes for frequently queried fields
- Optimize complex queries
- Use query result caching

### 2. API Optimization

**Response Caching**
```javascript
// Cache frequently accessed data
app.register(cache, {
  ttl: 300, // 5 minutes
  exclude: ['/api/auth/login', '/api/auth/register']
});
```

**Compression**
```javascript
// Enable response compression
app.register(compress, {
  encodings: ['gzip', 'deflate']
});
```

### 3. Authentication Optimization

**JWT Configuration**
```javascript
// Optimize JWT settings
const jwtConfig = {
  algorithm: 'HS256', // Fast symmetric algorithm
  expiresIn: '15m',   // Short-lived tokens
  issuer: 'zoptal-auth'
};
```

**Session Management**
```javascript
// Optimize session storage
const sessionConfig = {
  store: 'redis',     // Fast session storage
  ttl: 900,          // 15 minutes
  touchInterval: 300  // Update every 5 minutes
};
```

### 4. Rate Limiting Optimization

**Intelligent Rate Limiting**
```javascript
const rateLimitConfig = {
  global: { max: 1000, window: '1m' },
  login: { max: 5, window: '1m' },
  register: { max: 3, window: '5m' }
};
```

## CI/CD Integration

### GitHub Actions Workflow

The performance tests are integrated into the CI/CD pipeline:

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests

on:
  push:
    branches: [ main, develop ]
  schedule:
    - cron: '0 3 * * *'  # Nightly tests
```

### Manual Workflow Dispatch

Trigger performance tests manually:

1. Go to GitHub Actions tab
2. Select "Performance Tests" workflow
3. Click "Run workflow"
4. Choose test type, environment, and parameters

### Performance Gates

The CI/CD pipeline includes performance gates:

```yaml
- name: Performance regression check
  run: |
    ERROR_RATE=$(cat results.json | jq '.metrics.http_req_failed.rate')
    if (( $(echo "$ERROR_RATE > 0.1" | bc -l) )); then
      echo "❌ Performance regression detected"
      exit 1
    fi
```

## Monitoring and Alerting

### Real-time Monitoring

Performance tests can be integrated with monitoring systems:

```javascript
// Send metrics to monitoring system
const sendMetrics = (metrics) => {
  // Send to InfluxDB, Grafana, etc.
  influxdb.writePoints([
    {
      measurement: 'performance_test',
      fields: {
        response_time_p95: metrics.http_req_duration['p(95)'],
        error_rate: metrics.http_req_failed.rate,
        throughput: metrics.http_reqs.rate
      },
      timestamp: new Date()
    }
  ]);
};
```

### Performance Alerts

Set up alerts for performance degradation:

```javascript
const ALERT_THRESHOLDS = {
  critical: {
    error_rate: 0.1,
    response_time_p95: 5000,
    memory_usage: 2000 // MB
  },
  warning: {
    error_rate: 0.05,
    response_time_p95: 2000,
    memory_usage: 1000 // MB
  }
};
```

## Troubleshooting

### Common Issues

#### 1. High Response Times

**Symptoms**: 95th percentile > 2 seconds
**Possible Causes**:
- Database connection pool exhaustion
- Unoptimized queries
- Memory pressure
- CPU bottlenecks

**Investigation**:
```bash
# Check database connections
curl http://localhost:3000/metrics | grep database

# Check memory usage
curl http://localhost:3000/metrics | grep memory

# Review slow queries
tail -f logs/app.log | grep "slow query"
```

#### 2. High Error Rates

**Symptoms**: Error rate > 5%
**Possible Causes**:
- Database timeouts
- Authentication failures
- Rate limiting triggered
- Service dependencies down

**Investigation**:
```bash
# Check error logs
tail -f logs/error.log

# Check rate limiting
curl http://localhost:3000/api/admin/rate-limits/status

# Check circuit breaker status
curl http://localhost:3000/circuit-breaker/status
```

#### 3. Low Throughput

**Symptoms**: RPS < 20
**Possible Causes**:
- Resource contention
- Blocking operations
- Inefficient algorithms
- Network bottlenecks

**Investigation**:
```bash
# Check system resources
top -p $(pgrep node)

# Check network connectivity
ping -c 5 localhost

# Check application metrics
curl http://localhost:3000/metrics
```

### Performance Debugging

#### 1. Enable Detailed Logging

```javascript
// Temporarily enable debug logging
const config = {
  LOG_LEVEL: 'debug',
  ENABLE_REQUEST_LOGGING: true,
  ENABLE_PERFORMANCE_LOGGING: true
};
```

#### 2. Use Profiling Tools

```bash
# Use Node.js profiler
node --prof src/app.js

# Use clinic.js for detailed analysis
npm install -g clinic
clinic doctor -- node src/app.js
```

#### 3. Monitor Resource Usage

```bash
# Monitor in real-time
watch -n 1 'curl -s http://localhost:3000/metrics | grep -E "(memory|cpu|connections)"'
```

## Best Practices

### 1. Test Planning

- **Define clear objectives** for each test
- **Establish baselines** before making changes
- **Test in production-like environments**
- **Run tests consistently** (same time, conditions)

### 2. Test Execution

- **Warm up the system** before testing
- **Monitor system resources** during tests
- **Run multiple iterations** for consistency
- **Document test conditions** and environment

### 3. Result Analysis

- **Focus on trends** over absolute numbers
- **Correlate performance** with system changes
- **Share results** with the development team
- **Archive results** for historical comparison

### 4. Continuous Improvement

- **Regular performance reviews**
- **Automated performance regression detection**
- **Performance budgets** in development
- **Regular load testing** schedule

## Conclusion

Performance testing is crucial for ensuring the Zoptal Authentication Service can handle production loads effectively. This guide provides the tools and knowledge needed to:

- Execute comprehensive performance tests
- Analyze and interpret results
- Identify and resolve performance issues
- Maintain performance standards over time

Regular performance testing helps ensure a reliable, fast, and scalable authentication service for all users.

---

For additional support or questions about performance testing, please contact the development team or refer to the [K6 documentation](https://k6.io/docs/).