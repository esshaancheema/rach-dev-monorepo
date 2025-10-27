import { StripeService } from './stripe.service';
import { BillingRedis } from '../utils/redis';
import { logger } from '../utils/logger';
import { plansConfig, billingConfig, features } from '../config';
import { SubscriptionError } from '../middleware/error-handler';
import Stripe from 'stripe';

export interface CreateSubscriptionRequest {
  organizationId: string;
  userId: string;
  planId: string;
  paymentMethodId?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  planId?: string;
  quantity?: number;
  prorationBehavior?: 'none' | 'create_prorations' | 'always_invoice';
  metadata?: Record<string, string>;
}

export interface SubscriptionUsage {
  subscriptionId: string;
  organizationId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  usage: {
    apiCalls: number;
    storageUsed: number;
    bandwidthUsed: number;
    [key: string]: number;
  };
  limits: {
    apiCalls: number;
    storageLimit: number;
    bandwidthLimit: number;
    [key: string]: number;
  };
}

export class SubscriptionService {
  private stripeService: StripeService;

  constructor() {
    this.stripeService = new StripeService();
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<Stripe.Subscription> {
    try {
      logger.info({ organizationId: request.organizationId, planId: request.planId }, 'Creating subscription');

      // Validate plan
      const planConfig = this.getPlanConfig(request.planId);
      if (!planConfig || !planConfig.stripeId) {
        throw new SubscriptionError(`Invalid plan: ${request.planId}`);
      }

      // Get or create Stripe customer
      let customer = await this.getOrCreateCustomer(request.organizationId, request.userId);

      // Create subscription
      const subscription = await this.stripeService.createSubscription({
        customerId: customer.id,
        priceId: planConfig.stripeId,
        trialPeriodDays: request.trialPeriodDays,
        paymentMethodId: request.paymentMethodId,
        automaticTax: features.automaticTax,
        metadata: {
          organizationId: request.organizationId,
          userId: request.userId,
          planId: request.planId,
          ...request.metadata,
        },
      });

      // Cache subscription data
      await this.cacheSubscriptionData(subscription);

      // Track usage limits
      await this.initializeUsageLimits(subscription.id, request.organizationId, request.planId);

      logger.info({ 
        subscriptionId: subscription.id, 
        organizationId: request.organizationId,
        planId: request.planId 
      }, 'Subscription created successfully');

      return subscription;
    } catch (error) {
      logger.error({ error, organizationId: request.organizationId }, 'Failed to create subscription');
      throw error;
    }
  }

  async updateSubscription(request: UpdateSubscriptionRequest): Promise<Stripe.Subscription> {
    try {
      logger.info({ subscriptionId: request.subscriptionId }, 'Updating subscription');

      // Get current subscription
      const currentSubscription = await this.getSubscription(request.subscriptionId);
      if (!currentSubscription) {
        throw new SubscriptionError('Subscription not found');
      }

      let updateData = { ...request };

      // If changing plan, get the new price ID
      if (request.planId) {
        const planConfig = this.getPlanConfig(request.planId);
        if (!planConfig || !planConfig.stripeId) {
          throw new SubscriptionError(`Invalid plan: ${request.planId}`);
        }
        updateData.priceId = planConfig.stripeId;
      }

      // Update subscription in Stripe
      const subscription = await this.stripeService.updateSubscription({
        subscriptionId: request.subscriptionId,
        priceId: updateData.priceId,
        quantity: request.quantity,
        prorationBehavior: features.proration ? request.prorationBehavior : 'none',
        metadata: {
          ...currentSubscription.metadata,
          ...request.metadata,
          ...(request.planId && { planId: request.planId }),
        },
      });

      // Update cached data
      await this.cacheSubscriptionData(subscription);

      // Update usage limits if plan changed
      if (request.planId) {
        const organizationId = subscription.metadata.organizationId;
        await this.updateUsageLimits(subscription.id, organizationId, request.planId);
      }

      logger.info({ subscriptionId: request.subscriptionId }, 'Subscription updated successfully');

      return subscription;
    } catch (error) {
      logger.error({ error, subscriptionId: request.subscriptionId }, 'Failed to update subscription');
      throw error;
    }
  }

  async cancelSubscription(
    subscriptionId: string, 
    immediately: boolean = false,
    reason?: string
  ): Promise<Stripe.Subscription> {
    try {
      logger.info({ subscriptionId, immediately, reason }, 'Cancelling subscription');

      const subscription = await this.stripeService.cancelSubscription(subscriptionId, immediately);

      // Update cached data
      await this.cacheSubscriptionData(subscription);

      // If immediate cancellation, revoke access
      if (immediately) {
        const organizationId = subscription.metadata.organizationId;
        await this.revokeAccess(organizationId);
      }

      logger.info({ subscriptionId, immediately }, 'Subscription cancelled successfully');

      return subscription;
    } catch (error) {
      logger.error({ error, subscriptionId }, 'Failed to cancel subscription');
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      // Try cache first
      const cached = await BillingRedis.getCachedSubscription(subscriptionId);
      if (cached) {
        return cached;
      }

      // Fetch from Stripe
      const subscription = await this.stripeService.getSubscription(subscriptionId);
      if (subscription) {
        await this.cacheSubscriptionData(subscription);
      }

      return subscription;
    } catch (error) {
      logger.error({ error, subscriptionId }, 'Failed to get subscription');
      return null;
    }
  }

  async getSubscriptionByOrganization(organizationId: string): Promise<Stripe.Subscription | null> {
    try {
      // This would typically involve a database lookup to find the subscription ID
      // For now, we'll implement a basic search through Stripe
      const customers = await BillingRedis.getCachedCustomer(`org:${organizationId}`);
      if (!customers) {
        return null;
      }

      // In a real implementation, you'd store the mapping in your database
      // This is a simplified version
      return null;
    } catch (error) {
      logger.error({ error, organizationId }, 'Failed to get subscription by organization');
      return null;
    }
  }

  async getSubscriptionUsage(subscriptionId: string): Promise<SubscriptionUsage | null> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new SubscriptionError('Subscription not found');
      }

