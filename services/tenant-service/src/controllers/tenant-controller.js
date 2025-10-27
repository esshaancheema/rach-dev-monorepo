const Tenant = require('../models/Tenant');
const { createTenantSchema, migrateTenantData } = require('../utils/database-manager');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Tenant Management Controller
 * 
 * Handles:
 * - Tenant lifecycle management
 * - Onboarding and provisioning
 * - Configuration management
 * - Billing and subscription management
 * - Usage monitoring and analytics
 */

class TenantController {
  
  /**
   * Create a new tenant
   */
  async createTenant(req, res) {
    try {
      const {
        name,
        slug,
        contact,
        plan = 'trial',
        isolationStrategy = 'schema',
        features = {},
        domains = []
      } = req.body;

      // Validate required fields
      if (!name || !contact?.name || !contact?.email) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Name and contact information are required'
        });
      }

      // Check if slug is already taken
      const existingTenant = await Tenant.findOne({ slug });
      if (existingTenant) {
        return res.status(409).json({
          error: 'SLUG_TAKEN',
          message: 'Tenant slug is already taken'
        });
      }

      // Create Stripe customer for billing
      let stripeCustomer = null;
      if (plan !== 'trial') {
        stripeCustomer = await stripe.customers.create({
          email: contact.email,
          name: contact.name,
          metadata: {
            tenantSlug: slug,
            plan: plan
          }
        });
      }

      // Create tenant
      const tenant = new Tenant({
        name,
        slug,
        contact,
        isolationStrategy,
        configuration: {
          features: {
            ...this.getDefaultFeatures(plan),
            ...features
          },
          quotas: this.getDefaultQuotas(plan),
          rateLimits: this.getDefaultRateLimits(plan),
          security: this.getDefaultSecurity(plan)
        },
        subscription: {
          plan,
          status: 'active',
          stripeCustomerId: stripeCustomer?.id,
          trialEndsAt: plan === 'trial' ? 
            new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined
        },
        domains: domains.map(domain => ({
          domain: domain.toLowerCase(),
          isPrimary: domains.length === 1
        })),
        audit: {
          createdBy: req.user?.id
        }
      });

      await tenant.save();

      // Provision tenant infrastructure
      await this.provisionTenantInfrastructure(tenant);

      // Send welcome email
      await this.sendWelcomeEmail(tenant);

      logger.info('Tenant created successfully', {
        tenantId: tenant.tenantId,
        slug: tenant.slug,
        plan: tenant.subscription.plan,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        tenant: {
          id: tenant._id,
          tenantId: tenant.tenantId,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.subscription.plan,
          status: tenant.status,
          createdAt: tenant.createdAt
        }
      });

    } catch (error) {
      logger.error('Error creating tenant', error);
      res.status(500).json({
        error: 'TENANT_CREATION_ERROR',
        message: 'Failed to create tenant'
      });
    }
  }

  /**
   * Get tenant details
   */
  async getTenant(req, res) {
    try {
      const { tenantId } = req.params;
      
      const tenant = await Tenant.findOne({
        $or: [
          { tenantId },
          { slug: tenantId },
          { _id: tenantId }
        ]
      }).select('-database.connectionString -database.encryptionKey');

      if (!tenant) {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      // Calculate usage percentages
      const usagePercentage = tenant.usagePercentage;

      res.json({
        success: true,
        tenant: {
          ...tenant.toObject(),
          usagePercentage
        }
      });

    } catch (error) {
      logger.error('Error fetching tenant', error);
      res.status(500).json({
        error: 'TENANT_FETCH_ERROR',
        message: 'Failed to fetch tenant'
      });
    }
  }

  /**
   * Update tenant configuration
   */
  async updateTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const updates = req.body;

      // Find tenant
      const tenant = await Tenant.findOne({
        $or: [
          { tenantId },
          { slug: tenantId }
        ]
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      // Validate updates
      const allowedUpdates = [
        'name', 'contact', 'configuration', 'branding', 
        'domains', 'compliance', 'integrations'
      ];

      const updateKeys = Object.keys(updates);
      const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

      if (!isValidUpdate) {
        return res.status(400).json({
          error: 'INVALID_UPDATE',
          message: 'Invalid update fields provided'
        });
      }

      // Apply updates
      Object.keys(updates).forEach(key => {
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
          tenant[key] = { ...tenant[key], ...updates[key] };
        } else {
          tenant[key] = updates[key];
        }
      });

      tenant.audit.lastModifiedBy = req.user?.id;
      await tenant.save();

      logger.info('Tenant updated', {
        tenantId: tenant.tenantId,
        updatedFields: updateKeys,
        updatedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Tenant updated successfully'
      });

    } catch (error) {
      logger.error('Error updating tenant', error);
      res.status(500).json({
        error: 'TENANT_UPDATE_ERROR',
        message: 'Failed to update tenant'
      });
    }
  }

  /**
   * Upgrade/downgrade tenant subscription
   */
  async updateSubscription(req, res) {
    try {
      const { tenantId } = req.params;
      const { plan, billingCycle = 'monthly' } = req.body;

      const validPlans = ['trial', 'starter', 'professional', 'enterprise'];
      if (!validPlans.includes(plan)) {
        return res.status(400).json({
          error: 'INVALID_PLAN',
          message: 'Invalid subscription plan'
        });
      }

      const tenant = await Tenant.findOne({
        $or: [{ tenantId }, { slug: tenantId }]
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      const currentPlan = tenant.subscription.plan;
      
      // Handle trial to paid plan upgrade
      if (currentPlan === 'trial' && plan !== 'trial') {
        await this.handleTrialUpgrade(tenant, plan, billingCycle);
      }
      // Handle plan changes for existing paid subscriptions
      else if (currentPlan !== 'trial' && plan !== 'trial') {
        await this.handlePlanChange(tenant, plan, billingCycle);
      }
      // Handle downgrade to trial (not typically allowed)
      else if (currentPlan !== 'trial' && plan === 'trial') {
        return res.status(400).json({
          error: 'INVALID_DOWNGRADE',
          message: 'Cannot downgrade paid plan to trial'
        });
      }

      // Update tenant configuration for new plan
      tenant.subscription.plan = plan;
      tenant.subscription.billingCycle = billingCycle;
      tenant.configuration.features = {
        ...tenant.configuration.features,
        ...this.getDefaultFeatures(plan)
      };
      tenant.configuration.quotas = this.getDefaultQuotas(plan);
      tenant.audit.lastModifiedBy = req.user?.id;

      await tenant.save();

      logger.info('Tenant subscription updated', {
        tenantId: tenant.tenantId,
        fromPlan: currentPlan,
        toPlan: plan,
        billingCycle,
        updatedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Subscription updated successfully',
        subscription: {
          plan: tenant.subscription.plan,
          status: tenant.subscription.status,
          billingCycle: tenant.subscription.billingCycle,
          nextBillingDate: tenant.subscription.nextBillingDate
        }
      });

    } catch (error) {
      logger.error('Error updating subscription', error);
      res.status(500).json({
        error: 'SUBSCRIPTION_UPDATE_ERROR',
        message: 'Failed to update subscription'
      });
    }
  }

  /**
   * Update tenant usage statistics
   */
  async updateUsage(req, res) {
    try {
      const { tenantId } = req.params;
      const usage = req.body;

      const tenant = await Tenant.findOne({
        $or: [{ tenantId }, { slug: tenantId }]
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      const violations = await tenant.updateUsage(usage);

      res.json({
        success: true,
        message: 'Usage updated successfully',
        usage: tenant.subscription.usage,
        violations: violations.length > 0 ? violations : undefined
      });

    } catch (error) {
      logger.error('Error updating usage', error);
      res.status(500).json({
        error: 'USAGE_UPDATE_ERROR',
        message: 'Failed to update usage'
      });
    }
  }

  /**
   * Add custom domain
   */
  async addDomain(req, res) {
    try {
      const { tenantId } = req.params;
      const { domain, isPrimary = false } = req.body;

      if (!domain) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Domain is required'
        });
      }

      const tenant = await Tenant.findOne({
        $or: [{ tenantId }, { slug: tenantId }]
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      // Check if domain already exists
      const existingDomain = tenant.domains.find(d => d.domain === domain.toLowerCase());
      if (existingDomain) {
        return res.status(409).json({
          error: 'DOMAIN_EXISTS',
          message: 'Domain already added to tenant'
        });
      }

      // Check if domain is already used by another tenant
      const conflictingTenant = await Tenant.findOne({
        'domains.domain': domain.toLowerCase(),
        _id: { $ne: tenant._id }
      });

      if (conflictingTenant) {
        return res.status(409).json({
          error: 'DOMAIN_TAKEN',
          message: 'Domain is already used by another tenant'
        });
      }

      // If setting as primary, unset other primary domains
      if (isPrimary) {
        tenant.domains.forEach(d => d.isPrimary = false);
      }

      // Add domain
      tenant.domains.push({
        domain: domain.toLowerCase(),
        isPrimary,
        dnsStatus: 'pending',
        sslCertificate: {
          status: 'pending'
        }
      });

      await tenant.save();

      // Initiate DNS verification and SSL certificate provisioning
      await this.initiateDomainSetup(tenant, domain);

      logger.info('Domain added to tenant', {
        tenantId: tenant.tenantId,
        domain,
        isPrimary
      });

      res.status(201).json({
        success: true,
        message: 'Domain added successfully',
        domain: {
          domain: domain.toLowerCase(),
          isPrimary,
          dnsStatus: 'pending',
          sslStatus: 'pending'
        }
      });

    } catch (error) {
      logger.error('Error adding domain', error);
      res.status(500).json({
        error: 'DOMAIN_ADD_ERROR',
        message: 'Failed to add domain'
      });
    }
  }

  /**
   * Generate API key for tenant
   */
  async generateAPIKey(req, res) {
    try {
      const { tenantId } = req.params;
      const { name, permissions = [] } = req.body;

      if (!name) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'API key name is required'
        });
      }

      const tenant = await Tenant.findOne({
        $or: [{ tenantId }, { slug: tenantId }]
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      // Check if API access is enabled
      if (!tenant.isFeatureEnabled('apiAccess')) {
        return res.status(403).json({
          error: 'FEATURE_NOT_AVAILABLE',
          message: 'API access is not available for your plan'
        });
      }

      const apiKey = await tenant.generateAPIKey(name, permissions);

      logger.info('API key generated', {
        tenantId: tenant.tenantId,
        keyName: name,
        permissions
      });

      res.status(201).json({
        success: true,
        message: 'API key generated successfully',
        apiKey: {
          key: apiKey, // Only returned once
          name,
          permissions,
          createdAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Error generating API key', error);
      res.status(500).json({
        error: 'API_KEY_ERROR',
        message: 'Failed to generate API key'
      });
    }
  }

  /**
   * Get tenant analytics
   */
  async getAnalytics(req, res) {
    try {
      const { tenantId } = req.params;
      const { period = '30d' } = req.query;

      const tenant = await Tenant.findOne({
        $or: [{ tenantId }, { slug: tenantId }]
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      const analytics = await this.generateTenantAnalytics(tenant, period);

      res.json({
        success: true,
        analytics
      });

    } catch (error) {
      logger.error('Error fetching analytics', error);
      res.status(500).json({
        error: 'ANALYTICS_ERROR',
        message: 'Failed to fetch analytics'
      });
    }
  }

  /**
   * Suspend tenant
   */
  async suspendTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const { reason } = req.body;

      const tenant = await Tenant.findOne({
        $or: [{ tenantId }, { slug: tenantId }]
      });

      if (!tenant) {
        return res.status(404).json({
          error: 'TENANT_NOT_FOUND',
          message: 'Tenant not found'
        });
      }

      tenant.status = 'suspended';
      tenant.subscription.status = 'suspended';
      tenant.audit.lastModifiedBy = req.user?.id;
      
      // Add suspension flag
      tenant.audit.flags.push({
        type: 'security_alert',
        message: `Tenant suspended: ${reason || 'No reason provided'}`,
        severity: 'critical',
        createdAt: new Date()
      });

      await tenant.save();

      logger.warn('Tenant suspended', {
        tenantId: tenant.tenantId,
        reason,
        suspendedBy: req.user?.id
      });

      res.json({
        success: true,
        message: 'Tenant suspended successfully'
      });

    } catch (error) {
      logger.error('Error suspending tenant', error);
      res.status(500).json({
        error: 'TENANT_SUSPENSION_ERROR',
        message: 'Failed to suspend tenant'
      });
    }
  }

  // Helper methods

  /**
   * Provision tenant infrastructure
   */
  async provisionTenantInfrastructure(tenant) {
    try {
      // Create database schema based on isolation strategy
      if (tenant.isolationStrategy === 'schema') {
        const connection = mongoose.connection; // Use default connection
        await createTenantSchema(connection, tenant.tenantId, tenant.database.schemaName);
      }

      // Set up initial configurations
      await this.setupInitialConfigurations(tenant);

      logger.info('Tenant infrastructure provisioned', {
        tenantId: tenant.tenantId,
        isolationStrategy: tenant.isolationStrategy
      });

    } catch (error) {
      logger.error('Error provisioning tenant infrastructure', error);
      throw error;
    }
  }

  /**
   * Setup initial configurations
   */
  async setupInitialConfigurations(tenant) {
    // Initialize default settings, create admin user, etc.
    // This would be implemented based on specific requirements
    logger.debug('Setting up initial configurations', {
      tenantId: tenant.tenantId
    });
  }

  /**
   * Handle trial to paid plan upgrade
   */
  async handleTrialUpgrade(tenant, plan, billingCycle) {
    if (!tenant.subscription.stripeCustomerId) {
      // Create Stripe customer if not exists
      const customer = await stripe.customers.create({
        email: tenant.contact.email,
        name: tenant.contact.name,
        metadata: {
          tenantId: tenant.tenantId,
          tenantSlug: tenant.slug
        }
      });
      tenant.subscription.stripeCustomerId = customer.id;
    }

    // Create subscription in Stripe
    const priceId = this.getStripePriceId(plan, billingCycle);
    const subscription = await stripe.subscriptions.create({
      customer: tenant.subscription.stripeCustomerId,
      items: [{ price: priceId }],
      trial_end: 'now' // End trial immediately
    });

    tenant.subscription.stripeSubscriptionId = subscription.id;
    tenant.subscription.status = 'active';
    tenant.subscription.nextBillingDate = new Date(subscription.current_period_end * 1000);
  }

  /**
   * Handle plan change for existing subscription
   */
  async handlePlanChange(tenant, newPlan, billingCycle) {
    if (tenant.subscription.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        tenant.subscription.stripeSubscriptionId
      );

      const newPriceId = this.getStripePriceId(newPlan, billingCycle);
      
      await stripe.subscriptions.update(tenant.subscription.stripeSubscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: 'always_invoice'
      });
    }
  }

  /**
   * Get default features for plan
   */
  getDefaultFeatures(plan) {
    const features = {
      trial: {
        aiCodeGeneration: true,
        realTimeCollaboration: false,
        customBranding: false,
        ssoIntegration: false,
        advancedAnalytics: false,
        apiAccess: false,
        webhooks: false
      },
      starter: {
        aiCodeGeneration: true,
        realTimeCollaboration: true,
        customBranding: false,
        ssoIntegration: false,
        advancedAnalytics: false,
        apiAccess: true,
        webhooks: false
      },
      professional: {
        aiCodeGeneration: true,
        realTimeCollaboration: true,
        customBranding: true,
        ssoIntegration: false,
        advancedAnalytics: true,
        apiAccess: true,
        webhooks: true
      },
      enterprise: {
        aiCodeGeneration: true,
        realTimeCollaboration: true,
        customBranding: true,
        ssoIntegration: true,
        advancedAnalytics: true,
        apiAccess: true,
        webhooks: true
      }
    };

    return features[plan] || features.trial;
  }

  /**
   * Get default quotas for plan
   */
  getDefaultQuotas(plan) {
    const quotas = {
      trial: {
        maxUsers: 3,
        maxProjects: 5,
        maxStorageGB: 1,
        maxAPICallsPerMonth: 1000,
        maxAITokensPerMonth: 10000,
        maxCollaborators: 2
      },
      starter: {
        maxUsers: 10,
        maxProjects: 50,
        maxStorageGB: 10,
        maxAPICallsPerMonth: 10000,
        maxAITokensPerMonth: 100000,
        maxCollaborators: 5
      },
      professional: {
        maxUsers: 50,
        maxProjects: 500,
        maxStorageGB: 100,
        maxAPICallsPerMonth: 100000,
        maxAITokensPerMonth: 1000000,
        maxCollaborators: 25
      },
      enterprise: {
        maxUsers: -1, // Unlimited
        maxProjects: -1,
        maxStorageGB: 1000,
        maxAPICallsPerMonth: -1,
        maxAITokensPerMonth: -1,
        maxCollaborators: -1
      }
    };

    return quotas[plan] || quotas.trial;
  }

  /**
   * Get default rate limits for plan
   */
  getDefaultRateLimits(plan) {
    const rateLimits = {
      trial: {
        apiCalls: { windowMs: 900000, maxRequests: 100 },
        aiRequests: { windowMs: 3600000, maxRequests: 10 }
      },
      starter: {
        apiCalls: { windowMs: 900000, maxRequests: 1000 },
        aiRequests: { windowMs: 3600000, maxRequests: 100 }
      },
      professional: {
        apiCalls: { windowMs: 900000, maxRequests: 5000 },
        aiRequests: { windowMs: 3600000, maxRequests: 500 }
      },
      enterprise: {
        apiCalls: { windowMs: 900000, maxRequests: 25000 },
        aiRequests: { windowMs: 3600000, maxRequests: 2500 }
      }
    };

    return rateLimits[plan] || rateLimits.trial;
  }

  /**
   * Get default security settings for plan
   */
  getDefaultSecurity(plan) {
    return {
      passwordPolicy: {
        minLength: plan === 'enterprise' ? 12 : 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: plan !== 'trial'
      },
      sessionTimeout: plan === 'enterprise' ? 1800 : 3600,
      mfaRequired: plan === 'enterprise',
      ipWhitelist: [],
      allowedDomains: []
    };
  }

  /**
   * Get Stripe price ID for plan and billing cycle
   */
  getStripePriceId(plan, billingCycle) {
    const priceIds = {
      starter: {
        monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID
      },
      professional: {
        monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID
      },
      enterprise: {
        monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
        yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID
      }
    };

    return priceIds[plan]?.[billingCycle];
  }

  /**
   * Send welcome email to new tenant
   */
  async sendWelcomeEmail(tenant) {
    // Implementation would integrate with email service
    logger.info('Welcome email sent', {
      tenantId: tenant.tenantId,
      email: tenant.contact.email
    });
  }

  /**
   * Initiate domain setup (DNS verification and SSL)
   */
  async initiateDomainSetup(tenant, domain) {
    // Implementation would integrate with DNS and SSL providers
    logger.info('Domain setup initiated', {
      tenantId: tenant.tenantId,
      domain
    });
  }

  /**
   * Generate tenant analytics
   */
  async generateTenantAnalytics(tenant, period) {
    // Implementation would aggregate analytics data
    return {
      period,
      usage: tenant.subscription.usage,
      usagePercentage: tenant.usagePercentage,
      billing: {
        plan: tenant.subscription.plan,
        status: tenant.subscription.status,
        nextBillingDate: tenant.subscription.nextBillingDate
      },
      activity: {
        // Would include actual activity metrics
        activeUsers: 0,
        projectsCreated: 0,
        apiCalls: 0,
        collaborationSessions: 0
      }
    };
  }
}

module.exports = new TenantController();