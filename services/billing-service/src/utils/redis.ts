import Redis from 'ioredis';
import { redisConfig, config } from '../config';
import { logger } from './logger';

class BillingRedisService {
  private client: Redis;
  private isConnected = false;

  constructor() {
    this.client = new Redis(redisConfig.url, {
      retryDelayOnClusterDown: redisConfig.retryDelayOnClusterDown,
      retryDelayOnFailover: redisConfig.retryDelayOnFailover,
      maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
      lazyConnect: redisConfig.lazyConnect,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 3,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Connected to Redis');
    });

    this.client.on('disconnect', () => {
      this.isConnected = false;
      logger.warn('Disconnected from Redis');
    });

    this.client.on('error', (error) => {
      logger.error({ error }, 'Redis connection error');
    });

    this.client.on('reconnecting', () => {
      logger.info('Reconnecting to Redis...');
    });
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  get connected(): boolean {
    return this.isConnected;
  }

  // Subscription cache methods
  async cacheSubscription(subscriptionId: string, data: any, ttl: number = 3600): Promise<void> {
    const key = `billing:subscription:${subscriptionId}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getCachedSubscription(subscriptionId: string): Promise<any | null> {
    const key = `billing:subscription:${subscriptionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateSubscriptionCache(subscriptionId: string): Promise<void> {
    const key = `billing:subscription:${subscriptionId}`;
    await this.client.del(key);
  }

  // Customer cache methods
  async cacheCustomer(customerId: string, data: any, ttl: number = 3600): Promise<void> {
    const key = `billing:customer:${customerId}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getCachedCustomer(customerId: string): Promise<any | null> {
    const key = `billing:customer:${customerId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async invalidateCustomerCache(customerId: string): Promise<void> {
    const key = `billing:customer:${customerId}`;
    await this.client.del(key);
  }

  // Invoice cache methods
  async cacheInvoice(invoiceId: string, data: any, ttl: number = 1800): Promise<void> {
    const key = `billing:invoice:${invoiceId}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getCachedInvoice(invoiceId: string): Promise<any | null> {
    const key = `billing:invoice:${invoiceId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  // Usage tracking
  async trackUsage(
    organizationId: string, 
    metric: string, 
    quantity: number, 
    timestamp?: Date
  ): Promise<void> {
    const date = timestamp || new Date();
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    const key = `billing:usage:${organizationId}:${metric}:${dateKey}`;
    
    await this.client.incrby(key, quantity);
    await this.client.expire(key, 86400 * 90); // Keep for 90 days
  }

  async getUsage(
    organizationId: string, 
    metric: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Record<string, number>> {
    const usage: Record<string, number> = {};
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const key = `billing:usage:${organizationId}:${metric}:${dateKey}`;
      const value = await this.client.get(key);
      usage[dateKey] = value ? parseInt(value, 10) : 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return usage;
  }

  // Rate limiting
  async checkRateLimit(
    key: string, 
    limit: number, 
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `ratelimit:${key}:${window}`;
    
    const current = await this.client.incr(redisKey);
    if (current === 1) {
      await this.client.expire(redisKey, Math.ceil(windowMs / 1000));
    }
    
    const remaining = Math.max(0, limit - current);
    const resetTime = (window + 1) * windowMs;
    
    return {
      allowed: current <= limit,
      remaining,
      resetTime,
    };
  }

  // Payment processing locks
  async acquirePaymentLock(
    customerId: string, 
    paymentIntentId: string, 
    ttl: number = 300
  ): Promise<boolean> {
    const key = `billing:payment_lock:${customerId}:${paymentIntentId}`;
    const result = await this.client.set(key, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async releasePaymentLock(customerId: string, paymentIntentId: string): Promise<void> {
    const key = `billing:payment_lock:${customerId}:${paymentIntentId}`;
    await this.client.del(key);
  }

  // Webhook event deduplication
  async trackWebhookEvent(eventId: string, ttl: number = 86400): Promise<boolean> {
    const key = `billing:webhook:${eventId}`;
    const result = await this.client.set(key, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }

  // Billing metrics
  async incrementMetric(metric: string, value: number = 1): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const key = `billing:metrics:${metric}:${date}`;
    await this.client.incrby(key, value);
    await this.client.expire(key, 86400 * 30); // Keep for 30 days
  }

  async getMetrics(metric: string, days: number = 30): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const key = `billing:metrics:${metric}:${dateKey}`;
      const value = await this.client.get(key);
      metrics[dateKey] = value ? parseInt(value, 10) : 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return metrics;
  }

  // Session management
  async storeSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    const key = `billing:session:${sessionId}`;
    await this.client.setex(key, ttl, JSON.stringify(data));
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = `billing:session:${sessionId}`;
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `billing:session:${sessionId}`;
    await this.client.del(key);
  }

  // Cleanup and maintenance
  async cleanup(): Promise<void> {
    // Clean up expired keys and perform maintenance
    const patterns = [
      'billing:usage:*',
      'billing:metrics:*',
      'billing:webhook:*',
      'ratelimit:*',
    ];

    for (const pattern of patterns) {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        // Remove keys older than their TTL (if no TTL is set, they're considered expired)
        const expiredKeys = [];
        for (const key of keys) {
          const ttl = await this.client.ttl(key);
          if (ttl === -1) { // No TTL set
            expiredKeys.push(key);
          }
        }
        
        if (expiredKeys.length > 0) {
          await this.client.del(...expiredKeys);
          logger.info({ count: expiredKeys.length, pattern }, 'Cleaned up expired keys');
        }
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
    logger.info('Disconnected from Redis');
  }
}

export const BillingRedis = new BillingRedisService();