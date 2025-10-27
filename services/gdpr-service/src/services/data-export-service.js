const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

/**
 * Data Export Service for GDPR Article 15 (Right of Access) and Article 20 (Data Portability)
 * 
 * Handles complete data exports for users in various formats
 */

class DataExportService {

  constructor() {
    this.exportDirectory = process.env.EXPORT_DIRECTORY || './exports';
    this.maxExportSizeMB = parseInt(process.env.MAX_EXPORT_SIZE_MB) || 100;
  }

  /**
   * Process data export request
   */
  async processExportRequest(request) {
    try {
      logger.info('Starting data export process', {
        requestId: request.requestId,
        userId: request.dataSubject.userId,
        requestType: request.requestType
      });

      // Update request status
      request.status.current = 'processing';
      await request.save();

      // Collect data from all systems
      const userData = await this.collectUserData(request);

      // Generate export package
      const exportPackage = await this.createExportPackage(request, userData);

      // Update request with export details
      request.response = {
        method: 'secure_download',
        content: {
          summary: this.generateExportSummary(userData),
          dataPackageUrl: exportPackage.filePath,
          dataPackageSize: exportPackage.size,
          dataPackageFormat: 'zip'
        },
        timestamps: {
          sentAt: new Date()
        },
        security: {
          encrypted: true,
          password: await bcrypt.hash(exportPackage.password, 10),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          maxDownloads: 3
        }
      };

      request.status.current = 'completed';
      request.metrics.processingTime.endTime = new Date();
      
      await request.save();

      // Send completion notification
      await this.sendExportNotification(request, exportPackage.password);

      logger.info('Data export completed', {
        requestId: request.requestId,
        exportSize: exportPackage.size,
        recordCount: userData.totalRecords
      });

      return exportPackage;

    } catch (error) {
      logger.error('Error processing export request', {
        requestId: request.requestId,
        error: error.message
      });
      
      request.status.current = 'rejected';
      request.outcome = {
        decision: 'denied_technical',
        justification: 'Technical error during data export process'
      };
      await request.save();
      
      throw error;
    }
  }

  /**
   * Collect user data from all services
   */
  async collectUserData(request) {
    const userId = request.dataSubject.userId;
    const tenantId = request.dataSubject.tenantId;
    const dataCategories = request.details.dataCategories;

    const userData = {
      exportMetadata: {
        requestId: request.requestId,
        userId,
        tenantId,
        exportDate: new Date().toISOString(),
        dataCategories,
        format: request.details.responseFormat
      },
      personalData: {},
      totalRecords: 0,
      dataSources: []
    };

    // Profile and account data
    if (this.shouldIncludeCategory(dataCategories, 'personal_identifiers') ||
        this.shouldIncludeCategory(dataCategories, 'account_data')) {
      userData.personalData.profile = await this.getProfileData(userId, tenantId);
      userData.totalRecords += userData.personalData.profile?.length || 0;
      userData.dataSources.push('user_profile');
    }

    // Contact information
    if (this.shouldIncludeCategory(dataCategories, 'contact_information')) {
      userData.personalData.contacts = await this.getContactData(userId, tenantId);
      userData.totalRecords += userData.personalData.contacts?.length || 0;
      userData.dataSources.push('contact_data');
    }

    // Project data
    if (this.shouldIncludeCategory(dataCategories, 'usage_data') ||
        this.shouldIncludeCategory(dataCategories, 'all_data')) {
      userData.personalData.projects = await this.getProjectData(userId, tenantId);
      userData.totalRecords += userData.personalData.projects?.length || 0;
      userData.dataSources.push('project_service');
    }

    // File data
    if (this.shouldIncludeCategory(dataCategories, 'usage_data')) {
      userData.personalData.files = await this.getFileData(userId, tenantId);
      userData.totalRecords += userData.personalData.files?.length || 0;
      userData.dataSources.push('file_service');
    }

    // AI interaction data
    if (this.shouldIncludeCategory(dataCategories, 'behavioral_data') ||
        this.shouldIncludeCategory(dataCategories, 'usage_data')) {
      userData.personalData.aiInteractions = await this.getAIInteractionData(userId, tenantId);
      userData.totalRecords += userData.personalData.aiInteractions?.length || 0;
      userData.dataSources.push('ai_service');
    }

    // Communication data
    if (this.shouldIncludeCategory(dataCategories, 'communication_data')) {
      userData.personalData.notifications = await this.getNotificationData(userId, tenantId);
      userData.totalRecords += userData.personalData.notifications?.length || 0;
      userData.dataSources.push('notification_service');
    }

    // Billing data
    if (this.shouldIncludeCategory(dataCategories, 'financial_data')) {
      userData.personalData.billing = await this.getBillingData(userId, tenantId);
      userData.totalRecords += userData.personalData.billing?.length || 0;
      userData.dataSources.push('billing_service');
    }

    // Analytics and tracking data
    if (this.shouldIncludeCategory(dataCategories, 'behavioral_data') ||
        this.shouldIncludeCategory(dataCategories, 'device_data')) {
      userData.personalData.analytics = await this.getAnalyticsData(userId, tenantId);
      userData.totalRecords += userData.personalData.analytics?.length || 0;
      userData.dataSources.push('analytics_service');
    }

    // Consent records
    userData.personalData.consents = await this.getConsentData(userId, tenantId);
    userData.totalRecords += userData.personalData.consents?.length || 0;
    userData.dataSources.push('gdpr_service');

    // Privacy settings and preferences
    if (this.shouldIncludeCategory(dataCategories, 'preferences')) {
      userData.personalData.preferences = await this.getPreferencesData(userId, tenantId);
      userData.totalRecords += userData.personalData.preferences?.length || 0;
      userData.dataSources.push('user_preferences');
    }

    return userData;
  }

