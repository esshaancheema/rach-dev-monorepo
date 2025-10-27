import { BaseApiClient } from '../base-client';
import { 
  ApiClientConfig, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  PaginatedResponse,
  PaginationParams 
} from '../types';

export class AuthClient extends BaseApiClient {
  constructor(config: ApiClientConfig = {}) {
    super({
      baseURL: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:4001',
      ...config,
    });
  }

  // Authentication
  async login(request: LoginRequest) {
    return this.post<AuthTokens>('/auth/login', request);
  }

  async register(request: RegisterRequest) {
    return this.post<{ user: User; tokens: AuthTokens }>('/auth/register', request);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async refreshToken(refreshToken: string) {
    return this.post<AuthTokens>('/auth/refresh', { refreshToken });
  }

  async verifyToken(token: string) {
    return this.post<{ user: User }>('/auth/verify', { token });
  }

  // Password management
  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    return this.post('/auth/reset-password', { token, password });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.post('/auth/change-password', { currentPassword, newPassword });
  }

  // Email verification
  async sendVerificationEmail() {
    return this.post('/auth/send-verification');
  }

  async verifyEmail(token: string) {
    return this.post('/auth/verify-email', { token });
  }

  // Phone verification
  async sendPhoneVerification(phone: string) {
    return this.post('/auth/send-phone-verification', { phone });
  }

  async verifyPhone(phone: string, code: string) {
    return this.post('/auth/verify-phone', { phone, code });
  }

  // Two-factor authentication
  async enableTwoFactor() {
    return this.post<{ qrCode: string; secret: string }>('/auth/2fa/enable');
  }

  async confirmTwoFactor(code: string) {
    return this.post<{ backupCodes: string[] }>('/auth/2fa/confirm', { code });
  }

  async disableTwoFactor(code: string) {
    return this.post('/auth/2fa/disable', { code });
  }

  async generateBackupCodes() {
    return this.post<{ backupCodes: string[] }>('/auth/2fa/backup-codes');
  }

  // User management
  async getProfile() {
    return this.get<User>('/user/profile');
  }

  async updateProfile(data: Partial<User>) {
    return this.put<User>('/user/profile', data);
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request<{ avatarUrl: string }>({
      method: 'POST',
      url: '/user/avatar',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteAccount() {
    return this.delete('/user/account');
  }

  // Sessions
  async getSessions() {
    return this.get<Array<{
      id: string;
      deviceInfo: string;
      ipAddress: string;
      lastActive: string;
      isCurrent: boolean;
    }>>('/user/sessions');
  }

  async revokeSession(sessionId: string) {
    return this.delete(`/user/sessions/${sessionId}`);
  }

  async revokeAllSessions() {
    return this.delete('/user/sessions');
  }

  // User preferences
  async getPreferences() {
    return this.get<Record<string, any>>('/user/preferences');
  }

  async updatePreferences(preferences: Record<string, any>) {
    return this.put<Record<string, any>>('/user/preferences', preferences);
  }

  // Admin endpoints (require admin role)
  async getUsers(params: PaginationParams & { 
    search?: string; 
    role?: string; 
    verified?: boolean 
  } = {}) {
    return this.get<PaginatedResponse<User>>('/admin/users', params);
  }

  async getUserById(userId: string) {
    return this.get<User>(`/admin/users/${userId}`);
  }

  async updateUser(userId: string, data: Partial<User>) {
    return this.put<User>(`/admin/users/${userId}`, data);
  }

  async deleteUser(userId: string) {
    return this.delete(`/admin/users/${userId}`);
  }

  async suspendUser(userId: string, reason: string) {
    return this.post(`/admin/users/${userId}/suspend`, { reason });
  }

  async unsuspendUser(userId: string) {
    return this.post(`/admin/users/${userId}/unsuspend`);
  }

  // Analytics
  async getAuthStats() {
    return this.get<{
      totalUsers: number;
      activeUsers: number;
      newRegistrations: number;
      loginCount: number;
      twoFactorEnabled: number;
    }>('/admin/analytics/auth-stats');
  }
}