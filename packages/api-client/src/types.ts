export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  onRequest?: (config: any) => any;
  onResponse?: (response: any) => any;
  onError?: (error: any) => any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: Record<string, any>;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Service-specific types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  avatar?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  type: 'web' | 'mobile' | 'api' | 'desktop' | 'ai';
  framework?: string;
  language?: string;
  repository?: {
    provider: 'github' | 'gitlab' | 'bitbucket';
    url: string;
    branch: string;
  };
  settings: Record<string, any>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIRequest {
  prompt: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'gemini-pro';
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  context?: string;
}

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  usage: {
    apiRequests: number;
    codeGenerations: number;
    storageUsed: number;
  };
  limits: {
    apiRequests: number;
    codeGenerations: number;
    storageLimit: number;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject?: string;
  content: string;
  variables: string[];
}

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId?: string;
  properties: Record<string, any>;
  timestamp?: string;
}

export interface AnalyticsQuery {
  startDate: string;
  endDate: string;
  events?: string[];
  userId?: string;
  groupBy?: string;
  metrics?: string[];
}