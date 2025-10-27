import { z } from 'zod';
import { logger } from '../utils/logger';
import { CryptoUtils } from '../utils/crypto';

const OAuthEnvironmentConfigSchema = z.object({
  OAUTH_ISSUER: z.string().url().default('https://auth.zoptal.com'),
  OAUTH_DASHBOARD_SECRET: z.string().optional(),
  OAUTH_JWT_SECRET: z.string().optional(),
  OAUTH_COOKIE_SECRET: z.string().optional(),
  
  // Feature flags
  OAUTH_DEVICE_FLOW_ENABLED: z.string().transform(val => val !== 'false').default('true'),
  OAUTH_INTROSPECTION_ENABLED: z.string().transform(val => val !== 'false').default('true'),
  OAUTH_REVOCATION_ENABLED: z.string().transform(val => val !== 'false').default('true'),
  OAUTH_REGISTRATION_ENABLED: z.string().transform(val => val === 'true').default('false'),
  OAUTH_PKCE_REQUIRED: z.string().transform(val => val !== 'false').default('true'),
  OAUTH_DPOP_ENABLED: z.string().transform(val => val === 'true').default('false'),
  OAUTH_JARM_ENABLED: z.string().transform(val => val === 'true').default('false'),
  OAUTH_PAR_ENABLED: z.string().transform(val => val === 'true').default('false'),
  OAUTH_RAR_ENABLED: z.string().transform(val => val === 'true').default('false'),
  
  // Token lifetimes (in seconds)
  OAUTH_ACCESS_TOKEN_TTL: z.string().transform(val => parseInt(val) || 3600).default('3600'),
  OAUTH_REFRESH_TOKEN_TTL: z.string().transform(val => parseInt(val) || 1209600).default('1209600'), // 14 days
  OAUTH_ID_TOKEN_TTL: z.string().transform(val => parseInt(val) || 3600).default('3600'),
  OAUTH_AUTHORIZATION_CODE_TTL: z.string().transform(val => parseInt(val) || 600).default('600'), // 10 minutes
  OAUTH_DEVICE_CODE_TTL: z.string().transform(val => parseInt(val) || 600).default('600'), // 10 minutes
  
  // Security settings
  OAUTH_REQUIRE_HTTPS: z.string().transform(val => val !== 'false').default('true'),
  OAUTH_SECURE_COOKIES: z.string().transform(val => val !== 'false').default('true'),
  OAUTH_SAME_SITE_POLICY: z.enum(['strict', 'lax', 'none']).default('lax'),
  
  // Rate limiting
  OAUTH_RATE_LIMIT_WINDOW: z.string().transform(val => parseInt(val) || 900).default('900'), // 15 minutes
  OAUTH_RATE_LIMIT_MAX: z.string().transform(val => parseInt(val) || 100).default('100'),
  
  // Interaction URLs
  OAUTH_LOGIN_URL: z.string().optional(),
  OAUTH_CONSENT_URL: z.string().optional(),
  OAUTH_ERROR_URL: z.string().optional(),
  
  // JWKS settings
  OAUTH_JWKS_KEY_SIZE: z.string().transform(val => parseInt(val) || 2048).default('2048'),
  OAUTH_JWKS_ALGORITHM: z.enum(['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512']).default('RS256'),
  OAUTH_JWKS_ROTATION_DAYS: z.string().transform(val => parseInt(val) || 365).default('365'),
});

export type OAuthEnvironmentConfig = z.infer<typeof OAuthEnvironmentConfigSchema>;

export class OAuthConfigService {
  private static instance: OAuthConfigService;
  private config: OAuthEnvironmentConfig;

  private constructor() {
    this.loadConfiguration();
  }

  public static getInstance(): OAuthConfigService {
    if (!OAuthConfigService.instance) {
      OAuthConfigService.instance = new OAuthConfigService();
    }
    return OAuthConfigService.instance;
  }

