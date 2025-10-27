import { FastifyInstance } from 'fastify';
import { logger } from './logger';
import { BillingRedis } from './redis';

export function setupGracefulShutdown(app: FastifyInstance): void {
  let isShuttingDown = false;

  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) {
      logger.warn('Shutdown already in progress, ignoring signal');
      return;
    }

    isShuttingDown = true;
    logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown');

    try {
      // Stop accepting new connections
      await app.close();
      logger.info('HTTP server closed');

      // Disconnect from Redis
      await BillingRedis.disconnect();
      logger.info('Redis connection closed');

      logger.info('Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  // Handle various shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

  // Handle Docker container stops
  process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));
}