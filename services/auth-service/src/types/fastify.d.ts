import { FastifyRequest } from 'fastify';
import { PrismaClient } from '@zoptal/database';
import { Redis } from 'ioredis';
import { User, TokenPayload } from './auth.types';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
    redis: Redis;
  }

  interface FastifyRequest {
    user?: Omit<User, 'password'>;
    tokenPayload?: TokenPayload;
    deviceId?: string;
    rateLimit?: {
      remaining: number;
      resetTime: number;
      total: number;
    };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload;
    user: Omit<User, 'password'>;
  }
}