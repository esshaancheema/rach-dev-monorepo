import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface AvatarUpload {
  userId: string;
  file: {
    filename: string;
    mimetype: string;
    encoding: string;
    file: NodeJS.ReadableStream;
  };
  metadata?: {
    source?: 'upload' | 'social' | 'gravatar' | 'admin';
    originalName?: string;
    uploadedBy?: string;
  };
}

export interface AvatarRecord {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  variants: AvatarVariant[];
  url: string;
  isActive: boolean;
  source: 'upload' | 'social' | 'gravatar' | 'admin';
  uploadedAt: Date;
  uploadedBy: string;
  metadata?: Record<string, any>;
}

export interface AvatarVariant {
  size: number; // square dimensions
  filename: string;
  url: string;
  format: 'jpeg' | 'webp' | 'png';
  quality: number;
  fileSize: number;
}

export interface AvatarConfig {
  uploadDir: string;
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
  variants: Array<{
    size: number;
    quality: number;
    format: 'jpeg' | 'webp' | 'png';
  }>;
  defaultVariantSize: number;
  enableWebP: boolean;
  enableCDN: boolean;
  cdnBaseUrl?: string;
  enableGravatar: boolean;
  gravatarDefault: 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank';
}

interface AvatarServiceDependencies {
  prisma: PrismaClient;
  config: AvatarConfig;
}

// Default configuration
const defaultAvatarConfig: AvatarConfig = {
  uploadDir: process.env.AVATAR_UPLOAD_DIR || './uploads/avatars',
  maxFileSize: parseInt(process.env.AVATAR_MAX_FILE_SIZE || '5242880'), // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  variants: [
    { size: 32, quality: 85, format: 'jpeg' },
    { size: 64, quality: 85, format: 'jpeg' },
    { size: 128, quality: 90, format: 'jpeg' },
    { size: 256, quality: 90, format: 'jpeg' },
    { size: 512, quality: 95, format: 'jpeg' }
  ],
  defaultVariantSize: 128,
  enableWebP: process.env.AVATAR_ENABLE_WEBP === 'true',
  enableCDN: process.env.AVATAR_ENABLE_CDN === 'true',
  cdnBaseUrl: process.env.AVATAR_CDN_BASE_URL,
  enableGravatar: process.env.AVATAR_ENABLE_GRAVATAR !== 'false',
  gravatarDefault: (process.env.AVATAR_GRAVATAR_DEFAULT as any) || 'identicon'
};

