import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, HttpMethod } from '@zoptal/types';
import { ApiClientConfig, AuthConfig } from './types';
import {
  ApiClientError,
  NetworkError,
  TimeoutError,
  AuthenticationError,
  AuthorizationError,
  ValidationError
} from './errors';

/**
 * HTTP client wrapper around axios
 */
export class HttpClient {
  private axiosInstance: AxiosInstance;
  private authConfig?: AuthConfig;

  constructor(config: ApiClientConfig, authConfig?: AuthConfig) {
    this.authConfig = authConfig;
    
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        if (this.authConfig?.token) {
          config.headers.Authorization = `Bearer ${this.authConfig.token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle token refresh on 401
        if (error.response?.status === 401 && this.authConfig?.refreshToken) {
          try {
            // Token refresh logic would go here
            // For now, just call the auth error handler
            this.authConfig.onAuthError?.();
          } catch (refreshError) {
            this.authConfig.onAuthError?.();
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ApiClientError {
    if (error.code === 'ECONNABORTED') {
      return new TimeoutError();
    }

    if (!error.response) {
      return new NetworkError();
    }

    const { status, data } = error.response;
    const message = data?.message || error.message || 'An error occurred';

    switch (status) {
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 422:
        return new ValidationError(message, data?.details);
      default:
        return new ApiClientError(message, status, data?.code, data?.details);
    }
  }

  /**
   * Make a generic HTTP request
   */
  async request<T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await this.axiosInstance.request({
        method,
        url,
        data,
        ...config
      });

      return {
        success: true,
        data: response.data,
        meta: {
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw error instanceof ApiClientError ? error : this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  /**
   * Update auth token
   */
  setAuthToken(token: string): void {
    if (this.authConfig) {
      this.authConfig.token = token;
    }
  }

  /**
   * Clear auth token
   */
  clearAuthToken(): void {
    if (this.authConfig) {
      this.authConfig.token = undefined;
    }
  }
}