  private loadConfiguration() {
    try {
      this.config = OAuthEnvironmentConfigSchema.parse({
        OAUTH_ISSUER: process.env.OAUTH_ISSUER,
        OAUTH_DASHBOARD_SECRET: process.env.OAUTH_DASHBOARD_SECRET,
        OAUTH_JWT_SECRET: process.env.OAUTH_JWT_SECRET,
        OAUTH_COOKIE_SECRET: process.env.OAUTH_COOKIE_SECRET,
        
        // Feature flags
        OAUTH_DEVICE_FLOW_ENABLED: process.env.OAUTH_DEVICE_FLOW_ENABLED,
        OAUTH_INTROSPECTION_ENABLED: process.env.OAUTH_INTROSPECTION_ENABLED,
        OAUTH_REVOCATION_ENABLED: process.env.OAUTH_REVOCATION_ENABLED,
        OAUTH_REGISTRATION_ENABLED: process.env.OAUTH_REGISTRATION_ENABLED,
        OAUTH_PKCE_REQUIRED: process.env.OAUTH_PKCE_REQUIRED,
        OAUTH_DPOP_ENABLED: process.env.OAUTH_DPOP_ENABLED,
        OAUTH_JARM_ENABLED: process.env.OAUTH_JARM_ENABLED,
        OAUTH_PAR_ENABLED: process.env.OAUTH_PAR_ENABLED,
        OAUTH_RAR_ENABLED: process.env.OAUTH_RAR_ENABLED,
        
        // Token lifetimes
        OAUTH_ACCESS_TOKEN_TTL: process.env.OAUTH_ACCESS_TOKEN_TTL,
        OAUTH_REFRESH_TOKEN_TTL: process.env.OAUTH_REFRESH_TOKEN_TTL,
        OAUTH_ID_TOKEN_TTL: process.env.OAUTH_ID_TOKEN_TTL,
        OAUTH_AUTHORIZATION_CODE_TTL: process.env.OAUTH_AUTHORIZATION_CODE_TTL,
        OAUTH_DEVICE_CODE_TTL: process.env.OAUTH_DEVICE_CODE_TTL,
        
        // Security settings
        OAUTH_REQUIRE_HTTPS: process.env.OAUTH_REQUIRE_HTTPS,
        OAUTH_SECURE_COOKIES: process.env.OAUTH_SECURE_COOKIES,
        OAUTH_SAME_SITE_POLICY: process.env.OAUTH_SAME_SITE_POLICY,
        
        // Rate limiting
        OAUTH_RATE_LIMIT_WINDOW: process.env.OAUTH_RATE_LIMIT_WINDOW,
        OAUTH_RATE_LIMIT_MAX: process.env.OAUTH_RATE_LIMIT_MAX,
        
        // Interaction URLs
        OAUTH_LOGIN_URL: process.env.OAUTH_LOGIN_URL,
        OAUTH_CONSENT_URL: process.env.OAUTH_CONSENT_URL,
        OAUTH_ERROR_URL: process.env.OAUTH_ERROR_URL,
        
        // JWKS settings
        OAUTH_JWKS_KEY_SIZE: process.env.OAUTH_JWKS_KEY_SIZE,
        OAUTH_JWKS_ALGORITHM: process.env.OAUTH_JWKS_ALGORITHM,
        OAUTH_JWKS_ROTATION_DAYS: process.env.OAUTH_JWKS_ROTATION_DAYS,
      });

      // Generate secrets if not provided
      if (!this.config.OAUTH_DASHBOARD_SECRET) {
        this.config.OAUTH_DASHBOARD_SECRET = CryptoUtils.generateSecureToken(32);
        logger.warn('Generated OAuth dashboard secret. Consider setting OAUTH_DASHBOARD_SECRET environment variable.');
      }

      if (!this.config.OAUTH_JWT_SECRET) {
        this.config.OAUTH_JWT_SECRET = CryptoUtils.generateSecureToken(32);
        logger.warn('Generated OAuth JWT secret. Consider setting OAUTH_JWT_SECRET environment variable.');
      }

      if (!this.config.OAUTH_COOKIE_SECRET) {
        this.config.OAUTH_COOKIE_SECRET = CryptoUtils.generateSecureToken(32);
        logger.warn('Generated OAuth cookie secret. Consider setting OAUTH_COOKIE_SECRET environment variable.');
      }

      logger.info('OAuth configuration loaded successfully', {
        issuer: this.config.OAUTH_ISSUER,
        features: {
          deviceFlow: this.config.OAUTH_DEVICE_FLOW_ENABLED,
          introspection: this.config.OAUTH_INTROSPECTION_ENABLED,
          revocation: this.config.OAUTH_REVOCATION_ENABLED,
          registration: this.config.OAUTH_REGISTRATION_ENABLED,
          pkce: this.config.OAUTH_PKCE_REQUIRED,
          dpop: this.config.OAUTH_DPOP_ENABLED,
          jarm: this.config.OAUTH_JARM_ENABLED,
          par: this.config.OAUTH_PAR_ENABLED,
          rar: this.config.OAUTH_RAR_ENABLED,
        },
        tokenTTL: {
          accessToken: this.config.OAUTH_ACCESS_TOKEN_TTL,
          refreshToken: this.config.OAUTH_REFRESH_TOKEN_TTL,
          idToken: this.config.OAUTH_ID_TOKEN_TTL,
          authorizationCode: this.config.OAUTH_AUTHORIZATION_CODE_TTL,
        },
      });
    } catch (error) {
      logger.error('Failed to load OAuth configuration', { error });
      throw new Error('Invalid OAuth configuration');
    }
  }

