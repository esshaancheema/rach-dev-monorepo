import { PrismaClient, TrustLevel } from '@zoptal/database';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';
import { createServiceError } from '../middleware/error-handler';
import { createHash, randomBytes } from 'crypto';
import { UAParser } from 'ua-parser-js';

export interface DeviceTrustServiceDependencies {
  prisma: PrismaClient;
}

export interface CreateDeviceTrustOptions {
  userId: string;
  ipAddress: string;
  userAgent: string;
  trustLevel?: TrustLevel;
  trustDurationDays?: number;
  deviceName?: string;
}

export interface VerifyDeviceTrustOptions {
  userId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
}

export interface DeviceTrustResult {
  success: boolean;
  message: string;
  trustToken?: string;
  deviceId?: string;
  expiresAt?: Date;
}

export interface DeviceTrustVerification {
  trusted: boolean;
  trustLevel: TrustLevel;
  deviceInfo?: any;
  lastUsed?: Date;
  requiresReauth?: boolean;
}

export class DeviceTrustService {
  private readonly DEFAULT_TRUST_DAYS = 30; // 30 days default trust
  private readonly MAX_TRUSTED_DEVICES = 10; // Maximum trusted devices per user
  private readonly HIGH_TRUST_DAYS = 90; // High trust devices last longer
  private readonly BIOMETRIC_TRUST_DAYS = 180; // Biometric devices last even longer

  constructor(private deps: DeviceTrustServiceDependencies) {}

  /**
   * Generate a secure device fingerprint from request data
   */
  generateDeviceFingerprint(ipAddress: string, userAgent: string): string {
    // Create a fingerprint based on IP and user agent
    const fingerprint = createHash('sha256')
      .update(`${ipAddress}:${userAgent}`)
      .digest('hex');
    return fingerprint;
  }

  /**
   * Generate a secure trust token
   */
  private generateTrustToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Parse device information from user agent
   */
  private parseDeviceInfo(userAgent: string): any {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    return {
      browser: {
        name: result.browser.name,
        version: result.browser.version,
      },
      os: {
        name: result.os.name,
        version: result.os.version,
      },
      device: {
        type: result.device.type || 'desktop',
        model: result.device.model,
        vendor: result.device.vendor,
      },
      engine: {
        name: result.engine.name,
        version: result.engine.version,
      }
    };
  }

  /**
   * Create a trusted device entry
   */
  async createDeviceTrust(options: CreateDeviceTrustOptions): Promise<DeviceTrustResult> {
    try {
      const {
        userId,
        ipAddress,
        userAgent,
        trustLevel = TrustLevel.BASIC,
        trustDurationDays,
        deviceName
      } = options;

      // Generate device fingerprint
      const deviceFingerprint = this.generateDeviceFingerprint(ipAddress, userAgent);
      
      // Check if device already exists for this user
      const existingDevice = await this.deps.prisma.deviceTrust.findFirst({
        where: {
          userId,
          deviceId: deviceFingerprint
        }
      });

      if (existingDevice) {
        // Update existing device trust
        const expiresAt = this.calculateExpiryDate(trustLevel, trustDurationDays);
        
        const updated = await this.deps.prisma.deviceTrust.update({
          where: { id: existingDevice.id },
          data: {
            trustLevel,
            expiresAt,
            lastUsedAt: new Date(),
            ipAddress,
            userAgent,
          }
        });

        logger.info({
          userId,
          deviceId: deviceFingerprint.substring(0, 8) + '***',
          trustLevel,
        }, 'Device trust updated');

        return {
          success: true,
          message: 'Device trust updated successfully',
          trustToken: updated.trustToken,
          deviceId: deviceFingerprint,
          expiresAt: updated.expiresAt,
        };
      }

      // Check device limit
      const userDeviceCount = await this.deps.prisma.deviceTrust.count({
        where: {
          userId,
          expiresAt: { gt: new Date() }
        }
      });

      if (userDeviceCount >= this.MAX_TRUSTED_DEVICES) {
        // Remove oldest device
        const oldestDevice = await this.deps.prisma.deviceTrust.findFirst({
          where: {
            userId,
            expiresAt: { gt: new Date() }
          },
          orderBy: { lastUsedAt: 'asc' }
        });

        if (oldestDevice) {
          await this.deps.prisma.deviceTrust.delete({
            where: { id: oldestDevice.id }
          });
          
          logger.info({
            userId,
            removedDeviceId: oldestDevice.deviceId?.substring(0, 8) + '***',
          }, 'Oldest trusted device removed due to limit');
        }
      }

      // Create new device trust
      const trustToken = this.generateTrustToken();
      const expiresAt = this.calculateExpiryDate(trustLevel, trustDurationDays);
      const deviceInfo = this.parseDeviceInfo(userAgent);

      const deviceTrust = await this.deps.prisma.deviceTrust.create({
        data: {
          userId,
          deviceId: deviceFingerprint,
          trustToken,
          trustLevel,
          expiresAt,
          deviceInfo,
          ipAddress,
          userAgent,
          deviceName: deviceName || this.generateDeviceName(deviceInfo),
          lastUsedAt: new Date(),
        }
      });

      // Cache the trust token for quick lookup
      await cacheManager.setex(
        `device_trust:${trustToken}`,
        this.getTrustDurationSeconds(trustLevel, trustDurationDays),
        JSON.stringify({
          userId,
          deviceId: deviceFingerprint,
          trustLevel,
          expiresAt: expiresAt.toISOString(),
        })
      );

      logger.info({
        userId,
        deviceId: deviceFingerprint.substring(0, 8) + '***',
        trustLevel,
        expiresAt,
      }, 'New device trust created');

      return {
        success: true,
        message: 'Device marked as trusted',
        trustToken,
        deviceId: deviceFingerprint,
        expiresAt,
      };

    } catch (error) {
      logger.error('Failed to create device trust:', error);
      return {
        success: false,
        message: 'Failed to mark device as trusted',
      };
    }
  }

