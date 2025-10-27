import { buildApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { setupGracefulShutdown } from './utils/graceful-shutdown';

async function start() {
  try {
    const app = await buildApp();
    
    // Start the server
    await app.listen({
      port: config.PORT,
      host: config.HOST,
    });

    logger.info({
      port: config.PORT,
      host: config.HOST,
      env: config.NODE_ENV,
    }, 'Billing service started successfully');

    // Setup graceful shutdown
    setupGracefulShutdown(app);

  } catch (error) {
    logger.error({ error }, 'Failed to start billing service');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled promise rejection');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  process.exit(1);
});

start();