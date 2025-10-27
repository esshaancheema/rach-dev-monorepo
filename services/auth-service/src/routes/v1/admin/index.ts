import { FastifyInstance } from 'fastify';
import { adminUsersRoutes } from './users';
import { adminAnalyticsRoutes } from './analytics';
import { adminDevicesRoutes } from './devices';
import { adminSecurityRoutes } from './security';

export async function adminRoutes(fastify: FastifyInstance) {
  await fastify.register(adminUsersRoutes, { prefix: '' });
  await fastify.register(adminAnalyticsRoutes, { prefix: '' });
  await fastify.register(adminDevicesRoutes, { prefix: '' });
  await fastify.register(adminSecurityRoutes, { prefix: '' });
}