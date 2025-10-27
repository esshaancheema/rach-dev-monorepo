import { PrismaClient } from '@zoptal/database';
import bcrypt from 'bcrypt';
import {
  AuthProviderPlugin,
  AuthProviderFactory,
  AuthProviderConfig,
  AuthProviderCredentials,
  AuthProviderContext,
  AuthProviderResult,
  AuthProviderUser
} from '../interfaces/auth-provider.interface';
import { logger } from '../utils/logger';
import { PasswordUtils } from '../utils/password';

export interface DatabaseAuthProviderConfig {
  tableName?: string;
  emailField?: string;
  passwordField?: string;
  usernameField?: string;
  enableRegistration?: boolean;
  requireEmailVerification?: boolean;
  passwordHashing?: {
    algorithm: 'bcrypt' | 'argon2' | 'scrypt';
    rounds?: number;
  };
  userMapping?: {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    emailVerified?: string;
    roles?: string;
    metadata?: string;
  };
}

/**
 * Database-based authentication provider
 * Authenticates users against a database table using email/username and password
 */
export class DatabaseAuthProvider implements AuthProviderPlugin {
  public readonly config: AuthProviderConfig;
  private dbConfig: DatabaseAuthProviderConfig;
  private prisma: PrismaClient;

  constructor(config: AuthProviderConfig) {
    this.config = config;
    this.dbConfig = config.config as DatabaseAuthProviderConfig;
    this.prisma = new (require('@zoptal/database').PrismaClient)();
  }

  async initialize(config: Record<string, any>): Promise<void> {
    this.dbConfig = { ...this.dbConfig, ...config };
    
    // Set defaults
    this.dbConfig.tableName = this.dbConfig.tableName || 'users';
    this.dbConfig.emailField = this.dbConfig.emailField || 'email';
    this.dbConfig.passwordField = this.dbConfig.passwordField || 'password';
    this.dbConfig.usernameField = this.dbConfig.usernameField || 'username';
    this.dbConfig.passwordHashing = this.dbConfig.passwordHashing || { algorithm: 'bcrypt', rounds: 12 };

    // Test database connection
    try {
      await this.prisma.$connect();
      logger.info('Database auth provider initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database auth provider', error);
      throw error;
    }
  }

  async authenticate(
    credentials: AuthProviderCredentials,
    context: AuthProviderContext
  ): Promise<AuthProviderResult> {
    try {
      if (credentials.type !== 'password') {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS_TYPE',
            message: 'Database provider only supports password authentication'
          }
        };
      }

