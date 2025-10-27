/**
 * Dashboard Authentication Bridge
 * 
 * This service bridges authentication between Web-Main and Dashboard applications.
 * It handles token synchronization, user state management, and cross-origin communication.
 * 
 * Features:
 * - Cross-origin authentication state synchronization
 * - Token storage compatibility with existing system
 * - Event-driven authentication updates
 * - Secure postMessage communication
 * - Fallback support for existing auth system
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  source: 'web-main' | 'dashboard' | null;
}

export interface AuthBridgeConfig {
  dashboardUrl: string;
  enableCrossOrigin: boolean;
  tokenStorageKeys: {
    legacy: string; // For backward compatibility
    new: string;    // For new system
    refresh: string;
    user: string;
  };
}

class DashboardAuthBridge {
  private config: AuthBridgeConfig;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    tokens: null,
    source: null,
  };
  private listeners: Map<string, ((state: AuthState) => void)[]> = new Map();
  private isInitialized = false;

  constructor(config?: Partial<AuthBridgeConfig>) {
    this.config = {
      dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_AUTH_URL || 'http://localhost:3001',
      enableCrossOrigin: process.env.ENABLE_CROSS_ORIGIN_AUTH === 'true',
      tokenStorageKeys: {
        legacy: 'zoptal_session_token',
        new: 'dashboard_auth_token', 
        refresh: 'dashboard_refresh_token',
        user: 'zoptal_user',
      },
      ...config,
    };

    this.initialize();
  }

  /**
   * Initialize the authentication bridge
   */
  private initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Load existing authentication state
    this.loadAuthState();

    // Set up cross-origin message listener
    if (this.config.enableCrossOrigin) {
      this.setupCrossOriginListener();
    }

    // Set up storage event listener for auth state changes
    this.setupStorageListener();

    this.isInitialized = true;
  }

  /**
   * Load authentication state from storage
   */
  private loadAuthState(): void {
    try {
      // Try to load from new system first
      const newToken = localStorage.getItem(this.config.tokenStorageKeys.new);
      const refreshToken = localStorage.getItem(this.config.tokenStorageKeys.refresh);
      
      // Fallback to legacy system
      const legacyToken = localStorage.getItem(this.config.tokenStorageKeys.legacy);
      const userStr = localStorage.getItem(this.config.tokenStorageKeys.user);

      const activeToken = newToken || legacyToken;

      if (activeToken) {
        const tokens: AuthTokens = {
          accessToken: activeToken,
          refreshToken: refreshToken || undefined,
        };

        let user: AuthUser | null = null;
        if (userStr) {
          try {
            user = JSON.parse(userStr);
          } catch (error) {
            console.warn('Failed to parse stored user data:', error);
          }
        }

        this.authState = {
          isAuthenticated: true,
          user,
          tokens,
          source: newToken ? 'dashboard' : 'web-main',
        };
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }

  /**
   * Set up cross-origin message listener for Dashboard auth
   */
  private setupCrossOriginListener(): void {
    window.addEventListener('message', (event) => {
      // Verify origin for security
      if (event.origin !== this.config.dashboardUrl) return;

      const { type, ...data } = event.data;

      switch (type) {
        case 'AUTH_SUCCESS':
          this.handleDashboardAuthSuccess(data);
          break;
        case 'AUTH_LOGOUT':
          this.handleDashboardLogout();
          break;
        case 'AUTH_TOKEN_REFRESH':
          this.handleTokenRefresh(data.tokens);
          break;
        default:
          // Ignore unknown message types
          break;
      }
    });
  }

  /**
   * Set up storage event listener for local auth changes
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      const relevantKeys = Object.values(this.config.tokenStorageKeys);
      
      if (relevantKeys.includes(event.key || '')) {
        // Reload auth state when relevant storage keys change
        this.loadAuthState();
        this.notifyListeners('storage_change');
      }
    });
  }

  /**
   * Handle successful authentication from Dashboard
   */
  private handleDashboardAuthSuccess(data: { 
    tokens: AuthTokens; 
    user: AuthUser;
    returnTo?: string;
  }): void {
    try {
      // Store tokens in both legacy and new locations
      if (data.tokens.accessToken) {
        localStorage.setItem(this.config.tokenStorageKeys.legacy, data.tokens.accessToken);
        localStorage.setItem(this.config.tokenStorageKeys.new, data.tokens.accessToken);
      }

      if (data.tokens.refreshToken) {
        localStorage.setItem(this.config.tokenStorageKeys.refresh, data.tokens.refreshToken);
      }

      if (data.user) {
        localStorage.setItem(this.config.tokenStorageKeys.user, JSON.stringify(data.user));
      }

      // Update auth state
      this.authState = {
        isAuthenticated: true,
        user: data.user,
        tokens: data.tokens,
        source: 'dashboard',
      };

      // Notify listeners
      this.notifyListeners('auth_success');

      // Handle return URL if specified
      if (data.returnTo) {
        setTimeout(() => {
          window.location.href = data.returnTo!;
        }, 100);
      }

    } catch (error) {
      console.error('Failed to handle dashboard auth success:', error);
    }
  }

  /**
   * Handle logout from Dashboard
   */
  private handleDashboardLogout(): void {
    this.clearAuthState();
    this.notifyListeners('auth_logout');
  }

  /**
   * Handle token refresh from Dashboard
   */
  private handleTokenRefresh(tokens: AuthTokens): void {
    if (tokens.accessToken) {
      localStorage.setItem(this.config.tokenStorageKeys.legacy, tokens.accessToken);
      localStorage.setItem(this.config.tokenStorageKeys.new, tokens.accessToken);
    }

    if (tokens.refreshToken) {
      localStorage.setItem(this.config.tokenStorageKeys.refresh, tokens.refreshToken);
    }

    if (this.authState.tokens) {
      this.authState.tokens = { ...this.authState.tokens, ...tokens };
    }

    this.notifyListeners('token_refresh');
  }

  /**
   * Clear all authentication state
   */
  private clearAuthState(): void {
    // Clear all auth-related storage
    Object.values(this.config.tokenStorageKeys).forEach(key => {
      localStorage.removeItem(key);
    });

    // Reset auth state
    this.authState = {
      isAuthenticated: false,
      user: null,
      tokens: null,
      source: null,
    };
  }

  /**
   * Get current authentication state
   */
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.tokens?.accessToken;
  }

  /**
   * Get current user
   */
  public getCurrentUser(): AuthUser | null {
    return this.authState.user;
  }

  /**
   * Get current tokens
   */
  public getTokens(): AuthTokens | null {
    return this.authState.tokens;
  }

  /**
   * Open Dashboard authentication in popup
   */
  public openDashboardAuth(type: 'login' | 'register' = 'login', options?: {
    returnTo?: string;
    newWindow?: boolean;
  }): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({
        origin: 'web-main',
      });

      if (options?.returnTo) {
        params.set('returnTo', options.returnTo);
      }

      const url = `${this.config.dashboardUrl}/auth/${type}?${params.toString()}`;

      if (options?.newWindow !== false) {
        // Open in popup window
        const popup = window.open(
          url,
          'zoptal-dashboard-auth',
          'width=500,height=700,scrollbars=yes,resizable=yes,centerscreen=yes'
        );

        if (!popup) {
          reject(new Error('Failed to open authentication popup. Please allow popups for this site.'));
          return;
        }

        // Listen for auth completion
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== this.config.dashboardUrl) return;

          if (event.data.type === 'AUTH_SUCCESS') {
            window.removeEventListener('message', messageHandler);
            popup.close();
            resolve(this.getAuthState());
          } else if (event.data.type === 'AUTH_ERROR') {
            window.removeEventListener('message', messageHandler);
            popup.close();
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', messageHandler);

        // Handle popup close without completion
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

      } else {
        // Redirect to Dashboard auth
        window.location.href = url;
      }
    });
  }

  /**
   * Logout user (works with both systems)
   */
  public async logout(): Promise<void> {
    try {
      // Clear local state first
      this.clearAuthState();

      // Notify Dashboard if cross-origin is enabled
      if (this.config.enableCrossOrigin) {
        // Try to notify Dashboard about logout
        const dashboardFrame = document.createElement('iframe');
        dashboardFrame.style.display = 'none';
        dashboardFrame.src = `${this.config.dashboardUrl}/auth/logout?origin=web-main`;
        document.body.appendChild(dashboardFrame);
        
        setTimeout(() => {
          document.body.removeChild(dashboardFrame);
        }, 1000);
      }

      this.notifyListeners('auth_logout');

    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  public onAuthChange(event: string, callback: (state: AuthState) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyListeners(event: string): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const currentState = this.getAuthState();
      eventListeners.forEach(callback => {
        try {
          callback(currentState);
        } catch (error) {
          console.error('Auth listener error:', error);
        }
      });
    }

    // Also notify generic 'change' listeners
    if (event !== 'change') {
      this.notifyListeners('change');
    }
  }

  /**
   * Refresh authentication tokens
   */
  public async refreshTokens(): Promise<AuthTokens | null> {
    try {
      const refreshToken = localStorage.getItem(this.config.tokenStorageKeys.refresh);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // For now, we'll rely on the Dashboard system to handle token refresh
      // This could be enhanced to directly call the auth service
      return this.authState.tokens;

    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }
}

// Create singleton instance
export const dashboardAuthBridge = new DashboardAuthBridge();

// Export the class for custom instances
export default DashboardAuthBridge;