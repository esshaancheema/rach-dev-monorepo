import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as yauzl from 'yauzl';
import * as tar from 'tar';
import * as JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { config } from '../config/config';
import { IntegrationManifest } from '../models/integration.model';

export interface PackageInfo {
  url: string;
  hash: string;
  size: number;
  extractedPath: string;
}

export interface PackageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: IntegrationManifest;
  files: string[];
  size: number;
}

export class PackageService {
  private uploadPath: string;
  private tempPath: string;

  constructor() {
    this.uploadPath = config.upload.uploadPath;
    this.tempPath = config.upload.tempPath;
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  public async uploadPackage(
    packageBuffer: Buffer,
    manifest: IntegrationManifest
  ): Promise<PackageInfo> {
    try {
      // Generate unique filename
      const hash = crypto.createHash('sha256').update(packageBuffer).digest('hex');
      const filename = `${manifest.name}-${manifest.version}-${hash.substring(0, 8)}.zip`;
      const filePath = path.join(this.uploadPath, filename);

      // Write file to disk
      await fs.promises.writeFile(filePath, packageBuffer);

      // Extract to temporary directory for validation
      const extractedPath = await this.extractPackage(packageBuffer, manifest);

      const packageInfo: PackageInfo = {
        url: `/packages/${filename}`,
        hash,
        size: packageBuffer.length,
        extractedPath,
      };

      logger.info('Package uploaded successfully', {
        filename,
        size: packageBuffer.length,
        hash: hash.substring(0, 8),
      });

      return packageInfo;

    } catch (error) {
      logger.error('Failed to upload package', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  public async validatePackage(packageBuffer: Buffer): Promise<PackageValidationResult> {
    const result: PackageValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
      files: [],
      size: packageBuffer.length,
    };

    try {
      // Check file size
      if (packageBuffer.length > config.upload.maxFileSize) {
        result.errors.push(`Package size (${packageBuffer.length}) exceeds maximum allowed size (${config.upload.maxFileSize})`);
        result.valid = false;
      }

      // Detect package format and extract
      const extractedFiles = await this.extractAndValidateStructure(packageBuffer);
      result.files = extractedFiles;

      // Find and validate manifest
      const manifestPath = extractedFiles.find(file => 
        file === 'manifest.json' || file === 'package.json'
      );

      if (!manifestPath) {
        result.errors.push('No manifest.json or package.json found in package root');
        result.valid = false;
        return result;
      }

      // Extract and parse manifest
      try {
        const manifest = await this.extractManifest(packageBuffer);
        result.manifest = manifest;
        
        // Validate manifest
        const manifestValidation = this.validateManifest(manifest);
        result.errors.push(...manifestValidation.errors);
        result.warnings.push(...manifestValidation.warnings);
        
        if (manifestValidation.errors.length > 0) {
          result.valid = false;
        }

      } catch (error) {
        result.errors.push(`Failed to parse manifest: ${error.message}`);
        result.valid = false;
      }

      // Validate file structure
      const structureValidation = this.validateFileStructure(extractedFiles, result.manifest);
      result.errors.push(...structureValidation.errors);
      result.warnings.push(...structureValidation.warnings);
      
      if (structureValidation.errors.length > 0) {
        result.valid = false;
      }

      // Security validation
      const securityValidation = this.validateSecurity(extractedFiles, packageBuffer);
      result.errors.push(...securityValidation.errors);
      result.warnings.push(...securityValidation.warnings);
      
      if (securityValidation.errors.length > 0) {
        result.valid = false;
      }

    } catch (error) {
      result.errors.push(`Package validation failed: ${error.message}`);
      result.valid = false;
    }

    return result;
  }

  public async extractManifest(packageBuffer: Buffer): Promise<IntegrationManifest> {
    try {
      const zip = await JSZip.loadAsync(packageBuffer);
      
      // Try manifest.json first, then package.json
      let manifestFile = zip.file('manifest.json');
      if (!manifestFile) {
        manifestFile = zip.file('package.json');
      }

      if (!manifestFile) {
        throw new Error('No manifest.json or package.json found in package');
      }

      const manifestContent = await manifestFile.async('text');
      const manifest = JSON.parse(manifestContent);

      // Convert package.json format to manifest format if needed
      if (!manifest.platformVersion && manifest.engines?.zoptal) {
        manifest.platformVersion = manifest.engines.zoptal;
      }

      return manifest as IntegrationManifest;

    } catch (error) {
      logger.error('Failed to extract manifest', {
        error: error.message,
      });
      throw error;
    }
  }

  public async extractPackage(
    packageBuffer: Buffer,
    manifest: IntegrationManifest
  ): Promise<string> {
    try {
      const extractId = uuidv4();
      const extractPath = path.join(this.tempPath, extractId);
      
      // Create extraction directory
      await fs.promises.mkdir(extractPath, { recursive: true });

      // Extract based on package format
      if (this.isZipPackage(packageBuffer)) {
        await this.extractZip(packageBuffer, extractPath);
      } else if (this.isTarPackage(packageBuffer)) {
        await this.extractTar(packageBuffer, extractPath);
      } else {
        throw new Error('Unsupported package format');
      }

      logger.info('Package extracted successfully', {
        manifestName: manifest.name,
        extractPath,
      });

      return extractPath;

    } catch (error) {
      logger.error('Failed to extract package', {
        error: error.message,
      });
      throw error;
    }
  }

  public async getPackageFiles(extractedPath: string): Promise<string[]> {
    try {
      const files: string[] = [];
      
      const walkDir = async (dir: string, basePath: string = '') => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          if (entry.isDirectory()) {
            await walkDir(fullPath, relativePath);
          } else {
            files.push(relativePath);
          }
        }
      };

      await walkDir(extractedPath);
      return files;

    } catch (error) {
      logger.error('Failed to get package files', {
        extractedPath,
        error: error.message,
      });
      throw error;
    }
  }

  public async cleanupExtractedPackage(extractedPath: string): Promise<void> {
    try {
      await fs.promises.rm(extractedPath, { recursive: true, force: true });
      logger.debug('Cleaned up extracted package', { extractedPath });
    } catch (error) {
      logger.warn('Failed to clean up extracted package', {
        extractedPath,
        error: error.message,
      });
    }
  }

  public async getPackageContent(extractedPath: string, filePath: string): Promise<string> {
    try {
      const fullPath = path.join(extractedPath, filePath);
      
      // Security check - ensure file is within extracted directory
      const resolvedPath = path.resolve(fullPath);
      const resolvedExtractPath = path.resolve(extractedPath);
      
      if (!resolvedPath.startsWith(resolvedExtractPath)) {
        throw new Error('Path traversal attempt detected');
      }

      const content = await fs.promises.readFile(fullPath, 'utf-8');
      return content;

    } catch (error) {
      logger.error('Failed to get package content', {
        extractedPath,
        filePath,
        error: error.message,
      });
      throw error;
    }
  }

  public calculatePackageHash(packageBuffer: Buffer): string {
    return crypto.createHash('sha256').update(packageBuffer).digest('hex');
  }

  // Private methods
  private ensureDirectories(): void {
    try {
      if (!fs.existsSync(this.uploadPath)) {
        fs.mkdirSync(this.uploadPath, { recursive: true });
      }
      
      if (!fs.existsSync(this.tempPath)) {
        fs.mkdirSync(this.tempPath, { recursive: true });
      }
    } catch (error) {
      logger.error('Failed to create directories', {
        uploadPath: this.uploadPath,
        tempPath: this.tempPath,
        error: error.message,
      });
      throw error;
    }
  }

  private isZipPackage(buffer: Buffer): boolean {
    // ZIP files start with "PK"
    return buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4B;
  }

  private isTarPackage(buffer: Buffer): boolean {
    // TAR files have "ustar" at offset 257
    return buffer.length >= 262 && 
           buffer.slice(257, 262).toString() === 'ustar';
  }

  private async extractZip(packageBuffer: Buffer, extractPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      yauzl.fromBuffer(packageBuffer, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }

        if (!zipfile) {
          reject(new Error('Failed to open ZIP file'));
          return;
        }

        zipfile.readEntry();

        zipfile.on('entry', (entry) => {
          const entryPath = path.join(extractPath, entry.fileName);
          
          // Security check
          if (!entryPath.startsWith(extractPath)) {
            reject(new Error('Path traversal attempt detected in ZIP entry'));
            return;
          }

          if (entry.fileName.endsWith('/')) {
            // Directory entry
            fs.mkdir(entryPath, { recursive: true }, (err) => {
              if (err) {
                reject(err);
                return;
              }
              zipfile.readEntry();
            });
          } else {
            // File entry
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(err);
                return;
              }

              if (!readStream) {
                reject(new Error('Failed to open read stream'));
                return;
              }

              // Ensure directory exists
              const dirPath = path.dirname(entryPath);
              fs.mkdir(dirPath, { recursive: true }, (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                const writeStream = fs.createWriteStream(entryPath);
                readStream.pipe(writeStream);

                writeStream.on('close', () => {
                  zipfile.readEntry();
                });

                writeStream.on('error', reject);
              });
            });
          }
        });

        zipfile.on('end', () => {
          resolve();
        });

        zipfile.on('error', reject);
      });
    });
  }

  private async extractTar(packageBuffer: Buffer, extractPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const extract = tar.x({
        cwd: extractPath,
        filter: (path) => {
          // Security check for path traversal
          const normalizedPath = path.replace(/\\/g, '/');
          return !normalizedPath.includes('../') && !normalizedPath.startsWith('/');
        },
      });

      extract.on('error', reject);
      extract.on('end', resolve);

      // Create readable stream from buffer
      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(packageBuffer);
      stream.push(null);

      stream.pipe(extract);
    });
  }

  private async extractAndValidateStructure(packageBuffer: Buffer): Promise<string[]> {
    try {
      const zip = await JSZip.loadAsync(packageBuffer);
      const files: string[] = [];

      zip.forEach((relativePath, file) => {
        if (!file.dir) {
          files.push(relativePath);
        }
      });

      return files;

    } catch (error) {
      // Try as TAR if ZIP fails
      try {
        return await this.extractTarFileList(packageBuffer);
      } catch (tarError) {
        throw new Error(`Unsupported package format: ${error.message}`);
      }
    }
  }

  private async extractTarFileList(packageBuffer: Buffer): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const files: string[] = [];
      
      const list = tar.t({
        onentry: (entry) => {
          if (entry.type === 'File') {
            files.push(entry.path);
          }
        },
      });

      list.on('error', reject);
      list.on('end', () => resolve(files));

      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(packageBuffer);
      stream.push(null);

      stream.pipe(list);
    });
  }

  private validateManifest(manifest: IntegrationManifest): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!manifest.name) errors.push('Manifest missing required field: name');
    if (!manifest.version) errors.push('Manifest missing required field: version');
    if (!manifest.description) errors.push('Manifest missing required field: description');
    if (!manifest.author) errors.push('Manifest missing required field: author');

    // Version format
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      errors.push('Version must follow semantic versioning (x.y.z)');
    }

    // Platform version
    if (!manifest.platformVersion) {
      warnings.push('Platform version not specified, assuming compatibility with all versions');
    }

    // Permissions
    if (manifest.permissions) {
      for (const [index, permission] of manifest.permissions.entries()) {
        if (!permission.name) {
          errors.push(`Permission ${index}: name is required`);
        }
        if (!permission.description) {
          errors.push(`Permission ${index}: description is required`);
        }
      }
    }

    // Hooks
    if (manifest.hooks) {
      for (const [index, hook] of manifest.hooks.entries()) {
        if (!hook.name) {
          errors.push(`Hook ${index}: name is required`);
        }
        if (!hook.trigger) {
          errors.push(`Hook ${index}: trigger is required`);
        }
        if (!hook.handler) {
          errors.push(`Hook ${index}: handler is required`);
        }
        
        // Validate timeout
        if (hook.timeout && hook.timeout > config.plugins.executionTimeout) {
          warnings.push(`Hook ${index}: timeout exceeds maximum allowed (${config.plugins.executionTimeout}ms)`);
        }
      }
    }

    // Events
    if (manifest.events) {
      for (const [index, event] of manifest.events.entries()) {
        if (!event.name) {
          errors.push(`Event ${index}: name is required`);
        }
        if (!event.schema) {
          warnings.push(`Event ${index}: schema not provided`);
        }
      }
    }

    return { errors, warnings };
  }

  private validateFileStructure(
    files: string[],
    manifest?: IntegrationManifest
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required files
    const hasManifest = files.some(file => 
      file === 'manifest.json' || file === 'package.json'
    );
    
    if (!hasManifest) {
      errors.push('Package must contain manifest.json or package.json');
    }

    // Check main entry point
    if (manifest?.main) {
      if (!files.includes(manifest.main)) {
        errors.push(`Main entry point not found: ${manifest.main}`);
      }
    }

    // Check for suspicious files
    const suspiciousFiles = files.filter(file => 
      file.includes('..') || 
      file.startsWith('/') ||
      file.includes('node_modules') ||
      file.endsWith('.exe') ||
      file.endsWith('.bat') ||
      file.endsWith('.sh')
    );

    if (suspiciousFiles.length > 0) {
      errors.push(`Suspicious files detected: ${suspiciousFiles.join(', ')}`);
    }

    // Check file count
    if (files.length > 1000) {
      warnings.push(`Package contains many files (${files.length}), consider optimizing`);
    }

    // Check for documentation
    const hasReadme = files.some(file => 
      file.toLowerCase().includes('readme')
    );
    
    if (!hasReadme) {
      warnings.push('Package should include README documentation');
    }

    return { errors, warnings };
  }

  private validateSecurity(
    files: string[],
    packageBuffer: Buffer
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for binary files
    const binaryExtensions = ['.exe', '.dll', '.so', '.dylib', '.bin'];
    const binaryFiles = files.filter(file => 
      binaryExtensions.some(ext => file.toLowerCase().endsWith(ext))
    );

    if (binaryFiles.length > 0) {
      errors.push(`Binary files not allowed: ${binaryFiles.join(', ')}`);
    }

    // Check for hidden files
    const hiddenFiles = files.filter(file => 
      path.basename(file).startsWith('.')
    );

    if (hiddenFiles.length > 0) {
      warnings.push(`Hidden files detected: ${hiddenFiles.join(', ')}`);
    }

    // Basic malware scan (simple string matching)
    const packageString = packageBuffer.toString('utf-8', 0, Math.min(packageBuffer.length, 10000));
    const suspiciousPatterns = [
      'eval(',
      'exec(',
      'system(',
      'shell_exec',
      'passthru',
      'require("child_process")',
    ];

    const foundPatterns = suspiciousPatterns.filter(pattern => 
      packageString.includes(pattern)
    );

    if (foundPatterns.length > 0) {
      warnings.push(`Potentially dangerous code patterns found: ${foundPatterns.join(', ')}`);
    }

    return { errors, warnings };
  }
}