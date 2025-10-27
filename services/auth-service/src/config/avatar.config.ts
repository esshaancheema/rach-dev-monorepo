/**
 * Avatar Configuration
 * 
 * This file contains configuration for avatar upload, processing,
 * storage, and management features.
 */

import path from 'path';

export interface AvatarConfiguration {
  storage: {
    uploadDir: string;
    maxFileSize: number; // bytes
    allowedMimeTypes: string[];
    enableTempDirectory: boolean;
    tempDirCleanupHours: number;
  };
  processing: {
    variants: Array<{
      size: number;
      quality: number;
      format: 'jpeg' | 'webp' | 'png';
    }>;
    defaultVariantSize: number;
    enableWebP: boolean;
    enablePNG: boolean;
    enableGIF: boolean;
    maxDimensions: {
      width: number;
      height: number;
    };
    autoRotate: boolean;
    removeExifData: boolean;
  };
  cdn: {
    enabled: boolean;
    baseUrl?: string;
    cacheTTL: number; // seconds
    enableCompression: boolean;
  };
  gravatar: {
    enabled: boolean;
    defaultStyle: 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'robohash' | 'blank';
    fallbackSize: number;
    enableSecureUrls: boolean;
  };
  security: {
    enableVirusScan: boolean;
    allowedFileExtensions: string[];
    blockSuspiciousFiles: boolean;
    enableContentTypeValidation: boolean;
    maxUploadsPerHour: number;
    maxUploadsPerDay: number;
  };
  cleanup: {
    enableAutoCleanup: boolean;
    retentionDays: number;
    cleanupSchedule: string; // cron format
    keepActiveAvatars: boolean;
    maxStoragePerUser: number; // bytes
  };
  analytics: {
    trackUploads: boolean;
    trackDownloads: boolean;
    trackErrors: boolean;
    enableMetrics: boolean;
  };
}

// Default configuration
export const defaultAvatarConfig: AvatarConfiguration = {
  storage: {
    uploadDir: process.env.AVATAR_UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'avatars'),
    maxFileSize: parseInt(process.env.AVATAR_MAX_FILE_SIZE || '5242880'), // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ],
    enableTempDirectory: process.env.AVATAR_ENABLE_TEMP_DIR === 'true',
    tempDirCleanupHours: parseInt(process.env.AVATAR_TEMP_CLEANUP_HOURS || '24')
  },

  processing: {
    variants: [
      { size: 32, quality: 80, format: 'jpeg' },
      { size: 64, quality: 85, format: 'jpeg' },
      { size: 128, quality: 90, format: 'jpeg' },
      { size: 256, quality: 90, format: 'jpeg' },
      { size: 512, quality: 95, format: 'jpeg' }
    ],
    defaultVariantSize: parseInt(process.env.AVATAR_DEFAULT_SIZE || '128'),
    enableWebP: process.env.AVATAR_ENABLE_WEBP === 'true',
    enablePNG: process.env.AVATAR_ENABLE_PNG !== 'false',
    enableGIF: process.env.AVATAR_ENABLE_GIF === 'true',
    maxDimensions: {
      width: parseInt(process.env.AVATAR_MAX_WIDTH || '2048'),
      height: parseInt(process.env.AVATAR_MAX_HEIGHT || '2048')
    },
    autoRotate: process.env.AVATAR_AUTO_ROTATE !== 'false',
    removeExifData: process.env.AVATAR_REMOVE_EXIF !== 'false'
  },

  cdn: {
    enabled: process.env.AVATAR_CDN_ENABLED === 'true',
    baseUrl: process.env.AVATAR_CDN_BASE_URL,
    cacheTTL: parseInt(process.env.AVATAR_CACHE_TTL || '86400'), // 24 hours
    enableCompression: process.env.AVATAR_CDN_COMPRESSION !== 'false'
  },

  gravatar: {
    enabled: process.env.AVATAR_GRAVATAR_ENABLED !== 'false',
    defaultStyle: (process.env.AVATAR_GRAVATAR_DEFAULT as any) || 'identicon',
    fallbackSize: parseInt(process.env.AVATAR_GRAVATAR_SIZE || '128'),
    enableSecureUrls: process.env.AVATAR_GRAVATAR_SECURE !== 'false'
  },

  security: {
    enableVirusScan: process.env.AVATAR_VIRUS_SCAN === 'true',
    allowedFileExtensions: process.env.AVATAR_ALLOWED_EXTENSIONS?.split(',') || ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    blockSuspiciousFiles: process.env.AVATAR_BLOCK_SUSPICIOUS !== 'false',
    enableContentTypeValidation: process.env.AVATAR_VALIDATE_CONTENT_TYPE !== 'false',
    maxUploadsPerHour: parseInt(process.env.AVATAR_MAX_UPLOADS_HOUR || '10'),
    maxUploadsPerDay: parseInt(process.env.AVATAR_MAX_UPLOADS_DAY || '50')
  },

  cleanup: {
    enableAutoCleanup: process.env.AVATAR_AUTO_CLEANUP === 'true',
    retentionDays: parseInt(process.env.AVATAR_RETENTION_DAYS || '90'),
    cleanupSchedule: process.env.AVATAR_CLEANUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    keepActiveAvatars: process.env.AVATAR_KEEP_ACTIVE !== 'false',
    maxStoragePerUser: parseInt(process.env.AVATAR_MAX_STORAGE_USER || '52428800') // 50MB
  },

  analytics: {
    trackUploads: process.env.AVATAR_TRACK_UPLOADS !== 'false',
    trackDownloads: process.env.AVATAR_TRACK_DOWNLOADS === 'true',
    trackErrors: process.env.AVATAR_TRACK_ERRORS !== 'false',
    enableMetrics: process.env.AVATAR_ENABLE_METRICS !== 'false'
  }
};

