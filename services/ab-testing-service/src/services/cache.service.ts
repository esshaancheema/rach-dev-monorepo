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

      const value = await this.client.get(key);
      
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

      const serialized = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
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

      const result = await this.client.del(key);
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

      const keys = await this.client.keys(pattern);
      
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

      const result = await this.client.exists(key);
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

      const result = await this.client.expire(key, ttlSeconds);
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

      return await this.client.ttl(key);
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

      const serialized = JSON.stringify(value);
      const result = await this.client.hSet(key, field, serialized);
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

      const value = await this.client.hGet(key, field);
      
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

      const hash = await this.client.hGetAll(key);
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

  public async hDel(key: string, field: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.client.hDel(key, field);
      return result > 0;
    } catch (error) {
      logger.error('Cache hDel operation failed', { key, field, error: error.message });
      return false;
    }
  }

  // Set operations for unique collections
  public async sAdd(key: string, member: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.client.sAdd(key, member);
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

      return await this.client.sIsMember(key, member);
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

      return await this.client.sMembers(key);
    } catch (error) {
      logger.error('Cache sMembers operation failed', { key, error: error.message });
      return [];
    }
  }

  public async sRem(key: string, member: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const result = await this.client.sRem(key, member);
      return result > 0;
    } catch (error) {
      logger.error('Cache sRem operation failed', { key, member, error: error.message });
      return false;
    }
  }

  // List operations for ordered data
  public async lPush(key: string, value: any): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }

      const serialized = JSON.stringify(value);
      return await this.client.lPush(key, serialized);
    } catch (error) {
      logger.error('Cache lPush operation failed', { key, error: error.message });
      return 0;
    }
  }

  public async lPop<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const value = await this.client.lPop(key);
      
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache lPop operation failed', { key, error: error.message });
      return null;
    }
  }

  public async lRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      if (!this.isConnected) {
        return [];
      }

      const values = await this.client.lRange(key, start, stop);
      const result: T[] = [];

      for (const value of values) {
        try {
          result.push(JSON.parse(value) as T);
        } catch {
          // Skip invalid JSON
          continue;
        }
      }

      return result;
    } catch (error) {
      logger.error('Cache lRange operation failed', { key, start, stop, error: error.message });
      return [];
    }
  }

  // Increment operations for counters
  public async incr(key: string): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }

      return await this.client.incr(key);
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

      return await this.client.incrBy(key, increment);
    } catch (error) {
      logger.error('Cache incrBy operation failed', { key, increment, error: error.message });
      return 0;
    }
  }

  public async decr(key: string): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }

      return await this.client.decr(key);
    } catch (error) {
      logger.error('Cache decr operation failed', { key, error: error.message });
      return 0;
    }
  }

  // Batch operations
  public async mGet<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (!this.isConnected || keys.length === 0) {
        return keys.map(() => null);
      }

      const values = await this.client.mGet(keys);
      
      return values.map(value => {
        if (value === null) {
          return null;
        }
        
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      logger.error('Cache mGet operation failed', { keys: keys.length, error: error.message });
      return keys.map(() => null);
    }
  }

  public async mSet(keyValuePairs: Array<{ key: string; value: any }>): Promise<boolean> {
    try {
      if (!this.isConnected || keyValuePairs.length === 0) {
        return false;
      }

      const args: string[] = [];
      
      for (const pair of keyValuePairs) {
        args.push(pair.key, JSON.stringify(pair.value));
      }

      await this.client.mSet(args);
      return true;
    } catch (error) {
      logger.error('Cache mSet operation failed', { 
        pairs: keyValuePairs.length, 
        error: error.message 
      });
      return false;
    }
  }

  // Transaction operations
  public async multi(): Promise<Redis.RedisClientMultiCommandType> {
    return this.client.multi();
  }

  // Pipeline operations for better performance
  public async pipeline<T>(operations: Array<() => Promise<T>>): Promise<T[]> {
    try {
      if (!this.isConnected) {
        return [];
      }

      const results = await Promise.all(operations.map(op => op()));
      return results;
    } catch (error) {
      logger.error('Cache pipeline operation failed', { error: error.message });
      return [];
    }
  }

  // Cache warming
  public async warmCache(data: Record<string, any>, ttlSeconds?: number): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      const keyValuePairs = Object.entries(data).map(([key, value]) => ({ key, value }));
      
      if (keyValuePairs.length > 0) {
        await this.mSet(keyValuePairs);
        
        // Set TTL for all keys if specified
        if (ttlSeconds) {
          await Promise.all(
            Object.keys(data).map(key => this.expire(key, ttlSeconds))
          );
        }
      }

      logger.info('Cache warmed successfully', { keys: keyValuePairs.length });
    } catch (error) {
      logger.error('Cache warming failed', { error: error.message });
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
      const testKey = 'health_check_test';
      const testValue = { timestamp: Date.now() };
      
      await this.set(testKey, testValue, 60);
      const retrieved = await this.get(testKey);
      await this.delete(testKey);

      if (JSON.stringify(retrieved) !== JSON.stringify(testValue)) {
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

  // Statistics
  public async getStats(): Promise<any> {
    try {
      if (!this.isConnected) {
        return {};
      }

      const info = await this.client.info();
      const lines = info.split('\r\n');
      
      const stats: any = {};
      
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          stats[key] = value;
        }
      }

      return stats;
    } catch (error) {
      logger.error('Failed to get cache stats', { error: error.message });
      return {};
    }
  }

  // Cleanup expired keys
  public async cleanup(): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      // Get keys with pattern and check TTL
      const patterns = [
        'experiment:*',
        'flag:*',
        'flag_eval:*',
        'user_assignment:*',
      ];

      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        let expiredCount = 0;

        for (const key of keys) {
          const ttl = await this.ttl(key);
          if (ttl === -1) {
            // Key has no expiration, set default TTL
            await this.expire(key, 86400); // 24 hours
          } else if (ttl === -2) {
            // Key doesn't exist or is expired
            expiredCount++;
          }
        }

        logger.debug('Cache cleanup completed for pattern', { 
          pattern, 
          totalKeys: keys.length, 
          expiredCount 
        });
      }
    } catch (error) {
      logger.error('Cache cleanup failed', { error: error.message });
    }
  }
}