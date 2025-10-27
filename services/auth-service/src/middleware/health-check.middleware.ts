import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import Redis from 'ioredis';
import { config } from '../config';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    [key: string]: ServiceHealth;
  };
  system: SystemHealth;
  dependencies: DependencyHealth[];
  metrics: HealthMetrics;
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastCheck: string;
  details?: any;
  error?: string;
}

export interface SystemHealth {
  memory: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  cpu: {
    usage: number;
  };
  disk: {
    used: number;
    free: number;
    total: number;
    usage: number;
  };
  uptime: number;
  nodeVersion: string;
  pid: number;
}

export interface DependencyHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  version?: string;
  details?: any;
  error?: string;
}

export interface HealthMetrics {
  requests: {
    total: number;
    perSecond: number;
    errors: number;
    errorRate: number;
  };
  connections: {
    active: number;
    total: number;
  };
  authentication: {
    activeUsers: number;
    activeSessions: number;
    loginAttempts: {
      total: number;
      successful: number;
      failed: number;
      blocked: number;
    };
  };
}

interface HealthCheckDependencies {
  prisma: PrismaClient;
  redis: Redis;
  fastify: FastifyInstance;
}

export class HealthCheckService {
  private startTime: number;
  private requestCount: number = 0;
  private errorCount: number = 0;
  private lastMinuteRequests: number[] = [];
  private dependencies: HealthCheckDependencies;

  constructor(dependencies: HealthCheckDependencies) {
    this.startTime = Date.now();
    this.dependencies = dependencies;
    
    // Initialize metrics tracking
    this.initializeMetricsTracking();
  }

  private initializeMetricsTracking(): void {
    // Track requests per minute
    setInterval(() => {
      this.lastMinuteRequests.push(this.requestCount);
      if (this.lastMinuteRequests.length > 60) {
        this.lastMinuteRequests.shift();
      }
      this.requestCount = 0;
    }, 1000);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(detailed: boolean = false): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Collect all health data in parallel
      const [
        databaseHealth,
        redisHealth,
        systemHealth,
        dependencyHealth,
        metrics
      ] = await Promise.allSettled([
        this.checkDatabase(),
        this.checkRedis(),
        this.getSystemHealth(),
        this.checkDependencies(),
        this.getHealthMetrics()
      ]);

      // Determine overall status
      const services = {
        database: this.getResultValue(databaseHealth),
        redis: this.getResultValue(redisHealth),
      };

      const overallStatus = this.determineOverallStatus(services);
      
      const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: config.NODE_ENV,
        services,
        system: this.getResultValue(systemHealth),
        dependencies: this.getResultValue(dependencyHealth),
        metrics: this.getResultValue(metrics)
      };

      // Log health check if unhealthy
      if (overallStatus !== 'healthy') {
        logger.warn({ 
          healthCheck: result, 
          duration: Date.now() - startTime 
        }, 'Health check shows degraded/unhealthy status');
      }

