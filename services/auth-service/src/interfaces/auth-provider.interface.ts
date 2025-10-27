/**
 * Core interfaces for custom authentication provider plugin system
 */

export interface AuthProviderUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  locale?: string;
  timezone?: string;
  metadata?: Record<string, any>;
  roles?: string[];
  permissions?: string[];
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthProviderCredentials {
  type: 'password' | 'token' | 'oauth' | 'saml' | 'ldap' | 'custom';
  identifier: string; // email, username, token, etc.
  secret?: string; // password, token secret, etc.
  metadata?: Record<string, any>;
  mfa?: {
    code: string;
    method: 'totp' | 'sms' | 'email' | 'backup';
  };
}

export interface AuthProviderResult {
  success: boolean;
  user?: AuthProviderUser;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    requiresMfa?: boolean;
    mfaMethods?: string[];
    sessionTtl?: number;
    refreshable?: boolean;
    customClaims?: Record<string, any>;
    providerData?: Record<string, any>;
  };
}

export interface AuthProviderConfig {
  name: string;
  displayName: string;
  description?: string;
  version: string;
  type: 'oauth2' | 'oidc' | 'saml' | 'ldap' | 'database' | 'api' | 'custom';
  priority: number; // Lower numbers = higher priority
  enabled: boolean;
  
  // Provider-specific configuration
  config: Record<string, any>;
  
  // Feature flags
  features: {
    login: boolean;
    register: boolean;
    passwordReset: boolean;
    profileUpdate: boolean;
    mfa: boolean;
    refresh: boolean;
    logout: boolean;
  };
  
  // Security settings
  security: {
    requireEmailVerification: boolean;
    allowedDomains?: string[];
    blockedDomains?: string[];
    requireMfa?: boolean;
    sessionTtl?: number;
    refreshTtl?: number;
  };
  
  // UI configuration
  ui: {
    icon?: string;
    color?: string;
    hidden?: boolean;
    loginButtonText?: string;
    registerButtonText?: string;
  };
}

export interface AuthProviderContext {
  ip: string;
  userAgent: string;
  sessionId: string;
  requestId: string;
  metadata?: Record<string, any>;
  fraudContext?: {
    fraudScore: number;
    riskLevel: string;
    requiresVerification: boolean;
  };
  geoContext?: {
    country: string;
    countryCode: string;
    city: string;
    region: string;
  };
}

export interface AuthProviderPlugin {
  /**
   * Plugin metadata and configuration
   */
  readonly config: AuthProviderConfig;
  
  /**
   * Initialize the provider with configuration
   */
  initialize(config: Record<string, any>): Promise<void>;
  
  /**
   * Authenticate user with credentials
   */
  authenticate(
    credentials: AuthProviderCredentials,
    context: AuthProviderContext
  ): Promise<AuthProviderResult>;
  
  /**
   * Register a new user (if supported)
   */
  register?(
    userData: Partial<AuthProviderUser> & { credentials: AuthProviderCredentials },
    context: AuthProviderContext
  ): Promise<AuthProviderResult>;
  
  /**
   * Get user profile by ID
   */
  getUser?(
    userId: string,
    context: AuthProviderContext
  ): Promise<AuthProviderUser | null>;
  
  /**
   * Update user profile (if supported)
   */
  updateUser?(
    userId: string,
    updates: Partial<AuthProviderUser>,
    context: AuthProviderContext
  ): Promise<AuthProviderUser>;
  
  /**
   * Reset password (if supported)
   */
  resetPassword?(
    identifier: string,
    newPassword: string,
    resetToken: string,
    context: AuthProviderContext
  ): Promise<AuthProviderResult>;
  
  /**
   * Refresh authentication token (if supported)
   */
  refresh?(
    refreshToken: string,
    context: AuthProviderContext
  ): Promise<AuthProviderResult>;
  
  /**
   * Logout user (if supported)
   */
  logout?(
    userId: string,
    context: AuthProviderContext
  ): Promise<void>;
  
