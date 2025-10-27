import { FastifyRequest, FastifyReply } from 'fastify';
import { SubscriptionService } from '../services/subscription.service';
import { logger } from '../utils/logger';

export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  async createSubscription(
    request: FastifyRequest<{
      Body: {
        planId: string;
        paymentMethodId?: string;
        trialPeriodDays?: number;
        metadata?: Record<string, string>;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { planId, paymentMethodId, trialPeriodDays, metadata } = request.body;
      const userId = request.user!.id;
      const organizationId = request.user!.organizationId;

      const subscription = await this.subscriptionService.createSubscription({
        organizationId,
        userId,
        planId,
        paymentMethodId,
        trialPeriodDays,
        metadata,
      });

      return reply.code(201).send({
        success: true,
        data: {
          id: subscription.id,
          status: subscription.status,
          planId,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          clientSecret: subscription.latest_invoice && 
                       typeof subscription.latest_invoice === 'object' &&
                       subscription.latest_invoice.payment_intent &&
                       typeof subscription.latest_invoice.payment_intent === 'object'
                       ? subscription.latest_invoice.payment_intent.client_secret
                       : null,
        },
      });
    } catch (error) {
      logger.error({ error, userId: request.user?.id }, 'Failed to create subscription');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to create subscription',
      });
    }
  }

  async updateSubscription(
    request: FastifyRequest<{
      Params: { subscriptionId: string };
      Body: {
        planId?: string;
        quantity?: number;
        prorationBehavior?: 'none' | 'create_prorations' | 'always_invoice';
        metadata?: Record<string, string>;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { subscriptionId } = request.params;
      const { planId, quantity, prorationBehavior, metadata } = request.body;

      const subscription = await this.subscriptionService.updateSubscription({
        subscriptionId,
        planId,
        quantity,
        prorationBehavior,
        metadata,
      });

      return reply.code(200).send({
        success: true,
        data: {
          id: subscription.id,
          status: subscription.status,
          planId: subscription.metadata.planId,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
    } catch (error) {
      logger.error({ error, subscriptionId: request.params.subscriptionId }, 'Failed to update subscription');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to update subscription',
      });
    }
  }

  async cancelSubscription(
    request: FastifyRequest<{
      Params: { subscriptionId: string };
      Body: {
        immediately?: boolean;
        reason?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { subscriptionId } = request.params;
      const { immediately = false, reason } = request.body;

      const subscription = await this.subscriptionService.cancelSubscription(
        subscriptionId,
        immediately,
        reason
      );

      return reply.code(200).send({
        success: true,
        data: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
    } catch (error) {
      logger.error({ error, subscriptionId: request.params.subscriptionId }, 'Failed to cancel subscription');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to cancel subscription',
      });
    }
  }

  async getSubscription(
    request: FastifyRequest<{
      Params: { subscriptionId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { subscriptionId } = request.params;

      const subscription = await this.subscriptionService.getSubscription(subscriptionId);

      if (!subscription) {
        return reply.code(404).send({
          success: false,
          error: 'Subscription not found',
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          id: subscription.id,
          status: subscription.status,
          planId: subscription.metadata.planId,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          customer: subscription.customer,
          items: subscription.items.data.map(item => ({
            id: item.id,
            priceId: item.price.id,
            quantity: item.quantity,
          })),
        },
      });
    } catch (error) {
      logger.error({ error, subscriptionId: request.params.subscriptionId }, 'Failed to get subscription');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get subscription',
      });
    }
  }

  async getSubscriptionUsage(
    request: FastifyRequest<{
      Params: { subscriptionId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { subscriptionId } = request.params;

      const usage = await this.subscriptionService.getSubscriptionUsage(subscriptionId);

      if (!usage) {
        return reply.code(404).send({
          success: false,
          error: 'Subscription or usage data not found',
        });
      }

      return reply.code(200).send({
        success: true,
        data: usage,
      });
    } catch (error) {
      logger.error({ error, subscriptionId: request.params.subscriptionId }, 'Failed to get subscription usage');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get subscription usage',
      });
    }
  }

  async checkUsageLimit(
    request: FastifyRequest<{
      Querystring: {
        metric: string;
        quantity?: number;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const organizationId = request.user!.organizationId;
      const { metric, quantity = 1 } = request.query;

      const result = await this.subscriptionService.checkUsageLimit(
        organizationId,
        metric,
        quantity
      );

      return reply.code(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error({ error, organizationId: request.user?.organizationId }, 'Failed to check usage limit');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to check usage limit',
      });
    }
  }

  async trackUsage(
    request: FastifyRequest<{
      Body: {
        metric: string;
        quantity: number;
        metadata?: Record<string, any>;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const organizationId = request.user!.organizationId;
      const { metric, quantity, metadata } = request.body;

      await this.subscriptionService.trackUsage(organizationId, metric, quantity, metadata);

      return reply.code(200).send({
        success: true,
        message: 'Usage tracked successfully',
      });
    } catch (error) {
      logger.error({ error, organizationId: request.user?.organizationId }, 'Failed to track usage');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to track usage',
      });
    }
  }

  async getOrganizationSubscription(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const organizationId = request.user!.organizationId;

      const subscription = await this.subscriptionService.getSubscriptionByOrganization(organizationId);

      if (!subscription) {
        return reply.code(404).send({
          success: false,
          error: 'No subscription found for organization',
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          id: subscription.id,
          status: subscription.status,
          planId: subscription.metadata.planId,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
    } catch (error) {
      logger.error({ error, organizationId: request.user?.organizationId }, 'Failed to get organization subscription');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to get organization subscription',
      });
    }
  }

  async reactivateSubscription(
    request: FastifyRequest<{
      Params: { subscriptionId: string };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { subscriptionId } = request.params;

      const subscription = await this.subscriptionService.updateSubscription({
        subscriptionId,
        metadata: { reactivated_at: new Date().toISOString() },
      });

      return reply.code(200).send({
        success: true,
        data: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      });
    } catch (error) {
      logger.error({ error, subscriptionId: request.params.subscriptionId }, 'Failed to reactivate subscription');
      
      return reply.code(500).send({
        success: false,
        error: 'Failed to reactivate subscription',
      });
    }
  }
}