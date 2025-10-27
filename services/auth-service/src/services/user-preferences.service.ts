import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Preference schemas
export const notificationPreferencesSchema = z.object({
  email: z.object({
    marketing: z.boolean().default(false),
    updates: z.boolean().default(true),
    security: z.boolean().default(true),
    newsletter: z.boolean().default(false),
    productAnnouncements: z.boolean().default(true),
    tipsAndTricks: z.boolean().default(false)
  }),
  sms: z.object({
    marketing: z.boolean().default(false),
    security: z.boolean().default(true),
    reminders: z.boolean().default(false),
    twoFactor: z.boolean().default(true)
  }),
  push: z.object({
    enabled: z.boolean().default(false),
    desktop: z.boolean().default(false),
    mobile: z.boolean().default(false),
    sound: z.boolean().default(true),
    vibration: z.boolean().default(true)
  }),
  frequency: z.object({
    instant: z.array(z.enum(['security', 'critical'])).default(['security', 'critical']),
    daily: z.array(z.enum(['updates', 'social'])).default(['updates']),
    weekly: z.array(z.enum(['newsletter', 'summary'])).default(['newsletter']),
    never: z.array(z.enum(['marketing', 'promotions'])).default([])
  })
});

export const privacyPreferencesSchema = z.object({
  profileVisibility: z.enum(['public', 'friends', 'private']).default('private'),
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
  showLocation: z.boolean().default(false),
  showActivity: z.boolean().default(false),
  allowIndexing: z.boolean().default(false),
  dataCollection: z.object({
    analytics: z.boolean().default(true),
    personalization: z.boolean().default(true),
    advertising: z.boolean().default(false),
    improvement: z.boolean().default(true)
  }),
  thirdPartySharing: z.object({
    analytics: z.boolean().default(false),
    advertising: z.boolean().default(false),
    partners: z.boolean().default(false)
  })
});

export const accessibilityPreferencesSchema = z.object({
  highContrast: z.boolean().default(false),
  largeText: z.boolean().default(false),
  reduceMotion: z.boolean().default(false),
  screenReader: z.boolean().default(false),
  keyboardNavigation: z.boolean().default(false),
  colorBlindMode: z.enum(['none', 'protanopia', 'deuteranopia', 'tritanopia']).default('none')
});

export const appearancePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#007bff'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  compactMode: z.boolean().default(false),
  animations: z.boolean().default(true),
  layout: z.enum(['default', 'compact', 'comfortable']).default('default')
});

export const communicationPreferencesSchema = z.object({
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  firstDayOfWeek: z.enum(['sunday', 'monday']).default('sunday'),
  currency: z.string().default('USD')
});

export const securityPreferencesSchema = z.object({
  twoFactorAuth: z.object({
    enabled: z.boolean().default(false),
    method: z.enum(['app', 'sms', 'email']).default('app'),
    backupMethod: z.enum(['none', 'sms', 'email']).default('email')
  }),
  loginAlerts: z.boolean().default(true),
  unusualActivityAlerts: z.boolean().default(true),
  passwordExpiry: z.number().min(0).max(365).default(90), // days, 0 = never
  sessionTimeout: z.number().min(5).max(1440).default(30), // minutes
  requireReauthForSensitive: z.boolean().default(true),
  allowedIPs: z.array(z.string().ip()).default([]),
  blockedIPs: z.array(z.string().ip()).default([])
});

export const contentPreferencesSchema = z.object({
  interests: z.array(z.string()).default([]),
  blockedTopics: z.array(z.string()).default([]),
  contentRating: z.enum(['all', 'safe', 'moderate', 'strict']).default('moderate'),
  autoplay: z.object({
    videos: z.boolean().default(false),
    audio: z.boolean().default(false),
    gifs: z.boolean().default(true)
  }),
  defaultQuality: z.enum(['auto', 'low', 'medium', 'high']).default('auto')
});

// Combined preferences schema
export const userPreferencesSchema = z.object({
  notifications: notificationPreferencesSchema,
  privacy: privacyPreferencesSchema,
  accessibility: accessibilityPreferencesSchema,
  appearance: appearancePreferencesSchema,
  communication: communicationPreferencesSchema,
  security: securityPreferencesSchema,
  content: contentPreferencesSchema
});

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type PrivacyPreferences = z.infer<typeof privacyPreferencesSchema>;
export type AccessibilityPreferences = z.infer<typeof accessibilityPreferencesSchema>;
export type AppearancePreferences = z.infer<typeof appearancePreferencesSchema>;
export type CommunicationPreferences = z.infer<typeof communicationPreferencesSchema>;
export type SecurityPreferences = z.infer<typeof securityPreferencesSchema>;
export type ContentPreferences = z.infer<typeof contentPreferencesSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

