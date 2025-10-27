const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Tenant Schema - Core tenant configuration and metadata
 * 
 * Multi-tenancy model supporting:
 * - Complete data isolation
 * - Tenant-specific configurations
 * - Resource quotas and limits
 * - Custom branding and domains
 * - Billing and subscription management
 */
const tenantSchema = new mongoose.Schema({
  // Basic tenant information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    maxlength: 50
  },
  
  // Tenant identification
  tenantId: {
    type: String,
    required: true,
    unique: true,
    default: () => `tenant_${crypto.randomUUID()}`
  },
  
  // Database isolation strategy
  isolationStrategy: {
    type: String,
    enum: ['database', 'schema', 'row_level'],
    default: 'schema',
    required: true
  },
  
  // Database configuration
  database: {
    // For database-level isolation
    connectionString: {
      type: String,
      select: false // Never include in queries by default
    },
    
    // For schema-level isolation
    schemaName: {
      type: String,
      default: function() {
        return `tenant_${this.slug}`;
      }
    },
    
    // Database encryption key
    encryptionKey: {
      type: String,
      select: false,
      default: () => crypto.randomBytes(32).toString('hex')
    }
  },
  
  // Tenant configuration
  configuration: {
    // Feature toggles
    features: {
      aiCodeGeneration: { type: Boolean, default: true },
      realTimeCollaboration: { type: Boolean, default: true },
      customBranding: { type: Boolean, default: false },
      ssoIntegration: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: true },
      webhooks: { type: Boolean, default: false }
    },
    
    // Resource quotas
    quotas: {
      maxUsers: { type: Number, default: 10 },
      maxProjects: { type: Number, default: 50 },
      maxStorageGB: { type: Number, default: 10 },
      maxAPICallsPerMonth: { type: Number, default: 10000 },
      maxAITokensPerMonth: { type: Number, default: 100000 },
      maxCollaborators: { type: Number, default: 5 }
    },
    
    // Rate limiting
    rateLimits: {
      apiCalls: {
        windowMs: { type: Number, default: 900000 }, // 15 minutes
        maxRequests: { type: Number, default: 1000 }
      },
      aiRequests: {
        windowMs: { type: Number, default: 3600000 }, // 1 hour
        maxRequests: { type: Number, default: 100 }
      }
    },
    
    // Security settings
    security: {
      passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireUppercase: { type: Boolean, default: true },
        requireLowercase: { type: Boolean, default: true },
        requireNumbers: { type: Boolean, default: true },
        requireSpecialChars: { type: Boolean, default: false }
      },
      
      sessionTimeout: { type: Number, default: 3600 }, // 1 hour in seconds
      mfaRequired: { type: Boolean, default: false },
      ipWhitelist: [{ type: String }],
      allowedDomains: [{ type: String }]
    }
  },
  
  // Custom branding
  branding: {
    logo: {
      url: String,
      width: Number,
      height: Number
    },
    
    colors: {
      primary: { type: String, default: '#667eea' },
      secondary: { type: String, default: '#764ba2' },
      accent: { type: String, default: '#f093fb' }
    },
    
    customCSS: String,
    
    favicon: String,
    
    emailTemplates: {
      welcomeEmail: String,
      resetPassword: String,
      invitation: String
    }
  },
  
  // Custom domain configuration
  domains: [{
    domain: {
      type: String,
      required: true,
      lowercase: true
    },
    
    isPrimary: {
      type: Boolean,
      default: false
    },
    
    sslCertificate: {
      certificateId: String,
      status: {
        type: String,
        enum: ['pending', 'active', 'expired', 'failed'],
        default: 'pending'
      },
      expiresAt: Date
    },
    
    dnsStatus: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    },
    
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Subscription and billing
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'starter', 'professional', 'enterprise'],
      default: 'trial'
    },
    
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled', 'expired'],
      default: 'active'
    },
    
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    },
    
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    },
    
    nextBillingDate: Date,
    
    usage: {
      users: { type: Number, default: 0 },
      projects: { type: Number, default: 0 },
      storageGB: { type: Number, default: 0 },
      apiCalls: { type: Number, default: 0 },
      aiTokens: { type: Number, default: 0 }
    }
  },
  
  // Tenant status and metadata
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive', 'archived'],
    default: 'active'
  },
  
  // Contact information
  contact: {
    name: {
      type: String,
      required: true
    },
    
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    
    phone: String,
    
    company: String,
    
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  
  // Compliance and data residency
  compliance: {
    dataResidency: {
      type: String,
      enum: ['us', 'eu', 'asia', 'global'],
      default: 'global'
    },
    
    gdprCompliant: {
      type: Boolean,
      default: false
    },
    
    hipaaCompliant: {
      type: Boolean,
      default: false
    },
    
    soc2Compliant: {
      type: Boolean,
      default: false
    }
  },
  
  // Integration settings
  integrations: {
    sso: {
      enabled: { type: Boolean, default: false },
      provider: {
        type: String,
        enum: ['google', 'microsoft', 'okta', 'auth0', 'saml']
      },
      configuration: {
        clientId: String,
        issuerUrl: String,
        metadataUrl: String
      }
    },
    
    webhooks: {
      enabled: { type: Boolean, default: false },
      endpoints: [{
        url: String,
        events: [String],
        secret: String,
        active: { type: Boolean, default: true }
      }]
    },
    
    apiKeys: [{
      name: String,
      keyId: String,
      hashedKey: String,
      permissions: [String],
      lastUsedAt: Date,
      createdAt: { type: Date, default: Date.now },
      expiresAt: Date,
      active: { type: Boolean, default: true }
    }]
  },
  
  // Audit and monitoring
  audit: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    lastLoginAt: Date,
    
    lastActivityAt: {
      type: Date,
      default: Date.now
    },
    
    flags: [{
      type: {
        type: String,
        enum: ['security_alert', 'billing_issue', 'usage_warning', 'compliance_issue']
      },
      message: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      createdAt: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false }
    }]
  }
}, {
  timestamps: true,
  
  // Ensure indexes for performance
  indexes: [
    { tenantId: 1 },
    { slug: 1 },
    { 'domains.domain': 1 },
    { 'subscription.stripeCustomerId': 1 },
    { status: 1, createdAt: -1 }
  ]
});

