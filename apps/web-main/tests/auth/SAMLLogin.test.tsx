import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SAMLLogin } from '@/components/auth/SAMLLogin'
import { 
  setupFetchMock, 
  mockSuccessAuthResponse, 
  mockErrorResponse,
  mockSAMLProvider,
  cleanupMocks 
} from './auth-utils'

// Mock window.location
const mockLocation = {
  href: '',
  origin: 'https://example.com',
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('SAMLLogin', () => {
  const mockFetch = setupFetchMock()

  beforeEach(() => {
    cleanupMocks()
    mockLocation.href = ''
  })

  afterEach(() => {
    cleanupMocks()
  })

  it('renders domain input for SAML discovery', () => {
    render(<SAMLLogin />)
    
    expect(screen.getByRole('textbox', { name: /company domain/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('discovers SAML provider for valid domain', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessAuthResponse(mockSAMLProvider))

    render(<SAMLLogin />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    fireEvent.change(domainInput, { target: { value: 'acme.com' } })
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/saml/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'acme.com'
        })
      })
    })

    expect(screen.getByText(mockSAMLProvider.name)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with/i })).toBeInTheDocument()
  })

  it('shows error when no SAML provider found', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(404, 'no_provider_found'))

    render(<SAMLLogin />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    fireEvent.change(domainInput, { target: { value: 'unknown.com' } })
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText(/no saml provider configured/i)).toBeInTheDocument()
    })
  })

  it('validates domain format before making API call', async () => {
    render(<SAMLLogin />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    fireEvent.change(domainInput, { target: { value: 'invalid-domain' } })
    fireEvent.click(continueButton)

    expect(screen.getByText(/please enter a valid domain/i)).toBeInTheDocument()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('initiates SAML SSO flow when provider found', async () => {
    mockFetch
      .mockResolvedValueOnce(mockSuccessAuthResponse(mockSAMLProvider))
      .mockResolvedValueOnce(mockSuccessAuthResponse({
        redirectUrl: 'https://sso.acme.com/login?SAMLRequest=...',
        requestId: 'req-123'
      }))

    render(<SAMLLogin />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    fireEvent.change(domainInput, { target: { value: 'acme.com' } })
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText(mockSAMLProvider.name)).toBeInTheDocument()
    })

    const ssoButton = screen.getByRole('button', { name: /sign in with/i })
    fireEvent.click(ssoButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/saml/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: mockSAMLProvider.id,
          domain: 'acme.com',
          redirectTo: '/dashboard'
        })
      })
    })

    expect(mockLocation.href).toBe('https://sso.acme.com/login?SAMLRequest=...')
  })

  it('uses custom redirect URL when provided', async () => {
    mockFetch
      .mockResolvedValueOnce(mockSuccessAuthResponse(mockSAMLProvider))
      .mockResolvedValueOnce(mockSuccessAuthResponse({
        redirectUrl: 'https://sso.acme.com/login',
        requestId: 'req-123'
      }))

    render(<SAMLLogin redirectTo="/custom-page" />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    fireEvent.change(domainInput, { target: { value: 'acme.com' } })
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText(mockSAMLProvider.name)).toBeInTheDocument()
    })

    const ssoButton = screen.getByRole('button', { name: /sign in with/i })
    fireEvent.click(ssoButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith('/api/saml/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: mockSAMLProvider.id,
          domain: 'acme.com',
          redirectTo: '/custom-page'
        })
      })
    })
  })

  it('handles SAML initiation failure gracefully', async () => {
    mockFetch
      .mockResolvedValueOnce(mockSuccessAuthResponse(mockSAMLProvider))
      .mockResolvedValueOnce(mockErrorResponse(500, 'SAML service unavailable'))

    render(<SAMLLogin />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    fireEvent.change(domainInput, { target: { value: 'acme.com' } })
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText(mockSAMLProvider.name)).toBeInTheDocument()
    })

    const ssoButton = screen.getByRole('button', { name: /sign in with/i })
    fireEvent.click(ssoButton)

    await waitFor(() => {
      expect(screen.getByText(/mock saml service unavailable/i)).toBeInTheDocument()
    })

    // Should not redirect on error
    expect(mockLocation.href).toBe('')
  })

  it('displays provider logo when available', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessAuthResponse(mockSAMLProvider))

    render(<SAMLLogin />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    fireEvent.change(domainInput, { target: { value: 'acme.com' } })
    fireEvent.click(continueButton)

    await waitFor(() => {
      const logo = screen.getByRole('img', { name: new RegExp(mockSAMLProvider.name, 'i') })
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', mockSAMLProvider.logoUrl)
    })
  })

  it('shows loading states during API calls', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(mockSuccessAuthResponse(mockSAMLProvider)), 100)
      )
    )

    render(<SAMLLogin />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    fireEvent.change(domainInput, { target: { value: 'acme.com' } })
    fireEvent.click(continueButton)

    expect(continueButton).toBeDisabled()
    expect(screen.getByText(/looking up/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(continueButton).not.toBeDisabled()
    })
  })

  it('allows going back to domain input after provider discovery', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessAuthResponse(mockSAMLProvider))

    render(<SAMLLogin />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    const continueButton = screen.getByRole('button', { name: /continue/i })
    
    fireEvent.change(domainInput, { target: { value: 'acme.com' } })
    fireEvent.click(continueButton)

    await waitFor(() => {
      expect(screen.getByText(mockSAMLProvider.name)).toBeInTheDocument()
    })

    const backButton = screen.getByRole('button', { name: /try different domain/i })
    fireEvent.click(backButton)

    expect(screen.getByRole('textbox', { name: /company domain/i })).toBeInTheDocument()
    expect(screen.queryByText(mockSAMLProvider.name)).not.toBeInTheDocument()
  })

  it('includes proper accessibility attributes', () => {
    render(<SAMLLogin />)
    
    const domainInput = screen.getByRole('textbox', { name: /company domain/i })
    expect(domainInput).toHaveAttribute('type', 'text')
    expect(domainInput).toHaveAttribute('required')
    expect(domainInput).toHaveAttribute('placeholder')
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toHaveAttribute('type', 'submit')
  })
})