interface UserPreferencesServiceDependencies {
  prisma: PrismaClient;
}

export function createUserPreferencesService({ prisma }: UserPreferencesServiceDependencies) {
  
  /**
   * Get default preferences
   */
  function getDefaultPreferences(): UserPreferences {
    return {
      notifications: notificationPreferencesSchema.parse({}),
      privacy: privacyPreferencesSchema.parse({}),
      accessibility: accessibilityPreferencesSchema.parse({}),
      appearance: appearancePreferencesSchema.parse({}),
      communication: communicationPreferencesSchema.parse({}),
      security: securityPreferencesSchema.parse({}),
      content: contentPreferencesSchema.parse({})
    };
  }

  /**
   * Get user preferences
   */
  async function getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId }
      });

      if (!profile || !profile.preferences) {
        return getDefaultPreferences();
      }

      // Merge stored preferences with defaults to ensure all fields exist
      const stored = profile.preferences as any;
      const defaults = getDefaultPreferences();

      return {
        notifications: { ...defaults.notifications, ...stored.notifications },
        privacy: { ...defaults.privacy, ...stored.privacy },
        accessibility: { ...defaults.accessibility, ...stored.accessibility },
        appearance: { ...defaults.appearance, ...stored.appearance },
        communication: { ...defaults.communication, ...stored.communication },
        security: { ...defaults.security, ...stored.security },
        content: { ...defaults.content, ...stored.content }
      };
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user preferences');
      return getDefaultPreferences();
    }
  }

  /**
   * Update user preferences
   */
  async function updateUserPreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      // Get current preferences
      const current = await getUserPreferences(userId);

      // Merge updates with current preferences
      const merged: UserPreferences = {
        notifications: updates.notifications 
          ? { ...current.notifications, ...updates.notifications }
          : current.notifications,
        privacy: updates.privacy
          ? { ...current.privacy, ...updates.privacy }
          : current.privacy,
        accessibility: updates.accessibility
          ? { ...current.accessibility, ...updates.accessibility }
          : current.accessibility,
        appearance: updates.appearance
          ? { ...current.appearance, ...updates.appearance }
          : current.appearance,
        communication: updates.communication
          ? { ...current.communication, ...updates.communication }
          : current.communication,
        security: updates.security
          ? { ...current.security, ...updates.security }
          : current.security,
        content: updates.content
          ? { ...current.content, ...updates.content }
          : current.content
      };

      // Validate merged preferences
      const validated = userPreferencesSchema.parse(merged);

      // Update in database
      await prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          preferences: validated
        },
        update: {
          preferences: validated
        }
      });

      // Log the update
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'PREFERENCES_UPDATED',
          category: 'SETTINGS',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: {
            updatedSections: Object.keys(updates)
          }
        }
      });

      logger.info({ userId, sections: Object.keys(updates) }, 'User preferences updated');

      return validated;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to update user preferences');
      throw error;
    }
  }

  /**
   * Update specific preference section
   */
  async function updatePreferenceSection<K extends keyof UserPreferences>(
    userId: string,
    section: K,
    updates: Partial<UserPreferences[K]>
  ): Promise<UserPreferences[K]> {
    const current = await getUserPreferences(userId);
    const merged = { [section]: { ...current[section], ...updates } };
    const updated = await updateUserPreferences(userId, merged);
    return updated[section];
  }

  /**
   * Reset preferences to defaults
   */
  async function resetPreferences(
    userId: string,
    sections?: (keyof UserPreferences)[]
  ): Promise<UserPreferences> {
    try {
      const defaults = getDefaultPreferences();
      
      if (sections && sections.length > 0) {
        // Reset only specified sections
        const current = await getUserPreferences(userId);
        const updates: Partial<UserPreferences> = {};
        
        for (const section of sections) {
          updates[section] = defaults[section];
        }
        
        return updateUserPreferences(userId, updates);
      } else {
        // Reset all preferences
        await prisma.userProfile.update({
          where: { userId },
          data: { preferences: defaults }
        });
        
        await prisma.activityLog.create({
          data: {
            userId,
            action: 'PREFERENCES_RESET',
            category: 'SETTINGS',
            ip: '127.0.0.1',
            userAgent: 'System',
            metadata: {
              sections: sections || 'all'
            }
          }
        });
        
        return defaults;
      }
    } catch (error) {
      logger.error({ error, userId }, 'Failed to reset preferences');
      throw error;
    }
  }

  /**
   * Apply privacy preset
   */
  async function applyPrivacyPreset(
    userId: string,
    preset: 'minimal' | 'balanced' | 'maximum'
  ): Promise<PrivacyPreferences> {
    let privacySettings: PrivacyPreferences;

    switch (preset) {
      case 'minimal':
        privacySettings = {
          profileVisibility: 'public',
          showEmail: true,
          showPhone: false,
          showLocation: true,
          showActivity: true,
          allowIndexing: true,
          dataCollection: {
            analytics: true,
            personalization: true,
            advertising: true,
            improvement: true
          },
          thirdPartySharing: {
            analytics: true,
            advertising: true,
            partners: true
          }
        };
        break;
      
      case 'maximum':
        privacySettings = {
          profileVisibility: 'private',
          showEmail: false,
          showPhone: false,
          showLocation: false,
          showActivity: false,
          allowIndexing: false,
          dataCollection: {
            analytics: false,
            personalization: false,
            advertising: false,
            improvement: false
          },
          thirdPartySharing: {
            analytics: false,
            advertising: false,
            partners: false
          }
        };
        break;
      
      default: // balanced
        privacySettings = {
          profileVisibility: 'friends',
          showEmail: false,
          showPhone: false,
          showLocation: false,
          showActivity: true,
          allowIndexing: false,
          dataCollection: {
            analytics: true,
            personalization: true,
            advertising: false,
            improvement: true
          },
          thirdPartySharing: {
            analytics: false,
            advertising: false,
            partners: false
          }
        };
    }

    return updatePreferenceSection(userId, 'privacy', privacySettings);
  }

  /**
   * Get notification channels for user
   */
  async function getEnabledNotificationChannels(
    userId: string,
    notificationType: string
  ): Promise<string[]> {
    const preferences = await getUserPreferences(userId);
    const channels: string[] = [];

    // Check email notifications
    if (preferences.notifications.email[notificationType as keyof typeof preferences.notifications.email]) {
      channels.push('email');
    }

    // Check SMS notifications
    if (preferences.notifications.sms[notificationType as keyof typeof preferences.notifications.sms]) {
      channels.push('sms');
    }

    // Check push notifications
    if (preferences.notifications.push.enabled) {
      channels.push('push');
    }

    return channels;
  }

  /**
   * Check if user wants to receive a specific notification
   */
  async function shouldSendNotification(
    userId: string,
    notificationType: string,
    channel: 'email' | 'sms' | 'push'
  ): Promise<boolean> {
    try {
      const preferences = await getUserPreferences(userId);
      
      switch (channel) {
        case 'email':
          return preferences.notifications.email[notificationType as keyof typeof preferences.notifications.email] || false;
        case 'sms':
          return preferences.notifications.sms[notificationType as keyof typeof preferences.notifications.sms] || false;
        case 'push':
          return preferences.notifications.push.enabled || false;
        default:
          return false;
      }
    } catch (error) {
      logger.error({ error, userId, notificationType, channel }, 'Failed to check notification preference');
      // Default to sending security notifications
      return notificationType === 'security';
    }
  }

  /**
   * Validate and sanitize preferences
   */
  function validatePreferences(preferences: any): UserPreferences {
    try {
      return userPreferencesSchema.parse(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn({ error: error.errors }, 'Invalid preferences provided');
        throw new Error('Invalid preferences format');
      }
      throw error;
    }
  }

  /**
   * Export preferences for data portability
   */
  async function exportPreferences(userId: string): Promise<object> {
    const preferences = await getUserPreferences(userId);
    
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      preferences
    };
  }

  /**
   * Import preferences from export
   */
  async function importPreferences(
    userId: string,
    data: any
  ): Promise<UserPreferences> {
    try {
      if (!data.preferences) {
        throw new Error('Invalid import format');
      }

      const validated = validatePreferences(data.preferences);
      
      await prisma.userProfile.update({
        where: { userId },
        data: { preferences: validated }
      });

      await prisma.activityLog.create({
        data: {
          userId,
          action: 'PREFERENCES_IMPORTED',
          category: 'SETTINGS',
          ip: '127.0.0.1',
          userAgent: 'System',
          metadata: {
            importVersion: data.version,
            importDate: data.exportDate
          }
        }
      });

      return validated;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to import preferences');
      throw error;
    }
  }

  return {
    getDefaultPreferences,
    getUserPreferences,
    updateUserPreferences,
    updatePreferenceSection,
    resetPreferences,
    applyPrivacyPreset,
    getEnabledNotificationChannels,
    shouldSendNotification,
    validatePreferences,
    exportPreferences,
    importPreferences
  };
}

// Type exports
export type UserPreferencesService = ReturnType<typeof createUserPreferencesService>;