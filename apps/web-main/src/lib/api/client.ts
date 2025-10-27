'use client';

import { toast } from 'react-hot-toast';

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: any;
}

export interface RequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  silent?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  headers?: Record<string, string>;
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = { ...DEFAULT_HEADERS };
    
    // Initialize auth token from localStorage
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('auth_token');
    }
  }

  // Auth management
  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearAuthToken() {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // Headers management
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Request with retry logic
  private async requestWithRetry<T>(
    url: string,
    options: RequestInit,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = DEFAULT_TIMEOUT,
      retries = 3,
      retryDelay = 1000,
      silent = false,
      showSuccessToast = false,
      showErrorToast = true,
    } = config;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: this.getHeaders(config.headers),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            errorData.code,
            response.status,
            errorData
          );
        }

        const data: ApiResponse<T> = await response.json();

        // Success toast
        if (showSuccessToast && data.message && !silent) {
          toast.success(data.message);
        }

        return data;

      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) or auth errors
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          break;
        }

        // Don't retry on abort errors
        if (error.name === 'AbortError') {
          break;
        }

        // Wait before retry (except on last attempt)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    // Handle final error
    const apiError = lastError instanceof ApiError ? lastError : new ApiError(
      lastError?.message || 'Network error occurred',
      'NETWORK_ERROR',
      0
    );

    // Error toast
    if (showErrorToast && !silent) {
      toast.error(apiError.message);
    }

    // Handle auth errors
    if (apiError.status === 401) {
      this.clearAuthToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    throw apiError;
  }

  // HTTP Methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    return this.requestWithRetry<T>(url, { method: 'GET' }, config);
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    return this.requestWithRetry<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, config);
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    return this.requestWithRetry<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, config);
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    return this.requestWithRetry<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    return this.requestWithRetry<T>(url, { method: 'DELETE' }, config);
  }

  // File upload
  async upload<T>(
    endpoint: string, 
    file: File, 
    additionalData?: Record<string, any>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(config?.headers);
    delete headers['Content-Type']; // Let browser set multipart boundary

    return this.requestWithRetry<T>(url, {
      method: 'POST',
      body: formData,
    }, { ...config, headers });
  }

  // Batch requests
  async batch<T>(requests: Array<{
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: any;
  }>): Promise<ApiResponse<T[]>> {
    return this.post<T[]>('/batch', { requests });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', { silent: true, showErrorToast: false });
      return true;
    } catch {
      return false;
    }
  }
}

// Custom ApiError class
class ApiError extends Error {
  public code?: string;
  public status: number;
  public details?: any;

  constructor(message: string, code?: string, status: number = 0, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Convenience functions
export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post('/auth/login', credentials, { showSuccessToast: true }),
    register: (userData: { email: string; password: string; name: string }) =>
      apiClient.post('/auth/register', userData, { showSuccessToast: true }),
    logout: () =>
      apiClient.post('/auth/logout', {}, { showSuccessToast: true }),
    refresh: () =>
      apiClient.post('/auth/refresh', {}, { silent: true }),
    forgotPassword: (email: string) =>
      apiClient.post('/auth/forgot-password', { email }, { showSuccessToast: true }),
    resetPassword: (token: string, password: string) =>
      apiClient.post('/auth/reset-password', { token, password }, { showSuccessToast: true }),
  },

  // User
  user: {
    profile: () => apiClient.get('/user/profile'),
    updateProfile: (data: any) =>
      apiClient.put('/user/profile', data, { showSuccessToast: true }),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      apiClient.post('/user/change-password', data, { showSuccessToast: true }),
    uploadAvatar: (file: File) =>
      apiClient.upload('/user/avatar', file, {}, { showSuccessToast: true }),
  },

  // Projects
  projects: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      apiClient.get(`/projects${params ? `?${new URLSearchParams(params as any)}` : ''}`),
    get: (id: string) => apiClient.get(`/projects/${id}`),
    create: (data: any) =>
      apiClient.post('/projects', data, { showSuccessToast: true }),
    update: (id: string, data: any) =>
      apiClient.put(`/projects/${id}`, data, { showSuccessToast: true }),
    delete: (id: string) =>
      apiClient.delete(`/projects/${id}`, { showSuccessToast: true }),
  },

  // AI Agents
  agents: {
    list: () => apiClient.get('/agents'),
    get: (id: string) => apiClient.get(`/agents/${id}`),
    create: (data: any) =>
      apiClient.post('/agents', data, { showSuccessToast: true }),
    update: (id: string, data: any) =>
      apiClient.put(`/agents/${id}`, data, { showSuccessToast: true }),
    delete: (id: string) =>
      apiClient.delete(`/agents/${id}`, { showSuccessToast: true }),
    execute: (id: string, input: any) =>
      apiClient.post(`/agents/${id}/execute`, { input }),
  },

  // Analytics
  analytics: {
    overview: () => apiClient.get('/analytics/overview'),
    usage: (period?: string) =>
      apiClient.get(`/analytics/usage${period ? `?period=${period}` : ''}`),
    performance: () => apiClient.get('/analytics/performance'),
  },

  // Billing
  billing: {
    subscription: () => apiClient.get('/billing/subscription'),
    usage: () => apiClient.get('/billing/usage'),
    invoices: () => apiClient.get('/billing/invoices'),
    updatePayment: (data: any) =>
      apiClient.post('/billing/payment-method', data, { showSuccessToast: true }),
    cancelSubscription: () =>
      apiClient.post('/billing/cancel', {}, { showSuccessToast: true }),
  },

  // Contact & Support
  contact: {
    submit: (data: { name: string; email: string; message: string; subject?: string }) =>
      apiClient.post('/contact', data, { showSuccessToast: true }),
    demo: (data: { name: string; email: string; company?: string; message?: string }) =>
      apiClient.post('/contact/demo', data, { showSuccessToast: true }),
  },

  // Newsletter
  newsletter: {
    subscribe: (data: { email: string; firstName?: string; interests?: string[] }) =>
      apiClient.post('/newsletter/subscribe', data, { showSuccessToast: true }),
    unsubscribe: (token: string) =>
      apiClient.post('/newsletter/unsubscribe', { token }, { showSuccessToast: true }),
  },

  // Blog & Resources
  blog: {
    posts: (params?: { page?: number; limit?: number; category?: string; tag?: string }) =>
      apiClient.get(`/blog/posts${params ? `?${new URLSearchParams(params as any)}` : ''}`),
    post: (slug: string) => apiClient.get(`/blog/posts/${slug}`),
    categories: () => apiClient.get('/blog/categories'),
    tags: () => apiClient.get('/blog/tags'),
  },

  // Case Studies
  caseStudies: {
    list: (params?: { solution?: string; industry?: string }) =>
      apiClient.get(`/case-studies${params ? `?${new URLSearchParams(params as any)}` : ''}`),
    get: (slug: string) => apiClient.get(`/case-studies/${slug}`),
  },
};

// React hooks for API calls
export { apiClient as default };