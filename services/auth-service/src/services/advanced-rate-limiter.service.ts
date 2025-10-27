import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { RedisClient } from '../utils/redis';
import { z } from 'zod';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  strategy: 'fixed-window' | 'sliding-window' | 'token-bucket' | 'adaptive';
  skipOnError?: boolean;
  keyGenerator?: (request: any) => string;
  onLimitReached?: (request: any, limit: RateLimitInfo) => void;
}

export interface RateLimitInfo {
  totalHits: number;
  totalTime: number;
  timeToExpire: number;
  limit: number;
  remaining: number;
  strategy: string;
}

export interface UserTier {
  name: string;
  limits: {
    requests: number;
    windowMs: number;
    burst?: number;
  };
  features: string[];
}

export interface AdaptiveConfig {
  baseLimit: number;
  windowMs: number;
  errorThreshold: number;
  latencyThreshold: number;
  adaptationFactor: number;
  recoveryRate: number;
}

const rateLimitResultSchema = z.object({
  allowed: z.boolean(),
  limit: z.number(),
  remaining: z.number(),
  resetTime: z.number(),
  retryAfter: z.number().optional(),
  strategy: z.string(),
  tier: z.string().optional()
});

export type RateLimitResult = z.infer<typeof rateLimitResultSchema>;

interface AdvancedRateLimiterDependencies {
  prisma: PrismaClient;
  redis: typeof RedisClient;
}

