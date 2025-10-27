'use client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  mfaEnabled: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ssoProvider?: SSOProvider;
  metadata: {
    department?: string;
    title?: string;
    employeeId?: string;
    manager?: string;
    location?: string;
  };
}

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'oauth2';
  config: SSOConfig;
  enabled: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSOConfig {
  // SAML Configuration
  saml?: {
    entryPoint: string;
    issuer: string;
    cert: string;
    privateKey?: string;
    signatureAlgorithm: string;
    attributeMapping: {
      email: string;
      firstName: string;
      lastName: string;
      groups?: string;
      department?: string;
      title?: string;
    };
  };
  
  // OIDC Configuration
  oidc?: {
    issuer: string;
    clientId: string;
    clientSecret: string;
    scope: string[];
    responseType: string;
    attributeMapping: {
      email: string;
      name: string;
      groups?: string;
      picture?: string;
    };
  };
  
  // OAuth2 Configuration  
  oauth2?: {
    authorizationURL: string;
    tokenURL: string;
    userInfoURL: string;
    clientId: string;
    clientSecret: string;
    scope: string[];
    attributeMapping: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
    };
  };
}

export interface MFAMethod {
  id: string;
  userId: string;
  type: 'totp' | 'sms' | 'email' | 'backup_codes';
  enabled: boolean;
  verified: boolean;
  secret?: string;
  phoneNumber?: string;
  backupCodes?: string[];
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  organizationId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    region: string;
  };
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isActive: boolean;
  loginMethod: 'password' | 'sso' | 'mfa';
}

export interface SecurityPolicy {
  organizationId: string;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    preventReuse: number;
    maxAge: number; // days
  };
  mfaPolicy: {
    required: boolean;
    allowedMethods: ('totp' | 'sms' | 'email')[];
    gracePeriod: number; // days
  };
  sessionPolicy: {
    maxDuration: number; // hours
    idleTimeout: number; // minutes
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  accessPolicy: {
    ipWhitelist: string[];
    deviceTrust: boolean;
    locationRestrictions: boolean;
    timeRestrictions?: {
      allowedHours: { start: string; end: string };
      allowedDays: number[]; // 0-6, Sunday=0
      timezone: string;
    };
  };
  ssoPolicy: {
    enforceSSO: boolean;
    allowLocalAuth: boolean;
    autoProvision: boolean;
    syncAttributes: boolean;
  };
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
  sessionId?: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  mfaRequired: boolean;
  mfaSuccess?: boolean;
  timestamp: Date;
  organizationId?: string;
}

export class EnterpriseAuthService {
  private users: Map<string, User> = new Map();
  private ssoProviders: Map<string, SSOProvider> = new Map();
  private mfaMethods: Map<string, MFAMethod[]> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private auditLogs: AuditLog[] = [];
  private loginAttempts: LoginAttempt[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.initializeMockData();
  }

  // Authentication Methods
  async authenticate(email: string, password: string, organizationId: string): Promise<{
    user: User;
    session: AuthSession;
    requiresMFA: boolean;
    mfaMethods: MFAMethod[];
  }> {
    const attempt: LoginAttempt = {
      id: this.generateId(),
      email,
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      success: false,
      timestamp: new Date(),
      organizationId,
      mfaRequired: false
    };

    try {
      // Check security policy
      const policy = this.securityPolicies.get(organizationId);
      if (policy?.accessPolicy.ipWhitelist.length > 0) {
        // IP whitelist check would go here
      }

      // Find user
      const user = Array.from(this.users.values()).find(
        u => u.email === email && u.organizationId === organizationId
      );

      if (!user) {
        attempt.failureReason = 'User not found';
        this.loginAttempts.push(attempt);
        throw new Error('Invalid credentials');
      }

      // Password validation would happen here
      // For demo purposes, assume password is valid

      // Check if MFA is required
      const userMfaMethods = this.mfaMethods.get(user.id) || [];
      const requiresMFA = user.mfaEnabled || policy?.mfaPolicy.required || false;
      const enabledMfaMethods = userMfaMethods.filter(m => m.enabled && m.verified);

      attempt.success = true;
      attempt.mfaRequired = requiresMFA;
      this.loginAttempts.push(attempt);

      // Create session
      const session = await this.createSession(user, 'password');

      // Log audit event
      await this.logAudit({
        organizationId,
        userId: user.id,
        action: 'user_login',
        resource: 'authentication',
        details: { method: 'password', requiresMFA },
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        success: true,
        timestamp: new Date(),
        sessionId: session.id
      });

      this.currentUser = user;

      return {
        user,
        session,
        requiresMFA,
        mfaMethods: enabledMfaMethods
      };

    } catch (error) {
      attempt.failureReason = error instanceof Error ? error.message : 'Unknown error';
      this.loginAttempts.push(attempt);
      
      await this.logAudit({
        organizationId,
        action: 'user_login_failed',
        resource: 'authentication',
        details: { email, reason: attempt.failureReason },
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        success: false,
        timestamp: new Date()
      });

      throw error;
    }
  }

