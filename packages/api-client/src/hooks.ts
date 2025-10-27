import { useState, useEffect, useCallback, useRef } from 'react';
import { ZoptalApiClient } from './api-client';
import { ApiResponse, ApiError } from './types';

// Hook for managing async API calls
export function useAsyncCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const cancelRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<ApiResponse<T>>) => {
    // Cancel previous request if still pending
    if (cancelRef.current) {
      cancelRef.current.abort();
    }

    cancelRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await asyncFunction();
      if (response.success) {
        setData(response.data);
      } else {
        setError({
          message: response.message || 'Request failed',
          details: response,
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      setLoading(false);
      cancelRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    if (cancelRef.current) {
      cancelRef.current.abort();
      cancelRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (cancelRef.current) {
        cancelRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, execute, reset };
}

// Hook for paginated data
export function usePaginatedData<T>(
  fetchFunction: (page: number, limit: number) => Promise<ApiResponse<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>>,
  initialLimit: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async (page: number = 1, limit: number = initialLimit) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFunction(page, limit);
      if (response.success) {
        setData(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError({
          message: response.message || 'Failed to fetch data',
          details: response,
        });
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, initialLimit]);

  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      fetchData(pagination.page + 1, pagination.limit);
    }
  }, [fetchData, pagination.hasNext, pagination.page, pagination.limit]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      fetchData(pagination.page - 1, pagination.limit);
    }
  }, [fetchData, pagination.hasPrev, pagination.page, pagination.limit]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchData(page, pagination.limit);
    }
  }, [fetchData, pagination.totalPages, pagination.limit]);

  const changeLimit = useCallback((newLimit: number) => {
    fetchData(1, newLimit);
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(pagination.page, pagination.limit);
  }, [fetchData, pagination.page, pagination.limit]);

  return {
    data,
    pagination,
    loading,
    error,
    fetchData,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    refresh,
  };
}

// Hook for real-time data with polling
export function usePolling<T>(
  fetchFunction: () => Promise<ApiResponse<T>>,
  interval: number = 5000,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (loading) return; // Prevent concurrent requests

    setLoading(true);
    try {
      const response = await fetchFunction();
      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        setError({
          message: response.message || 'Failed to fetch data',
          details: response,
        });
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loading]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;

    fetchData(); // Initial fetch
    intervalRef.current = setInterval(fetchData, interval);
  }, [fetchData, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    startPolling,
    stopPolling,
    refresh: fetchData,
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>() {
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const performOptimisticUpdate = useCallback(
    async <R>(
      optimisticValue: T,
      asyncFunction: () => Promise<ApiResponse<R>>,
      onSuccess?: (result: R) => void,
      onError?: (error: ApiError) => void
    ) => {
      setOptimisticData(optimisticValue);
      setIsOptimistic(true);

      try {
        const response = await asyncFunction();
        if (response.success) {
          onSuccess?.(response.data);
        } else {
          onError?.({
            message: response.message || 'Update failed',
            details: response,
          });
        }
      } catch (error: any) {
        onError?.(error);
      } finally {
        setIsOptimistic(false);
      }
    },
    []
  );

  const clearOptimistic = useCallback(() => {
    setOptimisticData(null);
    setIsOptimistic(false);
  }, []);

  return {
    optimisticData,
    isOptimistic,
    performOptimisticUpdate,
    clearOptimistic,
  };
}

// Hook for caching API responses
export function useApiCache<T>(
  key: string,
  fetchFunction: () => Promise<ApiResponse<T>>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const getCacheKey = useCallback((key: string) => `api_cache_${key}`, []);

  const getCachedData = useCallback(() => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(getCacheKey(key));
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) {
          return data;
        } else {
          localStorage.removeItem(getCacheKey(key));
        }
      }
    } catch (error) {
      // Invalid cache data, remove it
      localStorage.removeItem(getCacheKey(key));
    }
    return null;
  }, [key, ttl, getCacheKey]);

  const setCachedData = useCallback((data: T) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        getCacheKey(key),
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      // Storage full or other error, ignore
      console.warn('Failed to cache data:', error);
    }
  }, [key, getCacheKey]);

  const fetchData = useCallback(async (useCache: boolean = true) => {
    if (useCache) {
      const cached = getCachedData();
      if (cached) {
        setData(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchFunction();
      if (response.success) {
        setData(response.data);
        setCachedData(response.data);
      } else {
        setError({
          message: response.message || 'Failed to fetch data',
          details: response,
        });
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, getCachedData, setCachedData]);

  const invalidateCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getCacheKey(key));
    }
  }, [key, getCacheKey]);

  const refresh = useCallback(() => {
    invalidateCache();
    fetchData(false);
  }, [fetchData, invalidateCache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidateCache,
  };
}

// Hook for debounced API calls
export function useDebouncedApi<T>(
  fetchFunction: (query: string) => Promise<ApiResponse<T>>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetchFunction(searchQuery);
        if (response.success) {
          setData(response.data);
          setError(null);
        } else {
          setError({
            message: response.message || 'Search failed',
            details: response,
          });
        }
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, delay);
  }, [fetchFunction, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    data,
    loading,
    error,
    search,
  };
}