// Compound indexes for multi-field queries
tenantSchema.index({ status: 1, 'subscription.plan': 1 });
tenantSchema.index({ 'subscription.status': 1, 'subscription.nextBillingDate': 1 });

// Virtual for primary domain
tenantSchema.virtual('primaryDomain').get(function() {
  const primary = this.domains.find(d => d.isPrimary);
  return primary ? primary.domain : null;
});

// Virtual for usage percentage
tenantSchema.virtual('usagePercentage').get(function() {
  const quotas = this.configuration.quotas;
  const usage = this.subscription.usage;
  
  return {
    users: Math.round((usage.users / quotas.maxUsers) * 100),
    projects: Math.round((usage.projects / quotas.maxProjects) * 100),
    storage: Math.round((usage.storageGB / quotas.maxStorageGB) * 100),
    apiCalls: Math.round((usage.apiCalls / quotas.maxAPICallsPerMonth) * 100),
    aiTokens: Math.round((usage.aiTokens / quotas.maxAITokensPerMonth) * 100)
  };
});

// Pre-save middleware
tenantSchema.pre('save', async function(next) {
  // Generate slug from name if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Ensure only one primary domain
  if (this.domains && this.domains.length > 0) {
    const primaryDomains = this.domains.filter(d => d.isPrimary);
    if (primaryDomains.length > 1) {
      // Keep only the first primary domain
      this.domains.forEach((domain, index) => {
        if (index > 0 && domain.isPrimary) {
          domain.isPrimary = false;
        }
      });
    }
  }
  
  // Hash API keys if they're new
  if (this.integrations && this.integrations.apiKeys) {
    for (let apiKey of this.integrations.apiKeys) {
      if (apiKey.isNew && !apiKey.hashedKey) {
        const salt = await bcrypt.genSalt(10);
        apiKey.hashedKey = await bcrypt.hash(apiKey.keyId, salt);
      }
    }
  }
  
  next();
});