      return result;
    } catch (error) {
      logger.error({ error }, 'Health check failed');
      
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: config.NODE_ENV,
        services: {},
        system: await this.getSystemHealth(),
        dependencies: [],
        metrics: {
          requests: { total: 0, perSecond: 0, errors: 0, errorRate: 0 },
          connections: { active: 0, total: 0 },
          authentication: { 
            activeUsers: 0, 
            activeSessions: 0, 
            loginAttempts: { total: 0, successful: 0, failed: 0, blocked: 0 }
          }
        }
      };
    }
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Basic connectivity test
      await this.dependencies.prisma.$queryRaw`SELECT 1`;
      
      // Performance test - count users
      const userCount = await this.dependencies.prisma.user.count();
      
      // Check connection pool status
      const poolStatus = (this.dependencies.prisma as any)._engine?.connectionInfo;
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime > 1000 ? 'degraded' : 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          userCount,
          poolStatus: poolStatus || 'unknown',
          version: 'PostgreSQL 15+',
          connectionString: config.DATABASE_URL?.split('@')[1] || 'unknown'
        }
      };
    } catch (error) {
      logger.error({ error }, 'Database health check failed');
      
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  /**
   * Check Redis connectivity and performance
   */
  private async checkRedis(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Basic connectivity test
      const pong = await this.dependencies.redis.ping();
      
      if (pong !== 'PONG') {
        throw new Error('Redis ping returned unexpected response');
      }
      
      // Performance test - set and get a test key
      const testKey = `health:${Date.now()}`;
      await this.dependencies.redis.set(testKey, 'test', 'EX', 10);
      const testValue = await this.dependencies.redis.get(testKey);
      await this.dependencies.redis.del(testKey);
      
      if (testValue !== 'test') {
        throw new Error('Redis set/get test failed');
      }
      
      // Get Redis info
      const info = await this.dependencies.redis.info();
      const memory = await this.dependencies.redis.info('memory');
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime > 500 ? 'degraded' : 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          version: this.parseRedisInfo(info, 'redis_version'),
          memoryUsed: this.parseRedisInfo(memory, 'used_memory_human'),
          connectedClients: this.parseRedisInfo(info, 'connected_clients'),
          uptime: this.parseRedisInfo(info, 'uptime_in_seconds')
        }
      };
    } catch (error) {
      logger.error({ error }, 'Redis health check failed');
      
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown Redis error'
      };
    }
  }

  /**
   * Get system health information
   */
  private async getSystemHealth(): Promise<SystemHealth> {
    const memUsage = process.memoryUsage();
    const totalMem = process.env.MEMORY_LIMIT ? 
      parseInt(process.env.MEMORY_LIMIT) : 
      Math.round(memUsage.heapTotal * 4); // Estimate based on heap

    return {
      memory: {
        used: memUsage.heapUsed,
        free: totalMem - memUsage.heapUsed,
        total: totalMem,
        usage: (memUsage.heapUsed / totalMem) * 100
      },
      cpu: {
        usage: process.cpuUsage().user / 1000000 // Convert to percentage approximation
      },
      disk: {
        used: 0, // Would need fs.statSync to get real disk usage
        free: 0,
        total: 0,
        usage: 0
      },
      uptime: process.uptime(),
      nodeVersion: process.version,
      pid: process.pid
    };
  }

  /**
   * Check external dependencies
   */
  private async checkDependencies(): Promise<DependencyHealth[]> {
    const dependencies: DependencyHealth[] = [];
    
    // Check SendGrid (if configured)
    if (config.SENDGRID_API_KEY) {
      dependencies.push(await this.checkSendGrid());
    }
    
    // Check Twilio (if configured)
    if (config.TWILIO_ACCOUNT_SID) {
      dependencies.push(await this.checkTwilio());
    }
    
    return dependencies;
  }

  /**
   * Check SendGrid service
   */
  private async checkSendGrid(): Promise<DependencyHealth> {
    const startTime = Date.now();
    
    try {
      // Simple API key validation request
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.SENDGRID_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'SendGrid',
          status: 'healthy',
          responseTime,
          details: {
            endpoint: 'https://api.sendgrid.com',
            username: data.username || 'unknown'
          }
        };
      } else {
        return {
          name: 'SendGrid',
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        name: 'SendGrid',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown SendGrid error'
      };
    }
  }

  /**
   * Check Twilio service
   */
  private async checkTwilio(): Promise<DependencyHealth> {
    const startTime = Date.now();
    
    try {
      // Check account status
      const auth = Buffer.from(`${config.TWILIO_ACCOUNT_SID}:${config.TWILIO_AUTH_TOKEN}`).toString('base64');
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.TWILIO_ACCOUNT_SID}.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        return {
          name: 'Twilio',
          status: data.status === 'active' ? 'healthy' : 'degraded',
          responseTime,
          details: {
            accountSid: config.TWILIO_ACCOUNT_SID,
            status: data.status,
            type: data.type
          }
        };
      } else {
        return {
          name: 'Twilio',
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        name: 'Twilio',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown Twilio error'
      };
    }
  }

  /**
   * Get application metrics
   */
  private async getHealthMetrics(): Promise<HealthMetrics> {
    try {
      // Get authentication metrics from database
      const [activeUsers, activeSessions, loginStats] = await Promise.allSettled([
        this.getActiveUsers(),
        this.getActiveSessions(),
        this.getLoginStats()
      ]);

      const requestsPerSecond = this.lastMinuteRequests.length > 0 ?
        this.lastMinuteRequests.reduce((a, b) => a + b, 0) / this.lastMinuteRequests.length :
        0;

      return {
        requests: {
          total: this.requestCount,
          perSecond: requestsPerSecond,
          errors: this.errorCount,
          errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0
        },
        connections: {
          active: 0, // Would need to track WebSocket connections
          total: 0
        },
        authentication: {
          activeUsers: this.getResultValue(activeUsers, 0),
          activeSessions: this.getResultValue(activeSessions, 0),
          loginAttempts: this.getResultValue(loginStats, {
            total: 0,
            successful: 0,
            failed: 0,
            blocked: 0
          })
        }
      };
    } catch (error) {
      logger.error({ error }, 'Failed to collect health metrics');
      
      return {
        requests: { total: 0, perSecond: 0, errors: 0, errorRate: 0 },
        connections: { active: 0, total: 0 },
        authentication: { 
          activeUsers: 0, 
          activeSessions: 0, 
          loginAttempts: { total: 0, successful: 0, failed: 0, blocked: 0 }
        }
      };
    }
  }

  /**
   * Get active users count (logged in within last 24 hours)
   */
  private async getActiveUsers(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return await this.dependencies.prisma.user.count({
      where: {
        lastLoginAt: {
          gte: twentyFourHoursAgo
        },
        deletedAt: null
      }
    });
  }

  /**
   * Get active sessions count
   */
  private async getActiveSessions(): Promise<number> {
    return await this.dependencies.prisma.refreshToken.count({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    });
  }

  /**
   * Get login statistics for the last 24 hours
   */
  private async getLoginStats(): Promise<any> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const loginAttempts = await this.dependencies.prisma.loginAttempt.groupBy({
      by: ['success'],
      where: {
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      _count: {
        success: true
      }
    });

    const stats = {
      total: 0,
      successful: 0,
      failed: 0,
      blocked: 0
    };

    loginAttempts.forEach(attempt => {
      const count = attempt._count.success;
      stats.total += count;
      if (attempt.success) {
        stats.successful += count;
      } else {
        stats.failed += count;
      }
    });

    return stats;
  }

  /**
   * Utility methods
   */
  private getResultValue<T>(result: PromiseSettledResult<T>, defaultValue?: T): T {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return defaultValue as T;
    }
  }

  private determineOverallStatus(services: { [key: string]: ServiceHealth }): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = Object.values(services).map(service => service.status);
    
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    } else if (statuses.includes('degraded')) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  private parseRedisInfo(info: string, key: string): string {
    const lines = info.split('\r\n');
    const line = lines.find(line => line.startsWith(`${key}:`));
    return line ? line.split(':')[1] : 'unknown';
  }

  /**
   * Track request for metrics
   */
  trackRequest(): void {
    this.requestCount++;
  }

  /**
   * Track error for metrics
   */
  trackError(): void {
    this.errorCount++;
  }
}

