import pino from 'pino';
import { config } from '../config';

const transport = config.NODE_ENV === 'development' 
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        singleLine: false,
      },
    }
  : undefined;

export const logger = pino({
  name: 'billing-service',
  level: config.LOG_LEVEL,
  transport,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    pid: process.pid,
    service: 'billing-service',
    version: process.env.npm_package_version || '1.0.0',
  },
});