// Advanced Authentication System for Zoptal Platform
import { analytics } from '@/lib/analytics/tracker';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'client' | 'developer';
  avatar?: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastLogin?: string;
  loginAttempts: number;
  lockedUntil?: string;
  passwordChangedAt: string;
  preferences: UserPreferences;
  sessions: UserSession[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    activityTracking: boolean;
    dataCollection: boolean;
  };
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  captchaToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  captchaToken?: string;
  inviteCode?: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface PasswordResetRequest {
  email: string;
  captchaToken?: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'password_change' | 'two_factor_enabled' | 'two_factor_disabled' | 'account_locked' | 'suspicious_activity';
  description: string;
  ip: string;
  userAgent: string;
  location?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  additionalData?: any;
}

export class AuthenticationService {
  private static instance: AuthenticationService;
  private currentUser: User | null = null;
  private tokens: AuthTokens | null = null;
  private readonly API_ENDPOINT = '/api/auth';
  private readonly TOKEN_KEY = 'auth_tokens';
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadStoredTokens();
      this.setupSessionMonitoring();
    }
  }

  /**
   * User Registration
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Validate registration data
      this.validateRegistrationData(data);

      // Check if email is already registered
      const emailExists = await this.checkEmailExists(data.email);
      if (emailExists) {
        throw new Error('Email address is already registered');
      }

      // Validate password strength
      this.validatePasswordStrength(data.password);

      const response = await fetch(`${this.API_ENDPOINT}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
          acceptTerms: data.acceptTerms,
          captchaToken: data.captchaToken,
          inviteCode: data.inviteCode
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();
      
      // Store tokens and user data
      this.setTokens(result.tokens);
      this.currentUser = result.user;

      // Track registration
      analytics.track({
        name: 'user_registered',
        category: 'authentication',
        properties: {
          user_id: result.user.id,
          email: result.user.email,
          registration_method: 'email',
          has_invite_code: !!data.inviteCode
        }
      });

      // Send welcome email (in production)
      await this.sendWelcomeEmail(result.user);

      return result;
    } catch (error) {
      analytics.track({
        name: 'registration_failed',
        category: 'authentication',
        properties: {
          error: error.message,
          email: data.email
        }
      });
      throw error;
    }
  }

  /**
   * User Login
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Check for rate limiting
      await this.checkRateLimit(credentials.email);

      const deviceInfo = this.getDeviceInfo();

      const response = await fetch(`${this.API_ENDPOINT}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.toLowerCase(),
          password: credentials.password,
          rememberMe: credentials.rememberMe,
          captchaToken: credentials.captchaToken,
          deviceInfo
        })
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle specific error cases
        if (error.code === 'ACCOUNT_LOCKED') {
          throw new Error(`Account is locked. Try again in ${Math.ceil(error.lockedUntil / 60)} minutes.`);
        }
        
        if (error.code === 'TWO_FACTOR_REQUIRED') {
          return { requiresTwoFactor: true, sessionId: error.sessionId };
        }

        if (error.code === 'EMAIL_NOT_VERIFIED') {
          throw new Error('Please verify your email address before logging in.');
        }

        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();
      
      // Store tokens and user data
      this.setTokens(result.tokens);
      this.currentUser = result.user;

      // Create security event
      await this.logSecurityEvent({
        userId: result.user.id,
        type: 'login',
        description: 'Successful login',
        ip: deviceInfo.ip,
        userAgent: deviceInfo.userAgent,
        severity: 'low'
      });

      // Track successful login
      analytics.track({
        name: 'user_logged_in',
        category: 'authentication',
        properties: {
          user_id: result.user.id,
          email: result.user.email,
          device_type: deviceInfo.deviceType,
          remember_me: credentials.rememberMe
        }
      });

      return result;
    } catch (error) {
      // Track failed login attempt
      analytics.track({
        name: 'login_failed',
        category: 'authentication',
        properties: {
          error: error.message,
          email: credentials.email
        }
      });

      throw error;
    }
  }

  /**
   * Two-Factor Authentication Verification
   */
  async verifyTwoFactor(sessionId: string, code: string): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          code
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Two-factor verification failed');
      }

      const result = await response.json();
      
      // Store tokens and user data
      this.setTokens(result.tokens);
      this.currentUser = result.user;

      analytics.track({
        name: 'two_factor_verified',
        category: 'authentication',
        properties: {
          user_id: result.user.id
        }
      });

      return result;
    } catch (error) {
      analytics.track({
        name: 'two_factor_verification_failed',
        category: 'authentication',
        properties: {
          error: error.message,
          session_id: sessionId
        }
      });
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(allSessions = false): Promise<void> {
    try {
      const userId = this.currentUser?.id;

      if (this.tokens) {
        await fetch(`${this.API_ENDPOINT}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            allSessions
          })
        });
      }

      // Clear local storage
      this.clearTokens();
      this.currentUser = null;

      if (userId) {
        // Log security event
        await this.logSecurityEvent({
          userId,
          type: 'logout',
          description: allSessions ? 'Logged out from all sessions' : 'Logged out',
          ip: this.getDeviceInfo().ip,
          userAgent: this.getDeviceInfo().userAgent,
          severity: 'low'
        });

        analytics.track({
          name: 'user_logged_out',
          category: 'authentication',
          properties: {
            user_id: userId,
            all_sessions: allSessions
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if API call fails
      this.clearTokens();
      this.currentUser = null;
    }
  }

  /**
   * Refresh Access Token
   */
  async refreshToken(): Promise<AuthTokens> {
    try {
      if (!this.tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.API_ENDPOINT}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.tokens.refreshToken
        })
      });

      if (!response.ok) {
        // Refresh token is invalid, logout user
        await this.logout();
        throw new Error('Session expired. Please log in again.');
      }

      const newTokens = await response.json();
      this.setTokens(newTokens);

      return newTokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      throw error;
    }
  }

  /**
   * Password Reset Request
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/password-reset-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email.toLowerCase(),
          captchaToken: data.captchaToken
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset request failed');
      }

      analytics.track({
        name: 'password_reset_requested',
        category: 'authentication',
        properties: {
          email: data.email
        }
      });
    } catch (error) {
      analytics.track({
        name: 'password_reset_request_failed',
        category: 'authentication',
        properties: {
          error: error.message,
          email: data.email
        }
      });
      throw error;
    }
  }

  /**
   * Reset Password
   */
  async resetPassword(data: PasswordReset): Promise<void> {
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      this.validatePasswordStrength(data.password);

      const response = await fetch(`${this.API_ENDPOINT}/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.token,
          password: data.password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }

      analytics.track({
        name: 'password_reset_completed',
        category: 'authentication'
      });
    } catch (error) {
      analytics.track({
        name: 'password_reset_failed',
        category: 'authentication',
        properties: {
          error: error.message
        }
      });
      throw error;
    }
  }

  /**
   * Setup Two-Factor Authentication
   */
  async setupTwoFactor(): Promise<TwoFactorSetup> {
    try {
      if (!this.tokens) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.API_ENDPOINT}/2fa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Two-factor setup failed');
      }

      const setup = await response.json();

      analytics.track({
        name: 'two_factor_setup_initiated',
        category: 'security',
        properties: {
          user_id: this.currentUser?.id
        }
      });

      return setup;
    } catch (error) {
      analytics.track({
        name: 'two_factor_setup_failed',
        category: 'security',
        properties: {
          error: error.message,
          user_id: this.currentUser?.id
        }
      });
      throw error;
    }
  }

  /**
   * Enable Two-Factor Authentication
   */
  async enableTwoFactor(code: string): Promise<{ backupCodes: string[] }> {
    try {
      if (!this.tokens) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.API_ENDPOINT}/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to enable two-factor authentication');
      }

      const result = await response.json();

      // Update current user
      if (this.currentUser) {
        this.currentUser.isTwoFactorEnabled = true;
      }

      // Log security event
      await this.logSecurityEvent({
        userId: this.currentUser!.id,
        type: 'two_factor_enabled',
        description: 'Two-factor authentication enabled',
        ip: this.getDeviceInfo().ip,
        userAgent: this.getDeviceInfo().userAgent,
        severity: 'medium'
      });

      analytics.track({
        name: 'two_factor_enabled',
        category: 'security',
        properties: {
          user_id: this.currentUser?.id
        }
      });

      return result;
    } catch (error) {
      analytics.track({
        name: 'two_factor_enable_failed',
        category: 'security',
        properties: {
          error: error.message,
          user_id: this.currentUser?.id
        }
      });
      throw error;
    }
  }

  /**
   * Disable Two-Factor Authentication
   */
  async disableTwoFactor(password: string): Promise<void> {
    try {
      if (!this.tokens) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.API_ENDPOINT}/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to disable two-factor authentication');
      }

      // Update current user
      if (this.currentUser) {
        this.currentUser.isTwoFactorEnabled = false;
      }

      // Log security event
      await this.logSecurityEvent({
        userId: this.currentUser!.id,
        type: 'two_factor_disabled',
        description: 'Two-factor authentication disabled',
        ip: this.getDeviceInfo().ip,
        userAgent: this.getDeviceInfo().userAgent,
        severity: 'high'
      });

      analytics.track({
        name: 'two_factor_disabled',
        category: 'security',
        properties: {
          user_id: this.currentUser?.id
        }
      });
    } catch (error) {
      analytics.track({
        name: 'two_factor_disable_failed',
        category: 'security',
        properties: {
          error: error.message,
          user_id: this.currentUser?.id
        }
      });
      throw error;
    }
  }

  /**
   * Get Current User
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.tokens !== null;
  }

  /**
   * Get user sessions
   */
  async getUserSessions(): Promise<UserSession[]> {
    try {
      if (!this.tokens) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.API_ENDPOINT}/sessions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      if (!this.tokens) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.API_ENDPOINT}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }

      analytics.track({
        name: 'session_revoked',
        category: 'security',
        properties: {
          user_id: this.currentUser?.id,
          session_id: sessionId
        }
      });
    } catch (error) {
      console.error('Failed to revoke session:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private validateRegistrationData(data: RegisterData): void {
    if (!data.name || data.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Please enter a valid email address');
    }

    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (!data.acceptTerms) {
      throw new Error('You must accept the terms and conditions');
    }
  }

  private validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (criteriaMet < 3) {
      throw new Error('Password must contain at least 3 of: uppercase letter, lowercase letter, number, special character');
    }

    // Check against common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      throw new Error('Please choose a more secure password');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase() })
      });

      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Email check failed:', error);
      return false;
    }
  }

  private async checkRateLimit(email: string): Promise<void> {
    // In production, this would check server-side rate limiting
    const attempts = parseInt(localStorage.getItem(`login_attempts_${email}`) || '0');
    const lastAttempt = parseInt(localStorage.getItem(`last_attempt_${email}`) || '0');
    
    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - lastAttempt;
      if (timeSinceLastAttempt < this.LOCKOUT_DURATION) {
        const remainingTime = Math.ceil((this.LOCKOUT_DURATION - timeSinceLastAttempt) / 60000);
        throw new Error(`Too many login attempts. Try again in ${remainingTime} minutes.`);
      } else {
        // Reset attempts after lockout period
        localStorage.removeItem(`login_attempts_${email}`);
        localStorage.removeItem(`last_attempt_${email}`);
      }
    }
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        ip: '',
        deviceType: 'desktop' as const,
        browser: '',
        os: ''
      };
    }

    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    
    return {
      userAgent,
      ip: '', // Would be set by server
      deviceType: isTablet ? 'tablet' as const : (isMobile ? 'mobile' as const : 'desktop' as const),
      browser: this.getBrowserName(userAgent),
      os: this.getOSName(userAgent)
    };
  }

  private getBrowserName(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOSName(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
    }
  }

  private clearTokens(): void {
    this.tokens = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  private loadStoredTokens(): void {
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      if (stored) {
        this.tokens = JSON.parse(stored);
        // In production, verify token validity and refresh if needed
        this.validateStoredTokens();
      }
    } catch (error) {
      console.error('Failed to load stored tokens:', error);
      this.clearTokens();
    }
  }

  private async validateStoredTokens(): Promise<void> {
    if (!this.tokens) return;

    try {
      // Check if access token is expired
      const payload = JSON.parse(atob(this.tokens.accessToken.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        await this.refreshToken();
      }

      // Get current user data
      await this.fetchCurrentUser();
    } catch (error) {
      console.error('Token validation failed:', error);
      this.clearTokens();
    }
  }

  private async fetchCurrentUser(): Promise<void> {
    try {
      if (!this.tokens) return;

      const response = await fetch(`${this.API_ENDPOINT}/me`, {
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`,
        }
      });

      if (response.ok) {
        this.currentUser = await response.json();
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      this.clearTokens();
    }
  }

  private setupSessionMonitoring(): void {
    // Monitor for session activity
    let lastActivity = Date.now();

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check for session timeout
    setInterval(() => {
      if (this.isAuthenticated() && Date.now() - lastActivity > this.SESSION_TIMEOUT) {
        this.logout();
        analytics.track({
          name: 'session_timeout',
          category: 'authentication',
          properties: {
            user_id: this.currentUser?.id
          }
        });
      }
    }, 60000); // Check every minute
  }

  private async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };

      // In production, this would send to a security logging service
      console.info('Security Event:', securityEvent);

      analytics.track({
        name: 'security_event',
        category: 'security',
        properties: {
          event_type: event.type,
          severity: event.severity,
          user_id: event.userId
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private async sendWelcomeEmail(user: User): Promise<void> {
    try {
      // In production, this would trigger a welcome email
      console.info(`Welcome email would be sent to: ${user.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }
}

// Export singleton instance
export const auth = AuthenticationService.getInstance();

// React hook for authentication
export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    // In a real app, you'd set up listeners for auth state changes
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const result = await auth.login(credentials);
    setUser(result.user);
    return result;
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    const result = await auth.register(data);
    setUser(result.user);
    return result;
  };

  return {
    user,
    isLoading,
    isAuthenticated: auth.isAuthenticated(),
    login,
    logout,
    register,
    requestPasswordReset: auth.requestPasswordReset.bind(auth),
    resetPassword: auth.resetPassword.bind(auth),
    setupTwoFactor: auth.setupTwoFactor.bind(auth),
    enableTwoFactor: auth.enableTwoFactor.bind(auth),
    disableTwoFactor: auth.disableTwoFactor.bind(auth)
  };
}