  public getConfig(): OAuthEnvironmentConfig {
    return { ...this.config };
  }

  public getOIDCConfig() {
    return {
      issuer: this.config.OAUTH_ISSUER,
      clients: [
        {
          client_id: 'zoptal-dashboard',
          client_secret: this.config.OAUTH_DASHBOARD_SECRET,
          redirect_uris: [
            'http://localhost:3000/auth/callback',
            'https://dashboard.zoptal.com/auth/callback',
            `${this.config.OAUTH_ISSUER}/auth/callback`,
          ],
          post_logout_redirect_uris: [
            'http://localhost:3000',
            'https://dashboard.zoptal.com',
            this.config.OAUTH_ISSUER,
          ],
          response_types: ['code'],
          grant_types: ['authorization_code', 'refresh_token'],
          token_endpoint_auth_method: 'client_secret_basic',
          scope: 'openid profile email phone offline_access',
          application_type: 'web',
          client_name: 'Zoptal Dashboard',
          client_uri: 'https://dashboard.zoptal.com',
          policy_uri: 'https://zoptal.com/privacy',
          tos_uri: 'https://zoptal.com/terms',
          backchannel_logout_uri: `${this.config.OAUTH_ISSUER}/backchannel_logout`,
          backchannel_logout_session_required: true,
        },
      ],
      features: {
        devInteractions: { enabled: process.env.NODE_ENV === 'development' },
        deviceFlow: { enabled: this.config.OAUTH_DEVICE_FLOW_ENABLED },
        introspection: { enabled: this.config.OAUTH_INTROSPECTION_ENABLED },
        revocation: { enabled: this.config.OAUTH_REVOCATION_ENABLED },
        jwtIntrospection: { enabled: this.config.OAUTH_INTROSPECTION_ENABLED },
        registration: { enabled: this.config.OAUTH_REGISTRATION_ENABLED },
        registrationManagement: { enabled: this.config.OAUTH_REGISTRATION_ENABLED },
        requestObjects: { enabled: true },
        pkce: { 
          enabled: this.config.OAUTH_PKCE_REQUIRED,
          required: () => this.config.OAUTH_PKCE_REQUIRED,
        },
        dPoP: { enabled: this.config.OAUTH_DPOP_ENABLED },
        jwtUserinfo: { enabled: true },
        webMessageResponseMode: { enabled: true },
        backchannelLogout: { enabled: true },
        frontchannelLogout: { enabled: true },
        
        // Token Exchange (RFC 8693)
        tokenExchange: {
          enabled: true,
          exchangeableTokens: ['access_token', 'refresh_token', 'id_token']
        },

        // Resource Indicators (RFC 8707)
        resourceIndicators: {
          enabled: true,
          defaultResource: () => this.config.OAUTH_ISSUER,
          getResourceServerInfo: (ctx: any, resource: string) => ({
            scope: 'read write',
            audience: resource,
          }),
        },

        // JWT Secured Authorization Response Mode (JARM)
        jarm: { enabled: this.config.OAUTH_JARM_ENABLED },

        // Pushed Authorization Requests (PAR)
        pushedAuthorizationRequests: { 
          enabled: this.config.OAUTH_PAR_ENABLED,
          requirePushedAuthorizationRequests: false,
        },

        // Rich Authorization Requests (RAR)
        richAuthorizationRequests: { enabled: this.config.OAUTH_RAR_ENABLED },
      },
      scopes: [
        'openid',
        'profile', 
        'email',
        'phone',
        'address',
        'offline_access',
        'read',
        'write',
        'admin',
      ],
      claims: {
        openid: ['sub'],
        profile: [
          'name', 
          'given_name', 
          'family_name', 
          'preferred_username', 
          'picture', 
          'website', 
          'gender', 
          'birthdate', 
          'zoneinfo', 
          'locale', 
          'updated_at'
        ],
        email: ['email', 'email_verified'],
        phone: ['phone_number', 'phone_number_verified'],
        address: ['address'],
      },
      ttl: {
        AccessToken: this.config.OAUTH_ACCESS_TOKEN_TTL,
        AuthorizationCode: this.config.OAUTH_AUTHORIZATION_CODE_TTL,
        ClientCredentials: this.config.OAUTH_ACCESS_TOKEN_TTL,
        DeviceCode: this.config.OAUTH_DEVICE_CODE_TTL,
        Grant: this.config.OAUTH_REFRESH_TOKEN_TTL,
        IdToken: this.config.OAUTH_ID_TOKEN_TTL,
        Interaction: 3600, // 1 hour
        RefreshToken: this.config.OAUTH_REFRESH_TOKEN_TTL,
        Session: this.config.OAUTH_REFRESH_TOKEN_TTL,
      },
      responseTypes: [
        'code',
        'id_token',
        'code id_token',
        'token',
        'token id_token',
        'code token',
        'code token id_token',
        'none',
      ],
      responseModes: [
        'query',
        'fragment', 
        'form_post',
        'web_message',
        ...(this.config.OAUTH_JARM_ENABLED ? ['jwt', 'query.jwt', 'fragment.jwt', 'form_post.jwt'] : []),
      ],
      grantTypes: new Set([
        'authorization_code',
        'client_credentials',
        'refresh_token',
        ...(this.config.OAUTH_DEVICE_FLOW_ENABLED ? ['urn:ietf:params:oauth:grant-type:device_code'] : []),
        'urn:ietf:params:oauth:grant-type:token-exchange',
      ]),
      subjectTypes: ['public'],
      tokenEndpointAuthMethods: [
        'client_secret_basic',
        'client_secret_post',
        'client_secret_jwt',
        'private_key_jwt',
        'none',
      ],
      revocationEndpointAuthMethods: [
        'client_secret_basic',
        'client_secret_post',
        'client_secret_jwt',
        'private_key_jwt',
      ],
      introspectionEndpointAuthMethods: [
        'client_secret_basic',
        'client_secret_post',
        'client_secret_jwt',
        'private_key_jwt',
      ],
      pkceMethods: ['S256'],
      interactions: {
        url: (ctx: any, interaction: any) => {
          return this.config.OAUTH_LOGIN_URL || `/interaction/${interaction.uid}`;
        },
      },
      cookies: {
        keys: [this.config.OAUTH_COOKIE_SECRET!],
        long: {
          signed: true,
          httpOnly: true,
          secure: this.config.OAUTH_SECURE_COOKIES,
          sameSite: this.config.OAUTH_SAME_SITE_POLICY,
          maxAge: this.config.OAUTH_REFRESH_TOKEN_TTL * 1000,
        },
        short: {
          signed: true,
          httpOnly: true,
          secure: this.config.OAUTH_SECURE_COOKIES,
          sameSite: this.config.OAUTH_SAME_SITE_POLICY,
          maxAge: 600000, // 10 minutes
        },
      },
    };
  }

  public validateConfig(): boolean {
    try {
      const config = this.getConfig();
      
      // Basic validation
      if (!config.OAUTH_ISSUER || !config.OAUTH_DASHBOARD_SECRET) {
        return false;
      }

      // Validate URLs
      try {
        new URL(config.OAUTH_ISSUER);
      } catch {
        return false;
      }

      // Validate TTL values
      if (config.OAUTH_ACCESS_TOKEN_TTL <= 0 || 
          config.OAUTH_REFRESH_TOKEN_TTL <= 0 ||
          config.OAUTH_AUTHORIZATION_CODE_TTL <= 0) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  public getSecurityHeaders() {
    return {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'no-referrer',
      'Strict-Transport-Security': this.config.OAUTH_REQUIRE_HTTPS 
        ? 'max-age=31536000; includeSubDomains; preload'
        : undefined,
    };
  }

  public reload() {
    logger.info('Reloading OAuth configuration');
    this.loadConfiguration();
  }
}

// Export singleton instance
export const oauthConfigService = OAuthConfigService.getInstance();