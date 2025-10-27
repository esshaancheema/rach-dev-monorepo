import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { NotificationRedisService } from '../utils/redis';

interface UserSegment {
  filter: 'all' | 'active' | 'inactive' | 'premium' | 'trial';
  customQuery?: {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'nin';
    value: any;
  };
}

export class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getUserWithPreferences(userId: string) {
    try {
      // Check cache first
      const cached = await NotificationRedisService.getCachedUser(userId);
      if (cached) {
        return cached;
      }

      // Fetch from database
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          notificationPreferences: true,
          devices: {
            where: {
              active: true,
              pushToken: { not: null },
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      // Transform preferences to a more usable format
      const preferences = this.transformPreferences(user.notificationPreferences);

      const userData = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        notificationPreferences: preferences,
        devices: user.devices,
        locale: user.locale || 'en',
        timezone: user.timezone || 'UTC',
      };

      // Cache for 5 minutes
      await NotificationRedisService.cacheUser(userId, userData, 300);

      return userData;
    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user with preferences');
      throw error;
    }
  }

  async getUserIdsInSegment(segment: UserSegment): Promise<string[]> {
    try {
      let where: any = {};

      // Apply base filter
      switch (segment.filter) {
        case 'active':
          where = {
            status: 'active',
            lastActivityAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
            },
          };
          break;
        
        case 'inactive':
          where = {
            OR: [
              { status: 'inactive' },
              {
                lastActivityAt: {
                  lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            ],
          };
          break;
        
        case 'premium':
          where = {
            subscription: {
              plan: { in: ['pro', 'enterprise'] },
              status: 'active',
            },
          };
          break;
        
        case 'trial':
          where = {
            subscription: {
              plan: 'trial',
              status: 'active',
            },
          };
          break;
        
        case 'all':
        default:
          where = { status: { not: 'deleted' } };
          break;
      }

      // Apply custom query if provided
      if (segment.customQuery) {
        const { field, operator, value } = segment.customQuery;
        
        switch (operator) {
          case 'eq':
            where[field] = value;
            break;
          case 'ne':
            where[field] = { not: value };
            break;
          case 'gt':
            where[field] = { gt: value };
            break;
          case 'lt':
            where[field] = { lt: value };
            break;
          case 'in':
            where[field] = { in: value };
            break;
          case 'nin':
            where[field] = { notIn: value };
            break;
        }
      }

      // Fetch user IDs
      const users = await this.prisma.user.findMany({
        where,
        select: { id: true },
      });

      return users.map(u => u.id);
    } catch (error) {
      logger.error({ error, segment }, 'Failed to get users in segment');
      throw error;
    }
  }

  async countUsersInSegment(segment: UserSegment): Promise<number> {
    try {
      const userIds = await this.getUserIdsInSegment(segment);
      return userIds.length;
    } catch (error) {
      logger.error({ error, segment }, 'Failed to count users in segment');
      throw error;
    }
  }

  async getUsersWithDigestPreference(frequency: 'daily' | 'weekly') {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          status: 'active',
          notificationPreferences: {
            some: {
              channel: 'email',
              key: 'digestFrequency',
              value: frequency,
            },
          },
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          locale: true,
          timezone: true,
        },
      });

      return users;
    } catch (error) {
      logger.error({ error, frequency }, 'Failed to get users with digest preference');
      throw error;
    }
  }

  async updateNotificationPreference(
    userId: string,
    channel: string,
    key: string,
    value: any
  ) {
    try {
      await this.prisma.notificationPreference.upsert({
        where: {
          userId_channel_key: {
            userId,
            channel,
            key,
          },
        },
        update: { value },
        create: {
          userId,
          channel,
          key,
          value,
        },
      });

      // Invalidate cache
      await NotificationRedisService.invalidateUserCache(userId);

      return true;
    } catch (error) {
      logger.error({ error, userId, channel, key }, 'Failed to update notification preference');
      throw error;
    }
  }

  async getUnsubscribeToken(token: string) {
    try {
      const data = await NotificationRedisService.getUnsubscribeToken(token);
      if (!data) {
        // Check database for permanent unsubscribe
        const unsubscribe = await this.prisma.unsubscribe.findUnique({
          where: { token },
        });
        
        if (!unsubscribe || unsubscribe.used) {
          return null;
        }

        return {
          userId: unsubscribe.userId,
          channel: unsubscribe.channel,
          category: unsubscribe.category,
        };
      }

      return data;
    } catch (error) {
      logger.error({ error, token }, 'Failed to get unsubscribe token');
      throw error;
    }
  }

  async processUnsubscribe(token: string) {
    try {
      const data = await this.getUnsubscribeToken(token);
      if (!data) {
        return false;
      }

      const { userId, channel, category } = data;

      if (category) {
        // Unsubscribe from specific category
        await this.updateNotificationPreference(
          userId,
          channel,
          `categories.${category}`,
          false
        );
      } else {
        // Unsubscribe from entire channel
        await this.updateNotificationPreference(
          userId,
          channel,
          'enabled',
          false
        );
      }

      // Mark token as used
      await this.prisma.unsubscribe.update({
        where: { token },
        data: { 
          used: true,
          usedAt: new Date(),
        },
      });

      // Track unsubscribe
      await NotificationRedisService.trackUnsubscribe(userId, channel, category);

      return true;
    } catch (error) {
      logger.error({ error, token }, 'Failed to process unsubscribe');
      throw error;
    }
  }

  private transformPreferences(preferences: any[]): Record<string, any> {
    const transformed: Record<string, any> = {};

    for (const pref of preferences) {
      if (!transformed[pref.channel]) {
        transformed[pref.channel] = {};
      }

      // Handle nested keys (e.g., categories.marketing)
      const keys = pref.key.split('.');
      let current = transformed[pref.channel];

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = pref.value;
    }

    // Apply defaults
    const channels = ['email', 'sms', 'push', 'in-app'];
    for (const channel of channels) {
      if (!transformed[channel]) {
        transformed[channel] = {};
      }

      // Default to enabled if not specified
      if (transformed[channel].enabled === undefined) {
        transformed[channel].enabled = true;
      }

      // Default categories
      if (!transformed[channel].categories) {
        transformed[channel].categories = {
          marketing: true,
          security: true,
          updates: true,
          social: true,
        };
      }
    }

    return transformed;
  }
}