  /**
   * Create export package with multiple formats
   */
  async createExportPackage(request, userData) {
    const exportId = `export_${request.requestId}_${Date.now()}`;
    const exportDir = path.join(this.exportDirectory, exportId);
    
    // Ensure export directory exists
    await fs.mkdir(exportDir, { recursive: true });

    const format = request.details.responseFormat;
    let mainDataFile;

    // Generate main data file in requested format
    switch (format) {
      case 'json':
        mainDataFile = await this.generateJSONExport(exportDir, userData);
        break;
      case 'csv':
        mainDataFile = await this.generateCSVExport(exportDir, userData);
        break;
      case 'xml':
        mainDataFile = await this.generateXMLExport(exportDir, userData);
        break;
      case 'pdf':
        mainDataFile = await this.generatePDFExport(exportDir, userData);
        break;
      default:
        mainDataFile = await this.generateJSONExport(exportDir, userData);
    }

    // Generate additional files
    await this.generateReadmeFile(exportDir, userData);
    await this.generateDataSchemaFile(exportDir, userData);
    await this.generateSummaryReport(exportDir, userData, request);

    // Create password-protected ZIP archive
    const password = this.generateSecurePassword();
    const zipPath = path.join(this.exportDirectory, `${exportId}.zip`);
    
    await this.createPasswordProtectedZip(exportDir, zipPath, password);

    // Calculate file size
    const stats = await fs.stat(zipPath);
    
    // Clean up temporary directory
    await this.cleanupDirectory(exportDir);

    return {
      filePath: zipPath,
      size: stats.size,
      password,
      exportId
    };
  }