export function createAvatarService({ 
  prisma, 
  config = defaultAvatarConfig 
}: AvatarServiceDependencies) {

  /**
   * Upload and process user avatar
   */
  async function uploadAvatar(params: AvatarUpload): Promise<AvatarRecord> {
    try {
      const { userId, file, metadata = {} } = params;

      // Validate file type
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        throw new Error(`Unsupported file type: ${file.mimetype}`);
      }

      // Generate unique filename
      const fileExtension = path.extname(file.filename);
      const baseFileName = `${userId}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
      const originalFileName = `${baseFileName}${fileExtension}`;

      // Ensure upload directory exists
      await ensureUploadDirectory();

      // Save original file
      const originalPath = path.join(config.uploadDir, originalFileName);
      await pipeline(file.file, createWriteStream(originalPath));

      // Get file stats and validate size
      const stats = await fs.stat(originalPath);
      if (stats.size > config.maxFileSize) {
        await fs.unlink(originalPath);
        throw new Error(`File size ${stats.size} exceeds maximum allowed size ${config.maxFileSize}`);
      }

      // Get image metadata
      const imageMetadata = await sharp(originalPath).metadata();
      if (!imageMetadata.width || !imageMetadata.height) {
        await fs.unlink(originalPath);
        throw new Error('Invalid image file');
      }

      // Generate variants
      const variants = await generateImageVariants(originalPath, baseFileName);

      // Deactivate previous avatars
      await deactivatePreviousAvatars(userId);

      // Create avatar record
      const avatarRecord: AvatarRecord = {
        id: `avatar_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
        userId,
        filename: originalFileName,
        originalName: file.filename,
        mimetype: file.mimetype,
        size: stats.size,
        width: imageMetadata.width,
        height: imageMetadata.height,
        variants,
        url: getAvatarUrl(originalFileName),
        isActive: true,
        source: metadata.source || 'upload',
        uploadedAt: new Date(),
        uploadedBy: metadata.uploadedBy || userId,
        metadata
      };

      // Store in database (using user metadata for simplicity)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { metadata: true }
      });

      const userMetadata = user?.metadata || {};
      const avatars = userMetadata.avatars || [];
      avatars.push(avatarRecord);

      await prisma.user.update({
        where: { id: userId },
        data: {
          metadata: {
            ...userMetadata,
            avatars,
            activeAvatar: avatarRecord.id
          }
        }
      });

      // Update user profile with avatar URL
      await prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          avatarUrl: getVariantUrl(baseFileName, config.defaultVariantSize, 'jpeg')
        },
        update: {
          avatarUrl: getVariantUrl(baseFileName, config.defaultVariantSize, 'jpeg')
        }
      });

      logger.info({ 
        userId, 
        avatarId: avatarRecord.id,
        filename: originalFileName,
        size: stats.size,
        variants: variants.length
      }, 'Avatar uploaded successfully');

      return avatarRecord;

    } catch (error) {
      logger.error({ error, userId: params.userId }, 'Failed to upload avatar');
      throw error;
    }
  }

  /**
   * Get user avatar information
   */
  async function getUserAvatar(userId: string): Promise<AvatarRecord | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { metadata: true }
      });

      if (!user?.metadata?.activeAvatar) {
        return null;
      }

      const avatars = user.metadata.avatars || [];
      const activeAvatar = avatars.find((avatar: any) => 
        avatar.id === user.metadata.activeAvatar && avatar.isActive
      );

      return activeAvatar || null;

    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user avatar');
      throw error;
    }
  }

  /**
   * Get all user avatars (history)
   */
  async function getUserAvatarHistory(userId: string): Promise<AvatarRecord[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { metadata: true }
      });

      const avatars = user?.metadata?.avatars || [];
      return avatars.sort((a: any, b: any) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

    } catch (error) {
      logger.error({ error, userId }, 'Failed to get user avatar history');
      throw error;
    }
  }

  /**
   * Delete user avatar
   */
  async function deleteAvatar(userId: string, avatarId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { metadata: true }
      });

      if (!user?.metadata?.avatars) {
        throw new Error('Avatar not found');
      }

      const avatars = user.metadata.avatars;
      const avatarIndex = avatars.findIndex((avatar: any) => avatar.id === avatarId);
      
      if (avatarIndex === -1) {
        throw new Error('Avatar not found');
      }

      const avatar = avatars[avatarIndex];

      // Delete files
      await deleteAvatarFiles(avatar);

      // Remove from array
      avatars.splice(avatarIndex, 1);

      // Update metadata
      const updatedMetadata = {
        ...user.metadata,
        avatars
      };

      // If this was the active avatar, set new active avatar or remove
      if (user.metadata.activeAvatar === avatarId) {
        const remainingAvatars = avatars.filter((a: any) => a.isActive);
        if (remainingAvatars.length > 0) {
          updatedMetadata.activeAvatar = remainingAvatars[0].id;
        } else {
          delete updatedMetadata.activeAvatar;
          
          // Update user profile to remove avatar URL
          await prisma.userProfile.updateMany({
            where: { userId },
            data: { avatarUrl: null }
          });
        }
      }

      await prisma.user.update({
        where: { id: userId },
        data: { metadata: updatedMetadata }
      });

      logger.info({ userId, avatarId }, 'Avatar deleted successfully');

    } catch (error) {
      logger.error({ error, userId, avatarId }, 'Failed to delete avatar');
      throw error;
    }
  }

  /**
   * Set avatar as active
   */
  async function setActiveAvatar(userId: string, avatarId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { metadata: true }
      });

      if (!user?.metadata?.avatars) {
        throw new Error('No avatars found');
      }

      const avatar = user.metadata.avatars.find((a: any) => a.id === avatarId);
      if (!avatar) {
        throw new Error('Avatar not found');
      }

      // Update metadata
      await prisma.user.update({
        where: { id: userId },
        data: {
          metadata: {
            ...user.metadata,
            activeAvatar: avatarId
          }
        }
      });

      // Update user profile
      const baseFileName = avatar.filename.replace(path.extname(avatar.filename), '');
      const avatarUrl = getVariantUrl(baseFileName, config.defaultVariantSize, 'jpeg');
      
      await prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          avatarUrl
        },
        update: {
          avatarUrl
        }
      });

      logger.info({ userId, avatarId }, 'Active avatar updated');

    } catch (error) {
      logger.error({ error, userId, avatarId }, 'Failed to set active avatar');
      throw error;
    }
  }

  /**
   * Generate Gravatar URL
   */
  function generateGravatarUrl(email: string, size: number = 128): string {
    const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${config.gravatarDefault}`;
  }

  /**
   * Set Gravatar as user avatar
   */
  async function setGravatarAvatar(userId: string, email: string): Promise<AvatarRecord> {
    try {
      if (!config.enableGravatar) {
        throw new Error('Gravatar integration is disabled');
      }

      // Deactivate previous avatars
      await deactivatePreviousAvatars(userId);

      const avatarRecord: AvatarRecord = {
        id: `gravatar_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
        userId,
        filename: `gravatar_${userId}.jpg`,
        originalName: 'Gravatar Avatar',
        mimetype: 'image/jpeg',
        size: 0, // Unknown for Gravatar
        width: config.defaultVariantSize,
        height: config.defaultVariantSize,
        variants: config.variants.map(variant => ({
          size: variant.size,
          filename: `gravatar_${userId}_${variant.size}.jpg`,
          url: generateGravatarUrl(email, variant.size),
          format: 'jpeg' as const,
          quality: variant.quality,
          fileSize: 0
        })),
        url: generateGravatarUrl(email, config.defaultVariantSize),
        isActive: true,
        source: 'gravatar',
        uploadedAt: new Date(),
        uploadedBy: userId,
        metadata: { email }
      };

      // Store in database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { metadata: true }
      });

      const userMetadata = user?.metadata || {};
      const avatars = userMetadata.avatars || [];
      avatars.push(avatarRecord);

      await prisma.user.update({
        where: { id: userId },
        data: {
          metadata: {
            ...userMetadata,
            avatars,
            activeAvatar: avatarRecord.id
          }
        }
      });

      // Update user profile
      await prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          avatarUrl: avatarRecord.url
        },
        update: {
          avatarUrl: avatarRecord.url
        }
      });

      logger.info({ userId, email }, 'Gravatar avatar set successfully');

      return avatarRecord;

    } catch (error) {
      logger.error({ error, userId, email }, 'Failed to set Gravatar avatar');
      throw error;
    }
  }

  /**
   * Clean up old avatar files
   */
  async function cleanupOldAvatars(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let cleanedCount = 0;

      // Get all users with avatars
      const users = await prisma.user.findMany({
        select: { 
          id: true, 
          metadata: true 
        },
        where: {
          metadata: {
            path: ['avatars'],
            not: null
          }
        }
      });

      for (const user of users) {
        const avatars = user.metadata?.avatars || [];
        const inactiveOldAvatars = avatars.filter((avatar: any) => 
          !avatar.isActive && 
          new Date(avatar.uploadedAt) < cutoffDate &&
          avatar.source === 'upload' // Only cleanup uploaded files
        );

        for (const avatar of inactiveOldAvatars) {
          try {
            await deleteAvatarFiles(avatar);
            cleanedCount++;
          } catch (error) {
            logger.warn({ error, avatarId: avatar.id }, 'Failed to delete avatar files during cleanup');
          }
        }

        // Update user metadata to remove cleaned avatars
        if (inactiveOldAvatars.length > 0) {
          const remainingAvatars = avatars.filter((avatar: any) => 
            !inactiveOldAvatars.some((old: any) => old.id === avatar.id)
          );

          await prisma.user.update({
            where: { id: user.id },
            data: {
              metadata: {
                ...user.metadata,
                avatars: remainingAvatars
              }
            }
          });
        }
      }

      logger.info({ cleanedCount, daysOld }, 'Avatar cleanup completed');
      return cleanedCount;

    } catch (error) {
      logger.error({ error }, 'Failed to cleanup old avatars');
      throw error;
    }
  }

  /**
   * Helper functions
   */
  async function ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(config.uploadDir);
    } catch {
      await fs.mkdir(config.uploadDir, { recursive: true });
    }
  }

  async function generateImageVariants(originalPath: string, baseFileName: string): Promise<AvatarVariant[]> {
    const variants: AvatarVariant[] = [];

    for (const variantConfig of config.variants) {
      const variantFileName = `${baseFileName}_${variantConfig.size}.${variantConfig.format}`;
      const variantPath = path.join(config.uploadDir, variantFileName);

      let sharpInstance = sharp(originalPath)
        .resize(variantConfig.size, variantConfig.size, {
          fit: 'cover',
          position: 'center'
        });

      if (variantConfig.format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality: variantConfig.quality });
      } else if (variantConfig.format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality: variantConfig.quality });
      } else if (variantConfig.format === 'png') {
        sharpInstance = sharpInstance.png({ quality: variantConfig.quality });
      }

      await sharpInstance.toFile(variantPath);

      const stats = await fs.stat(variantPath);
      
      variants.push({
        size: variantConfig.size,
        filename: variantFileName,
        url: getAvatarUrl(variantFileName),
        format: variantConfig.format,
        quality: variantConfig.quality,
        fileSize: stats.size
      });
    }

    return variants;
  }

  async function deactivatePreviousAvatars(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { metadata: true }
    });

    if (user?.metadata?.avatars) {
      const updatedAvatars = user.metadata.avatars.map((avatar: any) => ({
        ...avatar,
        isActive: false
      }));

      await prisma.user.update({
        where: { id: userId },
        data: {
          metadata: {
            ...user.metadata,
            avatars: updatedAvatars
          }
        }
      });
    }
  }

  async function deleteAvatarFiles(avatar: AvatarRecord): Promise<void> {
    if (avatar.source !== 'upload') {
      return; // Don't delete external avatars
    }

    try {
      // Delete original file
      const originalPath = path.join(config.uploadDir, avatar.filename);
      try {
        await fs.unlink(originalPath);
      } catch (error) {
        logger.warn({ error, filename: avatar.filename }, 'Failed to delete original avatar file');
      }

      // Delete variants
      for (const variant of avatar.variants) {
        const variantPath = path.join(config.uploadDir, variant.filename);
        try {
          await fs.unlink(variantPath);
        } catch (error) {
          logger.warn({ error, filename: variant.filename }, 'Failed to delete avatar variant');
        }
      }
    } catch (error) {
      logger.error({ error, avatarId: avatar.id }, 'Failed to delete avatar files');
      throw error;
    }
  }

  function getAvatarUrl(filename: string): string {
    if (config.enableCDN && config.cdnBaseUrl) {
      return `${config.cdnBaseUrl}/${filename}`;
    }
    return `/api/avatars/${filename}`;
  }

  function getVariantUrl(baseFileName: string, size: number, format: string): string {
    const filename = `${baseFileName}_${size}.${format}`;
    return getAvatarUrl(filename);
  }

  return {
    uploadAvatar,
    getUserAvatar,
    getUserAvatarHistory,
    deleteAvatar,
    setActiveAvatar,
    generateGravatarUrl,
    setGravatarAvatar,
    cleanupOldAvatars,
    
    // Configuration
    getConfig: () => config,
    
    // Utility functions
    getAvatarUrl,
    getVariantUrl
  };
}

// Type exports
export type AvatarService = ReturnType<typeof createAvatarService>;