  async authenticateSSO(organizationId: string, ssoProviderId: string, ssoData: any): Promise<{
    user: User;
    session: AuthSession;
  }> {
    const provider = this.ssoProviders.get(ssoProviderId);
    if (!provider || !provider.enabled) {
      throw new Error('SSO provider not found or disabled');
    }

    // Parse SSO response based on provider type
    let userInfo: any;
    
    switch (provider.type) {
      case 'saml':
        userInfo = this.parseSAMLResponse(ssoData, provider.config.saml!);
        break;
      case 'oidc':
        userInfo = this.parseOIDCResponse(ssoData, provider.config.oidc!);
        break;
      case 'oauth2':
        userInfo = this.parseOAuth2Response(ssoData, provider.config.oauth2!);
        break;
      default:
        throw new Error('Unsupported SSO provider type');
    }

    // Find or create user
    let user = Array.from(this.users.values()).find(
      u => u.email === userInfo.email && u.organizationId === organizationId
    );

    const policy = this.securityPolicies.get(organizationId);
    
    if (!user && policy?.ssoPolicy.autoProvision) {
      // Auto-provision user
      user = await this.createUserFromSSO(organizationId, userInfo, provider);
    }

    if (!user) {
      throw new Error('User not found and auto-provisioning disabled');
    }

    // Update user attributes if sync is enabled
    if (policy?.ssoPolicy.syncAttributes) {
      await this.syncUserAttributes(user, userInfo);
    }

    // Create session
    const session = await this.createSession(user, 'sso');

    await this.logAudit({
      organizationId,
      userId: user.id,
      action: 'user_sso_login',
      resource: 'authentication',
      details: { provider: provider.name, type: provider.type },
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      success: true,
      timestamp: new Date(),
      sessionId: session.id
    });

    this.currentUser = user;

    return { user, session };
  }

  async verifyMFA(userId: string, method: string, code: string): Promise<boolean> {
    const userMfaMethods = this.mfaMethods.get(userId) || [];
    const mfaMethod = userMfaMethods.find(m => m.type === method && m.enabled);

    if (!mfaMethod) {
      throw new Error('MFA method not found');
    }

    // Verify code based on method type
    let isValid = false;
    
    switch (method) {
      case 'totp':
        isValid = this.verifyTOTP(mfaMethod.secret!, code);
        break;
      case 'sms':
      case 'email':
        // For demo, assume code is valid if it's 6 digits
        isValid = /^\d{6}$/.test(code);
        break;
      case 'backup_codes':
        isValid = mfaMethod.backupCodes?.includes(code) || false;
        if (isValid) {
          // Remove used backup code
          mfaMethod.backupCodes = mfaMethod.backupCodes?.filter(c => c !== code);
        }
        break;
    }

    if (isValid) {
      mfaMethod.lastUsedAt = new Date();
    }

    await this.logAudit({
      organizationId: this.currentUser?.organizationId || '',
      userId,
      action: 'mfa_verification',
      resource: 'authentication',
      details: { method, success: isValid },
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      success: isValid,
      timestamp: new Date()
    });

    return isValid;
  }

  async logout(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      
      await this.logAudit({
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'user_logout',
        resource: 'authentication',
        details: { sessionId },
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        success: true,
        timestamp: new Date(),
        sessionId
      });
    }

