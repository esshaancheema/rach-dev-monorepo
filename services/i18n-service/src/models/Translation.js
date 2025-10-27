const mongoose = require('mongoose');

/**
 * Translation Schema - Manages multilingual content
 * 
 * Features:
 * - Hierarchical key structure for organized translations
 * - Version control for translation updates
 * - Fallback language support
 * - Pluralization rules
 * - Context-aware translations
 * - Translation approval workflow
 * - Machine translation integration
 */
const translationSchema = new mongoose.Schema({
  // Translation identification
  key: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    index: true
  },
  
  // Namespace for organizing translations
  namespace: {
    type: String,
    required: true,
    default: 'common',
    enum: [
      'common',           // Common UI elements
      'auth',            // Authentication
      'dashboard',       // Dashboard
      'projects',        // Project management
      'ai',              // AI features
      'collaboration',   // Collaboration
      'settings',        // Settings
      'billing',         // Billing and payments
      'admin',           // Admin panel
      'emails',          // Email templates
      'errors',          // Error messages
      'notifications',   // Notifications
      'help',            // Help and documentation
      'marketing',       // Marketing content
      'legal'            // Legal documents
    ]
  },
  
  // Language code (ISO 639-1 with optional region)
  language: {
    type: String,
    required: true,
    lowercase: true,
    match: /^[a-z]{2}(-[A-Z]{2})?$/,
    index: true
  },
  
  // Translation value
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Pluralization forms for languages that support it
  pluralForms: {
    zero: String,      // 0 items
    one: String,       // 1 item
    few: String,       // 2-4 items (some languages)
    many: String,      // 5+ items
    other: String      // Default plural form
  },
  
  // Context information for translators
  context: {
    description: {
      type: String,
      maxlength: 1000
    },
    
    // Where this translation is used
    usage: [{
      component: String,
      screen: String,
      action: String
    }],
    
    // Variables used in the translation
    variables: [{
      name: String,
      type: {
        type: String,
        enum: ['string', 'number', 'date', 'currency', 'component']
      },
      description: String,
      example: String
    }],
    
    // Character limits (for UI constraints)
    maxLength: Number,
    
    // Tone and style guidelines
    tone: {
      type: String,
      enum: ['formal', 'casual', 'technical', 'friendly', 'professional']
    }
  },
  
  // Translation metadata
  metadata: {
    // Translation source
    source: {
      type: String,
      enum: ['manual', 'machine', 'imported'],
      default: 'manual'
    },
    
    // Translation quality score (0-100)
    quality: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    
    // Translation status
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'approved', 'needs_update', 'deprecated'],
      default: 'draft'
    },
    
    // Last human review
    lastReviewed: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      at: Date,
      notes: String
    },
    
    // Machine translation info
    machineTranslation: {
      provider: {
        type: String,
        enum: ['google', 'aws', 'azure', 'deepl']
      },
      confidence: Number,
      translatedAt: Date
    },
    
    // Usage statistics
    usage: {
      timesUsed: {
        type: Number,
        default: 0
      },
      lastUsed: Date,
      locations: [String] // Where this translation is used
    }
  },
  
  // Version control
  version: {
    type: Number,
    default: 1
  },
  
  // Previous versions for rollback
  history: [{
    version: Number,
    value: mongoose.Schema.Types.Mixed,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    changeReason: String
  }],
  
  // Tenant-specific translations (for multi-tenancy)
  tenantId: {
    type: String,
    index: true
  },
  
  // Custom tenant overrides
  tenantOverrides: [{
    tenantId: String,
    value: mongoose.Schema.Types.Mixed,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tags for categorization
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Audit information
  audit: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    importedFrom: {
      source: String,
      filename: String,
      importedAt: Date,
      importedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  }
}, {
  timestamps: true,
  
  // Compound indexes for performance
  indexes: [
    { key: 1, namespace: 1, language: 1 },
    { namespace: 1, language: 1 },
    { tenantId: 1, language: 1 },
    { 'metadata.status': 1, language: 1 },
    { updatedAt: -1 }
  ]
});

// Compound unique index
translationSchema.index(
  { key: 1, namespace: 1, language: 1, tenantId: 1 }, 
  { unique: true }
);

// Text index for search
translationSchema.index({
  key: 'text',
  value: 'text',
  'context.description': 'text'
});

// Virtual for full key path
translationSchema.virtual('fullKey').get(function() {
  return `${this.namespace}:${this.key}`;
});

// Virtual for display value
translationSchema.virtual('displayValue').get(function() {
  if (typeof this.value === 'string') {
    return this.value;
  }
  return JSON.stringify(this.value);
});

