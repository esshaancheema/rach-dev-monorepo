import { Redis, RedisOptions } from 'ioredis';
import { redisConfig } from '../config';
import { logger } from './logger';
import { AUTH_CONSTANTS } from '../config/constants';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface RateLimitOptions {
  key: string;
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
}

export class RedisClient {
  private static instance: Redis;

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const options: RedisOptions = {
        retryDelayOnFailover: redisConfig.retryDelayMs,
        maxRetriesPerRequest: redisConfig.maxRetries,
        lazyConnect: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnClusterDown: redisConfig.retryDelayMs,
        enableReadyCheck: true,
        maxRetriesPerRequest: redisConfig.maxRetries,
      };

      RedisClient.instance = new Redis(redisConfig.url, options);

      RedisClient.instance.on('connect', () => {
        logger.info('✅ Connected to Redis');
      });

      RedisClient.instance.on('ready', () => {
        logger.info('✅ Redis is ready');
      });

      RedisClient.instance.on('error', (err) => {
        logger.error('❌ Redis connection error:', err);
      });

      RedisClient.instance.on('close', () => {
        logger.warn('⚠️  Redis connection closed');
      });

      RedisClient.instance.on('reconnecting', () => {
        logger.info('🔄 Reconnecting to Redis...');
      });
    }

    return RedisClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      logger.info('Disconnecting from Redis...');
      await RedisClient.instance.quit();
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const redis = RedisClient.getInstance();
      const result = await redis.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

export class CacheManager {
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour default

  constructor() {
    this.redis = RedisClient.getInstance();
  }

  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.getKey(key, options.prefix);
    const serializedValue = JSON.stringify(value);
    const ttl = options.ttl || this.defaultTTL;

