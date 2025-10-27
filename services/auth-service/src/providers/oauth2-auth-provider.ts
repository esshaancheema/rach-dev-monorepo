import axios from 'axios';
import crypto from 'crypto';
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
import { cacheManager } from '../utils/redis';

export interface OAuth2ProviderConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  redirectUri: string;
  state?: {
    enabled: boolean;
    secret: string;
  };
  pkce?: {
    enabled: boolean;
    method: 'S256' | 'plain';
  };
  userMapping: {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatar?: string;
    emailVerified?: string;
  };
  tokenStorage?: {
    enabled: boolean;
    encryptionKey?: string;
  };
}

/**
 * OAuth2/OpenID Connect authentication provider
 */
export class OAuth2AuthProvider implements AuthProviderPlugin {
  public readonly config: AuthProviderConfig;
  private oauth2Config: OAuth2ProviderConfig;
  private stateCache = new Map<string, { timestamp: number; data: any }>();

  constructor(config: AuthProviderConfig) {
    this.config = config;
    this.oauth2Config = config.config as OAuth2ProviderConfig;
  }

  async initialize(config: Record<string, any>): Promise<void> {
    this.oauth2Config = { ...this.oauth2Config, ...config };
    
    // Validate required configuration
    if (!this.oauth2Config.clientId || !this.oauth2Config.clientSecret) {
      throw new Error('OAuth2 provider requires clientId and clientSecret');
    }

    if (!this.oauth2Config.authorizationUrl || !this.oauth2Config.tokenUrl || !this.oauth2Config.userInfoUrl) {
      throw new Error('OAuth2 provider requires authorizationUrl, tokenUrl, and userInfoUrl');
    }

    // Set defaults
    this.oauth2Config.scopes = this.oauth2Config.scopes || ['openid', 'email', 'profile'];
    this.oauth2Config.state = this.oauth2Config.state || { enabled: true, secret: crypto.randomBytes(32).toString('hex') };
    this.oauth2Config.pkce = this.oauth2Config.pkce || { enabled: true, method: 'S256' };

    logger.info('OAuth2 auth provider initialized successfully', {
      provider: this.config.name,
      scopes: this.oauth2Config.scopes
    });
  }