// Pre-save middleware
translationSchema.pre('save', function(next) {
  // Auto-increment version on value change
  if (this.isModified('value') && !this.isNew) {
    this.version += 1;
    
    // Add to history
    this.history.push({
      version: this.version - 1,
      value: this._original.value,
      updatedBy: this.audit.updatedBy,
      updatedAt: new Date(),
      changeReason: 'Value updated'
    });
    
    // Limit history to last 10 versions
    if (this.history.length > 10) {
      this.history = this.history.slice(-10);
    }
  }
  
  // Update usage stats
  if (this.isModified('value')) {
    this.metadata.usage.timesUsed += 1;
    this.metadata.usage.lastUsed = new Date();
  }
  
  // Auto-detect if machine translated
  if (this.metadata.source === 'machine' && !this.metadata.machineTranslation.translatedAt) {
    this.metadata.machineTranslation.translatedAt = new Date();
  }
  
  next();
});

// Static methods
translationSchema.statics.findByKey = function(key, namespace, language, tenantId) {
  const query = { key, namespace, language };
  if (tenantId) {
    query.tenantId = tenantId;
  }
  return this.findOne(query);
};

translationSchema.statics.findByNamespace = function(namespace, language, tenantId) {
  const query = { namespace, language };
  if (tenantId) {
    query.tenantId = tenantId;
  }
  return this.find(query);
};

translationSchema.statics.getTranslations = function(language, tenantId, namespaces) {
  const query = { language };
  
  if (tenantId) {
    query.$or = [
      { tenantId: tenantId },
      { tenantId: { $exists: false } }
    ];
  } else {
    query.tenantId = { $exists: false };
  }
  
  if (namespaces && namespaces.length > 0) {
    query.namespace = { $in: namespaces };
  }
  
  return this.find(query, {
    key: 1,
    namespace: 1,
    value: 1,
    pluralForms: 1,
    tenantOverrides: 1
  });
};

translationSchema.statics.searchTranslations = function(searchTerm, language, options = {}) {
  const { namespace, status, limit = 50 } = options;
  
  const query = {
    language,
    $text: { $search: searchTerm }
  };
  
  if (namespace) {
    query.namespace = namespace;
  }
  
  if (status) {
    query['metadata.status'] = status;
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
};

// Instance methods
translationSchema.methods.getValueForTenant = function(tenantId) {
  if (!tenantId) {
    return this.value;
  }
  
  // Check for tenant-specific override
  const override = this.tenantOverrides.find(o => o.tenantId === tenantId);
  return override ? override.value : this.value;
};

translationSchema.methods.setTenantOverride = function(tenantId, value, userId) {
  // Remove existing override
  this.tenantOverrides = this.tenantOverrides.filter(o => o.tenantId !== tenantId);
  
  // Add new override
  this.tenantOverrides.push({
    tenantId,
    value,
    updatedBy: userId,
    updatedAt: new Date()
  });
  
  return this.save();
};

translationSchema.methods.removeTenantOverride = function(tenantId) {
  this.tenantOverrides = this.tenantOverrides.filter(o => o.tenantId !== tenantId);
  return this.save();
};

translationSchema.methods.approveTranslation = function(userId, notes) {
  this.metadata.status = 'approved';
  this.metadata.lastReviewed = {
    by: userId,
    at: new Date(),
    notes: notes
  };
  return this.save();
};

translationSchema.methods.markForReview = function(userId, reason) {
  this.metadata.status = 'pending_review';
  this.audit.updatedBy = userId;
  return this.save();
};

translationSchema.methods.getPluralForm = function(count, locale) {
  if (!this.pluralForms || typeof this.value === 'object') {
    return this.value;
  }
  
  // Get plural rule for locale
  const rule = getPluralRule(count, locale);
  
  return this.pluralForms[rule] || this.pluralForms.other || this.value;
};

translationSchema.methods.interpolate = function(variables = {}) {
  let text = this.value;
  
  if (typeof text !== 'string') {
    return text;
  }
  
  // Replace variables in format {{variable}}
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    text = text.replace(regex, variables[key]);
  });
  
  return text;
};

// Helper function for plural rules (simplified)
function getPluralRule(count, locale) {
  const absCount = Math.abs(count);
  
  // English and most languages
  if (locale.startsWith('en')) {
    return absCount === 1 ? 'one' : 'other';
  }
  
  // Russian, Ukrainian, etc.
  if (['ru', 'uk', 'sr'].includes(locale.substring(0, 2))) {
    const lastDigit = absCount % 10;
    const lastTwoDigits = absCount % 100;
    
    if (lastDigit === 1 && lastTwoDigits !== 11) return 'one';
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'few';
    return 'many';
  }
  
  // Polish
  if (locale.startsWith('pl')) {
    const lastDigit = absCount % 10;
    const lastTwoDigits = absCount % 100;
    
    if (absCount === 1) return 'one';
    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) return 'few';
    return 'many';
  }
  
  // Default rule
  return absCount === 1 ? 'one' : 'other';
}

// Ensure virtual fields are serialized
translationSchema.set('toJSON', { virtuals: true });
translationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Translation', translationSchema);