const mongoose = require('mongoose');

/**
 * Data Processing Record Schema for GDPR Article 30 compliance
 * 
 * Maintains records of all processing activities as required by GDPR
 */
const dataProcessingRecordSchema = new mongoose.Schema({
  // Basic Information
  recordId: {
    type: String,
    required: true,
    unique: true,
    default: () => `dpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Data Controller Information
  controller: {
    name: {
      type: String,
      required: true,
      default: 'Zoptal Inc.'
    },
    contact: {
      email: String,
      phone: String,
      address: String
    },
    representative: {
      name: String,
      email: String,
      phone: String
    }
  },

  // Data Processing Activity
  activity: {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      required: true,
      enum: [
        'contract_performance',
        'legal_obligation',
        'vital_interests',
        'public_task',
        'legitimate_interests',
        'consent'
      ]
    },
    legalBasis: {
      type: String,
      required: true
    },
    categories: [{
      type: String,
      enum: [
        'identification_data',
        'contact_data',
        'demographic_data',
        'behavioral_data',
        'technical_data',
        'financial_data',
        'special_categories',
        'criminal_data'
      ]
    }]
  },

  // Data Subjects
  dataSubjects: [{
    category: {
      type: String,
      enum: ['customers', 'employees', 'suppliers', 'website_visitors', 'other'],
      required: true
    },
    description: String,
    estimatedNumber: Number
  }],

  // Data Recipients
  recipients: [{
    category: {
      type: String,
      enum: ['internal', 'processors', 'third_parties', 'public_authorities'],
      required: true
    },
    name: String,
    description: String,
    country: String,
    safeguards: String
  }],

  // International Transfers
  internationalTransfers: [{
    country: {
      type: String,
      required: true
    },
    adequacyDecision: Boolean,
    safeguards: {
      type: String,
      enum: [
        'standard_contractual_clauses',
        'binding_corporate_rules',
        'certification',
        'code_of_conduct',
        'other'
      ]
    },
    safeguardDetails: String
  }],

  // Retention
  retention: {
    period: {
      type: String,
      required: true
    },
    criteria: {
      type: String,
      required: true
    },
    deletionProcedure: String
  },

  // Security Measures
  securityMeasures: {
    technical: [String],
    organizational: [String],
    encryption: Boolean,
    pseudonymization: Boolean,
    accessControls: Boolean,
    backupProcedures: String
  },

  // Risk Assessment
  riskAssessment: {
    conducted: Boolean,
    date: Date,
    outcome: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    mitigationMeasures: [String],
    dpia: {
      required: Boolean,
      conducted: Boolean,
      date: Date,
      outcome: String
    }
  },

  // Consent Management (if applicable)
  consentManagement: {
    required: Boolean,
    mechanism: String,
    withdrawalProcess: String,
    consentRecords: Boolean
  },

  // Metadata
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastReviewedAt: Date,
    nextReviewDue: Date,
    version: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'under_review', 'archived'],
      default: 'draft'
    }
  }
}, {
  timestamps: true,
  indexes: [
    { 'activity.name': 1 },
    { 'activity.purpose': 1 },
    { 'metadata.status': 1 },
    { 'metadata.nextReviewDue': 1 }
  ]
});

// Virtual for full activity identifier
dataProcessingRecordSchema.virtual('fullIdentifier').get(function() {
  return `${this.recordId} - ${this.activity.name}`;
});

// Instance methods
dataProcessingRecordSchema.methods.scheduleReview = function(months = 12) {
  this.metadata.nextReviewDue = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  return this.save();
};

dataProcessingRecordSchema.methods.updateVersion = function() {
  this.metadata.version += 1;
  this.metadata.lastReviewedAt = new Date();
  return this.save();
};

// Static methods
dataProcessingRecordSchema.statics.getActiveRecords = function() {
  return this.find({ 'metadata.status': 'active' });
};

dataProcessingRecordSchema.statics.getRecordsDueForReview = function() {
  return this.find({
    'metadata.nextReviewDue': { $lte: new Date() },
    'metadata.status': 'active'
  });
};

dataProcessingRecordSchema.statics.getRecordsByPurpose = function(purpose) {
  return this.find({ 'activity.purpose': purpose });
};

// Ensure virtual fields are serialized
dataProcessingRecordSchema.set('toJSON', { virtuals: true });
dataProcessingRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DataProcessingRecord', dataProcessingRecordSchema);