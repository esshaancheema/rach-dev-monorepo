import { ApiClientConfig } from './types';
import { AuthClient } from './services/auth-client';
import { ProjectClient } from './services/project-client';
import { AIClient } from './services/ai-client';
import { BillingClient } from './services/billing-client';
import { NotificationClient } from './services/notification-client';
import { AnalyticsClient } from './services/analytics-client';

export interface ZoptalApiClientConfig {
  auth?: ApiClientConfig;
  project?: ApiClientConfig;
  ai?: ApiClientConfig;
  billing?: ApiClientConfig;
  notification?: ApiClientConfig;
  analytics?: ApiClientConfig;
  // Global config applied to all services
  global?: ApiClientConfig;
}

export class ZoptalApiClient {
  public auth: AuthClient;
  public project: ProjectClient;
  public ai: AIClient;
  public billing: BillingClient;
  public notification: NotificationClient;
  public analytics: AnalyticsClient;

  private authToken: string | null = null;

  constructor(config: ZoptalApiClientConfig = {}) {
    const globalConfig = config.global || {};

    // Initialize service clients with merged configurations
    this.auth = new AuthClient({
      ...globalConfig,
      ...config.auth,
    });

    this.project = new ProjectClient({
      ...globalConfig,
      ...config.project,
    });

    this.ai = new AIClient({
      ...globalConfig,
      ...config.ai,
    });

    this.billing = new BillingClient({
      ...globalConfig,
      ...config.billing,
    });

    this.notification = new NotificationClient({
      ...globalConfig,
      ...config.notification,
    });

    this.analytics = new AnalyticsClient({
      ...globalConfig,
      ...config.analytics,
    });

    this.setupAuthInterceptors();
  }

  private setupAuthInterceptors(): void {
    // Setup automatic token refresh for all services
    const services = [this.auth, this.project, this.ai, this.billing, this.notification, this.analytics];
    
    services.forEach(service => {
      // Add request interceptor to include auth token
      service['config'].onRequest = (config: any) => {
        if (this.authToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      };

      // Add response interceptor to handle auth errors
      service['config'].onError = async (error: any) => {
        const originalRequest = error.config;

        // If we get a 401 and haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.auth.refreshToken(refreshToken);
              if (response.success) {
                this.setAuthToken(response.data.accessToken);
                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return service['client'](originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearAuth();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      };
    });
  }

  // Authentication management
  public setAuthToken(token: string): void {
    this.authToken = token;
    this.auth.setAuthToken(token);
    this.project.setAuthToken(token);
    this.ai.setAuthToken(token);
    this.billing.setAuthToken(token);
    this.notification.setAuthToken(token);
    this.analytics.setAuthToken(token);

    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoptal_access_token', token);
    }
  }

  public getAuthToken(): string | null {
    if (this.authToken) {
      return this.authToken;
    }

    // Try to get from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('zoptal_access_token');
      if (token) {
        this.setAuthToken(token);
        return token;
      }
    }

    return null;
  }

  public setRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoptal_refresh_token', refreshToken);
    }
  }

  public getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('zoptal_refresh_token');
    }
    return null;
  }

  public clearAuth(): void {
    this.authToken = null;
    this.auth.removeAuthToken();
    this.project.removeAuthToken();
    this.ai.removeAuthToken();
    this.billing.removeAuthToken();
    this.notification.removeAuthToken();
    this.analytics.removeAuthToken();

    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zoptal_access_token');
      localStorage.removeItem('zoptal_refresh_token');
    }
  }

  // Convenience methods for common operations
  public async login(email: string, password: string, rememberMe?: boolean, twoFactorCode?: string) {
    try {
      const response = await this.auth.login({
        email,
        password,
        rememberMe,
        twoFactorCode,
      });

      if (response.success) {
        this.setAuthToken(response.data.accessToken);
        this.setRefreshToken(response.data.refreshToken);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  public async logout() {
    try {
      await this.auth.logout();
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  public async getCurrentUser() {
    if (!this.authToken) {
      return null;
    }

    try {
      const response = await this.auth.getProfile();
      return response.success ? response.data : null;
    } catch (error) {
      // If user fetch fails, clear auth
      this.clearAuth();
      return null;
    }
  }

  // Service URL configuration
  public setServiceUrl(service: keyof ZoptalApiClientConfig, url: string): void {
    switch (service) {
      case 'auth':
        this.auth.setBaseURL(url);
        break;
      case 'project':
        this.project.setBaseURL(url);
        break;
      case 'ai':
        this.ai.setBaseURL(url);
        break;
      case 'billing':
        this.billing.setBaseURL(url);
        break;
      case 'notification':
        this.notification.setBaseURL(url);
        break;
      case 'analytics':
        this.analytics.setBaseURL(url);
        break;
    }
  }

  // Global configuration
  public setTimeout(timeout: number): void {
    this.auth.setTimeout(timeout);
    this.project.setTimeout(timeout);
    this.ai.setTimeout(timeout);
    this.billing.setTimeout(timeout);
    this.notification.setTimeout(timeout);
    this.analytics.setTimeout(timeout);
  }

  public setGlobalHeader(key: string, value: string): void {
    this.auth.setHeader(key, value);
    this.project.setHeader(key, value);
    this.ai.setHeader(key, value);
    this.billing.setHeader(key, value);
    this.notification.setHeader(key, value);
    this.analytics.setHeader(key, value);
  }

  public removeGlobalHeader(key: string): void {
    this.auth.removeHeader(key);
    this.project.removeHeader(key);
    this.ai.removeHeader(key);
    this.billing.removeHeader(key);
    this.notification.removeHeader(key);
    this.analytics.removeHeader(key);
  }

  // Health check for all services
  public async healthCheck(): Promise<Record<string, boolean>> {
    const services = {
      auth: this.auth,
      project: this.project,
      ai: this.ai,
      billing: this.billing,
      notification: this.notification,
      analytics: this.analytics,
    };

    const results: Record<string, boolean> = {};

    await Promise.allSettled(
      Object.entries(services).map(async ([name, service]) => {
        try {
          await service['get']('/health');
          results[name] = true;
        } catch (error) {
          results[name] = false;
        }
      })
    );

    return results;
  }
}