    this.currentUser = null;
  }

  // SSO Configuration
  async createSSOProvider(organizationId: string, config: Partial<SSOProvider>): Promise<SSOProvider> {
    const provider: SSOProvider = {
      id: this.generateId(),
      name: config.name!,
      type: config.type!,
      config: config.config!,
      enabled: config.enabled || false,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.ssoProviders.set(provider.id, provider);

    await this.logAudit({
      organizationId,
      action: 'sso_provider_created',
      resource: 'sso_provider',
      resourceId: provider.id,
      details: { name: provider.name, type: provider.type },
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      success: true,
      timestamp: new Date()
    });

    return provider;
  }

  async updateSSOProvider(providerId: string, updates: Partial<SSOProvider>): Promise<SSOProvider> {
    const provider = this.ssoProviders.get(providerId);
    if (!provider) {
      throw new Error('SSO provider not found');
    }

    Object.assign(provider, updates, { updatedAt: new Date() });

    await this.logAudit({
      organizationId: provider.organizationId,
      action: 'sso_provider_updated',
      resource: 'sso_provider',
      resourceId: providerId,
      details: { updates },
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      success: true,
      timestamp: new Date()
    });

    return provider;
  }

  async getSSOProviders(organizationId: string): Promise<SSOProvider[]> {
    return Array.from(this.ssoProviders.values()).filter(
      p => p.organizationId === organizationId
    );
  }

  // MFA Management
  async setupMFA(userId: string, method: 'totp' | 'sms' | 'email', config: any): Promise<MFAMethod> {
    const mfaMethod: MFAMethod = {
      id: this.generateId(),
      userId,
      type: method,
      enabled: false,
      verified: false,
      createdAt: new Date(),
      ...config
    };

    const userMethods = this.mfaMethods.get(userId) || [];
    userMethods.push(mfaMethod);
    this.mfaMethods.set(userId, userMethods);

    if (method === 'totp') {
      mfaMethod.secret = this.generateTOTPSecret();
    }

    await this.logAudit({
      organizationId: this.currentUser?.organizationId || '',
      userId,
      action: 'mfa_setup_initiated',
      resource: 'mfa',
      details: { method },
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      success: true,
      timestamp: new Date()
    });

    return mfaMethod;
  }

  async verifyMFASetup(userId: string, methodId: string, code: string): Promise<boolean> {
    const userMethods = this.mfaMethods.get(userId) || [];
    const method = userMethods.find(m => m.id === methodId);

    if (!method) {
      throw new Error('MFA method not found');
    }

    const isValid = await this.verifyMFA(userId, method.type, code);
    
    if (isValid) {
      method.verified = true;
      method.enabled = true;
      
      // Generate backup codes for TOTP
      if (method.type === 'totp') {
        method.backupCodes = this.generateBackupCodes();
      }
    }

    return isValid;
  }

  async getMFAMethods(userId: string): Promise<MFAMethod[]> {
    return this.mfaMethods.get(userId) || [];
  }

  // Security Policy Management
  async updateSecurityPolicy(organizationId: string, policy: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    const currentPolicy = this.securityPolicies.get(organizationId);
    const updatedPolicy: SecurityPolicy = {
      organizationId,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false,
        preventReuse: 5,
        maxAge: 90,
        ...currentPolicy?.passwordPolicy,
        ...policy.passwordPolicy
      },
      mfaPolicy: {
        required: false,
        allowedMethods: ['totp', 'sms'],
        gracePeriod: 7,
        ...currentPolicy?.mfaPolicy,
        ...policy.mfaPolicy
      },
      sessionPolicy: {
        maxDuration: 8,
        idleTimeout: 30,
        maxConcurrentSessions: 5,
        requireReauth: false,
        ...currentPolicy?.sessionPolicy,
        ...policy.sessionPolicy
      },
      accessPolicy: {
        ipWhitelist: [],
        deviceTrust: false,
        locationRestrictions: false,
        ...currentPolicy?.accessPolicy,
        ...policy.accessPolicy
      },
      ssoPolicy: {
        enforceSSO: false,
        allowLocalAuth: true,
        autoProvision: false,
        syncAttributes: true,
        ...currentPolicy?.ssoPolicy,
        ...policy.ssoPolicy
      }
    };

    this.securityPolicies.set(organizationId, updatedPolicy);

    await this.logAudit({
      organizationId,
      action: 'security_policy_updated',
      resource: 'security_policy',
      details: { updates: policy },
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      success: true,
      timestamp: new Date()
    });

    return updatedPolicy;
  }

  async getSecurityPolicy(organizationId: string): Promise<SecurityPolicy | null> {
    return this.securityPolicies.get(organizationId) || null;
  }

  // Session Management
  async createSession(user: User, loginMethod: 'password' | 'sso' | 'mfa'): Promise<AuthSession> {
    const session: AuthSession = {
      id: this.generateId(),
      userId: user.id,
      organizationId: user.organizationId,
      deviceId: this.generateDeviceId(),
      ipAddress: '192.168.1.100',
      userAgent: navigator.userAgent,
      location: {
        country: 'US',
        city: 'San Francisco',
        region: 'CA'
      },
      createdAt: new Date(),
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      isActive: true,
      loginMethod
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async getSessions(userId: string): Promise<AuthSession[]> {
    return Array.from(this.sessions.values()).filter(
      s => s.userId === userId && s.isActive
    );
  }

  async revokeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      
      await this.logAudit({
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'session_revoked',
        resource: 'session',
        resourceId: sessionId,
        details: {},
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent,
        success: true,
        timestamp: new Date()
      });
    }
  }

  // Audit and Monitoring
  async logAudit(log: Omit<AuditLog, 'id'>): Promise<void> {
    const auditLog: AuditLog = {
      id: this.generateId(),
      ...log
    };
    
    this.auditLogs.push(auditLog);
  }

  async getAuditLogs(organizationId: string, filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    let logs = this.auditLogs.filter(log => log.organizationId === organizationId);

    if (filters) {
      if (filters.userId) logs = logs.filter(log => log.userId === filters.userId);
      if (filters.action) logs = logs.filter(log => log.action.includes(filters.action));
      if (filters.resource) logs = logs.filter(log => log.resource === filters.resource);
      if (filters.startDate) logs = logs.filter(log => log.timestamp >= filters.startDate!);
      if (filters.endDate) logs = logs.filter(log => log.timestamp <= filters.endDate!);
    }

    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return filters?.limit ? logs.slice(0, filters.limit) : logs;
  }

  async getLoginAttempts(organizationId?: string, limit = 100): Promise<LoginAttempt[]> {
    const attempts = organizationId 
      ? this.loginAttempts.filter(a => a.organizationId === organizationId)
      : this.loginAttempts;
    
    attempts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return attempts.slice(0, limit);
  }

  // Utility Methods
  private parseSAMLResponse(samlData: any, config: NonNullable<SSOConfig['saml']>): any {
    // Mock SAML parsing
    return {
      email: samlData[config.attributeMapping.email],
      name: `${samlData[config.attributeMapping.firstName]} ${samlData[config.attributeMapping.lastName]}`,
      groups: samlData[config.attributeMapping.groups] || [],
      department: samlData[config.attributeMapping.department],
      title: samlData[config.attributeMapping.title]
    };
  }

  private parseOIDCResponse(oidcData: any, config: NonNullable<SSOConfig['oidc']>): any {
    // Mock OIDC parsing
    return {
      email: oidcData[config.attributeMapping.email],
      name: oidcData[config.attributeMapping.name],
      avatar: oidcData[config.attributeMapping.picture],
      groups: oidcData[config.attributeMapping.groups] || []
    };
  }

  private parseOAuth2Response(oauth2Data: any, config: NonNullable<SSOConfig['oauth2']>): any {
    // Mock OAuth2 parsing
    return {
      id: oauth2Data[config.attributeMapping.id],
      email: oauth2Data[config.attributeMapping.email],
      name: oauth2Data[config.attributeMapping.name],
      avatar: oauth2Data[config.attributeMapping.avatar]
    };
  }

  private async createUserFromSSO(organizationId: string, userInfo: any, provider: SSOProvider): Promise<User> {
    const user: User = {
      id: this.generateId(),
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.avatar,
      organizationId,
      roles: ['member'],
      permissions: [],
      mfaEnabled: false,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ssoProvider: provider,
      metadata: {
        department: userInfo.department,
        title: userInfo.title
      }
    };

    this.users.set(user.id, user);
    return user;
  }

  private async syncUserAttributes(user: User, userInfo: any): Promise<void> {
    user.name = userInfo.name || user.name;
    user.avatar = userInfo.avatar || user.avatar;
    user.metadata.department = userInfo.department || user.metadata.department;
    user.metadata.title = userInfo.title || user.metadata.title;
    user.updatedAt = new Date();
  }

  private verifyTOTP(secret: string, code: string): boolean {
    // Mock TOTP verification - in real implementation would use libraries like speakeasy
    return /^\d{6}$/.test(code);
  }

  private generateTOTPSecret(): string {
    return 'JBSWY3DPEHPK3PXP'; // Mock secret
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  private generateDeviceId(): string {
    return 'device_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateId(): string {
    return 'auth_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Mock data initialization
  private initializeMockData(): void {
    // Sample security policy
    const policy: SecurityPolicy = {
      organizationId: 'org_sample',
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false,
        preventReuse: 5,
        maxAge: 90
      },
      mfaPolicy: {
        required: false,
        allowedMethods: ['totp', 'sms'],
        gracePeriod: 7
      },
      sessionPolicy: {
        maxDuration: 8,
        idleTimeout: 30,
        maxConcurrentSessions: 5,
        requireReauth: false
      },
      accessPolicy: {
        ipWhitelist: [],
        deviceTrust: false,
        locationRestrictions: false
      },
      ssoPolicy: {
        enforceSSO: false,
        allowLocalAuth: true,
        autoProvision: true,
        syncAttributes: true
      }
    };

    this.securityPolicies.set('org_sample', policy);

    // Sample SSO providers
    const samlProvider: SSOProvider = {
      id: 'sso_saml_okta',
      name: 'Okta SAML',
      type: 'saml',
      config: {
        saml: {
          entryPoint: 'https://company.okta.com/app/saml/entry',
          issuer: 'https://company.okta.com',
          cert: '-----BEGIN CERTIFICATE-----\nMIIC....\n-----END CERTIFICATE-----',
          signatureAlgorithm: 'sha256',
          attributeMapping: {
            email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
            firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
            lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
            groups: 'http://schemas.xmlsoap.org/claims/Group',
            department: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department',
            title: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/title'
          }
        }
      },
      enabled: true,
      organizationId: 'org_sample',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-03-01')
    };

    const oidcProvider: SSOProvider = {
      id: 'sso_oidc_azure',
      name: 'Azure AD',
      type: 'oidc',
      config: {
        oidc: {
          issuer: 'https://login.microsoftonline.com/tenant-id/v2.0',
          clientId: 'azure-client-id',
          clientSecret: 'azure-client-secret',
          scope: ['openid', 'profile', 'email'],
          responseType: 'code',
          attributeMapping: {
            email: 'email',
            name: 'name',
            groups: 'groups',
            picture: 'picture'
          }
        }
      },
      enabled: true,
      organizationId: 'org_sample',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-01')
    };

    this.ssoProviders.set(samlProvider.id, samlProvider);
    this.ssoProviders.set(oidcProvider.id, oidcProvider);

    // Sample users
    const adminUser: User = {
      id: 'user_admin',
      email: 'admin@company.com',
      name: 'Admin User',
      organizationId: 'org_sample',
      roles: ['admin', 'owner'],
      permissions: ['*'],
      mfaEnabled: true,
      lastLoginAt: new Date(),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      metadata: {
        department: 'IT',
        title: 'System Administrator',
        employeeId: 'EMP001'
      }
    };

    this.users.set(adminUser.id, adminUser);

    // Sample MFA methods
    this.mfaMethods.set('user_admin', [
      {
        id: 'mfa_totp_admin',
        userId: 'user_admin',
        type: 'totp',
        enabled: true,
        verified: true,
        secret: 'JBSWY3DPEHPK3PXP',
        createdAt: new Date('2024-01-01'),
        lastUsedAt: new Date()
      }
    ]);

    // Sample audit logs
    this.auditLogs.push(
      {
        id: 'audit_1',
        organizationId: 'org_sample',
        userId: 'user_admin',
        action: 'user_login',
        resource: 'authentication',
        details: { method: 'password' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        success: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: 'audit_2',
        organizationId: 'org_sample',
        action: 'sso_provider_updated',
        resource: 'sso_provider',
        resourceId: 'sso_saml_okta',
        details: { name: 'Okta SAML' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        success: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      }
    );
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

// Export singleton instance
export const authService = new EnterpriseAuthService();