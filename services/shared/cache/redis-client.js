/**
 * Redis Client Configuration for Zoptal Platform
 * Provides high-performance caching with clustering support
 */

const redis = require('ioredis');
const { promisify } = require('util');
const logger = require('../utils/logger');

class RedisClient {
  constructor(options = {}) {
    this.config = {
      // Cluster configuration
      enableReadyCheck: true,
      redisOptions: {
        password: process.env.REDIS_PASSWORD || '',
        connectTimeout: 10000,
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableOfflineQueue: false,
        // Connection pool settings
        family: 4,
        keepAlive: true,
        // Command timeout
        commandTimeout: 5000,
      },
      // Cluster-specific options
      scaleReads: 'slave',
      maxRedirections: 16,
      retryDelayOnFailover: 100,
      enableOfflineQueue: false,
      ...options
    };

    this.client = null;
    this.isCluster = process.env.REDIS_CLUSTER === 'true';
    this.connected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;

    // Performance metrics
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalCommands: 0,
      averageResponseTime: 0
    };

    this.init();
  }

  async init() {
    try {
      if (this.isCluster) {
        await this.initCluster();
      } else {
        await this.initSingle();
      }

      this.setupEventHandlers();
      this.setupHealthCheck();
      
      logger.info('Redis client initialized successfully', {
        type: this.isCluster ? 'cluster' : 'single',
        connected: this.connected
      });
    } catch (error) {
      logger.error('Failed to initialize Redis client', error);
      throw error;
    }
  }

  async initCluster() {
    const clusterNodes = [
      {
        host: process.env.REDIS_HOST || 'redis-cluster-client',
        port: process.env.REDIS_PORT || 6379
      }
    ];

    this.client = new redis.Cluster(clusterNodes, this.config);
  }

  async initSingle() {
    this.client = new redis({
      host: process.env.REDIS_HOST || 'redis-cluster-client',
      port: process.env.REDIS_PORT || 6379,
      ...this.config.redisOptions
    });
  }

  setupEventHandlers() {
    this.client.on('connect', () => {
      this.connected = true;
      this.connectionAttempts = 0;
      logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      this.metrics.errors++;
      logger.error('Redis client error', error);
    });

    this.client.on('close', () => {
      this.connected = false;
      logger.warn('Redis client connection closed');
    });

    this.client.on('reconnecting', (time) => {
      this.connectionAttempts++;
      logger.info(`Redis client reconnecting (attempt ${this.connectionAttempts})`, { delay: time });
    });

    this.client.on('end', () => {
      this.connected = false;
      logger.warn('Redis client connection ended');
    });

    // Cluster-specific events
    if (this.isCluster) {
      this.client.on('node error', (error, node) => {
        logger.error('Redis cluster node error', { error, node: node.options });
      });

      this.client.on('+node', (node) => {
        logger.info('Redis cluster node added', { node: node.options });
      });

      this.client.on('-node', (node) => {
        logger.warn('Redis cluster node removed', { node: node.options });
      });
    }
  }

  setupHealthCheck() {
    // Health check every 30 seconds
    setInterval(async () => {
      try {
        const start = Date.now();
        await this.client.ping();
        const responseTime = Date.now() - start;
        
        // Update average response time
        this.metrics.averageResponseTime = 
          (this.metrics.averageResponseTime + responseTime) / 2;
        
        logger.debug('Redis health check passed', { responseTime });
      } catch (error) {
        logger.error('Redis health check failed', error);
      }
    }, 30000);
  }

  // Cache operations with performance tracking
  async get(key) {
    const start = Date.now();
    try {
      this.metrics.totalCommands++;
      const value = await this.client.get(key);
      
      if (value !== null) {
        this.metrics.hits++;
        const parsed = this.parseValue(value);
        logger.debug('Cache hit', { key, responseTime: Date.now() - start });
        return parsed;
      } else {
        this.metrics.misses++;
        logger.debug('Cache miss', { key, responseTime: Date.now() - start });
        return null;
      }
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis GET error', { key, error });
      return null;
    }
  }

  async set(key, value, ttl = null) {
    const start = Date.now();
    try {
      this.metrics.totalCommands++;
      this.metrics.sets++;
      
      const serializedValue = this.serializeValue(value);
      
      let result;
      if (ttl) {
        result = await this.client.setex(key, ttl, serializedValue);
      } else {
        result = await this.client.set(key, serializedValue);
      }
      
      logger.debug('Cache set', { key, ttl, responseTime: Date.now() - start });
      return result === 'OK';
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis SET error', { key, error });
      return false;
    }
  }

  async del(key) {
    const start = Date.now();
    try {
      this.metrics.totalCommands++;
      this.metrics.deletes++;
      
      const result = await this.client.del(key);
      logger.debug('Cache delete', { key, deleted: result, responseTime: Date.now() - start });
      return result > 0;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis DEL error', { key, error });
      return false;
    }
  }

  async exists(key) {
    try {
      this.metrics.totalCommands++;
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis EXISTS error', { key, error });
      return false;
    }
  }

  async expire(key, ttl) {
    try {
      this.metrics.totalCommands++;
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis EXPIRE error', { key, ttl, error });
      return false;
    }
  }

  async ttl(key) {
    try {
      this.metrics.totalCommands++;
      return await this.client.ttl(key);
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis TTL error', { key, error });
      return -1;
    }
  }

  // Hash operations
  async hget(key, field) {
    try {
      this.metrics.totalCommands++;
      const value = await this.client.hget(key, field);
      return value ? this.parseValue(value) : null;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis HGET error', { key, field, error });
      return null;
    }
  }

  async hset(key, field, value) {
    try {
      this.metrics.totalCommands++;
      const serializedValue = this.serializeValue(value);
      const result = await this.client.hset(key, field, serializedValue);
      return result >= 0;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis HSET error', { key, field, error });
      return false;
    }
  }

  async hgetall(key) {
    try {
      this.metrics.totalCommands++;
      const hash = await this.client.hgetall(key);
      const parsed = {};
      
      for (const [field, value] of Object.entries(hash)) {
        parsed[field] = this.parseValue(value);
      }
      
      return parsed;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis HGETALL error', { key, error });
      return {};
    }
  }

  // List operations
  async lpush(key, ...values) {
    try {
      this.metrics.totalCommands++;
      const serializedValues = values.map(v => this.serializeValue(v));
      return await this.client.lpush(key, ...serializedValues);
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis LPUSH error', { key, error });
      return 0;
    }
  }

  async rpop(key) {
    try {
      this.metrics.totalCommands++;
      const value = await this.client.rpop(key);
      return value ? this.parseValue(value) : null;
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis RPOP error', { key, error });
      return null;
    }
  }

  async lrange(key, start, stop) {
    try {
      this.metrics.totalCommands++;
      const values = await this.client.lrange(key, start, stop);
      return values.map(v => this.parseValue(v));
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis LRANGE error', { key, start, stop, error });
      return [];
    }
  }

  // Set operations
  async sadd(key, ...members) {
    try {
      this.metrics.totalCommands++;
      const serializedMembers = members.map(m => this.serializeValue(m));
      return await this.client.sadd(key, ...serializedMembers);
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis SADD error', { key, error });
      return 0;
    }
  }

  async smembers(key) {
    try {
      this.metrics.totalCommands++;
      const members = await this.client.smembers(key);
      return members.map(m => this.parseValue(m));
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis SMEMBERS error', { key, error });
      return [];
    }
  }

  // Advanced operations
  async mget(...keys) {
    try {
      this.metrics.totalCommands++;
      const values = await this.client.mget(...keys);
      return values.map(v => v ? this.parseValue(v) : null);
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis MGET error', { keys, error });
      return new Array(keys.length).fill(null);
    }
  }

  async mset(keyValuePairs) {
    try {
      this.metrics.totalCommands++;
      const serialized = [];
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        serialized.push(key, this.serializeValue(value));
      }
      
      const result = await this.client.mset(...serialized);
      return result === 'OK';
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis MSET error', { keyValuePairs, error });
      return false;
    }
  }

  async incr(key) {
    try {
      this.metrics.totalCommands++;
      return await this.client.incr(key);
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis INCR error', { key, error });
      return null;
    }
  }

  async incrby(key, increment) {
    try {
      this.metrics.totalCommands++;
      return await this.client.incrby(key, increment);
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis INCRBY error', { key, increment, error });
      return null;
    }
  }

  // Pipeline operations for better performance
  pipeline() {
    return this.client.pipeline();
  }

  // Transaction support
  multi() {
    return this.client.multi();
  }

  // Lua script execution
  async eval(script, keys = [], args = []) {
    try {
      this.metrics.totalCommands++;
      return await this.client.eval(script, keys.length, ...keys, ...args);
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis EVAL error', { script, keys, args, error });
      return null;
    }
  }

  // Pub/Sub operations
  async publish(channel, message) {
    try {
      this.metrics.totalCommands++;
      const serializedMessage = this.serializeValue(message);
      return await this.client.publish(channel, serializedMessage);
    } catch (error) {
      this.metrics.errors++;
      logger.error('Redis PUBLISH error', { channel, error });
      return 0;
    }
  }

  subscribe(channel, callback) {
    const subscriber = this.client.duplicate();
    subscriber.subscribe(channel);
    
    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        const parsed = this.parseValue(message);
        callback(parsed);
      }
    });
    
    return subscriber;
  }

  // Cache patterns
  async getOrSet(key, fetchFunction, ttl = 3600) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const fresh = await fetchFunction();
      await this.set(key, fresh, ttl);
      return fresh;
    } catch (error) {
      logger.error('Cache getOrSet error', { key, error });
      return null;
    }
  }

  async remember(key, ttl, fetchFunction) {
    return this.getOrSet(key, fetchFunction, ttl);
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        const result = await this.client.del(...keys);
        logger.info('Cache pattern invalidated', { pattern, keysDeleted: result });
        return result;
      }
      return 0;
    } catch (error) {
      logger.error('Cache pattern invalidation error', { pattern, error });
      return 0;
    }
  }

  async invalidateByTags(tags) {
    const promises = tags.map(tag => this.invalidatePattern(`*:${tag}:*`));
    const results = await Promise.all(promises);
    return results.reduce((sum, count) => sum + count, 0);
  }

  // Serialization helpers
  serializeValue(value) {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  }

  parseValue(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value; // Return as string if not JSON
    }
  }

  // Performance and monitoring
  getMetrics() {
    const hitRate = this.metrics.totalCommands > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
      : 0;

    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100) / 100,
      connected: this.connected,
      connectionAttempts: this.connectionAttempts
    };
  }

  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      totalCommands: 0,
      averageResponseTime: 0
    };
  }

  async getInfo() {
    try {
      return await this.client.info();
    } catch (error) {
      logger.error('Redis INFO error', error);
      return null;
    }
  }

  async flushdb() {
    try {
      return await this.client.flushdb();
    } catch (error) {
      logger.error('Redis FLUSHDB error', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      this.client.disconnect();
      this.connected = false;
      logger.info('Redis client disconnected');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const start = Date.now();
      await this.client.ping();
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        connected: this.connected,
        responseTime,
        metrics: this.getMetrics()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        metrics: this.getMetrics()
      };
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down Redis client...');
  await redisClient.disconnect();
});

process.on('SIGINT', async () => {
  logger.info('Shutting down Redis client...');
  await redisClient.disconnect();
});

module.exports = redisClient;