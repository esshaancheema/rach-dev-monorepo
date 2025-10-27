import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { createAdvancedRateLimiter, RateLimitResult } from '../services/advanced-rate-limiter.service';
import { RedisClient } from '../utils/redis';
import { PrismaClient } from '@zoptal/database';

export interface AdvancedRateLimitOptions {
  strategy?: 'fixed-window' | 'sliding-window' | 'token-bucket' | 'adaptive' | 'burst-protection';
  keyGenerator?: (request: FastifyRequest) => string;
  userBased?: boolean;
  ipBased?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (request: FastifyRequest, result: RateLimitResult) => void;
  customLimits?: {
    [endpoint: string]: {
      requests: number;
      windowMs: number;
      strategy?: string;
    };
  };
  enableAdaptive?: boolean;
  burstConfig?: {
    burstLimit: number;
    sustainedLimit: number;
    windowMs: number;
  };
}

interface AdvancedRateLimitMiddlewareDeps {
  prisma: PrismaClient;
  redis: typeof RedisClient;
}

export function createAdvancedRateLimitMiddleware(deps: AdvancedRateLimitMiddlewareDeps) {
  const rateLimiter = createAdvancedRateLimiter(deps);

  return function advancedRateLimitMiddleware(options: AdvancedRateLimitOptions = {}) {
    const {
      strategy = 'sliding-window',
      keyGenerator = defaultKeyGenerator,
      userBased = false,
      ipBased = true,
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      onLimitReached,
      customLimits = {},
      enableAdaptive = false,
      burstConfig
    } = options;

    return async function rateLimitHandler(
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      const startTime = Date.now();
      let rateLimitResult: RateLimitResult | null = null;

      try {
        // Generate rate limit key
        const key = keyGenerator(request);
        const endpoint = request.url;
        
        // Check if we should skip this request
        if (shouldSkipRequest(request, skipSuccessfulRequests, skipFailedRequests)) {
          return;
        }

        // Apply custom limits for specific endpoints
        const customLimit = customLimits[endpoint];
        let currentStrategy = strategy;
        let limits = { requests: 100, windowMs: 60000 }; // defaults

        if (customLimit) {
          limits = customLimit;
          currentStrategy = (customLimit.strategy as any) || strategy;
        }

        // User-based rate limiting
        if (userBased && isAuthenticated(request)) {
          const user = (request as any).user;
          rateLimitResult = await rateLimiter.userBasedLimiter(
            user.id,
            endpoint,
            currentStrategy as any
          );
        }
        // IP-based rate limiting
        else if (ipBased) {
          rateLimitResult = await rateLimiter.ipBasedLimiter(
            getClientIP(request),
            endpoint,
            request.headers['user-agent']
          );
        }
        // Burst protection
        else if (burstConfig) {
          rateLimitResult = await rateLimiter.burstProtectionLimiter(
            key,
            burstConfig.burstLimit,
            burstConfig.sustainedLimit,
            burstConfig.windowMs
          );
        }
        // Standard rate limiting
        else {
          const config = {
            windowMs: limits.windowMs,
            maxRequests: limits.requests,
            strategy: currentStrategy,
            skipOnError: true
          };

          switch (currentStrategy) {
            case 'fixed-window':
              rateLimitResult = await rateLimiter.fixedWindowLimiter(key, config);
              break;
            case 'token-bucket':
              rateLimitResult = await rateLimiter.tokenBucketLimiter(key, config);
              break;
            case 'adaptive':
              const adaptiveConfig = {
                baseLimit: limits.requests,
                windowMs: limits.windowMs,
                errorThreshold: 0.1,
                latencyThreshold: 1000,
                adaptationFactor: 0.2,
                recoveryRate: 0.05
              };
              rateLimitResult = await rateLimiter.adaptiveLimiter(key, config, adaptiveConfig);
              break;
            default:
              rateLimitResult = await rateLimiter.slidingWindowLimiter(key, config);
          }
        }

        // Set rate limit headers
        if (rateLimitResult) {
          setRateLimitHeaders(reply, rateLimitResult);
          
          // Check if limit exceeded
          if (!rateLimitResult.allowed) {
            // Log rate limit violation
            logger.warn({
              ip: getClientIP(request),
              endpoint,
              strategy: rateLimitResult.strategy,
              limit: rateLimitResult.limit,
              tier: rateLimitResult.tier,
              userAgent: request.headers['user-agent']
            }, 'Rate limit exceeded');

            // Call custom handler if provided
            if (onLimitReached) {
              onLimitReached(request, rateLimitResult);
            }

            // Send rate limit response
            const retryAfter = rateLimitResult.retryAfter || Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
            
            return reply.status(429).send({
              error: 'Too Many Requests',
              message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
              retryAfter,
              limit: rateLimitResult.limit,
              remaining: rateLimitResult.remaining,
              resetTime: new Date(rateLimitResult.resetTime).toISOString(),
              strategy: rateLimitResult.strategy,
              tier: rateLimitResult.tier
            });
          }
        }

        // Hook into response to update adaptive metrics
        if (enableAdaptive && rateLimitResult) {
          const originalSend = reply.send.bind(reply);
          reply.send = function(payload: any) {
            const endTime = Date.now();
            const latency = endTime - startTime;
            const success = reply.statusCode < 400;
            
            // Update adaptive metrics asynchronously
            setImmediate(async () => {
              try {
                await rateLimiter.updateAdaptiveMetrics(key, success, latency);
              } catch (error) {
                logger.error({ error }, 'Failed to update adaptive metrics');
              }
            });

            return originalSend(payload);
          };
        }

      } catch (error) {
        logger.error({ error, url: request.url }, 'Rate limiting middleware error');
        // Continue on error unless explicitly configured otherwise
      }
    };
  };

  function defaultKeyGenerator(request: FastifyRequest): string {
    const ip = getClientIP(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    return `${ip}:${request.url}:${userAgent}`;
  }

  function getClientIP(request: FastifyRequest): string {
    return (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           (request.headers['x-real-ip'] as string) ||
           request.ip ||
           'unknown';
  }

  function isAuthenticated(request: FastifyRequest): boolean {
    return !!(request as any).user;
  }

  function shouldSkipRequest(
    request: FastifyRequest,
    skipSuccessfulRequests: boolean,
    skipFailedRequests: boolean
  ): boolean {
    // Skip based on response status (this would need to be implemented differently in a real scenario)
    return false;
  }

  function setRateLimitHeaders(reply: FastifyReply, result: RateLimitResult): void {
    reply.header('X-RateLimit-Limit', result.limit);
    reply.header('X-RateLimit-Remaining', result.remaining);
    reply.header('X-RateLimit-Reset', new Date(result.resetTime).toISOString());
    reply.header('X-RateLimit-Strategy', result.strategy);
    
    if (result.tier) {
      reply.header('X-RateLimit-Tier', result.tier);
    }
    
    if (result.retryAfter) {
      reply.header('Retry-After', result.retryAfter);
    }
  }
}

/**
 * Predefined rate limiting configurations for common use cases
 */
export const rateLimitPresets = {
  // Authentication endpoints
  login: {
    strategy: 'sliding-window' as const,
    customLimits: {
      '/api/auth/login': { requests: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
    },
    ipBased: true,
    burstConfig: {
      burstLimit: 5,
      sustainedLimit: 10,
      windowMs: 15 * 60 * 1000
    }
  },

  // Registration endpoints
  registration: {
    strategy: 'token-bucket' as const,
    customLimits: {
      '/api/auth/register': { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
    },
    ipBased: true
  },

  // Password reset
  passwordReset: {
    strategy: 'fixed-window' as const,
    customLimits: {
      '/api/auth/forgot-password': { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
    },
    ipBased: true
  },

  // API endpoints for authenticated users
  userApi: {
    strategy: 'sliding-window' as const,
    userBased: true,
    enableAdaptive: true
  },

  // Admin endpoints
  adminApi: {
    strategy: 'token-bucket' as const,
    userBased: true,
    customLimits: {
      '/api/admin/*': { requests: 1000, windowMs: 60 * 1000 }
    }
  },

  // Public endpoints
  public: {
    strategy: 'sliding-window' as const,
    ipBased: true,
    customLimits: {
      '/api/health': { requests: 60, windowMs: 60 * 1000 },
      '/api/metrics': { requests: 30, windowMs: 60 * 1000 }
    }
  }
};

/**
 * Rate limiting decorator for specific routes
 */
export function rateLimited(config: AdvancedRateLimitOptions) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(request: FastifyRequest, reply: FastifyReply) {
      // Apply rate limiting logic here
      const middleware = createAdvancedRateLimitMiddleware({
        prisma: (this as any).prisma,
        redis: RedisClient
      });
      
      await middleware(config)(request, reply);
      
      // Continue with original method if not rate limited
      if (!reply.sent) {
        return method.apply(this, [request, reply]);
      }
    };
    
    return descriptor;
  };
}