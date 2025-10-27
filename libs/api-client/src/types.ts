import { ApiRequestConfig, ApiResponse } from '@zoptal/types';

/**
 * API client configuration
 */
export interface ApiClientConfig extends ApiRequestConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  token?: string;
  refreshToken?: string;
  onTokenRefresh?: (newToken: string) => void;
  onAuthError?: () => void;
}

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (config: any) => any | Promise<any>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = (response: any) => any | Promise<any>;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (error: any) => any | Promise<any>;

/**
 * API client options
 */
export interface ApiClientOptions {
  config: ApiClientConfig;
  auth?: AuthConfig;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
  errorInterceptors?: ErrorInterceptor[];
}