import { buildApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const start = async () => {
  try {
    const app = await buildApp();
    
    const port = config.PORT;
    const host = config.HOST;

    await app.listen({ port, host });
    
    logger.info(`🚀 Project Service started successfully`);
    logger.info(`📍 Server listening on http://${host}:${port}`);
    logger.info(`📊 Health check: http://${host}:${port}/health`);
    logger.info(`📚 API docs: http://${host}:${port}/docs`);
    
  } catch (error) {
    logger.error('❌ Failed to start Project Service:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

start();