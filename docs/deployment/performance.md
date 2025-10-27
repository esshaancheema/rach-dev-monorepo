# Performance Optimization Guide

This guide provides comprehensive strategies and techniques for optimizing the performance of the Zoptal platform across all components.

## Table of Contents

1. [Performance Architecture](#performance-architecture)
2. [Application Performance](#application-performance)
3. [Database Optimization](#database-optimization)
4. [Caching Strategies](#caching-strategies)
5. [Load Balancing](#load-balancing)
6. [Resource Optimization](#resource-optimization)
7. [Monitoring & Profiling](#monitoring--profiling)
8. [CDN & Asset Optimization](#cdn--asset-optimization)
9. [Auto-Scaling](#auto-scaling)
10. [Performance Testing](#performance-testing)

## Performance Architecture

### High-Level Performance Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                         CDN Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │Static Assets│ │    Images   │ │  JS/CSS     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                           │
│         (Geographic routing, SSL termination)              │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│              Application Layer (Auto-scaled)               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │Web Services │ │API Services │ │AI Services  │           │
│  │(Next.js)    │ │(Node.js)    │ │(Python)     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                     Cache Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Redis     │ │  Memcached  │ │Application  │           │
│  │  (Session)  │ │   (Data)    │ │   Cache     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │Primary DB   │ │Read Replicas│ │  Analytics  │           │
│  │(Write)      │ │  (Read)     │ │     DB      │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time | < 2s | First Contentful Paint |
| API Response Time | < 200ms | 95th percentile |
| Database Query Time | < 50ms | Average |
| Time to Interactive | < 3s | Frontend apps |
| Availability | 99.9% | Monthly uptime |
| Throughput | 1000 RPS | Per service |

## Application Performance

### Node.js Service Optimization

```typescript
// Performance optimized Express setup
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cluster from 'cluster';
import { cpus } from 'os';

const app = express();

// Cluster mode for CPU utilization
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  const numWorkers = cpus().length;
  console.log(`Starting ${numWorkers} workers`);
  
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Configure as needed
  }));

  // Compression middleware
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }));

  // CORS optimization
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Connection pooling for database
  const poolConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20, // Maximum number of connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  app.listen(process.env.PORT || 4000, () => {
    console.log(`Worker ${process.pid} started`);
  });
}

// Optimized middleware for caching
export const cacheMiddleware = (duration: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    
    redisClient.get(key, (err, result) => {
      if (result) {
        res.set('X-Cache', 'HIT');
        return res.json(JSON.parse(result));
      }
      
      res.set('X-Cache', 'MISS');
      const originalSend = res.json;
      
      res.json = function(data) {
        if (res.statusCode === 200) {
          redisClient.setex(key, duration, JSON.stringify(data));
        }
        return originalSend.call(this, data);
      };
      
      next();
    });
  };
};

// Async error handling optimization
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Response time tracking
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
    
    // Send metrics to monitoring
    metricsClient.histogram('http_request_duration_ms', duration, {
      method: req.method,
      route: req.route?.path || req.originalUrl,
      status_code: res.statusCode.toString(),
    });
  });
  
  next();
};
```

### Next.js Optimization

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    domains: ['cdn.zoptal.com', 's3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Compression
  compress: true,

  // Bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },

  // Webpack optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Code splitting optimization
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
        },
      },
    };

    // Tree shaking
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    return config;
  },

  // Experimental features
  experimental: {
    // Server-side rendering optimizations
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
    
    // Bundle optimization
    optimizeCss: true,
    
    // Memory optimization
    workerThreads: false,
    
    // Performance monitoring
    instrumentationHook: true,
  },

  // Static export optimization
  trailingSlash: true,
  
  // Performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

// Component optimization
import React, { memo, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy loading heavy components
const ChartComponent = dynamic(() => import('../components/Chart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Disable SSR for heavy components
});

// Memoized component for performance
const ProjectCard = memo(({ project, onUpdate }) => {
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US').format(new Date(project.createdAt));
  }, [project.createdAt]);

  const handleUpdate = useCallback((data) => {
    onUpdate(project.id, data);
  }, [project.id, onUpdate]);

  return (
    <div className="project-card">
      <h3>{project.name}</h3>
      <p>Created: {formattedDate}</p>
      <button onClick={() => handleUpdate({ status: 'updated' })}>
        Update
      </button>
    </div>
  );
});

// Optimized data fetching
export async function getServerSideProps(context) {
  // Use Promise.all for parallel data fetching
  const [projects, analytics] = await Promise.all([
    fetchProjects(context.query.userId),
    fetchAnalytics(context.query.userId),
  ]);

  return {
    props: {
      projects,
      analytics,
    },
  };
}

// Service worker for caching
// public/sw.js
const CACHE_NAME = 'zoptal-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

## Database Optimization

### PostgreSQL Performance Tuning

```sql
-- PostgreSQL configuration optimizations
-- postgresql.conf settings

-- Memory settings
shared_buffers = 256MB                    -- 25% of available RAM
effective_cache_size = 1GB                -- 75% of available RAM
maintenance_work_mem = 64MB
work_mem = 4MB
wal_buffers = 16MB

-- Connection settings
max_connections = 200
superuser_reserved_connections = 3

-- Checkpoint settings
checkpoint_segments = 32
checkpoint_completion_target = 0.9
wal_level = replica

-- Query planning
random_page_cost = 1.1
effective_io_concurrency = 200

-- Logging
log_min_duration_statement = 1000         -- Log slow queries
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

-- Autovacuum settings
autovacuum = on
autovacuum_naptime = 1min
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50

-- Performance monitoring
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.save = on

-- Index optimization queries
-- Find missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE tablename IN (
  SELECT tablename 
  FROM pg_tables 
  WHERE schemaname = 'public'
)
AND n_distinct > 100
ORDER BY n_distinct DESC;

-- Find unused indexes
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  idx_tup_read, 
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_tup_read = 0
ORDER BY schemaname, tablename, indexname;

-- Analyze query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE calls > 100
ORDER BY total_time DESC
LIMIT 20;
```

### Database Schema Optimization

```sql
-- Optimized table structure
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Indexes for performance
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Compound indexes for common queries
CREATE INDEX CONCURRENTLY idx_users_email_active 
ON users (email) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_users_created_at 
ON users (created_at DESC);

CREATE INDEX CONCURRENTLY idx_users_name_search 
ON users USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Partitioned table for analytics data
CREATE TABLE analytics_events (
  id BIGSERIAL,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE analytics_events_2024_01 
PARTITION OF analytics_events 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Optimized JSON queries
CREATE INDEX CONCURRENTLY idx_analytics_events_data_gin 
ON analytics_events USING gin(event_data);

-- Materialized views for expensive aggregations
CREATE MATERIALIZED VIEW user_analytics_summary AS
SELECT 
  user_id,
  COUNT(*) as total_events,
  COUNT(DISTINCT event_type) as unique_events,
  MAX(created_at) as last_activity,
  AVG(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) as avg_page_views
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- Refresh materialized view periodically
CREATE INDEX ON user_analytics_summary (user_id);
REFRESH MATERIALIZED VIEW CONCURRENTLY user_analytics_summary;

-- Connection pooling with PgBouncer
-- pgbouncer.ini
[databases]
zoptal = host=postgres-service port=5432 dbname=zoptal

[pgbouncer]
listen_port = 6432
listen_addr = *
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
reserve_pool_size = 5
reserve_pool_timeout = 5
max_db_connections = 50
max_user_connections = 50
server_reset_query = DISCARD ALL
server_check_query = SELECT 1
server_check_delay = 10
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
```

### Query Optimization

```typescript
// Optimized database queries using Prisma
export class OptimizedUserService {
  // Use select to fetch only required fields
  async findUserProfile(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        // Don't fetch sensitive data like passwordHash
      },
    });
  }

  // Use include with specific fields to avoid N+1 queries
  async findUserWithProjects(userId: string) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Limit results
        },
        _count: {
          select: { projects: true },
        },
      },
    });
  }

  // Batch operations for better performance
  async updateMultipleUsers(updates: { id: string; data: any }[]) {
    const transactions = updates.map(({ id, data }) =>
      this.prisma.user.update({
        where: { id },
        data,
      })
    );

    return await this.prisma.$transaction(transactions);
  }

  // Optimized pagination
  async findUsersWithCursor(
    cursor?: string,
    limit: number = 20,
    filters?: any
  ) {
    const where = {
      deletedAt: null,
      ...filters,
    };

    const users = await this.prisma.user.findMany({
      where,
      cursor: cursor ? { id: cursor } : undefined,
      take: limit + 1, // Take one extra to check if there's a next page
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    const hasNextPage = users.length > limit;
    const items = hasNextPage ? users.slice(0, -1) : users;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
      items,
      hasNextPage,
      nextCursor,
    };
  }

  // Raw SQL for complex analytics queries
  async getUserAnalytics(userId: string, startDate: Date, endDate: Date) {
    return await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        event_type,
        COUNT(*) as count
      FROM analytics_events
      WHERE user_id = ${userId}
        AND created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE_TRUNC('day', created_at), event_type
      ORDER BY date DESC, count DESC
    `;
  }

  // Database connection optimization
  async batchFindUsers(userIds: string[]) {
    // Use IN clause for batch queries
    return await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }
}
```

## Caching Strategies

### Multi-Layer Caching

```typescript
// Redis caching service
export class CacheService {
  private redis: Redis;
  private localCache: Map<string, { data: any; expiry: number }>;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      keepAlive: 30000,
    });

    this.localCache = new Map();
    
    // Clean up local cache every 5 minutes
    setInterval(() => this.cleanupLocalCache(), 5 * 60 * 1000);
  }

  // L1: Local memory cache (fastest)
  async getLocal(key: string): Promise<any> {
    const cached = this.localCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.localCache.delete(key);
    return null;
  }

  setLocal(key: string, data: any, ttlSeconds: number = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.localCache.set(key, { data, expiry });
  }

  // L2: Redis cache (fast)
  async get(key: string): Promise<any> {
    try {
      // Try local cache first
      const localData = await this.getLocal(key);
      if (localData) return localData;

      // Try Redis cache
      const redisData = await this.redis.get(key);
      if (redisData) {
        const data = JSON.parse(redisData);
        // Populate local cache
        this.setLocal(key, data, 60); // 1 minute local cache
        return data;
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      // Set in Redis
      await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
      // Set in local cache with shorter TTL
      this.setLocal(key, data, Math.min(ttlSeconds, 300));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Cache with database fallback
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached) return cached;

    // Fetch from database
    const data = await fetcher();
    
    // Store in cache
    await this.set(key, data, ttlSeconds);
    
    return data;
  }

  // Bulk operations
  async mget(keys: string[]): Promise<Array<any>> {
    try {
      const results = await this.redis.mget(...keys);
      return results.map(result => result ? JSON.parse(result) : null);
    } catch (error) {
      console.error('Cache mget error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  async mset(items: Array<{ key: string; data: any; ttl?: number }>): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      items.forEach(({ key, data, ttl = 3600 }) => {
        pipeline.setex(key, ttl, JSON.stringify(data));
      });
      
      await pipeline.exec();
    } catch (error) {
      console.error('Cache mset error:', error);
    }
  }

  // Cache invalidation
  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  // Cache warming
  async warmCache(): Promise<void> {
    console.log('Warming cache...');
    
    // Pre-load frequently accessed data
    const warmupTasks = [
      this.warmUserCache(),
      this.warmProjectCache(),
      this.warmAnalyticsCache(),
    ];

    await Promise.all(warmupTasks);
    console.log('Cache warming completed');
  }

  private async warmUserCache(): Promise<void> {
    // Pre-load active users
    const activeUsers = await this.userService.findActiveUsers(100);
    
    const cachePromises = activeUsers.map(user => 
      this.set(`user:${user.id}`, user, 1800) // 30 minutes
    );
    
    await Promise.all(cachePromises);
  }

  private cleanupLocalCache(): void {
    const now = Date.now();
    for (const [key, { expiry }] of this.localCache.entries()) {
      if (expiry <= now) {
        this.localCache.delete(key);
      }
    }
  }
}

// HTTP response caching middleware
export const httpCacheMiddleware = (duration: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `http:${req.originalUrl}:${req.user?.id || 'anonymous'}`;
    
    try {
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', `public, max-age=${duration}`);
        return res.json(cached);
      }

      // Intercept response
      const originalSend = res.json;
      res.json = function(data) {
        if (res.statusCode === 200) {
          cacheService.set(cacheKey, data, duration);
        }
        res.set('X-Cache', 'MISS');
        res.set('Cache-Control', `public, max-age=${duration}`);
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('HTTP cache middleware error:', error);
      next();
    }
  };
};
```

### CDN Configuration

```yaml
# CloudFront distribution for Zoptal
Resources:
  ZoptalCloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Aliases:
          - cdn.zoptal.com
          - assets.zoptal.com
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt ZoptalAssetsBucket.RegionalDomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${CloudFrontOriginAccessIdentity}'
          - Id: APIOrigin
            DomainName: api.zoptal.com
            CustomOriginConfig:
              HTTPPort: 443
              OriginProtocolPolicy: https-only
              OriginSSLProtocols:
                - TLSv1.2
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
            - OPTIONS
          CachedMethods:
            - GET
            - HEAD
          Compress: true
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad  # CachingOptimized
        CacheBehaviors:
          - PathPattern: '/api/*'
            TargetOriginId: APIOrigin
            ViewerProtocolPolicy: https-only
            AllowedMethods:
              - GET
              - HEAD
              - OPTIONS
              - PUT
              - PATCH
              - POST
              - DELETE
            CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad
            TTL:
              DefaultTTL: 0
              MaxTTL: 0
          - PathPattern: '/static/*'
            TargetOriginId: S3Origin
            ViewerProtocolPolicy: redirect-to-https
            AllowedMethods:
              - GET
              - HEAD
            CachedMethods:
              - GET
              - HEAD
            Compress: true
            TTL:
              DefaultTTL: 31536000  # 1 year
              MaxTTL: 31536000
        Enabled: true
        HttpVersion: http2
        IPV6Enabled: true
        PriceClass: PriceClass_100  # US, Canada, Europe
        ViewerCertificate:
          AcmCertificateArn: !Ref SSLCertificate
          MinimumProtocolVersion: TLSv1.2_2021
          SslSupportMethod: sni-only
