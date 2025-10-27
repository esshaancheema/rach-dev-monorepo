import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { nanoid } from 'nanoid';

export class CryptoUtils {
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  static generateNanoId(length: number = 21): string {
    return nanoid(length);
  }

  static hashString(input: string, algorithm: string = 'sha256'): string {
    return createHash(algorithm).update(input).digest('hex');
  }

  static generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      otp += digits[randomIndex];
    }
    
    return otp;
  }

  static generateSecureCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }
    
    return code;
  }

  static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    
    return timingSafeEqual(bufferA, bufferB);
  }

  static maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
  }

  static maskPhone(phone: string): string {
    if (phone.length <= 4) {
      return `***${phone.slice(-2)}`;
    }
    return `***${phone.slice(-4)}`;
  }

  static generateDeviceFingerprint(userAgent: string, ip: string): string {
    const data = `${userAgent}:${ip}:${Date.now()}`;
    return this.hashString(data);
  }
}