const mongoose = require('mongoose');

/**
 * Consent Record Schema for GDPR compliance
 * 
 * Tracks user consent for data processing activities
 */
const consentRecordSchema = new mongoose.Schema({
  // Unique consent identifier
  consentId: {
    type: String,
    required: true,
    unique: true,
    default: () => `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Data Subject Information
  dataSubject: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    tenantId: {
      type: String,
      index: true
    }
  },

  // Consent Details
  consent: {
    // What the consent is for
    purpose: {
      type: String,
      required: true,
      enum: [
        'marketing_communications',
        'analytics_tracking',
        'personalization',
        'third_party_sharing',
        'cookies_non_essential',
        'data_processing',
        'automated_decision_making',
        'profiling',
        'location_tracking',
        'biometric_data',
        'health_data',
        'other'
      ]
    },
    
    // Specific description
    description: {
      type: String,
      required: true
    },

    // Processing categories
    dataCategories: [{
      type: String,
      enum: [
        'personal_identifiers',
        'contact_information',
        'demographic_data',
        'financial_data',
        'online_identifiers',
        'location_data',
        'biometric_data',
        'health_data',
        'behavioral_data',
        'preferences',
        'technical_data'
      ]
    }],

    // Legal basis for processing
    legalBasis: {
      type: String,
      default: 'consent',
      enum: [
        'consent',
        'contract',
        'legal_obligation',
        'vital_interests',
        'public_task',
        'legitimate_interests'
      ]
    }
  },

  // Consent Status
  status: {
    current: {
      type: String,
      enum: ['given', 'withdrawn', 'expired', 'pending'],
      required: true
    },
    
    // When consent was given
    givenAt: {
      type: Date,
      required: function() {
        return this.status.current === 'given';
      }
    },

    // When consent was withdrawn
    withdrawnAt: {
      type: Date,
      required: function() {
        return this.status.current === 'withdrawn';
      }
    },

    // Consent expiry (if applicable)
    expiresAt: Date,

    // Automatic expiry period in days
    validityPeriod: {
      type: Number,
      default: 730 // 2 years default
    }
  },

  // How consent was obtained/withdrawn
  mechanism: {
    // How consent was collected
    consentMethod: {
      type: String,
      enum: [
        'checkbox_explicit',
        'checkbox_opt_in',
        'button_click',
        'form_submission',
        'api_call',
        'email_confirmation',
        'phone_confirmation',
        'written_form',
        'verbal_recorded'
      ],
      required: true
    },

    // How consent was withdrawn (if applicable)
    withdrawalMethod: {
      type: String,
      enum: [
        'settings_panel',
        'unsubscribe_link',
        'email_request',
        'phone_request',
        'written_request',
        'api_call',
        'automatic_expiry'
      ]
    },

    // Interface details
    interface: {
      source: {
        type: String,
        enum: ['web', 'mobile_app', 'email', 'phone', 'paper', 'api'],
        required: true
      },
      page: String,
      version: String,
      userAgent: String,
      ipAddress: String
    }
  },

  // Granular Permissions
  permissions: {
    // Marketing permissions
    marketing: {
      email: Boolean,
      sms: Boolean,
      phone: Boolean,
      post: Boolean,
      push: Boolean
    },

    // Analytics permissions
    analytics: {
      essential: Boolean,
      functional: Boolean,
      performance: Boolean,
      targeting: Boolean
    },

    // Data sharing permissions
    sharing: {
      partners: Boolean,
      affiliates: Boolean,
      vendors: Boolean,
      socialMedia: Boolean
    },

    // Processing permissions
    processing: {
      profiling: Boolean,
      automatedDecisions: Boolean,
      locationTracking: Boolean,
      crossDeviceTracking: Boolean
    }
  },

  // Evidence and Proof
  evidence: {
    // Original consent text shown to user
    consentText: {
      type: String,
      required: true
    },

    // Privacy policy version at time of consent
    privacyPolicyVersion: String,

    // Terms of service version
    termsVersion: String,

    // Language used
    language: {
      type: String,
      default: 'en'
    },

    // Checksum for integrity
    checksum: String,

    // Any additional evidence (URLs, screenshots, etc.)
    additionalEvidence: [{
      type: String,
      description: String,
      url: String,
      timestamp: Date
    }]
  },

  // Withdrawal Information
  withdrawal: {
    reason: {
      type: String,
      enum: [
        'no_longer_interested',
        'too_frequent',
        'irrelevant_content',
        'privacy_concerns',
        'technical_issues',
        'other',
        'not_specified'
      ]
    },
    
    feedback: String,
    
    // Confirmation of withdrawal
    confirmed: {
      type: Boolean,
      default: false
    },
    
    // Follow-up actions taken
    actionsCompleted: [{
      action: String,
      completedAt: Date,
      completedBy: String
    }]
  },

  // Compliance Metadata
  compliance: {
    // GDPR Article 7 requirements
    article7: {
      withdrawalEasyAsGiving: Boolean,
      clearlyDistinguishable: Boolean,
      specificInformed: Boolean,
      unambiguous: Boolean
    },

    // Validation status
    validated: {
      type: Boolean,
      default: false
    },
    
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    validatedAt: Date,

    // Audit trail
    auditLog: [{
      action: String,
      timestamp: Date,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      details: String,
      ipAddress: String
    }]
  },

  // Related Records
  relationships: {
    // Parent consent (if this is a renewal)
    parentConsent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsentRecord'
    },

    // Child consents (renewals)
    childConsents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConsentRecord'
    }],

    // Related data processing records
    processingRecords: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DataProcessingRecord'
    }]
  }
}, {
  timestamps: true,
  indexes: [
    { 'dataSubject.userId': 1, 'consent.purpose': 1 },
    { 'dataSubject.email': 1 },
    { 'dataSubject.tenantId': 1 },
    { 'status.current': 1 },
    { 'status.expiresAt': 1 },
    { 'consent.purpose': 1 },
    { createdAt: -1 }
  ]
});

// Virtual for consent validity
consentRecordSchema.virtual('isValid').get(function() {
  if (this.status.current !== 'given') return false;
  if (this.status.expiresAt && this.status.expiresAt < new Date()) return false;
  return true;
});

// Virtual for days until expiry
consentRecordSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.status.expiresAt) return null;
  const now = new Date();
  const diffTime = this.status.expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
consentRecordSchema.pre('save', function(next) {
  // Set expiry date if not set and validity period is defined
  if (this.status.current === 'given' && !this.status.expiresAt && this.status.validityPeriod) {
    this.status.expiresAt = new Date(
      this.status.givenAt.getTime() + (this.status.validityPeriod * 24 * 60 * 60 * 1000)
    );
  }

  // Generate checksum for integrity
  if (!this.evidence.checksum) {
    const crypto = require('crypto');
    const data = `${this.dataSubject.email}:${this.consent.purpose}:${this.evidence.consentText}:${this.status.givenAt}`;
    this.evidence.checksum = crypto.createHash('sha256').update(data).digest('hex');
  }

  next();
});

// Instance methods
consentRecordSchema.methods.withdraw = function(method, reason, feedback) {
  this.status.current = 'withdrawn';
  this.status.withdrawnAt = new Date();
  this.mechanism.withdrawalMethod = method;
  this.withdrawal.reason = reason;
  this.withdrawal.feedback = feedback;
  
  // Add to audit log
  this.compliance.auditLog.push({
    action: 'consent_withdrawn',
    timestamp: new Date(),
    details: `Withdrawn via ${method}`,
    ipAddress: this.mechanism.interface.ipAddress
  });

  return this.save();
};

consentRecordSchema.methods.renew = function(newConsentText, interface) {
  // Create new consent record
  const ConsentRecord = this.constructor;
  const newConsent = new ConsentRecord({
    dataSubject: this.dataSubject,
    consent: this.consent,
    status: {
      current: 'given',
      givenAt: new Date(),
      validityPeriod: this.status.validityPeriod
    },
    mechanism: {
      consentMethod: interface.method,
      interface: interface
    },
    permissions: this.permissions,
    evidence: {
      consentText: newConsentText,
      privacyPolicyVersion: interface.privacyPolicyVersion,
      language: interface.language || 'en'
    },
    relationships: {
      parentConsent: this._id
    }
  });

  // Mark current consent as expired
  this.status.current = 'expired';
  this.relationships.childConsents.push(newConsent._id);

  return Promise.all([this.save(), newConsent.save()]);
};

consentRecordSchema.methods.addAuditEntry = function(action, details, userId, ipAddress) {
  this.compliance.auditLog.push({
    action,
    timestamp: new Date(),
    userId,
    details,
    ipAddress
  });
  return this.save();
};

// Static methods
consentRecordSchema.statics.findActiveConsent = function(userId, purpose) {
  return this.findOne({
    'dataSubject.userId': userId,
    'consent.purpose': purpose,
    'status.current': 'given',
    $or: [
      { 'status.expiresAt': { $gt: new Date() } },
      { 'status.expiresAt': { $exists: false } }
    ]
  });
};

consentRecordSchema.statics.findExpiringConsents = function(days = 30) {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this.find({
    'status.current': 'given',
    'status.expiresAt': { $lte: futureDate, $gt: new Date() }
  });
};

consentRecordSchema.statics.getUserConsents = function(userId) {
  return this.find({ 'dataSubject.userId': userId });
};

consentRecordSchema.statics.getConsentsByPurpose = function(purpose) {
  return this.find({ 'consent.purpose': purpose });
};

consentRecordSchema.statics.validateConsent = function(userId, purpose, requiredPermissions = []) {
  return this.findActiveConsent(userId, purpose).then(consent => {
    if (!consent) return false;
    
    // Check specific permissions if required
    if (requiredPermissions.length > 0) {
      return requiredPermissions.every(permission => {
        const [category, type] = permission.split('.');
        return consent.permissions[category] && consent.permissions[category][type];
      });
    }
    
    return true;
  });
};

// Ensure virtual fields are serialized
consentRecordSchema.set('toJSON', { virtuals: true });
consentRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ConsentRecord', consentRecordSchema);