// API endpoint configuration and management
// This module provides centralized API endpoint definitions and utilities

export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  description: string;
  requiresAuth?: boolean;
  rateLimit?: {
    requests: number;
    window: string; // e.g., '1m', '1h', '1d'
  };
  cache?: {
    ttl: number; // seconds
    tags?: string[];
  };
}

export interface EndpointGroup {
  name: string;
  baseUrl: string;
  description: string;
  version: string;
  endpoints: Record<string, ApiEndpoint>;
}

// Base configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  version: 'v1',
  timeout: 10000,
  retries: 3,
} as const;

// Authentication endpoints
export const AUTH_ENDPOINTS: EndpointGroup = {
  name: 'Authentication',
  baseUrl: '/api/auth',
  description: 'User authentication and session management',
  version: 'v1',
  endpoints: {
    login: {
      path: '/login',
      method: 'POST',
      description: 'Authenticate user with email and password',
      rateLimit: { requests: 5, window: '15m' },
    },
    register: {
      path: '/register',
      method: 'POST',
      description: 'Register new user account',
      rateLimit: { requests: 3, window: '1h' },
    },
    logout: {
      path: '/logout',
      method: 'POST',
      description: 'End user session',
      requiresAuth: true,
    },
    refresh: {
      path: '/refresh',
      method: 'POST',
      description: 'Refresh authentication token',
      requiresAuth: true,
      rateLimit: { requests: 10, window: '1h' },
    },
    forgotPassword: {
      path: '/forgot-password',
      method: 'POST',
      description: 'Request password reset email',
      rateLimit: { requests: 3, window: '1h' },
    },
    resetPassword: {
      path: '/reset-password',
      method: 'POST',
      description: 'Reset password with token',
      rateLimit: { requests: 3, window: '1h' },
    },
    verifyEmail: {
      path: '/verify-email',
      method: 'POST',
      description: 'Verify email address with token',
      rateLimit: { requests: 5, window: '1h' },
    },
    resendVerification: {
      path: '/resend-verification',
      method: 'POST',
      description: 'Resend email verification',
      requiresAuth: true,
      rateLimit: { requests: 3, window: '1h' },
    },
  },
};

// User management endpoints
export const USER_ENDPOINTS: EndpointGroup = {
  name: 'User Management',
  baseUrl: '/api/users',
  description: 'User profile and account management',
  version: 'v1',
  endpoints: {
    profile: {
      path: '/profile',
      method: 'GET',
      description: 'Get user profile information',
      requiresAuth: true,
      cache: { ttl: 300, tags: ['user'] },
    },
    updateProfile: {
      path: '/profile',
      method: 'PUT',
      description: 'Update user profile information',
      requiresAuth: true,
    },
    changePassword: {
      path: '/change-password',
      method: 'POST',
      description: 'Change user password',
      requiresAuth: true,
      rateLimit: { requests: 3, window: '1h' },
    },
    uploadAvatar: {
      path: '/avatar',
      method: 'POST',
      description: 'Upload user avatar image',
      requiresAuth: true,
      rateLimit: { requests: 5, window: '1h' },
    },
    deleteAccount: {
      path: '/account',
      method: 'DELETE',
      description: 'Delete user account (GDPR)',
      requiresAuth: true,
      rateLimit: { requests: 1, window: '1d' },
    },
    exportData: {
      path: '/export',
      method: 'GET',
      description: 'Export user data (GDPR)',
      requiresAuth: true,
      rateLimit: { requests: 1, window: '1d' },
    },
  },
};

// Project management endpoints
export const PROJECT_ENDPOINTS: EndpointGroup = {
  name: 'Project Management',
  baseUrl: '/api/projects',
  description: 'Project creation and management',
  version: 'v1',
  endpoints: {
    list: {
      path: '',
      method: 'GET',
      description: 'Get user projects with pagination',
      requiresAuth: true,
      cache: { ttl: 60, tags: ['projects'] },
    },
    create: {
      path: '',
      method: 'POST',
      description: 'Create new project',
      requiresAuth: true,
      rateLimit: { requests: 10, window: '1h' },
    },
    get: {
      path: '/:id',
      method: 'GET',
      description: 'Get project by ID',
      requiresAuth: true,
      cache: { ttl: 300, tags: ['project'] },
    },
    update: {
      path: '/:id',
      method: 'PUT',
      description: 'Update project information',
      requiresAuth: true,
    },
    delete: {
      path: '/:id',
      method: 'DELETE',
      description: 'Delete project',
      requiresAuth: true,
    },
    duplicate: {
      path: '/:id/duplicate',
      method: 'POST',
      description: 'Duplicate existing project',
      requiresAuth: true,
      rateLimit: { requests: 5, window: '1h' },
    },
    share: {
      path: '/:id/share',
      method: 'POST',
      description: 'Generate project share link',
      requiresAuth: true,
      rateLimit: { requests: 10, window: '1h' },
    },
  },
};