// Environment variables documentation
export const avatarEnvironmentVariables = {
  // Storage settings
  AVATAR_UPLOAD_DIR: 'Directory for avatar file storage (default: ./uploads/avatars)',
  AVATAR_MAX_FILE_SIZE: 'Maximum file size in bytes (default: 5242880 = 5MB)',
  AVATAR_ENABLE_TEMP_DIR: 'Enable temporary directory for processing (default: false)',
  AVATAR_TEMP_CLEANUP_HOURS: 'Hours to keep temporary files (default: 24)',

  // Processing settings
  AVATAR_DEFAULT_SIZE: 'Default avatar size in pixels (default: 128)',
  AVATAR_ENABLE_WEBP: 'Enable WebP format support (default: false)',
  AVATAR_ENABLE_PNG: 'Enable PNG format support (default: true)',
  AVATAR_ENABLE_GIF: 'Enable GIF format support (default: false)',
  AVATAR_MAX_WIDTH: 'Maximum image width in pixels (default: 2048)',
  AVATAR_MAX_HEIGHT: 'Maximum image height in pixels (default: 2048)',
  AVATAR_AUTO_ROTATE: 'Auto-rotate images based on EXIF (default: true)',
  AVATAR_REMOVE_EXIF: 'Remove EXIF data from images (default: true)',

  // CDN settings
  AVATAR_CDN_ENABLED: 'Enable CDN for avatar serving (default: false)',
  AVATAR_CDN_BASE_URL: 'CDN base URL for avatar files',
  AVATAR_CACHE_TTL: 'Cache TTL for avatar files in seconds (default: 86400)',
  AVATAR_CDN_COMPRESSION: 'Enable CDN compression (default: true)',

  // Gravatar settings
  AVATAR_GRAVATAR_ENABLED: 'Enable Gravatar integration (default: true)',
  AVATAR_GRAVATAR_DEFAULT: 'Default Gravatar style (default: identicon)',
  AVATAR_GRAVATAR_SIZE: 'Default Gravatar size (default: 128)',
  AVATAR_GRAVATAR_SECURE: 'Use HTTPS for Gravatar URLs (default: true)',

  // Security settings
  AVATAR_VIRUS_SCAN: 'Enable virus scanning for uploads (default: false)',
  AVATAR_ALLOWED_EXTENSIONS: 'Comma-separated allowed file extensions (default: .jpg,.jpeg,.png,.webp,.gif)',
  AVATAR_BLOCK_SUSPICIOUS: 'Block suspicious files (default: true)',
  AVATAR_VALIDATE_CONTENT_TYPE: 'Validate file content type (default: true)',
  AVATAR_MAX_UPLOADS_HOUR: 'Maximum uploads per user per hour (default: 10)',
  AVATAR_MAX_UPLOADS_DAY: 'Maximum uploads per user per day (default: 50)',

  // Cleanup settings
  AVATAR_AUTO_CLEANUP: 'Enable automatic cleanup of old avatars (default: false)',
  AVATAR_RETENTION_DAYS: 'Days to retain inactive avatars (default: 90)',
  AVATAR_CLEANUP_SCHEDULE: 'Cron schedule for cleanup (default: 0 2 * * *)',
  AVATAR_KEEP_ACTIVE: 'Always keep active avatars (default: true)',
  AVATAR_MAX_STORAGE_USER: 'Maximum storage per user in bytes (default: 52428800 = 50MB)',

  // Analytics settings
  AVATAR_TRACK_UPLOADS: 'Track avatar upload events (default: true)',
  AVATAR_TRACK_DOWNLOADS: 'Track avatar download events (default: false)',
  AVATAR_TRACK_ERRORS: 'Track avatar processing errors (default: true)',
  AVATAR_ENABLE_METRICS: 'Enable avatar metrics collection (default: true)'
};

