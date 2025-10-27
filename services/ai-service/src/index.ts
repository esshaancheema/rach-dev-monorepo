import { buildApp } from './app';
import { logger } from './utils/logger';
import { redis } from './utils/redis';
import { config } from './config';

async function start() {
  try {
    // Initialize Redis connection
    await redis.connect();
    logger.info('Redis connection initialized');

    // Build Fastify app
    const app = await buildApp();

    // Start server
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });

    logger.info(`AI service listening on ${config.HOST}:${config.PORT}`);

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down AI service...');
      
      await app.close();
      await redis.disconnect();
      
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error(error, 'Failed to start AI service');
    process.exit(1);
  }
}

start();