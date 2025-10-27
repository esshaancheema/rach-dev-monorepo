import jwt from 'jsonwebtoken';
import { testConfig } from '../config/test-config';
import { authClient } from './test-client';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthenticatedUser extends TestUser {
  tokens: AuthTokens;
}

export class AuthHelper {
  /**
   * Create a test JWT token for a user
   */
  static createTestToken(user: TestUser, expiresIn: string = '1h'): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'user',
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, testConfig.jwt.secret, { expiresIn });
  }

  /**
   * Register a new test user
   */
  static async registerTestUser(userData: Partial<TestUser> = {}): Promise<AuthenticatedUser> {
    const defaultUser = {
      email: `test_${Date.now()}@example.com`,
      name: 'Test User',
      password: 'TestPassword123!',
      ...userData,
    };

    const response = await authClient.post('/auth/register', defaultUser);
    
    if (response.status !== 201) {
      throw new Error(`Failed to register user: ${response.data.message}`);
    }

    return {
      id: response.data.user.id,
      email: response.data.user.email,
      name: response.data.user.name,
      role: response.data.user.role,
      tokens: response.data.tokens,
    };
  }

  /**
   * Login with existing user credentials
   */
  static async loginUser(email: string, password: string): Promise<AuthenticatedUser> {
    const response = await authClient.post('/auth/login', {
      email,
      password,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to login user: ${response.data.message}`);
    }

    return {
      id: response.data.user.id,
      email: response.data.user.email,
      name: response.data.user.name,
      role: response.data.user.role,
      tokens: response.data.tokens,
    };
  }

  /**
   * Create multiple test users
   */
  static async createTestUsers(count: number): Promise<AuthenticatedUser[]> {
    const users: AuthenticatedUser[] = [];
    
    for (let i = 0; i < count; i++) {
      const user = await this.registerTestUser({
        email: `testuser${i + 1}@example.com`,
        name: `Test User ${i + 1}`,
      });
      users.push(user);
    }

    return users;
  }

  /**
   * Create an admin user
   */
  static async createAdminUser(): Promise<AuthenticatedUser> {
    return this.registerTestUser({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    });
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await authClient.post('/auth/refresh', {
      refreshToken,
    });

    if (response.status !== 200) {
      throw new Error(`Failed to refresh token: ${response.data.message}`);
    }

    return response.data.tokens;
  }

  /**
   * Logout user (invalidate tokens)
   */
  static async logoutUser(accessToken: string): Promise<void> {
    await authClient.post('/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Verify if token is valid
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, testConfig.jwt.secret);
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  /**
   * Create a user with specific permissions
   */
  static async createUserWithPermissions(permissions: string[]): Promise<AuthenticatedUser> {
    const user = await this.registerTestUser();
    
    // In a real scenario, you would assign permissions through the admin API
    // For testing, we'll mock this by updating the user record directly
    // This would typically be done through an admin endpoint
    
    return user;
  }

  /**
   * Get user profile
   */
  static async getUserProfile(accessToken: string): Promise<TestUser> {
    const response = await authClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to get user profile: ${response.data.message}`);
    }

    return response.data.user;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    accessToken: string,
    updates: Partial<TestUser>
  ): Promise<TestUser> {
    const response = await authClient.patch('/auth/profile', updates, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to update user profile: ${response.data.message}`);
    }

    return response.data.user;
  }

  /**
   * Delete user account
   */
  static async deleteUser(accessToken: string): Promise<void> {
    await authClient.delete('/auth/account', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Generate test users for different scenarios
   */
  static async generateTestScenarioUsers(): Promise<{
    basicUser: AuthenticatedUser;
    premiumUser: AuthenticatedUser;
    adminUser: AuthenticatedUser;
    inactiveUser: AuthenticatedUser;
  }> {
    const [basicUser, premiumUser, adminUser, inactiveUser] = await Promise.all([
      this.registerTestUser({
        email: 'basic@example.com',
        name: 'Basic User',
        role: 'user',
      }),
      this.registerTestUser({
        email: 'premium@example.com',
        name: 'Premium User',
        role: 'premium',
      }),
      this.registerTestUser({
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      }),
      this.registerTestUser({
        email: 'inactive@example.com',
        name: 'Inactive User',
        role: 'inactive',
      }),
    ]);

    return { basicUser, premiumUser, adminUser, inactiveUser };
  }
}

// Export helper functions for backward compatibility
export const createTestToken = AuthHelper.createTestToken;
export const registerTestUser = AuthHelper.registerTestUser;
export const loginUser = AuthHelper.loginUser;
export const createTestUsers = AuthHelper.createTestUsers;