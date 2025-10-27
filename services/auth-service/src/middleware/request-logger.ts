// Legacy request logger - Use the new enhanced version in request-logger.middleware.ts
import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { logger } from '../utils/logger';
import { requestLoggerPlugin } from './request-logger.middleware';

interface RequestLoggerOptions {
  logLevel?: 'info' | 'debug' | 'trace';
  logBody?: boolean;
  logHeaders?: boolean;
  logResponse?: boolean;
  excludePaths?: string[];
  includeResponseTime?: boolean;
  sensitiveHeaders?: string[];
  maxBodyLength?: number;
}

const DEFAULT_OPTIONS: RequestLoggerOptions = {
  logLevel: 'info',
  logBody: false,
  logHeaders: false,
  logResponse: false,
  excludePaths: ['/health', '/ready', '/metrics'],
  includeResponseTime: true,
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'set-cookie',
  ],
  maxBodyLength: 1000, // Maximum characters to log from request body
};

/**
 * Enhanced request logger - delegates to the new middleware
 */
async function requestLogger(
  fastify: FastifyInstance,
  options: RequestLoggerOptions,
  done: () => void
) {
  // Convert old options to new format
  const newOptions = {
    enableRequestLogging: true,
    enableResponseLogging: true,
    enableErrorLogging: true,
    enablePerformanceLogging: true,
    enableSecurityLogging: true,
    logLevel: options.logLevel as any || 'info',
    excludePaths: options.excludePaths || DEFAULT_OPTIONS.excludePaths,
    excludeHeaders: options.sensitiveHeaders || DEFAULT_OPTIONS.sensitiveHeaders,
    maxBodySize: options.maxBodyLength || DEFAULT_OPTIONS.maxBodyLength,
    enableBodyLogging: options.logBody || false,
    enableHeaderLogging: options.logHeaders || false,
    redactSensitiveData: true,
    enableUserTracking: true,
    enableIPTracking: true,
    enableSlowRequestLogging: true,
    slowRequestThreshold: 1000
  };

  // Use the enhanced request logger
  await requestLoggerPlugin(fastify, newOptions);
  
  done();
}

// Export as Fastify plugin
export default fp(requestLogger, {
  name: 'request-logger',
  fastify: '4.x',
});

// Named export for direct import
export { requestLogger };