export function createAdvancedRateLimiter({ prisma, redis }: AdvancedRateLimiterDependencies) {
  
  // User tier definitions
  const userTiers: Record<string, UserTier> = {
    free: {
      name: 'Free',
      limits: {
        requests: 100,
        windowMs: 60 * 1000, // 1 minute
        burst: 10
      },
      features: ['basic']
    },
    premium: {
      name: 'Premium',
      limits: {
        requests: 1000,
        windowMs: 60 * 1000,
        burst: 50
      },
      features: ['basic', 'advanced']
    },
    enterprise: {
      name: 'Enterprise',
      limits: {
        requests: 10000,
        windowMs: 60 * 1000,
        burst: 500
      },
      features: ['basic', 'advanced', 'enterprise']
    },
    admin: {
      name: 'Admin',
      limits: {
        requests: 50000,
        windowMs: 60 * 1000,
        burst: 1000
      },
      features: ['all']
    }
  };

  /**
   * Fixed window rate limiter
   */
  async function fixedWindowLimiter(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const redisClient = redis.getInstance();
    const window = Math.floor(Date.now() / config.windowMs);
    const redisKey = `fixed_window:${key}:${window}`;

    try {
      const current = await redisClient.incr(redisKey);
      
      if (current === 1) {
        await redisClient.expire(redisKey, Math.ceil(config.windowMs / 1000));
      }

      const ttl = await redisClient.ttl(redisKey);
      const resetTime = Date.now() + (ttl * 1000);

      return {
        allowed: current <= config.maxRequests,
        limit: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - current),
        resetTime,
        retryAfter: current > config.maxRequests ? ttl : undefined,
        strategy: 'fixed-window'
      };
    } catch (error) {
      logger.error({ error, key }, 'Fixed window limiter error');
      return {
        allowed: !config.skipOnError,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: Date.now() + config.windowMs,
        strategy: 'fixed-window'
      };
    }
  }

  /**
   * Sliding window rate limiter
   */
  async function slidingWindowLimiter(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const redisClient = redis.getInstance();
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const redisKey = `sliding_window:${key}`;

    try {
      // Remove old entries and add current request
      const pipe = redisClient.pipeline();
      pipe.zremrangebyscore(redisKey, 0, windowStart);
      pipe.zadd(redisKey, now, `${now}-${Math.random()}`);
      pipe.zcount(redisKey, windowStart, now);
      pipe.expire(redisKey, Math.ceil(config.windowMs / 1000));
      
      const results = await pipe.exec();
      const count = results?.[2]?.[1] as number || 0;

      return {
        allowed: count <= config.maxRequests,
        limit: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - count),
        resetTime: now + config.windowMs,
        retryAfter: count > config.maxRequests ? Math.ceil(config.windowMs / 1000) : undefined,
        strategy: 'sliding-window'
      };
    } catch (error) {
      logger.error({ error, key }, 'Sliding window limiter error');
      return {
        allowed: !config.skipOnError,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: now + config.windowMs,
        strategy: 'sliding-window'
      };
    }
  }

  /**
   * Token bucket rate limiter
   */
  async function tokenBucketLimiter(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const redisClient = redis.getInstance();
    const now = Date.now();
    const redisKey = `token_bucket:${key}`;
    
    // Refill rate: tokens per millisecond
    const refillRate = config.maxRequests / config.windowMs;

    try {
      const bucketData = await redisClient.hmget(redisKey, 'tokens', 'lastRefill');
      let tokens = bucketData[0] ? parseFloat(bucketData[0]) : config.maxRequests;
      let lastRefill = bucketData[1] ? parseInt(bucketData[1]) : now;

      // Calculate tokens to add based on time elapsed
      const timeDelta = now - lastRefill;
      const tokensToAdd = timeDelta * refillRate;
      tokens = Math.min(config.maxRequests, tokens + tokensToAdd);

      const allowed = tokens >= 1;
      if (allowed) {
        tokens -= 1;
      }

      // Update bucket state
      await redisClient.hmset(redisKey, 'tokens', tokens.toString(), 'lastRefill', now.toString());
      await redisClient.expire(redisKey, Math.ceil(config.windowMs / 1000));

      return {
        allowed,
        limit: config.maxRequests,
        remaining: Math.floor(tokens),
        resetTime: now + ((config.maxRequests - tokens) / refillRate),
        retryAfter: allowed ? undefined : Math.ceil((1 - tokens) / refillRate / 1000),
        strategy: 'token-bucket'
      };
    } catch (error) {
      logger.error({ error, key }, 'Token bucket limiter error');
      return {
        allowed: !config.skipOnError,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: now + config.windowMs,
        strategy: 'token-bucket'
      };
    }
  }

  /**
   * Adaptive rate limiter - adjusts limits based on system performance
   */
  async function adaptiveLimiter(
    key: string,
    config: RateLimitConfig,
    adaptiveConfig: AdaptiveConfig
  ): Promise<RateLimitResult> {
    const redisClient = redis.getInstance();
    const now = Date.now();
    const metricsKey = `adaptive_metrics:${key}`;
    const limitsKey = `adaptive_limits:${key}`;

    try {
      // Get current metrics
      const metrics = await redisClient.hmget(metricsKey, 'errors', 'requests', 'totalLatency', 'lastUpdate');
      const currentLimits = await redisClient.hget(limitsKey, 'currentLimit');

      let errors = metrics[0] ? parseInt(metrics[0]) : 0;
      let requests = metrics[1] ? parseInt(metrics[1]) : 0;
      let totalLatency = metrics[2] ? parseInt(metrics[2]) : 0;
      let lastUpdate = metrics[3] ? parseInt(metrics[3]) : now;
      let currentLimit = currentLimits ? parseInt(currentLimits) : adaptiveConfig.baseLimit;

      // Calculate error rate and average latency
      const errorRate = requests > 0 ? errors / requests : 0;
      const avgLatency = requests > 0 ? totalLatency / requests : 0;

      // Adapt limits based on performance
      if (errorRate > adaptiveConfig.errorThreshold || avgLatency > adaptiveConfig.latencyThreshold) {
        // Reduce limit
        currentLimit = Math.max(1, Math.floor(currentLimit * (1 - adaptiveConfig.adaptationFactor)));
      } else if (errorRate < adaptiveConfig.errorThreshold / 2 && avgLatency < adaptiveConfig.latencyThreshold / 2) {
        // Increase limit gradually
        currentLimit = Math.min(adaptiveConfig.baseLimit * 2, Math.floor(currentLimit * (1 + adaptiveConfig.recoveryRate)));
      }

      // Use sliding window with adaptive limit
      const adaptiveWindowConfig: RateLimitConfig = {
        ...config,
        maxRequests: currentLimit
      };

      const result = await slidingWindowLimiter(key, adaptiveWindowConfig);

      // Update limits
      await redisClient.hset(limitsKey, 'currentLimit', currentLimit.toString());
      await redisClient.expire(limitsKey, 3600); // 1 hour

      return {
        ...result,
        strategy: 'adaptive',
        tier: `adaptive-${currentLimit}`
      };
    } catch (error) {
      logger.error({ error, key }, 'Adaptive limiter error');
      return {
        allowed: !config.skipOnError,
        limit: adaptiveConfig.baseLimit,
        remaining: 0,
        resetTime: now + config.windowMs,
        strategy: 'adaptive'
      };
    }
  }

  /**
   * Update adaptive metrics
   */
  async function updateAdaptiveMetrics(
    key: string,
    success: boolean,
    latency: number
  ): Promise<void> {
    const redisClient = redis.getInstance();
    const metricsKey = `adaptive_metrics:${key}`;
    const now = Date.now();

    try {
      const pipe = redisClient.pipeline();
      pipe.hincrby(metricsKey, 'requests', 1);
      pipe.hincrby(metricsKey, 'totalLatency', latency);
      
      if (!success) {
        pipe.hincrby(metricsKey, 'errors', 1);
      }
      
      pipe.hset(metricsKey, 'lastUpdate', now.toString());
      pipe.expire(metricsKey, 3600); // 1 hour
      
      await pipe.exec();
    } catch (error) {
      logger.error({ error, key }, 'Failed to update adaptive metrics');
    }
  }

  /**
   * Get user tier based on user role and subscription
   */
  async function getUserTier(userId: string): Promise<UserTier> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        return userTiers.free;
      }

      switch (user.role) {
        case 'ADMIN':
        case 'SUPER_ADMIN':
          return userTiers.admin;
        case 'PREMIUM':
          return userTiers.premium;
        case 'ENTERPRISE':
          return userTiers.enterprise;
        default:
          return userTiers.free;
      }
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user tier');
      return userTiers.free;
    }
  }

  /**
   * User-based rate limiting
   */
  async function userBasedLimiter(
    userId: string,
    endpoint: string,
    strategy: 'fixed-window' | 'sliding-window' | 'token-bucket' = 'sliding-window'
  ): Promise<RateLimitResult> {
    const tier = await getUserTier(userId);
    const key = `user:${userId}:${endpoint}`;
    
    const config: RateLimitConfig = {
      windowMs: tier.limits.windowMs,
      maxRequests: tier.limits.requests,
      strategy,
      skipOnError: true
    };

    let result: RateLimitResult;

    switch (strategy) {
      case 'fixed-window':
        result = await fixedWindowLimiter(key, config);
        break;
      case 'token-bucket':
        result = await tokenBucketLimiter(key, config);
        break;
      default:
        result = await slidingWindowLimiter(key, config);
    }

    return {
      ...result,
      tier: tier.name
    };
  }

  /**
   * IP-based rate limiting with geolocation consideration
   */
  async function ipBasedLimiter(
    ip: string,
    endpoint: string,
    userAgent?: string
  ): Promise<RateLimitResult> {
    // Different limits for different endpoints
    const endpointLimits: Record<string, { requests: number; windowMs: number }> = {
      '/api/auth/login': { requests: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
      '/api/auth/register': { requests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
      '/api/auth/forgot-password': { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
      '/api/auth/verify-email': { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
      default: { requests: 100, windowMs: 60 * 1000 } // 100 per minute
    };

    const limits = endpointLimits[endpoint] || endpointLimits.default;
    const key = `ip:${ip}:${endpoint}`;

    const config: RateLimitConfig = {
      windowMs: limits.windowMs,
      maxRequests: limits.requests,
      strategy: 'sliding-window',
      skipOnError: true
    };

    return slidingWindowLimiter(key, config);
  }

  /**
   * Burst protection - allows short bursts but enforces overall limits
   */
  async function burstProtectionLimiter(
    key: string,
    burstLimit: number,
    sustainedLimit: number,
    windowMs: number
  ): Promise<RateLimitResult> {
    const redisClient = redis.getInstance();
    const now = Date.now();
    const burstKey = `burst:${key}`;
    const sustainedKey = `sustained:${key}`;

    try {
      // Check burst limit (last 10 seconds)
      const burstWindow = 10 * 1000;
      const burstStart = now - burstWindow;
      
      const pipe = redisClient.pipeline();
      pipe.zremrangebyscore(burstKey, 0, burstStart);
      pipe.zadd(burstKey, now, `${now}-${Math.random()}`);
      pipe.zcount(burstKey, burstStart, now);
      pipe.expire(burstKey, 10);

      // Check sustained limit
      const sustainedStart = now - windowMs;
      pipe.zremrangebyscore(sustainedKey, 0, sustainedStart);
      pipe.zadd(sustainedKey, now, `${now}-${Math.random()}`);
      pipe.zcount(sustainedKey, sustainedStart, now);
      pipe.expire(sustainedKey, Math.ceil(windowMs / 1000));

      const results = await pipe.exec();
      const burstCount = results?.[2]?.[1] as number || 0;
      const sustainedCount = results?.[6]?.[1] as number || 0;

      const burstExceeded = burstCount > burstLimit;
      const sustainedExceeded = sustainedCount > sustainedLimit;

      return {
        allowed: !burstExceeded && !sustainedExceeded,
        limit: sustainedLimit,
        remaining: Math.max(0, sustainedLimit - sustainedCount),
        resetTime: now + windowMs,
        retryAfter: burstExceeded ? 10 : (sustainedExceeded ? Math.ceil(windowMs / 1000) : undefined),
        strategy: 'burst-protection'
      };
    } catch (error) {
      logger.error({ error, key }, 'Burst protection limiter error');
      return {
        allowed: true,
        limit: sustainedLimit,
        remaining: sustainedLimit,
        resetTime: now + windowMs,
        strategy: 'burst-protection'
      };
    }
  }

  /**
   * Get rate limit status without consuming quota
   */
  async function getRateLimitStatus(key: string, strategy: string): Promise<RateLimitInfo> {
    const redisClient = redis.getInstance();
    
    try {
      let info: Partial<RateLimitInfo> = { strategy };

      switch (strategy) {
        case 'sliding-window':
          const slidingKey = `sliding_window:${key}`;
          const now = Date.now();
          const windowMs = 60000; // Default 1 minute
          const windowStart = now - windowMs;
          const count = await redisClient.zcount(slidingKey, windowStart, now);
          
          info = {
            totalHits: count,
            totalTime: windowMs,
            timeToExpire: windowMs,
            limit: 100, // Default limit
            remaining: Math.max(0, 100 - count),
            strategy: 'sliding-window'
          };
          break;

        case 'token-bucket':
          const bucketKey = `token_bucket:${key}`;
          const bucketData = await redisClient.hmget(bucketKey, 'tokens', 'lastRefill');
          const tokens = bucketData[0] ? parseFloat(bucketData[0]) : 100;
          
          info = {
            totalHits: 100 - tokens,
            totalTime: 60000,
            timeToExpire: 60000,
            limit: 100,
            remaining: Math.floor(tokens),
            strategy: 'token-bucket'
          };
          break;
      }

      return info as RateLimitInfo;
    } catch (error) {
      logger.error({ error, key, strategy }, 'Failed to get rate limit status');
      throw error;
    }
  }

  /**
   * Clear rate limit for a key (admin function)
   */
  async function clearRateLimit(key: string): Promise<void> {
    const redisClient = redis.getInstance();
    
    try {
      const patterns = [
        `fixed_window:${key}:*`,
        `sliding_window:${key}`,
        `token_bucket:${key}`,
        `adaptive_metrics:${key}`,
        `adaptive_limits:${key}`,
        `burst:${key}`,
        `sustained:${key}`
      ];

      for (const pattern of patterns) {
        if (pattern.includes('*')) {
          const keys = await redisClient.keys(pattern);
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } else {
          await redisClient.del(pattern);
        }
      }

      logger.info({ key }, 'Rate limit cleared');
    } catch (error) {
      logger.error({ error, key }, 'Failed to clear rate limit');
      throw error;
    }
  }

  return {
    fixedWindowLimiter,
    slidingWindowLimiter,
    tokenBucketLimiter,
    adaptiveLimiter,
    updateAdaptiveMetrics,
    getUserTier,
    userBasedLimiter,
    ipBasedLimiter,
    burstProtectionLimiter,
    getRateLimitStatus,
    clearRateLimit,
    userTiers
  };
}

// Type exports
export type AdvancedRateLimiter = ReturnType<typeof createAdvancedRateLimiter>;