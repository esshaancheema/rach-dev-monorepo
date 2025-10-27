import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';

// Create a singleton instance of Prisma Client
export const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Log Prisma events
prisma.$on('warn', (e) => {
  logger.warn('Prisma warning:', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma info:', e);
});

prisma.$on('error', (e) => {
  logger.error('Prisma error:', e);
});

// Handle graceful shutdown
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
}