import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { authProviderRegistry } from '../services/auth-provider-registry.service';
import { authProviderManager } from '../services/auth-provider-manager.service';
import { DatabaseAuthProviderFactory } from '../providers/database-auth-provider';
import { OAuth2AuthProviderFactory } from '../providers/oauth2-auth-provider';
import { logger } from '../utils/logger';

export interface AuthProviderPluginOptions {
  autoRegisterProviders?: boolean;
  defaultProviders?: string[];
  enableEventLogging?: boolean;
}

const DEFAULT_OPTIONS: AuthProviderPluginOptions = {
  autoRegisterProviders: true,
  defaultProviders: ['database', 'oauth2'],
  enableEventLogging: true
};

/**
 * Authentication Provider Plugin
 * Initializes the auth provider system and registers built-in providers
 */
const authProviderPlugin: FastifyPluginAsync<AuthProviderPluginOptions> = async (
  fastify: FastifyInstance,
  options: AuthProviderPluginOptions = {}
) => {
  const pluginOptions = { ...DEFAULT_OPTIONS, ...options };

  // Register built-in provider factories
  if (pluginOptions.autoRegisterProviders) {
    registerBuiltInProviders();
  }

  // Decorate Fastify instance with auth provider services
  fastify.decorate('authProviderRegistry', authProviderRegistry);
  fastify.decorate('authProviderManager', authProviderManager);

  // Add authentication helper methods
  fastify.decorate('authenticateWithProvider', async function(
    credentials: any,
    context: any
  ) {
    return await authProviderManager.authenticate(credentials, context);
  });

  // Register event handlers if enabled
  if (pluginOptions.enableEventLogging) {
    authProviderManager.onEvent((event) => {
      logger.info('Auth provider event', {
        type: event.type,
        providerId: event.providerId,
        userId: event.userId,
        timestamp: event.timestamp
      });
    });
  }

  // Load any configured providers from environment or config
  await loadConfiguredProviders();

  logger.info('Auth provider plugin initialized', {
    autoRegisterProviders: pluginOptions.autoRegisterProviders,
    enableEventLogging: pluginOptions.enableEventLogging,
    registeredFactories: authProviderRegistry.getProviderNames().length
  });
};

/**
 * Register built-in authentication provider factories
 */
function registerBuiltInProviders(): void {
  try {
    // Register database auth provider
    authProviderRegistry.register('database', new DatabaseAuthProviderFactory());
    logger.info('Database auth provider factory registered');

    // Register OAuth2 auth provider
    authProviderRegistry.register('oauth2', new OAuth2AuthProviderFactory());
    logger.info('OAuth2 auth provider factory registered');

    // Additional built-in providers can be registered here
    // authProviderRegistry.register('ldap', new LdapAuthProviderFactory());
    // authProviderRegistry.register('saml', new SamlAuthProviderFactory());

  } catch (error) {
    logger.error('Failed to register built-in auth providers', error);
    throw error;
  }
}

/**
 * Load providers from environment configuration
 */
async function loadConfiguredProviders(): Promise<void> {
  try {
    // Load providers from environment variables or configuration files
    await loadProvidersFromEnvironment();
    
    logger.info('Configured auth providers loaded');
  } catch (error) {
    logger.error('Failed to load configured auth providers', error);
    // Don't throw here - providers can be configured via API
  }
}

/**
 * Load providers from environment variables
 */