    await this.redis.setex(fullKey, ttl, serializedValue);
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    const fullKey = this.getKey(key, prefix);
    const value = await this.redis.get(fullKey);
    
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Failed to parse cached value:', error);
      return null;
    }
  }

  async del(key: string, prefix?: string): Promise<void> {
    const fullKey = this.getKey(key, prefix);
    await this.redis.del(fullKey);
  }

  async exists(key: string, prefix?: string): Promise<boolean> {
    const fullKey = this.getKey(key, prefix);
    const result = await this.redis.exists(fullKey);
    return result === 1;
  }

  async ttl(key: string, prefix?: string): Promise<number> {
    const fullKey = this.getKey(key, prefix);
    return await this.redis.ttl(fullKey);
  }

  async expire(key: string, seconds: number, prefix?: string): Promise<void> {
    const fullKey = this.getKey(key, prefix);
    await this.redis.expire(fullKey, seconds);
  }

  async increment(key: string, prefix?: string): Promise<number> {
    const fullKey = this.getKey(key, prefix);
    return await this.redis.incr(fullKey);
  }

  async decrement(key: string, prefix?: string): Promise<number> {
    const fullKey = this.getKey(key, prefix);
    return await this.redis.decr(fullKey);
  }

  async setWithExpiry(key: string, value: any, seconds: number, prefix?: string): Promise<void> {
    const fullKey = this.getKey(key, prefix);
    const serializedValue = JSON.stringify(value);
    await this.redis.setex(fullKey, seconds, serializedValue);
  }

  async getPattern(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.getPattern(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export class RateLimitManager {
  private redis: Redis;
  private cache: CacheManager;

  constructor() {
    this.redis = RedisClient.getInstance();
    this.cache = new CacheManager();
  }

  async checkRateLimit(options: RateLimitOptions): Promise<{
    allowed: boolean;
    totalHits: number;
    timeToReset: number;
    remainingPoints: number;
  }> {
    const { key, maxRequests: limit, windowMs } = options;
    const windowSeconds = Math.ceil(windowMs / 1000);
    const rateLimitKey = `${AUTH_CONSTANTS.CACHE_KEYS.RATE_LIMIT}${key}`;

    try {
      // Use sliding window log algorithm with Redis sorted sets
      const now = Date.now();
      const windowStart = now - windowMs;

      // Remove expired entries
      await this.redis.zremrangebyscore(rateLimitKey, 0, windowStart);

      // Count current requests in window
      const currentCount = await this.redis.zcard(rateLimitKey);

      if (currentCount >= limit) {
        // Get time to reset
        const oldestEntry = await this.redis.zrange(rateLimitKey, 0, 0, 'WITHSCORES');
        const timeToReset = oldestEntry.length > 0 
          ? Math.ceil((parseInt(oldestEntry[1]) + windowMs - now) / 1000)
          : windowSeconds;

        return {
          allowed: false,
          totalHits: currentCount,
          timeToReset,
          remainingPoints: 0,
        };
      }

      // Add current request
      await this.redis.zadd(rateLimitKey, now, `${now}-${Math.random()}`);
      await this.redis.expire(rateLimitKey, windowSeconds);

      return {
        allowed: true,
        totalHits: currentCount + 1,
        timeToReset: windowSeconds,
        remainingPoints: limit - (currentCount + 1),
      };
    } catch (error) {
      logger.error('Rate limit check failed:', error);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        totalHits: 0,
        timeToReset: windowSeconds,
        remainingPoints: limit,
      };
    }
  }

  async resetRateLimit(key: string): Promise<void> {
    const rateLimitKey = `${AUTH_CONSTANTS.CACHE_KEYS.RATE_LIMIT}${key}`;
    await this.redis.del(rateLimitKey);
  }

  /**
   * Check if an IP is blocked
   */
  async isIpBlocked(ip: string): Promise<boolean> {
    const key = `blocked_ip:${ip}`;
    const result = await this.redis.get(key);
    return result !== null;
  }

  /**
   * Block an IP address
   */
  async blockIp(ip: string, duration?: number): Promise<void> {
    const key = `blocked_ip:${ip}`;
    if (duration) {
      await this.redis.setex(key, duration, 'blocked');
    } else {
      await this.redis.set(key, 'blocked');
    }
  }

  /**
   * Unblock an IP address
   */
  async unblockIp(ip: string): Promise<void> {
    const key = `blocked_ip:${ip}`;
    await this.redis.del(key);
  }

  /**
   * Decrement rate limit counter
   */
  async decrementCounter(key: string): Promise<void> {
    const now = Date.now();
    
    // Remove the most recent entry
    await this.redis.zremrangebyrank(key, -1, -1);
  }

  /**
   * Track failed login attempts
   */
  async trackFailedLogin(email: string, ip: string): Promise<number> {
    const key = `failed_login:${email}`;
    const now = Date.now();
    const windowMs = 30 * 60 * 1000; // 30 minutes
    
    // Add attempt
    await this.redis.zadd(key, now, `${now}:${ip}`);
    
    // Remove old attempts
    await this.redis.zremrangebyscore(key, '-inf', now - windowMs);
    
    // Count remaining attempts
    const count = await this.redis.zcard(key);
    
    // Set expiry
    await this.redis.expire(key, Math.ceil(windowMs / 1000));
    
    return count;
  }

  /**
   * Clear failed login attempts
   */
  async clearFailedLoginAttempts(email: string): Promise<void> {
    const key = `failed_login:${email}`;
    await this.redis.del(key);
  }

  /**
   * Lock account due to failed attempts
   */
  async lockAccount(email: string, duration: number): Promise<void> {
    const key = `account_locked:${email}`;
    await this.redis.setex(key, Math.ceil(duration / 1000), 'locked');
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(emailOrUserId: string): Promise<boolean> {
    const key = `account_locked:${emailOrUserId}`;
    const result = await this.redis.get(key);
    return result !== null;
  }
}

export class SessionManager {
  private cache: CacheManager;

  constructor() {
    this.cache = new CacheManager();
  }

  async createSession(userId: string, sessionData: any, expirySeconds: number = 86400): Promise<string> {
    const sessionId = this.generateSessionId();
    const sessionKey = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${sessionId}`;
    
    const sessionInfo = {
      userId,
      ...sessionData,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    await this.cache.setWithExpiry(sessionKey, sessionInfo, expirySeconds);
    
    // Also store user -> sessions mapping for multi-session management
    await this.addUserSession(userId, sessionId, expirySeconds);
    
    return sessionId;
  }

  async getSession(sessionId: string): Promise<any | null> {
    const sessionKey = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${sessionId}`;
    return await this.cache.get(sessionKey);
  }

  async updateSession(sessionId: string, data: any): Promise<void> {
    const sessionKey = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${sessionId}`;
    const session = await this.getSession(sessionId);
    
    if (session) {
      const updatedSession = {
        ...session,
        ...data,
        lastActivity: new Date().toISOString(),
      };
      
      const ttl = await this.cache.ttl(sessionKey);
      await this.cache.setWithExpiry(sessionKey, updatedSession, ttl > 0 ? ttl : 86400);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await this.removeUserSession(session.userId, sessionId);
    }
    
    const sessionKey = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${sessionId}`;
    await this.cache.del(sessionKey);
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    const userSessionsKey = `user_sessions:${userId}`;
    const sessionIds = await this.cache.get<string[]>(userSessionsKey) || [];
    
    // Delete all individual sessions
    for (const sessionId of sessionIds) {
      const sessionKey = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${sessionId}`;
      await this.cache.del(sessionKey);
    }
    
    // Clear the user sessions list
    await this.cache.del(userSessionsKey);
  }

  async getUserSessions(userId: string): Promise<string[]> {
    const userSessionsKey = `user_sessions:${userId}`;
    return await this.cache.get<string[]>(userSessionsKey) || [];
  }

  async extendSession(sessionId: string, additionalSeconds: number = 86400): Promise<void> {
    const sessionKey = `${AUTH_CONSTANTS.CACHE_KEYS.USER_SESSION}${sessionId}`;
    await this.cache.expire(sessionKey, additionalSeconds);
  }

  private async addUserSession(userId: string, sessionId: string, expirySeconds: number): Promise<void> {
    const userSessionsKey = `user_sessions:${userId}`;
    const existingSessions = await this.cache.get<string[]>(userSessionsKey) || [];
    
    // Check if we're exceeding max sessions
    if (existingSessions.length >= AUTH_CONSTANTS.SESSION.MAX_ACTIVE_SESSIONS) {
      // Remove oldest session
      const oldestSessionId = existingSessions.shift();
      if (oldestSessionId) {
        await this.deleteSession(oldestSessionId);
      }
    }
    
    existingSessions.push(sessionId);
    await this.cache.setWithExpiry(userSessionsKey, existingSessions, expirySeconds);
  }

  private async removeUserSession(userId: string, sessionId: string): Promise<void> {
    const userSessionsKey = `user_sessions:${userId}`;
    const existingSessions = await this.cache.get<string[]>(userSessionsKey) || [];
    const updatedSessions = existingSessions.filter(id => id !== sessionId);
    
    if (updatedSessions.length > 0) {
      const ttl = await this.cache.ttl(userSessionsKey);
      await this.cache.setWithExpiry(userSessionsKey, updatedSessions, ttl > 0 ? ttl : 86400);
    } else {
      await this.cache.del(userSessionsKey);
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export instances
export const redis = RedisClient.getInstance();
export const cacheManager = new CacheManager();
export const rateLimitManager = new RateLimitManager();
export const sessionManager = new SessionManager();