```

## Load Balancing

### Kubernetes Load Balancing

```yaml
# Advanced load balancing configuration
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
    service.beta.kubernetes.io/aws-load-balancer-backend-protocol: http
    service.beta.kubernetes.io/aws-load-balancer-healthcheck-interval: "10"
    service.beta.kubernetes.io/aws-load-balancer-healthcheck-timeout: "5"
    service.beta.kubernetes.io/aws-load-balancer-healthy-threshold: "2"
    service.beta.kubernetes.io/aws-load-balancer-unhealthy-threshold: "2"
spec:
  type: LoadBalancer
  selector:
    app: auth-service
  ports:
  - port: 80
    targetPort: 4000
    protocol: TCP
  sessionAffinity: None  # Use None for stateless apps

---
# Ingress with advanced load balancing
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: zoptal-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    # Load balancing method
    nginx.ingress.kubernetes.io/upstream-hash-by: "$remote_addr"
    # Connection settings
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "5"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    # Buffer settings
    nginx.ingress.kubernetes.io/proxy-buffer-size: "4k"
    nginx.ingress.kubernetes.io/proxy-buffers-number: "8"
    # Rate limiting
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.zoptal.com
    secretName: zoptal-tls
  rules:
  - host: api.zoptal.com
    http:
      paths:
      - path: /auth(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 80
      - path: /projects(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: project-service
            port:
              number: 80

---
# Pod Disruption Budget for high availability
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: auth-service-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: auth-service
```

## Resource Optimization

### Kubernetes Resource Management

```yaml
# Optimized deployment with resource limits
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      affinity:
        # Spread pods across nodes
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - auth-service
              topologyKey: kubernetes.io/hostname
      containers:
      - name: auth-service
        image: zoptal/auth-service:latest
        ports:
        - containerPort: 4000
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        # Readiness and liveness probes
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 4000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /health/live
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        # Environment optimization
        env:
        - name: NODE_ENV
          value: "production"
        - name: NODE_OPTIONS
          value: "--max-old-space-size=384"  # 75% of memory limit
        # Volume mounts for temporary files
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: app-cache
          mountPath: /app/.cache
      volumes:
      - name: tmp
        emptyDir:
          sizeLimit: 1Gi
      - name: app-cache
        emptyDir:
          sizeLimit: 500Mi

---
# Vertical Pod Autoscaler
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: auth-service-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: auth-service
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 1000m
        memory: 1Gi
      controlledResources: ["cpu", "memory"]
```

## Monitoring & Profiling

### Application Performance Monitoring

```typescript
// Performance monitoring service
import { performance, PerformanceObserver } from 'perf_hooks';
import * as prometheus from 'prom-client';

export class PerformanceMonitoringService {
  private httpDuration: prometheus.Histogram<string>;
  private dbQueryDuration: prometheus.Histogram<string>;
  private cacheHitRate: prometheus.Counter<string>;
  private memoryUsage: prometheus.Gauge<string>;

  constructor() {
    // Initialize Prometheus metrics
    this.httpDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    });

    this.dbQueryDuration = new prometheus.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2],
    });

    this.cacheHitRate = new prometheus.Counter({
      name: 'cache_operations_total',
      help: 'Total cache operations',
      labelNames: ['type', 'result'],
    });

    this.memoryUsage = new prometheus.Gauge({
      name: 'nodejs_memory_usage_bytes',
      help: 'Node.js memory usage in bytes',
      labelNames: ['type'],
    });

    // Start monitoring
    this.startMemoryMonitoring();
    this.startPerformanceObserver();
  }

  // HTTP request monitoring
  monitorHttpRequest(req: Request, res: Response): void {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      this.httpDuration
        .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
        .observe(duration);
    });
  }

  // Database query monitoring
  monitorDatabaseQuery<T>(
    operation: string,
    table: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    
    return queryFn().finally(() => {
      const duration = (Date.now() - start) / 1000;
      this.dbQueryDuration
        .labels(operation, table)
        .observe(duration);
    });
  }

  // Cache monitoring
  monitorCacheOperation(type: 'hit' | 'miss' | 'set' | 'delete'): void {
    this.cacheHitRate.labels('cache', type).inc();
  }

  // Memory monitoring
  private startMemoryMonitoring(): void {
    setInterval(() => {
      const usage = process.memoryUsage();
      this.memoryUsage.labels('rss').set(usage.rss);
      this.memoryUsage.labels('heapTotal').set(usage.heapTotal);
      this.memoryUsage.labels('heapUsed').set(usage.heapUsed);
      this.memoryUsage.labels('external').set(usage.external);
    }, 10000); // Every 10 seconds
  }

  // Performance observer for detailed metrics
  private startPerformanceObserver(): void {
    const obs = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'measure') {
          console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
        }
      });
    });

    obs.observe({ entryTypes: ['measure'] });
  }

  // Custom performance tracking
  async trackPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`Performance tracking failed for ${name}:`, error);
      throw error;
    }
  }

  // Health check endpoint
  getMetrics(): string {
    return prometheus.register.metrics();
  }

  // Performance report
  async generatePerformanceReport(): Promise<PerformanceReport> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      timestamp: new Date().toISOString(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        heapUsagePercent: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: process.uptime(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    };
  }
}

