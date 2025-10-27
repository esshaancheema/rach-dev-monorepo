import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';
import { ApiClientConfig, ApiResponse, ApiError } from './types';

export class BaseApiClient {
  protected client: AxiosInstance;
  protected config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      headers: {},
      onRequest: (config) => config,
      onResponse: (response) => response,
      onError: (error) => Promise.reject(error),
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
      paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        try {
          return this.config.onRequest(config);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        try {
          return this.config.onResponse(response);
        } catch (error) {
          return Promise.reject(error);
        }
      },
      async (error) => {
        const originalRequest = error.config;

        // Retry logic
        if (
          error.code === 'ECONNABORTED' ||
          error.code === 'NETWORK_ERROR' ||
          (error.response?.status >= 500 && error.response?.status < 600)
        ) {
          if (!originalRequest._retryCount) {
            originalRequest._retryCount = 0;
          }

          if (originalRequest._retryCount < this.config.retries) {
            originalRequest._retryCount++;
            
            // Exponential backoff
            const delay = this.config.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return this.client(originalRequest);
          }
        }

        return this.config.onError(error);
      }
    );
  }

  protected async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client(config);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  protected async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, params });
  }

  protected async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data });
  }

  protected async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  protected async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  protected async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url });
  }

  protected handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.message,
        code: error.response.data?.code,
        status: error.response.status,
        details: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'Network error - no response received',
        code: 'NETWORK_ERROR',
        details: error.request,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        details: error,
      };
    }
  }

  // Utility methods
  public setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  public setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  public setTimeout(timeout: number): void {
    this.client.defaults.timeout = timeout;
  }

  public setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  public removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }
}