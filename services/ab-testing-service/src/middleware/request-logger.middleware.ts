import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  req.requestId = req.headers['x-request-id'] as string || uuidv4();
  req.startTime = Date.now();

  // Set request ID in response header
  res.setHeader('X-Request-ID', req.requestId);

  // Skip logging for health checks and static assets
  const skipPaths = ['/health', '/metrics', '/favicon.ico'];
  const shouldSkip = skipPaths.some(path => req.path.startsWith(path));

  if (!shouldSkip) {
    // Log incoming request
    logger.info('Incoming request', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id,
      contentLength: req.headers['content-length'],
    });
  }

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body: any) {
    const duration = Date.now() - req.startTime;
    
    if (!shouldSkip) {
      // Log response
      logger.info('Outgoing response', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id,
        responseSize: JSON.stringify(body).length,
      });

      // Log slow requests
      if (duration > 1000) {
        logger.warn('Slow request detected', {
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          userId: req.user?.id,
        });
      }

      // Log errors
      if (res.statusCode >= 400) {
        const logLevel = res.statusCode >= 500 ? 'error' : 'warn';
        logger.log(logLevel, 'Request resulted in error', {
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userId: req.user?.id,
          errorBody: res.statusCode >= 500 ? body : undefined,
        });
      }
    }

    return originalJson.call(this, body);
  };

  // Override res.end to capture non-JSON responses
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - req.startTime;
    
    if (!shouldSkip && !res.headersSent) {
      logger.info('Request completed', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id,
      });
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime();
  const startUsage = process.cpuUsage();
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds
    
    const endUsage = process.cpuUsage(startUsage);
    const endMemory = process.memoryUsage();

    // Log performance metrics for slow requests or high resource usage
    if (duration > 500 || endUsage.user > 100000 || endUsage.system > 100000) {
      logger.info('Performance metrics', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        cpu: {
          user: `${(endUsage.user / 1000).toFixed(2)}ms`,
          system: `${(endUsage.system / 1000).toFixed(2)}ms`,
        },
        memory: {
          heapUsed: `${Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024 * 100) / 100}MB`,
          rss: `${Math.round((endMemory.rss - startMemory.rss) / 1024 / 1024 * 100) / 100}MB`,
        },
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

// Request size monitoring
export const requestSizeMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  let size = 0;

  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > maxSize) {
      req.destroy();
      res.status(413).json({
        error: 'Payload Too Large',
        message: `Request size exceeds ${maxSize} bytes`,
      });
    }
  });

  req.on('end', () => {
    if (size > 1024 * 1024) { // Log requests larger than 1MB
      logger.warn('Large request detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        size: `${Math.round(size / 1024 / 1024 * 100) / 100}MB`,
        userId: req.user?.id,
      });
    }
  });

  next();
};