// AI service endpoints
export const AI_ENDPOINTS: EndpointGroup = {
  name: 'AI Services',
  baseUrl: '/api/ai',
  description: 'AI-powered features and integrations',
  version: 'v1',
  endpoints: {
    demo: {
      path: '/demo',
      method: 'POST',
      description: 'Generate AI demo/preview',
      rateLimit: { requests: 10, window: '1h' },
    },
    generateCode: {
      path: '/generate-code',
      method: 'POST',
      description: 'Generate code from description',
      requiresAuth: true,
      rateLimit: { requests: 20, window: '1h' },
    },
    chat: {
      path: '/chat',
      method: 'POST',
      description: 'AI chat assistance',
      requiresAuth: true,
      rateLimit: { requests: 100, window: '1h' },
    },
    analyze: {
      path: '/analyze',
      method: 'POST',
      description: 'Analyze code or requirements',
      requiresAuth: true,
      rateLimit: { requests: 50, window: '1h' },
    },
    optimize: {
      path: '/optimize',
      method: 'POST',
      description: 'Optimize existing code',
      requiresAuth: true,
      rateLimit: { requests: 20, window: '1h' },
    },
    suggestions: {
      path: '/suggestions',
      method: 'POST',
      description: 'Get AI suggestions for improvements',
      requiresAuth: true,
      rateLimit: { requests: 30, window: '1h' },
    },
  },
};

// Analytics endpoints
export const ANALYTICS_ENDPOINTS: EndpointGroup = {
  name: 'Analytics',
  baseUrl: '/api/analytics',
  description: 'Usage analytics and reporting',
  version: 'v1',
  endpoints: {
    track: {
      path: '/track',
      method: 'POST',
      description: 'Track user events',
      rateLimit: { requests: 1000, window: '1h' },
    },
    overview: {
      path: '/overview',
      method: 'GET',
      description: 'Get analytics overview',
      requiresAuth: true,
      cache: { ttl: 300, tags: ['analytics'] },
    },
    usage: {
      path: '/usage',
      method: 'GET',
      description: 'Get usage statistics',
      requiresAuth: true,
      cache: { ttl: 3600, tags: ['usage'] },
    },
    performance: {
      path: '/performance',
      method: 'GET',
      description: 'Get performance metrics',
      requiresAuth: true,
      cache: { ttl: 900, tags: ['performance'] },
    },
    export: {
      path: '/export',
      method: 'GET',
      description: 'Export analytics data',
      requiresAuth: true,
      rateLimit: { requests: 5, window: '1d' },
    },
  },
};

// Billing endpoints
export const BILLING_ENDPOINTS: EndpointGroup = {
  name: 'Billing',
  baseUrl: '/api/billing',
  description: 'Subscription and payment management',
  version: 'v1',
  endpoints: {
    subscription: {
      path: '/subscription',
      method: 'GET',
      description: 'Get current subscription details',
      requiresAuth: true,
      cache: { ttl: 300, tags: ['billing'] },
    },
    subscribe: {
      path: '/subscribe',
      method: 'POST',
      description: 'Create new subscription',
      requiresAuth: true,
      rateLimit: { requests: 5, window: '1h' },
    },
    updatePayment: {
      path: '/payment-method',
      method: 'POST',
      description: 'Update payment method',
      requiresAuth: true,
      rateLimit: { requests: 10, window: '1h' },
    },
    cancel: {
      path: '/cancel',
      method: 'POST',
      description: 'Cancel subscription',
      requiresAuth: true,
      rateLimit: { requests: 3, window: '1d' },
    },
    invoices: {
      path: '/invoices',
      method: 'GET',
      description: 'Get billing invoices',
      requiresAuth: true,
      cache: { ttl: 3600, tags: ['invoices'] },
    },
    usage: {
      path: '/usage',
      method: 'GET',
      description: 'Get billing usage data',
      requiresAuth: true,
      cache: { ttl: 900, tags: ['billing-usage'] },
    },
    webhooks: {
      path: '/webhooks/stripe',
      method: 'POST',
      description: 'Handle Stripe webhooks',
    },
  },
};

