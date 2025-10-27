import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/oauth/google/route'

// Mock auth service client
vi.mock('@/lib/auth-service-client', () => ({
  authService: {
    request: vi.fn()
  }
}))

import { authService } from '@/lib/auth-service-client'

describe('/api/oauth/google', () => {
  const mockRequest = (body: any) => {
    return new NextRequest('https://example.com/api/oauth/google', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json'
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initiates Google OAuth flow successfully', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: {
          authUrl: 'https://accounts.google.com/oauth/authorize?client_id=123&redirect_uri=callback',
          state: 'state-123',
          codeVerifier: 'verifier-123'
        }
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      redirectUri: 'https://example.com/api/oauth/google/callback',
      state: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(authService.request).toHaveBeenCalledWith('POST', '/api/oauth/google/authorize', {
      redirectUri: 'https://example.com/api/oauth/google/callback',
      state: '/dashboard',
      scopes: ['email', 'profile']
    })

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.authUrl).toBe('https://accounts.google.com/oauth/authorize?client_id=123&redirect_uri=callback')
  })

  it('validates required redirectUri field', async () => {
    const request = mockRequest({
      state: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('validation_error')
    expect(data.message).toContain('Redirect URI is required')
    expect(authService.request).not.toHaveBeenCalled()
  })

  it('validates redirectUri format', async () => {
    const request = mockRequest({
      redirectUri: 'invalid-uri',
      state: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('validation_error')
    expect(data.message).toContain('Invalid redirect URI format')
  })

  it('uses default state when not provided', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: {
          authUrl: 'https://accounts.google.com/oauth/authorize',
          state: 'state-123'
        }
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      redirectUri: 'https://example.com/api/oauth/google/callback'
    })

    await POST(request)

    expect(authService.request).toHaveBeenCalledWith('POST', '/api/oauth/google/authorize', {
      redirectUri: 'https://example.com/api/oauth/google/callback',
      state: '/dashboard',
      scopes: ['email', 'profile']
    })
  })

  it('handles auth service errors gracefully', async () => {
    const mockAuthResponse = {
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({
        error: 'invalid_client',
        message: 'Google OAuth client not configured'
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      redirectUri: 'https://example.com/api/oauth/google/callback',
      state: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('invalid_client')
    expect(data.message).toBe('Google OAuth client not configured')
  })

  it('handles auth service connection errors', async () => {
    vi.mocked(authService.request).mockRejectedValue(new Error('Connection failed'))

    const request = mockRequest({
      redirectUri: 'https://example.com/api/oauth/google/callback',
      state: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toBe('service_unavailable')
    expect(data.message).toBe('Google OAuth service is temporarily unavailable')
  })

  it('validates redirect URI matches expected domain', async () => {
    const request = mockRequest({
      redirectUri: 'https://malicious.com/callback',
      state: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('validation_error')
    expect(data.message).toContain('Invalid redirect URI domain')
  })

  it('validates state parameter format', async () => {
    const request = mockRequest({
      redirectUri: 'https://example.com/api/oauth/google/callback',
      state: 'javascript:alert(1)'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('validation_error')
    expect(data.message).toContain('Invalid state parameter')
  })

  it('includes custom scopes when provided', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: {
          authUrl: 'https://accounts.google.com/oauth/authorize',
          state: 'state-123'
        }
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      redirectUri: 'https://example.com/api/oauth/google/callback',
      state: '/dashboard',
      scopes: ['email', 'profile', 'https://www.googleapis.com/auth/calendar.readonly']
    })

    await POST(request)

    expect(authService.request).toHaveBeenCalledWith('POST', '/api/oauth/google/authorize', {
      redirectUri: 'https://example.com/api/oauth/google/callback',
      state: '/dashboard',
      scopes: ['email', 'profile', 'https://www.googleapis.com/auth/calendar.readonly']
    })
  })

  it('handles malformed JSON request body', async () => {
    const request = new NextRequest('https://example.com/api/oauth/google', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('validation_error')
    expect(data.message).toContain('Invalid request body')
  })
})