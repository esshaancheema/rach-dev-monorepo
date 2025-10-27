import { FastifyRequest, FastifyReply } from 'fastify';
import { rateLimitManager } from '../utils/redis';
import { config } from '../config';
import { z } from 'zod';

export interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
  keyGenerator?: (req: FastifyRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  handler?: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  skip?: (req: FastifyRequest) => boolean | Promise<boolean>;
  requestPropertyName?: string;
  store?: 'redis' | 'memory';
}

interface RateLimitInfo {
  allowed: boolean;
  totalHits: number;
  timeToReset: number;
  remainingPoints: number;
  limit: number;
}

/**
 * Default key generator - uses IP address by default
 */
const defaultKeyGenerator = (req: FastifyRequest): string => {
  const ip = req.headers['x-forwarded-for'] || 
    req.headers['x-real-ip'] || 
    req.socket.remoteAddress || 
    'unknown';
  
  return Array.isArray(ip) ? ip[0] : ip.toString();
};

/**
 * Default rate limit exceeded handler
 */
const defaultHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const info = req.rateLimit as RateLimitInfo;
  
  reply.header('X-RateLimit-Limit', info.limit);
  reply.header('X-RateLimit-Remaining', info.remainingPoints);
  reply.header('X-RateLimit-Reset', new Date(Date.now() + info.timeToReset).toISOString());
  reply.header('Retry-After', Math.ceil(info.timeToReset / 1000));
  
  return reply.status(429).send({
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later',
    retryAfter: info.timeToReset,
  });
};

/**
 * Rate limit middleware factory
 */
