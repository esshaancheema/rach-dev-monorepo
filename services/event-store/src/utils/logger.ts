import winston from 'winston';
import { config } from '../config/config';

// Custom format for structured logging
const customFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const logObject = {
    timestamp,
    level,
    message,
    ...meta,
  };

  // Add event sourcing specific fields
  if (meta.eventType || meta.aggregateId || meta.aggregateType) {
    logObject.eventSourcing = {
      eventType: meta.eventType,
      eventId: meta.eventId,
      aggregateId: meta.aggregateId,
      aggregateType: meta.aggregateType,
      version: meta.version,
      correlationId: meta.correlationId,
      causationId: meta.causationId,
    };
  }

  // Add command information
  if (meta.commandType || meta.commandId) {
    logObject.command = {
      commandType: meta.commandType,
      commandId: meta.commandId,
      processingTime: meta.processingTime,
    };
  }

  // Add projection information
  if (meta.projectionName) {
    logObject.projection = {
      projectionName: meta.projectionName,
      eventCount: meta.eventCount,
      processingTime: meta.processingTime,
      isRebuilding: meta.isRebuilding,
    };
  }

  // Add user context if present
  if (meta.userId || meta.userEmail) {
    logObject.user = {
      id: meta.userId,
      email: meta.userEmail,
      tenantId: meta.tenantId,
    };
  }

  // Add request context if present
  if (meta.requestId || meta.userAgent || meta.ip) {
    logObject.request = {
      id: meta.requestId,
      ip: meta.ip,
      userAgent: meta.userAgent,
      method: meta.method,
      url: meta.url,
    };
  }

  return JSON.stringify(logObject);
});

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    customFormat
  ),
  defaultMeta: {
    service: 'event-store',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.environment,
  },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`;
        })
      ),
    }),

    // File output for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // File output for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// Add structured logging methods for event sourcing
export const eventSourcingLogger = {
  // Event processing logging
  eventProcessed: (info: {
    eventType: string;
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    version: number;
    processingTime?: number;
    correlationId?: string;
    causationId?: string;
  }) => {
    logger.info('Event Processed', info);
  },

  eventProcessingFailed: (info: {
    eventType: string;
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    error: string;
    processingTime?: number;
  }) => {
    logger.error('Event Processing Failed', info);
  },

  // Command processing logging
  commandReceived: (info: {
    commandType: string;
    commandId: string;
    aggregateId: string;
    aggregateType: string;
    userId?: string;
    requestId?: string;
  }) => {
    logger.info('Command Received', info);
  },

  commandProcessed: (info: {
    commandType: string;
    commandId: string;
    aggregateId: string;
    aggregateType: string;
    version: number;
    eventCount: number;
    processingTime: number;
    success: boolean;
  }) => {
    const level = info.success ? 'info' : 'error';
    logger.log(level, 'Command Processed', info);
  },

  // Projection logging
  projectionProcessed: (info: {
    projectionName: string;
    eventCount: number;
    processingTime: number;
    lastEventTimestamp: Date;
    version: number;
  }) => {
    logger.info('Projection Processed', info);
  },

  projectionRebuilding: (info: {
    projectionName: string;
    eventCount: number;
    progress: {
      current: number;
      total: number;
      percentage: number;
    };
  }) => {
    logger.info('Projection Rebuilding', info);
  },

  projectionError: (info: {
    projectionName: string;
    eventType: string;
    eventId: string;
    error: string;
    retry: boolean;
  }) => {
    logger.error('Projection Error', info);
  },

  // Snapshot logging
  snapshotCreated: (info: {
    aggregateId: string;
    aggregateType: string;
    version: number;
    snapshotSize: number;
  }) => {
    logger.info('Snapshot Created', info);
  },

  snapshotLoaded: (info: {
    aggregateId: string;
    aggregateType: string;
    version: number;
    loadTime: number;
  }) => {
    logger.debug('Snapshot Loaded', info);
  },

  // Performance logging
  aggregateLoaded: (info: {
    aggregateId: string;
    aggregateType: string;
    eventCount: number;
    loadTime: number;
    fromSnapshot: boolean;
  }) => {
    logger.debug('Aggregate Loaded', info);
  },

  aggregateSaved: (info: {
    aggregateId: string;
    aggregateType: string;
    eventCount: number;
    version: number;
    saveTime: number;
  }) => {
    logger.debug('Aggregate Saved', info);
  },

  // Concurrency logging
  concurrencyConflict: (info: {
    aggregateId: string;
    aggregateType: string;
    expectedVersion: number;
    actualVersion: number;
    commandType: string;
    commandId: string;
  }) => {
    logger.warn('Concurrency Conflict Detected', info);
  },

  // System health logging
  eventStoreHealth: (info: {
    mongodb: boolean;
    redis: boolean;
    eventCount: number;
    snapshotCount: number;
    uptime: number;
  }) => {
    logger.info('Event Store Health Check', info);
  },

  projectionHealth: (info: {
    projections: Array<{
      name: string;
      healthy: boolean;
      lastProcessed: Date;
      queueSize: number;
    }>;
  }) => {
    logger.info('Projection Health Check', info);
  },
};

// Error logging helper
export function logError(error: Error, context?: any) {
  logger.error('Unhandled Error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
}

// Performance measurement helper
export function measureTime<T>(fn: () => Promise<T> | T, context: any): Promise<T> {
  const startTime = Date.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.finally(() => {
      const processingTime = Date.now() - startTime;
      logger.debug('Operation Timing', { ...context, processingTime });
    });
  } else {
    const processingTime = Date.now() - startTime;
    logger.debug('Operation Timing', { ...context, processingTime });
    return Promise.resolve(result);
  }
}

// Request ID middleware helper
export function requestIdMiddleware(req: any, res: any, next: any) {
  const requestId = req.headers['x-request-id'] || 
                   req.headers['x-correlation-id'] || 
                   generateRequestId();
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Cleanup function for graceful shutdown
export function cleanup() {
  logger.info('Logger cleanup initiated');
  
  return new Promise<void>((resolve) => {
    logger.on('finish', () => {
      resolve();
    });
    
    logger.end();
    
    // Force resolve after 5 seconds
    setTimeout(resolve, 5000);
  });
}