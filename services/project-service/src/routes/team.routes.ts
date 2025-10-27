import { FastifyInstance } from 'fastify';

export default async function teamRoutes(fastify: FastifyInstance) {
  // TODO: Implement team management routes
  fastify.get('/', async (request, reply) => {
    return { message: 'Team routes coming soon' };
  });
}