import { QueryClient } from '@tanstack/react-query'

// Create a client with optimized defaults for auth operations
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache auth data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Don't refetch on window focus for auth data
      refetchOnWindowFocus: false,
      // Retry failed requests 2 times
      retry: 2,
      // Retry with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Longer timeout for auth mutations
      networkMode: 'online',
    },
  },
})

// Query keys factory for consistency
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: (token?: string) => [...authKeys.all, 'session', token] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  permissions: (userId: string) => [...authKeys.all, 'permissions', userId] as const,
  samlProviders: (domain?: string) => [...authKeys.all, 'saml', 'providers', domain] as const,
  oauthProviders: () => [...authKeys.all, 'oauth', 'providers'] as const,
}

// Prefetch commonly used data
export const prefetchAuthData = async () => {
  await Promise.allSettled([
    // Prefetch OAuth providers list
    queryClient.prefetchQuery({
      queryKey: authKeys.oauthProviders(),
      queryFn: async () => {
        const response = await fetch('/api/oauth/providers')
        if (!response.ok) throw new Error('Failed to fetch OAuth providers')
        return response.json()
      },
      staleTime: 30 * 60 * 1000, // 30 minutes - providers don't change often
    }),
  ])
}

// Invalidate auth-related queries
export const invalidateAuthQueries = () => {
  return queryClient.invalidateQueries({ queryKey: authKeys.all })
}

// Clear all auth data from cache
export const clearAuthCache = () => {
  queryClient.removeQueries({ queryKey: authKeys.all })
}