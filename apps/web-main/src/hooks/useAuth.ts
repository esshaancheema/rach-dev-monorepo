'use client';

import { useState, useEffect, createContext, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  maxCredits: number;
  createdAt: Date;
  lastLoginAt: Date;
  isEmailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultFramework: 'react' | 'vue' | 'vanilla' | 'auto';
    notifications: {
      email: boolean;
      browser: boolean;
      marketing: boolean;
    };
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const STORAGE_KEY = 'zoptal_auth_state';
const SESSION_KEY = 'zoptal_session_token';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const stored = localStorage.getItem(STORAGE_KEY);
      const sessionToken = localStorage.getItem(SESSION_KEY);

      if (stored && sessionToken) {
        const authData = JSON.parse(stored);
        const user: User = {
          ...authData,
          createdAt: new Date(authData.createdAt),
          lastLoginAt: new Date(authData.lastLoginAt)
        };

        // In a real implementation, you would validate the session token with your backend
        // For now, we'll simulate a session check
        const isValidSession = await validateSession(sessionToken);
        
        if (isValidSession) {
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null
          });
        } else {
          // Session expired, clear auth data
          await signOut();
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load authentication state'
      }));
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Simulate API call - replace with real authentication
      const response = await simulateSignIn(email, password);

      if (response.success && response.user && response.token) {
        const user: User = {
          ...response.user,
          createdAt: new Date(response.user.createdAt),
          lastLoginAt: new Date()
        };

        // Store auth data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(SESSION_KEY, response.token);

        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });

        return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to sign in'
        }));

        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Simulate API call - replace with real authentication
      const response = await simulateSignUp(email, password, name);

      if (response.success && response.user && response.token) {
        const user: User = {
          ...response.user,
          createdAt: new Date(),
          lastLoginAt: new Date()
        };

        // Store auth data
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(SESSION_KEY, response.token);

        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });

        return { success: true };
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to sign up'
        }));

        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Clear stored data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);

      // In a real implementation, you would also invalidate the session on the backend
      
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const updatedUser = { ...state.user, ...updates };
      
      // Store updated user data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      setState(prev => ({
        ...prev,
        user: updatedUser
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      return { success: false, error: errorMessage };
    }
  };

  const refreshCredits = async (): Promise<{ success: boolean; error?: string }> => {
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Simulate API call to refresh user credits
      const response = await simulateRefreshCredits(state.user.id);
      
      if (response.success) {
        await updateUser({ credits: response.credits });
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh credits';
      return { success: false, error: errorMessage };
    }
  };

  const consumeCredit = async (): Promise<{ success: boolean; error?: string }> => {
    if (!state.user) {
      return { success: false, error: 'Not authenticated' };
    }

    if (state.user.credits <= 0) {
      return { success: false, error: 'No credits remaining' };
    }

    try {
      const updatedCredits = Math.max(0, state.user.credits - 1);
      await updateUser({ credits: updatedCredits });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to consume credit';
      return { success: false, error: errorMessage };
    }
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    // State
    ...state,
    
    // Actions
    signIn,
    signUp,
    signOut,
    updateUser,
    refreshCredits,
    consumeCredit,
    clearError,
    
    // Computed values
    canGenerateApp: state.user ? state.user.credits > 0 : true, // Free users can still try
    isProUser: state.user?.plan === 'pro' || state.user?.plan === 'enterprise',
    isEnterpriseUser: state.user?.plan === 'enterprise'
  };
}

// Simulation functions - replace with real API calls
async function validateSession(token: string): Promise<boolean> {
  // Simulate session validation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo purposes, consider sessions valid for 24 hours
  const tokenData = parseJwtToken(token);
  if (!tokenData) return false;
  
  const now = Date.now() / 1000;
  return tokenData.exp > now;
}

async function simulateSignIn(email: string, password: string): Promise<{
  success: boolean;
  user?: Omit<User, 'createdAt' | 'lastLoginAt'> & { createdAt: string };
  token?: string;
  error?: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Basic validation
  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  // Simulate different user scenarios
  if (email === 'demo@example.com' && password === 'demo123') {
    return {
      success: true,
      user: {
        id: 'user_demo_123',
        email: 'demo@example.com',
        name: 'Demo User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        plan: 'pro',
        credits: 25,
        maxCredits: 50,
        createdAt: '2024-01-01T00:00:00Z',
        isEmailVerified: true,
        preferences: {
          theme: 'light',
          defaultFramework: 'auto',
          notifications: {
            email: true,
            browser: true,
            marketing: false
          }
        }
      },
      token: generateJwtToken('user_demo_123', 24 * 60 * 60) // 24 hours
    };
  }

  return { success: false, error: 'Invalid email or password' };
}

async function simulateSignUp(email: string, password: string, name: string): Promise<{
  success: boolean;
  user?: Omit<User, 'createdAt' | 'lastLoginAt'> & { createdAt: string };
  token?: string;
  error?: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Basic validation
  if (!email || !password || !name) {
    return { success: false, error: 'All fields are required' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  // Simulate email already exists
  if (email === 'existing@example.com') {
    return { success: false, error: 'An account with this email already exists' };
  }

  const userId = 'user_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

  return {
    success: true,
    user: {
      id: userId,
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      plan: 'free',
      credits: 3,
      maxCredits: 3,
      createdAt: new Date().toISOString(),
      isEmailVerified: false,
      preferences: {
        theme: 'light',
        defaultFramework: 'auto',
        notifications: {
          email: true,
          browser: true,
          marketing: false
        }
      }
    },
    token: generateJwtToken(userId, 24 * 60 * 60) // 24 hours
  };
}

async function simulateRefreshCredits(userId: string): Promise<{
  success: boolean;
  credits?: number;
  error?: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulate successful credit refresh
  return {
    success: true,
    credits: 50 // Pro user credits
  };
}

// JWT token utilities (simplified for demo)
function generateJwtToken(userId: string, expiresInSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  }));
  const signature = btoa('demo_signature'); // In real implementation, this would be properly signed

  return `${header}.${payload}.${signature}`;
}

function parseJwtToken(token: string): { sub: string; iat: number; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}