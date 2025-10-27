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

// Redis utilities for AI service
export class AIRedisService {
  // Conversation memory management
  static async setConversation(userId: string, conversationId: string, messages: any[], expirySeconds: number = 3600): Promise<void> {
    const key = `conversation:${userId}:${conversationId}`;
    await redis.setex(key, expirySeconds, JSON.stringify(messages));
  }

  static async getConversation(userId: string, conversationId: string): Promise<any[] | null> {
    const key = `conversation:${userId}:${conversationId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async deleteConversation(userId: string, conversationId: string): Promise<void> {
    const key = `conversation:${userId}:${conversationId}`;
    await redis.del(key);
  }

  // Request caching for repeated queries
  static async cacheResponse(requestHash: string, response: any, expirySeconds: number = 1800): Promise<void> {
    const key = `ai_cache:${requestHash}`;
    await redis.setex(key, expirySeconds, JSON.stringify(response));
  }

  static async getCachedResponse(requestHash: string): Promise<any | null> {
    const key = `ai_cache:${requestHash}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Rate limiting for AI providers
  static async checkProviderRateLimit(
    provider: string,
    userId: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const window = Math.floor(now / (windowSeconds * 1000));
    const key = `rate_limit:${provider}:${userId}:${window}`;

    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    const resetTime = (window + 1) * windowSeconds * 1000;

    return {
      allowed: current <= limit,
      remaining,
      resetTime,
    };
  }

  // Model usage tracking
  static async trackModelUsage(
    provider: string,
    model: string,
    userId: string,
    tokens: number
  ): Promise<void> {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const keys = [
      `usage:${provider}:${model}:${userId}:${date}`,
      `usage:${provider}:${model}:total:${date}`,
      `usage:${provider}:total:${date}`,
    ];

    const pipeline = redis.pipeline();
    keys.forEach(key => {
      pipeline.incrby(key, tokens);
      pipeline.expire(key, 86400 * 30); // 30 days
    });
    
    await pipeline.exec();
  }

  static async getModelUsage(
    provider: string,
    model: string,
    userId: string,
    days: number = 30
  ): Promise<{ date: string; tokens: number }[]> {
    const usage: { date: string; tokens: number }[] = [];
    const pipeline = redis.pipeline();

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const key = `usage:${provider}:${model}:${userId}:${dateStr}`;
      pipeline.get(key);
    }

    const results = await pipeline.exec();
    
    results?.forEach((result, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      const dateStr = date.toISOString().slice(0, 10);
      const tokens = parseInt(result[1] as string || '0', 10);
      usage.push({ date: dateStr, tokens });
    });

    return usage.reverse();
  }

  // Queue management for AI processing
  static async addToProcessingQueue(
    queueName: string,
    job: any,
    priority: number = 0
  ): Promise<void> {
    const jobId = `job:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const jobData = {
      id: jobId,
      data: job,
      createdAt: new Date().toISOString(),
      priority,
    };

    await redis.zadd(`queue:${queueName}`, priority, JSON.stringify(jobData));
  }

  static async getNextJob(queueName: string): Promise<any | null> {
    const jobs = await redis.zrevrange(`queue:${queueName}`, 0, 0);
    
    if (jobs.length === 0) return null;

    const jobStr = jobs[0];
    await redis.zrem(`queue:${queueName}`, jobStr);
    
    return JSON.parse(jobStr);
  }

  static async getQueueLength(queueName: string): Promise<number> {
    return await redis.zcard(`queue:${queueName}`);
  }

  // Provider status tracking
  static async setProviderStatus(provider: string, status: 'healthy' | 'degraded' | 'unhealthy', responseTime?: number): Promise<void> {
    const statusData = {
      status,
      responseTime,
      lastChecked: new Date().toISOString(),
    };

    await redis.setex(`provider_status:${provider}`, 300, JSON.stringify(statusData)); // 5 minutes TTL
  }

  static async getProviderStatus(provider: string): Promise<any | null> {
    const data = await redis.get(`provider_status:${provider}`);
    return data ? JSON.parse(data) : null;
  }
}