import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, requireOrganizationAccess } from '../middleware/auth';

export async function invoiceRoutes(app: FastifyInstance) {
  // Placeholder for invoice routes
  app.get('/', async (request, reply) => {
    return { message: 'Invoice routes - to be implemented' };
  });
}