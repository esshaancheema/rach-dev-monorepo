import { Request, Response, NextFunction } from 'express';
import { logger, performanceLogger } from '../utils/logger';
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
  const skipPaths = ['/health', '/metrics', '/favicon.ico', '/packages'];
  const shouldSkip = skipPaths.some(path => req.path.startsWith(path));

  if (!shouldSkip) {
    // Log incoming request
    logger.info('Incoming request', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: req.user?.id,
      contentLength: req.headers['content-length'],
      contentType: req.headers['content-type'],
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
      if (duration > 2000) {
        performanceLogger.warn('Slow request detected', {
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

  next();
};