import { PrismaClient } from '@zoptal/database';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/redis';
import { createServiceError } from '../middleware/error-handler';

export interface UsernameServiceDependencies {
  prisma: PrismaClient;
}

export interface GenerateUsernameOptions {
  firstName: string;
  lastName: string;
  preferredUsername?: string;
  maxSuggestions?: number;
}

export interface UsernameValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  errors: string[];
  suggestions?: string[];
}

export interface UsernameGenerationResult {
  suggestions: string[];
  preferred?: string;
}

export class UsernameService {
  private readonly MIN_USERNAME_LENGTH = 3;
  private readonly MAX_USERNAME_LENGTH = 30;
  private readonly RESERVED_USERNAMES = new Set([
    'admin', 'administrator', 'root', 'system', 'support', 'help',
    'api', 'www', 'mail', 'email', 'user', 'guest', 'anonymous',
    'null', 'undefined', 'test', 'demo', 'sample', 'example',
    'zoptal', 'staff', 'moderator', 'mod', 'official',
    'security', 'abuse', 'noreply', 'no-reply', 'service'
  ]);

  constructor(private deps: UsernameServiceDependencies) {}

  /**
   * Generate smart username suggestions based on first and last name
   */
  async generateUsernames(options: GenerateUsernameOptions): Promise<UsernameGenerationResult> {
    const { firstName, lastName, preferredUsername, maxSuggestions = 5 } = options;
    
    try {
      const suggestions: string[] = [];
      
      // Clean and prepare base names
      const cleanFirstName = this.cleanName(firstName);
      const cleanLastName = this.cleanName(lastName);
      
      // If preferred username is provided, check it first
      if (preferredUsername) {
        const validation = await this.validateUsername(preferredUsername);
        if (validation.isValid && validation.isAvailable) {
          return {
            suggestions: [preferredUsername],
            preferred: preferredUsername
          };
        }
      }

      // Generate various username combinations
      const baseCombinations = this.generateBaseCombinations(cleanFirstName, cleanLastName);
      
      // Check availability for base combinations
      for (const base of baseCombinations) {
        if (suggestions.length >= maxSuggestions) break;
        
        const isAvailable = await this.isUsernameAvailable(base);
        if (isAvailable) {
          suggestions.push(base);
        }
      }

      // If we don't have enough suggestions, generate variations
      if (suggestions.length < maxSuggestions) {
        const variations = await this.generateVariations(baseCombinations, maxSuggestions - suggestions.length);
        suggestions.push(...variations);
      }

      logger.info('Generated username suggestions:', {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        suggestionCount: suggestions.length
      });

      return {
        suggestions: suggestions.slice(0, maxSuggestions),
        preferred: suggestions[0]
      };

    } catch (error) {
      logger.error('Failed to generate usernames:', error);
      throw createServiceError(
        'USERNAME_GENERATION_FAILED',
        'Failed to generate username suggestions',
        500
      );
    }
  }

