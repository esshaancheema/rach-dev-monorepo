import * as crypto from 'crypto';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export interface SecurityScanResult {
  safe: boolean;
  threats: SecurityThreat[];
  warnings: SecurityWarning[];
  score: number; // 0-100, higher is safer
}

export interface SecurityThreat {
  type: ThreatType;
  severity: ThreatSeverity;
  description: string;
  location?: string;
  recommendation: string;
}

export interface SecurityWarning {
  type: string;
  description: string;
  location?: string;
}

export enum ThreatType {
  MALWARE = 'malware',
  SUSPICIOUS_CODE = 'suspicious_code',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  DATA_EXFILTRATION = 'data_exfiltration',
  REMOTE_CODE_EXECUTION = 'remote_code_execution',
  PATH_TRAVERSAL = 'path_traversal',
}

export enum ThreatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class SecurityService {
  // Malicious patterns to detect
  private readonly maliciousPatterns = [
    { pattern: /eval\s*\(/gi, type: ThreatType.REMOTE_CODE_EXECUTION, severity: ThreatSeverity.HIGH },
    { pattern: /exec\s*\(/gi, type: ThreatType.REMOTE_CODE_EXECUTION, severity: ThreatSeverity.HIGH },
    { pattern: /system\s*\(/gi, type: ThreatType.REMOTE_CODE_EXECUTION, severity: ThreatSeverity.HIGH },
    { pattern: /shell_exec/gi, type: ThreatType.REMOTE_CODE_EXECUTION, severity: ThreatSeverity.HIGH },
    { pattern: /passthru/gi, type: ThreatType.REMOTE_CODE_EXECUTION, severity: ThreatSeverity.HIGH },
    { pattern: /require\(['"]child_process['"]\)/gi, type: ThreatType.REMOTE_CODE_EXECUTION, severity: ThreatSeverity.MEDIUM },
    { pattern: /spawn\s*\(/gi, type: ThreatType.REMOTE_CODE_EXECUTION, severity: ThreatSeverity.MEDIUM },
    { pattern: /\.\.\/\.\.\//g, type: ThreatType.PATH_TRAVERSAL, severity: ThreatSeverity.HIGH },
    { pattern: /document\.cookie/gi, type: ThreatType.DATA_EXFILTRATION, severity: ThreatSeverity.MEDIUM },
    { pattern: /localStorage\.getItem/gi, type: ThreatType.DATA_EXFILTRATION, severity: ThreatSeverity.LOW },
    { pattern: /XMLHttpRequest/gi, type: ThreatType.DATA_EXFILTRATION, severity: ThreatSeverity.LOW },
    { pattern: /fetch\s*\(/gi, type: ThreatType.DATA_EXFILTRATION, severity: ThreatSeverity.LOW },
    { pattern: /atob\s*\(/gi, type: ThreatType.SUSPICIOUS_CODE, severity: ThreatSeverity.MEDIUM },
    { pattern: /btoa\s*\(/gi, type: ThreatType.SUSPICIOUS_CODE, severity: ThreatSeverity.LOW },
    { pattern: /unescape\s*\(/gi, type: ThreatType.SUSPICIOUS_CODE, severity: ThreatSeverity.MEDIUM },
    { pattern: /String\.fromCharCode/gi, type: ThreatType.SUSPICIOUS_CODE, severity: ThreatSeverity.MEDIUM },
  ];

  // Suspicious file extensions
  private readonly suspiciousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.dll', '.sys', '.drv', '.msi', '.dmg', '.pkg', '.deb', '.rpm'
  ];

  // Suspicious file names
  private readonly suspiciousFileNames = [
    'keylogger', 'backdoor', 'trojan', 'virus', 'malware', 'rootkit',
    'bot', 'worm', 'ransomware', 'spyware', 'adware'
  ];

  public async scanPackage(
    packageBuffer: Buffer,
    files: string[]
  ): Promise<SecurityScanResult> {
    const result: SecurityScanResult = {
      safe: true,
      threats: [],
      warnings: [],
      score: 100,
    };

    try {
      // Scan file names and extensions
      await this.scanFileNames(files, result);

      // Scan package content
      await this.scanPackageContent(packageBuffer, result);

      // Scan for suspicious patterns in files
      await this.scanFiles(files, packageBuffer, result);

      // Calculate final score
      result.score = this.calculateSecurityScore(result);
      result.safe = result.score >= 70 && result.threats.length === 0;

      logger.info('Security scan completed', {
        safe: result.safe,
        score: result.score,
        threats: result.threats.length,
        warnings: result.warnings.length,
      });

    } catch (error) {
      logger.error('Security scan failed', {
        error: error.message,
      });
      
      result.safe = false;
      result.threats.push({
        type: ThreatType.MALWARE,
        severity: ThreatSeverity.HIGH,
        description: 'Security scan failed - package rejected',
        recommendation: 'Contact support if you believe this is an error',
      });
    }

    return result;
  }

  public async scanContent(content: string, filename?: string): Promise<SecurityScanResult> {
    const result: SecurityScanResult = {
      safe: true,
      threats: [],
      warnings: [],
      score: 100,
    };

    // Scan for malicious patterns
    for (const { pattern, type, severity } of this.maliciousPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        result.threats.push({
          type,
          severity,
          description: `Detected potentially malicious code pattern: ${pattern.source}`,
          location: filename,
          recommendation: 'Remove or replace the suspicious code',
        });
      }
    }

    // Check for obfuscated code
    const obfuscationWarnings = this.detectObfuscation(content);
    result.warnings.push(...obfuscationWarnings.map(warning => ({
      type: 'obfuscation',
      description: warning,
      location: filename,
    })));

    // Calculate score
    result.score = this.calculateSecurityScore(result);
    result.safe = result.score >= 70 && result.threats.length === 0;

    return result;
  }

  public encryptSensitiveData(data: string): string {
    try {
      const cipher = crypto.createCipher('aes-256-cbc', config.security.encryptionKey);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      logger.error('Failed to encrypt sensitive data', {
        error: error.message,
      });
      throw error;
    }
  }

  public decryptSensitiveData(encryptedData: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', config.security.encryptionKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.error('Failed to decrypt sensitive data', {
        error: error.message,
      });
      throw error;
    }
  }

  public generateSecretKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  public hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Private methods
  private async scanFileNames(files: string[], result: SecurityScanResult): Promise<void> {
    for (const file of files) {
      const fileName = file.toLowerCase();
      const fileExt = fileName.substring(fileName.lastIndexOf('.'));

      // Check for suspicious extensions
      if (this.suspiciousExtensions.includes(fileExt)) {
        result.threats.push({
          type: ThreatType.MALWARE,
          severity: ThreatSeverity.HIGH,
          description: `Suspicious file extension detected: ${fileExt}`,
          location: file,
          recommendation: 'Remove executable files from the package',
        });
      }

      // Check for suspicious file names
      for (const suspiciousName of this.suspiciousFileNames) {
        if (fileName.includes(suspiciousName)) {
          result.threats.push({
            type: ThreatType.MALWARE,
            severity: ThreatSeverity.HIGH,
            description: `Suspicious file name detected: ${file}`,
            location: file,
            recommendation: 'Rename or remove the suspicious file',
          });
        }
      }

      // Check for hidden files
      if (file.startsWith('.') && file !== '.gitignore' && file !== '.npmignore') {
        result.warnings.push({
          type: 'hidden_file',
          description: `Hidden file detected: ${file}`,
          location: file,
        });
      }

      // Check for path traversal
      if (file.includes('../') || file.includes('..\\')) {
        result.threats.push({
          type: ThreatType.PATH_TRAVERSAL,
          severity: ThreatSeverity.HIGH,
          description: `Path traversal detected in file path: ${file}`,
          location: file,
          recommendation: 'Use relative paths within the package directory',
        });
      }
    }
  }

  private async scanPackageContent(packageBuffer: Buffer, result: SecurityScanResult): Promise<void> {
    // Convert buffer to string for pattern matching
    const content = packageBuffer.toString('utf8', 0, Math.min(packageBuffer.length, 100000));

    // Scan for malicious patterns
    for (const { pattern, type, severity } of this.maliciousPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        result.threats.push({
          type,
          severity,
          description: `Detected potentially malicious code pattern: ${pattern.source}`,
          recommendation: 'Remove or replace the suspicious code',
        });
      }
    }

    // Check for Base64 encoded content (potential obfuscation)
    const base64Pattern = /[A-Za-z0-9+/]{50,}={0,2}/g;
    const base64Matches = content.match(base64Pattern);
    if (base64Matches && base64Matches.length > 5) {
      result.warnings.push({
        type: 'obfuscation',
        description: 'Large amounts of Base64 encoded content detected (possible obfuscation)',
      });
    }

    // Check for minified/obfuscated JavaScript
    if (this.isObfuscatedCode(content)) {
      result.warnings.push({
        type: 'obfuscation',
        description: 'Potentially obfuscated or minified code detected',
      });
    }
  }

  private async scanFiles(files: string[], packageBuffer: Buffer, result: SecurityScanResult): Promise<void> {
    // In a real implementation, this would extract and scan individual files
    // For now, we'll just add some additional checks
    
    const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.ts'));
    const phpFiles = files.filter(f => f.endsWith('.php'));
    const pythonFiles = files.filter(f => f.endsWith('.py'));

    if (phpFiles.length > 0) {
      result.warnings.push({
        type: 'language',
        description: 'PHP files detected - ensure they are necessary for the integration',
      });
    }

    if (pythonFiles.length > 0) {
      result.warnings.push({
        type: 'language',
        description: 'Python files detected - ensure they are necessary for the integration',
      });
    }

    // Check for excessive number of files
    if (files.length > 500) {
      result.warnings.push({
        type: 'complexity',
        description: `Package contains many files (${files.length}) - consider optimizing`,
      });
    }
  }

  private isObfuscatedCode(content: string): boolean {
    // Check for signs of obfuscation
    const indicators = [
      /\w{50,}/g, // Very long variable names
      /[a-zA-Z_$][a-zA-Z0-9_$]*\[['"][a-zA-Z0-9_$]+['"]\]/g, // Bracket notation access
      /['"][a-zA-Z0-9+/=]{20,}['"]/g, // Long strings (potential base64)
      /;\s*;/g, // Empty statements
    ];

    let score = 0;
    for (const pattern of indicators) {
      const matches = content.match(pattern);
      if (matches) {
        score += matches.length;
      }
    }

    // Also check for very long lines (often a sign of minification)
    const lines = content.split('\n');
    const longLines = lines.filter(line => line.length > 200);
    if (longLines.length > lines.length * 0.1) {
      score += 10;
    }

    return score > 15;
  }

  private detectObfuscation(content: string): string[] {
    const warnings: string[] = [];

    // Check for hex encoding
    const hexPattern = /\\x[0-9a-fA-F]{2}/g;
    const hexMatches = content.match(hexPattern);
    if (hexMatches && hexMatches.length > 10) {
      warnings.push('Hex encoded strings detected (possible obfuscation)');
    }

    // Check for unicode escapes
    const unicodePattern = /\\u[0-9a-fA-F]{4}/g;
    const unicodeMatches = content.match(unicodePattern);
    if (unicodeMatches && unicodeMatches.length > 5) {
      warnings.push('Unicode escape sequences detected (possible obfuscation)');
    }

    // Check for string concatenation obfuscation
    const concatPattern = /['"][a-zA-Z0-9]*['"](\s*\+\s*['"][a-zA-Z0-9]*['"]){3,}/g;
    const concatMatches = content.match(concatPattern);
    if (concatMatches && concatMatches.length > 0) {
      warnings.push('String concatenation obfuscation detected');
    }

    return warnings;
  }

  private calculateSecurityScore(result: SecurityScanResult): number {
    let score = 100;

    // Deduct points for threats
    for (const threat of result.threats) {
      switch (threat.severity) {
        case ThreatSeverity.CRITICAL:
          score -= 50;
          break;
        case ThreatSeverity.HIGH:
          score -= 30;
          break;
        case ThreatSeverity.MEDIUM:
          score -= 15;
          break;
        case ThreatSeverity.LOW:
          score -= 5;
          break;
      }
    }

    // Deduct points for warnings
    score -= result.warnings.length * 2;

    return Math.max(0, score);
  }
}