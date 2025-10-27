import { FastifyInstance } from 'fastify';

export default async function taskRoutes(fastify: FastifyInstance) {
  // TODO: Implement task management routes
  fastify.get('/', async (request, reply) => {
    return { message: 'Task routes coming soon' };
  });
}