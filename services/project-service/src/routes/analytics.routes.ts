import { FastifyInstance } from 'fastify';

export default async function analyticsRoutes(fastify: FastifyInstance) {
  // TODO: Implement analytics routes
  fastify.get('/', async (request, reply) => {
    return { message: 'Analytics routes coming soon' };
  });
}