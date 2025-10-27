import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { testConfig } from '../config/test-config';

export interface ServiceClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}

class TestClient implements ServiceClient {
  private client: AxiosInstance;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.client = axios.create({
      baseURL,
      timeout: testConfig.test.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...defaultHeaders,
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        if (process.env.DEBUG_REQUESTS === 'true') {
          console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        if (process.env.DEBUG_RESPONSES === 'true') {
          console.log(`[RESPONSE] ${response.status} ${response.config.url}`, {
            data: response.data,
            headers: response.headers,
          });
        }
        return response;
      },
      (error) => {
        if (process.env.DEBUG_ERRORS === 'true') {
          console.error(`[ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

// Service clients
export const authClient = new TestClient(testConfig.services.auth.url);
export const projectClient = new TestClient(testConfig.services.project.url);
export const aiClient = new TestClient(testConfig.services.ai.url);
export const billingClient = new TestClient(testConfig.services.billing.url);
export const notificationClient = new TestClient(testConfig.services.notification.url);

// Authenticated client factory
export const createAuthenticatedClient = (baseURL: string, token: string): TestClient => {
  const client = new TestClient(baseURL);
  client.setAuthToken(token);
  return client;
};

// Wait for service to be ready
export const waitForService = async (
  client: TestClient,
  healthEndpoint = '/health',
  maxRetries = 30,
  retryDelay = 1000
): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.get(healthEndpoint);
      return true;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error(`Service not ready after ${maxRetries} retries`);
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  return false;
};

// Wait for all services to be ready
export const waitForAllServices = async (): Promise<void> => {
  const serviceChecks = [
    waitForService(authClient),
    waitForService(projectClient),
    waitForService(aiClient),
    waitForService(billingClient),
    waitForService(notificationClient),
  ];

  try {
    await Promise.all(serviceChecks);
    console.log('All services are ready');
  } catch (error) {
    console.error('Failed to connect to services:', error);
    throw error;
  }
};

export { TestClient };