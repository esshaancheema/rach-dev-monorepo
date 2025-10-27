import { z } from 'zod';

// Types for API requests and responses
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  clientInfo: {
    ip: string;
    userAgent: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  rememberMe?: boolean;
  clientInfo: {
    ip: string;
    userAgent: string;
  };
}

export interface LogoutRequest {
  accessToken?: string;
  refreshToken?: string;
  allDevices?: boolean;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyPhoneRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: string;
  role: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Auth client configuration
interface AuthClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export class AuthApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(config: AuthClientConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
    this.timeout = config.timeout || 10000; // 10 seconds
    this.retries = config.retries || 3;
  }

  /**
   * Make HTTP request to auth service
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api/auth${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Zoptal-Web-Client/1.0',
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on client errors (4xx) or if it's the last attempt
        if (attempt === this.retries || (error instanceof Error && error.message.includes('HTTP 4'))) {
          break;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<{
    user: UserResponse;
    emailVerificationSent?: boolean;
    phoneVerificationSent?: boolean;
  }>> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      }),
      headers: {
        'X-Forwarded-For': data.clientInfo.ip,
        'User-Agent': data.clientInfo.userAgent,
      },
    });
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<ApiResponse<{
    user: UserResponse;
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
    requiresVerification?: {
      email: boolean;
      phone: boolean;
    };
  }>> {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        deviceId: data.deviceId,
        rememberMe: data.rememberMe,
      }),
      headers: {
        'X-Forwarded-For': data.clientInfo.ip,
        'User-Agent': data.clientInfo.userAgent,
      },
    });
  }

  /**
   * Logout user
   */
  async logout(data: LogoutRequest): Promise<ApiResponse<void>> {
    const headers: Record<string, string> = {};
    
    if (data.accessToken) {
      headers['Authorization'] = `Bearer ${data.accessToken}`;
    }

    return this.request('/logout', {
      method: 'POST',
      body: JSON.stringify({
        allDevices: data.allDevices,
      }),
      headers,
    });
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<{
    user?: UserResponse;
  }>> {
    return this.request('/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        token: data.token,
      }),
    });
  }

  /**
   * Verify phone number
   */
  async verifyPhone(data: VerifyPhoneRequest): Promise<ApiResponse<{
    user?: UserResponse;
  }>> {
    return this.request('/verify-phone', {
      method: 'POST',
      body: JSON.stringify({
        token: data.token,
      }),
    });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(data: ResendVerificationRequest): Promise<ApiResponse<void>> {
    return this.request('/resend-email-verification', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
      }),
    });
  }

  /**
   * Resend phone verification
   */
  async resendPhoneVerification(data: ResendVerificationRequest): Promise<ApiResponse<void>> {
    return this.request('/resend-phone-verification', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
      }),
    });
  }

  /**
   * Get current user profile
   */
  async getProfile(accessToken: string): Promise<ApiResponse<{
    user: UserResponse;
  }>> {
    return this.request('/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
  }>> {
    return this.request('/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    version: string;
  }> {
    const response = await fetch(`${this.baseUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
  }
}

// Singleton instance
let authClientInstance: AuthApiClient | null = null;

export function getAuthClient(): AuthApiClient {
  if (!authClientInstance) {
    authClientInstance = new AuthApiClient();
  }
  return authClientInstance;
}

// Configuration utilities
export const authConfig = {
  SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
  TIMEOUT: parseInt(process.env.AUTH_SERVICE_TIMEOUT || '10000'),
  RETRIES: parseInt(process.env.AUTH_SERVICE_RETRIES || '3'),
} as const;