export function createRateLimitMiddleware(options: RateLimitOptions = {}) {
  const {
    maxRequests = 100,
    windowMs = 60 * 1000, // 1 minute
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    handler = defaultHandler,
    skip,
    requestPropertyName = 'rateLimit',
    store = 'redis',
  } = options;

  return async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check if should skip
      if (skip && await skip(req)) {
        return;
      }

      // Generate key
      const key = `rate_limit:${keyGenerator(req)}`;

      // Check rate limit
      const result = await rateLimitManager.checkRateLimit({
        key,
        windowMs,
        maxRequests,
      });

      // Attach rate limit info to request
      const rateLimitInfo: RateLimitInfo = {
        allowed: result.allowed,
        totalHits: result.totalHits,
        timeToReset: result.timeToReset,
        remainingPoints: result.remainingPoints,
        limit: maxRequests,
      };

      req[requestPropertyName] = rateLimitInfo;

      // Set rate limit headers
      reply.header('X-RateLimit-Limit', maxRequests);
      reply.header('X-RateLimit-Remaining', result.remainingPoints);
      reply.header('X-RateLimit-Reset', new Date(Date.now() + result.timeToReset).toISOString());

      // Handle rate limit exceeded
      if (!result.allowed) {
        return handler(req, reply);
      }

      // Skip counting based on response status
      if (skipSuccessfulRequests || skipFailedRequests) {
        reply.addHook('onResponse', async (request, response) => {
          const shouldSkip = 
            (skipSuccessfulRequests && response.statusCode < 400) ||
            (skipFailedRequests && response.statusCode >= 400);

          if (shouldSkip) {
            // Decrement the counter
            await rateLimitManager.decrementCounter(key);
          }
        });
      }
    } catch (error) {
      // If Redis is down, fail open (allow the request)
      req.log.error({ error }, 'Rate limit check failed');
      
      // In production, you might want to fail closed instead
      if (config.NODE_ENV === 'production') {
        return reply.status(503).send({
          code: 'SERVICE_UNAVAILABLE',
          message: 'Rate limiting service unavailable',
        });
      }
    }
  };
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  // Strict rate limit for authentication endpoints
  auth: createRateLimitMiddleware({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: true,
  }),

  // Login-specific rate limit
  login: createRateLimitMiddleware({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => {
      const body = req.body as { email?: string };
      const ip = defaultKeyGenerator(req);
      // Rate limit by both IP and email
      return body.email ? `${ip}:${body.email}` : ip;
    },
  }),

  // Registration rate limit
  register: createRateLimitMiddleware({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),

  // Password reset rate limit
  passwordReset: createRateLimitMiddleware({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: (req) => {
      const body = req.body as { email?: string };
      const ip = defaultKeyGenerator(req);
      return body.email ? `${ip}:${body.email}` : ip;
    },
  }),

  // API rate limit (general)
  api: createRateLimitMiddleware({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  }),

  // Strict rate limit for sensitive operations
  sensitive: createRateLimitMiddleware({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),

  // Verification endpoints
  verification: createRateLimitMiddleware({
    maxRequests: 5,
    windowMs: 30 * 60 * 1000, // 30 minutes
  }),

  // OTP verification (very strict)
  otpVerification: createRateLimitMiddleware({
    maxRequests: 3,
    windowMs: 30 * 60 * 1000, // 30 minutes
    keyGenerator: (req) => {
      const body = req.body as { email?: string };
      const ip = defaultKeyGenerator(req);
      return body.email ? `otp:${body.email}` : `otp:${ip}`;
    },
  }),
};

/**
 * Dynamic rate limit configuration schema
 */
export const dynamicRateLimitSchema = z.object({
  endpoint: z.string(),
  maxRequests: z.number().int().min(1).max(10000),
  windowMs: z.number().int().min(1000).max(3600000),
  enabled: z.boolean().default(true),
});

export type DynamicRateLimitConfig = z.infer<typeof dynamicRateLimitSchema>;

/**
 * Store for dynamic rate limit configurations
 */
class DynamicRateLimitStore {
  private configs: Map<string, DynamicRateLimitConfig> = new Map();
  private middlewares: Map<string, ReturnType<typeof createRateLimitMiddleware>> = new Map();

  /**
   * Update or create a rate limit configuration
   */
  async update(config: DynamicRateLimitConfig): Promise<void> {
    this.configs.set(config.endpoint, config);
    
    if (config.enabled) {
      const middleware = createRateLimitMiddleware({
        maxRequests: config.maxRequests,
        windowMs: config.windowMs,
      });
      this.middlewares.set(config.endpoint, middleware);
    } else {
      this.middlewares.delete(config.endpoint);
    }
  }

  /**
   * Get middleware for an endpoint
   */
  getMiddleware(endpoint: string): ReturnType<typeof createRateLimitMiddleware> | undefined {
    return this.middlewares.get(endpoint);
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): DynamicRateLimitConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Remove a configuration
   */
  remove(endpoint: string): boolean {
    this.middlewares.delete(endpoint);
    return this.configs.delete(endpoint);
  }
}

export const dynamicRateLimitStore = new DynamicRateLimitStore();

/**
 * Middleware to apply dynamic rate limits
 */
export async function dynamicRateLimitMiddleware(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const endpoint = req.routerPath;
  const middleware = dynamicRateLimitStore.getMiddleware(endpoint);
  
  if (middleware) {
    return middleware(req, reply);
  }
}

/**
 * IP-based blocking middleware
 */
export async function ipBlockingMiddleware(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const ip = defaultKeyGenerator(req);
  const isBlocked = await rateLimitManager.isIpBlocked(ip);

  if (isBlocked) {
    return reply.status(403).send({
      code: 'IP_BLOCKED',
      message: 'Your IP address has been blocked',
    });
  }
}

/**
 * Account lockout middleware
 */
export async function accountLockoutMiddleware(
  req: FastifyRequest,
  reply: FastifyReply
) {
  // This will be used after authentication to check if account is locked
  const userId = (req as any).userId;
  
  if (!userId) {
    return;
  }

  const isLocked = await rateLimitManager.isAccountLocked(userId);

  if (isLocked) {
    return reply.status(423).send({
      code: 'ACCOUNT_LOCKED',
      message: 'Your account has been temporarily locked due to too many failed login attempts',
    });
  }
}

/**
 * Track failed login attempts
 */
export async function trackFailedLogin(email: string, ip: string): Promise<void> {
  const maxAttempts = 5;
  const lockoutDuration = 30 * 60 * 1000; // 30 minutes

  const attempts = await rateLimitManager.trackFailedLogin(email, ip);

  if (attempts >= maxAttempts) {
    await rateLimitManager.lockAccount(email, lockoutDuration);
  }
}

/**
 * Clear failed login attempts on successful login
 */
export async function clearFailedLoginAttempts(email: string): Promise<void> {
  await rateLimitManager.clearFailedLoginAttempts(email);
}

// Declare module to add rate limit info to FastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    rateLimit?: RateLimitInfo;
    userId?: string;
  }
}