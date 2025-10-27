import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { config } from '../config/config';
import { logger } from '../utils/logger';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  headers?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitInfo {
  totalHits: number;
  totalTime: number;
  resetTime: Date;
}

class RedisRateLimiter {
  private redis: Redis;
  private options: Required<RateLimitOptions>;

  constructor(redis: Redis, options: RateLimitOptions) {
    this.redis = redis;
    this.options = {
      keyGenerator: (req) => req.ip || 'unknown',
      message: 'Too many requests, please try again later',
      headers: true,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options,
    };
  }

  async isAllowed(req: Request): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const key = `rate_limit:${this.options.keyGenerator(req)}`;
    const now = Date.now();
    const window = this.options.windowMs;
    const windowStart = now - window;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();
      
      // Remove old entries outside the window
      pipeline.zremrangebyscore(key, 0, windowStart);
      
      // Count current requests in window
      pipeline.zcard(key);
      
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      
      // Set expiration
      pipeline.expire(key, Math.ceil(window / 1000));
      
      const results = await pipeline.exec();
      
      if (!results) {
        throw new Error('Redis pipeline failed');
      }

      const currentCount = (results[1][1] as number) || 0;
      const allowed = currentCount < this.options.maxRequests;
      
      const resetTime = new Date(now + window);
      
      return {
        allowed,
        info: {
          totalHits: currentCount + 1,
          totalTime: window,
          resetTime,
        },
      };
    } catch (error) {
      logger.error('Rate limiter error', { error, key });
      
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        info: {
          totalHits: 0,
          totalTime: window,
          resetTime: new Date(now + window),
        },
      };
    }
  }

  middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { allowed, info } = await this.isAllowed(req);

        if (this.options.headers) {
          res.set({
            'X-RateLimit-Limit': this.options.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, this.options.maxRequests - info.totalHits).toString(),
            'X-RateLimit-Reset': info.resetTime.toISOString(),
            'X-RateLimit-Window': this.options.windowMs.toString(),
          });
        }

        if (!allowed) {
          logger.warn('Rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            totalHits: info.totalHits,
            limit: this.options.maxRequests,
          });

          res.status(429).json({
            error: 'Too Many Requests',
            message: this.options.message,
            retryAfter: Math.ceil((info.resetTime.getTime() - Date.now()) / 1000),
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Rate limiter middleware error', { error });
        next(); // Fail open
      }
    };
  }
}

// Create Redis connection for rate limiting
const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// General rate limiter
const generalLimiter = new RedisRateLimiter(redis, {
  windowMs: config.rateLimit.windowMs,
  maxRequests: config.rateLimit.maxRequests,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    const userId = req.headers['x-user-id'] as string;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
});

// GraphQL-specific rate limiter with query complexity consideration
const graphqlLimiter = new RedisRateLimiter(redis, {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // 100 GraphQL operations per minute
  keyGenerator: (req) => {
    const userId = req.headers['x-user-id'] as string;
    return userId ? `graphql:user:${userId}` : `graphql:ip:${req.ip}`;
  },
  message: 'GraphQL rate limit exceeded. Please reduce query frequency or complexity.',
});

// AI service rate limiter (more restrictive)
const aiLimiter = new RedisRateLimiter(redis, {
  windowMs: 3600000, // 1 hour
  maxRequests: 50, // 50 AI requests per hour
  keyGenerator: (req) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      throw new Error('Authentication required for AI services');
    }
    return `ai:user:${userId}`;
  },
  message: 'AI service rate limit exceeded. Please upgrade your plan for higher limits.',
});

// Export middleware functions
export const rateLimiter = generalLimiter.middleware();
export const graphqlRateLimiter = graphqlLimiter.middleware();
export const aiRateLimiter = aiLimiter.middleware();

// Custom rate limiter for specific operations
export function createCustomRateLimiter(options: RateLimitOptions) {
  const limiter = new RedisRateLimiter(redis, options);
  return limiter.middleware();
}

// Rate limit decorator for GraphQL resolvers
export function rateLimit(options: { max: number; window: string; keyFn?: (args: any, context: any) => string }) {
  const windowMs = parseTimeString(options.window);
  
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const [parent, resolverArgs, context] = args;
      
      const key = options.keyFn 
        ? options.keyFn(resolverArgs, context)
        : `resolver:${propertyName}:user:${context.user?.id || 'anonymous'}`;
        
      const limiter = new RedisRateLimiter(redis, {
        windowMs,
        maxRequests: options.max,
        keyGenerator: () => key,
      });
      
      const mockReq = { ip: context.req?.ip || 'unknown' } as Request;
      const { allowed, info } = await limiter.isAllowed(mockReq);
      
      if (!allowed) {
        throw new Error(`Rate limit exceeded for ${propertyName}. Try again in ${Math.ceil((info.resetTime.getTime() - Date.now()) / 1000)} seconds.`);
      }
      
      return method.apply(this, args);
    };
  };
}

// Helper function to parse time strings like "1h", "30m", "60s"
function parseTimeString(timeStr: string): number {
  const matches = timeStr.match(/^(\d+)([smhd])$/);
  if (!matches) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  
  const value = parseInt(matches[1], 10);
  const unit = matches[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: throw new Error(`Invalid time unit: ${unit}`);
  }
}

// Export Redis instance for cleanup
export { redis as rateLimitRedis };