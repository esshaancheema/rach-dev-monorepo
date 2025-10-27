import winston from 'winston';
import { config } from '../config/config';

// Custom log format for GraphQL operations
const graphqlFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const logObject = {
    timestamp,
    level,
    message,
    ...meta,
  };

  // Add GraphQL-specific fields if present
  if (meta.operationName || meta.query || meta.variables) {
    logObject.graphql = {
      operationName: meta.operationName,
      operationType: meta.operationType,
      complexity: meta.complexity,
      depth: meta.depth,
      executionTime: meta.executionTime,
    };
    
    // Only log query in development
    if (config.environment === 'development' && meta.query) {
      logObject.graphql.query = meta.query;
    }
    
    // Only log variables in development and sanitize sensitive data
    if (config.environment === 'development' && meta.variables) {
      logObject.graphql.variables = sanitizeVariables(meta.variables);
    }
  }

  // Add user context if present
  if (meta.userId || meta.userEmail) {
    logObject.user = {
      id: meta.userId,
      email: meta.userEmail,
      role: meta.userRole,
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

// Sanitize sensitive data from variables
function sanitizeVariables(variables: any): any {
  if (!variables || typeof variables !== 'object') {
    return variables;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...variables };

  function recursiveSanitize(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(recursiveSanitize);
    }

    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          result[key] = recursiveSanitize(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    }

    return obj;
  }

  return recursiveSanitize(sanitized);
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.environment === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    graphqlFormat
  ),
  defaultMeta: {
    service: 'graphql-gateway',
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

// Add structured logging methods
export const structuredLogger = {
  // GraphQL operation logging
  graphqlOperation: (info: {
    operationName?: string;
    operationType?: string;
    query?: string;
    variables?: any;
    complexity?: number;
    depth?: number;
    executionTime?: number;
    errors?: any[];
    userId?: string;
    userEmail?: string;
    userRole?: string;
    tenantId?: string;
    requestId?: string;
    ip?: string;
    userAgent?: string;
  }) => {
    const level = info.errors && info.errors.length > 0 ? 'error' : 'info';
    logger.log(level, 'GraphQL Operation', info);
  },

  // Authentication events
  auth: (event: string, info: {
    userId?: string;
    userEmail?: string;
    ip?: string;
    userAgent?: string;
    success?: boolean;
    error?: string;
  }) => {
    const level = info.success === false ? 'warn' : 'info';
    logger.log(level, `Auth: ${event}`, info);
  },

  // Rate limiting events
  rateLimit: (info: {
    type: 'exceeded' | 'warning';
    limit: number;
    current: number;
    key: string;
    ip?: string;
    userId?: string;
    endpoint?: string;
  }) => {
    const level = info.type === 'exceeded' ? 'warn' : 'info';
    logger.log(level, 'Rate Limit', info);
  },

  // Data loader performance
  dataLoader: (info: {
    loader: string;
    keys: string[];
    hitCount: number;
    missCount: number;
    cacheHitRatio: number;
    executionTime: number;
    errors?: any[];
  }) => {
    const level = info.errors && info.errors.length > 0 ? 'error' : 'debug';
    logger.log(level, 'DataLoader Performance', info);
  },

  // Security events
  security: (event: string, info: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details?: any;
  }) => {
    const levelMap = {
      low: 'info',
      medium: 'warn',
      high: 'error',
      critical: 'error',
    };
    
    logger.log(levelMap[info.severity], `Security: ${event}`, info);
  },

  // Performance metrics
  performance: (info: {
    operation: string;
    duration: number;
    memoryUsage?: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
    activeConnections?: number;
  }) => {
    logger.debug('Performance Metrics', info);
  },

  // External service calls
  externalService: (info: {
    service: string;
    method: string;
    url: string;
    statusCode?: number;
    duration: number;
    error?: string;
    retryCount?: number;
  }) => {
    const level = info.error ? 'error' : 'debug';
    logger.log(level, 'External Service Call', info);
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

// Request ID middleware for Express
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