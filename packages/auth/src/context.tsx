'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthClient } from './client';
import type { 
  AuthContextType, 
  AuthState, 
  AuthConfig, 
  LoginCredentials, 
  RegisterData,
  AuthEvent,
  AuthEventListener,
  AuthUser 
} from './types';

const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  config: AuthConfig;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
  const clientRef = useRef<AuthClient>();
  const listenersRef = useRef<Set<AuthEventListener>>(new Set());
  
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth client
  if (!clientRef.current) {
    clientRef.current = new AuthClient(config);
  }

  const client = clientRef.current;

  // Event emitter
  const emitEvent = useCallback((event: AuthEvent, data?: any) => {
    listenersRef.current.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Auth event listener error:', error);
      }
    });
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (client.isAuthenticated()) {
          const response = await client.getProfile();
          
          if (response.success && response.data?.user) {
            client.setUser(response.data.user);
            setState({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            emitEvent('login', response.data.user);
            return;
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        client.clearAuth();
      }

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    };

    initializeAuth();
  }, [client, emitEvent]);

  // Authentication methods
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.login(
        credentials.email,
        credentials.password,
        credentials.rememberMe,
        credentials.twoFactorCode
      );

      if (response.success && response.data) {
        setState({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        emitEvent('login', response.data.user);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Login failed',
        }));
        emitEvent('error', response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, emitEvent]);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.register(data);

      if (response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
        emitEvent('register', data);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Registration failed',
        }));
        emitEvent('error', response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, emitEvent]);

  const logout = useCallback(async (allDevices = false) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await client.logout(allDevices);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      emitEvent('logout');
    }
  }, [client, emitEvent]);

  const refreshToken = useCallback(async () => {
    try {
      await client.refreshToken();
      emitEvent('token-refresh');
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      emitEvent('session-expired');
    }
  }, [client, logout, emitEvent]);

  // Profile management
  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.updateProfile(data);

      if (response.success && response.data?.user) {
        setState(prev => ({
          ...prev,
          user: response.data.user,
          isLoading: false,
        }));
        emitEvent('profile-updated', response.data.user);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Profile update failed',
        }));
        emitEvent('error', response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, emitEvent]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.changePassword(currentPassword, newPassword);

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Password change failed',
        }));
        emitEvent('error', response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, emitEvent]);

  const refreshProfile = useCallback(async () => {
    if (!state.isAuthenticated) return;

    try {
      const response = await client.getProfile();
      
      if (response.success && response.data?.user) {
        client.setUser(response.data.user);
        setState(prev => ({
          ...prev,
          user: response.data!.user,
        }));
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  }, [client, state.isAuthenticated]);

  // Email verification
  const sendEmailVerification = useCallback(async (email?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.sendEmailVerification(email);

      if (!response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to send verification email',
        }));
        emitEvent('error', response.message);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, emitEvent]);

  const verifyEmail = useCallback(async (token: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.verifyEmail(token);

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        // Refresh profile to get updated verification status
        await refreshProfile();
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Email verification failed',
        }));
        emitEvent('error', response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, refreshProfile, emitEvent]);

  // Phone verification
  const sendPhoneVerification = useCallback(async (phone?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.sendPhoneVerification(phone);

      if (!response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to send phone verification',
        }));
        emitEvent('error', response.message);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, emitEvent]);

  const verifyPhone = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.verifyPhone(code);

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        // Refresh profile to get updated verification status
        await refreshProfile();
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Phone verification failed',
        }));
        emitEvent('error', response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, refreshProfile, emitEvent]);

  // Password reset
  const forgotPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.forgotPassword(email);

      if (!response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to send password reset email',
        }));
        emitEvent('error', response.message);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, emitEvent]);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.resetPassword(token, newPassword);

      if (!response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to reset password',
        }));
        emitEvent('error', response.message);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
    }
  }, [client, emitEvent]);

  // Two-factor authentication
  const setup2FA = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.setup2FA();

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        return response.data;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to setup 2FA',
        }));
        emitEvent('error', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
      throw error;
    }
  }, [client, emitEvent]);

  const enable2FA = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.enable2FA(code);

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        await refreshProfile();
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to enable 2FA',
        }));
        emitEvent('error', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
      throw error;
    }
  }, [client, refreshProfile, emitEvent]);

  const disable2FA = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.disable2FA(code);

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        await refreshProfile();
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to disable 2FA',
        }));
        emitEvent('error', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
      throw error;
    }
  }, [client, refreshProfile, emitEvent]);

  const verify2FA = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.verify2FA(code);

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        return response.data;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to verify 2FA code',
        }));
        emitEvent('error', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
      throw error;
    }
  }, [client, emitEvent]);

  const regenerateBackupCodes = useCallback(async (code: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.regenerateBackupCodes(code);

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
        return response.data;
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to regenerate backup codes',
        }));
        emitEvent('error', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
      throw error;
    }
  }, [client, emitEvent]);

  const get2FAStatus = useCallback(async () => {
    try {
      const response = await client.get2FAStatus();
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get 2FA status');
    } catch (error) {
      console.error('2FA status error:', error);
      throw error;
    }
  }, [client]);

  // OAuth
  const getOAuthProviders = useCallback(async () => {
    try {
      const response = await client.getOAuthProviders();
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get OAuth providers');
    } catch (error) {
      console.error('OAuth providers error:', error);
      throw error;
    }
  }, [client]);

  const connectOAuth = useCallback((provider: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = client.getOAuthUrl(provider, window.location.href);
    }
  }, [client]);

  const disconnectOAuth = useCallback(async (provider: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await client.disconnectOAuth(provider);

      if (response.success) {
        setState(prev => ({ ...prev, isLoading: false }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Failed to disconnect OAuth account',
        }));
        emitEvent('error', response.message);
        throw new Error(response.message);
      }
    } catch (error) {
      const message = 'Network error. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      emitEvent('error', message);
      throw error;
    }
  }, [client, emitEvent]);

  const getConnectedAccounts = useCallback(async () => {
    try {
      const response = await client.getConnectedAccounts();
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get connected accounts');
    } catch (error) {
      console.error('Connected accounts error:', error);
      throw error;
    }
  }, [client]);

  // Session management
  const getSessions = useCallback(async () => {
    try {
      const response = await client.getSessions();
      
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get sessions');
    } catch (error) {
      console.error('Sessions error:', error);
      throw error;
    }
  }, [client]);

  const revokeSession = useCallback(async (sessionId: string) => {
    try {
      const response = await client.revokeSession(sessionId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to revoke session');
      }
    } catch (error) {
      console.error('Revoke session error:', error);
      throw error;
    }
  }, [client]);

  const revokeAllSessions = useCallback(async () => {
    try {
      const response = await client.revokeAllSessions();
      
      if (response.success) {
        // Logout current session
        await logout();
      } else {
        throw new Error(response.message || 'Failed to revoke all sessions');
      }
    } catch (error) {
      console.error('Revoke all sessions error:', error);
      throw error;
    }
  }, [client, logout]);

  // Utilities
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const hasPermission = useCallback((permission: string) => {
    return client.hasPermission(permission);
  }, [client]);

  const hasRole = useCallback((role: string) => {
    return client.hasRole(role);
  }, [client]);

  const hasAnyRole = useCallback((roles: string[]) => {
    return client.hasAnyRole(roles);
  }, [client]);

  const addEventListener = useCallback((listener: AuthEventListener) => {
    listenersRef.current.add(listener);
    
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    refreshProfile,
    sendEmailVerification,
    verifyEmail,
    sendPhoneVerification,
    verifyPhone,
    forgotPassword,
    resetPassword,
    setup2FA,
    enable2FA,
    disable2FA,
    verify2FA,
    regenerateBackupCodes,
    get2FAStatus,
    getOAuthProviders,
    connectOAuth,
    disconnectOAuth,
    getConnectedAccounts,
    getSessions,
    revokeSession,
    revokeAllSessions,
    clearError,
    hasPermission,
    hasRole,
    hasAnyRole,
    addEventListener,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}