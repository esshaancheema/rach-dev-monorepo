# Graceful Degradation Guide

## Overview

The Zoptal Authentication Service implements comprehensive graceful degradation to ensure system availability and data integrity even when external dependencies fail. This guide covers degradation strategies, recovery procedures, monitoring, and operational best practices.

## Table of Contents

- [Architecture](#architecture)
- [Degradation Strategies](#degradation-strategies)
- [Circuit Breaker Integration](#circuit-breaker-integration)
- [Recovery Procedures](#recovery-procedures)
- [Monitoring and Alerting](#monitoring-and-alerting)
- [Operational Procedures](#operational-procedures)
- [Performance Impact](#performance-impact)
- [Testing Strategies](#testing-strategies)
- [Troubleshooting](#troubleshooting)

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Service                    │
├─────────────────────────────────────────────────────────────┤
│              Graceful Degradation Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Circuit    │  Fallback   │  Operation  │  Cache          │
│  Breakers   │  Cache      │  Queue      │  Management     │
├─────────────────────────────────────────────────────────────┤
│  Database   │   Redis     │   Email     │    SMS          │
│  Service    │   Service   │   Service   │   Service       │
└─────────────────────────────────────────────────────────────┘
```

### Service Dependencies

1. **Database (PostgreSQL)**: User data, sessions, audit logs
2. **Redis**: Caching, rate limiting, session storage
3. **Email Service (SendGrid)**: Email notifications, verification
4. **SMS Service (Twilio)**: SMS notifications, 2FA codes

## Degradation Strategies

### 1. Database Degradation

#### Scenario: Database Connection Lost
**Impact**: User authentication, data persistence
**Strategy**: Fallback cache + operation queuing

```typescript
// Example: User lookup with fallback
const user = await gracefulDegradationService.database.findUser(email);
// Returns cached user data or null if not available
```

**Fallback Behaviors**:
- **User Authentication**: Use cached user data for login validation
- **User Registration**: Create temporary user records, queue for persistence
- **Profile Updates**: Cache updates locally, sync when database recovers
- **Activity Logging**: Queue all activities for batch insertion

#### Scenario: Database Performance Degradation
**Impact**: Slow response times
**Strategy**: Timeout-based circuit breaker + read-only fallbacks

**Fallback Behaviors**:
- Enable read-only mode for non-critical operations
- Use cached data for frequently accessed information
- Queue write operations for later processing

### 2. Redis Degradation

#### Scenario: Redis Connection Lost
**Impact**: Caching, rate limiting, session management
**Strategy**: In-memory fallback cache

```typescript
// Example: Session management with fallback
await gracefulDegradationService.redis.set(sessionKey, sessionData);
const session = await gracefulDegradationService.redis.get(sessionKey);
```

**Fallback Behaviors**:
- **Session Management**: Store sessions in memory with TTL
- **Rate Limiting**: Use in-memory counters with cleanup
- **Caching**: Maintain hot data in application memory
- **Feature Flags**: Fall back to static configuration

#### Memory Management During Redis Outage
```typescript
// Automatic cleanup of in-memory cache
const MEMORY_CACHE_LIMIT = 10000; // Max items
const MEMORY_CACHE_TTL = 300000;   // 5 minutes

// Cache eviction policy: LRU + TTL-based
```

### 3. Email Service Degradation

#### Scenario: SendGrid Service Unavailable
**Impact**: Email notifications, user verification
**Strategy**: Operation queuing + priority-based processing

```typescript
// Example: Email with fallback
const sent = await gracefulDegradationService.email.sendEmail(
  to, subject, content, template
);
// Returns false if queued, true if sent immediately
```

**Fallback Behaviors**:
- **Critical Emails**: Queue with high priority (password reset, security alerts)
- **Marketing Emails**: Queue with low priority or skip
- **Transactional Emails**: Queue for guaranteed delivery
- **Retry Logic**: Exponential backoff with circuit breaker

#### Email Priority Classification
```typescript
const EMAIL_PRIORITIES = {
  CRITICAL: ['password_reset', 'security_alert', 'account_suspension'],
  HIGH: ['email_verification', 'login_alert'],
  NORMAL: ['welcome', 'profile_update'],
  LOW: ['marketing', 'newsletter']
};
```

### 4. SMS Service Degradation

#### Scenario: Twilio Service Unavailable
**Impact**: SMS notifications, 2FA verification
**Strategy**: Operation queuing + alternative verification methods

```typescript
// Example: SMS with fallback
const sent = await gracefulDegradationService.sms.sendSms(phone, message);
// Returns false if queued, implements fallback verification
```

**Fallback Behaviors**:
- **2FA Codes**: Queue for delivery, extend code validity
- **Security Alerts**: Queue with high priority
- **Promotional SMS**: Skip or queue with low priority
- **Alternative Verification**: Email-based backup for 2FA

## Circuit Breaker Integration

### Circuit Breaker States

1. **CLOSED**: Service healthy, requests pass through
2. **OPEN**: Service failed, requests use fallback
3. **HALF-OPEN**: Testing service recovery

### Configuration

```typescript
const CIRCUIT_BREAKER_CONFIG = {
  database: {
    failureThreshold: 5,        // Open after 5 failures
    recoveryTimeout: 60000,     // Test recovery after 1 minute
    monitoringPeriod: 30000,    // Monitor over 30 seconds
    halfOpenMaxCalls: 3         // Allow 3 test calls
  },
  redis: {
    failureThreshold: 3,
    recoveryTimeout: 30000,
    monitoringPeriod: 15000,
    halfOpenMaxCalls: 2
  },
  email: {
    failureThreshold: 10,
    recoveryTimeout: 120000,
    monitoringPeriod: 60000,
    halfOpenMaxCalls: 5
  },
  sms: {
    failureThreshold: 10,
    recoveryTimeout: 120000,
    monitoringPeriod: 60000,
    halfOpenMaxCalls: 5
  }
};
```

### Health Check Integration

```typescript
// Automatic health checks for circuit breaker recovery
const healthChecks = {
  database: () => prisma.$queryRaw`SELECT 1`,
  redis: () => redis.ping(),
  email: () => emailService.healthCheck(),
  sms: () => smsService.healthCheck()
};
```

## Recovery Procedures

### 1. Automatic Recovery

#### Service Health Monitoring
```typescript
// Continuous health monitoring every 30 seconds
setInterval(async () => {
  for (const [service, healthCheck] of Object.entries(healthChecks)) {
    try {
      await healthCheck();
      circuitBreaker[service].recordSuccess();
    } catch (error) {
      circuitBreaker[service].recordFailure();
    }
  }
}, 30000);
```

#### Queue Processing
```typescript
// Automatic queue processing when services recover
const processQueuedOperations = async () => {
  const operations = getQueuedOperations();
  
  for (const operation of operations) {
    try {
      await executeOperation(operation);
      removeFromQueue(operation);
    } catch (error) {
      if (operation.retries < MAX_RETRIES) {
        operation.retries++;
        scheduleRetry(operation);
      } else {
        moveToDeadLetterQueue(operation);
      }
    }
  }
};
```

### 2. Manual Recovery Procedures

#### Database Recovery
```bash
# 1. Check database connectivity
curl -X GET /health/database

# 2. Clear circuit breaker if manually resolved
curl -X POST /circuit-breaker/database/reset

# 3. Process queued operations
curl -X POST /api/admin/degradation/process-queue

# 4. Verify operation success
curl -X GET /api/admin/degradation/status
```

#### Redis Recovery
```bash
# 1. Check Redis connectivity
curl -X GET /health/redis

# 2. Sync in-memory cache to Redis
curl -X POST /api/admin/degradation/sync-cache

# 3. Clear fallback cache
curl -X POST /api/admin/degradation/clear-cache

# 4. Reset circuit breaker
curl -X POST /circuit-breaker/redis/reset
```

#### Email Service Recovery
```bash
# 1. Check email service status
curl -X GET /health/email

# 2. Process email queue
curl -X POST /api/admin/queue/email/process

# 3. Check queue status
curl -X GET /api/admin/queue/email/status

# 4. Reset circuit breaker
curl -X POST /circuit-breaker/email/reset
```

#### SMS Service Recovery
```bash
# 1. Check SMS service status
curl -X GET /health/sms

# 2. Process SMS queue
curl -X POST /api/admin/queue/sms/process

# 3. Check queue status
curl -X GET /api/admin/queue/sms/status

# 4. Reset circuit breaker
curl -X POST /circuit-breaker/sms/reset
```

### 3. Data Synchronization

#### Cache Synchronization
```typescript
// Sync in-memory cache back to Redis
const syncCacheToRedis = async () => {
  const memoryCache = getMemoryCache();
  
  for (const [key, value] of Object.entries(memoryCache)) {
    try {
      await redis.set(key, JSON.stringify(value));
    } catch (error) {
      logger.warn(`Failed to sync cache key: ${key}`, error);
    }
  }
  
  clearMemoryCache();
};
```

#### Database Synchronization
```typescript
// Process queued database operations
const syncQueuedOperations = async () => {
  const operations = getQueuedDatabaseOperations();
  
  for (const operation of operations) {
    try {
      switch (operation.type) {
        case 'CREATE_USER':
          await prisma.user.create(operation.data);
          break;
        case 'UPDATE_USER':
          await prisma.user.update(operation.data);
          break;
        case 'LOG_ACTIVITY':
          await prisma.activityLog.create(operation.data);
          break;
      }
      
      markOperationCompleted(operation);
    } catch (error) {
      handleOperationError(operation, error);
    }
  }
};
```

## Monitoring and Alerting

### 1. Health Metrics

#### System Health Dashboard
```typescript
const getSystemHealth = () => ({
  timestamp: new Date().toISOString(),
  overall: {
    status: isSystemHealthy() ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    version: process.env.APP_VERSION
  },
  services: {
    database: getDatabaseHealth(),
    redis: getRedisHealth(),
    email: getEmailServiceHealth(),
    sms: getSmsServiceHealth()
  },
  degradation: {
    isActive: isInDegradedMode(),
    affectedServices: getDegradedServices(),
    queuedOperations: getQueuedOperationCount(),
    cacheSize: getCacheSize(),
    lastIncident: getLastIncidentTime()
  },
  performance: {
    responseTime: getAverageResponseTime(),
    errorRate: getErrorRate(),
    throughput: getThroughput()
  }
});
```

#### Key Performance Indicators (KPIs)
- **Service Availability**: 99.9% uptime target
- **Response Time**: < 200ms for cached operations
- **Queue Processing Time**: < 5 minutes for critical operations
- **Data Consistency**: 100% eventual consistency
- **Recovery Time**: < 30 seconds for automatic recovery

### 2. Alerting Rules

#### Critical Alerts (Immediate Response)
```yaml
alerts:
  - name: "Multiple Services Down"
    condition: "degraded_services_count >= 2"
    severity: "critical"
    notification: ["pager", "email", "slack"]
    
  - name: "Database Circuit Breaker Open"
    condition: "database_circuit_breaker == 'OPEN'"
    severity: "critical"
    notification: ["pager", "email"]
    
  - name: "Queue Size Critical"
    condition: "queued_operations > 1000"
    severity: "critical"
    notification: ["pager", "email"]
```

#### Warning Alerts (Monitor Closely)
```yaml
alerts:
  - name: "Service Performance Degraded"
    condition: "avg_response_time > 1000ms"
    severity: "warning"
    notification: ["email", "slack"]
    
  - name: "Cache Size Growing"
    condition: "fallback_cache_size > 5000"
    severity: "warning"
    notification: ["email"]
    
  - name: "Queue Processing Delayed"
    condition: "queue_processing_lag > 300s"
    severity: "warning"
    notification: ["email"]
```

### 3. Monitoring Integration

#### Prometheus Metrics
```typescript
// Custom metrics for degradation monitoring
const degradationMetrics = {
  degraded_services_total: new promClient.Gauge({
    name: 'degraded_services_total',
    help: 'Number of degraded services'
  }),
  
  queued_operations_total: new promClient.Gauge({
    name: 'queued_operations_total',
    help: 'Total number of queued operations'
  }),
  
  fallback_cache_size: new promClient.Gauge({
    name: 'fallback_cache_size',
    help: 'Size of fallback cache'
  }),
  
  circuit_breaker_state: new promClient.Gauge({
    name: 'circuit_breaker_state',
    help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
    labelNames: ['service']
  })
};
```

## Operational Procedures

### 1. Incident Response

#### Severity Levels
- **SEV-1**: Multiple critical services down, user impact severe
- **SEV-2**: Single critical service down, degraded functionality
- **SEV-3**: Performance degradation, minimal user impact
- **SEV-4**: Warning conditions, no immediate user impact

#### Response Process
1. **Detection**: Automated monitoring alerts team
2. **Assessment**: Determine severity and impact
3. **Containment**: Enable additional degradation measures if needed
4. **Resolution**: Fix underlying issues
5. **Recovery**: Process queued operations and sync data
6. **Post-Incident**: Review and improve procedures

### 2. Maintenance Procedures

#### Planned Maintenance
```bash
# 1. Enable maintenance mode
curl -X POST /api/admin/maintenance/enable

# 2. Drain connections and queues
curl -X POST /api/admin/maintenance/drain

# 3. Perform maintenance
# ... maintenance tasks ...

# 4. Disable maintenance mode
curl -X POST /api/admin/maintenance/disable

# 5. Verify system health
curl -X GET /health/detailed
```

#### Emergency Procedures
```bash
# Force enable degraded mode for all services
curl -X POST /api/admin/degradation/force-enable

# Force process all queues immediately
curl -X POST /api/admin/degradation/force-process-all

# Reset all circuit breakers
curl -X POST /circuit-breaker/reset-all

# Clear all fallback caches
curl -X POST /api/admin/degradation/clear-all-caches
```

### 3. Capacity Planning

#### Queue Size Limits
```typescript
const QUEUE_LIMITS = {
  database: 5000,     // Max database operations
  email: 10000,       // Max email operations  
  sms: 2000,          // Max SMS operations
  total: 15000        // Max total operations
};
```

#### Memory Limits
```typescript
const MEMORY_LIMITS = {
  fallback_cache: 100 * 1024 * 1024,  // 100MB
  operation_queue: 50 * 1024 * 1024,   // 50MB
  max_cache_items: 10000,               // Max cached items
  max_queue_items: 5000                 // Max queued items
};
```

## Performance Impact

### 1. Response Time Impact

#### Normal Operation
- Database queries: 5-50ms
- Redis operations: 1-5ms
- API responses: 50-200ms

#### Degraded Operation
- Cached data access: 1-10ms
- Fallback operations: 10-50ms
- Queue operations: 5-25ms
- API responses: 100-500ms

### 2. Memory Usage

#### Baseline Memory Usage
- Application: ~200MB
- Caching: ~50MB
- Total: ~250MB

#### Degraded Mode Memory Usage
- Application: ~200MB
- Fallback cache: ~100MB (max)
- Operation queue: ~50MB (max)
- Total: ~350MB (max)

### 3. Throughput Impact

#### Normal Throughput
- Database operations: 1000 ops/sec
- Redis operations: 5000 ops/sec
- API requests: 500 req/sec

#### Degraded Throughput
- Cached operations: 2000 ops/sec
- Queued operations: 100 ops/sec (background)
- API requests: 300 req/sec

## Testing Strategies

### 1. Chaos Engineering

#### Database Failure Simulation
```bash
# Simulate database connection loss
curl -X POST /chaos/database/disconnect

# Simulate database slowness
curl -X POST /chaos/database/latency/1000ms

# Simulate database readonly mode
curl -X POST /chaos/database/readonly
```

#### Redis Failure Simulation
```bash
# Simulate Redis connection loss
curl -X POST /chaos/redis/disconnect

# Simulate Redis memory pressure
curl -X POST /chaos/redis/memory-pressure

# Simulate Redis command timeouts
curl -X POST /chaos/redis/timeouts
```

#### External Service Failures
```bash
# Simulate SendGrid outage
curl -X POST /chaos/email/outage

# Simulate Twilio rate limiting
curl -X POST /chaos/sms/rate-limit

# Simulate network partitions
curl -X POST /chaos/network/partition
```

### 2. Load Testing During Degradation

#### Test Scenarios
1. **Gradual Degradation**: Slowly increase failure rates
2. **Sudden Outage**: Immediate service failure
3. **Cascading Failures**: Multiple service failures
4. **Recovery Testing**: Service restoration scenarios

#### Load Test Script Example
```javascript
// k6 load test for degraded mode
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Stay at load
    { duration: '2m', target: 0 },    // Ramp down
  ],
};

export default function() {
  // Test critical user flows during degradation
  let loginResponse = http.post('/api/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });
  
  check(loginResponse, {
    'login succeeds during degradation': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 2000,
  });
}
```

### 3. Integration Testing

#### End-to-End Degradation Tests
```typescript
describe('Full System Degradation', () => {
  it('should handle complete external service failure', async () => {
    // Disable all external services
    await chaos.disableDatabase();
    await chaos.disableRedis();
    await chaos.disableEmail();
    await chaos.disableSMS();
    
    // Test critical user flows
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect(response.status).toBe(200);
    expect(response.body.fallback).toBe(true);
  });
});
```

## Troubleshooting

### 1. Common Issues

#### Queue Not Processing
**Symptoms**: Queued operations count increasing, no processing
**Causes**: Queue processor stopped, circuit breaker stuck open
**Resolution**:
```bash
# Check queue processor status
curl -X GET /api/admin/queue/status

# Restart queue processor
curl -X POST /api/admin/queue/restart

# Force process queue
curl -X POST /api/admin/queue/force-process
```

#### Memory Leak in Fallback Cache
**Symptoms**: Memory usage continuously growing
**Causes**: TTL not working, cache not clearing expired items
**Resolution**:
```bash
# Clear fallback cache
curl -X POST /api/admin/degradation/clear-cache

# Check cache statistics
curl -X GET /api/admin/degradation/cache-stats

# Restart service if needed
docker-compose restart auth-service
```

#### Circuit Breaker Stuck Open
**Symptoms**: Service appears healthy but circuit breaker won't close
**Causes**: Health check failing, configuration issue
**Resolution**:
```bash
# Check circuit breaker status
curl -X GET /circuit-breaker/status

# Manual health check
curl -X GET /health/database
curl -X GET /health/redis

# Force reset circuit breaker
curl -X POST /circuit-breaker/database/reset
```

### 2. Diagnostic Commands

#### System Status Check
```bash
# Comprehensive health check
curl -X GET /health/detailed

# Degradation status
curl -X GET /api/admin/degradation/status

# Circuit breaker status
curl -X GET /circuit-breaker/status

# Queue status
curl -X GET /api/admin/queue/status
```

#### Performance Diagnostics
```bash
# Response time metrics
curl -X GET /metrics | grep response_time

# Error rate metrics
curl -X GET /metrics | grep error_rate

# Memory usage
curl -X GET /metrics | grep memory

# Queue metrics
curl -X GET /metrics | grep queue
```

### 3. Log Analysis

#### Key Log Patterns
```bash
# Degradation events
grep "graceful degradation" /var/log/auth-service.log

# Circuit breaker state changes
grep "circuit breaker" /var/log/auth-service.log

# Queue operations
grep "operation queued\|queue processed" /var/log/auth-service.log

# Performance warnings
grep "slow request\|high memory" /var/log/auth-service.log
```

#### Log Aggregation Query Examples
```sql
-- Degradation events in last hour
SELECT * FROM logs 
WHERE message LIKE '%degradation%' 
AND timestamp > NOW() - INTERVAL '1 hour';

-- Circuit breaker state changes
SELECT service, state, timestamp FROM circuit_breaker_logs 
ORDER BY timestamp DESC LIMIT 100;

-- Queue processing metrics
SELECT 
  DATE_TRUNC('minute', timestamp) as minute,
  COUNT(*) as operations_processed,
  AVG(processing_time) as avg_processing_time
FROM queue_processing_logs 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY minute
ORDER BY minute;
```

## Best Practices

### 1. Development Guidelines

- Always implement fallback mechanisms for external dependencies
- Design for eventual consistency rather than immediate consistency
- Use timeouts and circuit breakers for all external calls
- Implement comprehensive monitoring and alerting
- Test degradation scenarios regularly

### 2. Operational Guidelines

- Monitor system health continuously
- Set up proper alerting for degradation events
- Practice incident response procedures regularly
- Maintain documentation up to date
- Review and improve degradation strategies based on incidents

### 3. Security Considerations

- Ensure fallback mechanisms don't bypass security controls
- Log all degradation events for audit purposes
- Implement proper access controls for degradation management endpoints
- Consider data privacy implications of caching sensitive data
- Regular security reviews of degradation logic

---

For additional support or questions about graceful degradation, contact the platform team or refer to the [Operational Runbook](./OPERATIONAL_RUNBOOK.md).