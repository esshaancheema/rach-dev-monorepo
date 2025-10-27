import type { AuthConfig, AuthTokens, AuthUser, AuthResponse } from './types';

export class AuthClient {
  private config: AuthConfig;
  private tokens: AuthTokens | null = null;
  private user: AuthUser | null = null;
  private refreshPromise: Promise<void> | null = null;

  constructor(config: AuthConfig) {
    this.config = {
      tokenStorageKey: 'zoptal_auth_token',
      userStorageKey: 'zoptal_auth_user',
      autoRefresh: true,
      refreshThreshold: 15, // 15 minutes
      ...config,
    };

    this.loadFromStorage();
    this.startTokenRefreshTimer();
  }

  // Token management
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const tokenData = localStorage.getItem(this.config.tokenStorageKey!);
      const userData = localStorage.getItem(this.config.userStorageKey!);

      if (tokenData) {
        const tokens = JSON.parse(tokenData);
        if (tokens.expiresAt > Date.now()) {
          this.tokens = tokens;
        } else {
          this.clearStorage();
        }
      }

      if (userData) {
        this.user = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Failed to load auth data from storage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      if (this.tokens) {
        localStorage.setItem(this.config.tokenStorageKey!, JSON.stringify(this.tokens));
      }
      if (this.user) {
        localStorage.setItem(this.config.userStorageKey!, JSON.stringify(this.user));
      }
    } catch (error) {
      console.error('Failed to save auth data to storage:', error);
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(this.config.tokenStorageKey!);
    localStorage.removeItem(this.config.userStorageKey!);
    this.tokens = null;
    this.user = null;
  }

  private startTokenRefreshTimer(): void {
    if (!this.config.autoRefresh || typeof window === 'undefined') return;

    setInterval(() => {
      if (this.shouldRefreshToken()) {
        this.refreshToken();
      }
    }, 60000); // Check every minute
  }

  private shouldRefreshToken(): boolean {
    if (!this.tokens || !this.tokens.refreshToken) return false;
    
    const refreshThresholdMs = this.config.refreshThreshold! * 60 * 1000;
    return this.tokens.expiresAt - Date.now() < refreshThresholdMs;
  }

  // API request helper
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<AuthResponse<T>> {
    const url = `${this.config.authServiceUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && this.tokens?.refreshToken) {
        await this.refreshToken();
        // Retry the request with new token
        if (this.tokens?.accessToken) {
          headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return await retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error('Auth API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string, rememberMe = false, twoFactorCode?: string): Promise<AuthResponse> {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe, twoFactorCode }),
    });

    if (response.success && response.data) {
      this.setTokens(response.data.tokens);
      this.setUser(response.data.user);
    }

    return response;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    organizationName?: string;
  }): Promise<AuthResponse> {
    return await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(allDevices = false): Promise<void> {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ allDevices }),
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<void> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = (async () => {
      try {
        const response = await this.request('/api/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.tokens!.refreshToken }),
        });

        if (response.success && response.data) {
          this.setTokens(response.data.tokens);
          if (response.data.user) {
            this.setUser(response.data.user);
          }
        } else {
          this.clearAuth();
          throw new Error(response.message || 'Token refresh failed');
        }
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Profile management
  async getProfile(): Promise<AuthResponse<{ user: AuthUser }>> {
    return await this.request('/api/auth/me');
  }

  async updateProfile(data: Partial<AuthUser>): Promise<AuthResponse> {
    const response = await this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.user) {
      this.setUser(response.data.user);
    }

    return response;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    return await this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Password reset
  async forgotPassword(email: string): Promise<AuthResponse> {
    return await this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    return await this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Email verification
  async sendEmailVerification(email?: string): Promise<AuthResponse> {
    return await this.request('/api/auth/send-email-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    return await this.request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Phone verification
  async sendPhoneVerification(phone?: string): Promise<AuthResponse> {
    return await this.request('/api/auth/send-phone-verification', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyPhone(code: string): Promise<AuthResponse> {
    return await this.request('/api/auth/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Two-factor authentication
  async setup2FA(): Promise<AuthResponse> {
    return await this.request('/api/auth/2fa/setup', {
      method: 'POST',
    });
  }

  async enable2FA(code: string): Promise<AuthResponse> {
    return await this.request('/api/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async disable2FA(code: string): Promise<AuthResponse> {
    return await this.request('/api/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async verify2FA(code: string): Promise<AuthResponse> {
    return await this.request('/api/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async regenerateBackupCodes(code: string): Promise<AuthResponse> {
    return await this.request('/api/auth/2fa/regenerate-backup-codes', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async get2FAStatus(): Promise<AuthResponse> {
    return await this.request('/api/auth/2fa/status');
  }

  // OAuth
  async getOAuthProviders(): Promise<AuthResponse> {
    return await this.request('/api/auth/oauth/providers');
  }

  getOAuthUrl(provider: string, redirectUrl?: string): string {
    const params = new URLSearchParams();
    if (redirectUrl) {
      params.set('redirect_url', redirectUrl);
    }
    return `${this.config.authServiceUrl}/api/auth/oauth/${provider}?${params.toString()}`;
  }

  async disconnectOAuth(provider: string): Promise<AuthResponse> {
    return await this.request(`/api/auth/oauth/${provider}`, {
      method: 'DELETE',
    });
  }

  async getConnectedAccounts(): Promise<AuthResponse> {
    return await this.request('/api/auth/oauth/accounts');
  }

  // Session management
  async getSessions(): Promise<AuthResponse> {
    return await this.request('/api/auth/sessions');
  }

  async revokeSession(sessionId: string): Promise<AuthResponse> {
    return await this.request(`/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async revokeAllSessions(): Promise<AuthResponse> {
    return await this.request('/api/auth/sessions', {
      method: 'DELETE',
    });
  }

  // Getters
  getTokens(): AuthTokens | null {
    return this.tokens;
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.tokens?.accessToken && this.tokens.expiresAt > Date.now();
  }

  hasPermission(permission: string): boolean {
    if (!this.user) return false;
    return this.user.permissions.includes(permission) || this.user.role === 'admin';
  }

  hasRole(role: string): boolean {
    if (!this.user) return false;
    return this.user.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    if (!this.user) return false;
    return roles.includes(this.user.role);
  }

  // Setters
  setTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    this.saveToStorage();
  }

  setUser(user: AuthUser): void {
    this.user = user;
    this.saveToStorage();
  }

  clearAuth(): void {
    this.clearStorage();
  }
}