// Validation function
export function validateAvatarConfig(config: AvatarConfiguration): string[] {
  const errors: string[] = [];

  // Validate file size limits
  if (config.storage.maxFileSize < 1024 || config.storage.maxFileSize > 52428800) {
    errors.push('storage.maxFileSize must be between 1KB and 50MB');
  }

  // Validate image dimensions
  if (config.processing.maxDimensions.width < 32 || config.processing.maxDimensions.width > 4096) {
    errors.push('processing.maxDimensions.width must be between 32 and 4096 pixels');
  }

  if (config.processing.maxDimensions.height < 32 || config.processing.maxDimensions.height > 4096) {
    errors.push('processing.maxDimensions.height must be between 32 and 4096 pixels');
  }

  // Validate variants
  if (config.processing.variants.length === 0) {
    errors.push('At least one image variant must be configured');
  }

  for (const variant of config.processing.variants) {
    if (variant.size < 16 || variant.size > 1024) {
      errors.push(`Variant size ${variant.size} must be between 16 and 1024 pixels`);
    }
    if (variant.quality < 1 || variant.quality > 100) {
      errors.push(`Variant quality ${variant.quality} must be between 1 and 100`);
    }
  }

  // Validate default variant size
  const validSizes = config.processing.variants.map(v => v.size);
  if (!validSizes.includes(config.processing.defaultVariantSize)) {
    errors.push('processing.defaultVariantSize must match one of the configured variant sizes');
  }

  // Validate rate limits
  if (config.security.maxUploadsPerHour < 1 || config.security.maxUploadsPerHour > 100) {
    errors.push('security.maxUploadsPerHour must be between 1 and 100');
  }

  if (config.security.maxUploadsPerDay < 1 || config.security.maxUploadsPerDay > 1000) {
    errors.push('security.maxUploadsPerDay must be between 1 and 1000');
  }

  // Validate retention settings
  if (config.cleanup.retentionDays < 1 || config.cleanup.retentionDays > 365) {
    errors.push('cleanup.retentionDays must be between 1 and 365 days');
  }

  // Validate CDN configuration
  if (config.cdn.enabled && !config.cdn.baseUrl) {
    errors.push('cdn.baseUrl is required when CDN is enabled');
  }

  // Validate Gravatar configuration
  const validGravatarStyles = ['identicon', 'monsterid', 'wavatar', 'retro', 'robohash', 'blank'];
  if (!validGravatarStyles.includes(config.gravatar.defaultStyle)) {
    errors.push(`gravatar.defaultStyle must be one of: ${validGravatarStyles.join(', ')}`);
  }

  return errors;
}

// Helper function to get current config
export function getCurrentAvatarConfig(): AvatarConfiguration {
  return defaultAvatarConfig;
}

// Helper function to get variant configuration by size
export function getVariantConfig(size: number): AvatarConfiguration['processing']['variants'][0] | null {
  const config = getCurrentAvatarConfig();
  return config.processing.variants.find(variant => variant.size === size) || null;
}

// Helper function to get all available sizes
export function getAvailableSizes(): number[] {
  const config = getCurrentAvatarConfig();
  return config.processing.variants.map(variant => variant.size).sort((a, b) => a - b);
}

// Helper function to check if file type is allowed
export function isFileTypeAllowed(mimeType: string): boolean {
  const config = getCurrentAvatarConfig();
  return config.storage.allowedMimeTypes.includes(mimeType);
}

// Helper function to check if file size is allowed
export function isFileSizeAllowed(size: number): boolean {
  const config = getCurrentAvatarConfig();
  return size <= config.storage.maxFileSize;
}