// Contact and lead endpoints
export const CONTACT_ENDPOINTS: EndpointGroup = {
  name: 'Contact & Leads',
  baseUrl: '/api/contact',
  description: 'Contact forms and lead management',
  version: 'v1',
  endpoints: {
    general: {
      path: '/general',
      method: 'POST',
      description: 'General contact form submission',
      rateLimit: { requests: 3, window: '1h' },
    },
    demo: {
      path: '/demo',
      method: 'POST',
      description: 'Demo request form submission',
      rateLimit: { requests: 5, window: '1h' },
    },
    quote: {
      path: '/quote',
      method: 'POST',
      description: 'Quote request form submission',
      rateLimit: { requests: 3, window: '1h' },
    },
    consultation: {
      path: '/consultation',
      method: 'POST',
      description: 'Consultation booking request',
      rateLimit: { requests: 3, window: '1h' },
    },
    enterprise: {
      path: '/enterprise',
      method: 'POST',
      description: 'Enterprise inquiry form',
      rateLimit: { requests: 3, window: '1h' },
    },
    newsletter: {
      path: '/newsletter',
      method: 'POST',
      description: 'Newsletter subscription',
      rateLimit: { requests: 5, window: '1h' },
    },
    unsubscribe: {
      path: '/unsubscribe',
      method: 'POST',
      description: 'Newsletter unsubscription',
      rateLimit: { requests: 10, window: '1h' },
    },
  },
};

// Blog and content endpoints
export const CONTENT_ENDPOINTS: EndpointGroup = {
  name: 'Content Management',
  baseUrl: '/api/content',
  description: 'Blog posts and dynamic content',
  version: 'v1',
  endpoints: {
    blogPosts: {
      path: '/blog/posts',
      method: 'GET',
      description: 'Get blog posts with pagination',
      cache: { ttl: 1800, tags: ['blog'] },
    },
    blogPost: {
      path: '/blog/posts/:slug',
      method: 'GET',
      description: 'Get single blog post by slug',
      cache: { ttl: 3600, tags: ['blog-post'] },
    },
    blogCategories: {
      path: '/blog/categories',
      method: 'GET',
      description: 'Get blog categories',
      cache: { ttl: 7200, tags: ['blog-categories'] },
    },
    blogTags: {
      path: '/blog/tags',
      method: 'GET',
      description: 'Get blog tags',
      cache: { ttl: 7200, tags: ['blog-tags'] },
    },
    caseStudies: {
      path: '/case-studies',
      method: 'GET',
      description: 'Get case studies',
      cache: { ttl: 3600, tags: ['case-studies'] },
    },
    caseStudy: {
      path: '/case-studies/:slug',
      method: 'GET',
      description: 'Get single case study by slug',
      cache: { ttl: 7200, tags: ['case-study'] },
    },
    testimonials: {
      path: '/testimonials',
      method: 'GET',
      description: 'Get testimonials',
      cache: { ttl: 3600, tags: ['testimonials'] },
    },
  },
};

// Search endpoints
export const SEARCH_ENDPOINTS: EndpointGroup = {
  name: 'Search',
  baseUrl: '/api/search',
  description: 'Site-wide search functionality',
  version: 'v1',
  endpoints: {
    global: {
      path: '/global',
      method: 'GET',
      description: 'Global site search',
      rateLimit: { requests: 100, window: '1h' },
      cache: { ttl: 300, tags: ['search'] },
    },
    suggestions: {
      path: '/suggestions',
      method: 'GET',
      description: 'Search suggestions and autocomplete',
      rateLimit: { requests: 200, window: '1h' },
      cache: { ttl: 600, tags: ['search-suggestions'] },
    },
    filters: {
      path: '/filters',
      method: 'GET',
      description: 'Get available search filters',
      cache: { ttl: 3600, tags: ['search-filters'] },
    },
  },
};

// File management endpoints
export const FILE_ENDPOINTS: EndpointGroup = {
  name: 'File Management',
  baseUrl: '/api/files',
  description: 'File upload and management',
  version: 'v1',
  endpoints: {
    upload: {
      path: '/upload',
      method: 'POST',
      description: 'Upload file to cloud storage',
      requiresAuth: true,
      rateLimit: { requests: 20, window: '1h' },
    },
    delete: {
      path: '/:id',
      method: 'DELETE',
      description: 'Delete uploaded file',
      requiresAuth: true,
      rateLimit: { requests: 50, window: '1h' },
    },
    list: {
      path: '/list',
      method: 'GET',
      description: 'List user uploaded files',
      requiresAuth: true,
      cache: { ttl: 300, tags: ['files'] },
    },
    getSignedUrl: {
      path: '/signed-url',
      method: 'POST',
      description: 'Get signed URL for direct upload',
      requiresAuth: true,
      rateLimit: { requests: 30, window: '1h' },
    },
  },
};

// System endpoints
export const SYSTEM_ENDPOINTS: EndpointGroup = {
  name: 'System',
  baseUrl: '/api/system',
  description: 'System health and maintenance',
  version: 'v1',
  endpoints: {
    health: {
      path: '/health',
      method: 'GET',
      description: 'System health check',
      cache: { ttl: 30, tags: ['health'] },
    },
    status: {
      path: '/status',
      method: 'GET',
      description: 'Detailed system status',
      cache: { ttl: 60, tags: ['status'] },
    },
    version: {
      path: '/version',
      method: 'GET',
      description: 'API version information',
      cache: { ttl: 3600, tags: ['version'] },
    },
    maintenance: {
      path: '/maintenance',
      method: 'GET',
      description: 'Maintenance mode status',
      cache: { ttl: 300, tags: ['maintenance'] },
    },
  },
};

