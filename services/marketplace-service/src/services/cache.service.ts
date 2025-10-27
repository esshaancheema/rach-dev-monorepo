import Redis from 'redis';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export class CacheService {
  private client: Redis.RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = Redis.createClient({
      url: config.redis.url,
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
      },
      password: config.redis.password,
      database: config.redis.db,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error', { error: error.message });
      this.isConnected = false;
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.info('Redis client disconnected');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
      logger.info('✅ Cache service connected successfully');
    } catch (error) {
      logger.error('❌ Failed to connect to Redis', { error: error.message });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Cache service disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from Redis', { error: error.message });
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        logger.warn('Cache not connected, skipping get operation', { key });
        return null;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      const value = await this.client.get(prefixedKey);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get operation failed', { key, error: error.message });
      return null;
    }
  }

  public async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Cache not connected, skipping set operation', { key });
        return false;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.client.setEx(prefixedKey, ttlSeconds, serialized);
      } else {
        await this.client.set(prefixedKey, serialized);
      }

      return true;
    } catch (error) {
      logger.error('Cache set operation failed', { key, error: error.message });
      return false;
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Cache not connected, skipping delete operation', { key });
        return false;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      const result = await this.client.del(prefixedKey);
      return result > 0;
    } catch (error) {
      logger.error('Cache delete operation failed', { key, error: error.message });
      return false;
    }
  }

  public async deletePattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
        logger.warn('Cache not connected, skipping delete pattern operation', { pattern });
        return 0;
      }

      const prefixedPattern = `${config.redis.keyPrefix}${pattern}`;
      const keys = await this.client.keys(prefixedPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.client.del(keys);
      logger.debug('Deleted keys matching pattern', { pattern, count: result });
      
      return result;
    } catch (error) {
      logger.error('Cache delete pattern operation failed', { pattern, error: error.message });
      return 0;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      const result = await this.client.exists(prefixedKey);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists operation failed', { key, error: error.message });
      return false;
    }
  }

  public async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      const result = await this.client.expire(prefixedKey, ttlSeconds);
      return result;
    } catch (error) {
      logger.error('Cache expire operation failed', { key, ttlSeconds, error: error.message });
      return false;
    }
  }

  public async ttl(key: string): Promise<number> {
    try {
      if (!this.isConnected) {
        return -1;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      return await this.client.ttl(prefixedKey);
    } catch (error) {
      logger.error('Cache TTL operation failed', { key, error: error.message });
      return -1;
    }
  }

  // Hash operations for complex data structures
  public async hSet(key: string, field: string, value: any): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      const serialized = JSON.stringify(value);
      const result = await this.client.hSet(prefixedKey, field, serialized);
      return result > 0;
    } catch (error) {
      logger.error('Cache hSet operation failed', { key, field, error: error.message });
      return false;
    }
  }

  public async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      const value = await this.client.hGet(prefixedKey, field);
      
      if (value === undefined) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache hGet operation failed', { key, field, error: error.message });
      return null;
    }
  }

  public async hGetAll<T>(key: string): Promise<Record<string, T>> {
    try {
      if (!this.isConnected) {
        return {};
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      const hash = await this.client.hGetAll(prefixedKey);
      const result: Record<string, T> = {};

      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value) as T;
        } catch {
          // Skip invalid JSON
          continue;
        }
      }

      return result;
    } catch (error) {
      logger.error('Cache hGetAll operation failed', { key, error: error.message });
      return {};
    }
  }

  // Set operations for unique collections
  public async sAdd(key: string, member: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      const result = await this.client.sAdd(prefixedKey, member);
      return result > 0;
    } catch (error) {
      logger.error('Cache sAdd operation failed', { key, member, error: error.message });
      return false;
    }
  }

  public async sIsMember(key: string, member: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      return await this.client.sIsMember(prefixedKey, member);
    } catch (error) {
      logger.error('Cache sIsMember operation failed', { key, member, error: error.message });
      return false;
    }
  }

  public async sMembers(key: string): Promise<string[]> {
    try {
      if (!this.isConnected) {
        return [];
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      return await this.client.sMembers(prefixedKey);
    } catch (error) {
      logger.error('Cache sMembers operation failed', { key, error: error.message });
      return [];
    }
  }

  // Increment operations for counters
  public async incr(key: string): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      return await this.client.incr(prefixedKey);
    } catch (error) {
      logger.error('Cache incr operation failed', { key, error: error.message });
      return 0;
    }
  }

  public async incrBy(key: string, increment: number): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }

      const prefixedKey = `${config.redis.keyPrefix}${key}`;
      return await this.client.incrBy(prefixedKey, increment);
    } catch (error) {
      logger.error('Cache incrBy operation failed', { key, increment, error: error.message });
      return 0;
    }
  }

  // Health check
  public async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (!this.isConnected) {
        return {
          status: 'unhealthy',
          details: { error: 'Not connected to Redis' },
        };
      }

      // Test basic operations
      const testKey = `${config.redis.keyPrefix}health_check_test`;
      const testValue = { timestamp: Date.now() };
      
      await this.client.set(testKey, JSON.stringify(testValue), { EX: 60 });
      const retrieved = await this.client.get(testKey);
      await this.client.del(testKey);

      if (JSON.stringify(testValue) !== retrieved) {
        return {
          status: 'unhealthy',
          details: { error: 'Data integrity test failed' },
        };
      }

      // Get Redis info
      const info = await this.client.info();
      const lines = info.split('\r\n');
      const memoryInfo = lines.find(line => line.startsWith('used_memory_human:'));
      const connectionsInfo = lines.find(line => line.startsWith('connected_clients:'));

      return {
        status: 'healthy',
        details: {
          connected: this.isConnected,
          memory: memoryInfo?.split(':')[1] || 'unknown',
          connections: connectionsInfo?.split(':')[1] || 'unknown',
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { error: error.message },
      };
    }
  }
}