  /**
   * Verify if a device is trusted
   */
  async verifyDeviceTrust(options: VerifyDeviceTrustOptions): Promise<DeviceTrustVerification> {
    try {
      const { userId, deviceFingerprint, ipAddress, userAgent } = options;

      // First check database
      const deviceTrust = await this.deps.prisma.deviceTrust.findFirst({
        where: {
          userId,
          deviceId: deviceFingerprint,
          expiresAt: { gt: new Date() }
        }
      });

      if (!deviceTrust) {
        return {
          trusted: false,
          trustLevel: TrustLevel.BASIC,
          requiresReauth: true
        };
      }

      // Check if device needs to be refreshed due to different IP/UserAgent
      const requiresReauth = this.shouldRequireReauth(deviceTrust, ipAddress, userAgent);

      // Update last used
      await this.deps.prisma.deviceTrust.update({
        where: { id: deviceTrust.id },
        data: {
          lastUsedAt: new Date(),
          ipAddress,
          userAgent,
        }
      });

      logger.info({
        userId,
        deviceId: deviceFingerprint.substring(0, 8) + '***',
        trustLevel: deviceTrust.trustLevel,
        requiresReauth,
      }, 'Device trust verified');

      return {
        trusted: true,
        trustLevel: deviceTrust.trustLevel,
        deviceInfo: deviceTrust.deviceInfo,
        lastUsed: deviceTrust.lastUsedAt,
        requiresReauth,
      };

    } catch (error) {
      logger.error('Failed to verify device trust:', error);
      return {
        trusted: false,
        trustLevel: TrustLevel.BASIC,
        requiresReauth: true
      };
    }
  }

