# Performance Monitoring and Optimization Guide

This document provides comprehensive guidance on monitoring and optimizing the performance of the Zoptal platform.

## Table of Contents

1. [Overview](#overview)
2. [Performance Monitoring Tools](#performance-monitoring-tools)
3. [Benchmarking](#benchmarking)
4. [Load Testing](#load-testing)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring Setup](#monitoring-setup)
7. [Performance Metrics](#performance-metrics)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Overview

The Zoptal performance monitoring and optimization system provides:

- **Automated Benchmarking** - Regular performance testing across all services
- **Load Testing** - Comprehensive stress testing with configurable parameters
- **Performance Optimization** - Automated optimization recommendations and implementations
- **Real-time Monitoring** - Continuous monitoring with alerting
- **Performance Analytics** - Historical performance data and trend analysis

## Performance Monitoring Tools

### 1. Benchmark Suite

The benchmark suite provides comprehensive performance testing across all services and frontend applications.

```bash
# Run complete benchmark suite
./scripts/performance/benchmark.sh

# View results
open performance-results/performance_report_TIMESTAMP.html
```

**Features:**
- K6 load testing for each service
- Apache Bench stress testing
- Resource usage profiling
- Database performance analysis
- Frontend performance testing
- Automated HTML and JSON reporting

### 2. Load Testing Framework

Comprehensive load testing with configurable parameters and concurrent execution.

```bash
# Basic load test
./scripts/performance/load-test.sh

# Concurrent testing (all services simultaneously)
./scripts/performance/load-test.sh --concurrent

# Custom configuration
./scripts/performance/load-test.sh --vus 100 --duration 600s --concurrent
```

**Configuration Options:**
- `--vus NUMBER` - Virtual users (default: 50)
- `--duration TIME` - Test duration (default: 300s)
- `--concurrent` - Run all service tests in parallel

### 3. Performance Optimization Engine

Automated performance analysis and optimization recommendations.

```bash
# Analyze performance and apply optimizations
./scripts/performance/optimize.sh

# View optimization report
cat optimization-report-TIMESTAMP.md
```

**Optimization Areas:**
- Node.js service configurations
- Docker container optimizations
- Database performance tuning
- Frontend application optimizations
- Security and caching improvements

## Benchmarking

### Running Benchmarks

```bash
# Full benchmark suite
./scripts/performance/benchmark.sh

# Set custom parameters
export LOAD_TEST_DURATION="120s"
export LOAD_TEST_VUS="20"
export STRESS_TEST_DURATION="60s"
export STRESS_TEST_VUS="100"
./scripts/performance/benchmark.sh
```

### Benchmark Results

Results are saved in `performance-results/` directory:

```
performance-results/
├── benchmark_report_TIMESTAMP.json    # Raw JSON data
├── performance_report_TIMESTAMP.html  # Interactive HTML report
├── raw/                               # Raw test output files
├── charts/                            # Performance charts
└── k6_SERVICE_TIMESTAMP.json         # K6 detailed results
```

### Understanding Benchmark Metrics

| Metric | Description | Good | Warning | Critical |
|--------|-------------|------|---------|----------|
| Response Time (avg) | Average response time | < 500ms | 500-1000ms | > 1000ms |
| Response Time (p95) | 95th percentile response time | < 1000ms | 1000-2000ms | > 2000ms |
| Requests/sec | Throughput | > 100 | 50-100 | < 50 |
| Error Rate | Percentage of failed requests | < 1% | 1-5% | > 5% |
| CPU Usage | Container CPU utilization | < 60% | 60-80% | > 80% |
| Memory Usage | Container memory utilization | < 70% | 70-85% | > 85% |

## Load Testing

### K6 Load Testing Scripts

Each service has a dedicated K6 script with realistic test scenarios:

```javascript
// Example: Auth Service Load Test
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up
    { duration: '300s', target: 50 }, // Stay at load
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  // Test scenarios specific to each service
}
```

### Load Test Scenarios

#### Auth Service
- User registration and login
- Token validation and refresh
- Password reset flows
- OAuth authentication
- Rate limiting verification

#### Project Service
- Project CRUD operations
- File management operations
- Build and deployment processes
- Template operations
- Search functionality

#### AI Service
- Code generation requests
- Code analysis operations
- Model selection and usage
- Concurrent AI requests

#### Other Services
- Billing operations and usage tracking
- Notification sending and preferences
- Analytics event tracking and queries

### Load Test Results

```bash
# View load test results
ls load-test-results/

# Open HTML report
open load-test-results/load-test-report-TIMESTAMP.html

# Analyze JSON results
jq '.metrics.http_req_duration.values' load-test-results/k6-results/SERVICE-load-test-results.json
```

## Performance Optimization

### Automated Optimization

The optimization engine analyzes performance data and applies improvements:

```bash
./scripts/performance/optimize.sh
```

### Optimization Categories

#### 1. Node.js Services
- PM2 clustering configuration
- Memory limits and garbage collection
- Production-optimized startup scripts
- Environment variable optimization

#### 2. Docker Configuration
- Resource limits and reservations
- Health check optimization
- Multi-stage build optimizations
- Container networking improvements

#### 3. Database Tuning
- PostgreSQL performance configuration
- Connection pooling optimization
- Query optimization and indexing
- Maintenance and vacuum settings

#### 4. Frontend Optimization
- Next.js build optimizations
- Bundle splitting and code splitting
- Caching strategies
- Image optimization
- Static asset optimization

#### 5. Infrastructure
- Load balancing configuration
- CDN integration preparation
- Security header optimization
- Rate limiting configuration

### Manual Optimization

#### Service-Level Optimizations

```javascript
// PM2 Ecosystem Configuration
module.exports = {
  apps: [{
    name: 'auth-service',
    script: 'dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=2048',
  }]
};
```

#### Database Optimizations

```sql
-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_projects_user_id ON projects(user_id);

-- Analyze tables
ANALYZE users, projects, project_files;

-- Update statistics
UPDATE pg_stat_user_tables SET n_tup_upd = 0;
```

#### Frontend Optimizations

```javascript
// Next.js Configuration
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@zoptal/ui'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};
```

## Monitoring Setup

### Real-time Performance Monitoring

```bash
# Start continuous monitoring
./monitoring/performance/monitor.sh

# View monitoring dashboard
open http://localhost:3000/monitoring/performance
```

### Grafana Dashboard

The performance monitoring includes a pre-configured Grafana dashboard:

**Key Panels:**
- Response Time Trends
- Error Rate Monitoring
- CPU and Memory Usage
- Database Performance Metrics
- Request Throughput
- Service Health Status

### Automated Alerts

Configure alerts for performance degradation:

```javascript
// Alert Configuration
const performanceAlerts = {
  responseTime: {
    threshold: 2000, // 2 seconds
    action: 'slack,email'
  },
  errorRate: {
    threshold: 5, // 5%
    action: 'pagerduty,slack'
  },
  cpuUsage: {
    threshold: 80, // 80%
    action: 'email'
  }
};
```

## Performance Metrics

### Core Metrics

#### Response Time Metrics
- **Average Response Time** - Mean response time across all requests
- **95th Percentile (P95)** - 95% of requests complete within this time
- **99th Percentile (P99)** - 99% of requests complete within this time
- **Maximum Response Time** - Slowest request in the measurement period

#### Throughput Metrics
- **Requests per Second (RPS)** - Number of requests processed per second
- **Concurrent Users** - Number of simultaneous active users
- **Request Volume** - Total number of requests in measurement period

#### Error Metrics
- **Error Rate** - Percentage of failed requests
- **Error Count** - Total number of failed requests
- **Error Types** - Breakdown of error types (4xx, 5xx)

#### Resource Metrics
- **CPU Utilization** - Percentage of CPU capacity used
- **Memory Usage** - RAM consumption and garbage collection
- **Database Connections** - Active database connection count
- **Cache Hit Rate** - Percentage of requests served from cache

### Service-Specific Metrics

#### Auth Service
- Login success/failure rates
- Token validation performance
- OAuth flow completion times
- Password reset request volumes

#### Project Service
- Project creation/build times
- File upload/download speeds
- Deployment success rates
- Template usage patterns

#### AI Service
- Code generation response times
- Model selection preferences
- Token usage and billing accuracy
- Concurrent request handling

### Database Metrics

```sql
-- Query performance monitoring
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    stddev_time
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Connection monitoring
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- Cache hit rate
SELECT 
    blks_hit::float / (blks_read + blks_hit) * 100 as cache_hit_rate 
FROM pg_stat_database 
WHERE datname = 'zoptal';
```

## Troubleshooting

### Common Performance Issues

#### High Response Times

**Symptoms:**
- Response times > 2 seconds
- User complaints about slow loading
- Timeout errors

**Investigation:**
```bash
# Check service response times
curl -w "%{time_total}\n" -o /dev/null -s http://localhost:3001/health

# Analyze database slow queries
docker exec postgres psql -U postgres -d zoptal -c "
  SELECT query, mean_time, calls 
  FROM pg_stat_statements 
  WHERE mean_time > 1000 
  ORDER BY mean_time DESC;"

# Check system resources
docker stats --no-stream
```

**Solutions:**
- Enable database query optimization
- Implement caching layer
- Scale horizontally with load balancer
- Optimize database indexes

#### High Error Rates

**Symptoms:**
- Error rate > 5%
- 5xx status codes increasing
- Service unavailability

**Investigation:**
```bash
# Check service logs
docker logs auth-service --tail 100

# Monitor error patterns
grep "ERROR" logs/*.log | head -20

# Check service health
curl http://localhost:3001/health
```

**Solutions:**
- Implement circuit breaker pattern
- Add retry logic with exponential backoff
- Scale service instances
- Fix application bugs causing errors

#### High Resource Usage

**Symptoms:**
- CPU usage > 80%
- Memory usage > 85%
- Container restarts due to OOM

**Investigation:**
```bash
# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Check memory leaks
docker exec auth-service node --expose-gc -e "global.gc(); console.log(process.memoryUsage());"
```

**Solutions:**
- Optimize memory usage in applications
- Implement proper garbage collection
- Increase resource limits
- Add more service instances

### Performance Debugging Tools

#### Application Profiling

```javascript
// CPU Profiling
const v8Profiler = require('v8-profiler-next');

// Start CPU profiling
v8Profiler.startProfiling('CPU profile');

// Your application code here

// Stop and save profile
const profile = v8Profiler.stopProfiling('CPU profile');
profile.export(function(error, result) {
  // Save to file for analysis
});
```

#### Memory Analysis

```javascript
// Memory Usage Tracking
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Memory Usage: 
    RSS: ${Math.round(usage.rss / 1024 / 1024)} MB
    Heap Used: ${Math.round(usage.heapUsed / 1024 / 1024)} MB
    Heap Total: ${Math.round(usage.heapTotal / 1024 / 1024)} MB
    External: ${Math.round(usage.external / 1024 / 1024)} MB`);
}, 30000);
```

#### Database Query Analysis

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();

-- Analyze query performance
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    (total_time / sum(total_time) OVER ()) * 100 as percentage
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 20;

-- Check locks and blocking queries
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

## Best Practices

### 1. Regular Performance Testing

- **Automated Benchmarks** - Run benchmark suite weekly
- **Load Testing** - Perform load tests before major releases
- **Continuous Monitoring** - Monitor performance metrics 24/7
- **Performance Budgets** - Set and enforce performance thresholds

### 2. Optimization Strategy

- **Measure First** - Always measure before optimizing
- **Optimize Bottlenecks** - Focus on the slowest components first
- **Test Changes** - Verify optimization improvements with benchmarks
- **Document Changes** - Keep record of optimization changes and results

### 3. Monitoring and Alerting

- **Real-time Alerts** - Set up alerts for performance degradation
- **Historical Analysis** - Track performance trends over time
- **Capacity Planning** - Monitor growth and plan for scaling
- **Service Level Objectives** - Define and monitor SLOs

### 4. Performance-First Development

- **Performance Requirements** - Include performance requirements in feature specs
- **Code Reviews** - Review code for performance implications
- **Testing** - Include performance tests in CI/CD pipeline
- **Documentation** - Document performance characteristics of new features

### 5. Infrastructure Optimization

- **Resource Allocation** - Right-size containers and services
- **Caching Strategy** - Implement appropriate caching at all levels
- **Database Optimization** - Regular database maintenance and optimization
- **CDN Usage** - Use CDN for static assets and global distribution

### 6. Frontend Performance

- **Bundle Optimization** - Minimize and split JavaScript bundles
- **Image Optimization** - Use modern image formats and sizing
- **Caching** - Implement aggressive caching for static assets
- **Core Web Vitals** - Monitor and optimize Core Web Vitals metrics

---

## Quick Reference

### Commands

```bash
# Run benchmark suite
./scripts/performance/benchmark.sh

# Run load tests
./scripts/performance/load-test.sh --concurrent

# Apply optimizations
./scripts/performance/optimize.sh

# Start monitoring
./monitoring/performance/monitor.sh
```

### Performance Thresholds

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Response Time (avg) | < 500ms | 500-1000ms | > 1000ms |
| Response Time (p95) | < 1000ms | 1000-2000ms | > 2000ms |
| Error Rate | < 1% | 1-5% | > 5% |
| CPU Usage | < 60% | 60-80% | > 80% |
| Memory Usage | < 70% | 70-85% | > 85% |

### Key Files

- `scripts/performance/benchmark.sh` - Main benchmarking script
- `scripts/performance/load-test.sh` - Load testing framework
- `scripts/performance/optimize.sh` - Performance optimization engine
- `monitoring/performance/grafana-dashboard.json` - Grafana dashboard configuration
- `docs/performance/README.md` - This documentation

For additional help and advanced configurations, see the individual script documentation and configuration files.