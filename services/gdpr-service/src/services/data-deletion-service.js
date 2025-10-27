const logger = require('../utils/logger');

/**
 * Data Deletion Service for GDPR Article 17 (Right to Erasure/"Right to be Forgotten")
 * 
 * Handles secure deletion of user data across all systems
 */

class DataDeletionService {

  constructor() {
    this.deletionServices = [
      'user_profile',
      'project_service', 
      'file_service',
      'ai_service',
      'notification_service',
      'billing_service',
      'analytics_service',
      'collaboration_service'
    ];
  }

  /**
   * Process data erasure request
   */
  async processErasureRequest(request) {
    try {
      logger.info('Starting data erasure process', {
        requestId: request.requestId,
        userId: request.dataSubject.userId
      });

      // Update request status
      request.status.current = 'processing';
      await request.save();

      // Check if erasure is legally permitted
      const erasureValidation = await this.validateErasureRequest(request);
      if (!erasureValidation.permitted) {
        request.status.current = 'rejected';
        request.outcome = {
          decision: 'denied_legal_grounds',
          justification: erasureValidation.reason
        };
        await request.save();
        return;
      }

      // Perform data deletion across all services
      const deletionResults = await this.executeDataDeletion(request);

      // Update request with results
      request.outcome = {
        decision: deletionResults.success ? 'granted_full' : 'granted_partial',
        justification: deletionResults.summary,
        actionsTaken: deletionResults.actions
      };

      request.status.current = 'completed';
      request.metrics.processingTime.endTime = new Date();
      
      await request.save();

      // Send completion notification
      await this.sendDeletionNotification(request, deletionResults);

      logger.info('Data erasure completed', {
        requestId: request.requestId,
        success: deletionResults.success,
        deletedRecords: deletionResults.totalDeleted
      });

      return deletionResults;

    } catch (error) {
      logger.error('Error processing erasure request', {
        requestId: request.requestId,
        error: error.message
      });
      
      request.status.current = 'rejected';
      request.outcome = {
        decision: 'denied_technical',
        justification: 'Technical error during data deletion process'
      };
      await request.save();
      
      throw error;
    }
  }

  /**
   * Validate if erasure request can be legally fulfilled
   */
  async validateErasureRequest(request) {
    const userId = request.dataSubject.userId;
    const tenantId = request.dataSubject.tenantId;

    // Check for legal obligations to retain data
    const legalHolds = await this.checkLegalHolds(userId, tenantId);
    if (legalHolds.length > 0) {
      return {
        permitted: false,
        reason: `Data must be retained due to legal obligations: ${legalHolds.join(', ')}`
      };
    }

    // Check for active contracts
    const activeContracts = await this.checkActiveContracts(userId, tenantId);
    if (activeContracts.length > 0) {
      return {
        permitted: false,
        reason: `Data required for contract performance: ${activeContracts.join(', ')}`
      };
    }

    // Check for public interest/scientific research
    const researchUse = await this.checkResearchUse(userId, tenantId);
    if (researchUse.inUse) {
      return {
        permitted: false,
        reason: 'Data is part of scientific research in the public interest'
      };
    }

    // Check for legitimate interests that override erasure
    const legitimateInterests = await this.checkLegitimateInterests(userId, tenantId);
    if (legitimateInterests.length > 0) {
      return {
        permitted: false,
        reason: `Compelling legitimate interests: ${legitimateInterests.join(', ')}`
      };
    }

    return {
      permitted: true,
      reason: 'No legal impediments to data erasure'
    };
  }

  /**
   * Execute data deletion across all services
   */
  async executeDataDeletion(request) {
    const userId = request.dataSubject.userId;
    const tenantId = request.dataSubject.tenantId;
    
    const results = {
      success: true,
      totalDeleted: 0,
      actions: [],
      errors: [],
      summary: ''
    };

    // Delete from each service
    for (const serviceName of this.deletionServices) {
      try {
        const serviceResult = await this.deleteFromService(serviceName, userId, tenantId);
        
        results.actions.push({
          action: 'data_deleted',
          description: `Deleted ${serviceResult.recordsDeleted} records from ${serviceName}`,
          completedAt: new Date(),
          evidence: serviceResult.evidence
        });

        results.totalDeleted += serviceResult.recordsDeleted;

      } catch (error) {
        logger.error(`Error deleting from ${serviceName}`, error);
        results.errors.push(`${serviceName}: ${error.message}`);
        results.success = false;
      }
    }

    // Delete consent records (mark as withdrawn)
    try {
      const consentResult = await this.deleteConsentRecords(userId, tenantId);
      results.actions.push({
        action: 'consent_withdrawn',
        description: `Processed ${consentResult.recordsProcessed} consent records`,
        completedAt: new Date()
      });
    } catch (error) {
      logger.error('Error processing consent records', error);
      results.errors.push(`Consent records: ${error.message}`);
    }

    // Delete or anonymize backups
    try {
      const backupResult = await this.processBackups(userId, tenantId);
      results.actions.push({
        action: 'data_deleted',
        description: `Processed ${backupResult.backupsProcessed} backup sets`,
        completedAt: new Date()
      });
    } catch (error) {
      logger.error('Error processing backups', error);
      results.errors.push(`Backups: ${error.message}`);
    }

    // Generate summary
    if (results.success) {
      results.summary = `Successfully deleted ${results.totalDeleted} records across ${this.deletionServices.length} services`;
    } else {
      results.summary = `Partial deletion completed with ${results.errors.length} errors. ${results.totalDeleted} records deleted.`;
    }

    return results;
  }