  /**
   * Generate JSON export
   */
  async generateJSONExport(exportDir, userData) {
    const filePath = path.join(exportDir, 'personal_data.json');
    const jsonData = JSON.stringify(userData, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf8');
    return filePath;
  }

  /**
   * Generate CSV export
   */
  async generateCSVExport(exportDir, userData) {
    const filePath = path.join(exportDir, 'personal_data.csv');
    
    // Flatten data structure for CSV
    const flatData = this.flattenUserData(userData);
    const csv = this.convertToCSV(flatData);
    
    await fs.writeFile(filePath, csv, 'utf8');
    return filePath;
  }

  /**
   * Generate XML export
   */
  async generateXMLExport(exportDir, userData) {
    const filePath = path.join(exportDir, 'personal_data.xml');
    const xml = this.convertToXML(userData);
    await fs.writeFile(filePath, xml, 'utf8');
    return filePath;
  }

  /**
   * Generate PDF export
   */
  async generatePDFExport(exportDir, userData) {
    const PDFDocument = require('pdfkit');
    const filePath = path.join(exportDir, 'personal_data.pdf');
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const stream = require('fs').createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Add content to PDF
      doc.fontSize(16).text('Personal Data Export', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(12).text(`Export Date: ${userData.exportMetadata.exportDate}`);
      doc.text(`Request ID: ${userData.exportMetadata.requestId}`);
      doc.text(`Total Records: ${userData.totalRecords}`);
      doc.moveDown();

      // Add data sections
      Object.entries(userData.personalData).forEach(([section, data]) => {
        if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
          doc.fontSize(14).text(section.toUpperCase(), { underline: true });
          doc.fontSize(10).text(JSON.stringify(data, null, 2));
          doc.moveDown();
        }
      });
      
      doc.end();
      
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  /**
   * Generate README file
   */
  async generateReadmeFile(exportDir, userData) {
    const readmeContent = `
# Personal Data Export

This package contains your personal data exported from Zoptal platform.

## Export Details
- Export Date: ${userData.exportMetadata.exportDate}
- Request ID: ${userData.exportMetadata.requestId}
- Total Records: ${userData.totalRecords}
- Data Sources: ${userData.dataSources.join(', ')}

## Files Included
- personal_data.${userData.exportMetadata.format}: Your personal data in requested format
- data_schema.json: Schema describing the data structure
- export_summary.txt: Summary of exported data
- README.txt: This file

## Data Categories Included
${userData.exportMetadata.dataCategories.map(cat => `- ${cat}`).join('\n')}

## Important Notes
- This export contains personal data. Keep it secure.
- Delete this file when no longer needed.
- For questions, contact privacy@zoptal.com

## Data Processing Information
This data was collected and processed according to our Privacy Policy.
Legal basis for processing: As per GDPR Articles 6 and 9.
Data retention: As specified in our data retention policy.

Generated by Zoptal GDPR Compliance System
`;

    await fs.writeFile(path.join(exportDir, 'README.txt'), readmeContent.trim());
  }

  /**
   * Generate data schema file
   */
  async generateDataSchemaFile(exportDir, userData) {
    const schema = {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      description: 'Schema for personal data export',
      structure: this.generateDataSchema(userData.personalData)
    };

    await fs.writeFile(
      path.join(exportDir, 'data_schema.json'),
      JSON.stringify(schema, null, 2)
    );
  }

  /**
   * Generate summary report
   */
  async generateSummaryReport(exportDir, userData, request) {
    const summary = `
Personal Data Export Summary
===========================

Request Information:
- Request ID: ${request.requestId}
- Request Type: ${request.requestType}
- Submitted: ${request.createdAt}
- Processed: ${new Date()}

Data Summary:
- Total Records: ${userData.totalRecords}
- Data Sources: ${userData.dataSources.length}
- Export Format: ${userData.exportMetadata.format}

Data Breakdown:
${Object.entries(userData.personalData).map(([key, data]) => {
  const count = Array.isArray(data) ? data.length : (data ? Object.keys(data).length : 0);
  return `- ${key}: ${count} records`;
}).join('\n')}

Data Sources:
${userData.dataSources.map(source => `- ${source}`).join('\n')}

This export was generated in compliance with GDPR Article 15 (Right of Access)
${request.requestType === 'portability' ? 'and Article 20 (Right to Data Portability)' : ''}.
`;

    await fs.writeFile(path.join(exportDir, 'export_summary.txt'), summary.trim());
  }

  /**
   * Create password-protected ZIP archive
   */
  async createPasswordProtectedZip(sourceDir, outputPath, password) {
    return new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 },
        password: password
      });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  /**
   * Send export completion notification
   */
  async sendExportNotification(request, password) {
    const emailContent = `
Your data export request has been completed.

Request ID: ${request.requestId}
Export Size: ${(request.response.content.dataPackageSize / 1024 / 1024).toFixed(2)} MB
Download Password: ${password}

Download Link: [Secure Download URL]

Important:
- The download link expires in 30 days
- You can download the file up to 3 times
- Keep the password secure

For questions, contact privacy@zoptal.com
`;

    await request.addCommunication({
      type: 'email',
      direction: 'outbound',
      subject: `Data Export Ready - ${request.requestId}`,
      content: emailContent.trim()
    });
  }