  async authenticate(
    credentials: AuthProviderCredentials,
    context: AuthProviderContext
  ): Promise<AuthProviderResult> {
    if (credentials.type !== 'oauth') {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS_TYPE',
          message: 'OAuth2 provider only supports oauth authentication'
        }
      };
    }

    // OAuth2 authentication requires a different flow (authorization code)
    // This method would typically not be called directly for OAuth2
    return {
      success: false,
      error: {
        code: 'OAUTH_FLOW_REQUIRED',
        message: 'OAuth2 authentication requires authorization code flow'
      }
    };
  }

  getAuthorizationUrl(redirectUri: string, state: string, scopes?: string[]): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.oauth2Config.clientId,
      redirect_uri: redirectUri || this.oauth2Config.redirectUri,
      scope: (scopes || this.oauth2Config.scopes).join(' '),
      state: state
    });

    // Add PKCE if enabled
    if (this.oauth2Config.pkce?.enabled) {
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = this.generateCodeChallenge(codeVerifier);
      
      // Store code verifier for later use
      this.stateCache.set(state, {
        timestamp: Date.now(),
        data: { codeVerifier, redirectUri }
      });

      params.append('code_challenge', codeChallenge);
      params.append('code_challenge_method', this.oauth2Config.pkce.method);
    }

    return `${this.oauth2Config.authorizationUrl}?${params.toString()}`;
  }

  async handleOAuthCallback(
    code: string,
    state: string,
    context: AuthProviderContext
  ): Promise<AuthProviderResult> {
    try {
      // Validate state parameter
      if (this.oauth2Config.state?.enabled && !this.validateState(state)) {
        return {
          success: false,
          error: {
            code: 'INVALID_STATE',
            message: 'Invalid or expired state parameter'
          }
        };
      }

      // Get stored PKCE data if applicable
      const stateData = this.stateCache.get(state);
      let codeVerifier: string | undefined;
      let redirectUri = this.oauth2Config.redirectUri;

      if (this.oauth2Config.pkce?.enabled && stateData) {
        codeVerifier = stateData.data.codeVerifier;
        redirectUri = stateData.data.redirectUri || redirectUri;
        this.stateCache.delete(state); // Clean up
      }

      // Exchange authorization code for access token
      const tokenResult = await this.exchangeCodeForToken(code, redirectUri, codeVerifier);
      if (!tokenResult.success) {
        return tokenResult;
      }

      // Get user information using access token
      const userInfo = await this.getUserInfo(tokenResult.accessToken!);
      if (!userInfo) {
        return {
          success: false,
          error: {
            code: 'USER_INFO_ERROR',
            message: 'Failed to retrieve user information'
          }
        };
      }

      // Map provider user to AuthProviderUser
      const authUser = this.mapProviderUserToAuthUser(userInfo);

      // Store tokens if enabled
      let tokenData: Record<string, any> | undefined;
      if (this.oauth2Config.tokenStorage?.enabled) {
        tokenData = {
          accessToken: this.encryptToken(tokenResult.accessToken!),
          refreshToken: tokenResult.refreshToken ? this.encryptToken(tokenResult.refreshToken) : undefined,
          expiresAt: tokenResult.expiresIn ? new Date(Date.now() + tokenResult.expiresIn * 1000) : undefined
        };
      }

      return {
        success: true,
        user: authUser,
        metadata: {
          sessionTtl: this.config.security.sessionTtl || 3600,
          refreshable: !!tokenResult.refreshToken,
          customClaims: userInfo,
          providerData: {
            source: 'oauth2',
            provider: this.config.name,
            tokenData
          }
        }
      };
    } catch (error) {
      logger.error('OAuth2 callback handling failed', error);
      return {
        success: false,
        error: {
          code: 'OAUTH_CALLBACK_ERROR',
          message: 'Failed to process OAuth2 callback'
        }
      };
    }
  }

  async refresh(
    refreshToken: string,
    context: AuthProviderContext
  ): Promise<AuthProviderResult> {
    try {
      // Decrypt refresh token if needed
      const decryptedToken = this.oauth2Config.tokenStorage?.enabled 
        ? this.decryptToken(refreshToken) 
        : refreshToken;

      const tokenResult = await this.refreshAccessToken(decryptedToken);
      if (!tokenResult.success) {
        return tokenResult;
      }

      // Get updated user information
      const userInfo = await this.getUserInfo(tokenResult.accessToken!);
      if (!userInfo) {
        return {
          success: false,
          error: {
            code: 'USER_INFO_ERROR',
            message: 'Failed to retrieve updated user information'
          }
        };
      }

      const authUser = this.mapProviderUserToAuthUser(userInfo);

      return {
        success: true,
        user: authUser,
        metadata: {
          sessionTtl: this.config.security.sessionTtl || 3600,
          refreshable: true,
          providerData: {
            source: 'oauth2',
            provider: this.config.name,
            refreshed: true
          }
        }
      };
    } catch (error) {
      logger.error('OAuth2 token refresh failed', error);
      return {
        success: false,
        error: {
          code: 'TOKEN_REFRESH_ERROR',
          message: 'Failed to refresh access token'
        }
      };
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details?: Record<string, any> }> {
    try {
      // Test OAuth2 endpoints connectivity
      const authUrlTest = await this.testEndpoint(this.oauth2Config.authorizationUrl);
      const tokenUrlTest = await this.testEndpoint(this.oauth2Config.tokenUrl);
      
      const allHealthy = authUrlTest && tokenUrlTest;
      
      return {
        status: allHealthy ? 'healthy' : 'degraded',
        details: {
          authorizationEndpoint: authUrlTest ? 'accessible' : 'unreachable',
          tokenEndpoint: tokenUrlTest ? 'accessible' : 'unreachable',
          lastCheck: new Date()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          lastCheck: new Date()
        }
      };
    }
  }

  async cleanup(): Promise<void> {
    // Clear state cache
    this.stateCache.clear();
    logger.info('OAuth2 auth provider cleaned up successfully');
  }

  /**
   * Private helper methods
   */
  private async exchangeCodeForToken(
    code: string, 
    redirectUri: string, 
    codeVerifier?: string
  ): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    error?: any;
  }> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.oauth2Config.clientId,
        client_secret: this.oauth2Config.clientSecret,
        code,
        redirect_uri: redirectUri
      });

      if (codeVerifier) {
        params.append('code_verifier', codeVerifier);
      }

      const response = await axios.post(this.oauth2Config.tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      const data = response.data;
      
      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in
      };
    } catch (error) {
      logger.error('Token exchange failed', error);
      return {
        success: false,
        error: {
          code: 'TOKEN_EXCHANGE_ERROR',
          message: 'Failed to exchange authorization code for access token'
        }
      };
    }
  }

  private async refreshAccessToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    error?: any;
  }> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.oauth2Config.clientId,
        client_secret: this.oauth2Config.clientSecret,
        refresh_token: refreshToken
      });

      const response = await axios.post(this.oauth2Config.tokenUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      });

      const data = response.data;
      
      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Some providers don't return new refresh token
        expiresIn: data.expires_in
      };
    } catch (error) {
      logger.error('Token refresh failed', error);
      return {
        success: false,
        error: {
          code: 'TOKEN_REFRESH_ERROR',
          message: 'Failed to refresh access token'
        }
      };
    }
  }

  private async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(this.oauth2Config.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get user info', error);
      return null;
    }
  }

  private async testEndpoint(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      return response.status < 500;
    } catch (error) {
      return false;
    }
  }

  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private generateCodeChallenge(verifier: string): string {
    if (this.oauth2Config.pkce?.method === 'S256') {
      return crypto.createHash('sha256').update(verifier).digest('base64url');
    }
    return verifier; // plain method
  }

  private validateState(state: string): boolean {
    if (!this.oauth2Config.state?.enabled) {
      return true;
    }

    // Simple state validation - in production, this should be more sophisticated
    return state.length > 10;
  }

  private encryptToken(token: string): string {
    if (!this.oauth2Config.tokenStorage?.encryptionKey) {
      return token;
    }

    // Simple encryption - in production, use proper encryption
    const cipher = crypto.createCipher('aes256', this.oauth2Config.tokenStorage.encryptionKey);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptToken(encryptedToken: string): string {
    if (!this.oauth2Config.tokenStorage?.encryptionKey) {
      return encryptedToken;
    }

    // Simple decryption - in production, use proper decryption
    const decipher = crypto.createDecipher('aes256', this.oauth2Config.tokenStorage.encryptionKey);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private mapProviderUserToAuthUser(providerUser: any): AuthProviderUser {
    const mapping = this.oauth2Config.userMapping;
    
    return {
      id: providerUser[mapping.id] || providerUser.sub || providerUser.id,
      email: providerUser[mapping.email] || providerUser.email,
      username: providerUser[mapping.username || 'preferred_username'] || providerUser.preferred_username,
      displayName: providerUser[mapping.displayName || 'name'] || providerUser.name,
      firstName: providerUser[mapping.firstName || 'given_name'] || providerUser.given_name,
      lastName: providerUser[mapping.lastName || 'family_name'] || providerUser.family_name,
      avatar: providerUser[mapping.avatar || 'picture'] || providerUser.picture,
      emailVerified: Boolean(providerUser[mapping.emailVerified || 'email_verified'] || providerUser.email_verified),
      phoneNumber: providerUser.phone_number,
      phoneVerified: Boolean(providerUser.phone_number_verified),
      locale: providerUser.locale,
      timezone: providerUser.zoneinfo,
      metadata: {
        provider: this.config.name,
        providerId: providerUser[mapping.id] || providerUser.sub,
        originalData: providerUser
      },
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

/**
 * Factory for creating OAuth2 auth provider instances
 */
export class OAuth2AuthProviderFactory implements AuthProviderFactory {
  create(config: AuthProviderConfig): AuthProviderPlugin {
    return new OAuth2AuthProvider(config);
  }

  validateConfig(config: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!config.clientId || typeof config.clientId !== 'string') {
      errors.push('clientId is required and must be a string');
    }

    if (!config.clientSecret || typeof config.clientSecret !== 'string') {
      errors.push('clientSecret is required and must be a string');
    }

    if (!config.authorizationUrl || typeof config.authorizationUrl !== 'string') {
      errors.push('authorizationUrl is required and must be a string');
    }

    if (!config.tokenUrl || typeof config.tokenUrl !== 'string') {
      errors.push('tokenUrl is required and must be a string');
    }

    if (!config.userInfoUrl || typeof config.userInfoUrl !== 'string') {
      errors.push('userInfoUrl is required and must be a string');
    }

    if (!config.userMapping || typeof config.userMapping !== 'object') {
      errors.push('userMapping is required and must be an object');
    } else {
      if (!config.userMapping.id) {
        errors.push('userMapping.id is required');
      }
      if (!config.userMapping.email) {
        errors.push('userMapping.email is required');
      }
    }

    // Validate URLs
    const urlFields = ['authorizationUrl', 'tokenUrl', 'userInfoUrl'];
    for (const field of urlFields) {
      if (config[field]) {
        try {
          new URL(config[field]);
        } catch {
          errors.push(`${field} must be a valid URL`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getConfigTemplate(): Record<string, any> {
    return {
      clientId: 'your-oauth2-client-id',
      clientSecret: 'your-oauth2-client-secret',
      authorizationUrl: 'https://provider.com/oauth2/authorize',
      tokenUrl: 'https://provider.com/oauth2/token',
      userInfoUrl: 'https://provider.com/oauth2/userinfo',
      redirectUri: 'https://yourapp.com/auth/callback',
      scopes: ['openid', 'email', 'profile'],
      state: {
        enabled: true,
        secret: 'your-state-secret'
      },
      pkce: {
        enabled: true,
        method: 'S256'
      },
      userMapping: {
        id: 'sub',
        email: 'email',
        username: 'preferred_username',
        firstName: 'given_name',
        lastName: 'family_name',
        displayName: 'name',
        avatar: 'picture',
        emailVerified: 'email_verified'
      },
      tokenStorage: {
        enabled: false,
        encryptionKey: 'your-encryption-key'
      }
    };
  }

  getProviderInfo(): any {
    return {
      name: 'oauth2',
      type: 'oauth2',
      description: 'OAuth2/OpenID Connect authentication provider',
      version: '1.0.0',
      author: 'Zoptal Auth Service',
      supportedFeatures: [
        'login',
        'refresh',
        'healthCheck',
        'oauthCallback',
        'authorizationUrl'
      ]
    };
  }
}