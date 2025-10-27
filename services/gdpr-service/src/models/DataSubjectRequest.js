const mongoose = require('mongoose');

/**
 * Data Subject Request Schema for GDPR compliance
 * 
 * Handles all types of data subject requests under GDPR Articles 15-22
 */
const dataSubjectRequestSchema = new mongoose.Schema({
  // Request Identification
  requestId: {
    type: String,
    required: true,
    unique: true,
    default: () => `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Request Type
  requestType: {
    type: String,
    required: true,
    enum: [
      'access',           // Article 15 - Right of access
      'rectification',    // Article 16 - Right to rectification
      'erasure',          // Article 17 - Right to erasure (right to be forgotten)
      'restriction',      // Article 18 - Right to restriction of processing
      'portability',      // Article 20 - Right to data portability
      'objection',        // Article 21 - Right to object
      'automated_decision', // Article 22 - Automated individual decision-making
      'withdraw_consent'  // Article 7 - Withdrawing consent
    ]
  },

  // Data Subject Information
  dataSubject: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Identity verification details
    identity: {
      email: {
        type: String,
        required: true,
        lowercase: true
      },
      firstName: String,
      lastName: String,
      dateOfBirth: Date,
      address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
      },
      phoneNumber: String
    },

    // Verification status
    verification: {
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      method: {
        type: String,
        enum: ['email', 'phone', 'document', 'knowledge_based', 'manual']
      },
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      documents: [{
        type: String,
        name: String,
        uploadedAt: Date
      }]
    },

    tenantId: {
      type: String,
      index: true
    }
  },

  // Request Details
  details: {
    // Specific description of the request
    description: {
      type: String,
      required: true
    },

    // Specific data categories requested (for access/portability)
    dataCategories: [{
      type: String,
      enum: [
        'personal_identifiers',
        'contact_information',
        'account_data',
        'profile_data',
        'usage_data',
        'communication_data',
        'financial_data',
        'location_data',
        'device_data',
        'behavioral_data',
        'preferences',
        'all_data'
      ]
    }],

    // Specific services/systems (for restriction/objection)
    services: [{
      name: String,
      description: String
    }],

    // Reason for request
    reason: String,

    // Preferred response format (for access/portability)
    responseFormat: {
      type: String,
      enum: ['json', 'csv', 'xml', 'pdf'],
      default: 'json'
    },

    // Third party involved (for portability)
    thirdParty: {
      name: String,
      contact: String
    }
  },

  // Request Status and Processing
  status: {
    current: {
      type: String,
      enum: [
        'received',
        'identity_verification',
        'under_review',
        'processing',
        'pending_approval',
        'completed',
        'rejected',
        'withdrawn'
      ],
      default: 'received'
    },

    // Status history
    history: [{
      status: String,
      timestamp: Date,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    }],

    // Processing deadlines
    deadlines: {
      responseDeadline: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      extensionRequested: Boolean,
      extensionReason: String,
      extendedDeadline: Date
    }
  },

  // Communication
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'letter', 'in_person', 'system']
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    subject: String,
    content: String,
    timestamp: Date,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    attachments: [{
      name: String,
      url: String,
      size: Number
    }]
  }],

  // Processing Information
  processing: {
    // Assigned processor
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Priority level
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },

    // Complexity assessment
    complexity: {
      type: String,
      enum: ['simple', 'medium', 'complex'],
      default: 'simple'
    },

    // Systems involved
    systemsInvolved: [{
      name: String,
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'not_applicable']
      },
      completedAt: Date,
      notes: String
    }],

    // Data found/processed
    dataProcessed: {
      recordsFound: Number,
      recordsProcessed: Number,
      dataSizeBytes: Number,
      lastUpdated: Date
    },

    // Processing notes
    notes: String,

    // Quality check
    qualityCheck: {
      performed: Boolean,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      performedAt: Date,
      approved: Boolean,
      issues: [String]
    }
  },

  // Response Information
  response: {
    // Response method
    method: {
      type: String,
      enum: ['email', 'secure_download', 'postal', 'in_person']
    },

    // Response content
    content: {
      summary: String,
      dataPackageUrl: String,
      dataPackageSize: Number,
      dataPackageFormat: String,
      additionalDocuments: [{
        name: String,
        url: String,
        description: String
      }]
    },

    // Response timestamps
    timestamps: {
      sentAt: Date,
      acknowledgedAt: Date,
      downloadedAt: Date
    },

    // Response security
    security: {
      encrypted: Boolean,
      password: String, // Should be hashed
      expiresAt: Date,
      downloadAttempts: {
        type: Number,
        default: 0
      },
      maxDownloads: {
        type: Number,
        default: 3
      }
    }
  },

  // Outcome and Actions
  outcome: {
    // Final decision
    decision: {
      type: String,
      enum: [
        'granted_full',
        'granted_partial',
        'denied_unfounded',
        'denied_excessive',
        'denied_technical',
        'denied_legal_grounds',
        'withdrawn_by_subject'
      ]
    },

    // Justification for decision
    justification: String,

    // Actions taken
    actionsTaken: [{
      action: {
        type: String,
        enum: [
          'data_exported',
          'data_deleted',
          'data_corrected',
          'processing_restricted',
          'consent_withdrawn',
          'objection_upheld',
          'automated_decision_reviewed'
        ]
      },
      description: String,
      completedAt: Date,
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      evidence: String
    }],

    // Follow-up required
    followUpRequired: Boolean,
    followUpDate: Date,
    followUpNotes: String
  },

  // Legal and Compliance
  legal: {
    // Legal basis for processing (that was objected to)
    legalBasisChallenged: String,

    // Legal review
    legalReview: {
      required: Boolean,
      requested: Boolean,
      requestedAt: Date,
      completedAt: Date,
      reviewer: String,
      opinion: String
    },

    // Supervisory authority involvement
    supervisoryAuthority: {
      notified: Boolean,
      notificationDate: Date,
      reference: String,
      guidance: String
    }
  },

  // Metrics and Analytics
  metrics: {
    // Processing time
    processingTime: {
      startTime: Date,
      endTime: Date,
      totalDays: Number,
      businessDays: Number
    },

    // Effort tracking
    effort: {
      hoursSpent: Number,
      systemsQueried: Number,
      documentsReviewed: Number
    },

    // Cost tracking
    costs: {
      internalCost: Number,
      externalCost: Number,
      totalCost: Number
    }
  }
}, {
  timestamps: true,
  indexes: [
    { requestId: 1 },
    { 'dataSubject.identity.email': 1 },
    { 'dataSubject.userId': 1 },
    { 'dataSubject.tenantId': 1 },
    { requestType: 1 },
    { 'status.current': 1 },
    { 'status.deadlines.responseDeadline': 1 },
    { 'processing.assignedTo': 1 },
    { createdAt: -1 }
  ]
});

// Virtual for days remaining
dataSubjectRequestSchema.virtual('daysRemaining').get(function() {
  const deadline = this.status.deadlines.extendedDeadline || this.status.deadlines.responseDeadline;
  const now = new Date();
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for processing duration
dataSubjectRequestSchema.virtual('processingDuration').get(function() {
  if (!this.metrics.processingTime.endTime) return null;
  return this.metrics.processingTime.endTime - this.metrics.processingTime.startTime;
});

// Pre-save middleware
dataSubjectRequestSchema.pre('save', function(next) {
  // Update processing time metrics
  if (this.status.current === 'processing' && !this.metrics.processingTime.startTime) {
    this.metrics.processingTime.startTime = new Date();
  }
  
  if (this.status.current === 'completed' && !this.metrics.processingTime.endTime) {
    this.metrics.processingTime.endTime = new Date();
    if (this.metrics.processingTime.startTime) {
      const diffTime = this.metrics.processingTime.endTime - this.metrics.processingTime.startTime;
      this.metrics.processingTime.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  next();
});

// Instance methods
dataSubjectRequestSchema.methods.updateStatus = function(newStatus, updatedBy, notes) {
  this.status.history.push({
    status: this.status.current,
    timestamp: new Date(),
    updatedBy,
    notes
  });
  
  this.status.current = newStatus;
  return this.save();
};

dataSubjectRequestSchema.methods.addCommunication = function(commData) {
  this.communications.push({
    ...commData,
    timestamp: new Date()
  });
  return this.save();
};

dataSubjectRequestSchema.methods.requestExtension = function(reason) {
  this.status.deadlines.extensionRequested = true;
  this.status.deadlines.extensionReason = reason;
  this.status.deadlines.extendedDeadline = new Date(
    this.status.deadlines.responseDeadline.getTime() + 60 * 24 * 60 * 60 * 1000 // 60 more days
  );
  return this.save();
};

dataSubjectRequestSchema.methods.verify = function(method, verifiedBy) {
  this.dataSubject.verification.status = 'verified';
  this.dataSubject.verification.method = method;
  this.dataSubject.verification.verifiedAt = new Date();
  this.dataSubject.verification.verifiedBy = verifiedBy;
  return this.save();
};

// Static methods
dataSubjectRequestSchema.statics.getOverdueRequests = function() {
  return this.find({
    'status.current': { $nin: ['completed', 'rejected', 'withdrawn'] },
    $or: [
      { 'status.deadlines.extendedDeadline': { $lt: new Date() } },
      {
        'status.deadlines.extendedDeadline': { $exists: false },
        'status.deadlines.responseDeadline': { $lt: new Date() }
      }
    ]
  });
};

dataSubjectRequestSchema.statics.getUpcomingDeadlines = function(days = 7) {
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return this.find({
    'status.current': { $nin: ['completed', 'rejected', 'withdrawn'] },
    $or: [
      {
        'status.deadlines.extendedDeadline': {
          $gte: new Date(),
          $lte: futureDate
        }
      },
      {
        'status.deadlines.extendedDeadline': { $exists: false },
        'status.deadlines.responseDeadline': {
          $gte: new Date(),
          $lte: futureDate
        }
      }
    ]
  });
};

dataSubjectRequestSchema.statics.getRequestsByType = function(requestType) {
  return this.find({ requestType });
};

dataSubjectRequestSchema.statics.getRequestsByStatus = function(status) {
  return this.find({ 'status.current': status });
};

dataSubjectRequestSchema.statics.getUserRequests = function(userId) {
  return this.find({ 'dataSubject.userId': userId });
};

// Ensure virtual fields are serialized
dataSubjectRequestSchema.set('toJSON', { virtuals: true });
dataSubjectRequestSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DataSubjectRequest', dataSubjectRequestSchema);