// Methods
tenantSchema.methods.generateAPIKey = async function(name, permissions = []) {
  const keyId = `zpt_${crypto.randomBytes(16).toString('hex')}`;
  const salt = await bcrypt.genSalt(10);
  const hashedKey = await bcrypt.hash(keyId, salt);
  
  this.integrations = this.integrations || {};
  this.integrations.apiKeys = this.integrations.apiKeys || [];
  
  this.integrations.apiKeys.push({
    name,
    keyId: keyId.substring(0, 8) + '...' + keyId.substring(-4), // Store masked version
    hashedKey,
    permissions,
    createdAt: new Date(),
    active: true
  });
  
  await this.save();
  
  return keyId; // Return the full key only once
};

tenantSchema.methods.validateAPIKey = async function(keyId) {
  if (!this.integrations || !this.integrations.apiKeys) {
    return false;
  }
  
  for (let apiKey of this.integrations.apiKeys) {
    if (apiKey.active && await bcrypt.compare(keyId, apiKey.hashedKey)) {
      // Update last used timestamp
      apiKey.lastUsedAt = new Date();
      await this.save();
      return apiKey;
    }
  }
  
  return false;
};

tenantSchema.methods.updateUsage = async function(usage) {
  this.subscription.usage = {
    ...this.subscription.usage,
    ...usage
  };
  
  this.audit.lastActivityAt = new Date();
  
  // Check for quota violations
  const quotas = this.configuration.quotas;
  const currentUsage = this.subscription.usage;
  
  const violations = [];
  
  if (currentUsage.users > quotas.maxUsers) {
    violations.push({ type: 'users', current: currentUsage.users, limit: quotas.maxUsers });
  }
  
  if (currentUsage.projects > quotas.maxProjects) {
    violations.push({ type: 'projects', current: currentUsage.projects, limit: quotas.maxProjects });
  }
  
  if (currentUsage.storageGB > quotas.maxStorageGB) {
    violations.push({ type: 'storage', current: currentUsage.storageGB, limit: quotas.maxStorageGB });
  }
  
  // Add warning flags for quota violations
  for (let violation of violations) {
    this.audit.flags.push({
      type: 'usage_warning',
      message: `${violation.type} usage (${violation.current}) exceeds limit (${violation.limit})`,
      severity: 'high',
      createdAt: new Date()
    });
  }
  
  await this.save();
  return violations;
};

tenantSchema.methods.isFeatureEnabled = function(featureName) {
  return this.configuration.features[featureName] === true;
};

tenantSchema.methods.canCreateResource = function(resourceType) {
  const usage = this.subscription.usage;
  const quotas = this.configuration.quotas;
  
  switch (resourceType) {
    case 'user':
      return usage.users < quotas.maxUsers;
    case 'project':
      return usage.projects < quotas.maxProjects;
    default:
      return true;
  }
};

tenantSchema.methods.getTenantContext = function() {
  return {
    tenantId: this.tenantId,
    slug: this.slug,
    name: this.name,
    isolationStrategy: this.isolationStrategy,
    schemaName: this.database.schemaName,
    features: this.configuration.features,
    quotas: this.configuration.quotas,
    plan: this.subscription.plan
  };
};

// Static methods
tenantSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: 'active' });
};

tenantSchema.statics.findByDomain = function(domain) {
  return this.findOne({ 
    'domains.domain': domain,
    'domains.dnsStatus': 'verified',
    status: 'active'
  });
};

tenantSchema.statics.findByTenantId = function(tenantId) {
  return this.findOne({ tenantId, status: 'active' });
};

// Ensure virtual fields are serialized
tenantSchema.set('toJSON', { virtuals: true });
tenantSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Tenant', tenantSchema);