  /**
   * Get all trusted devices for a user
   */
  async getUserTrustedDevices(userId: string): Promise<Array<{
    id: string;
    deviceName: string;
    deviceInfo: any;
    trustLevel: TrustLevel;
    lastUsedAt: Date;
    createdAt: Date;
    expiresAt: Date;
    ipAddress: string;
    isCurrentSession: boolean;
  }>> {
    try {
      const devices = await this.deps.prisma.deviceTrust.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() }
        },
        orderBy: { lastUsedAt: 'desc' }
      });

      return devices.map(device => ({
        id: device.id,
        deviceName: device.deviceName || 'Unknown Device',
        deviceInfo: device.deviceInfo,
        trustLevel: device.trustLevel,
        lastUsedAt: device.lastUsedAt,
        createdAt: device.createdAt,
        expiresAt: device.expiresAt,
        ipAddress: device.ipAddress || '',
        isCurrentSession: false // This would need to be determined from session
      }));

    } catch (error) {
      logger.error('Failed to get user trusted devices:', error);
      return [];
    }
  }

  /**
   * Remove device trust
   */
  async removeDeviceTrust(userId: string, deviceId: string): Promise<boolean> {
    try {
      const device = await this.deps.prisma.deviceTrust.findFirst({
        where: {
          userId,
          id: deviceId
        }
      });

      if (!device) {
        return false;
      }

      await this.deps.prisma.deviceTrust.delete({
        where: { id: deviceId }
      });

      // Remove from cache
      await cacheManager.del(`device_trust:${device.trustToken}`);

      logger.info({
        userId,
        deviceId: device.deviceId?.substring(0, 8) + '***',
      }, 'Device trust removed');

      return true;

    } catch (error) {
      logger.error('Failed to remove device trust:', error);
      return false;
    }
  }

  /**
   * Clean up expired device trusts
   */
  async cleanupExpiredTrusts(): Promise<number> {
    const result = await this.deps.prisma.deviceTrust.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });

    if (result.count > 0) {
      logger.info({ count: result.count }, 'Cleaned up expired device trusts');
    }

    return result.count;
  }

  /**
   * Calculate expiry date based on trust level
   */
  private calculateExpiryDate(trustLevel: TrustLevel, customDays?: number): Date {
    const days = customDays || this.getDefaultTrustDays(trustLevel);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  /**
   * Get default trust duration in days
   */
  private getDefaultTrustDays(trustLevel: TrustLevel): number {
    switch (trustLevel) {
      case TrustLevel.HIGH:
        return this.HIGH_TRUST_DAYS;
      case TrustLevel.BIOMETRIC:
        return this.BIOMETRIC_TRUST_DAYS;
      case TrustLevel.ADMIN:
        return this.BIOMETRIC_TRUST_DAYS;
      default:
        return this.DEFAULT_TRUST_DAYS;
    }
  }

  /**
   * Get trust duration in seconds for caching
   */
  private getTrustDurationSeconds(trustLevel: TrustLevel, customDays?: number): number {
    const days = customDays || this.getDefaultTrustDays(trustLevel);
    return days * 24 * 60 * 60;
  }

  /**
   * Generate a friendly device name
   */
  private generateDeviceName(deviceInfo: any): string {
    const browser = deviceInfo.browser?.name || 'Unknown Browser';
    const os = deviceInfo.os?.name || 'Unknown OS';
    const deviceType = deviceInfo.device?.type || 'desktop';
    
    return `${browser} on ${os} (${deviceType})`;
  }

  /**
   * Check if device should require re-authentication
   */
  private shouldRequireReauth(
    deviceTrust: any, 
    currentIpAddress: string, 
    currentUserAgent: string
  ): boolean {
    // High and biometric trust levels are more permissive
    if (deviceTrust.trustLevel === TrustLevel.HIGH || 
        deviceTrust.trustLevel === TrustLevel.BIOMETRIC ||
        deviceTrust.trustLevel === TrustLevel.ADMIN) {
      return false;
    }

    // For basic trust, check for significant changes
    const ipChanged = deviceTrust.ipAddress !== currentIpAddress;
    const userAgentChanged = deviceTrust.userAgent !== currentUserAgent;
    
    // Require reauth if both IP and user agent changed (possible device sharing/compromise)
    return ipChanged && userAgentChanged;
  }

  /**
   * Get device trust statistics
   */
  async getDeviceTrustStats(): Promise<{
    totalTrustedDevices: number;
    trustsByLevel: Array<{ trustLevel: string; count: number }>;
    expiringSoon: number;
    averageDevicesPerUser: number;
  }> {
    try {
      const totalTrustedDevices = await this.deps.prisma.deviceTrust.count({
        where: { expiresAt: { gt: new Date() } }
      });

      const trustsByLevel = await this.deps.prisma.deviceTrust.groupBy({
        by: ['trustLevel'],
        where: { expiresAt: { gt: new Date() } },
        _count: { trustLevel: true }
      });

      const expiringSoon = await this.deps.prisma.deviceTrust.count({
        where: {
          expiresAt: {
            gt: new Date(),
            lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        }
      });

      const usersWithDevices = await this.deps.prisma.deviceTrust.groupBy({
        by: ['userId'],
        where: { expiresAt: { gt: new Date() } },
        _count: { userId: true }
      });

      const averageDevicesPerUser = usersWithDevices.length > 0 
        ? totalTrustedDevices / usersWithDevices.length 
        : 0;

      return {
        totalTrustedDevices,
        trustsByLevel: trustsByLevel.map(item => ({
          trustLevel: item.trustLevel,
          count: item._count.trustLevel
        })),
        expiringSoon,
        averageDevicesPerUser: Math.round(averageDevicesPerUser * 100) / 100
      };

    } catch (error) {
      logger.error('Failed to get device trust statistics:', error);
      return {
        totalTrustedDevices: 0,
        trustsByLevel: [],
        expiringSoon: 0,
        averageDevicesPerUser: 0
      };
    }
  }
}

export function createDeviceTrustService(deps: DeviceTrustServiceDependencies): DeviceTrustService {
  return new DeviceTrustService(deps);
}