// Performance middleware
export const performanceMiddleware = (monitoring: PerformanceMonitoringService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    monitoring.monitorHttpRequest(req, res);
    next();
  };
};

interface PerformanceReport {
  timestamp: string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    heapUsagePercent: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  version: string;
  platform: string;
  arch: string;
}
```

## Auto-Scaling

### Horizontal Pod Autoscaler

```yaml
# HPA with custom metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  # CPU-based scaling
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  # Memory-based scaling
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  # Custom metric scaling (requests per second)
  - type: Pods
    pods:
      metric:
        name: requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Max

---
# Cluster Autoscaler
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      serviceAccountName: cluster-autoscaler
      containers:
      - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.21.0
        name: cluster-autoscaler
        resources:
          limits:
            cpu: 100m
            memory: 300Mi
          requests:
            cpu: 100m
            memory: 300Mi
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/zoptal-cluster
        - --balance-similar-node-groups
        - --skip-nodes-with-system-pods=false
        env:
        - name: AWS_REGION
          value: us-east-1
```

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'https://api.zoptal.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"
  processor: "./test-functions.js"
  variables:
    authToken: "{{ $randomString() }}"

scenarios:
  - name: "Authentication flow"
    weight: 30
    flow:
      - post:
          url: "/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.data.tokens.accessToken"
              as: "authToken"
      - get:
          url: "/users/profile"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - get:
          url: "/projects"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "API endpoints"
    weight: 50
    flow:
      - get:
          url: "/health"
      - get:
          url: "/projects/{{ $randomString() }}"
          headers:
            Authorization: "Bearer {{ authToken }}"
      - post:
          url: "/analytics/events"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            event: "page_view"
            data:
              page: "/dashboard"

  - name: "Heavy operations"
    weight: 20
    flow:
      - post:
          url: "/ai/completions"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            prompt: "Generate a summary"
            model: "openai-gpt4"
            maxTokens: 500
```

