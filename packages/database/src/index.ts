export * from '@prisma/client';
export { PrismaClient } from '@prisma/client';

// Re-export useful types
export type {
  User,
  Project,
  AIAgent,
  Consultation,
  Payment,
} from '@prisma/client';