      const { identifier, secret } = credentials;
      if (!identifier || !secret) {
        return {
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: 'Email/username and password are required'
          }
        };
      }

      // Find user by email or username
      const user = await this.findUserByIdentifier(identifier);
      if (!user) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Invalid email/username or password'
          }
        };
      }

      // Verify password
      const passwordValid = await this.verifyPassword(secret, user[this.dbConfig.passwordField!]);
      if (!passwordValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Invalid email/username or password'
          }
        };
      }

      // Check if email verification is required
      if (this.dbConfig.requireEmailVerification) {
        const emailVerifiedField = this.dbConfig.userMapping?.emailVerified || 'emailVerified';
        if (!user[emailVerifiedField]) {
          return {
            success: false,
            error: {
              code: 'EMAIL_NOT_VERIFIED',
              message: 'Email verification is required'
            }
          };
        }
      }

      // Map database user to AuthProviderUser
      const authUser = this.mapDatabaseUserToAuthUser(user);

      // Update last login
      await this.updateLastLogin(user.id);

      return {
        success: true,
        user: authUser,
        metadata: {
          sessionTtl: this.config.security.sessionTtl || 3600,
          refreshable: true,
          providerData: {
            source: 'database',
            table: this.dbConfig.tableName
          }
        }
      };
    } catch (error) {
      logger.error('Database authentication failed', error);
      return {
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication failed due to internal error'
        }
      };
    }
  }

  async register(
    userData: Partial<AuthProviderUser> & { credentials: AuthProviderCredentials },
    context: AuthProviderContext
  ): Promise<AuthProviderResult> {
    try {
      if (!this.dbConfig.enableRegistration) {
        return {
          success: false,
          error: {
            code: 'REGISTRATION_DISABLED',
            message: 'User registration is disabled for this provider'
          }
        };
      }

      const { credentials, email, username, firstName, lastName } = userData;
      
      if (!email || !credentials.secret) {
        return {
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Email and password are required for registration'
          }
        };
      }

      // Check if user already exists
      const existingUser = await this.findUserByIdentifier(email);
      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'USER_ALREADY_EXISTS',
            message: 'A user with this email already exists'
          }
        };
      }

      // Validate password strength
      const passwordValidation = PasswordUtils.validatePassword(credentials.secret);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: passwordValidation.errors.join(', ')
          }
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(credentials.secret);

      // Create user record
      const newUser = await this.createUser({
        email,
        username,
        firstName,
        lastName,
        password: hashedPassword,
        emailVerified: !this.dbConfig.requireEmailVerification
      });

      const authUser = this.mapDatabaseUserToAuthUser(newUser);

      return {
        success: true,
        user: authUser,
        metadata: {
          requiresMfa: false,
          sessionTtl: this.config.security.sessionTtl || 3600,
          providerData: {
            source: 'database',
            table: this.dbConfig.tableName,
            created: true
          }
        }
      };
    } catch (error) {
      logger.error('Database registration failed', error);
      return {
        success: false,
        error: {
          code: 'REGISTRATION_ERROR',
          message: 'Registration failed due to internal error'
        }
      };
    }
  }

  async getUser(userId: string, context: AuthProviderContext): Promise<AuthProviderUser | null> {
    try {
      const user = await this.findUserById(userId);
      return user ? this.mapDatabaseUserToAuthUser(user) : null;
    } catch (error) {
      logger.error('Failed to get user from database', error);
      return null;
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<AuthProviderUser>,
    context: AuthProviderContext
  ): Promise<AuthProviderUser> {
    try {
      // Map AuthProviderUser updates to database fields
      const dbUpdates: Record<string, any> = {};
      
      if (updates.email) dbUpdates[this.dbConfig.emailField!] = updates.email;
      if (updates.username) dbUpdates[this.dbConfig.usernameField!] = updates.username;
      if (updates.firstName) dbUpdates.firstName = updates.firstName;
      if (updates.lastName) dbUpdates.lastName = updates.lastName;
      if (updates.avatar) dbUpdates.avatar = updates.avatar;
      if (updates.phoneNumber) dbUpdates.phoneNumber = updates.phoneNumber;
      if (updates.metadata) dbUpdates.metadata = JSON.stringify(updates.metadata);

      const updatedUser = await this.updateUserInDatabase(userId, dbUpdates);
      return this.mapDatabaseUserToAuthUser(updatedUser);
    } catch (error) {
      logger.error('Failed to update user in database', error);
      throw error;
    }
  }

  async resetPassword(
    identifier: string,
    newPassword: string,
    resetToken: string,
    context: AuthProviderContext
  ): Promise<AuthProviderResult> {
    try {
      // Verify reset token (this would typically check a reset_tokens table)
      const isValidToken = await this.verifyResetToken(identifier, resetToken);
      if (!isValidToken) {
        return {
          success: false,
          error: {
            code: 'INVALID_RESET_TOKEN',
            message: 'Invalid or expired password reset token'
          }
        };
      }

      // Validate new password
      const passwordValidation = PasswordUtils.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: passwordValidation.errors.join(', ')
          }
        };
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password in database
      await this.updatePasswordInDatabase(identifier, hashedPassword);

      // Invalidate reset token
      await this.invalidateResetToken(resetToken);

      return {
        success: true,
        metadata: {
          providerData: {
            passwordReset: true,
            timestamp: new Date()
          }
        }
      };
    } catch (error) {
      logger.error('Password reset failed', error);
      return {
        success: false,
        error: {
          code: 'PASSWORD_RESET_ERROR',
          message: 'Password reset failed due to internal error'
        }
      };
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details?: Record<string, any> }> {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'healthy',
        details: {
          database: 'connected',
          table: this.dbConfig.tableName,
          lastCheck: new Date()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          database: 'disconnected',
          error: error.message,
          lastCheck: new Date()
        }
      };
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Database auth provider cleaned up successfully');
    } catch (error) {
      logger.error('Failed to cleanup database auth provider', error);
    }
  }

  /**
   * Private helper methods
   */
  private async findUserByIdentifier(identifier: string): Promise<any> {
    // In a real implementation, this would use proper Prisma queries
    // For now, we'll simulate the database query
    return null;
  }

  private async findUserById(userId: string): Promise<any> {
    // In a real implementation, this would use proper Prisma queries
    return null;
  }

  private async createUser(userData: Record<string, any>): Promise<any> {
    // In a real implementation, this would use proper Prisma queries
    const user = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return user;
  }

  private async updateUserInDatabase(userId: string, updates: Record<string, any>): Promise<any> {
    // In a real implementation, this would use proper Prisma queries
    return { id: userId, ...updates, updatedAt: new Date() };
  }

  private async updateLastLogin(userId: string): Promise<void> {
    // In a real implementation, this would update the lastLoginAt field
  }

  private async updatePasswordInDatabase(identifier: string, hashedPassword: string): Promise<void> {
    // In a real implementation, this would update the password field
  }

  private async verifyResetToken(identifier: string, token: string): Promise<boolean> {
    // In a real implementation, this would verify the reset token
    return true;
  }

  private async invalidateResetToken(token: string): Promise<void> {
    // In a real implementation, this would invalidate the reset token
  }

  private async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      switch (this.dbConfig.passwordHashing?.algorithm) {
        case 'bcrypt':
        default:
          return await bcrypt.compare(plainPassword, hashedPassword);
      }
    } catch (error) {
      logger.error('Password verification failed', error);
      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      switch (this.dbConfig.passwordHashing?.algorithm) {
        case 'bcrypt':
        default:
          const rounds = this.dbConfig.passwordHashing?.rounds || 12;
          return await bcrypt.hash(password, rounds);
      }
    } catch (error) {
      logger.error('Password hashing failed', error);
      throw error;
    }
  }

  private mapDatabaseUserToAuthUser(dbUser: any): AuthProviderUser {
    const mapping = this.dbConfig.userMapping || {};
    
    return {
      id: dbUser[mapping.id || 'id'],
      email: dbUser[mapping.email || this.dbConfig.emailField || 'email'],
      username: dbUser[mapping.username || this.dbConfig.usernameField || 'username'],
      firstName: dbUser[mapping.firstName || 'firstName'],
      lastName: dbUser[mapping.lastName || 'lastName'],
      displayName: dbUser.displayName || `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim(),
      avatar: dbUser[mapping.avatar || 'avatar'],
      emailVerified: Boolean(dbUser[mapping.emailVerified || 'emailVerified']),
      phoneNumber: dbUser.phoneNumber,
      phoneVerified: Boolean(dbUser.phoneVerified),
      locale: dbUser.locale,
      timezone: dbUser.timezone,
      metadata: dbUser[mapping.metadata || 'metadata'] ? 
        JSON.parse(dbUser[mapping.metadata || 'metadata']) : undefined,
      roles: dbUser[mapping.roles || 'roles'] ? 
        JSON.parse(dbUser[mapping.roles || 'roles']) : undefined,
      lastLoginAt: dbUser.lastLoginAt,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };
  }
}

/**
 * Factory for creating database auth provider instances
 */
export class DatabaseAuthProviderFactory implements AuthProviderFactory {
  create(config: AuthProviderConfig): AuthProviderPlugin {
    return new DatabaseAuthProvider(config);
  }

  validateConfig(config: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields
    if (config.tableName && typeof config.tableName !== 'string') {
      errors.push('tableName must be a string');
    }

    if (config.emailField && typeof config.emailField !== 'string') {
      errors.push('emailField must be a string');
    }

    if (config.passwordField && typeof config.passwordField !== 'string') {
      errors.push('passwordField must be a string');
    }

    if (config.passwordHashing) {
      if (!['bcrypt', 'argon2', 'scrypt'].includes(config.passwordHashing.algorithm)) {
        errors.push('passwordHashing.algorithm must be bcrypt, argon2, or scrypt');
      }
      
      if (config.passwordHashing.rounds && 
          (typeof config.passwordHashing.rounds !== 'number' || 
           config.passwordHashing.rounds < 4 || 
           config.passwordHashing.rounds > 20)) {
        errors.push('passwordHashing.rounds must be a number between 4 and 20');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getConfigTemplate(): Record<string, any> {
    return {
      tableName: 'users',
      emailField: 'email',
      passwordField: 'password',
      usernameField: 'username',
      enableRegistration: true,
      requireEmailVerification: false,
      passwordHashing: {
        algorithm: 'bcrypt',
        rounds: 12
      },
      userMapping: {
        id: 'id',
        email: 'email',
        username: 'username',
        firstName: 'firstName',
        lastName: 'lastName',
        avatar: 'avatar',
        emailVerified: 'emailVerified',
        roles: 'roles',
        metadata: 'metadata'
      }
    };
  }

  getProviderInfo(): any {
    return {
      name: 'database',
      type: 'database',
      description: 'Database-based authentication using email/username and password',
      version: '1.0.0',
      author: 'Zoptal Auth Service',
      supportedFeatures: [
        'login',
        'register',
        'passwordReset',
        'profileUpdate',
        'healthCheck'
      ]
    };
  }
}