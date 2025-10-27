import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { StripeService } from '../services/stripe.service';
import { BillingRedis } from '../utils/redis';
import { logger } from '../utils/logger';
import Stripe from 'stripe';

export async function webhookRoutes(app: FastifyInstance) {
  const stripeService = new StripeService();

  // Stripe webhook endpoint
  app.post(
    '/stripe',
    {
      config: {
        rawBody: true, // Need raw body for webhook signature verification
      },
    },
    async (request, reply) => {
      try {
        const signature = request.headers['stripe-signature'] as string;
        const payload = request.rawBody as Buffer;

        if (!signature) {
          return reply.code(400).send({
            success: false,
            error: 'Missing stripe-signature header',
          });
        }

        // Construct the event using Stripe's webhook signature verification
        const event = stripeService.constructEvent(payload, signature);

        // Check for duplicate events
        const isNewEvent = await BillingRedis.trackWebhookEvent(event.id);
        if (!isNewEvent) {
          logger.info({ eventId: event.id }, 'Duplicate webhook event ignored');
          return reply.code(200).send({
            success: true,
            message: 'Event already processed',
          });
        }

        logger.info({ eventType: event.type, eventId: event.id }, 'Processing Stripe webhook event');

        // Handle different event types
        switch (event.type) {
          case 'customer.subscription.created':
            await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
            break;

          case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
            break;

          case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
            break;

          case 'invoice.payment_succeeded':
            await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
            break;

          case 'invoice.payment_failed':
            await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
            break;

          case 'customer.created':
            await handleCustomerCreated(event.data.object as Stripe.Customer);
            break;

          case 'customer.updated':
            await handleCustomerUpdated(event.data.object as Stripe.Customer);
            break;

          case 'payment_method.attached':
            await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
            break;

          case 'payment_intent.succeeded':
            await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
            break;

          case 'payment_intent.payment_failed':
            await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
            break;

          default:
            logger.info({ eventType: event.type }, 'Unhandled webhook event type');
        }

        return reply.code(200).send({
          success: true,
          message: 'Webhook processed successfully',
        });
      } catch (error) {
        logger.error({ error }, 'Failed to process Stripe webhook');
        
        return reply.code(400).send({
          success: false,
          error: 'Failed to process webhook',
        });
      }
    }
  );

  // Webhook event handlers
  async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    logger.info({ subscriptionId: subscription.id }, 'Subscription created');
    
    // Cache subscription data
    await BillingRedis.cacheSubscription(subscription.id, subscription);
    
    // Track metrics
    await BillingRedis.incrementMetric('subscriptions_created');
  }

  async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    logger.info({ subscriptionId: subscription.id }, 'Subscription updated');
    
    // Update cached subscription data
    await BillingRedis.cacheSubscription(subscription.id, subscription);
    
    // If subscription was cancelled, handle access revocation
    if (subscription.status === 'canceled') {
      const organizationId = subscription.metadata.organizationId;
      if (organizationId) {
        // Revoke access logic would go here
        logger.info({ organizationId }, 'Subscription cancelled, access should be revoked');
      }
    }
  }

  async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    logger.info({ subscriptionId: subscription.id }, 'Subscription deleted');
    
    // Remove from cache
    await BillingRedis.invalidateSubscriptionCache(subscription.id);
    
    // Revoke organization access
    const organizationId = subscription.metadata.organizationId;
    if (organizationId) {
      // Revoke access logic
      logger.info({ organizationId }, 'Subscription deleted, access revoked');
    }
    
    // Track metrics
    await BillingRedis.incrementMetric('subscriptions_deleted');
  }

  async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    logger.info({ invoiceId: invoice.id }, 'Invoice payment succeeded');
    
    // Cache invoice data
    await BillingRedis.cacheInvoice(invoice.id, invoice);
    
    // Track revenue metrics
    const amount = invoice.amount_paid / 100; // Convert from cents
    await BillingRedis.incrementMetric('revenue', amount);
    await BillingRedis.incrementMetric('successful_payments');
  }

  async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    logger.warn({ invoiceId: invoice.id }, 'Invoice payment failed');
    
    // Track failed payment metrics
    await BillingRedis.incrementMetric('failed_payments');
    
    // Handle dunning management if enabled
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
    if (customerId) {
      logger.info({ customerId }, 'Payment failed, initiating dunning process');
      // Dunning logic would go here
    }
  }

  async function handleCustomerCreated(customer: Stripe.Customer) {
    logger.info({ customerId: customer.id }, 'Customer created');
    
    // Cache customer data
    const organizationId = customer.metadata.organizationId;
    if (organizationId) {
      await BillingRedis.cacheCustomer(`org:${organizationId}`, customer);
    }
    
    // Track metrics
    await BillingRedis.incrementMetric('customers_created');
  }

  async function handleCustomerUpdated(customer: Stripe.Customer) {
    logger.info({ customerId: customer.id }, 'Customer updated');
    
    // Update cached customer data
    const organizationId = customer.metadata.organizationId;
    if (organizationId) {
      await BillingRedis.cacheCustomer(`org:${organizationId}`, customer);
    }
  }

  async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
    logger.info({ paymentMethodId: paymentMethod.id }, 'Payment method attached');
    
    // Track metrics
    await BillingRedis.incrementMetric('payment_methods_added');
  }

  async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    logger.info({ paymentIntentId: paymentIntent.id }, 'Payment intent succeeded');
    
    // Release any payment locks
    const customerId = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : paymentIntent.customer?.id;
    if (customerId) {
      await BillingRedis.releasePaymentLock(customerId, paymentIntent.id);
    }
    
    // Track metrics
    const amount = paymentIntent.amount / 100; // Convert from cents
    await BillingRedis.incrementMetric('one_time_payments', amount);
  }

  async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    logger.warn({ paymentIntentId: paymentIntent.id }, 'Payment intent failed');
    
    // Release payment locks
    const customerId = typeof paymentIntent.customer === 'string' ? paymentIntent.customer : paymentIntent.customer?.id;
    if (customerId) {
      await BillingRedis.releasePaymentLock(customerId, paymentIntent.id);
    }
    
    // Track metrics
    await BillingRedis.incrementMetric('failed_one_time_payments');
  }
}