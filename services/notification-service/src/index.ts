import { buildApp } from './app';
import { logger } from './utils/logger';
import { NotificationRedisService } from './utils/redis';
import { startNotificationProcessors } from './processors';
import { config } from './config';

async function start() {
  try {
    // Initialize Redis connection
    await NotificationRedisService.initialize();
    logger.info('Redis connection initialized');

    // Build Fastify app
    const app = await buildApp();

    // Start background processors
    await startNotificationProcessors();
    logger.info('Background processors started');

    // Start server
    await app.listen({
      port: config.port,
      host: config.host,
    });

    logger.info(`Notification service listening on ${config.host}:${config.port}`);

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down notification service...');
      
      await app.close();
      await NotificationRedisService.close();
      
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error(error, 'Failed to start notification service');
    process.exit(1);
  }
}

start();