import { HttpClient } from './http';
import { ApiClientOptions, ApiClientConfig, AuthConfig } from './types';
import { ApiResponse, HealthCheckResponse } from '@zoptal/types';

/**
 * Main API client class
 */
export class ApiClient {
  private httpClient: HttpClient;
  private config: ApiClientConfig;

  constructor(options: ApiClientOptions) {
    this.config = options.config;
    this.httpClient = new HttpClient(options.config, options.auth);
  }

  /**
   * Get HTTP client instance
   */
  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.httpClient.get<HealthCheckResponse>('/health');
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.httpClient.setAuthToken(token);
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.httpClient.clearAuthToken();
  }

  /**
   * Create a new API client instance with different config
   */
  static create(config: ApiClientConfig, authConfig?: AuthConfig): ApiClient {
    return new ApiClient({
      config,
      auth: authConfig
    });
  }

  /**
   * Create a service-specific client
   */
  createServiceClient(servicePath: string): ApiClient {
    const serviceConfig: ApiClientConfig = {
      ...this.config,
      baseURL: `${this.config.baseURL}${servicePath}`
    };

    return new ApiClient({
      config: serviceConfig
    });
  }
}