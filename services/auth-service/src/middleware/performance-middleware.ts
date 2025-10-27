import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { createPerformanceMonitorService } from '../services/performance-monitor.service';
import { createMetricsService } from '../services/metrics.service';
import { createEmailService } from '../services/email.service';
import { RedisClient } from '../utils/redis';

export interface PerformanceMiddlewareOptions {
  enableRequestMetrics: boolean;
  enableResponseTimeTracking: boolean;
  enableMemoryTracking: boolean;
  enableDatabaseTracking: boolean;
  slowRequestThreshold: number; // milliseconds
  memoryWarningThreshold: number; // percentage
  sampleRate: number; // 0-1, percentage of requests to track
}

const defaultOptions: PerformanceMiddlewareOptions = {
  enableRequestMetrics: true,
  enableResponseTimeTracking: true,
  enableMemoryTracking: true,
  enableDatabaseTracking: true,
  slowRequestThreshold: 1000, // 1 second
  memoryWarningThreshold: 80, // 80%
  sampleRate: 1.0 // Track all requests
};

/**
 * Performance monitoring middleware
 * Collects real-time performance metrics from HTTP requests
 */
export async function performanceMiddleware(
  fastify: FastifyInstance,
  options: Partial<PerformanceMiddlewareOptions> = {}
) {
  const config = { ...defaultOptions, ...options };
  
  const metricsService = createMetricsService({ prisma: fastify.prisma });
  const emailService = createEmailService();
  const performanceMonitor = createPerformanceMonitorService({
    prisma: fastify.prisma,
    redis: RedisClient,
    metricsService,
    emailService
  });

  // Request tracking state
  const activeRequests = new Map<string, {
    startTime: number;
    startMemory: NodeJS.MemoryUsage;
    route: string;
    method: string;
    ip: string;
  }>();

  /**
   * Pre-request hook - Start tracking
   */
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Sample requests based on sample rate
    if (Math.random() > config.sampleRate) {
      return;
    }

    const requestId = request.headers['x-request-id'] as string || 
                     `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    // Store request tracking info
    activeRequests.set(requestId, {
      startTime,
      startMemory,
      route: request.routerPath || request.url,
      method: request.method,
      ip: request.ip
    });

    // Add request ID to headers if not present
    if (!request.headers['x-request-id']) {
      request.headers['x-request-id'] = requestId;
      reply.header('x-request-id', requestId);
    }

    // Track memory usage if enabled
    if (config.enableMemoryTracking) {
      const memoryUsage = (startMemory.heapUsed / startMemory.heapTotal) * 100;
      
      if (memoryUsage > config.memoryWarningThreshold) {
        logger.warn('High memory usage detected', {
          requestId,
          memoryUsage: `${memoryUsage.toFixed(2)}%`,
          heapUsed: startMemory.heapUsed,
          heapTotal: startMemory.heapTotal,
          route: request.routerPath || request.url,
          method: request.method
        });

        // Record high memory metric
        await metricsService.recordGauge('memory_usage_high', memoryUsage);
      }
    }
  });

  /**
   * Post-response hook - Collect metrics
   */
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.headers['x-request-id'] as string;
    const trackingInfo = activeRequests.get(requestId);
    
    if (!trackingInfo) {
      return; // Request wasn't tracked (due to sampling)
    }

    try {
      const endTime = Date.now();
      const responseTime = endTime - trackingInfo.startTime;
      const endMemory = process.memoryUsage();
      
      // Calculate metrics
      const memoryDelta = endMemory.heapUsed - trackingInfo.startMemory.heapUsed;
      const statusCode = reply.statusCode;
      const isError = statusCode >= 400;
      const isSlow = responseTime > config.slowRequestThreshold;

      // Record basic metrics if enabled
      if (config.enableRequestMetrics) {
        await Promise.all([
          metricsService.recordCounter('http_requests_total', 1, {
            method: trackingInfo.method,
            route: trackingInfo.route,
            status_code: statusCode.toString()
          }),
          metricsService.recordGauge('http_request_duration_ms', responseTime),
          isError && metricsService.recordCounter('http_errors_total', 1, {
            method: trackingInfo.method,
            route: trackingInfo.route,
            status_code: statusCode.toString()
          })
        ].filter(Boolean));
      }

      // Record response time metrics if enabled
      if (config.enableResponseTimeTracking) {
        await metricsService.recordHistogram('http_request_duration_histogram', responseTime, {
          method: trackingInfo.method,
          route: trackingInfo.route
        });
      }

      // Record memory metrics if enabled
      if (config.enableMemoryTracking) {
        await Promise.all([
          metricsService.recordGauge('memory_usage_per_request', memoryDelta),
          metricsService.recordGauge('heap_used_bytes', endMemory.heapUsed),
          metricsService.recordGauge('heap_total_bytes', endMemory.heapTotal)
        ]);
      }

      // Log slow requests
      if (isSlow) {
        logger.warn('Slow request detected', {
          requestId,
          responseTime: `${responseTime}ms`,
          route: trackingInfo.route,
          method: trackingInfo.method,
          statusCode,
          ip: trackingInfo.ip,
          memoryDelta,
          userAgent: request.headers['user-agent']
        });

        // Record slow request metric
        await metricsService.recordCounter('slow_requests_total', 1, {
          method: trackingInfo.method,
          route: trackingInfo.route
        });
      }

      // Log error requests with additional context
      if (isError) {
        logger.warn('Error request detected', {
          requestId,
          responseTime: `${responseTime}ms`,
          route: trackingInfo.route,
          method: trackingInfo.method,
          statusCode,
          ip: trackingInfo.ip,
          userAgent: request.headers['user-agent']
        });
      }

      // Log high-level performance info for monitoring
      logger.debug('Request performance metrics', {
        requestId,
        responseTime,
        memoryDelta,
        route: trackingInfo.route,
        method: trackingInfo.method,
        statusCode,
        isSlow,
        isError
      });

    } catch (error) {
      logger.error({ error, requestId }, 'Failed to collect request performance metrics');
    } finally {
      // Clean up tracking info
      activeRequests.delete(requestId);
    }
  });

  /**
   * Database query tracking hook
   */
  if (config.enableDatabaseTracking) {
    // Add database query timing middleware
    fastify.addHook('onReady', async () => {
      // Extend Prisma client with performance tracking
      const originalQuery = fastify.prisma.$queryRaw;
      const originalTransaction = fastify.prisma.$transaction;

      // Track raw queries
      fastify.prisma.$queryRaw = new Proxy(originalQuery, {
        apply: async (target, thisArg, argArray) => {
          const startTime = Date.now();
          try {
            const result = await target.apply(thisArg, argArray);
            const duration = Date.now() - startTime;
            
            await metricsService.recordGauge('db_query_duration_ms', duration);
            await metricsService.recordCounter('db_queries_total', 1);
            
            if (duration > 1000) { // Log slow queries (>1s)
              logger.warn('Slow database query detected', {
                duration: `${duration}ms`,
                query: argArray[0]?.toString().substring(0, 200) + '...'
              });
              
              await metricsService.recordCounter('db_slow_queries_total', 1);
            }
            
            return result;
          } catch (error) {
            const duration = Date.now() - startTime;
            await metricsService.recordCounter('db_errors_total', 1);
            await metricsService.recordGauge('db_error_duration_ms', duration);
            throw error;
          }
        }
      });

      // Track transactions
      fastify.prisma.$transaction = new Proxy(originalTransaction, {
        apply: async (target, thisArg, argArray) => {
          const startTime = Date.now();
          try {
            const result = await target.apply(thisArg, argArray);
            const duration = Date.now() - startTime;
            
            await metricsService.recordGauge('db_transaction_duration_ms', duration);
            await metricsService.recordCounter('db_transactions_total', 1);
            
            return result;
          } catch (error) {
            const duration = Date.now() - startTime;
            await metricsService.recordCounter('db_transaction_errors_total', 1);
            throw error;
          }
        }
      });
    });
  }

  /**
   * System-level metrics collection
   */
  const systemMetricsInterval = setInterval(async () => {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Record system metrics
      await Promise.all([
        metricsService.recordGauge('process_heap_bytes', memoryUsage.heapUsed),
        metricsService.recordGauge('process_heap_total_bytes', memoryUsage.heapTotal),
        metricsService.recordGauge('process_external_bytes', memoryUsage.external),
        metricsService.recordGauge('process_rss_bytes', memoryUsage.rss),
        metricsService.recordCounter('process_cpu_user_seconds_total', cpuUsage.user / 1000000),
        metricsService.recordCounter('process_cpu_system_seconds_total', cpuUsage.system / 1000000),
        metricsService.recordGauge('process_active_requests', activeRequests.size)
      ]);

      // Check for memory leaks
      const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      if (heapUsagePercent > 90) {
        logger.error('Critical memory usage detected', {
          heapUsagePercent: `${heapUsagePercent.toFixed(2)}%`,
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          rss: memoryUsage.rss,
          external: memoryUsage.external,
          activeRequests: activeRequests.size
        });
        
        await metricsService.recordCounter('memory_critical_events_total', 1);
      }

    } catch (error) {
      logger.error({ error }, 'Failed to collect system performance metrics');
    }
  }, 30000); // Every 30 seconds

  /**
   * Cleanup on server close
   */
  fastify.addHook('onClose', async () => {
    clearInterval(systemMetricsInterval);
    activeRequests.clear();
    logger.info('Performance middleware cleanup completed');
  });

  logger.info('Performance monitoring middleware initialized', {
    enableRequestMetrics: config.enableRequestMetrics,
    enableResponseTimeTracking: config.enableResponseTimeTracking,
    enableMemoryTracking: config.enableMemoryTracking,
    enableDatabaseTracking: config.enableDatabaseTracking,
    slowRequestThreshold: `${config.slowRequestThreshold}ms`,
    memoryWarningThreshold: `${config.memoryWarningThreshold}%`,
    sampleRate: `${(config.sampleRate * 100).toFixed(1)}%`
  });
}

/**
 * Performance monitoring plugin
 */
export const performanceMonitoringPlugin = async (
  fastify: FastifyInstance,
  options: Partial<PerformanceMiddlewareOptions> = {}
) => {
  await performanceMiddleware(fastify, options);
};