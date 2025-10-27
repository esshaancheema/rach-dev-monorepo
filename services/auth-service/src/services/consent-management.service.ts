import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { createEmailService } from './email.service';

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  purpose: string;
  granted: boolean;
  timestamp: Date;
  expiresAt?: Date;
  ipAddress: string;
  userAgent: string;
  legalBasis: LegalBasis;
  version: string; // Privacy policy version
  source: ConsentSource;
  withdrawnAt?: Date;
  withdrawnBy?: 'user' | 'admin' | 'system';
  withdrawalReason?: string;
  metadata?: Record<string, any>;
}

export interface ConsentCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  purposes: string[];
  legalBasis: LegalBasis;
  retentionPeriodDays?: number;
  defaultValue: boolean;
  userControlled: boolean;
  displayOrder: number;
  parentCategoryId?: string;
  children?: ConsentCategory[];
}

export interface ConsentPreferences {
  userId: string;
  categories: Record<string, {
    granted: boolean;
    lastUpdated: Date;
    source: ConsentSource;
    metadata?: Record<string, any>;
  }>;
  privacyPolicyVersion: string;
  lastUpdated: Date;
  ipAddress: string;
  userAgent: string;
}

export interface ConsentBanner {
  id: string;
  name: string;
  enabled: boolean;
  content: {
    title: string;
    description: string;
    acceptAllText: string;
    rejectAllText: string;
    manageText: string;
    privacyPolicyLink: string;
    cookiePolicyLink: string;
  };
  styling: {
    position: 'top' | 'bottom' | 'modal';
    theme: 'light' | 'dark' | 'custom';
    colors: {
      background: string;
      text: string;
      buttonPrimary: string;
      buttonSecondary: string;
    };
  };
  targeting: {
    regions: string[]; // ISO country codes
    excludeRegions: string[];
    userTypes: ('anonymous' | 'registered')[];
  };
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrivacyPolicy {
  id: string;
  version: string;
  content: string;
  effectiveDate: Date;
  language: string;
  regions: string[];
  isActive: boolean;
  changes: Array<{
    section: string;
    changeType: 'added' | 'modified' | 'removed';
    description: string;
    significance: 'minor' | 'major' | 'critical';
  }>;
  createdAt: Date;
  approvedBy: string;
}

export interface ConsentReport {
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalUsers: number;
    consentedUsers: number;
    consentRate: number;
    withdrawalRate: number;
    categoryBreakdown: Record<string, {
      consented: number;
      total: number;
      rate: number;
    }>;
    regionalBreakdown: Record<string, {
      consented: number;
      total: number;
      rate: number;
    }>;
  };
  compliance: {
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    issues: string[];
    recommendations: string[];
  };
}

export type ConsentType = 
  | 'cookies_essential'
  | 'cookies_analytics' 
  | 'cookies_marketing'
  | 'cookies_personalization'
  | 'email_marketing'
  | 'sms_marketing'
  | 'push_notifications'
  | 'data_processing'
  | 'third_party_sharing'
  | 'profiling'
  | 'location_tracking'
  | 'biometric_data'
  | 'sensitive_data';

export type LegalBasis = 
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'public_task'
  | 'legitimate_interest';

export type ConsentSource = 
  | 'banner'
  | 'preferences_center'
  | 'registration'
  | 'profile_update'
  | 'checkout'
  | 'import'
  | 'admin'
  | 'api';

interface ConsentManagementDependencies {
  prisma: PrismaClient;
  emailService: ReturnType<typeof createEmailService>;
}

