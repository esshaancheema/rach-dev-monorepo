'use client';

/**
 * Authentication Redirect Handler
 * 
 * This component manages the routing between Web-Main's legacy auth system
 * and the new Dashboard-based modern authentication system.
 * 
 * Features:
 * - Feature flag controlled (NEXT_PUBLIC_USE_DASHBOARD_AUTH)
 * - Preserves existing auth system as fallback
 * - Handles cross-origin authentication flow
 * - Supports return URL preservation
 */

interface AuthRedirectConfig {
  dashboardUrl?: string;
  enableDashboardAuth?: boolean;
  preserveReturnUrl?: boolean;
}

export class AuthRedirectHandler {
  private static config: AuthRedirectConfig = {
    dashboardUrl: process.env.NEXT_PUBLIC_DASHBOARD_AUTH_URL || 'http://localhost:3001',
    enableDashboardAuth: process.env.NEXT_PUBLIC_USE_DASHBOARD_AUTH === 'true',
    preserveReturnUrl: true,
  };

  /**
   * Get the appropriate sign-in URL based on configuration
   */
  static getSignInUrl(currentUrl?: string): string {
    if (this.config.enableDashboardAuth) {
      const params = new URLSearchParams({
        origin: 'web-main',
      });

      if (this.config.preserveReturnUrl && currentUrl) {
        params.set('returnTo', currentUrl);
      }

      return `${this.config.dashboardUrl}/auth/login?${params.toString()}`;
    }

    // Fallback to existing Web-Main auth system
    return '/login';
  }

  /**
   * Get the appropriate registration URL based on configuration
   */
  static getRegisterUrl(currentUrl?: string): string {
    if (this.config.enableDashboardAuth) {
      const params = new URLSearchParams({
        origin: 'web-main',
      });

      if (this.config.preserveReturnUrl && currentUrl) {
        params.set('returnTo', currentUrl);
      }

      return `${this.config.dashboardUrl}/auth/register?${params.toString()}`;
    }

    // Fallback to existing Web-Main auth system
    return '/register';
  }

  /**
   * Handle sign-in redirect with optional callback
   */
  static handleSignIn(options?: {
    currentUrl?: string;
    onRedirect?: () => void;
    newWindow?: boolean;
  }): void {
    const url = this.getSignInUrl(options?.currentUrl);
    
    if (options?.onRedirect) {
      options.onRedirect();
    }

    if (options?.newWindow && this.config.enableDashboardAuth) {
      // Open Dashboard auth in new window for better UX
      const authWindow = window.open(
        url,
        'zoptal-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      if (authWindow) {
        // Listen for authentication completion
        window.addEventListener('message', (event) => {
          if (event.origin !== this.config.dashboardUrl) return;
          
          if (event.data.type === 'AUTH_SUCCESS') {
            // Handle successful authentication
            this.handleAuthSuccess(event.data);
            authWindow.close();
          }
        });
      }
    } else {
      // Standard redirect
      window.location.href = url;
    }
  }

  /**
   * Handle registration redirect with optional callback
   */
  static handleRegister(options?: {
    currentUrl?: string;
    onRedirect?: () => void;
    newWindow?: boolean;
  }): void {
    const url = this.getRegisterUrl(options?.currentUrl);
    
    if (options?.onRedirect) {
      options.onRedirect();
    }

    if (options?.newWindow && this.config.enableDashboardAuth) {
      // Open Dashboard auth in new window for better UX
      const authWindow = window.open(
        url,
        'zoptal-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      if (authWindow) {
        // Listen for authentication completion
        window.addEventListener('message', (event) => {
          if (event.origin !== this.config.dashboardUrl) return;
          
          if (event.data.type === 'AUTH_SUCCESS') {
            // Handle successful authentication
            this.handleAuthSuccess(event.data);
            authWindow.close();
          }
        });
      }
    } else {
      // Standard redirect
      window.location.href = url;
    }
  }

  /**
   * Check if Dashboard auth is enabled
   */
  static isDashboardAuthEnabled(): boolean {
    return this.config.enableDashboardAuth;
  }

  /**
   * Handle successful authentication from Dashboard
   */
  private static handleAuthSuccess(data: { tokens: any; user: any }): void {
    try {
      // Store authentication data
      if (data.tokens) {
        // Store in both old and new token locations for compatibility
        localStorage.setItem('zoptal_session_token', data.tokens.accessToken);
        localStorage.setItem('dashboard_auth_token', data.tokens.accessToken);
        
        if (data.tokens.refreshToken) {
          localStorage.setItem('dashboard_refresh_token', data.tokens.refreshToken);
        }
      }

      if (data.user) {
        localStorage.setItem('zoptal_user', JSON.stringify(data.user));
      }

      // Trigger auth state update event
      window.dispatchEvent(new CustomEvent('auth:success', { 
        detail: { user: data.user, tokens: data.tokens } 
      }));

      // Redirect to dashboard or intended page
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo') || '/dashboard';
      
      setTimeout(() => {
        window.location.href = returnTo;
      }, 100);

    } catch (error) {
      console.error('Failed to handle auth success:', error);
      
      // Fallback to dashboard redirect
      window.location.href = `${this.config.dashboardUrl}/dashboard`;
    }
  }

  /**
   * Update configuration dynamically
   */
  static updateConfig(newConfig: Partial<AuthRedirectConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  static getConfig(): AuthRedirectConfig {
    return { ...this.config };
  }
}

/**
 * React Hook for Authentication Redirect
 */
export const useAuthRedirect = () => {
  const handleSignIn = (options?: Parameters<typeof AuthRedirectHandler.handleSignIn>[0]) => {
    AuthRedirectHandler.handleSignIn({
      currentUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      ...options,
    });
  };

  const handleRegister = (options?: Parameters<typeof AuthRedirectHandler.handleRegister>[0]) => {
    AuthRedirectHandler.handleRegister({
      currentUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      ...options,
    });
  };

  return {
    handleSignIn,
    handleRegister,
    isDashboardAuthEnabled: AuthRedirectHandler.isDashboardAuthEnabled(),
    getSignInUrl: AuthRedirectHandler.getSignInUrl,
    getRegisterUrl: AuthRedirectHandler.getRegisterUrl,
  };
};

export default AuthRedirectHandler;