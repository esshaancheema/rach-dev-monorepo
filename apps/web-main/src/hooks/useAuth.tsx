'use client';

import { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { authManager, AuthUser } from '@/lib/auth/middleware';

// Types
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: (allDevices?: boolean) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  verifyPhone: (token: string) => Promise<void>;
  resendEmailVerification: (email: string) => Promise<void>;
  resendPhoneVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setup2FA: () => Promise<{ qrCodeUrl: string; backupCodes: string[]; manualEntryKey: string }>;
  enable2FA: (verificationCode: string) => Promise<void>;
  disable2FA: (verificationCode: string) => Promise<void>;
  verify2FA: (code: string) => Promise<{ backupCodeUsed?: boolean }>;
  regenerateBackupCodes: (verificationCode: string) => Promise<{ backupCodes: string[] }>;
  get2FAStatus: () => Promise<{ enabled: boolean; setupAt?: string; enabledAt?: string; backupCodesCount: number; lastUsedAt?: string }>;
  getOAuthProviders: () => Promise<{ providers: { id: string; name: string }[] }>;
  getOAuthAccounts: () => Promise<{ oauthAccounts: any[] }>;
  unlinkOAuthAccount: (provider: string) => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export type AuthContextType = AuthState & AuthActions;

// Context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authManager.isAuthenticated()) {
          // Get user profile
          const response = await authManager.request('/api/auth/me');
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user) {
              authManager.setUser(data.data.user);
              setState(prev => ({
                ...prev,
                user: data.data.user,
                isAuthenticated: true,
                isLoading: false,
              }));
              return;
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authManager.clearAuth();
      }

      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Set token and user from session data
        if (data.data?.session?.token) {
          const expiresAt = new Date(data.data.session.expiresAt).getTime();
          authManager.setToken(data.data.session.token, expiresAt);
        }
        if (data.data?.user) {
          authManager.setUser(data.data.user);
        }

        setState(prev => ({
          ...prev,
          user: data.data?.user || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Login failed',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message || 'Registration failed',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
    }
  }, []);

  // Logout function
  const logout = useCallback(async (allDevices = false) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await authManager.request('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ allDevices }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local auth state regardless of API response
      authManager.clearAuth();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Verify email function
  const verifyEmail = useCallback(async (token: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Email verification failed',
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
    }
  }, []);

  // Verify phone function
  const verifyPhone = useCallback(async (token: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Phone verification failed',
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
    }
  }, []);

  // Resend email verification
  const resendEmailVerification = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/resend-email-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to resend verification email',
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
    }
  }, []);

  // Resend phone verification
  const resendPhoneVerification = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/resend-phone-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to resend phone verification',
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
    }
  }, []);

  // Forgot password function
  const forgotPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to send password reset email',
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (token: string, newPassword: string, confirmPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to reset password',
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
    }
  }, []);

  // Change password function (for authenticated users)
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authManager.request('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to change password',
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
    }
  }, []);

  // Setup 2FA function
  const setup2FA = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authManager.request('/api/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to setup 2FA',
        }));
        throw new Error(data.message || 'Failed to setup 2FA');
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return data.data;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
      throw error;
    }
  }, []);

  // Enable 2FA function
  const enable2FA = useCallback(async (verificationCode: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authManager.request('/api/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to enable 2FA',
        }));
        throw new Error(data.message || 'Failed to enable 2FA');
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
      throw error;
    }
  }, []);

  // Disable 2FA function
  const disable2FA = useCallback(async (verificationCode: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authManager.request('/api/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to disable 2FA',
        }));
        throw new Error(data.message || 'Failed to disable 2FA');
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
      throw error;
    }
  }, []);

  // Verify 2FA function
  const verify2FA = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authManager.request('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to verify 2FA code',
        }));
        throw new Error(data.message || 'Failed to verify 2FA code');
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return data.data;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
      throw error;
    }
  }, []);

  // Regenerate backup codes function
  const regenerateBackupCodes = useCallback(async (verificationCode: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authManager.request('/api/2fa/regenerate-backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode }),
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to regenerate backup codes',
        }));
        throw new Error(data.message || 'Failed to regenerate backup codes');
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return data.data;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
      throw error;
    }
  }, []);

  // Get 2FA status function
  const get2FAStatus = useCallback(async () => {
    try {
      const response = await authManager.request('/api/2fa/status');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data;
        }
      }
      throw new Error('Failed to get 2FA status');
    } catch (error) {
      console.error('2FA status error:', error);
      throw error;
    }
  }, []);

  // Get OAuth providers function
  const getOAuthProviders = useCallback(async () => {
    try {
      const response = await fetch('/api/oauth/providers');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data;
        }
      }
      return { providers: [] };
    } catch (error) {
      console.error('OAuth providers error:', error);
      throw error;
    }
  }, []);

  // Get OAuth accounts function
  const getOAuthAccounts = useCallback(async () => {
    try {
      const response = await authManager.request('/api/oauth/accounts');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.data;
        }
      }
      return { oauthAccounts: [] };
    } catch (error) {
      console.error('OAuth accounts error:', error);
      throw error;
    }
  }, []);

  // Unlink OAuth account function
  const unlinkOAuthAccount = useCallback(async (provider: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authManager.request(`/api/oauth/${provider}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Failed to unlink OAuth account',
        }));
        throw new Error(data.message || 'Failed to unlink OAuth account');
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }));
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!state.isAuthenticated) return;

    try {
      const response = await authManager.request('/api/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          authManager.setUser(data.data.user);
          setState(prev => ({
            ...prev,
            user: data.data.user,
          }));
        }
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  }, [state.isAuthenticated]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyEmail,
    verifyPhone,
    resendEmailVerification,
    resendPhoneVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    setup2FA,
    enable2FA,
    disable2FA,
    verify2FA,
    regenerateBackupCodes,
    get2FAStatus,
    getOAuthProviders,
    getOAuthAccounts,
    unlinkOAuthAccount,
    clearError,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// HOC for protected components
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { roles?: string[]; redirectTo?: string } = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const { roles, redirectTo = '/auth/login' } = options;

    // Show loading state
    if (isLoading) {
      return <div>Loading...</div>;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
      return null;
    }

    // Check role-based access
    if (roles && user && !roles.includes(user.role)) {
      return <div>Access denied. Insufficient permissions.</div>;
    }

    return <Component {...props} />;
  };
}