  /**
   * Validate a username for format and availability
   */
  async validateUsername(username: string): Promise<UsernameValidationResult> {
    const errors: string[] = [];
    
    try {
      // Format validation
      if (!username) {
        errors.push('Username is required');
      }

      if (username.length < this.MIN_USERNAME_LENGTH) {
        errors.push(`Username must be at least ${this.MIN_USERNAME_LENGTH} characters long`);
      }

      if (username.length > this.MAX_USERNAME_LENGTH) {
        errors.push(`Username must be no more than ${this.MAX_USERNAME_LENGTH} characters long`);
      }

      // Character validation - only alphanumeric, dots, underscores, hyphens
      if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, dots, underscores, and hyphens');
      }

      // Must start and end with alphanumeric
      if (!/^[a-zA-Z0-9].*[a-zA-Z0-9]$/.test(username) && username.length > 1) {
        errors.push('Username must start and end with a letter or number');
      }

      // No consecutive special characters
      if (/[._-]{2,}/.test(username)) {
        errors.push('Username cannot have consecutive dots, underscores, or hyphens');
      }

      // Reserved username check
      if (this.RESERVED_USERNAMES.has(username.toLowerCase())) {
        errors.push('This username is reserved and cannot be used');
      }

      const isValid = errors.length === 0;
      let isAvailable = false;
      let suggestions: string[] = [];

      // Only check availability if format is valid
      if (isValid) {
        isAvailable = await this.isUsernameAvailable(username);
        
        // Generate suggestions if username is taken
        if (!isAvailable) {
          const generationResult = await this.generateUsernames({
            firstName: username.split(/[._-]/)[0] || username.substring(0, 5),
            lastName: username.split(/[._-]/)[1] || '',
            maxSuggestions: 3
          });
          suggestions = generationResult.suggestions;
        }
      }

      return {
        isValid,
        isAvailable,
        errors,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };

    } catch (error) {
      logger.error('Failed to validate username:', { username, error });
      return {
        isValid: false,
        isAvailable: false,
        errors: ['Username validation failed. Please try again.']
      };
    }
  }

  /**
   * Check if username is available (not taken and not cached)
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      // Check cache first for performance
      const cacheKey = `username_check:${username.toLowerCase()}`;
      const cached = await cacheManager.get(cacheKey);
      
      if (cached !== null) {
        return cached === 'available';
      }

      // Check database
      const existingUser = await this.deps.prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: 'insensitive' // Case insensitive check
          }
        },
        select: { id: true }
      });

      const isAvailable = !existingUser;
      
      // Cache result for 5 minutes
      await cacheManager.setex(
        cacheKey,
        5 * 60, // 5 minutes
        isAvailable ? 'available' : 'taken'
      );

      return isAvailable;

    } catch (error) {
      logger.error('Failed to check username availability:', { username, error });
      // On error, assume not available for safety
      return false;
    }
  }

  /**
   * Reserve a username temporarily during registration process
   */
  async reserveUsername(username: string, userId: string, ttlSeconds: number = 600): Promise<boolean> {
    try {
      const reservationKey = `username_reserved:${username.toLowerCase()}`;
      const existing = await cacheManager.get(reservationKey);
      
      // If already reserved by someone else, return false
      if (existing && existing !== userId) {
        return false;
      }

      // Reserve the username
      await cacheManager.setex(reservationKey, ttlSeconds, userId);
      
      logger.info('Username reserved temporarily:', {
        username,
        userId,
        ttlSeconds
      });

      return true;

    } catch (error) {
      logger.error('Failed to reserve username:', { username, userId, error });
      return false;
    }
  }

  /**
   * Release username reservation
   */
  async releaseUsernameReservation(username: string, userId: string): Promise<void> {
    try {
      const reservationKey = `username_reserved:${username.toLowerCase()}`;
      const reserved = await cacheManager.get(reservationKey);
      
      // Only release if reserved by this user
      if (reserved === userId) {
        await cacheManager.del(reservationKey);
        
        logger.info('Username reservation released:', {
          username,
          userId
        });
      }

    } catch (error) {
      logger.error('Failed to release username reservation:', { username, userId, error });
    }
  }

  /**
   * Clean and normalize name for username generation
   */
  private cleanName(name: string): string {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .trim()
      // Remove accents and diacritics
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Remove non-alphanumeric characters except spaces
      .replace(/[^a-z0-9\s]/g, '')
      // Replace spaces with empty string
      .replace(/\s+/g, '')
      // Limit length
      .substring(0, 15);
  }

  /**
   * Generate base username combinations
   */
  private generateBaseCombinations(firstName: string, lastName: string): string[] {
    const combinations: string[] = [];
    
    if (!firstName && !lastName) {
      return combinations;
    }

    if (firstName && lastName) {
      // Full combinations
      combinations.push(
        `${firstName}${lastName}`,           // johnsmith
        `${firstName}.${lastName}`,         // john.smith
        `${firstName}_${lastName}`,         // john_smith
        `${firstName}-${lastName}`,         // john-smith
        `${lastName}${firstName}`,          // smithjohn
        `${lastName}.${firstName}`,         // smith.john
      );

      // First name + last initial
      if (lastName.length > 0) {
        combinations.push(
          `${firstName}${lastName[0]}`,     // johns
          `${firstName}.${lastName[0]}`,    // john.s
          `${firstName}_${lastName[0]}`,    // john_s
        );
      }

      // First initial + last name
      if (firstName.length > 0) {
        combinations.push(
          `${firstName[0]}${lastName}`,     // jsmith
          `${firstName[0]}.${lastName}`,    // j.smith
          `${firstName[0]}_${lastName}`,    // j_smith
        );
      }

      // Initials
      if (firstName.length > 0 && lastName.length > 0) {
        combinations.push(
          `${firstName[0]}${lastName[0]}`,  // js
        );
      }
    }

    // Single name variations
    if (firstName) {
      combinations.push(firstName);
    }
    if (lastName) {
      combinations.push(lastName);
    }

    // Filter out too short combinations and duplicates
    return [...new Set(combinations)]
      .filter(combo => combo.length >= this.MIN_USERNAME_LENGTH)
      .filter(combo => combo.length <= this.MAX_USERNAME_LENGTH);
  }

  /**
   * Generate variations of base combinations with numbers/suffixes
   */
  private async generateVariations(baseCombinations: string[], maxVariations: number): string[] {
    const variations: string[] = [];
    
    for (const base of baseCombinations) {
      if (variations.length >= maxVariations) break;
      
      // Try with numbers
      for (let i = 1; i <= 999; i++) {
        if (variations.length >= maxVariations) break;
        
        const variation = `${base}${i}`;
        if (variation.length <= this.MAX_USERNAME_LENGTH) {
          const isAvailable = await this.isUsernameAvailable(variation);
          if (isAvailable) {
            variations.push(variation);
          }
        }
      }

      // Try with common suffixes
      const suffixes = ['dev', 'pro', 'user', 'x', 'official'];
      for (const suffix of suffixes) {
        if (variations.length >= maxVariations) break;
        
        const variation = `${base}_${suffix}`;
        if (variation.length <= this.MAX_USERNAME_LENGTH) {
          const isAvailable = await this.isUsernameAvailable(variation);
          if (isAvailable) {
            variations.push(variation);
          }
        }
      }
    }

    return variations;
  }

  /**
   * Get username statistics for analytics
   */
  async getUsernameStats(): Promise<{
    totalUsers: number;
    usersWithUsernames: number;
    averageUsernameLength: number;
    mostCommonPrefixes: Array<{ prefix: string; count: number }>;
  }> {
    try {
      const totalUsers = await this.deps.prisma.user.count();
      const usersWithUsernames = await this.deps.prisma.user.count({
        where: {
          username: {
            not: null
          }
        }
      });

      // Get all usernames for analysis
      const usernames = await this.deps.prisma.user.findMany({
        where: {
          username: {
            not: null
          }
        },
        select: {
          username: true
        }
      });

      const validUsernames = usernames
        .map(u => u.username!)
        .filter(Boolean);

      const averageUsernameLength = validUsernames.length > 0
        ? Math.round(validUsernames.reduce((sum, username) => sum + username.length, 0) / validUsernames.length)
        : 0;

      // Analyze common prefixes (first 3 characters)
      const prefixCounts = new Map<string, number>();
      validUsernames.forEach(username => {
        const prefix = username.substring(0, 3).toLowerCase();
        prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
      });

      const mostCommonPrefixes = Array.from(prefixCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([prefix, count]) => ({ prefix, count }));

      return {
        totalUsers,
        usersWithUsernames,
        averageUsernameLength,
        mostCommonPrefixes
      };

    } catch (error) {
      logger.error('Failed to get username statistics:', error);
      return {
        totalUsers: 0,
        usersWithUsernames: 0,
        averageUsernameLength: 0,
        mostCommonPrefixes: []
      };
    }
  }
}

export function createUsernameService(deps: UsernameServiceDependencies): UsernameService {
  return new UsernameService(deps);
}