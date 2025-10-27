import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/magic-link/route'

// Mock auth service client
vi.mock('@/lib/auth-service-client', () => ({
  authService: {
    request: vi.fn()
  }
}))

import { authService } from '@/lib/auth-service-client'

describe('/api/auth/magic-link', () => {
  const mockRequest = (body: any) => {
    return new NextRequest('https://example.com/api/auth/magic-link', {
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

  it('sends magic link with valid email', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: {
          token: 'magic-token-123',
          email: 'test@example.com',
          expires: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        }
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      email: 'test@example.com',
      redirectTo: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(authService.request).toHaveBeenCalledWith('POST', '/api/v1/magic-link/send', {
      email: 'test@example.com',
      redirectTo: '/dashboard',
      baseUrl: 'https://example.com'
    })

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Magic link sent successfully')
  })

  it('validates required email field', async () => {
    const request = mockRequest({
      redirectTo: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('validation_error')
    expect(data.message).toContain('Email is required')
    expect(authService.request).not.toHaveBeenCalled()
  })

  it('validates email format', async () => {
    const request = mockRequest({
      email: 'invalid-email',
      redirectTo: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('validation_error')
    expect(data.message).toContain('Invalid email format')
    expect(authService.request).not.toHaveBeenCalled()
  })

  it('uses default redirect URL when not provided', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: { token: 'magic-token-123' }
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      email: 'test@example.com'
    })

    await POST(request)

    expect(authService.request).toHaveBeenCalledWith('POST', '/api/v1/magic-link/send', {
      email: 'test@example.com',
      redirectTo: '/dashboard',
      baseUrl: 'https://example.com'
    })
  })

  it('handles auth service errors gracefully', async () => {
    const mockAuthResponse = {
      ok: false,
      status: 429,
      json: vi.fn().mockResolvedValue({
        error: 'rate_limit_exceeded',
        message: 'Too many magic link requests'
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      email: 'test@example.com',
      redirectTo: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('rate_limit_exceeded')
    expect(data.message).toBe('Too many magic link requests')
  })

  it('handles auth service connection errors', async () => {
    vi.mocked(authService.request).mockRejectedValue(new Error('Connection failed'))

    const request = mockRequest({
      email: 'test@example.com',
      redirectTo: '/dashboard'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toBe('service_unavailable')
    expect(data.message).toBe('Magic link service is temporarily unavailable')
  })

  it('sanitizes email input', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: { token: 'magic-token-123' }
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      email: '  TEST@EXAMPLE.COM  ',
      redirectTo: '/dashboard'
    })

    await POST(request)

    expect(authService.request).toHaveBeenCalledWith('POST', '/api/v1/magic-link/send', {
      email: 'test@example.com',
      redirectTo: '/dashboard',
      baseUrl: 'https://example.com'
    })
  })

  it('validates redirectTo URL format', async () => {
    const request = mockRequest({
      email: 'test@example.com',
      redirectTo: 'javascript:alert(1)'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('validation_error')
    expect(data.message).toContain('Invalid redirect URL')
  })

  it('blocks external redirect URLs', async () => {
    const request = mockRequest({
      email: 'test@example.com',
      redirectTo: 'https://malicious.com/steal-data'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('validation_error')
    expect(data.message).toContain('External redirect URLs are not allowed')
  })

  it('allows valid internal redirect URLs', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: { token: 'magic-token-123' }
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const validUrls = ['/dashboard', '/profile', '/settings?tab=security']

    for (const redirectTo of validUrls) {
      const request = mockRequest({
        email: 'test@example.com',
        redirectTo
      })

      const response = await POST(request)
      expect(response.status).toBe(200)
    }
  })
})