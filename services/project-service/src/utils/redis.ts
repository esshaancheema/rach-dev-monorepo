import Redis from 'ioredis';
import { redisConfig } from '../config';
import { logger } from './logger';

export const redis = new Redis(redisConfig.url, {
  retryDelayOnClusterDown: redisConfig.retryDelayOnClusterDown,
  retryDelayOnFailover: redisConfig.retryDelayOnFailover,
  maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
  lazyConnect: redisConfig.lazyConnect,
  enableReadyCheck: true,
  maxLoadingTimeout: 5000,
});

redis.on('connect', () => {
  logger.info('Redis connection established');
});

redis.on('ready', () => {
  logger.info('Redis is ready to receive commands');
});

redis.on('error', (error) => {
  logger.error({ error }, 'Redis connection error');
});

redis.on('close', () => {
  logger.info('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

// Redis utilities
export class RedisService {
  static async setWithExpiry(key: string, value: string, expirySeconds: number): Promise<void> {
    await redis.setex(key, expirySeconds, value);
  }

  static async get(key: string): Promise<string | null> {
    return await redis.get(key);
  }

  static async del(key: string): Promise<number> {
    return await redis.del(key);
  }

  static async exists(key: string): Promise<number> {
    return await redis.exists(key);
  }

  static async hset(key: string, field: string, value: string): Promise<number> {
    return await redis.hset(key, field, value);
  }

  static async hget(key: string, field: string): Promise<string | null> {
    return await redis.hget(key, field);
  }

  static async hgetall(key: string): Promise<Record<string, string>> {
    return await redis.hgetall(key);
  }

  static async sadd(key: string, ...members: string[]): Promise<number> {
    return await redis.sadd(key, ...members);
  }

  static async smembers(key: string): Promise<string[]> {
    return await redis.smembers(key);
  }

  static async srem(key: string, ...members: string[]): Promise<number> {
    return await redis.srem(key, ...members);
  }

  static async zadd(key: string, score: number, member: string): Promise<number> {
    return await redis.zadd(key, score, member);
  }

  static async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return await redis.zrange(key, start, stop);
  }

  static async zrem(key: string, ...members: string[]): Promise<number> {
    return await redis.zrem(key, ...members);
  }

  // Cache utilities
  static async cache<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    expirySeconds: number = 300
  ): Promise<T> {
    const cached = await redis.get(key);
    
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        logger.warn({ error, key }, 'Failed to parse cached value');
      }
    }

    const data = await fetcher();
    await redis.setex(key, expirySeconds, JSON.stringify(data));
    return data;
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // Session management
  static async setSession(sessionId: string, data: any, expirySeconds: number = 86400): Promise<void> {
    const key = `session:${sessionId}`;
    await redis.setex(key, expirySeconds, JSON.stringify(data));
  }

  static async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await redis.del(key);
  }

  // Rate limiting
  static async checkRateLimit(
    key: string, 
    limit: number, 
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const window = Math.floor(now / (windowSeconds * 1000));
    const rateLimitKey = `rate_limit:${key}:${window}`;

    const current = await redis.incr(rateLimitKey);
    
    if (current === 1) {
      await redis.expire(rateLimitKey, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    const resetTime = (window + 1) * windowSeconds * 1000;

    return {
      allowed: current <= limit,
      remaining,
      resetTime,
    };
  }
}