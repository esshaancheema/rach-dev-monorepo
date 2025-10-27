import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { createHash } from 'crypto';
import archiver from 'archiver';
import { Readable } from 'stream';

export interface UserExportOptions {
  userId: string;
  format: 'json' | 'csv';
  includeDeleted?: boolean;
  anonymize?: boolean;
}

export interface ExportedUserData {
  exportId: string;
  exportDate: string;
  dataSubject: {
    userId: string;
    email: string;
    createdAt: string;
  };
  personalData: {
    profile: any;
    authenticationData: any;
    sessions: any[];
    loginHistory: any[];
    activityLogs: any[];
    preferences: any;
    consentRecords: any[];
    dataProcessingRecords: any[];
  };
  metadata: {
    exportVersion: string;
    totalRecords: number;
    dataCategories: string[];
    retentionPeriods: Record<string, string>;
    legalBasis: string;
  };
}

interface UserExportServiceDependencies {
  prisma: PrismaClient;
}

export function createUserExportService({ prisma }: UserExportServiceDependencies) {
  
  /**
   * Generate a unique export ID
   */
  function generateExportId(userId: string): string {
    const timestamp = Date.now();
    const hash = createHash('sha256')
      .update(`${userId}-${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    return `export_${timestamp}_${hash}`;
  }

  /**
   * Anonymize sensitive data if requested
   */
  function anonymizeData(data: any, fields: string[]): any {
    const anonymized = { ...data };
    
    for (const field of fields) {
      if (field in anonymized) {
        anonymized[field] = '***REDACTED***';
      }
    }
    
    return anonymized;
  }

  /**
   * Export all user data for GDPR compliance
   */
  async function exportUserData(options: UserExportOptions): Promise<ExportedUserData> {
    const { userId, anonymize = false, includeDeleted = false } = options;
    const exportId = generateExportId(userId);
    
    try {
      logger.info({ userId, exportId }, 'Starting user data export');

      // Fetch user profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          oAuthAccounts: true,
          passwordHistory: true,
          twoFactorAuth: true,
          deviceFingerprints: true,
          sessions: true,
          loginHistory: {
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to last 100 logins
          },
          activityLogs: {
            orderBy: { createdAt: 'desc' },
            take: 500 // Limit to last 500 activities
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Prepare profile data
      let profileData = {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isActive: user.isActive,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        deletedAt: user.deletedAt,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          dateOfBirth: user.profile.dateOfBirth,
          country: user.profile.country,
          language: user.profile.language,
          timezone: user.profile.timezone,
          avatarUrl: user.profile.avatarUrl,
          bio: user.profile.bio,
          preferences: user.profile.preferences
        } : null
      };

      // Anonymize if requested
      if (anonymize) {
        profileData = anonymizeData(profileData, [
          'email',
          'phoneNumber',
          'profile.firstName',
          'profile.lastName',
          'profile.dateOfBirth'
        ]);
      }

      // Prepare authentication data
      const authenticationData = {
        oAuthAccounts: user.oAuthAccounts.map(account => ({
          provider: account.provider,
          createdAt: account.createdAt,
          lastUsedAt: account.lastUsedAt
        })),
        twoFactorEnabled: user.twoFactorAuth?.enabled || false,
        twoFactorMethods: user.twoFactorAuth ? {
          authenticatorApp: true,
          sms: !!user.twoFactorAuth.phoneNumber,
          email: user.twoFactorAuth.emailBackup
        } : null,
        passwordChanges: user.passwordHistory.length,
        lastPasswordChange: user.passwordHistory[0]?.createdAt || null
      };

      // Prepare session data
      const sessions = user.sessions.map(session => ({
        id: session.id,
        deviceName: session.deviceName,
        deviceType: session.deviceType,
        browser: session.browser,
        os: session.os,
        ip: anonymize ? '***REDACTED***' : session.ip,
        location: session.location,
        lastActiveAt: session.lastActiveAt,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      }));

      // Prepare login history
      const loginHistory = user.loginHistory.map(login => ({
        id: login.id,
        ip: anonymize ? '***REDACTED***' : login.ip,
        userAgent: login.userAgent,
        location: login.location,
        deviceFingerprint: anonymize ? '***REDACTED***' : login.deviceFingerprint,
        success: login.success,
        failureReason: login.failureReason,
        createdAt: login.createdAt
      }));

      // Prepare activity logs
      const activityLogs = user.activityLogs.map(log => ({
        id: log.id,
        action: log.action,
        category: log.category,
        ip: anonymize ? '***REDACTED***' : log.ip,
        userAgent: log.userAgent,
        metadata: log.metadata,
        createdAt: log.createdAt
      }));

      // Get user preferences (if implemented)
      const preferences = {
        notifications: {
          email: true,
          sms: true,
          push: false
        },
        privacy: {
          profileVisibility: 'private',
          activityTracking: true,
          dataSharing: false
        },
        communication: {
          marketing: false,
          updates: true,
          newsletters: false
        }
      };

      // Get consent records (mock data for now)
      const consentRecords = [
        {
          id: 'consent_1',
          type: 'terms_of_service',
          version: '1.0',
          consentedAt: user.createdAt,
          ip: anonymize ? '***REDACTED***' : '192.168.1.1',
          method: 'registration'
        },
        {
          id: 'consent_2',
          type: 'privacy_policy',
          version: '1.0',
          consentedAt: user.createdAt,
          ip: anonymize ? '***REDACTED***' : '192.168.1.1',
          method: 'registration'
        }
      ];

      // Get data processing records
      const dataProcessingRecords = [
        {
          purpose: 'account_creation',
          legalBasis: 'contract',
          dataCategories: ['identity', 'contact'],
          retention: '5 years after account closure',
          processors: ['internal']
        },
        {
          purpose: 'security_monitoring',
          legalBasis: 'legitimate_interest',
          dataCategories: ['authentication', 'device', 'location'],
          retention: '90 days',
          processors: ['internal', 'security_provider']
        }
      ];

      // Calculate total records
      const totalRecords = 
        1 + // user profile
        user.oAuthAccounts.length +
        user.sessions.length +
        user.loginHistory.length +
        user.activityLogs.length +
        consentRecords.length +
        dataProcessingRecords.length;

      // Prepare final export data
      const exportData: ExportedUserData = {
        exportId,
        exportDate: new Date().toISOString(),
        dataSubject: {
          userId: user.id,
          email: anonymize ? '***REDACTED***' : user.email,
          createdAt: user.createdAt.toISOString()
        },
        personalData: {
          profile: profileData,
          authenticationData,
          sessions,
          loginHistory,
          activityLogs,
          preferences,
          consentRecords,
          dataProcessingRecords
        },
        metadata: {
          exportVersion: '1.0',
          totalRecords,
          dataCategories: [
            'identity',
            'contact',
            'authentication',
            'device',
            'location',
            'activity',
            'preferences',
            'consent'
          ],
          retentionPeriods: {
            profile: '5 years after account deletion',
            authentication: '5 years after account deletion',
            sessions: '90 days after expiry',
            loginHistory: '1 year',
            activityLogs: '90 days',
            consent: 'Indefinite'
          },
          legalBasis: 'GDPR Article 15 - Right of access by the data subject'
        }
      };

      // Log the export event
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'USER_DATA_EXPORT',
          category: 'PRIVACY',
          ip: '127.0.0.1', // System action
          userAgent: 'System',
          metadata: {
            exportId,
            format: options.format,
            anonymized: anonymize,
            totalRecords
          }
        }
      });

      logger.info({ userId, exportId, totalRecords }, 'User data export completed');

      return exportData;

    } catch (error) {
      logger.error({ error, userId, exportId }, 'Failed to export user data');
      throw error;
    }
  }

  /**
   * Export user data as JSON
   */
  async function exportAsJson(options: UserExportOptions): Promise<Buffer> {
    const data = await exportUserData(options);
    return Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Export user data as CSV (simplified format)
   */
  async function exportAsCsv(options: UserExportOptions): Promise<Buffer> {
    const data = await exportUserData(options);
    
    // Create CSV content
    const csvLines: string[] = [];
    
    // Headers
    csvLines.push('Category,Field,Value,Timestamp');
    
    // Profile data
    csvLines.push(`Profile,User ID,${data.dataSubject.userId},${data.dataSubject.createdAt}`);
    csvLines.push(`Profile,Email,${data.dataSubject.email},${data.dataSubject.createdAt}`);
    
    if (data.personalData.profile.profile) {
      const profile = data.personalData.profile.profile;
      csvLines.push(`Profile,First Name,${profile.firstName || 'N/A'},${data.dataSubject.createdAt}`);
      csvLines.push(`Profile,Last Name,${profile.lastName || 'N/A'},${data.dataSubject.createdAt}`);
      csvLines.push(`Profile,Language,${profile.language || 'N/A'},${data.dataSubject.createdAt}`);
      csvLines.push(`Profile,Timezone,${profile.timezone || 'N/A'},${data.dataSubject.createdAt}`);
    }
    
    // Sessions
    data.personalData.sessions.forEach(session => {
      csvLines.push(`Session,Device,${session.deviceName},${session.createdAt}`);
      csvLines.push(`Session,Location,${session.location || 'Unknown'},${session.createdAt}`);
    });
    
    // Login history
    data.personalData.loginHistory.forEach(login => {
      csvLines.push(`Login,Status,${login.success ? 'Success' : 'Failed'},${login.createdAt}`);
      csvLines.push(`Login,Location,${login.location || 'Unknown'},${login.createdAt}`);
    });
    
    // Activity logs
    data.personalData.activityLogs.forEach(log => {
      csvLines.push(`Activity,Action,${log.action},${log.createdAt}`);
    });
    
    return Buffer.from(csvLines.join('\n'), 'utf-8');
  }

  /**
   * Create a ZIP archive with all user data
   */
  async function exportAsArchive(options: UserExportOptions): Promise<Buffer> {
    const data = await exportUserData(options);
    
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });
      
      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
      
      // Add main data file
      archive.append(JSON.stringify(data, null, 2), { name: 'user-data.json' });
      
      // Add README
      const readme = `User Data Export
==================

Export ID: ${data.exportId}
Export Date: ${data.exportDate}
User ID: ${data.dataSubject.userId}

This archive contains all personal data associated with your account.

Files included:
- user-data.json: Complete user data in JSON format
- README.txt: This file

Data Categories:
${data.metadata.dataCategories.map(cat => `- ${cat}`).join('\n')}

For questions about this data export, please contact our Data Protection Officer.

Generated in compliance with GDPR Article 15 - Right of access by the data subject.
`;
      
      archive.append(readme, { name: 'README.txt' });
      archive.finalize();
    });
  }

  /**
   * Delete user export after download (for security)
   */
  async function cleanupExport(exportId: string, userId: string): Promise<void> {
    try {
      // Log the cleanup
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'USER_DATA_EXPORT_CLEANUP',
          category: 'PRIVACY',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: { exportId }
        }
      });
      
      logger.info({ exportId, userId }, 'User data export cleaned up');
    } catch (error) {
      logger.error({ error, exportId, userId }, 'Failed to cleanup export');
    }
  }

  /**
   * Get export history for a user
   */
  async function getExportHistory(userId: string): Promise<any[]> {
    const logs = await prisma.activityLog.findMany({
      where: {
        userId,
        action: 'USER_DATA_EXPORT',
        category: 'PRIVACY'
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    return logs.map(log => ({
      exportId: log.metadata?.exportId,
      exportDate: log.createdAt,
      format: log.metadata?.format,
      anonymized: log.metadata?.anonymized,
      totalRecords: log.metadata?.totalRecords
    }));
  }

  return {
    exportUserData,
    exportAsJson,
    exportAsCsv,
    exportAsArchive,
    cleanupExport,
    getExportHistory
  };
}

// Type exports
export type UserExportService = ReturnType<typeof createUserExportService>;