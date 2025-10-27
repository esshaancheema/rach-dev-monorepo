import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  AuthSession,
  PasswordResetRequest,
  PasswordReset
} from './types';
import { AUTH_ERRORS, DEFAULT_USER_PREFERENCES } from './config';
import { AuthApiClient, RegisterRequest, LoginRequest } from '@/lib/api/auth-client';

// Enterprise Auth Service - Proxies to microservice
const authClient = new AuthApiClient();

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Convert AuthApiClient response to internal AuthResponse format
   */
  private mapApiResponse<T>(apiResponse: any, successData?: T): AuthResponse<T> {
    if (apiResponse.success) {
      return {
        success: true,
        data: successData || apiResponse.data,
        message: apiResponse.message,
      };
    } else {
      return {
        success: false,
        error: {
          code: apiResponse.error || 'UNKNOWN_ERROR',
          message: apiResponse.message || 'An error occurred',
        },
      };
    }
  }

  /**
   * Map UserResponse from API client to internal User type
   */
  private mapUserResponse(userResponse: any): User {
    return {
      id: userResponse.id,
      email: userResponse.email,
      firstName: userResponse.firstName,
      lastName: userResponse.lastName,
      phone: userResponse.phone,
      isEmailVerified: userResponse.isEmailVerified,
      isPhoneVerified: userResponse.isPhoneVerified,
      status: userResponse.status,
      role: userResponse.role,
      lastLoginAt: userResponse.lastLoginAt ? new Date(userResponse.lastLoginAt) : undefined,
      createdAt: new Date(userResponse.createdAt),
      updatedAt: new Date(userResponse.updatedAt),
      // Set default values for fields that might not be in the API response
      twoFactorEnabled: false,
      preferences: DEFAULT_USER_PREFERENCES,
      company: undefined,
      timezone: 'UTC',
      locale: 'en',
    };
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData, ipAddress: string, userAgent: string): Promise<AuthResponse<{ 
    user: User; 
    session?: AuthSession; 
    requiresVerification: boolean; 
  }>> {
    try {
      // Prepare request for enterprise auth service
      const registerRequest: RegisterRequest = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        clientInfo: {
          ip: ipAddress,
          userAgent: userAgent,
        },
      };

      // Call enterprise auth service
      const apiResponse = await authClient.register(registerRequest);
      
      if (apiResponse.success && apiResponse.data) {
        return {
          success: true,
          data: {
            user: this.mapUserResponse(apiResponse.data.user),
            requiresVerification: apiResponse.data.requiresVerification?.email || true,
          },
          message: apiResponse.message || 'Registration successful! Please check your email to verify your account.',
        };
      } else {
        return this.mapApiResponse(apiResponse);
      }

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Registration failed. Please try again.',
        },
      };
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials, ipAddress: string, userAgent: string): Promise<AuthResponse<{
    user: User;
    session: AuthSession;
  }>> {
    try {
      // Prepare request for enterprise auth service
      const loginRequest: LoginRequest = {
        email: credentials.email,
        password: credentials.password,
        deviceId: credentials.deviceId,
        rememberMe: credentials.rememberMe,
        clientInfo: {
          ip: ipAddress,
          userAgent: userAgent,
        },
      };

      // Call enterprise auth service
      const apiResponse = await authClient.login(loginRequest);
      
      if (apiResponse.success && apiResponse.data) {
        // Map session data to AuthSession format
        const session: AuthSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: apiResponse.data.user.id,
          accessToken: apiResponse.data.accessToken,
          refreshToken: apiResponse.data.refreshToken,
          expiresAt: new Date(apiResponse.data.expiresAt),
          ipAddress,
          userAgent,
          lastActivity: new Date(),
          createdAt: new Date(),
        };

        return {
          success: true,
          data: {
            user: this.mapUserResponse(apiResponse.data.user),
            session,
          },
          message: apiResponse.message || 'Login successful!',
        };
      } else {
        return this.mapApiResponse(apiResponse);
      }

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Login failed. Please try again.',
        },
      };
    }
  }

  /**
   * Logout user
   */
  async logout(accessToken?: string, refreshToken?: string, allDevices?: boolean): Promise<AuthResponse<void>> {
    try {
      // Call enterprise auth service
      const apiResponse = await authClient.logout({
        accessToken,
        refreshToken,
        allDevices,
      });
      
      return this.mapApiResponse(apiResponse);
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Logout failed. Please try again.',
        },
      };
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<AuthResponse<{ user: User }>> {
    try {
      // Call enterprise auth service
      const apiResponse = await authClient.verifyEmail({ token });
      
      if (apiResponse.success && apiResponse.data?.user) {
        return {
          success: true,
          data: {
            user: this.mapUserResponse(apiResponse.data.user)
          },
          message: apiResponse.message || 'Email verified successfully!',
        };
      } else {
        return this.mapApiResponse(apiResponse);
      }

    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: 'Email verification failed. Please try again.',
        },
      };
    }
  }

  /**
   * Request password reset
   * TODO: Implement with enterprise auth service
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<AuthResponse<void>> {
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Password reset is handled by the enterprise auth service. This method needs to be implemented.',
      },
    };
  }

  /**
   * Reset password
   * TODO: Implement with enterprise auth service
   */
  async resetPassword(reset: PasswordReset): Promise<AuthResponse<void>> {
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Password reset is handled by the enterprise auth service. This method needs to be implemented.',
      },
    };
  }

  /**
   * Refresh authentication session
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse<{
    user: User;
    session: AuthSession;
  }>> {
    try {
      // Call enterprise auth service
      const apiResponse = await authClient.refreshToken(refreshToken);
      
      if (apiResponse.success && apiResponse.data) {
        // Get user profile with new access token
        const userResponse = await authClient.getProfile(apiResponse.data.accessToken);
        
        if (userResponse.success && userResponse.data?.user) {
          // Map session data to AuthSession format
          const session: AuthSession = {
            id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userResponse.data.user.id,
            accessToken: apiResponse.data.accessToken,
            refreshToken: apiResponse.data.refreshToken,
            expiresAt: new Date(apiResponse.data.expiresAt),
            ipAddress: 'refreshed',
            userAgent: 'refreshed',
            lastActivity: new Date(),
            createdAt: new Date(),
          };

          return {
            success: true,
            data: {
              user: this.mapUserResponse(userResponse.data.user),
              session,
            },
          };
        }
      }
      
      return this.mapApiResponse(apiResponse);

    } catch (error) {
      console.error('Session refresh error:', error);
      return {
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: 'Session refresh failed. Please log in again.',
        },
      };
    }
  }

  /**
   * Get user by ID (requires access token)
   */
  async getUserById(accessToken: string): Promise<User | null> {
    try {
      const apiResponse = await authClient.getProfile(accessToken);
      
      if (apiResponse.success && apiResponse.data?.user) {
        return this.mapUserResponse(apiResponse.data.user);
      }
      
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   * TODO: Implement with enterprise auth service
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse<{ user: User }>> {
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Profile updates are handled by the enterprise auth service. This method needs to be implemented.',
      },
    };
  }

}

// Export singleton instance
export const authService = AuthService.getInstance();