// All endpoint groups
export const ENDPOINT_GROUPS = {
  auth: AUTH_ENDPOINTS,
  users: USER_ENDPOINTS,
  projects: PROJECT_ENDPOINTS,
  ai: AI_ENDPOINTS,
  analytics: ANALYTICS_ENDPOINTS,
  billing: BILLING_ENDPOINTS,
  contact: CONTACT_ENDPOINTS,
  content: CONTENT_ENDPOINTS,
  search: SEARCH_ENDPOINTS,
  files: FILE_ENDPOINTS,
  system: SYSTEM_ENDPOINTS,
} as const;

// Utility functions
export function buildEndpointUrl(group: keyof typeof ENDPOINT_GROUPS, endpoint: string, params?: Record<string, string>): string {
  const endpointGroup = ENDPOINT_GROUPS[group];
  const endpointConfig = endpointGroup.endpoints[endpoint];
  
  if (!endpointConfig) {
    throw new Error(`Endpoint ${endpoint} not found in group ${group}`);
  }

  let path = endpointConfig.path;
  
  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }

  return `${API_CONFIG.baseUrl}${endpointGroup.baseUrl}${path}`;
}

export function getEndpointConfig(group: keyof typeof ENDPOINT_GROUPS, endpoint: string): ApiEndpoint {
  const endpointGroup = ENDPOINT_GROUPS[group];
  const endpointConfig = endpointGroup.endpoints[endpoint];
  
  if (!endpointConfig) {
    throw new Error(`Endpoint ${endpoint} not found in group ${group}`);
  }

  return endpointConfig;
}

export function getAllEndpoints(): Array<{ group: string; endpoint: string; config: ApiEndpoint }> {
  const allEndpoints: Array<{ group: string; endpoint: string; config: ApiEndpoint }> = [];
  
  Object.entries(ENDPOINT_GROUPS).forEach(([groupName, group]) => {
    Object.entries(group.endpoints).forEach(([endpointName, config]) => {
      allEndpoints.push({
        group: groupName,
        endpoint: endpointName,
        config,
      });
    });
  });

  return allEndpoints;
}

export function getEndpointsByFeature(requiresAuth?: boolean, hasRateLimit?: boolean): Array<{ group: string; endpoint: string; config: ApiEndpoint }> {
  return getAllEndpoints().filter(({ config }) => {
    if (requiresAuth !== undefined && !!config.requiresAuth !== requiresAuth) {
      return false;
    }
    if (hasRateLimit !== undefined && !!config.rateLimit !== hasRateLimit) {
      return false;
    }
    return true;
  });
}

// Rate limiting helpers
export function getRateLimitKey(group: string, endpoint: string, userId?: string): string {
  const baseKey = `ratelimit:${group}:${endpoint}`;
  return userId ? `${baseKey}:${userId}` : `${baseKey}:anonymous`;
}

export function getCacheKey(group: string, endpoint: string, params?: Record<string, any>): string {
  const baseKey = `cache:${group}:${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return `${baseKey}:${Buffer.from(paramString).toString('base64')}`;
  }
  return baseKey;
}

// Export types for use in other modules
export type EndpointGroupName = keyof typeof ENDPOINT_GROUPS;
export type EndpointName<T extends EndpointGroupName> = keyof typeof ENDPOINT_GROUPS[T]['endpoints'];

// Development helpers
export function generateApiDocumentation(): string {
  let documentation = '# API Documentation\n\n';
  
  Object.entries(ENDPOINT_GROUPS).forEach(([groupName, group]) => {
    documentation += `## ${group.name}\n`;
    documentation += `${group.description}\n`;
    documentation += `Base URL: \`${group.baseUrl}\`\n`;
    documentation += `Version: ${group.version}\n\n`;
    
    Object.entries(group.endpoints).forEach(([endpointName, config]) => {
      documentation += `### ${endpointName}\n`;
      documentation += `**${config.method}** \`${group.baseUrl}${config.path}\`\n\n`;
      documentation += `${config.description}\n\n`;
      
      if (config.requiresAuth) {
        documentation += '🔒 **Requires Authentication**\n\n';
      }
      
      if (config.rateLimit) {
        documentation += `⏱️ **Rate Limited**: ${config.rateLimit.requests} requests per ${config.rateLimit.window}\n\n`;
      }
      
      if (config.cache) {
        documentation += `💾 **Cached**: ${config.cache.ttl} seconds\n\n`;
      }
      
      documentation += '---\n\n';
    });
  });
  
  return documentation;
}