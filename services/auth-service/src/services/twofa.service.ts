import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaClient } from '@zoptal/database';
import { nanoid } from 'nanoid';
import { logger } from '../utils/logger';

export interface TwoFAServiceDependencies {
  prisma: PrismaClient;
}

export interface TwoFASetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface TwoFAVerificationResult {
  success: boolean;
  message: string;
  backupCodeUsed?: boolean;
}

export class TwoFAService {
  constructor(private deps: TwoFAServiceDependencies) {}

  /**
   * Setup 2FA for a user - generates secret, QR code, and backup codes
   */
  async setup2FA(userId: string, userEmail: string, appName = 'Zoptal'): Promise<TwoFASetupResult> {
    try {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: userEmail,
        issuer: appName,
        length: 32,
      });

      if (!secret.base32) {
        throw new Error('Failed to generate 2FA secret');
      }

      // Generate backup codes (8 codes, 8 characters each)
      const backupCodes = Array.from({ length: 8 }, () => 
        nanoid(8).toUpperCase().replace(/[0OIL]/g, () => {
          const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
          return chars[Math.floor(Math.random() * chars.length)];
        })
      );

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Store 2FA setup (but don't enable it yet)
      await this.deps.prisma.twoFactorAuth.upsert({
        where: { userId },
        create: {
          userId,
          secret: secret.base32,
          backupCodes: backupCodes.join(','),
          enabled: false,
          setupAt: new Date(),
        },
        update: {
          secret: secret.base32,
          backupCodes: backupCodes.join(','),
          enabled: false,
          setupAt: new Date(),
          enabledAt: null,
        },
      });

      logger.info('2FA setup initialized for user:', { userId, email: userEmail });

      return {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
        manualEntryKey: secret.base32,
      };
    } catch (error) {
      logger.error('Failed to setup 2FA:', error);
      throw new Error('Failed to setup 2FA');
    }
  }

  /**
   * Enable 2FA after user verifies they can generate valid codes
   */
  async enable2FA(userId: string, verificationCode: string): Promise<TwoFAVerificationResult> {
    try {
      // Get the 2FA record
      const twoFA = await this.deps.prisma.twoFactorAuth.findUnique({
        where: { userId },
      });

      if (!twoFA || !twoFA.secret) {
        return {
          success: false,
          message: '2FA is not set up for this user',
        };
      }

      if (twoFA.enabled) {
        return {
          success: false,
          message: '2FA is already enabled',
        };
      }

      // Verify the code
      const verified = speakeasy.totp.verify({
        secret: twoFA.secret,
        encoding: 'base32',
        token: verificationCode,
        window: 2, // Allow 2 time steps (60 seconds) tolerance
      });

      if (!verified) {
        return {
          success: false,
          message: 'Invalid verification code',
        };
      }

      // Enable 2FA
      await this.deps.prisma.twoFactorAuth.update({
        where: { userId },
        data: {
          enabled: true,
          enabledAt: new Date(),
        },
      });

      // Update user's 2FA status
      await this.deps.prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: true },
      });

      logger.info('2FA enabled for user:', { userId });

      return {
        success: true,
        message: '2FA has been successfully enabled',
      };
    } catch (error) {
      logger.error('Failed to enable 2FA:', error);
      return {
        success: false,
        message: 'Failed to enable 2FA',
      };
    }
  }

  /**
   * Disable 2FA for a user
   */
  async disable2FA(userId: string, verificationCode: string): Promise<TwoFAVerificationResult> {
    try {
      // Get the 2FA record
      const twoFA = await this.deps.prisma.twoFactorAuth.findUnique({
        where: { userId },
      });

      if (!twoFA || !twoFA.enabled) {
        return {
          success: false,
          message: '2FA is not enabled for this user',
        };
      }

      // Verify the code (either TOTP or backup code)
      const verification = await this.verify2FA(userId, verificationCode);
      
      if (!verification.success) {
        return {
          success: false,
          message: 'Invalid verification code',
        };
      }

      // Disable 2FA
      await this.deps.prisma.twoFactorAuth.delete({
        where: { userId },
      });

      // Update user's 2FA status
      await this.deps.prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: false },
      });

      logger.info('2FA disabled for user:', { userId });

      return {
        success: true,
        message: '2FA has been successfully disabled',
      };
    } catch (error) {
      logger.error('Failed to disable 2FA:', error);
      return {
        success: false,
        message: 'Failed to disable 2FA',
      };
    }
  }

  /**
   * Verify 2FA code (TOTP or backup code)
   */
  async verify2FA(userId: string, code: string): Promise<TwoFAVerificationResult> {
    try {
      const twoFA = await this.deps.prisma.twoFactorAuth.findUnique({
        where: { userId },
      });

      if (!twoFA || !twoFA.enabled || !twoFA.secret) {
        return {
          success: false,
          message: '2FA is not enabled for this user',
        };
      }

      const cleanCode = code.replace(/\s/g, ''); // Remove spaces

      // First, try TOTP verification
      const totpVerified = speakeasy.totp.verify({
        secret: twoFA.secret,
        encoding: 'base32',
        token: cleanCode,
        window: 2, // Allow 2 time steps (60 seconds) tolerance
      });

      if (totpVerified) {
        return {
          success: true,
          message: 'TOTP code verified successfully',
          backupCodeUsed: false,
        };
      }

      // If TOTP fails, check backup codes
      const backupCodes = twoFA.backupCodes ? twoFA.backupCodes.split(',') : [];
      const normalizedCode = cleanCode.toUpperCase();
      
      if (backupCodes.includes(normalizedCode)) {
        // Remove used backup code
        const updatedBackupCodes = backupCodes.filter(bc => bc !== normalizedCode);
        
        await this.deps.prisma.twoFactorAuth.update({
          where: { userId },
          data: {
            backupCodes: updatedBackupCodes.join(','),
            lastUsedAt: new Date(),
          },
        });

        logger.info('Backup code used for 2FA:', { userId, codesRemaining: updatedBackupCodes.length });

        return {
          success: true,
          message: 'Backup code verified successfully',
          backupCodeUsed: true,
        };
      }

      return {
        success: false,
        message: 'Invalid 2FA code',
      };
    } catch (error) {
      logger.error('Failed to verify 2FA:', error);
      return {
        success: false,
        message: 'Failed to verify 2FA code',
      };
    }
  }

  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(userId: string, verificationCode: string): Promise<{
    success: boolean;
    message: string;
    backupCodes?: string[];
  }> {
    try {
      // Verify current 2FA code first
      const verification = await this.verify2FA(userId, verificationCode);
      
      if (!verification.success) {
        return {
          success: false,
          message: 'Invalid verification code',
        };
      }

      // Generate new backup codes
      const newBackupCodes = Array.from({ length: 8 }, () => 
        nanoid(8).toUpperCase().replace(/[0OIL]/g, () => {
          const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
          return chars[Math.floor(Math.random() * chars.length)];
        })
      );

      // Update backup codes
      await this.deps.prisma.twoFactorAuth.update({
        where: { userId },
        data: {
          backupCodes: newBackupCodes.join(','),
        },
      });

      logger.info('Backup codes regenerated for user:', { userId });

      return {
        success: true,
        message: 'New backup codes generated successfully',
        backupCodes: newBackupCodes,
      };
    } catch (error) {
      logger.error('Failed to regenerate backup codes:', error);
      return {
        success: false,
        message: 'Failed to regenerate backup codes',
      };
    }
  }

  /**
   * Get 2FA status for a user
   */
  async get2FAStatus(userId: string): Promise<{
    enabled: boolean;
    setupAt?: Date;
    enabledAt?: Date;
    backupCodesCount: number;
    lastUsedAt?: Date;
  }> {
    try {
      const twoFA = await this.deps.prisma.twoFactorAuth.findUnique({
        where: { userId },
      });

      if (!twoFA) {
        return {
          enabled: false,
          backupCodesCount: 0,
        };
      }

      const backupCodesCount = twoFA.backupCodes ? twoFA.backupCodes.split(',').length : 0;

      return {
        enabled: twoFA.enabled,
        setupAt: twoFA.setupAt || undefined,
        enabledAt: twoFA.enabledAt || undefined,
        backupCodesCount,
        lastUsedAt: twoFA.lastUsedAt || undefined,
      };
    } catch (error) {
      logger.error('Failed to get 2FA status:', error);
      return {
        enabled: false,
        backupCodesCount: 0,
      };
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  async isUser2FAEnabled(userId: string): Promise<boolean> {
    try {
      const twoFA = await this.deps.prisma.twoFactorAuth.findUnique({
        where: { userId },
        select: { enabled: true },
      });

      return twoFA?.enabled || false;
    } catch (error) {
      logger.error('Failed to check 2FA status:', error);
      return false;
    }
  }
}

export const createTwoFAService = (deps: TwoFAServiceDependencies): TwoFAService => {
  return new TwoFAService(deps);
};