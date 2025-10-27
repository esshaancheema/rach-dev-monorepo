import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';
import { createHash } from 'crypto';

export interface DeviceFingerprintServiceDependencies {
  prisma: PrismaClient;
}

export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  platform?: string;
  browser?: string;
  browserVersion?: string;
  osVersion?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  colorDepth?: string;
  country?: string;
  city?: string;
  isp?: string;
}

export interface DeviceFingerprintResult {
  deviceId: string;
  isNewDevice: boolean;
  isTrusted: boolean;
  isBlocked: boolean;
  riskScore: number;
  riskFactors: string[];
  loginCount: number;
  lastLoginAt: Date;
}

export interface DeviceAnalytics {
  totalDevices: number;
  trustedDevices: number;
  blockedDevices: number;
  newDevicesLast30Days: number;
  suspiciousDevices: number;
  averageRiskScore: number;
}

export class DeviceFingerprintService {
  private readonly DEVICE_CACHE_PREFIX = 'device:';
  private readonly DEVICE_CACHE_TTL = 24 * 60 * 60; // 24 hours
  private readonly HIGH_RISK_THRESHOLD = 70;
  private readonly MEDIUM_RISK_THRESHOLD = 40;

  constructor(private deps: DeviceFingerprintServiceDependencies) {}