async function loadProvidersFromEnvironment(): Promise<void> {
  // Example: Load Google OAuth provider from environment
  if (process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
    try {
      await authProviderManager.addProvider({
        name: 'google',
        displayName: 'Google',
        description: 'Google OAuth2 authentication',
        version: '1.0.0',
        type: 'oauth2',
        priority: 100,
        enabled: true,
        config: {
          clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
          clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
          scopes: ['openid', 'email', 'profile'],
          redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
          userMapping: {
            id: 'id',
            email: 'email',
            firstName: 'given_name',
            lastName: 'family_name',
            displayName: 'name',
            avatar: 'picture',
            emailVerified: 'verified_email'
          }
        },
        features: {
          login: true,
          register: true,
          passwordReset: false,
          profileUpdate: false,
          mfa: false,
          refresh: true,
          logout: false
        },
        security: {
          requireEmailVerification: false,
          sessionTtl: 3600,
          refreshTtl: 86400
        },
        ui: {
          icon: 'google',
          color: '#4285f4',
          loginButtonText: 'Sign in with Google',
          registerButtonText: 'Sign up with Google'
        }
      });
      
      logger.info('Google OAuth provider loaded from environment');
    } catch (error) {
      logger.warn('Failed to load Google OAuth provider from environment', error);
    }
  }

  // Example: Load GitHub OAuth provider from environment
  if (process.env.GITHUB_OAUTH_CLIENT_ID && process.env.GITHUB_OAUTH_CLIENT_SECRET) {
    try {
      await authProviderManager.addProvider({
        name: 'github',
        displayName: 'GitHub',
        description: 'GitHub OAuth2 authentication',
        version: '1.0.0',
        type: 'oauth2',
        priority: 110,
        enabled: true,
        config: {
          clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
          clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
          authorizationUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          userInfoUrl: 'https://api.github.com/user',
          scopes: ['user:email'],
          redirectUri: process.env.GITHUB_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/github/callback',
          userMapping: {
            id: 'id',
            email: 'email',
            username: 'login',
            displayName: 'name',
            avatar: 'avatar_url',
            emailVerified: 'email' // GitHub email is considered verified
          }
        },
        features: {
          login: true,
          register: true,
          passwordReset: false,
          profileUpdate: false,
          mfa: false,
          refresh: false,
          logout: false
        },
        security: {
          requireEmailVerification: false,
          sessionTtl: 3600
        },
        ui: {
          icon: 'github',
          color: '#24292e',
          loginButtonText: 'Sign in with GitHub',
          registerButtonText: 'Sign up with GitHub'
        }
      });
      
      logger.info('GitHub OAuth provider loaded from environment');
    } catch (error) {
      logger.warn('Failed to load GitHub OAuth provider from environment', error);
    }
  }

  // Example: Load default database provider
  if (process.env.ENABLE_DATABASE_AUTH !== 'false') {
    try {
      const existingDbProvider = authProviderManager.getProvider('database');
      if (!existingDbProvider) {
        await authProviderManager.addProvider({
          name: 'database',
          displayName: 'Email & Password',
          description: 'Database-based email and password authentication',
          version: '1.0.0',
          type: 'database',
          priority: 1, // Highest priority (lowest number)
          enabled: true,
          config: {
            tableName: 'users',
            emailField: 'email',
            passwordField: 'password',
            usernameField: 'username',
            enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
            requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
            passwordHashing: {
              algorithm: 'bcrypt',
              rounds: 12
            }
          },
          features: {
            login: true,
            register: process.env.ENABLE_REGISTRATION !== 'false',
            passwordReset: true,
            profileUpdate: true,
            mfa: false,
            refresh: true,
            logout: true
          },
          security: {
            requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
            sessionTtl: parseInt(process.env.SESSION_TTL || '3600'),
            refreshTtl: parseInt(process.env.REFRESH_TTL || '86400')
          },
          ui: {
            icon: 'email',
            color: '#6366f1',
            loginButtonText: 'Sign in with Email',
            registerButtonText: 'Sign up with Email'
          }
        });
        
        logger.info('Default database provider loaded from environment');
      }
    } catch (error) {
      logger.warn('Failed to load database provider from environment', error);
    }
  }
}

// Export as Fastify plugin
export default fp(authProviderPlugin, {
  name: 'auth-provider',
  fastify: '4.x'
});

// Extend Fastify type definitions
declare module 'fastify' {
  interface FastifyInstance {
    authProviderRegistry: typeof authProviderRegistry;
    authProviderManager: typeof authProviderManager;
    authenticateWithProvider: (credentials: any, context: any) => Promise<any>;
  }
}