  // Data collection methods for different services

  async getProfileData(userId, tenantId) {
    // This would integrate with the auth service
    try {
      const User = require('../../auth-service/src/models/User');
      const user = await User.findById(userId).select('-password -tokens');
      return user ? [user.toObject()] : [];
    } catch (error) {
      logger.error('Error getting profile data', error);
      return [];
    }
  }

  async getContactData(userId, tenantId) {
    // Contact information from various sources
    return [];
  }

  async getProjectData(userId, tenantId) {
    // This would integrate with the project service
    try {
      const Project = require('../../project-service/src/models/Project');
      const projects = await Project.find({ 
        $or: [
          { owner: userId },
          { 'collaborators.user': userId }
        ]
      });
      return projects.map(p => p.toObject());
    } catch (error) {
      logger.error('Error getting project data', error);
      return [];
    }
  }

  async getFileData(userId, tenantId) {
    // File metadata and access logs
    return [];
  }

  async getAIInteractionData(userId, tenantId) {
    // AI chat history and code generation requests
    return [];
  }

  async getNotificationData(userId, tenantId) {
    // Notification history
    return [];
  }

  async getBillingData(userId, tenantId) {
    // Billing and subscription data
    return [];
  }

  async getAnalyticsData(userId, tenantId) {
    // Usage analytics and tracking data
    return [];
  }

  async getConsentData(userId, tenantId) {
    // Consent records
    try {
      const ConsentRecord = require('../models/ConsentRecord');
      const consents = await ConsentRecord.getUserConsents(userId);
      return consents.map(c => c.toObject());
    } catch (error) {
      logger.error('Error getting consent data', error);
      return [];
    }
  }

  async getPreferencesData(userId, tenantId) {
    // User preferences and settings
    return [];
  }

  // Helper methods

  shouldIncludeCategory(requestedCategories, category) {
    return requestedCategories.includes('all_data') || requestedCategories.includes(category);
  }

  generateExportSummary(userData) {
    return `Data export contains ${userData.totalRecords} records from ${userData.dataSources.length} sources.`;
  }

  generateSecurePassword() {
    return crypto.randomBytes(12).toString('base64');
  }

  flattenUserData(userData) {
    // Flatten nested data structure for CSV export
    const flattened = [];
    
    Object.entries(userData.personalData).forEach(([category, data]) => {
      if (Array.isArray(data)) {
        data.forEach(item => {
          flattened.push({ category, ...item });
        });
      } else if (data && typeof data === 'object') {
        flattened.push({ category, ...data });
      }
    });

    return flattened;
  }

  convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  convertToXML(userData) {
    // Simple XML conversion
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<personalData>\n';
    
    Object.entries(userData.personalData).forEach(([key, value]) => {
      xml += `  <${key}>${JSON.stringify(value)}</${key}>\n`;
    });
    
    xml += '</personalData>';
    return xml;
  }

  generateDataSchema(data) {
    const schema = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        schema[key] = {
          type: 'array',
          items: Object.keys(value[0])
        };
      } else if (value && typeof value === 'object') {
        schema[key] = {
          type: 'object',
          properties: Object.keys(value)
        };
      }
    });

    return schema;
  }

  async cleanupDirectory(dirPath) {
    try {
      await fs.rmdir(dirPath, { recursive: true });
    } catch (error) {
      logger.error('Error cleaning up export directory', error);
    }
  }
}

module.exports = new DataExportService();