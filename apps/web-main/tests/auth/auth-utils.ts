import { vi } from 'vitest'

// Mock auth service client
export const mockAuthServiceClient = {
  request: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

// Mock fetch for API calls
export const mockFetch = vi.fn()

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  verified: true,
  twoFactorEnabled: false,
  role: 'user' as const,
}

// Mock tokens
export const mockTokens = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
}

// Mock SAML provider
export const mockSAMLProvider = {
  id: 'saml-provider-123',
  name: 'Acme Corp SSO',
  domain: 'acme.com',
  entityId: 'https://sso.acme.com/metadata',
  organizationId: 'org-123',
  logoUrl: 'https://example.com/logo.png',
}

// Mock OAuth providers
export const mockOAuthProviders = [
  {
    id: 'google',
    name: 'Google',
    authUrl: 'https://accounts.google.com/oauth/authorize',
    scopes: ['email', 'profile'],
  },
  {
    id: 'github',
    name: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    scopes: ['user:email'],
  },
]

// Mock device authorization response
export const mockDeviceAuth = {
  device_code: 'device-code-123',
  user_code: 'ABC-DEF',
  verification_uri: 'https://example.com/device',
  verification_uri_complete: 'https://example.com/device?user_code=ABC-DEF',
  expires_in: 1800,
  interval: 5,
}

// Mock magic link data
export const mockMagicLink = {
  token: 'magic-link-token-123',
  email: 'test@example.com',
  expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
}

// Helper to setup fetch mock
export const setupFetchMock = () => {
  global.fetch = mockFetch
  return mockFetch
}

// Helper to mock successful auth response
export const mockSuccessAuthResponse = (data: any = {}) => {
  return {
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue({
      success: true,
      data: { user: mockUser, ...mockTokens, ...data }
    })
  }
}

// Helper to mock error response
export const mockErrorResponse = (status = 400, error = 'Bad Request') => {
  return {
    ok: false,
    status,
    json: vi.fn().mockResolvedValue({
      success: false,
      error,
      message: `Mock ${error}`
    })
  }
}

// Helper to mock next/navigation
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}

// Helper to mock next/headers cookies
export const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
}

// Cleanup function for tests
export const cleanupMocks = () => {
  vi.clearAllMocks()
  mockFetch.mockClear()
  mockAuthServiceClient.request.mockClear()
}