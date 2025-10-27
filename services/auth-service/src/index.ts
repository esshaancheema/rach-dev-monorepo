import 'dotenv/config';
import { buildApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const start = async () => {
  try {
    const app = await buildApp();
    
    await app.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });
    
    logger.info(`Auth service running on port ${config.PORT}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();