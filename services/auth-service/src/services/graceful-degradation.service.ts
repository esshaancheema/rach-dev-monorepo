import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { getCircuitBreaker } from '../middleware/circuit-breaker.middleware';

export interface GracefulDegradationConfig {
  enableDatabaseFallback: boolean;
  enableRedisFallback: boolean;
  enableEmailFallback: boolean;
  enableSmsFallback: boolean;
  fallbackCacheTtl: number;
  maxFallbackRetries: number;
  fallbackRetryDelay: number;
}

interface FallbackCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}

interface GracefulDegradationServiceDependencies {
  prisma?: PrismaClient;
  redis?: any;
}

export function createGracefulDegradationService({
  prisma,
  redis
}: GracefulDegradationServiceDependencies = {}) {

  const config: GracefulDegradationConfig = {
    enableDatabaseFallback: true,
    enableRedisFallback: true,
    enableEmailFallback: true,
    enableSmsFallback: true,
    fallbackCacheTtl: 300000, // 5 minutes
    maxFallbackRetries: 3,
    fallbackRetryDelay: 1000 // 1 second
  };

  // In-memory fallback cache
  const fallbackCache: FallbackCache = {};

  /**
   * Database operations with graceful degradation
   */
  const databaseOperations = {
    async findUser(email: string): Promise<any | null> {
      const dbCircuitBreaker = getCircuitBreaker('database');
      
      return await dbCircuitBreaker.execute(
        async () => {
          if (!prisma) throw new Error('Prisma client not available');
          return await prisma.user.findUnique({
            where: { email },
            include: { profile: true }
          });
        },
        async () => {
          logger.warn({ email }, 'Database unavailable, using fallback cache for user lookup');
          const cacheKey = `user:${email}`;
          return getCachedData(cacheKey);
        }
      );
    },

    async createUser(userData: any): Promise<any> {
      const dbCircuitBreaker = getCircuitBreaker('database');
      
      return await dbCircuitBreaker.execute(
        async () => {
          if (!prisma) throw new Error('Prisma client not available');
          const user = await prisma.user.create({
            data: userData,
            include: { profile: true }
          });
          
          // Cache successful operations
          setCachedData(`user:${user.email}`, user);
          return user;
        },
        async () => {
          logger.error({ userData }, 'Database unavailable, cannot create user - queuing for retry');
          
          // Queue for later processing
          await queueOperation('createUser', userData);
          
          // Return temporary user object
          return {
            id: `temp_${Date.now()}`,
            email: userData.email,
            status: 'PENDING',
            createdAt: new Date(),
            isTemporary: true
          };
        }
      );
    },

    async updateUser(userId: string, updates: any): Promise<any> {
      const dbCircuitBreaker = getCircuitBreaker('database');
      
      return await dbCircuitBreaker.execute(
        async () => {
          if (!prisma) throw new Error('Prisma client not available');
          const user = await prisma.user.update({
            where: { id: userId },
            data: updates,
            include: { profile: true }
          });
          
          setCachedData(`user:${user.email}`, user);
          return user;
        },
        async () => {
          logger.warn({ userId, updates }, 'Database unavailable, queuing update operation');
          await queueOperation('updateUser', { userId, updates });
          
          // Return cached user with updates applied
          const cachedUser = getCachedData(`user_id:${userId}`);
          if (cachedUser) {
            return { ...cachedUser, ...updates, isStale: true };
          }
          
          throw new Error('User data not available in fallback cache');
        }
      );
    },

    async logActivity(activityData: any): Promise<void> {
      const dbCircuitBreaker = getCircuitBreaker('database');
      
      await dbCircuitBreaker.execute(
        async () => {
          if (!prisma) throw new Error('Prisma client not available');
          await prisma.activityLog.create({ data: activityData });
        },
        async () => {
          logger.warn('Database unavailable, queuing activity log');
          await queueOperation('logActivity', activityData);
        }
      );
    }
  };

  /**
   * Redis operations with graceful degradation
   */
  const redisOperations = {
    async get(key: string): Promise<string | null> {
      const redisCircuitBreaker = getCircuitBreaker('redis');
      
      return await redisCircuitBreaker.execute(
        async () => {
          if (!redis) throw new Error('Redis client not available');
          return await redis.get(key);
        },
        async () => {
          logger.warn({ key }, 'Redis unavailable, using in-memory fallback');
          return getCachedData(`redis:${key}`)?.data || null;
        }
      );
    },

    async set(key: string, value: string, ttl?: number): Promise<void> {
      const redisCircuitBreaker = getCircuitBreaker('redis');
      
      await redisCircuitBreaker.execute(
        async () => {
          if (!redis) throw new Error('Redis client not available');
          if (ttl) {
            await redis.setex(key, ttl, value);
          } else {
            await redis.set(key, value);
          }
        },
        async () => {
          logger.warn({ key }, 'Redis unavailable, storing in memory fallback');
          setCachedData(`redis:${key}`, value, ttl ? ttl * 1000 : undefined);
        }
      );
    },

    async incr(key: string): Promise<number> {
      const redisCircuitBreaker = getCircuitBreaker('redis');
      
      return await redisCircuitBreaker.execute(
        async () => {
          if (!redis) throw new Error('Redis client not available');
          return await redis.incr(key);
        },
        async () => {
          logger.warn({ key }, 'Redis unavailable, using in-memory counter');
          const current = getCachedData(`redis:${key}`)?.data || 0;
          const newValue = parseInt(current) + 1;
          setCachedData(`redis:${key}`, newValue.toString());
          return newValue;
        }
      );
    },

    async del(key: string): Promise<void> {
      const redisCircuitBreaker = getCircuitBreaker('redis');
      
      await redisCircuitBreaker.execute(
        async () => {
          if (!redis) throw new Error('Redis client not available');
          await redis.del(key);
        },
        async () => {
          logger.warn({ key }, 'Redis unavailable, removing from memory fallback');
          delete fallbackCache[`redis:${key}`];
        }
      );
    }
  };

  /**
   * Email operations with graceful degradation
   */
  const emailOperations = {
    async sendEmail(to: string, subject: string, content: string, template?: string): Promise<boolean> {
      const emailCircuitBreaker = getCircuitBreaker('email');
      
      return await emailCircuitBreaker.execute(
        async () => {
          // Actual email sending logic would go here
          logger.info({ to, subject }, 'Email sent successfully');
          return true;
        },
        async () => {
          logger.warn({ to, subject }, 'Email service unavailable, queuing email for later delivery');
          
          await queueOperation('sendEmail', {
            to,
            subject,
            content,
            template,
            timestamp: new Date().toISOString()
          });
          
          // For critical emails, could implement alternative delivery methods
          if (subject.includes('Password Reset') || subject.includes('Verification')) {
            logger.info({ to }, 'Critical email queued with high priority');
          }
          
          return false; // Indicate email was not sent immediately
        }
      );
    }
  };

  /**
   * SMS operations with graceful degradation
   */
  const smsOperations = {
    async sendSms(to: string, message: string): Promise<boolean> {
      const smsCircuitBreaker = getCircuitBreaker('sms');
      
      return await smsCircuitBreaker.execute(
        async () => {
          // Actual SMS sending logic would go here
          logger.info({ to }, 'SMS sent successfully');
          return true;
        },
        async () => {
          logger.warn({ to }, 'SMS service unavailable, queuing SMS for later delivery');
          
          await queueOperation('sendSms', {
            to,
            message,
            timestamp: new Date().toISOString()
          });
          
          return false; // Indicate SMS was not sent immediately
        }
      );
    }
  };

  /**
   * Cache management functions
   */
  function setCachedData(key: string, data: any, ttl?: number): void {
    const cacheTtl = ttl || config.fallbackCacheTtl;
    fallbackCache[key] = {
      data,
      timestamp: Date.now(),
      ttl: cacheTtl
    };

    // Set cleanup timer
    setTimeout(() => {
      delete fallbackCache[key];
    }, cacheTtl);
  }

  function getCachedData(key: string): any | null {
    const cached = fallbackCache[key];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      delete fallbackCache[key];
      return null;
    }

    return cached.data;
  }

  /**
   * Operation queue for failed operations
   */
  const operationQueue: Array<{
    operation: string;
    data: any;
    timestamp: number;
    retries: number;
  }> = [];

  async function queueOperation(operation: string, data: any): Promise<void> {
    operationQueue.push({
      operation,
      data,
      timestamp: Date.now(),
      retries: 0
    });

    logger.info({
      operation,
      queueLength: operationQueue.length
    }, 'Operation queued for retry when service recovers');
  }

  /**
   * Process queued operations when services recover
   */
  async function processQueuedOperations(): Promise<void> {
    if (operationQueue.length === 0) return;

    logger.info({
      queueLength: operationQueue.length
    }, 'Processing queued operations');

    const operations = [...operationQueue];
    operationQueue.length = 0; // Clear queue

    for (const queuedOp of operations) {
      try {
        if (queuedOp.retries >= config.maxFallbackRetries) {
          logger.error({
            operation: queuedOp.operation,
            retries: queuedOp.retries
          }, 'Operation exceeded max retries, dropping');
          continue;
        }

        await executeQueuedOperation(queuedOp);
        
        logger.info({
          operation: queuedOp.operation
        }, 'Queued operation processed successfully');

      } catch (error) {
        queuedOp.retries++;
        operationQueue.push(queuedOp); // Re-queue for retry
        
        logger.warn({
          operation: queuedOp.operation,
          retries: queuedOp.retries,
          error
        }, 'Queued operation failed, will retry');

        await new Promise(resolve => setTimeout(resolve, config.fallbackRetryDelay));
      }
    }
  }

  async function executeQueuedOperation(queuedOp: any): Promise<void> {
    switch (queuedOp.operation) {
      case 'createUser':
        await databaseOperations.createUser(queuedOp.data);
        break;
      case 'updateUser':
        await databaseOperations.updateUser(queuedOp.data.userId, queuedOp.data.updates);
        break;
      case 'logActivity':
        await databaseOperations.logActivity(queuedOp.data);
        break;
      case 'sendEmail':
        await emailOperations.sendEmail(
          queuedOp.data.to,
          queuedOp.data.subject,
          queuedOp.data.content,
          queuedOp.data.template
        );
        break;
      case 'sendSms':
        await smsOperations.sendSms(queuedOp.data.to, queuedOp.data.message);
        break;
      default:
        logger.warn({ operation: queuedOp.operation }, 'Unknown queued operation');
    }
  }

  /**
   * Get system degradation status
   */
  function getDegradationStatus(): {
    isHealthy: boolean;
    degradedServices: string[];
    fallbacksActive: string[];
    queuedOperations: number;
    cacheSize: number;
  } {
    const circuitBreakers = [
      { name: 'database', breaker: getCircuitBreaker('database') },
      { name: 'redis', breaker: getCircuitBreaker('redis') },
      { name: 'email', breaker: getCircuitBreaker('email') },
      { name: 'sms', breaker: getCircuitBreaker('sms') }
    ];

    const degradedServices = circuitBreakers
      .filter(cb => !cb.breaker.isAvailable())
      .map(cb => cb.name);

    const fallbacksActive = circuitBreakers
      .filter(cb => cb.breaker.getState().state !== 'CLOSED')
      .map(cb => cb.name);

    return {
      isHealthy: degradedServices.length === 0,
      degradedServices,
      fallbacksActive,
      queuedOperations: operationQueue.length,
      cacheSize: Object.keys(fallbackCache).length
    };
  }

  // Start periodic queue processing
  const queueProcessor = setInterval(processQueuedOperations, 30000); // Every 30 seconds

  return {
    database: databaseOperations,
    redis: redisOperations,
    email: emailOperations,
    sms: smsOperations,
    getDegradationStatus,
    processQueuedOperations,
    clearCache: () => {
      Object.keys(fallbackCache).forEach(key => delete fallbackCache[key]);
    },
    cleanup: () => {
      clearInterval(queueProcessor);
    }
  };
}

// Type exports
export type GracefulDegradationService = ReturnType<typeof createGracefulDegradationService>;