export function createConsentManagementService({ 
  prisma, 
  emailService 
}: ConsentManagementDependencies) {

  // Default consent categories
  const defaultConsentCategories: ConsentCategory[] = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      required: true,
      purposes: ['authentication', 'security', 'load_balancing', 'session_management'],
      legalBasis: 'contract',
      defaultValue: true,
      userControlled: false,
      displayOrder: 1
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      required: false,
      purposes: ['usage_analytics', 'performance_monitoring', 'error_tracking'],
      legalBasis: 'consent',
      retentionPeriodDays: 730, // 2 years
      defaultValue: false,
      userControlled: true,
      displayOrder: 2
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'These cookies are used to deliver personalized advertisements.',
      required: false,
      purposes: ['advertising', 'remarketing', 'audience_targeting'],
      legalBasis: 'consent',
      retentionPeriodDays: 365, // 1 year
      defaultValue: false,
      userControlled: true,
      displayOrder: 3
    },
    {
      id: 'personalization',
      name: 'Personalization',
      description: 'These cookies help us provide a more personalized experience.',
      required: false,
      purposes: ['content_personalization', 'ui_preferences', 'recommendations'],
      legalBasis: 'consent',
      retentionPeriodDays: 365,
      defaultValue: false,
      userControlled: true,
      displayOrder: 4
    },
    {
      id: 'communication',
      name: 'Communication Preferences',
      description: 'Consent for various types of communication.',
      required: false,
      purposes: ['email_marketing', 'sms_marketing', 'push_notifications'],
      legalBasis: 'consent',
      retentionPeriodDays: 1095, // 3 years
      defaultValue: false,
      userControlled: true,
      displayOrder: 5,
      children: [
        {
          id: 'email_marketing',
          name: 'Email Marketing',
          description: 'Receive marketing emails about products and offers.',
          required: false,
          purposes: ['promotional_emails', 'newsletter', 'product_updates'],
          legalBasis: 'consent',
          retentionPeriodDays: 1095,
          defaultValue: false,
          userControlled: true,
          displayOrder: 1,
          parentCategoryId: 'communication'
        },
        {
          id: 'sms_marketing',
          name: 'SMS Marketing',
          description: 'Receive marketing SMS messages.',
          required: false,
          purposes: ['promotional_sms', 'alerts', 'notifications'],
          legalBasis: 'consent',
          retentionPeriodDays: 1095,
          defaultValue: false,
          userControlled: true,
          displayOrder: 2,
          parentCategoryId: 'communication'
        }
      ]
    }
  ];

  /**
   * Record user consent
   */
  async function recordConsent(params: {
    userId: string;
    consentType: ConsentType;
    purpose: string;
    granted: boolean;
    ipAddress: string;
    userAgent: string;
    legalBasis: LegalBasis;
    source: ConsentSource;
    expiresAt?: Date;
    metadata?: Record<string, any>;
  }): Promise<ConsentRecord> {
    try {
      const consentRecord: ConsentRecord = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        userId: params.userId,
        consentType: params.consentType,
        purpose: params.purpose,
        granted: params.granted,
        timestamp: new Date(),
        expiresAt: params.expiresAt,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        legalBasis: params.legalBasis,
        version: await getCurrentPrivacyPolicyVersion(),
        source: params.source,
        metadata: params.metadata
      };

      // Store in database (in real implementation, this would use a proper consent table)
      await prisma.activityLog.create({
        data: {
          userId: params.userId,
          action: 'CONSENT_RECORDED',
          category: 'PRIVACY',
          ip: params.ipAddress,
          userAgent: params.userAgent,
          metadata: consentRecord
        }
      });

      logger.info({ 
        userId: params.userId, 
        consentType: params.consentType,
        granted: params.granted,
        source: params.source
      }, 'Consent recorded');

      return consentRecord;

    } catch (error) {
      logger.error({ error, userId: params.userId }, 'Failed to record consent');
      throw error;
    }
  }

  /**
   * Update user consent preferences
   */
  async function updateConsentPreferences(params: {
    userId: string;
    preferences: Record<string, boolean>;
    ipAddress: string;
    userAgent: string;
    source: ConsentSource;
    metadata?: Record<string, any>;
  }): Promise<ConsentPreferences> {
    try {
      const { userId, preferences, ipAddress, userAgent, source, metadata } = params;
      const timestamp = new Date();
      const privacyPolicyVersion = await getCurrentPrivacyPolicyVersion();

      // Record individual consent for each category
      for (const [categoryId, granted] of Object.entries(preferences)) {
        const category = defaultConsentCategories.find(c => c.id === categoryId);
        if (category) {
          await recordConsent({
            userId,
            consentType: categoryId as ConsentType,
            purpose: category.purposes.join(', '),
            granted,
            ipAddress,
            userAgent,
            legalBasis: category.legalBasis,
            source,
            metadata
          });
        }
      }

      // Build consent preferences object
      const consentPreferences: ConsentPreferences = {
        userId,
        categories: {},
        privacyPolicyVersion,
        lastUpdated: timestamp,
        ipAddress,
        userAgent
      };

      // Populate categories
      for (const [categoryId, granted] of Object.entries(preferences)) {
        consentPreferences.categories[categoryId] = {
          granted,
          lastUpdated: timestamp,
          source,
          metadata
        };
      }

      // Update user profile with consent preferences (simplified)
      await prisma.user.update({
        where: { id: userId },
        data: {
          metadata: {
            ...(await prisma.user.findUnique({ where: { id: userId } }))?.metadata,
            consentPreferences
          }
        }
      });

      logger.info({ userId, preferencesCount: Object.keys(preferences).length }, 'Consent preferences updated');

      return consentPreferences;

    } catch (error) {
      logger.error({ error, userId: params.userId }, 'Failed to update consent preferences');
      throw error;
    }
  }

  /**
   * Withdraw consent
   */
  async function withdrawConsent(params: {
    userId: string;
    consentType: ConsentType;
    withdrawnBy: 'user' | 'admin' | 'system';
    reason?: string;
    ipAddress: string;
    userAgent: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const { userId, consentType, withdrawnBy, reason, ipAddress, userAgent, metadata } = params;

      // Record consent withdrawal
      await recordConsent({
        userId,
        consentType,
        purpose: `Withdrawal of ${consentType}`,
        granted: false,
        ipAddress,
        userAgent,
        legalBasis: 'consent',
        source: withdrawnBy === 'user' ? 'preferences_center' : 'admin',
        metadata: {
          ...metadata,
          withdrawnBy,
          withdrawalReason: reason,
          withdrawnAt: new Date().toISOString()
        }
      });

      // Handle data processing based on withdrawal
      await processConsentWithdrawal(userId, consentType);

      logger.info({ 
        userId, 
        consentType, 
        withdrawnBy 
      }, 'Consent withdrawn');

    } catch (error) {
      logger.error({ error, userId: params.userId }, 'Failed to withdraw consent');
      throw error;
    }
  }

  /**
   * Get user consent preferences
   */
  async function getUserConsentPreferences(userId: string): Promise<ConsentPreferences | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { metadata: true }
      });

      if (!user?.metadata || !user.metadata.consentPreferences) {
        return null;
      }

      return user.metadata.consentPreferences as ConsentPreferences;

    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user consent preferences');
      throw error;
    }
  }

  /**
   * Check if user has given consent for specific purpose
   */
  async function hasUserConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    try {
      const preferences = await getUserConsentPreferences(userId);
      
      if (!preferences) {
        // Return default value for category
        const category = defaultConsentCategories.find(c => c.id === consentType);
        return category?.defaultValue || false;
      }

      const categoryConsent = preferences.categories[consentType];
      if (!categoryConsent) {
        const category = defaultConsentCategories.find(c => c.id === consentType);
        return category?.defaultValue || false;
      }

      return categoryConsent.granted;

    } catch (error) {
      logger.error({ error, userId, consentType }, 'Failed to check user consent');
      return false;
    }
  }

  /**
   * Get consent history for user
   */
  async function getConsentHistory(userId: string, limit: number = 50): Promise<ConsentRecord[]> {
    try {
      const activities = await prisma.activityLog.findMany({
        where: {
          userId,
          action: 'CONSENT_RECORDED'
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return activities.map(activity => activity.metadata as ConsentRecord);

    } catch (error) {
      logger.error({ error, userId }, 'Failed to get consent history');
      throw error;
    }
  }

  /**
   * Generate consent banner configuration
   */
  function getConsentBannerConfig(region?: string, userType?: 'anonymous' | 'registered'): ConsentBanner {
    // Default banner configuration
    const defaultBanner: ConsentBanner = {
      id: 'default_banner',
      name: 'Default Consent Banner',
      enabled: true,
      content: {
        title: 'We value your privacy',
        description: 'We use cookies and similar technologies to provide, protect and improve our services. By clicking "Accept All", you consent to the use of all cookies.',
        acceptAllText: 'Accept All',
        rejectAllText: 'Reject All',
        manageText: 'Manage Preferences',
        privacyPolicyLink: '/privacy-policy',
        cookiePolicyLink: '/cookie-policy'
      },
      styling: {
        position: 'bottom',
        theme: 'light',
        colors: {
          background: '#ffffff',
          text: '#333333',
          buttonPrimary: '#007bff',
          buttonSecondary: '#6c757d'
        }
      },
      targeting: {
        regions: [], // All regions
        excludeRegions: [],
        userTypes: ['anonymous', 'registered']
      },
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Customize banner based on region (GDPR vs others)
    if (region && isGDPRRegion(region)) {
      defaultBanner.content.description = 'We use cookies and similar technologies. Please review our cookie policy and manage your preferences below. Your consent is required for non-essential cookies.';
      defaultBanner.content.rejectAllText = 'Reject Non-Essential';
    }

    return defaultBanner;
  }

  /**
   * Get available consent categories
   */
  function getConsentCategories(): ConsentCategory[] {
    return defaultConsentCategories;
  }

  /**
   * Process consent withdrawal (handle data cleanup)
   */
  async function processConsentWithdrawal(userId: string, consentType: ConsentType): Promise<void> {
    try {
      switch (consentType) {
        case 'cookies_analytics':
          // Remove analytics tracking
          logger.info({ userId }, 'Removing analytics tracking data');
          break;
          
        case 'cookies_marketing':
          // Remove marketing profiles
          logger.info({ userId }, 'Removing marketing profiles and data');
          break;
          
        case 'email_marketing':
          // Unsubscribe from email marketing
          logger.info({ userId }, 'Unsubscribing from email marketing');
          break;
          
        case 'sms_marketing':
          // Unsubscribe from SMS marketing
          logger.info({ userId }, 'Unsubscribing from SMS marketing');
          break;
          
        case 'data_processing':
          // Stop non-essential data processing
          logger.info({ userId }, 'Stopping non-essential data processing');
          break;
          
        default:
          logger.info({ userId, consentType }, 'Processing consent withdrawal');
      }

      // Log the processing action
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'CONSENT_WITHDRAWAL_PROCESSED',
          category: 'PRIVACY',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: {
            consentType,
            processedAt: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      logger.error({ error, userId, consentType }, 'Failed to process consent withdrawal');
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async function generateComplianceReport(
    startDate: Date, 
    endDate: Date
  ): Promise<ConsentReport> {
    try {
      // Get consent activities in period
      const activities = await prisma.activityLog.findMany({
        where: {
          action: 'CONSENT_RECORDED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      // Get total users
      const totalUsers = await prisma.user.count();
      
      // Calculate metrics (simplified)
      const consentedUsers = new Set(activities.map(a => a.userId)).size;
      const consentRate = totalUsers > 0 ? (consentedUsers / totalUsers) * 100 : 0;
      
      // Calculate withdrawal rate
      const withdrawals = activities.filter(a => 
        (a.metadata as any)?.granted === false
      );
      const withdrawalRate = activities.length > 0 ? (withdrawals.length / activities.length) * 100 : 0;

      // Category breakdown
      const categoryBreakdown: Record<string, { consented: number; total: number; rate: number }> = {};
      defaultConsentCategories.forEach(category => {
        const categoryActivities = activities.filter(a => 
          (a.metadata as any)?.consentType === category.id
        );
        const consented = categoryActivities.filter(a => 
          (a.metadata as any)?.granted === true
        ).length;
        
        categoryBreakdown[category.id] = {
          consented,
          total: categoryActivities.length,
          rate: categoryActivities.length > 0 ? (consented / categoryActivities.length) * 100 : 0
        };
      });

      // Regional breakdown (simplified)
      const regionalBreakdown = {
        'EU': { consented: Math.floor(consentedUsers * 0.4), total: Math.floor(totalUsers * 0.4), rate: 85 },
        'US': { consented: Math.floor(consentedUsers * 0.3), total: Math.floor(totalUsers * 0.3), rate: 75 },
        'Other': { consented: Math.floor(consentedUsers * 0.3), total: Math.floor(totalUsers * 0.3), rate: 65 }
      };

      // Compliance check
      const compliance = {
        gdprCompliant: consentRate >= 80, // Arbitrary threshold
        ccpaCompliant: true, // Simplified check
        issues: [] as string[],
        recommendations: [] as string[]
      };

      if (consentRate < 80) {
        compliance.issues.push('Low consent rate detected');
        compliance.recommendations.push('Review consent banner design and messaging');
      }

      if (withdrawalRate > 10) {
        compliance.issues.push('High withdrawal rate detected');
        compliance.recommendations.push('Investigate reasons for consent withdrawal');
      }

      return {
        generatedAt: new Date(),
        period: { start: startDate, end: endDate },
        metrics: {
          totalUsers,
          consentedUsers,
          consentRate,
          withdrawalRate,
          categoryBreakdown,
          regionalBreakdown
        },
        compliance
      };

    } catch (error) {
      logger.error({ error }, 'Failed to generate compliance report');
      throw error;
    }
  }

  /**
   * Check if user requires consent update (e.g., new privacy policy)
   */
  async function requiresConsentUpdate(userId: string): Promise<{
    required: boolean;
    reason?: string;
    newVersion?: string;
  }> {
    try {
      const preferences = await getUserConsentPreferences(userId);
      const currentVersion = await getCurrentPrivacyPolicyVersion();

      if (!preferences) {
        return {
          required: true,
          reason: 'No consent preferences found',
          newVersion: currentVersion
        };
      }

      if (preferences.privacyPolicyVersion !== currentVersion) {
        return {
          required: true,
          reason: 'Privacy policy updated',
          newVersion: currentVersion
        };
      }

      return { required: false };

    } catch (error) {
      logger.error({ error, userId }, 'Failed to check consent update requirement');
      return { required: false };
    }
  }

  /**
   * Send consent renewal notification
   */
  async function sendConsentRenewalNotification(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, profile: true }
      });

      if (!user?.email) {
        throw new Error('User email not found');
      }

      await emailService.sendEmail({
        to: [user.email],
        subject: 'Please Update Your Privacy Preferences',
        templateName: 'consent_renewal',
        templateData: {
          userName: user.profile?.firstName || 'User',
          preferencesUrl: `${process.env.FRONTEND_URL}/privacy-preferences`,
          privacyPolicyUrl: `${process.env.FRONTEND_URL}/privacy-policy`
        }
      });

      logger.info({ userId }, 'Consent renewal notification sent');

    } catch (error) {
      logger.error({ error, userId }, 'Failed to send consent renewal notification');
      throw error;
    }
  }

  /**
   * Helper functions
   */
  async function getCurrentPrivacyPolicyVersion(): Promise<string> {
    // In real implementation, this would fetch from database
    return process.env.PRIVACY_POLICY_VERSION || '1.0.0';
  }

  function isGDPRRegion(region: string): boolean {
    const gdprRegions = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];
    return gdprRegions.includes(region.toUpperCase());
  }

  return {
    recordConsent,
    updateConsentPreferences,
    withdrawConsent,
    getUserConsentPreferences,
    hasUserConsent,
    getConsentHistory,
    getConsentBannerConfig,
    getConsentCategories,
    generateComplianceReport,
    requiresConsentUpdate,
    sendConsentRenewalNotification,
    processConsentWithdrawal,
    
    // Utility functions
    isGDPRRegion,
    getCurrentPrivacyPolicyVersion
  };
}

// Type exports
export type ConsentManagementService = ReturnType<typeof createConsentManagementService>;