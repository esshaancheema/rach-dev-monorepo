import Stripe from 'stripe';
import { stripeConfig, businessConfig, plansConfig, billingConfig } from '../config';
import { logger } from '../utils/logger';
import Decimal from 'decimal.js';

export interface CreateCustomerRequest {
  email: string;
  name?: string;
  phone?: string;
  organizationId: string;
  userId: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionRequest {
  customerId: string;
  priceId: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
  paymentMethodId?: string;
  automaticTax?: boolean;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, string>;
  automaticPaymentMethods?: boolean;
}

export interface CreateInvoiceRequest {
  customerId: string;
  subscriptionId?: string;
  description?: string;
  dueDate?: Date;
  metadata?: Record<string, string>;
  autoAdvance?: boolean;
}

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  priceId?: string;
  quantity?: number;
  prorationBehavior?: 'none' | 'create_prorations' | 'always_invoice';
  metadata?: Record<string, string>;
}

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(stripeConfig.secretKey, {
      apiVersion: stripeConfig.apiVersion,
      typescript: true,
    });
    
    logger.info('Stripe service initialized');
  }

  // Customer Management
  async createCustomer(request: CreateCustomerRequest): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: request.email,
        name: request.name,
        phone: request.phone,
        metadata: {
          organizationId: request.organizationId,
          userId: request.userId,
          ...request.metadata,
        },
        address: {
          line1: businessConfig.address,
        },
        tax_exempt: 'none',
      });

      logger.info({ customerId: customer.id, email: request.email }, 'Stripe customer created');
      return customer;
    } catch (error) {
      logger.error({ error, email: request.email }, 'Failed to create Stripe customer');
      throw error;
    }
  }

  async updateCustomer(
    customerId: string, 
    updates: Partial<CreateCustomerRequest>
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        email: updates.email,
        name: updates.name,
        phone: updates.phone,
        metadata: updates.metadata,
      });

      logger.info({ customerId }, 'Stripe customer updated');
      return customer;
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to update Stripe customer');
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
      return customer.deleted ? null : customer;
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to retrieve Stripe customer');
      return null;
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await this.stripe.customers.del(customerId);
      logger.info({ customerId }, 'Stripe customer deleted');
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to delete Stripe customer');
      throw error;
    }
  }

  // Subscription Management
  async createSubscription(request: CreateSubscriptionRequest): Promise<Stripe.Subscription> {
    try {
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: request.customerId,
        items: [{ price: request.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_collection: billingConfig.paymentMethodCollection,
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
        metadata: request.metadata || {},
        trial_period_days: request.trialPeriodDays || billingConfig.trialPeriodDays,
      };

      if (request.automaticTax) {
        subscriptionData.automatic_tax = { enabled: true };
      }

      if (request.paymentMethodId) {
        subscriptionData.default_payment_method = request.paymentMethodId;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData);

      logger.info({ 
        subscriptionId: subscription.id, 
        customerId: request.customerId,
        priceId: request.priceId 
      }, 'Stripe subscription created');

      return subscription;
    } catch (error) {
      logger.error({ error, customerId: request.customerId }, 'Failed to create Stripe subscription');
      throw error;
    }
  }

  async updateSubscription(request: UpdateSubscriptionRequest): Promise<Stripe.Subscription> {
    try {
      const updateData: Stripe.SubscriptionUpdateParams = {
        metadata: request.metadata,
        proration_behavior: request.prorationBehavior || 'create_prorations',
      };

      if (request.priceId) {
        // Get current subscription to update items
        const currentSub = await this.stripe.subscriptions.retrieve(request.subscriptionId);
        const currentItem = currentSub.items.data[0];
        
        updateData.items = [{
          id: currentItem.id,
          price: request.priceId,
          quantity: request.quantity || 1,
        }];
      }

      const subscription = await this.stripe.subscriptions.update(request.subscriptionId, updateData);

      logger.info({ subscriptionId: request.subscriptionId }, 'Stripe subscription updated');
      return subscription;
    } catch (error) {
      logger.error({ error, subscriptionId: request.subscriptionId }, 'Failed to update Stripe subscription');
      throw error;
    }
  }

  async cancelSubscription(
    subscriptionId: string, 
    immediately: boolean = false
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = immediately 
        ? await this.stripe.subscriptions.cancel(subscriptionId)
        : await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });

      logger.info({ subscriptionId, immediately }, 'Stripe subscription cancelled');
      return subscription;
    } catch (error) {
      logger.error({ error, subscriptionId }, 'Failed to cancel Stripe subscription');
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'customer', 'default_payment_method'],
      });
    } catch (error) {
      logger.error({ error, subscriptionId }, 'Failed to retrieve Stripe subscription');
      return null;
    }
  }

  // Payment Methods
  async attachPaymentMethod(
    paymentMethodId: string, 
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      logger.info({ paymentMethodId, customerId }, 'Payment method attached');
      return paymentMethod;
    } catch (error) {
      logger.error({ error, paymentMethodId, customerId }, 'Failed to attach payment method');
      throw error;
    }
  }

  async setDefaultPaymentMethod(
    customerId: string, 
    paymentMethodId: string
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      logger.info({ customerId, paymentMethodId }, 'Default payment method set');
      return customer;
    } catch (error) {
      logger.error({ error, customerId, paymentMethodId }, 'Failed to set default payment method');
      throw error;
    }
  }

  async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to list payment methods');
      throw error;
    }
  }

  // Payment Intents
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        customer: request.customerId,
        description: request.description,
        metadata: request.metadata || {},
        automatic_payment_methods: request.automaticPaymentMethods ? { enabled: true } : undefined,
      });

      logger.info({ 
        paymentIntentId: paymentIntent.id, 
        amount: request.amount,
        customerId: request.customerId 
      }, 'Payment intent created');

      return paymentIntent;
    } catch (error) {
      logger.error({ error, customerId: request.customerId }, 'Failed to create payment intent');
      throw error;
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string, 
    paymentMethodId?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const confirmData: Stripe.PaymentIntentConfirmParams = {};
      
      if (paymentMethodId) {
        confirmData.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, confirmData);

      logger.info({ paymentIntentId }, 'Payment intent confirmed');
      return paymentIntent;
    } catch (error) {
      logger.error({ error, paymentIntentId }, 'Failed to confirm payment intent');
      throw error;
    }
  }

  // Invoices
  async createInvoice(request: CreateInvoiceRequest): Promise<Stripe.Invoice> {
    try {
      const invoiceData: Stripe.InvoiceCreateParams = {
        customer: request.customerId,
        description: request.description,
        metadata: request.metadata || {},
        auto_advance: request.autoAdvance !== false,
        collection_method: 'charge_automatically',
      };

      if (request.subscriptionId) {
        invoiceData.subscription = request.subscriptionId;
      }

      if (request.dueDate) {
        invoiceData.due_date = Math.floor(request.dueDate.getTime() / 1000);
      }

      const invoice = await this.stripe.invoices.create(invoiceData);

      logger.info({ invoiceId: invoice.id, customerId: request.customerId }, 'Invoice created');
      return invoice;
    } catch (error) {
      logger.error({ error, customerId: request.customerId }, 'Failed to create invoice');
      throw error;
    }
  }

  async finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await this.stripe.invoices.finalizeInvoice(invoiceId);
      logger.info({ invoiceId }, 'Invoice finalized');
      return invoice;
    } catch (error) {
      logger.error({ error, invoiceId }, 'Failed to finalize invoice');
      throw error;
    }
  }

  async payInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    try {
      const invoice = await this.stripe.invoices.pay(invoiceId);
      logger.info({ invoiceId }, 'Invoice paid');
      return invoice;
    } catch (error) {
      logger.error({ error, invoiceId }, 'Failed to pay invoice');
      throw error;
    }
  }

  // Usage Records (for usage-based billing)
  async createUsageRecord(
    subscriptionItemId: string,
    quantity: number,
    timestamp?: Date
  ): Promise<Stripe.UsageRecord> {
    try {
      const usageRecord = await this.stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity,
          timestamp: timestamp ? Math.floor(timestamp.getTime() / 1000) : 'now',
          action: 'increment',
        }
      );

      logger.info({ subscriptionItemId, quantity }, 'Usage record created');
      return usageRecord;
    } catch (error) {
      logger.error({ error, subscriptionItemId }, 'Failed to create usage record');
      throw error;
    }
  }

  // Webhook handling
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload, 
        signature, 
        stripeConfig.webhookSecret
      );
    } catch (error) {
      logger.error({ error }, 'Failed to construct Stripe webhook event');
      throw error;
    }
  }

  // Pricing and Plans
  async createPrice(
    productId: string,
    unitAmount: number,
    currency: string = businessConfig.defaultCurrency,
    recurring?: { interval: 'month' | 'year' }
  ): Promise<Stripe.Price> {
    try {
      const priceData: Stripe.PriceCreateParams = {
        product: productId,
        unit_amount: Math.round(unitAmount * 100), // Convert to cents
        currency: currency.toLowerCase(),
      };

      if (recurring) {
        priceData.recurring = recurring;
      }

      const price = await this.stripe.prices.create(priceData);
      logger.info({ priceId: price.id, productId, unitAmount }, 'Price created');
      return price;
    } catch (error) {
      logger.error({ error, productId }, 'Failed to create price');
      throw error;
    }
  }

  // Tax calculation
  async calculateTax(
    lineItems: Array<{ amount: number; reference: string }>,
    customerDetails: { address: Stripe.Tax.CalculationCreateParams.CustomerDetails['address'] }
  ): Promise<Stripe.Tax.Calculation> {
    try {
      const calculation = await this.stripe.tax.calculations.create({
        currency: businessConfig.defaultCurrency.toLowerCase(),
        customer_details: customerDetails,
        line_items: lineItems.map(item => ({
          amount: Math.round(item.amount * 100), // Convert to cents
          reference: item.reference,
        })),
      });

      logger.info({ calculationId: calculation.id }, 'Tax calculated');
      return calculation;
    } catch (error) {
      logger.error({ error }, 'Failed to calculate tax');
      throw error;
    }
  }

  // Analytics and Reporting
  async getCustomerPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      logger.info({ customerId, sessionId: session.id }, 'Customer portal session created');
      return session;
    } catch (error) {
      logger.error({ error, customerId }, 'Failed to create customer portal session');
      throw error;
    }
  }

  // Health checks
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      // Simple API call to verify Stripe connectivity
      await this.stripe.accounts.retrieve();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error({ error }, 'Stripe health check failed');
      throw error;
    }
  }
}