  /**
   * Generate or retrieve device fingerprint
   */
  async processDeviceFingerprint(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<DeviceFingerprintResult> {
    try {
      // Generate device ID based on device characteristics
      const deviceId = this.generateDeviceId(deviceInfo);
      
      // Check if device exists
      let device = await this.getDeviceFingerprint(deviceId);
      let isNewDevice = false;

      if (!device) {
        // Create new device fingerprint
        device = await this.createDeviceFingerprint(userId, deviceId, deviceInfo);
        isNewDevice = true;
      } else {
        // Update existing device
        device = await this.updateDeviceFingerprint(deviceId, deviceInfo);
      }

      // Calculate risk score
      const riskAnalysis = await this.calculateRiskScore(device, deviceInfo, isNewDevice);

      // Cache device info for quick access
      await this.cacheDeviceInfo(deviceId, device);

      logger.info('Device fingerprint processed:', {
        userId,
        deviceId,
        isNewDevice,
        riskScore: riskAnalysis.riskScore,
        isTrusted: device.isTrusted,
      });

      return {
        deviceId,
        isNewDevice,
        isTrusted: device.isTrusted,
        isBlocked: device.isBlocked,
        riskScore: riskAnalysis.riskScore,
        riskFactors: riskAnalysis.riskFactors,
        loginCount: device.loginCount,
        lastLoginAt: device.lastLoginAt,
      };
    } catch (error) {
      logger.error('Failed to process device fingerprint:', error);
      
      // Return safe defaults if fingerprinting fails
      return {
        deviceId: 'unknown',
        isNewDevice: true,
        isTrusted: false,
        isBlocked: false,
        riskScore: this.HIGH_RISK_THRESHOLD,
        riskFactors: ['FINGERPRINTING_FAILED'],
        loginCount: 1,
        lastLoginAt: new Date(),
      };
    }
  }

  /**
   * Mark device as trusted
   */
  async trustDevice(deviceId: string, userId: string): Promise<boolean> {
    try {
      await this.deps.prisma.deviceFingerprint.update({
        where: { deviceId },
        data: {
          isTrusted: true,
          riskScore: 0,
          updatedAt: new Date(),
        },
      });

      // Clear cache to force refresh
      await cacheManager.del(`${this.DEVICE_CACHE_PREFIX}${deviceId}`);

      logger.info('Device marked as trusted:', { deviceId, userId });
      return true;
    } catch (error) {
      logger.error('Failed to trust device:', { deviceId, userId, error });
      return false;
    }
  }

  /**
   * Block device
   */
  async blockDevice(deviceId: string, reason: string): Promise<boolean> {
    try {
      await this.deps.prisma.deviceFingerprint.update({
        where: { deviceId },
        data: {
          isBlocked: true,
          isTrusted: false,
          riskScore: 100,
          updatedAt: new Date(),
        },
      });

      // Clear cache
      await cacheManager.del(`${this.DEVICE_CACHE_PREFIX}${deviceId}`);

      logger.warn('Device blocked:', { deviceId, reason });
      return true;
    } catch (error) {
      logger.error('Failed to block device:', { deviceId, reason, error });
      return false;
    }
  }

  /**
   * Get user's devices
   */
  async getUserDevices(userId: string): Promise<any[]> {
    try {
      const devices = await this.deps.prisma.deviceFingerprint.findMany({
        where: { userId },
        orderBy: { lastLoginAt: 'desc' },
      });

      return devices.map(device => ({
        deviceId: device.deviceId,
        platform: device.platform,
        browser: device.browser,
        location: `${device.city || 'Unknown'}, ${device.country || 'Unknown'}`,
        isTrusted: device.isTrusted,
        isBlocked: device.isBlocked,
        riskScore: device.riskScore,
        loginCount: device.loginCount,
        lastLoginAt: device.lastLoginAt,
        firstSeenAt: device.firstSeenAt,
      }));
    } catch (error) {
      logger.error('Failed to get user devices:', { userId, error });
      return [];
    }
  }

  /**
   * Get device analytics for admin
   */
  async getDeviceAnalytics(userId?: string): Promise<DeviceAnalytics> {
    try {
      const whereClause = userId ? { userId } : {};
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [
        totalDevices,
        trustedDevices,
        blockedDevices,
        newDevicesLast30Days,
        allDevices,
      ] = await Promise.all([
        this.deps.prisma.deviceFingerprint.count({ where: whereClause }),
        
        this.deps.prisma.deviceFingerprint.count({
          where: { ...whereClause, isTrusted: true },
        }),
        
        this.deps.prisma.deviceFingerprint.count({
          where: { ...whereClause, isBlocked: true },
        }),
        
        this.deps.prisma.deviceFingerprint.count({
          where: {
            ...whereClause,
            firstSeenAt: { gte: last30Days },
          },
        }),
        
        this.deps.prisma.deviceFingerprint.findMany({
          where: whereClause,
          select: { riskScore: true },
        }),
      ]);

      const suspiciousDevices = allDevices.filter(d => d.riskScore >= this.MEDIUM_RISK_THRESHOLD).length;
      const averageRiskScore = allDevices.length > 0 
        ? Math.round(allDevices.reduce((sum, d) => sum + d.riskScore, 0) / allDevices.length)
        : 0;

      return {
        totalDevices,
        trustedDevices,
        blockedDevices,
        newDevicesLast30Days,
        suspiciousDevices,
        averageRiskScore,
      };
    } catch (error) {
      logger.error('Failed to get device analytics:', error);
      throw new Error('DEVICE_ANALYTICS_FAILED');
    }
  }

  /**
   * Generate device ID from device characteristics
   */
  private generateDeviceId(deviceInfo: DeviceInfo): string {
    const fingerprint = [
      deviceInfo.userAgent,
      deviceInfo.platform || '',
      deviceInfo.browser || '',
      deviceInfo.screenResolution || '',
      deviceInfo.timezone || '',
      deviceInfo.language || '',
      deviceInfo.colorDepth || '',
    ].join('|');

    return createHash('sha256').update(fingerprint).digest('hex').substring(0, 32);
  }

  /**
   * Create new device fingerprint
   */
  private async createDeviceFingerprint(
    userId: string,
    deviceId: string,
    deviceInfo: DeviceInfo
  ): Promise<any> {
    const device = await this.deps.prisma.deviceFingerprint.create({
      data: {
        userId,
        deviceId,
        userAgent: deviceInfo.userAgent,
        platform: deviceInfo.platform,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        osVersion: deviceInfo.osVersion,
        screenResolution: deviceInfo.screenResolution,
        timezone: deviceInfo.timezone,
        language: deviceInfo.language,
        colorDepth: deviceInfo.colorDepth,
        ipAddress: deviceInfo.ipAddress,
        country: deviceInfo.country,
        city: deviceInfo.city,
        isp: deviceInfo.isp,
        loginCount: 1,
        lastLoginAt: new Date(),
        firstSeenAt: new Date(),
      },
    });

    logger.info('New device fingerprint created:', {
      userId,
      deviceId,
      platform: deviceInfo.platform,
      browser: deviceInfo.browser,
      location: `${deviceInfo.city}, ${deviceInfo.country}`,
    });

    return device;
  }

  /**
   * Update existing device fingerprint
   */
  private async updateDeviceFingerprint(
    deviceId: string,
    deviceInfo: DeviceInfo
  ): Promise<any> {
    return await this.deps.prisma.deviceFingerprint.update({
      where: { deviceId },
      data: {
        ipAddress: deviceInfo.ipAddress,
        country: deviceInfo.country,
        city: deviceInfo.city,
        isp: deviceInfo.isp,
        loginCount: { increment: 1 },
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get device fingerprint from database
   */
  private async getDeviceFingerprint(deviceId: string): Promise<any | null> {
    // Try cache first
    const cached = await cacheManager.get(`${this.DEVICE_CACHE_PREFIX}${deviceId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to database
    const device = await this.deps.prisma.deviceFingerprint.findUnique({
      where: { deviceId },
    });

    if (device) {
      await this.cacheDeviceInfo(deviceId, device);
    }

    return device;
  }

  /**
   * Calculate risk score for device
   */
  private async calculateRiskScore(
    device: any,
    deviceInfo: DeviceInfo,
    isNewDevice: boolean
  ): Promise<{ riskScore: number; riskFactors: string[] }> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // New device risk
    if (isNewDevice) {
      riskScore += 30;
      riskFactors.push('NEW_DEVICE');
    }

    // Location change risk
    if (!isNewDevice && device.country && deviceInfo.country !== device.country) {
      riskScore += 25;
      riskFactors.push('LOCATION_CHANGE');
    }

    // IP address risk
    if (!isNewDevice && deviceInfo.ipAddress !== device.ipAddress) {
      riskScore += 15;
      riskFactors.push('IP_CHANGE');
    }

    // Browser/Platform change risk
    if (!isNewDevice) {
      if (deviceInfo.platform !== device.platform) {
        riskScore += 20;
        riskFactors.push('PLATFORM_CHANGE');
      }
      if (deviceInfo.browser !== device.browser) {
        riskScore += 15;
        riskFactors.push('BROWSER_CHANGE');
      }
    }

    // Unusual login pattern (too many logins in short time)
    if (!isNewDevice) {
      const recentLogins = await this.getRecentLoginCount(device.userId, 1); // last hour
      if (recentLogins > 10) {
        riskScore += 20;
        riskFactors.push('RAPID_LOGINS');
      }
    }

    // Known bad User-Agent patterns
    const suspiciousUA = this.checkSuspiciousUserAgent(deviceInfo.userAgent);
    if (suspiciousUA) {
      riskScore += 30;
      riskFactors.push('SUSPICIOUS_USER_AGENT');
    }

    // Already blocked device
    if (device.isBlocked) {
      riskScore = 100;
      riskFactors.push('BLOCKED_DEVICE');
    }

    // Trusted device reduces risk
    if (device.isTrusted) {
      riskScore = Math.max(0, riskScore - 40);
      riskFactors.push('TRUSTED_DEVICE');
    }

    // Cap risk score
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Update risk score in database
    if (!isNewDevice && riskScore !== device.riskScore) {
      await this.deps.prisma.deviceFingerprint.update({
        where: { deviceId: device.deviceId },
        data: { riskScore },
      });
    }

    return { riskScore, riskFactors };
  }

  /**
   * Get recent login count for risk calculation
   */
  private async getRecentLoginCount(userId: string, hours: number): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const count = await this.deps.prisma.loginAttempt.count({
      where: {
        userId,
        success: true,
        createdAt: { gte: since },
      },
    });

    return count;
  }

  /**
   * Check for suspicious user agent patterns
   */
  private checkSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /wget/i,
      /curl/i,
      /python/i,
      /java/i,
      /go-http/i,
      /okhttp/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Cache device information
   */
  private async cacheDeviceInfo(deviceId: string, device: any): Promise<void> {
    try {
      await cacheManager.setex(
        `${this.DEVICE_CACHE_PREFIX}${deviceId}`,
        this.DEVICE_CACHE_TTL,
        JSON.stringify(device)
      );
    } catch (error) {
      logger.error('Failed to cache device info:', { deviceId, error });
    }
  }

  /**
   * Clean up old device fingerprints
   */
  async cleanupOldDevices(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      
      const result = await this.deps.prisma.deviceFingerprint.deleteMany({
        where: {
          lastLoginAt: { lt: cutoffDate },
          isTrusted: false,
        },
      });

      logger.info('Old device fingerprints cleaned up:', {
        deletedCount: result.count,
        retentionDays,
      });

      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old devices:', error);
      return 0;
    }
  }
}

export function createDeviceFingerprintService(deps: DeviceFingerprintServiceDependencies): DeviceFingerprintService {
  return new DeviceFingerprintService(deps);
}