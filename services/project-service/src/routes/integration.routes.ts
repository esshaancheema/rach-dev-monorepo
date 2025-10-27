import { FastifyInstance } from 'fastify';

export default async function integrationRoutes(fastify: FastifyInstance) {
  // TODO: Implement integration management routes (GitHub, GitLab, etc.)
  fastify.get('/', async (request, reply) => {
    return { message: 'Integration routes coming soon' };
  });
}