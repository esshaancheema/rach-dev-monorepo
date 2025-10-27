# Zoptal Platform Caching Strategy

This document outlines the comprehensive caching strategy implemented for the Zoptal platform to ensure optimal performance, scalability, and user experience.

## Table of Contents

1. [Overview](#overview)
2. [Cache Architecture](#cache-architecture)
3. [Cache Layers](#cache-layers)
4. [Cache Patterns](#cache-patterns)
5. [Performance Optimization](#performance-optimization)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

The Zoptal platform implements a multi-layer caching strategy designed to:

- **Reduce Response Times**: Serve frequently requested data from fast cache stores
- **Decrease Database Load**: Minimize direct database queries through intelligent caching
- **Improve Scalability**: Handle increased traffic without proportional resource increases
- **Enhance User Experience**: Provide faster page loads and API responses
- **Optimize Resource Usage**: Reduce computational overhead and network latency

### Cache Performance Goals

- **API Response Time**: < 100ms for cached responses
- **Cache Hit Rate**: > 90% for frequently accessed data
- **Database Load Reduction**: 70-80% reduction in direct queries
- **Memory Efficiency**: < 4GB total cache memory usage
- **Availability**: 99.9% cache service uptime

## Cache Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client/CDN    │───▶│  Nginx Cache    │───▶│  Application    │
│   (Browser)     │    │   (HTTP Cache)  │    │   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Static Assets  │    │  Redis Cluster  │
                       │     Cache       │    │  (Data Cache)   │
                       └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   Database      │
                                               └─────────────────┘
```

### Components

#### 1. Redis Cluster
- **Purpose**: Primary data cache and session storage
- **Configuration**: 6-node cluster with replication
- **Memory**: 2GB per node with LRU eviction
- **Use Cases**: API responses, session data, computed results

#### 2. Nginx HTTP Cache
- **Purpose**: Reverse proxy with HTTP caching
- **Configuration**: 3 cache zones (static, api, images)
- **Storage**: 10GB total cache storage
- **Use Cases**: Static assets, API responses, image optimization

#### 3. Application-Level Cache
- **Purpose**: In-memory caching within services
- **Implementation**: Node.js with memory stores
- **Use Cases**: Configuration data, computed values, temporary data

## Cache Layers

### Layer 1: Browser/CDN Cache

**Location**: Client-side and CDN edge locations
**TTL**: 7 days for static assets, 5 minutes for dynamic content
**Headers**: 
- `Cache-Control: public, max-age=604800` (static)
- `Cache-Control: public, max-age=300` (dynamic)

```javascript
// Example headers for static assets
app.use('/static', express.static('public', {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));
```

### Layer 2: Nginx Reverse Proxy Cache

**Location**: Kubernetes cluster (nginx-cache pods)
**Configuration**: 
- Static cache: 7 days TTL, 10GB storage
- API cache: 1 hour TTL, 1GB storage  
- Image cache: 30 days TTL, 5GB storage

**Key Features**:
- Rate limiting and connection pooling
- Gzip and Brotli compression
- Cache purging via admin endpoints
- Health monitoring and metrics

### Layer 3: Redis Distributed Cache

**Location**: Redis cluster in Kubernetes
**Configuration**:
- 6 nodes with replication
- 2GB memory per node
- LRU eviction policy
- Cluster mode with failover

**Data Types**:
- **Strings**: Simple key-value pairs
- **Hashes**: User sessions, object properties
- **Lists**: Message queues, activity feeds
- **Sets**: Tag collections, unique items
- **Sorted Sets**: Leaderboards, time-series data

### Layer 4: Application Memory Cache

**Location**: Within application services
**Implementation**: Node.js Map objects and memory stores
**Use Cases**: 
- Configuration caching
- Computed results
- Template compilation
- Temporary data structures

## Cache Patterns

### 1. Cache-Aside (Lazy Loading)

Most common pattern for read-heavy operations:

```javascript
async function getUser(userId) {
  // Try cache first
  const cached = await redis.get(`user:${userId}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Cache miss - fetch from database
  const user = await db.users.findById(userId);
  if (user) {
    await redis.set(`user:${userId}`, JSON.stringify(user), 3600);
  }
  
  return user;
}
```

### 2. Write-Through

Updates cache immediately when data changes:

```javascript
async function updateUser(userId, userData) {
  // Update database
  const user = await db.users.update(userId, userData);
  
  // Update cache immediately
  await redis.set(`user:${userId}`, JSON.stringify(user), 3600);
  
  return user;
}
```

### 3. Write-Behind (Write-Back)

Updates cache immediately, database asynchronously:

```javascript
async function incrementCounter(key) {
  // Update cache immediately
  const newValue = await redis.incr(`counter:${key}`);
  
  // Schedule database update (background job)
  jobQueue.add('updateCounterInDB', { key, value: newValue });
  
  return newValue;
}
```

### 4. Cache Warming

Pre-populate cache with frequently accessed data:

```javascript
async function warmCache() {
  const popularUsers = await db.users.findPopular(100);
  const pipeline = redis.pipeline();
  
  for (const user of popularUsers) {
    pipeline.set(`user:${user.id}`, JSON.stringify(user), 3600);
  }
  
  await pipeline.exec();
}
```

### 5. Cache Invalidation

Remove stale data from cache:

```javascript
// Time-based expiration
await redis.expire('user:123', 3600);

// Event-based invalidation
async function onUserUpdate(userId) {
  await redis.del(`user:${userId}`);
  await redis.del(`user:${userId}:projects`);
  await redis.del(`user:${userId}:settings`);
}

// Pattern-based invalidation
async function invalidateUserData(userId) {
  const keys = await redis.keys(`user:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

## Performance Optimization

### Redis Optimization

#### Memory Management
```conf
# redis.conf optimizations
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Persistence tuning
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

#### Connection Pooling
```javascript
const redis = new Redis.Cluster([...], {
  redisOptions: {
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableOfflineQueue: false,
    connectTimeout: 10000,
    commandTimeout: 5000,
  },
  scaleReads: 'slave',
  maxRedirections: 16,
});
```

### Nginx Optimization

#### Cache Configuration
```nginx
# Efficient cache key generation
proxy_cache_key "$scheme$request_method$host$request_uri$is_args$args";

# Cache hierarchy
proxy_cache_path /var/cache/nginx/static levels=1:2 keys_zone=static_cache:100m;

# Compression
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

### Application Optimization

#### Efficient Serialization
```javascript
class CacheSerializer {
  static serialize(data) {
    if (typeof data === 'string') return data;
    return JSON.stringify(data);
  }
  
  static deserialize(data) {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
}
```

#### Batch Operations
```javascript
// Use pipelines for multiple operations
const pipeline = redis.pipeline();
pipeline.get('key1');
pipeline.get('key2');
pipeline.get('key3');
const results = await pipeline.exec();

// Use MGET for multiple keys
const values = await redis.mget('key1', 'key2', 'key3');
```

## Monitoring and Maintenance

### Redis Monitoring

#### Key Metrics
- **Memory Usage**: `used_memory`, `used_memory_peak`
- **Hit Rate**: `keyspace_hits / (keyspace_hits + keyspace_misses)`
- **Commands/sec**: `instantaneous_ops_per_sec`
- **Connected Clients**: `connected_clients`
- **Evicted Keys**: `evicted_keys`

#### Monitoring Commands
```bash
# Memory analysis
redis-cli info memory

# Performance stats
redis-cli info stats

# Client connections
redis-cli info clients

# Slow queries
redis-cli slowlog get 10
```

### Nginx Monitoring

#### Key Metrics
- **Cache Hit Rate**: `X-Cache-Status` header analysis
- **Response Times**: Access log analysis
- **Error Rates**: 4xx/5xx response tracking
- **Connection Stats**: Active connections, requests/sec

#### Monitoring Endpoints
```bash
# Nginx status
curl http://nginx-cache:8080/status

# Cache statistics
curl http://nginx-cache:8080/cache-stats
```

### Application Monitoring

#### Performance Metrics
```javascript
class CacheMetrics {
  constructor() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalCommands: 0,
      averageResponseTime: 0
    };
  }
  
  recordHit() { this.metrics.hits++; }
  recordMiss() { this.metrics.misses++; }
  
  getHitRate() {
    const total = this.metrics.hits + this.metrics.misses;
    return total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }
}
```

### Automated Maintenance

#### Cache Warming Script
```bash
#!/bin/bash
# Warm cache with popular endpoints
endpoints=(
  "/api/projects"
  "/api/auth/me"
  "/api/notifications"
)

for endpoint in "${endpoints[@]}"; do
  curl -s "http://api.zoptal.com$endpoint" > /dev/null
done
```

#### Cache Cleanup
```javascript
// Remove expired sessions daily
async function cleanupExpiredSessions() {
  const keys = await redis.keys('session:*');
  const pipeline = redis.pipeline();
  
  for (const key of keys) {
    const ttl = await redis.ttl(key);
    if (ttl === -1) { // No expiration set
      pipeline.expire(key, 86400); // Set 24h expiration
    }
  }
  
  await pipeline.exec();
}
```

## Best Practices

### 1. Cache Key Design

**Use Hierarchical Keys**
```javascript
// Good
const userKey = `user:${userId}`;
const userProjectsKey = `user:${userId}:projects`;
const projectKey = `project:${projectId}`;

// Bad
const userKey = `u_${userId}`;
const mixedKey = `user_projects_${userId}_data`;
```

**Include Version in Keys**
```javascript
const API_VERSION = 'v1';
const cacheKey = `${API_VERSION}:user:${userId}:profile`;
```

### 2. TTL Management

**Set Appropriate TTLs**
```javascript
const CACHE_TTL = {
  USER_SESSION: 24 * 60 * 60,      // 24 hours
  USER_PROFILE: 4 * 60 * 60,       // 4 hours
  PROJECT_DATA: 60 * 60,           // 1 hour
  API_RESPONSE: 5 * 60,            // 5 minutes
  STATIC_CONFIG: 7 * 24 * 60 * 60  // 7 days
};
```

### 3. Error Handling

**Graceful Degradation**
```javascript
async function getCachedData(key, fallbackFn) {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    logger.warn('Cache read error', { key, error });
  }
  
  // Fallback to original data source
  try {
    const data = await fallbackFn();
    
    // Try to cache result (fire and forget)
    redis.set(key, JSON.stringify(data), 3600).catch(err => {
      logger.warn('Cache write error', { key, error: err });
    });
    
    return data;
  } catch (error) {
    logger.error('Fallback function error', { key, error });
    throw error;
  }
}
```

### 4. Cache Stampede Prevention

**Use Locking to Prevent Multiple Requests**
```javascript
async function getWithLock(key, fetchFn, ttl = 3600) {
  const lockKey = `lock:${key}`;
  const lockTimeout = 30; // 30 seconds
  
  // Try to get from cache first
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  // Try to acquire lock
  const locked = await redis.set(lockKey, '1', 'EX', lockTimeout, 'NX');
  
  if (locked) {
    try {
      // We got the lock, fetch the data
      const data = await fetchFn();
      await redis.set(key, JSON.stringify(data), ttl);
      return data;
    } finally {
      // Release lock
      await redis.del(lockKey);
    }
  } else {
    // Someone else is fetching, wait and try cache again
    await new Promise(resolve => setTimeout(resolve, 100));
    return getWithLock(key, fetchFn, ttl);
  }
}
```

### 5. Memory Usage Optimization

**Efficient Data Structures**
```javascript
// Use hashes for related data
await redis.hset('user:123', {
  name: 'John Doe',
  email: 'john@example.com',
  lastLogin: Date.now()
});

// Use sets for unique collections
await redis.sadd('user:123:tags', 'developer', 'premium', 'active');

// Use sorted sets for rankings
await redis.zadd('leaderboard', 1000, 'user:123');
```

## Troubleshooting

### Common Issues

#### 1. High Memory Usage

**Symptoms**: Redis memory usage approaching limit
**Solutions**:
- Analyze key patterns: `redis-cli --bigkeys`
- Check TTL settings: `redis-cli info keyspace`
- Review eviction policy: `maxmemory-policy`
- Implement data compression

#### 2. Low Hit Rate

**Symptoms**: Cache hit rate below 70%
**Solutions**:
- Review cache key naming
- Increase TTL for stable data
- Implement cache warming
- Analyze access patterns

#### 3. Cache Invalidation Issues

**Symptoms**: Stale data in cache
**Solutions**:
- Implement proper invalidation logic
- Use shorter TTLs for frequently changing data
- Add version numbers to cache keys
- Implement event-driven invalidation

#### 4. Performance Degradation

**Symptoms**: Slow cache responses
**Solutions**:
- Check Redis cluster health
- Monitor network latency
- Review connection pooling
- Optimize serialization

### Debugging Commands

```bash
# Check Redis cluster status
redis-cli cluster info
redis-cli cluster nodes

# Monitor commands in real-time
redis-cli monitor

# Analyze slow queries
redis-cli slowlog get 100

# Check memory usage by pattern
redis-cli --scan --pattern "user:*" | wc -l

# Test cache hit from Nginx
curl -I http://api.zoptal.com/api/projects
# Look for X-Cache-Status header
```

### Performance Testing

```bash
# Redis benchmark
redis-benchmark -h redis-cluster-client -p 6379 -n 100000 -c 50

# HTTP cache testing
ab -n 1000 -c 10 http://api.zoptal.com/api/projects

# Cache warming test
./scripts/performance/cache-manager.sh warm
```

## Conclusion

The Zoptal platform's caching strategy provides:

- **Multi-layer defense**: Browser, CDN, reverse proxy, and application caches
- **High performance**: Sub-100ms response times for cached content
- **Scalability**: Handles traffic spikes without database overload
- **Reliability**: Graceful degradation when cache services fail
- **Monitoring**: Comprehensive metrics and alerting
- **Maintenance**: Automated cleanup and optimization

Regular monitoring and maintenance ensure optimal cache performance and user experience. The modular design allows for easy adjustments and improvements as the platform grows.

For questions or issues with the caching system, contact the DevOps team or refer to the [operational runbooks](../operations/).