      const organizationId = subscription.metadata.organizationId;
      const planId = subscription.metadata.planId;

      if (!organizationId || !planId) {
        throw new SubscriptionError('Missing subscription metadata');
      }

      // Get current billing period
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      // Get usage data from Redis
      const apiCallsUsage = await BillingRedis.getUsage(
        organizationId, 
        'api_calls', 
        currentPeriodStart, 
        currentPeriodEnd
      );

      const storageUsage = await BillingRedis.getUsage(
        organizationId, 
        'storage', 
        currentPeriodStart, 
        currentPeriodEnd
      );

      const bandwidthUsage = await BillingRedis.getUsage(
        organizationId, 
        'bandwidth', 
        currentPeriodStart, 
        currentPeriodEnd
      );

      // Calculate totals
      const totalApiCalls = Object.values(apiCallsUsage).reduce((sum, val) => sum + val, 0);
      const totalStorage = Object.values(storageUsage).reduce((sum, val) => sum + val, 0);
      const totalBandwidth = Object.values(bandwidthUsage).reduce((sum, val) => sum + val, 0);

      // Get plan limits
      const planConfig = this.getPlanConfig(planId);
      
      return {
        subscriptionId,
        organizationId,
        currentPeriodStart,
        currentPeriodEnd,
        usage: {
          apiCalls: totalApiCalls,
          storageUsed: totalStorage,
          bandwidthUsed: totalBandwidth,
        },
        limits: {
          apiCalls: planConfig?.apiCalls || -1,
          storageLimit: 1000000000, // 1GB default
          bandwidthLimit: 10000000000, // 10GB default
        },
      };
    } catch (error) {
      logger.error({ error, subscriptionId }, 'Failed to get subscription usage');
      return null;
    }
  }

  async checkUsageLimit(
    organizationId: string, 
    metric: string, 
    quantity: number = 1
  ): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    try {
      // Get organization's subscription
      const subscription = await this.getSubscriptionByOrganization(organizationId);
      if (!subscription) {
        // No subscription = free tier limits
        const freeLimits = this.getPlanConfig('free');
        return {
          allowed: false,
          remaining: 0,
          limit: freeLimits?.apiCalls || 0,
        };
      }

      const usage = await this.getSubscriptionUsage(subscription.id);
      if (!usage) {
        return { allowed: false, remaining: 0, limit: 0 };
      }

      const currentUsage = usage.usage[metric] || 0;
      const limit = usage.limits[metric] || 0;
      
      // -1 means unlimited
      if (limit === -1) {
        return { allowed: true, remaining: -1, limit: -1 };
      }

      const remaining = Math.max(0, limit - currentUsage);
      const allowed = remaining >= quantity;

      return { allowed, remaining, limit };
    } catch (error) {
      logger.error({ error, organizationId, metric }, 'Failed to check usage limit');
      return { allowed: false, remaining: 0, limit: 0 };
    }
  }

  async trackUsage(
    organizationId: string, 
    metric: string, 
    quantity: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Track in Redis
      await BillingRedis.trackUsage(organizationId, metric, quantity);

      // If usage-based billing is enabled, create usage record in Stripe
      if (features.usageBasedBilling) {
        const subscription = await this.getSubscriptionByOrganization(organizationId);
        if (subscription && subscription.items.data.length > 0) {
          const subscriptionItem = subscription.items.data[0];
          await this.stripeService.createUsageRecord(subscriptionItem.id, quantity);
        }
      }

      logger.debug({ 
        organizationId, 
        metric, 
        quantity, 
        metadata 
      }, 'Usage tracked successfully');
    } catch (error) {
      logger.error({ error, organizationId, metric }, 'Failed to track usage');
      // Don't throw here - usage tracking shouldn't break the main flow
    }
  }

  private async getOrCreateCustomer(organizationId: string, userId: string): Promise<Stripe.Customer> {
    // This would typically involve database lookups
    // For now, we'll use a simplified approach
    const cachedCustomer = await BillingRedis.getCachedCustomer(`org:${organizationId}`);
    if (cachedCustomer) {
      return cachedCustomer;
    }

    // Create new customer (this would typically get user data from database)
    const customer = await this.stripeService.createCustomer({
      email: `user-${userId}@example.com`, // Would come from user service
      organizationId,
      userId,
      name: `Organization ${organizationId}`,
    });

    await BillingRedis.cacheCustomer(`org:${organizationId}`, customer);
    return customer;
  }

  private async cacheSubscriptionData(subscription: Stripe.Subscription): Promise<void> {
    await BillingRedis.cacheSubscription(subscription.id, subscription, 3600);
  }

  private async initializeUsageLimits(
    subscriptionId: string, 
    organizationId: string, 
    planId: string
  ): Promise<void> {
    const limits = this.getPlanLimits(planId);
    await BillingRedis.storeSession(`limits:${organizationId}`, limits, 86400);
  }

  private async updateUsageLimits(
    subscriptionId: string, 
    organizationId: string, 
    planId: string
  ): Promise<void> {
    await this.initializeUsageLimits(subscriptionId, organizationId, planId);
  }

  private async revokeAccess(organizationId: string): Promise<void> {
    // Implement access revocation logic
    await BillingRedis.deleteSession(`limits:${organizationId}`);
    logger.info({ organizationId }, 'Access revoked for organization');
  }

  private getPlanConfig(planId: string) {
    return (plansConfig as any)[planId];
  }

  private getPlanLimits(planId: string) {
    const config = this.getPlanConfig(planId);
    return {
      apiCalls: config?.apiCalls || 0,
      storage: 1000000000, // 1GB
      bandwidth: 10000000000, // 10GB
    };
  }
}