### Performance Testing Script

```bash
#!/bin/bash
# performance-test.sh

echo "Starting performance tests for Zoptal platform..."

# Pre-test setup
echo "Setting up test environment..."
kubectl apply -f k8s/test-namespace.yaml
kubectl create secret generic test-secrets -n test --from-env-file=.env.test

# Build and deploy test version
echo "Deploying test version..."
docker build -t zoptal/auth-service:test .
kubectl set image deployment/auth-service auth-service=zoptal/auth-service:test -n test

# Wait for deployment
kubectl rollout status deployment/auth-service -n test

# Run load tests
echo "Running load tests..."

# Test 1: Basic load test
echo "Test 1: Basic load test (100 concurrent users)"
artillery run artillery-basic.yml --output basic-test.json

# Test 2: Spike test
echo "Test 2: Spike test (500 concurrent users)"
artillery run artillery-spike.yml --output spike-test.json

# Test 3: Endurance test
echo "Test 3: Endurance test (1 hour)"
artillery run artillery-endurance.yml --output endurance-test.json

# Generate reports
echo "Generating performance reports..."
artillery report basic-test.json --output basic-report.html
artillery report spike-test.json --output spike-report.html
artillery report endurance-test.json --output endurance-report.html

# Database performance test
echo "Running database performance tests..."
kubectl exec -it postgres-pod -n test -- pgbench -i -s 10 zoptal_test
kubectl exec -it postgres-pod -n test -- pgbench -c 10 -j 2 -t 1000 zoptal_test

# Cleanup
echo "Cleaning up test environment..."
kubectl delete namespace test

echo "Performance tests completed. Check reports in the reports/ directory."

# Performance thresholds check
echo "Checking performance thresholds..."

RESPONSE_TIME_P95=$(cat basic-test.json | jq '.aggregate.latency.p95')
ERROR_RATE=$(cat basic-test.json | jq '.aggregate.codes."2xx" / .aggregate.requestsCompleted * 100')

if (( $(echo "$RESPONSE_TIME_P95 > 2000" | bc -l) )); then
  echo "❌ FAIL: Response time P95 ($RESPONSE_TIME_P95 ms) exceeds threshold (2000 ms)"
  exit 1
fi

if (( $(echo "$ERROR_RATE < 99" | bc -l) )); then
  echo "❌ FAIL: Success rate ($ERROR_RATE%) below threshold (99%)"
  exit 1
fi

echo "✅ PASS: All performance thresholds met"
echo "  - Response time P95: $RESPONSE_TIME_P95 ms"
echo "  - Success rate: $ERROR_RATE%"
```

This comprehensive performance optimization guide covers all major aspects of optimizing the Zoptal platform for production use. Each section provides practical, actionable techniques that can be implemented to achieve the performance targets outlined at the beginning.

For additional performance optimization resources:
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Kubernetes Performance Tuning](https://kubernetes.io/docs/concepts/cluster-administration/system-metrics/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- Contact performance team: performance@zoptal.com