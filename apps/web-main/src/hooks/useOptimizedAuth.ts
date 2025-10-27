'use client';

import { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys, clearAuthCache } from '@/lib/query-client'
import { authService } from '@/lib/auth-service-client'

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

const SESSION_KEY = 'zoptal_session_token';

// Optimized session validation with React Query
const validateSession = async (token: string): Promise<User | null> => {
  if (!token) return null;
  
  try {
    const response = await authService.get('/api/v1/auth/me');
    
    if (!response.ok) {
      // Remove invalid token
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    const { data } = await response.json();
    return data.user ? {
      ...data.user,
      createdAt: new Date(data.user.createdAt),
      lastLoginAt: new Date(data.user.lastLoginAt)
    } : null;
  } catch (error) {
    console.error('Session validation failed:', error);
    return null;
  }
};

// Optimized auth operations
const signInUser = async (credentials: { email: string; password: string }) => {
  const response = await authService.post('/api/v1/auth/login', credentials);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Sign in failed');
  }
  
  const { data } = await response.json();
  
  // Store token securely
  if (data.access_token) {
    localStorage.setItem(SESSION_KEY, data.access_token);
  }
  
  return {
    ...data.user,
    createdAt: new Date(data.user.createdAt),
    lastLoginAt: new Date()
  };
};

const signUpUser = async (userData: { email: string; password: string; name: string }) => {
  const response = await authService.post('/api/v1/auth/register', userData);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Sign up failed');
  }
  
  const { data } = await response.json();
  
  // Store token securely
  if (data.access_token) {
    localStorage.setItem(SESSION_KEY, data.access_token);
  }
  
  return {
    ...data.user,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };
};

const updateUserProfile = async (updates: Partial<User>) => {
  const response = await authService.put('/api/v1/auth/profile', updates);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Profile update failed');
  }
  
  const { data } = await response.json();
  return {
    ...data.user,
    createdAt: new Date(data.user.createdAt),
    lastLoginAt: new Date(data.user.lastLoginAt)
  };
};

export function useOptimizedAuth() {
  const queryClient = useQueryClient();
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Get session token with memoization
  const sessionToken = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_KEY);
  }, []);
  
  // Session validation query with optimized caching
  const {
    data: user,
    isLoading,
    error: queryError,
    refetch: refetchUser
  } = useQuery({
    queryKey: authKeys.session(sessionToken || undefined),
    queryFn: () => validateSession(sessionToken!),
    enabled: !!sessionToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (authentication issues)
      if (error instanceof Error && error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });
  
  // Sign in mutation with optimistic updates
  const signInMutation = useMutation({
    mutationFn: signInUser,
    onSuccess: (userData) => {
      // Update cache immediately
      queryClient.setQueryData(authKeys.session(sessionToken || undefined), userData);
      // Clear any errors
      setLocalError(null);
    },
    onError: (error: Error) => {
      setLocalError(error.message);
    },
  });
  
  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: (userData) => {
      // Update cache immediately
      queryClient.setQueryData(authKeys.session(sessionToken || undefined), userData);
      // Clear any errors
      setLocalError(null);
    },
    onError: (error: Error) => {
      setLocalError(error.message);
    },
  });
  
  // Profile update mutation with optimistic updates
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: authKeys.session() });
      
      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(authKeys.session());
      
      // Optimistically update to the new value
      if (previousUser) {
        queryClient.setQueryData(authKeys.session(), {
          ...previousUser,
          ...updates
        });
      }
      
      return { previousUser };
    },
    onError: (err, updates, context) => {
      // Rollback to previous value on error
      if (context?.previousUser) {
        queryClient.setQueryData(authKeys.session(), context.previousUser);
      }
      setLocalError(err.message);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
  
  // Optimized sign out
  const signOut = useCallback(async () => {
    try {
      // Call backend to invalidate session
      if (sessionToken) {
        await authService.post('/api/v1/auth/logout');
      }
    } catch (error) {
      // Log error but don't prevent logout
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local data
      localStorage.removeItem(SESSION_KEY);
      clearAuthCache();
      setLocalError(null);
    }
  }, [sessionToken]);
  
  // Credit operations with optimistic updates
  const consumeCredit = useCallback(async () => {
    if (!user || user.credits <= 0) {
      throw new Error('No credits remaining');
    }
    
    // Optimistic update
    const previousUser = user;
    queryClient.setQueryData(authKeys.session(), {
      ...user,
      credits: Math.max(0, user.credits - 1)
    });
    
    try {
      const response = await authService.post('/api/v1/auth/consume-credit');
      if (!response.ok) throw new Error('Failed to consume credit');
      
      const { data } = await response.json();
      queryClient.setQueryData(authKeys.session(), {
        ...user,
        credits: data.credits
      });
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(authKeys.session(), previousUser);
      throw error;
    }
  }, [user, queryClient]);
  
  const refreshCredits = useCallback(async () => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const response = await authService.post('/api/v1/auth/refresh-credits');
      if (!response.ok) throw new Error('Failed to refresh credits');
      
      const { data } = await response.json();
      queryClient.setQueryData(authKeys.session(), {
        ...user,
        credits: data.credits
      });
    } catch (error) {
      console.error('Credit refresh failed:', error);
      throw error;
    }
  }, [user, queryClient]);
  
  // Clear errors
  const clearError = useCallback(() => {
    setLocalError(null);
  }, []);
  
  // Computed values with memoization
  const computedValues = useMemo(() => ({
    isAuthenticated: !!user && !!sessionToken,
    canGenerateApp: user ? user.credits > 0 : true,
    isProUser: user?.plan === 'pro' || user?.plan === 'enterprise',
    isEnterpriseUser: user?.plan === 'enterprise',
    hasCredits: (user?.credits || 0) > 0,
    creditUsagePercent: user ? (user.credits / user.maxCredits) * 100 : 0
  }), [user, sessionToken]);
  
  // Combined error state
  const error = localError || (queryError?.message) || null;
  
  return {
    // State
    user,
    isLoading: isLoading || signInMutation.isPending || signUpMutation.isPending,
    error,
    
    // Actions
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut,
    updateProfile: updateProfileMutation.mutateAsync,
    consumeCredit,
    refreshCredits,
    refetchUser,
    clearError,
    
    // Computed values
    ...computedValues,
    
    // Loading states
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
}

// Export the optimized hook as the new default
export { useOptimizedAuth as useAuth };