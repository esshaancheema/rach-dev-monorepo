const ConsentRecord = require('../models/ConsentRecord');
const DataSubjectRequest = require('../models/DataSubjectRequest');
const DataProcessingRecord = require('../models/DataProcessingRecord');
const DataExportService = require('../services/data-export-service');
const DataDeletionService = require('../services/data-deletion-service');
const ConsentService = require('../services/consent-service');
const logger = require('../utils/logger');

/**
 * GDPR Controller
 * 
 * Handles all GDPR-related requests and operations:
 * - Data subject requests (access, deletion, portability, etc.)
 * - Consent management
 * - Data processing records
 * - Compliance reporting
 */

class GDPRController {

  /**
   * Submit a data subject request
   */
  async submitDataSubjectRequest(req, res) {
    try {
      const {
        requestType,
        description,
        dataCategories,
        reason,
        responseFormat,
        identity
      } = req.body;

      // Validate request type
      const validTypes = ['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection', 'automated_decision', 'withdraw_consent'];
      if (!validTypes.includes(requestType)) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_TYPE',
          message: 'Invalid data subject request type'
        });
      }

      // Create new request
      const request = new DataSubjectRequest({
        requestType,
        dataSubject: {
          userId: req.user?.id,
          identity: {
            email: identity.email || req.user?.email,
            firstName: identity.firstName,
            lastName: identity.lastName,
            dateOfBirth: identity.dateOfBirth,
            address: identity.address,
            phoneNumber: identity.phoneNumber
          },
          tenantId: req.tenantId
        },
        details: {
          description,
          dataCategories: dataCategories || ['all_data'],
          reason,
          responseFormat: responseFormat || 'json'
        },
        processing: {
          priority: this.calculatePriority(requestType),
          complexity: this.assessComplexity(requestType, dataCategories)
        }
      });

      // Auto-verify if authenticated user
      if (req.user?.id) {
        request.dataSubject.verification.status = 'verified';
        request.dataSubject.verification.method = 'authentication';
        request.dataSubject.verification.verifiedAt = new Date();
        request.status.current = 'under_review';
      }

      await request.save();

      // Send confirmation communication
      await request.addCommunication({
        type: 'email',
        direction: 'outbound',
        subject: `Data Subject Request Received - ${request.requestId}`,
        content: `We have received your ${requestType} request and will process it within 30 days.`
      });

      // Assign to appropriate team member
      await this.assignRequest(request);

      logger.info('Data subject request submitted', {
        requestId: request.requestId,
        requestType,
        userId: req.user?.id,
        tenantId: req.tenantId
      });

      res.status(201).json({
        success: true,
        message: 'Data subject request submitted successfully',
        requestId: request.requestId,
        expectedCompletion: request.status.deadlines.responseDeadline
      });

    } catch (error) {
      logger.error('Error submitting data subject request', error);
      res.status(500).json({
        error: 'REQUEST_SUBMISSION_ERROR',
        message: 'Failed to submit data subject request'
      });
    }
  }

  /**
   * Get status of a data subject request
   */
  async getRequestStatus(req, res) {
    try {
      const { requestId } = req.params;
      
      const request = await DataSubjectRequest.findOne({ requestId })
        .populate('processing.assignedTo', 'name email')
        .select('-response.security.password');

      if (!request) {
        return res.status(404).json({
          error: 'REQUEST_NOT_FOUND',
          message: 'Data subject request not found'
        });
      }

      // Verify access rights
      if (req.user?.id !== request.dataSubject.userId?.toString() && req.user?.role !== 'admin') {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'You can only view your own requests'
        });
      }

      res.json({
        success: true,
        request: {
          requestId: request.requestId,
          requestType: request.requestType,
          status: request.status.current,
          submittedAt: request.createdAt,
          expectedCompletion: request.status.deadlines.extendedDeadline || request.status.deadlines.responseDeadline,
          daysRemaining: request.daysRemaining,
          lastUpdate: request.status.history[request.status.history.length - 1],
          assignedTo: request.processing.assignedTo?.name,
          downloadUrl: request.response.content?.dataPackageUrl
        }
      });

    } catch (error) {
      logger.error('Error getting request status', error);
      res.status(500).json({
        error: 'STATUS_FETCH_ERROR',
        message: 'Failed to fetch request status'
      });
    }
  }

  /**
   * Download data export package
   */
  async downloadDataExport(req, res) {
    try {
      const { requestId } = req.params;
      const { password } = req.body;

      const request = await DataSubjectRequest.findOne({ 
        requestId,
        requestType: { $in: ['access', 'portability'] }
      });

      if (!request) {
        return res.status(404).json({
          error: 'REQUEST_NOT_FOUND',
          message: 'Data export request not found'
        });
      }

      // Verify access rights
      if (req.user?.id !== request.dataSubject.userId?.toString()) {
        return res.status(403).json({
          error: 'ACCESS_DENIED',
          message: 'You can only download your own data'
        });
      }

      // Check if export is ready
      if (request.status.current !== 'completed') {
        return res.status(400).json({
          error: 'EXPORT_NOT_READY',
          message: 'Data export is not yet ready for download'
        });
      }

      // Verify password if required
      if (request.response.security.password) {
        const bcrypt = require('bcrypt');
        const isValidPassword = await bcrypt.compare(password, request.response.security.password);
        if (!isValidPassword) {
          return res.status(401).json({
            error: 'INVALID_PASSWORD',
            message: 'Invalid download password'
          });
        }
      }

      // Check download limits
      if (request.response.security.downloadAttempts >= request.response.security.maxDownloads) {
        return res.status(403).json({
          error: 'DOWNLOAD_LIMIT_EXCEEDED',
          message: 'Maximum download attempts exceeded'
        });
      }

      // Check expiry
      if (request.response.security.expiresAt && request.response.security.expiresAt < new Date()) {
        return res.status(410).json({
          error: 'DOWNLOAD_EXPIRED',
          message: 'Download link has expired'
        });
      }

      // Increment download attempts
      request.response.security.downloadAttempts += 1;
      request.response.timestamps.downloadedAt = new Date();
      await request.save();

      // Serve the file
      const filePath = request.response.content.dataPackageUrl;
      res.download(filePath, `data-export-${requestId}.zip`);

      logger.info('Data export downloaded', {
        requestId,
        userId: req.user.id,
        attempt: request.response.security.downloadAttempts
      });

    } catch (error) {
      logger.error('Error downloading data export', error);
      res.status(500).json({
        error: 'DOWNLOAD_ERROR',
        message: 'Failed to download data export'
      });
    }
  }

  /**
   * Record user consent
   */
  async recordConsent(req, res) {
    try {
      const {
        purpose,
        description,
        dataCategories,
        permissions,
        consentText,
        interface: consentInterface
      } = req.body;

      // Validate required fields
      if (!purpose || !description || !consentText) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Purpose, description, and consent text are required'
        });
      }

      // Check if there's an existing active consent for this purpose
      const existingConsent = await ConsentRecord.findActiveConsent(req.user.id, purpose);
      if (existingConsent) {
        return res.status(409).json({
          error: 'CONSENT_EXISTS',
          message: 'Active consent already exists for this purpose'
        });
      }

      // Create new consent record
      const consent = new ConsentRecord({
        dataSubject: {
          userId: req.user.id,
          email: req.user.email,
          tenantId: req.tenantId
        },
        consent: {
          purpose,
          description,
          dataCategories: dataCategories || ['personal_identifiers']
        },
        status: {
          current: 'given',
          givenAt: new Date()
        },
        mechanism: {
          consentMethod: consentInterface?.method || 'checkbox_explicit',
          interface: {
            source: consentInterface?.source || 'web',
            page: consentInterface?.page,
            version: consentInterface?.version,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip
          }
        },
        permissions: permissions || {},
        evidence: {
          consentText,
          privacyPolicyVersion: consentInterface?.privacyPolicyVersion,
          language: req.language || 'en'
        }
      });

      await consent.save();

      logger.info('Consent recorded', {
        consentId: consent.consentId,
        purpose,
        userId: req.user.id,
        tenantId: req.tenantId
      });

      res.status(201).json({
        success: true,
        message: 'Consent recorded successfully',
        consentId: consent.consentId,
        expiresAt: consent.status.expiresAt
      });

    } catch (error) {
      logger.error('Error recording consent', error);
      res.status(500).json({
        error: 'CONSENT_RECORD_ERROR',
        message: 'Failed to record consent'
      });
    }
  }

  /**
   * Withdraw user consent
   */
  async withdrawConsent(req, res) {
    try {
      const { purpose, reason, feedback } = req.body;

      if (!purpose) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Purpose is required'
        });
      }

      const consent = await ConsentRecord.findActiveConsent(req.user.id, purpose);
      if (!consent) {
        return res.status(404).json({
          error: 'CONSENT_NOT_FOUND',
          message: 'No active consent found for this purpose'
        });
      }

      await consent.withdraw('settings_panel', reason, feedback);

      // Create data subject request for consent withdrawal
      const request = new DataSubjectRequest({
        requestType: 'withdraw_consent',
        dataSubject: {
          userId: req.user.id,
          identity: {
            email: req.user.email
          },
          verification: {
            status: 'verified',
            method: 'authentication',
            verifiedAt: new Date()
          },
          tenantId: req.tenantId
        },
        details: {
          description: `Withdrawal of consent for ${purpose}`,
          reason: reason || 'User request'
        },
        status: {
          current: 'completed'
        },
        outcome: {
          decision: 'granted_full',
          actionsTaken: [{
            action: 'consent_withdrawn',
            description: `Consent withdrawn for ${purpose}`,
            completedAt: new Date()
          }]
        }
      });

      await request.save();

      logger.info('Consent withdrawn', {
        consentId: consent.consentId,
        purpose,
        userId: req.user.id,
        reason
      });

      res.json({
        success: true,
        message: 'Consent withdrawn successfully',
        requestId: request.requestId
      });

    } catch (error) {
      logger.error('Error withdrawing consent', error);
      res.status(500).json({
        error: 'CONSENT_WITHDRAWAL_ERROR',
        message: 'Failed to withdraw consent'
      });
    }
  }

  /**
   * Get user's consent status
   */
  async getConsentStatus(req, res) {
    try {
      const consents = await ConsentRecord.getUserConsents(req.user.id);

      const consentStatus = consents.map(consent => ({
        consentId: consent.consentId,
        purpose: consent.consent.purpose,
        description: consent.consent.description,
        status: consent.status.current,
        givenAt: consent.status.givenAt,
        expiresAt: consent.status.expiresAt,
        daysUntilExpiry: consent.daysUntilExpiry,
        permissions: consent.permissions,
        isValid: consent.isValid
      }));

      res.json({
        success: true,
        consents: consentStatus
      });

    } catch (error) {
      logger.error('Error getting consent status', error);
      res.status(500).json({
        error: 'CONSENT_STATUS_ERROR',
        message: 'Failed to get consent status'
      });
    }
  }

  /**
   * Process data subject request (admin only)
   */
  async processRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { action, notes } = req.body;

      if (!['approve', 'reject', 'process', 'complete'].includes(action)) {
        return res.status(400).json({
          error: 'INVALID_ACTION',
          message: 'Invalid processing action'
        });
      }

      const request = await DataSubjectRequest.findOne({ requestId });
      if (!request) {
        return res.status(404).json({
          error: 'REQUEST_NOT_FOUND',
          message: 'Data subject request not found'
        });
      }

      let newStatus;
      switch (action) {
        case 'approve':
          newStatus = 'processing';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        case 'process':
          newStatus = 'processing';
          await this.executeDataSubjectRequest(request);
          break;
        case 'complete':
          newStatus = 'completed';
          break;
      }

      await request.updateStatus(newStatus, req.user.id, notes);

      // Send notification to data subject
      await request.addCommunication({
        type: 'email',
        direction: 'outbound',
        subject: `Data Subject Request Update - ${requestId}`,
        content: `Your request has been ${action}ed. ${notes || ''}`
      });

      logger.info('Data subject request processed', {
        requestId,
        action,
        processedBy: req.user.id
      });

      res.json({
        success: true,
        message: `Request ${action}ed successfully`,
        newStatus
      });

    } catch (error) {
      logger.error('Error processing request', error);
      res.status(500).json({
        error: 'REQUEST_PROCESSING_ERROR',
        message: 'Failed to process request'
      });
    }
  }

  /**
   * Get GDPR compliance dashboard data (admin only)
   */
  async getComplianceDashboard(req, res) {
    try {
      const { period = '30d' } = req.query;
      const periodDays = parseInt(period.replace('d', ''));
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

      // Request statistics
      const requestStats = await this.getRequestStatistics(startDate);
      
      // Consent statistics
      const consentStats = await this.getConsentStatistics(startDate);
      
      // Overdue requests
      const overdueRequests = await DataSubjectRequest.getOverdueRequests();
      
      // Upcoming deadlines
      const upcomingDeadlines = await DataSubjectRequest.getUpcomingDeadlines();
      
      // Processing records
      const processingRecords = await DataProcessingRecord.getActiveRecords();

      res.json({
        success: true,
        dashboard: {
          period,
          requests: requestStats,
          consents: consentStats,
          alerts: {
            overdueRequests: overdueRequests.length,
            upcomingDeadlines: upcomingDeadlines.length
          },
          compliance: {
            activeProcessingRecords: processingRecords.length,
            lastUpdated: new Date()
          }
        }
      });

    } catch (error) {
      logger.error('Error getting compliance dashboard', error);
      res.status(500).json({
        error: 'DASHBOARD_ERROR',
        message: 'Failed to get compliance dashboard'
      });
    }
  }

  // Helper methods

  calculatePriority(requestType) {
    const urgentTypes = ['erasure', 'objection'];
    return urgentTypes.includes(requestType) ? 'high' : 'medium';
  }

  assessComplexity(requestType, dataCategories) {
    if (requestType === 'access' && dataCategories?.includes('all_data')) {
      return 'complex';
    }
    if (['portability', 'rectification'].includes(requestType)) {
      return 'medium';
    }
    return 'simple';
  }

  async assignRequest(request) {
    // Auto-assignment logic based on request type and workload
    // This would integrate with a team management system
    logger.info('Request assigned', { requestId: request.requestId });
  }

  async executeDataSubjectRequest(request) {
    try {
      switch (request.requestType) {
        case 'access':
        case 'portability':
          await DataExportService.processExportRequest(request);
          break;
        case 'erasure':
          await DataDeletionService.processErasureRequest(request);
          break;
        case 'withdraw_consent':
          await ConsentService.processConsentWithdrawal(request);
          break;
        // Other request types would be handled here
      }
    } catch (error) {
      logger.error('Error executing data subject request', error);
      throw error;
    }
  }

  async getRequestStatistics(startDate) {
    const requests = await DataSubjectRequest.find({
      createdAt: { $gte: startDate }
    });

    return {
      total: requests.length,
      byType: this.groupByField(requests, 'requestType'),
      byStatus: this.groupByField(requests, 'status.current'),
      averageProcessingTime: this.calculateAverageProcessingTime(requests)
    };
  }

  async getConsentStatistics(startDate) {
    const consents = await ConsentRecord.find({
      createdAt: { $gte: startDate }
    });

    return {
      total: consents.length,
      active: consents.filter(c => c.isValid).length,
      withdrawn: consents.filter(c => c.status.current === 'withdrawn').length,
      expired: consents.filter(c => c.status.current === 'expired').length,
      byPurpose: this.groupByField(consents, 'consent.purpose')
    };
  }

  groupByField(array, field) {
    return array.reduce((acc, item) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  calculateAverageProcessingTime(requests) {
    const completedRequests = requests.filter(r => r.status.current === 'completed');
    if (completedRequests.length === 0) return 0;
    
    const totalDays = completedRequests.reduce((sum, request) => {
      return sum + (request.metrics?.processingTime?.totalDays || 0);
    }, 0);
    
    return Math.round(totalDays / completedRequests.length);
  }
}

module.exports = new GDPRController();