/**
 * Health check middleware factory
 */
export function createHealthCheckMiddleware(dependencies: HealthCheckDependencies) {
  const healthCheckService = new HealthCheckService(dependencies);

  return {
    healthCheckService,
    
    // Basic health check endpoint
    async basicHealthCheck(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const result = await healthCheckService.performHealthCheck(false);
        
        const statusCode = result.status === 'healthy' ? 200 : 
                          result.status === 'degraded' ? 200 : 503;
        
        reply.status(statusCode).send({
          status: result.status,
          timestamp: result.timestamp,
          uptime: result.uptime,
          version: result.version
        });
      } catch (error) {
        logger.error({ error }, 'Basic health check failed');
        reply.status(503).send({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check failed'
        });
      }
    },

    // Detailed health check endpoint
    async detailedHealthCheck(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const result = await healthCheckService.performHealthCheck(true);
        
        const statusCode = result.status === 'healthy' ? 200 : 
                          result.status === 'degraded' ? 200 : 503;
        
        reply.status(statusCode).send(result);
      } catch (error) {
        logger.error({ error }, 'Detailed health check failed');
        reply.status(503).send({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check failed'
        });
      }
    },

    // Liveness probe (for Kubernetes)
    async livenessProbe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      reply.status(200).send({ status: 'alive' });
    },

    // Readiness probe (for Kubernetes)
    async readinessProbe(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        // Check critical services only
        const [dbHealth, redisHealth] = await Promise.allSettled([
          healthCheckService['checkDatabase'](),
          healthCheckService['checkRedis']()
        ]);

        const dbStatus = healthCheckService.getResultValue(dbHealth)?.status;
        const redisStatus = healthCheckService.getResultValue(redisHealth)?.status;

        if (dbStatus === 'unhealthy' || redisStatus === 'unhealthy') {
          reply.status(503).send({ status: 'not ready' });
        } else {
          reply.status(200).send({ status: 'ready' });
        }
      } catch (error) {
        logger.error({ error }, 'Readiness probe failed');
        reply.status(503).send({ status: 'not ready' });
      }
    },

    // Request tracking middleware
    requestTracker: async (request: FastifyRequest, reply: FastifyReply) => {
      healthCheckService.trackRequest();
      
      // Track errors on response
      reply.hijack();
      const originalSend = reply.send.bind(reply);
      reply.send = function(payload?: any) {
        if (reply.statusCode >= 400) {
          healthCheckService.trackError();
        }
        return originalSend(payload);
      };
    }
  };
}