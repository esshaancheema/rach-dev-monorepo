import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { plansConfig } from '../config';
import { validateRequest } from '../middleware/validate';

const planParamsSchema = z.object({
  params: z.object({
    planId: z.enum(['free', 'starter', 'pro', 'enterprise']),
  }),
});

export async function planRoutes(app: FastifyInstance) {
  // Get all available plans
  app.get(
    '/',
    {},
    async (request, reply) => {
      const plans = Object.entries(plansConfig).map(([id, config]) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        price: config.price,
        currency: 'USD',
        interval: 'month',
        features: config.features,
        limits: {
          apiCalls: config.apiCalls,
          storage: 1000000000, // 1GB
          bandwidth: 10000000000, // 10GB
        },
      }));

      return reply.code(200).send({
        success: true,
        data: plans,
      });
    }
  );

  // Get specific plan details
  app.get(
    '/:planId',
    {
      preHandler: [validateRequest(planParamsSchema)],
    },
    async (request, reply) => {
      const { planId } = request.params as { planId: keyof typeof plansConfig };
      const config = plansConfig[planId];

      if (!config) {
        return reply.code(404).send({
          success: false,
          error: 'Plan not found',
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          id: planId,
          name: planId.charAt(0).toUpperCase() + planId.slice(1),
          price: config.price,
          currency: 'USD',
          interval: 'month',
          features: config.features,
          limits: {
            apiCalls: config.apiCalls,
            storage: 1000000000, // 1GB
            bandwidth: 10000000000, // 10GB
          },
        },
      });
    }
  );
}