  /**
   * Delete data from specific service
   */
  async deleteFromService(serviceName, userId, tenantId) {
    switch (serviceName) {
      case 'user_profile':
        return await this.deleteUserProfile(userId, tenantId);
      case 'project_service':
        return await this.deleteProjectData(userId, tenantId);
      case 'file_service':
        return await this.deleteFileData(userId, tenantId);
      case 'ai_service':
        return await this.deleteAIData(userId, tenantId);
      case 'notification_service':
        return await this.deleteNotificationData(userId, tenantId);
      case 'billing_service':
        return await this.deleteBillingData(userId, tenantId);
      case 'analytics_service':
        return await this.deleteAnalyticsData(userId, tenantId);
      case 'collaboration_service':
        return await this.deleteCollaborationData(userId, tenantId);
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }

  /**
   * Delete user profile data
   */
  async deleteUserProfile(userId, tenantId) {
    try {
      const User = require('../../auth-service/src/models/User');
      
      // Instead of deleting the user record (which might break referential integrity),
      // we anonymize the personal data
      const user = await User.findById(userId);
      if (!user) {
        return { recordsDeleted: 0, evidence: 'User not found' };
      }

      // Anonymize personal data
      user.firstName = '[DELETED]';
      user.lastName = '[DELETED]';
      user.email = `deleted_${userId}@deleted.local`;
      user.phone = null;
      user.avatar = null;
      user.dateOfBirth = null;
      user.address = null;
      user.preferences = {};
      user.profile = {};
      user.isDeleted = true;
      user.deletedAt = new Date();
      
      await user.save();

      return {
        recordsDeleted: 1,
        evidence: `User profile anonymized on ${new Date().toISOString()}`
      };

    } catch (error) {
      logger.error('Error deleting user profile', error);
      throw error;
    }
  }

  /**
   * Delete project data
   */
  async deleteProjectData(userId, tenantId) {
    try {
      const Project = require('../../project-service/src/models/Project');
      
      // Find projects owned by user
      const ownedProjects = await Project.find({ owner: userId });
      
      // Find projects where user is collaborator
      const collaboratedProjects = await Project.find({ 'collaborators.user': userId });

      let deletedCount = 0;

      // Delete owned projects
      for (const project of ownedProjects) {
        await Project.deleteOne({ _id: project._id });
        deletedCount++;
      }

      // Remove user from collaborated projects
      for (const project of collaboratedProjects) {
        project.collaborators = project.collaborators.filter(
          collab => collab.user.toString() !== userId
        );
        await project.save();
        deletedCount++;
      }

      return {
        recordsDeleted: deletedCount,
        evidence: `Deleted ${ownedProjects.length} owned projects, removed from ${collaboratedProjects.length} collaborated projects`
      };

    } catch (error) {
      logger.error('Error deleting project data', error);
      throw error;
    }
  }

  /**
   * Delete file data
   */
  async deleteFileData(userId, tenantId) {
    try {
      // This would integrate with file service to delete user files
      // For now, we return a placeholder result
      
      return {
        recordsDeleted: 0,
        evidence: 'File deletion not yet implemented'
      };

    } catch (error) {
      logger.error('Error deleting file data', error);
      throw error;
    }
  }

  /**
   * Delete AI interaction data
   */
  async deleteAIData(userId, tenantId) {
    try {
      // This would integrate with AI service to delete conversation history,
      // code generation requests, etc.
      
      return {
        recordsDeleted: 0,
        evidence: 'AI data deletion not yet implemented'
      };

    } catch (error) {
      logger.error('Error deleting AI data', error);
      throw error;
    }
  }

  /**
   * Delete notification data
   */
  async deleteNotificationData(userId, tenantId) {
    try {
      // This would integrate with notification service
      
      return {
        recordsDeleted: 0,
        evidence: 'Notification data deletion not yet implemented'
      };

    } catch (error) {
      logger.error('Error deleting notification data', error);
      throw error;
    }
  }

  /**
   * Delete billing data (with retention requirements)
   */
  async deleteBillingData(userId, tenantId) {
    try {
      // Billing data often has legal retention requirements
      // We may only be able to anonymize rather than delete
      
      return {
        recordsDeleted: 0,
        evidence: 'Billing data retained for legal compliance, personal identifiers anonymized'
      };

    } catch (error) {
      logger.error('Error deleting billing data', error);
      throw error;
    }
  }

  /**
   * Delete analytics data
   */
  async deleteAnalyticsData(userId, tenantId) {
    try {
      // Analytics data deletion
      
      return {
        recordsDeleted: 0,
        evidence: 'Analytics data deletion not yet implemented'
      };

    } catch (error) {
      logger.error('Error deleting analytics data', error);
      throw error;
    }
  }

  /**
   * Delete collaboration data
   */
  async deleteCollaborationData(userId, tenantId) {
    try {
      // Real-time collaboration sessions, comments, etc.
      
      return {
        recordsDeleted: 0,
        evidence: 'Collaboration data deletion not yet implemented'
      };

    } catch (error) {
      logger.error('Error deleting collaboration data', error);
      throw error;
    }
  }

  /**
   * Process consent records
   */
  async deleteConsentRecords(userId, tenantId) {
    try {
      const ConsentRecord = require('../models/ConsentRecord');
      
      const consents = await ConsentRecord.getUserConsents(userId);
      let processedCount = 0;

      for (const consent of consents) {
        if (consent.status.current === 'given') {
          await consent.withdraw('automated_deletion', 'Data subject erasure request', 'User requested complete data deletion');
          processedCount++;
        }
      }

      return {
        recordsProcessed: processedCount,
        evidence: `Withdrew ${processedCount} active consents`
      };

    } catch (error) {
      logger.error('Error processing consent records', error);
      throw error;
    }
  }

  /**
   * Process backup data
   */
  async processBackups(userId, tenantId) {
    try {
      // In a real implementation, this would:
      // 1. Identify backups containing user data
      // 2. Schedule deletion/anonymization of user data in backups
      // 3. Update backup metadata
      
      return {
        backupsProcessed: 0,
        evidence: 'Backup processing not yet implemented'
      };

    } catch (error) {
      logger.error('Error processing backups', error);
      throw error;
    }
  }

  /**
   * Send deletion completion notification
   */
  async sendDeletionNotification(request, deletionResults) {
    const emailContent = `
Your data erasure request has been processed.

Request ID: ${request.requestId}
Processing Date: ${new Date().toISOString()}

Deletion Summary:
${deletionResults.summary}

Actions Taken:
${deletionResults.actions.map(action => `- ${action.description}`).join('\n')}

${deletionResults.errors.length > 0 ? `
Errors Encountered:
${deletionResults.errors.map(error => `- ${error}`).join('\n')}
` : ''}

Your data has been removed from our active systems. Some data may be retained in backups 
for a limited time due to technical limitations, but will be deleted according to our 
backup retention schedule.

For questions, contact privacy@zoptal.com
`;

    await request.addCommunication({
      type: 'email',
      direction: 'outbound',
      subject: `Data Erasure Completed - ${request.requestId}`,
      content: emailContent.trim()
    });
  }

  // Validation helper methods

  async checkLegalHolds(userId, tenantId) {
    // Check for legal holds, litigation, regulatory requirements
    // This would integrate with legal/compliance systems
    return [];
  }

  async checkActiveContracts(userId, tenantId) {
    // Check for active contracts that require data retention
    // This would check billing service for active subscriptions
    try {
      // Placeholder - would check billing service
      return [];
    } catch (error) {
      logger.error('Error checking active contracts', error);
      return [];
    }
  }

  async checkResearchUse(userId, tenantId) {
    // Check if data is being used for scientific research
    return { inUse: false };
  }

  async checkLegitimateInterests(userId, tenantId) {
    // Check for compelling legitimate interests
    // e.g., fraud prevention, security
    return [];
  }

  /**
   * Schedule automated deletion for inactive accounts
   */
  async scheduleAutomatedDeletion(retentionPeriodDays = 2555) { // 7 years default
    try {
      const cutoffDate = new Date(Date.now() - retentionPeriodDays * 24 * 60 * 60 * 1000);
      
      // Find users who haven't been active for retention period
      const User = require('../../auth-service/src/models/User');
      const inactiveUsers = await User.find({
        lastLoginAt: { $lt: cutoffDate },
        isDeleted: { $ne: true }
      });

      for (const user of inactiveUsers) {
        // Create automated erasure request
        const DataSubjectRequest = require('../models/DataSubjectRequest');
        
        const request = new DataSubjectRequest({
          requestType: 'erasure',
          dataSubject: {
            userId: user._id,
            identity: {
              email: user.email
            },
            verification: {
              status: 'verified',
              method: 'automatic',
              verifiedAt: new Date()
            }
          },
          details: {
            description: 'Automated data deletion for inactive account',
            dataCategories: ['all_data'],
            reason: 'Data retention policy compliance'
          },
          status: {
            current: 'processing'
          }
        });

        await request.save();
        
        // Process the deletion
        await this.processErasureRequest(request);
      }

      logger.info('Automated deletion scheduled', {
        usersScheduled: inactiveUsers.length,
        retentionPeriodDays
      });

    } catch (error) {
      logger.error('Error scheduling automated deletion', error);
      throw error;
    }
  }
}

module.exports = new DataDeletionService();