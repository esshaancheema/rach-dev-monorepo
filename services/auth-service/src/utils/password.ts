import * as argon2 from 'argon2';
import { randomBytes, timingSafeEqual } from 'crypto';
import { securityConfig } from '../config';
import { AUTH_CONSTANTS } from '../config/constants';
import { logger } from './logger';
import { cacheManager } from './redis';

// Common weak passwords to check against
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', 'letmein', 'dragon', '111111', 'baseball', 'iloveyou',
  'trustno1', '1234567890', 'sunshine', 'master', '123123', 'welcome',
  'shadow', 'ashley', 'football', 'jesus', 'michael', 'ninja', 'mustang',
  'password1', '123456789', 'admin', 'administrator', 'root', 'guest'
]);

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PasswordHashOptions {
  memoryCost?: number;
  timeCost?: number;
  parallelism?: number;
  saltLength?: number;
}

export class PasswordError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'PasswordError';
  }
}

export class PasswordUtils {
  private static readonly DEFAULT_HASH_OPTIONS: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
    saltLength: 32,
  };

  /**
   * Hash password using Argon2id with configurable options
   */
  static async hash(password: string, options?: PasswordHashOptions): Promise<string> {
    try {
      // Validate password before hashing
      const validation = this.validateStrength(password);
      if (!validation.isValid) {
        throw new PasswordError(
          `Password validation failed: ${validation.errors.join(', ')}`,
          'WEAK_PASSWORD'
        );
      }

      const hashOptions: argon2.Options = {
        ...this.DEFAULT_HASH_OPTIONS,
        ...options,
      };

      // Adjust parameters based on environment
      if (securityConfig.bcryptRounds >= 12) {
        hashOptions.timeCost = 4; // More iterations for production
        hashOptions.memoryCost = 2 ** 17; // 128 MB for production
      }

      const startTime = Date.now();
      const hashedPassword = await argon2.hash(password, hashOptions);
      const duration = Date.now() - startTime;

      // Log slow hashing for monitoring
      if (duration > 1000) {
        logger.warn('Slow password hashing detected', {
          duration: `${duration}ms`,
          memoryCost: hashOptions.memoryCost,
          timeCost: hashOptions.timeCost,
        });
      }

      return hashedPassword;
    } catch (error) {
      if (error instanceof PasswordError) {
        throw error;
      }
      
      logger.error('Password hashing failed', { error });
      throw new PasswordError('Failed to hash password', 'HASH_FAILED', 500);
    }
  }

  /**
   * Verify password with timing attack protection
   */
  static async verify(hashedPassword: string, plainPassword: string): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Perform verification
      const isValid = await argon2.verify(hashedPassword, plainPassword);
      
      const duration = Date.now() - startTime;
      
      // Log slow verification for monitoring
      if (duration > 500) {
        logger.warn('Slow password verification detected', {
          duration: `${duration}ms`,
          isValid,
        });
      }

      // Always take minimum time to prevent timing attacks
      const minTime = 100; // 100ms minimum
      if (duration < minTime) {
        await new Promise(resolve => setTimeout(resolve, minTime - duration));
      }

      return isValid;
    } catch (error) {
      logger.error('Password verification failed', { error });
      
      // Add delay even on error to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100));
      return false;
    }
  }

  /**
   * Comprehensive password strength validation
   */
  static validateStrength(password: string): PasswordStrengthResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    const { PASSWORD } = AUTH_CONSTANTS;

    // Length check
    if (password.length < PASSWORD.MIN_LENGTH) {
      errors.push(`Password must be at least ${PASSWORD.MIN_LENGTH} characters long`);
    } else if (password.length >= PASSWORD.MIN_LENGTH) {
      score += 20;
    }

    if (password.length > PASSWORD.MAX_LENGTH) {
      errors.push(`Password must be no more than ${PASSWORD.MAX_LENGTH} characters long`);
    }

    // Character type checks
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>~`\-_+=\[\]\\;'/]/.test(password);

    if (PASSWORD.REQUIRE_UPPERCASE && !hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (hasUppercase) {
      score += 15;
    }

    if (PASSWORD.REQUIRE_LOWERCASE && !hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (hasLowercase) {
      score += 15;
    }

    if (PASSWORD.REQUIRE_NUMBERS && !hasNumbers) {
      errors.push('Password must contain at least one number');
    } else if (hasNumbers) {
      score += 15;
    }

    if (PASSWORD.REQUIRE_SPECIAL_CHARS && !hasSpecialChars) {
      errors.push('Password must contain at least one special character');
    } else if (hasSpecialChars) {
      score += 15;
    }

    // Additional strength checks
    
    // Check for common passwords
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
      score = Math.max(0, score - 30);
    }

    // Check for patterns
    if (/(.)\1{2,}/.test(password)) {
      warnings.push('Avoid repeating characters');
      score -= 10;
    }

    if (/123|abc|qwe|asd/i.test(password)) {
      warnings.push('Avoid sequential characters');
      score -= 10;
    }

    // Check for dictionary words (simplified)
    const commonWords = ['admin', 'user', 'login', 'password', 'secret'];
    if (commonWords.some(word => password.toLowerCase().includes(word))) {
      warnings.push('Avoid common words');
      score -= 15;
    }

    // Bonus points for length
    if (password.length >= 12) {
      score += 10;
      if (password.length >= 16) {
        score += 10;
      }
    }

    // Mixed case bonus
    if (hasUppercase && hasLowercase && hasNumbers && hasSpecialChars) {
      score += 10;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Generate suggestions
    if (!hasUppercase) {
      suggestions.push('Add uppercase letters');
    }
    if (!hasLowercase) {
      suggestions.push('Add lowercase letters');
    }
    if (!hasNumbers) {
      suggestions.push('Add numbers');
    }
    if (!hasSpecialChars) {
      suggestions.push('Add special characters');
    }
    if (password.length < 12) {
      suggestions.push('Use at least 12 characters');
    }

    return {
      isValid: errors.length === 0,
      score,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Generate cryptographically secure password
   */
  static generateSecurePassword(length: number = 16): string {
    if (length < 8 || length > 128) {
      throw new PasswordError('Password length must be between 8 and 128 characters', 'INVALID_LENGTH');
    }

    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*(),.?":{}|<>~`-_+=[]\\;\'';
    
    const allChars = lowercase + uppercase + numbers + specialChars;
    
    // Ensure at least one character from each required type
    let password = '';
    password += this.getRandomChar(lowercase);
    password += this.getRandomChar(uppercase);
    password += this.getRandomChar(numbers);
    password += this.getRandomChar(specialChars);

    // Fill remaining length with random characters
    for (let i = 4; i < length; i++) {
      password += this.getRandomChar(allChars);
    }

    // Shuffle the password to avoid predictable patterns
    return this.shuffleString(password);
  }

  /**
   * Check if password needs to be updated (based on hash format or age)
   */
  static needsRehash(hashedPassword: string): boolean {
    try {
      // Check if it's an Argon2 hash
      if (!hashedPassword.startsWith('$argon2')) {
        return true; // Probably bcrypt or other, should migrate
      }

      // Parse Argon2 parameters
      const parts = hashedPassword.split('$');
      if (parts.length < 6) {
        return true;
      }

      // Check if parameters meet current standards
      const params = parts[3].split(',');
      const paramMap = new Map();
      
      params.forEach(param => {
        const [key, value] = param.split('=');
        paramMap.set(key, parseInt(value, 10));
      });

      const memoryCost = paramMap.get('m') || 0;
      const timeCost = paramMap.get('t') || 0;

      // Rehash if parameters are below current standards
      return memoryCost < 65536 || timeCost < 3; // 64MB memory, 3 iterations
    } catch (error) {
      logger.error('Error checking if password needs rehash', { error });
      return false; // Conservative approach
    }
  }

  /**
   * Store password history to prevent reuse
   */
  static async addToPasswordHistory(userId: string, hashedPassword: string): Promise<void> {
    try {
      const historyKey = `password_history:${userId}`;
      const maxHistory = 5; // Store last 5 passwords
      
      const history = await cacheManager.get<string[]>(historyKey) || [];
      history.unshift(hashedPassword);
      
      // Keep only the latest passwords
      if (history.length > maxHistory) {
        history.splice(maxHistory);
      }
      
      // Store for 1 year
      await cacheManager.setWithExpiry(historyKey, history, 365 * 24 * 60 * 60);
    } catch (error) {
      logger.error('Failed to store password history', { error, userId });
      // Don't throw - this is not critical for functionality
    }
  }

  /**
   * Check if password was used recently
   */
  static async isPasswordReused(userId: string, plainPassword: string): Promise<boolean> {
    try {
      const historyKey = `password_history:${userId}`;
      const history = await cacheManager.get<string[]>(historyKey) || [];
      
      for (const hashedPassword of history) {
        if (await this.verify(hashedPassword, plainPassword)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to check password reuse', { error, userId });
      return false; // Fail open
    }
  }

  /**
   * Generate secure recovery codes for 2FA backup
   */
  static generateRecoveryCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character codes with numbers and letters
      const code = randomBytes(4).toString('hex').toUpperCase();
      // Format as XXXX-XXXX for readability
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    
    return codes;
  }

  /**
   * Hash recovery codes for secure storage
   */
  static async hashRecoveryCodes(codes: string[]): Promise<string[]> {
    const hashedCodes: string[] = [];
    
    for (const code of codes) {
      // Use simpler hashing for recovery codes (they're already random)
      const hashedCode = await argon2.hash(code, {
        type: argon2.argon2id,
        memoryCost: 2 ** 14, // 16 MB - lighter for recovery codes
        timeCost: 2,
        parallelism: 1,
      });
      hashedCodes.push(hashedCode);
    }
    
    return hashedCodes;
  }

  // Private helper methods

  private static getRandomChar(charset: string): string {
    const randomIndex = randomBytes(1)[0] % charset.length;
    return charset[randomIndex];
  }

  private static shuffleString(str: string): string {
    const array = str.split('');
    
    // Fisher-Yates shuffle using crypto random
    for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = randomBytes(1)[0] % (i + 1);
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    
    return array.join('');
  }
}

// Export singleton functions for convenience
export const hashPassword = PasswordUtils.hash.bind(PasswordUtils);
export const verifyPassword = PasswordUtils.verify.bind(PasswordUtils);
export const validatePasswordStrength = PasswordUtils.validateStrength.bind(PasswordUtils);
export const generateSecurePassword = PasswordUtils.generateSecurePassword.bind(PasswordUtils);