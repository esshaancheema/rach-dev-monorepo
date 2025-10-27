import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SubscriptionController } from '../controllers/subscription.controller';
import { authenticate, requireOrganizationAccess } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const createSubscriptionSchema = z.object({
  body: z.object({
    planId: z.enum(['free', 'starter', 'pro', 'enterprise']),
    paymentMethodId: z.string().optional(),
    trialPeriodDays: z.number().min(0).max(90).optional(),
    metadata: z.record(z.string()).optional(),
  }),
});

const updateSubscriptionSchema = z.object({
  params: z.object({
    subscriptionId: z.string().min(1),
  }),
  body: z.object({
    planId: z.enum(['free', 'starter', 'pro', 'enterprise']).optional(),
    quantity: z.number().min(1).optional(),
    prorationBehavior: z.enum(['none', 'create_prorations', 'always_invoice']).optional(),
    metadata: z.record(z.string()).optional(),
  }),
});

const cancelSubscriptionSchema = z.object({
  params: z.object({
    subscriptionId: z.string().min(1),
  }),
  body: z.object({
    immediately: z.boolean().optional(),
    reason: z.string().optional(),
  }),
});

const subscriptionParamsSchema = z.object({
  params: z.object({
    subscriptionId: z.string().min(1),
  }),
});

const usageLimitSchema = z.object({
  querystring: z.object({
    metric: z.string().min(1),
    quantity: z.coerce.number().min(1).optional(),
  }),
});

const trackUsageSchema = z.object({
  body: z.object({
    metric: z.string().min(1),
    quantity: z.number().min(1),
    metadata: z.record(z.any()).optional(),
  }),
});

export async function subscriptionRoutes(app: FastifyInstance) {
  const controller = new SubscriptionController();

  // Create subscription
  app.post(
    '/',
    {
      preHandler: [authenticate, requireOrganizationAccess, validateRequest(createSubscriptionSchema)],
    },
    controller.createSubscription.bind(controller)
  );

  // Update subscription
  app.put(
    '/:subscriptionId',
    {
      preHandler: [authenticate, requireOrganizationAccess, validateRequest(updateSubscriptionSchema)],
    },
    controller.updateSubscription.bind(controller)
  );

  // Cancel subscription
  app.post(
    '/:subscriptionId/cancel',
    {
      preHandler: [authenticate, requireOrganizationAccess, validateRequest(cancelSubscriptionSchema)],
    },
    controller.cancelSubscription.bind(controller)
  );

  // Reactivate subscription
  app.post(
    '/:subscriptionId/reactivate',
    {
      preHandler: [authenticate, requireOrganizationAccess, validateRequest(subscriptionParamsSchema)],
    },
    controller.reactivateSubscription.bind(controller)
  );

  // Get subscription details
  app.get(
    '/:subscriptionId',
    {
      preHandler: [authenticate, requireOrganizationAccess, validateRequest(subscriptionParamsSchema)],
    },
    controller.getSubscription.bind(controller)
  );

  // Get subscription usage
  app.get(
    '/:subscriptionId/usage',
    {
      preHandler: [authenticate, requireOrganizationAccess, validateRequest(subscriptionParamsSchema)],
    },
    controller.getSubscriptionUsage.bind(controller)
  );

  // Get organization subscription
  app.get(
    '/organization/current',
    {
      preHandler: [authenticate, requireOrganizationAccess],
    },
    controller.getOrganizationSubscription.bind(controller)
  );

  // Check usage limit
  app.get(
    '/usage/check',
    {
      preHandler: [authenticate, requireOrganizationAccess, validateRequest(usageLimitSchema)],
    },
    controller.checkUsageLimit.bind(controller)
  );

  // Track usage
  app.post(
    '/usage/track',
    {
      preHandler: [authenticate, requireOrganizationAccess, validateRequest(trackUsageSchema)],
    },
    controller.trackUsage.bind(controller)
  );
}