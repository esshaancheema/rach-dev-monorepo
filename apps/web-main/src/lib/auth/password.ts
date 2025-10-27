import bcrypt from 'bcryptjs';
import { authConfig, AUTH_ERRORS } from './config';

export class PasswordManager {
  private static instance: PasswordManager;
  private saltRounds = 12;

  static getInstance(): PasswordManager {
    if (!PasswordManager.instance) {
      PasswordManager.instance = new PasswordManager();
    }
    return PasswordManager.instance;
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify a password against its hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < authConfig.password.minLength) {
      errors.push(`Password must be at least ${authConfig.password.minLength} characters long`);
    } else {
      score += 1;
    }

    // Check for uppercase letters
    if (authConfig.password.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // Check for lowercase letters
    if (authConfig.password.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    // Check for numbers
    if (authConfig.password.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 1;
    }

    // Check for symbols
    if (authConfig.password.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    }

    // Additional strength checks
    if (password.length >= 12) {
      score += 1;
    }

    if (password.length >= 16) {
      score += 1;
    }

    // Check for common patterns
    if (this.hasCommonPatterns(password)) {
      errors.push('Password contains common patterns and may be easily guessed');
      score = Math.max(0, score - 2);
    }

    // Check against common passwords
    if (this.isCommonPassword(password)) {
      errors.push('This password is too common. Please choose a more unique password');
      score = Math.max(0, score - 2);
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 5), // Cap at 5
    };
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*(),.?":{}|<>';
    
    let charset = '';
    let password = '';

    // Ensure at least one character from each required set
    if (authConfig.password.requireLowercase) {
      charset += lowercase;
      password += this.getRandomChar(lowercase);
    }

    if (authConfig.password.requireUppercase) {
      charset += uppercase;
      password += this.getRandomChar(uppercase);
    }

    if (authConfig.password.requireNumbers) {
      charset += numbers;
      password += this.getRandomChar(numbers);
    }

    if (authConfig.password.requireSymbols) {
      charset += symbols;
      password += this.getRandomChar(symbols);
    }

    // Fill the rest of the password
    for (let i = password.length; i < length; i++) {
      password += this.getRandomChar(charset);
    }

    // Shuffle the password to avoid predictable patterns
    return this.shuffleString(password);
  }

  /**
   * Check if password has been compromised (simplified check)
   */
  async isPasswordCompromised(password: string): Promise<boolean> {
    // In a real implementation, you would check against:
    // 1. HaveIBeenPwned API
    // 2. Common password databases
    // 3. Previously breached password lists
    
    // For now, just check against a small list of very common passwords
    const veryCommonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', '123123'
    ];

    return veryCommonPasswords.includes(password.toLowerCase());
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetCode(): string {
    // Generate a 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Estimate time to crack password
   */
  estimateCrackTime(password: string): {
    seconds: number;
    humanReadable: string;
  } {
    const charset = this.getCharsetSize(password);
    const entropy = Math.log2(Math.pow(charset, password.length));
    
    // Assume 1 billion guesses per second (modern hardware)
    const guessesPerSecond = 1e9;
    const averageGuesses = Math.pow(2, entropy - 1);
    const seconds = averageGuesses / guessesPerSecond;

    return {
      seconds,
      humanReadable: this.formatTime(seconds),
    };
  }

  /**
   * Private helper methods
   */
  private hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /(.)\1{2,}/, // Repeated characters (aaa, 111)
      /123|234|345|456|567|678|789|890/, // Sequential numbers
      /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i, // Sequential letters
      /qwert|asdf|zxcv/i, // Keyboard patterns
    ];

    return commonPatterns.some(pattern => pattern.test(password));
  }

  private isCommonPassword(password: string): boolean {
    // In a real implementation, this would check against a comprehensive list
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', '123123',
      'password1', '1234567890', 'qwerty123', 'Password1',
      'iloveyou', 'princess', 'rockyou', '1234567', '12345678',
      'dragon', 'pussy', 'baseball', 'football', 'monkey',
      'liverpool', 'jordan23', 'harley', 'rangers', 'shadow'
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  private getRandomChar(charset: string): string {
    const crypto = require('crypto');
    const randomIndex = crypto.randomInt(0, charset.length);
    return charset[randomIndex];
  }

  private shuffleString(str: string): string {
    const arr = str.split('');
    const crypto = require('crypto');
    
    for (let i = arr.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    return arr.join('');
  }

  private getCharsetSize(password: string): number {
    let size = 0;
    
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/\d/.test(password)) size += 10;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) size += 32;
    
    return size;
  }

  private formatTime(seconds: number): string {
    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
    
    return 'Centuries';
  }
}

// Export singleton instance
export const passwordManager = PasswordManager.getInstance();