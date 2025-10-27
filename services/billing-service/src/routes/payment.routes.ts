import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireOrganizationAccess } from '../middleware/auth';

export async function paymentRoutes(app: FastifyInstance) {
  // Placeholder for payment routes
  app.get('/', async (request, reply) => {
    return { message: 'Payment routes - to be implemented' };
  });
}