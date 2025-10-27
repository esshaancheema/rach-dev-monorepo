import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/saml/discover/route'

// Mock auth service client
vi.mock('@/lib/auth-service-client', () => ({
  authService: {
    request: vi.fn()
  }
}))

import { authService } from '@/lib/auth-service-client'

describe('/api/saml/discover', () => {
  const mockRequest = (body: any) => {
    return new NextRequest('https://example.com/api/saml/discover', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json'
      }
    })
  }

  const mockSAMLProvider = {
    id: 'saml-provider-123',
    name: 'Acme Corp SSO',
    domain: 'acme.com',
    entityId: 'https://sso.acme.com/metadata',
    organizationId: 'org-123',
    logoUrl: 'https://example.com/logo.png'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('discovers SAML provider for valid domain', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: mockSAMLProvider
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      domain: 'acme.com'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(authService.request).toHaveBeenCalledWith('POST', '/api/v1/saml/discover', {
      domain: 'acme.com'
    })

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('SAML provider discovered successfully')
    expect(data.data).toEqual(mockSAMLProvider)
  })

  it('validates required domain field', async () => {
    const request = mockRequest({})

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Domain is required')
    expect(authService.request).not.toHaveBeenCalled()
  })

  it('normalizes domain input (lowercase and trim)', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: mockSAMLProvider
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      domain: '  ACME.COM  '
    })

    await POST(request)

    expect(authService.request).toHaveBeenCalledWith('POST', '/api/v1/saml/discover', {
      domain: 'acme.com'
    })
  })

  it('handles no provider found (404)', async () => {
    const mockAuthResponse = {
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({
        error: 'no_provider_found',
        message: 'No SAML provider configured for domain'
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      domain: 'unknown.com'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.error).toBe('no_provider_found')
    expect(data.message).toBe('No SAML provider configured for domain "unknown.com"')
  })

  it('handles other auth service errors', async () => {
    const mockAuthResponse = {
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({
        error: 'internal_server_error',
        message: 'SAML discovery service error'
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      domain: 'acme.com'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('internal_server_error')
    expect(data.message).toBe('SAML discovery service error')
  })

  it('handles auth service connection errors', async () => {
    vi.mocked(authService.request).mockRejectedValue(new Error('Connection failed'))

    const request = mockRequest({
      domain: 'acme.com'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.success).toBe(false)
    expect(data.error).toBe('discovery_unavailable')
    expect(data.message).toBe('SAML discovery service is currently unavailable. Please try again later.')
  })

  it('validates domain format', async () => {
    const invalidDomains = [
      '', // empty
      'not-a-domain', // no TLD
      'http://example.com', // includes protocol
      'user@example.com', // email format
      'example..com', // double dots
      '.example.com', // starts with dot
      'example.com.' // ends with dot
    ]

    for (const domain of invalidDomains) {
      const request = mockRequest({ domain })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
      expect(authService.request).not.toHaveBeenCalled()
      
      vi.clearAllMocks()
    }
  })

  it('filters sensitive information in response', async () => {
    const mockAuthResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: {
          ...mockSAMLProvider,
          privateKey: 'secret-key',
          certificate: 'secret-cert',
          internalConfig: { secret: 'value' }
        }
      })
    }
    
    vi.mocked(authService.request).mockResolvedValue(mockAuthResponse as any)

    const request = mockRequest({
      domain: 'acme.com'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.data).toEqual(mockSAMLProvider)
    expect(data.data.privateKey).toBeUndefined()
    expect(data.data.certificate).toBeUndefined()
    expect(data.data.internalConfig).toBeUndefined()
  })

  it('handles malformed JSON request body', async () => {
    const request = new NextRequest('https://example.com/api/saml/discover', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'content-type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.success).toBe(false)
    expect(data.error).toBe('discovery_unavailable')
  })

  it('blocks suspicious domains', async () => {
    const suspiciousDomains = [
      'localhost',
      '127.0.0.1',
      '192.168.1.1',
      'internal.company.com',
      'test.localhost'
    ]

    for (const domain of suspiciousDomains) {
      const request = mockRequest({ domain })
      const response = await POST(request)
      
      expect(response.status).toBe(400)
      expect(authService.request).not.toHaveBeenCalled()
      
      vi.clearAllMocks()
    }
  })
})