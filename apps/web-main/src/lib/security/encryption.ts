// Advanced Encryption and Security Utilities for Zoptal Platform
import { analytics } from '@/lib/analytics/tracker';

export interface EncryptionResult {
  data: string;
  iv: string;
  tag?: string;
  algorithm: string;
}

export interface HashResult {
  hash: string;
  salt?: string;
  algorithm: string;
  iterations?: number;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  algorithm: string;
}

export interface SignatureResult {
  signature: string;
  algorithm: string;
}

export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'connect-src'?: string[];
  'font-src'?: string[];
  'object-src'?: string[];
  'media-src'?: string[];
  'frame-src'?: string[];
  'child-src'?: string[];
  'worker-src'?: string[];
  'manifest-src'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
  'frame-ancestors'?: string[];
  'report-uri'?: string[];
  'report-to'?: string[];
}

export class EncryptionService {
  private static instance: EncryptionService;
  private readonly AES_ALGORITHM = 'AES-GCM';
  private readonly RSA_ALGORITHM = 'RSA-OAEP';
  private readonly HASH_ALGORITHM = 'SHA-256';
  private readonly SIGNATURE_ALGORITHM = 'RSA-PSS';
  private readonly PBKDF2_ITERATIONS = 100000;

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Generate a secure random key
   */
  async generateKey(keyLength: number = 256): Promise<CryptoKey> {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: this.AES_ALGORITHM,
          length: keyLength,
        },
        true,
        ['encrypt', 'decrypt']
      );

      analytics.track({
        name: 'encryption_key_generated',
        category: 'security',
        properties: {
          algorithm: this.AES_ALGORITHM,
          key_length: keyLength
        }
      });

      return key;
    } catch (error) {
      console.error('Key generation failed:', error);
      throw new Error('Failed to generate encryption key');
    }
  }

  /**
   * Generate RSA key pair
   */
  async generateKeyPair(keySize: number = 2048): Promise<KeyPair> {
    try {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: this.RSA_ALGORITHM,
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: this.HASH_ALGORITHM,
        },
        true,
        ['encrypt', 'decrypt']
      );

      const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      const result: KeyPair = {
        publicKey: this.arrayBufferToBase64(publicKey),
        privateKey: this.arrayBufferToBase64(privateKey),
        algorithm: this.RSA_ALGORITHM
      };

      analytics.track({
        name: 'key_pair_generated',
        category: 'security',
        properties: {
          algorithm: this.RSA_ALGORITHM,
          key_size: keySize
        }
      });

      return result;
    } catch (error) {
      console.error('Key pair generation failed:', error);
      throw new Error('Failed to generate key pair');
    }
  }

  /**
   * Encrypt data using AES-GCM
   */
  async encryptData(data: string, key?: CryptoKey): Promise<EncryptionResult> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Generate key if not provided
      const encryptionKey = key || await this.generateKey();

      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.AES_ALGORITHM,
          iv: iv,
        },
        encryptionKey,
        dataBuffer
      );

      const result: EncryptionResult = {
        data: this.arrayBufferToBase64(encryptedData),
        iv: this.arrayBufferToBase64(iv),
        algorithm: this.AES_ALGORITHM
      };

      analytics.track({
        name: 'data_encrypted',
        category: 'security',
        properties: {
          algorithm: this.AES_ALGORITHM,
          data_size: data.length
        }
      });

      return result;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  async decryptData(encryptedResult: EncryptionResult, key: CryptoKey): Promise<string> {
    try {
      const encryptedData = this.base64ToArrayBuffer(encryptedResult.data);
      const iv = this.base64ToArrayBuffer(encryptedResult.iv);

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.AES_ALGORITHM,
          iv: iv,
        },
        key,
        encryptedData
      );

      const decoder = new TextDecoder();
      const result = decoder.decode(decryptedData);

      analytics.track({
        name: 'data_decrypted',
        category: 'security',
        properties: {
          algorithm: encryptedResult.algorithm
        }
      });

      return result;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt data with RSA public key
   */
  async encryptWithPublicKey(data: string, publicKeyBase64: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Import public key
      const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyBase64);
      const publicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        {
          name: this.RSA_ALGORITHM,
          hash: this.HASH_ALGORITHM,
        },
        false,
        ['encrypt']
      );

      const encryptedData = await crypto.subtle.encrypt(
        {
          name: this.RSA_ALGORITHM,
        },
        publicKey,
        dataBuffer
      );

      return this.arrayBufferToBase64(encryptedData);
    } catch (error) {
      console.error('RSA encryption failed:', error);
      throw new Error('Failed to encrypt with public key');
    }
  }

  /**
   * Decrypt data with RSA private key
   */
  async decryptWithPrivateKey(encryptedData: string, privateKeyBase64: string): Promise<string> {
    try {
      const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);

      // Import private key
      const privateKeyBuffer = this.base64ToArrayBuffer(privateKeyBase64);
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
          name: this.RSA_ALGORITHM,
          hash: this.HASH_ALGORITHM,
        },
        false,
        ['decrypt']
      );

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.RSA_ALGORITHM,
        },
        privateKey,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('RSA decryption failed:', error);
      throw new Error('Failed to decrypt with private key');
    }
  }

  /**
   * Hash data using SHA-256
   */
  async hashData(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const hashBuffer = await crypto.subtle.digest(this.HASH_ALGORITHM, dataBuffer);
      return this.arrayBufferToHex(hashBuffer);
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Hash password with salt using PBKDF2
   */
  async hashPassword(password: string, salt?: string): Promise<HashResult> {
    try {
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);

      // Generate salt if not provided
      const saltBuffer = salt ? 
        encoder.encode(salt) : 
        crypto.getRandomValues(new Uint8Array(32));

      // Import password as key material
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
      );

      // Derive key using PBKDF2
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: this.PBKDF2_ITERATIONS,
          hash: this.HASH_ALGORITHM,
        },
        keyMaterial,
        256
      );

      const result: HashResult = {
        hash: this.arrayBufferToHex(derivedBits),
        salt: salt || this.arrayBufferToHex(saltBuffer),
        algorithm: 'PBKDF2',
        iterations: this.PBKDF2_ITERATIONS
      };

      analytics.track({
        name: 'password_hashed',
        category: 'security',
        properties: {
          algorithm: 'PBKDF2',
          iterations: this.PBKDF2_ITERATIONS
        }
      });

      return result;
    } catch (error) {
      console.error('Password hashing failed:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hashResult: HashResult): Promise<boolean> {
    try {
      const newHash = await this.hashPassword(password, hashResult.salt);
      
      const isValid = newHash.hash === hashResult.hash;

      analytics.track({
        name: 'password_verified',
        category: 'security',
        properties: {
          valid: isValid
        }
      });

      return isValid;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * Generate digital signature
   */
  async signData(data: string, privateKeyBase64: string): Promise<SignatureResult> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Import private key for signing
      const privateKeyBuffer = this.base64ToArrayBuffer(privateKeyBase64);
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
          name: this.SIGNATURE_ALGORITHM,
          hash: this.HASH_ALGORITHM,
        },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign(
        {
          name: this.SIGNATURE_ALGORITHM,
          saltLength: 32,
        },
        privateKey,
        dataBuffer
      );

      return {
        signature: this.arrayBufferToBase64(signature),
        algorithm: this.SIGNATURE_ALGORITHM
      };
    } catch (error) {
      console.error('Signing failed:', error);
      throw new Error('Failed to sign data');
    }
  }

  /**
   * Verify digital signature
   */
  async verifySignature(
    data: string, 
    signatureResult: SignatureResult, 
    publicKeyBase64: string
  ): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const signatureBuffer = this.base64ToArrayBuffer(signatureResult.signature);

      // Import public key for verification
      const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyBase64);
      const publicKey = await crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        {
          name: this.SIGNATURE_ALGORITHM,
          hash: this.HASH_ALGORITHM,
        },
        false,
        ['verify']
      );

      const isValid = await crypto.subtle.verify(
        {
          name: this.SIGNATURE_ALGORITHM,
          saltLength: 32,
        },
        publicKey,
        signatureBuffer,
        dataBuffer
      );

      analytics.track({
        name: 'signature_verified',
        category: 'security',
        properties: {
          valid: isValid,
          algorithm: signatureResult.algorithm
        }
      });

      return isValid;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return this.arrayBufferToHex(array);
  }

  /**
   * Generate UUID v4
   */
  generateUUID(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);

    // Set version (4) and variant bits
    array[6] = (array[6] & 0x0f) | 0x40;
    array[8] = (array[8] & 0x3f) | 0x80;

    const hex = this.arrayBufferToHex(array);
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32)
    ].join('-');
  }

  /**
   * Secure data wipe
   */
  secureWipe(data: any): void {
    if (typeof data === 'string') {
      // Overwrite string memory (limited effectiveness in JS)
      data = '\0'.repeat(data.length);
    } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
      // Overwrite array buffer
      const view = new Uint8Array(data);
      crypto.getRandomValues(view);
      view.fill(0);
    }
  }

  /**
   * Content Security Policy generator
   */
  generateCSP(directives: CSPDirectives): string {
    const cspParts: string[] = [];

    for (const [directive, sources] of Object.entries(directives)) {
      if (sources && sources.length > 0) {
        cspParts.push(`${directive} ${sources.join(' ')}`);
      }
    }

    return cspParts.join('; ');
  }

  /**
   * Security headers for HTTP responses
   */
  getSecurityHeaders(): Record<string, string> {
    const csp = this.generateCSP({
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'", 'https://api.zoptal.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    });

    return {
      'Content-Security-Policy': csp,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    };
  }

  /**
   * Input sanitization
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * SQL injection prevention (for display purposes - use parameterized queries in practice)
   */
  escapeSQLString(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '\\;')
      .replace(/--/g, '\\--')
      .replace(/\/\*/g, '\\/\\*')
      .replace(/\*\//g, '\\*\\/')
      .replace(/xp_/gi, 'x p_');
  }

  /**
   * Rate limiting token bucket
   */
  createRateLimiter(maxTokens: number, refillRate: number) {
    let tokens = maxTokens;
    let lastRefill = Date.now();

    return {
      consume: (tokensRequested: number = 1): boolean => {
        const now = Date.now();
        const timePassed = now - lastRefill;
        
        // Refill tokens
        tokens = Math.min(maxTokens, tokens + (timePassed * refillRate / 1000));
        lastRefill = now;

        if (tokens >= tokensRequested) {
          tokens -= tokensRequested;
          return true;
        }

        return false;
      },
      getTokens: (): number => tokens,
      reset: (): void => {
        tokens = maxTokens;
        lastRefill = Date.now();
      }
    };
  }

  /**
   * Private utility methods
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Export singleton instance
export const encryption = EncryptionService.getInstance();

// Utility functions for common security tasks
export const securityUtils = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },

  /**
   * Validate URL format
   */
  isValidURL: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check password strength
   */
  checkPasswordStrength: (password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    if (password.length >= 12) score += 1;

    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      score = Math.max(0, score - 2);
      feedback.push('Avoid common passwords');
    }

    return {
      score,
      feedback,
      isStrong: score >= 4
    };
  },

  /**
   * Generate CSRF token
   */
  generateCSRFToken: (): string => {
    return encryption.generateSecureToken(32);
  },

  /**
   * Validate CSRF token (in real app, compare with session)
   */
  validateCSRFToken: (token: string, sessionToken: string): boolean => {
    return token === sessionToken;
  },

  /**
   * Time-safe string comparison
   */
  timeSafeEqual: (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
};