  /**
   * Validate provider health and connectivity
   */
  healthCheck?(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: Record<string, any>;
  }>;
  
  /**
   * Handle OAuth callback (for OAuth providers)
   */
  handleOAuthCallback?(
    code: string,
    state: string,
    context: AuthProviderContext
  ): Promise<AuthProviderResult>;
  
  /**
   * Generate OAuth authorization URL (for OAuth providers)
   */
  getAuthorizationUrl?(
    redirectUri: string,
    state: string,
    scopes?: string[]
  ): string;
  
  /**
   * Handle SAML response (for SAML providers)
   */
  handleSamlResponse?(
    samlResponse: string,
    context: AuthProviderContext
  ): Promise<AuthProviderResult>;
  
  /**
   * Get SAML metadata (for SAML providers)
   */
  getSamlMetadata?(): string;
  
  /**
   * Cleanup resources when provider is disabled
   */
  cleanup?(): Promise<void>;
}

export interface AuthProviderFactory {
  /**
   * Create a new instance of the auth provider
   */
  create(config: AuthProviderConfig): AuthProviderPlugin;
  
  /**
   * Validate provider configuration
   */
  validateConfig(config: Record<string, any>): {
    valid: boolean;
    errors: string[];
  };
  
  /**
   * Get default configuration template
   */
  getConfigTemplate(): Record<string, any>;
  
  /**
   * Get provider type information
   */
  getProviderInfo(): {
    name: string;
    type: string;
    description: string;
    version: string;
    author: string;
    supportedFeatures: string[];
  };
}

export interface AuthProviderRegistry {
  /**
   * Register a new auth provider factory
   */
  register(name: string, factory: AuthProviderFactory): void;
  
  /**
   * Unregister an auth provider factory
   */
  unregister(name: string): void;
  
  /**
   * Get all registered provider names
   */
  getProviderNames(): string[];
  
  /**
   * Get provider factory by name
   */
  getProviderFactory(name: string): AuthProviderFactory | undefined;
  
  /**
   * Create provider instance from configuration
   */
  createProvider(config: AuthProviderConfig): AuthProviderPlugin | undefined;
}

export interface AuthProviderEvent {
  type: 'login' | 'register' | 'logout' | 'refresh' | 'error' | 'config_change';
  providerId: string;
  userId?: string;
  timestamp: Date;
  data: Record<string, any>;
  context: AuthProviderContext;
}

export interface AuthProviderEventHandler {
  (event: AuthProviderEvent): void | Promise<void>;
}

export interface AuthProviderManager {
  /**
   * Add a new provider configuration
   */
  addProvider(config: AuthProviderConfig): Promise<void>;
  
  /**
   * Remove a provider
   */
  removeProvider(providerId: string): Promise<void>;
  
  /**
   * Update provider configuration
   */
  updateProvider(providerId: string, config: Partial<AuthProviderConfig>): Promise<void>;
  
  /**
   * Get all configured providers
   */
  getProviders(): AuthProviderConfig[];
  
  /**
   * Get enabled providers ordered by priority
   */
  getEnabledProviders(): AuthProviderConfig[];
  
  /**
   * Get provider by ID
   */
  getProvider(providerId: string): AuthProviderConfig | undefined;
  
  /**
   * Get provider instance by ID
   */
  getProviderInstance(providerId: string): AuthProviderPlugin | undefined;
  
  /**
   * Authenticate using best matching provider
   */
  authenticate(
    credentials: AuthProviderCredentials,
    context: AuthProviderContext
  ): Promise<AuthProviderResult & { providerId?: string }>;
  
  /**
   * Register event handler
   */
  onEvent(handler: AuthProviderEventHandler): void;
  
  /**
   * Remove event handler
   */
  offEvent(handler: AuthProviderEventHandler): void;
  
  /**
   * Emit event to all handlers
   */
  emitEvent(event: AuthProviderEvent): Promise<void>;
  
  /**
   * Health check all providers
   */
  healthCheck(): Promise<Record<string, any>>;
}