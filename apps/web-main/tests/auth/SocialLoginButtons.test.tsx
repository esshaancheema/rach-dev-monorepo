import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SocialLoginButtons from '@/components/auth/SocialLoginButtons'
import { 
  setupFetchMock, 
  mockSuccessAuthResponse, 
  mockErrorResponse, 
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

describe('SocialLoginButtons', () => {
  const mockFetch = setupFetchMock()

  beforeEach(() => {
    cleanupMocks()
    mockLocation.href = ''
  })

  afterEach(() => {
    cleanupMocks()
  })

  it('renders Google and GitHub login buttons', () => {
    render(<SocialLoginButtons />)
    
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument()
  })

  it('handles successful Google OAuth initiation', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessAuthResponse({
      authUrl: 'https://accounts.google.com/oauth/authorize?client_id=123'
    }))

    render(<SocialLoginButtons />)
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/oauth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirectUri: 'https://example.com/api/oauth/google/callback',
          state: '/dashboard'
        })
      })
    })

    expect(mockLocation.href).toBe('https://accounts.google.com/oauth/authorize?client_id=123')
  })

  it('handles successful GitHub OAuth initiation', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessAuthResponse({
      authUrl: 'https://github.com/login/oauth/authorize?client_id=456'
    }))

    render(<SocialLoginButtons />)
    
    const githubButton = screen.getByRole('button', { name: /continue with github/i })
    fireEvent.click(githubButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/oauth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirectUri: 'https://example.com/api/oauth/github/callback',
          state: '/dashboard'
        })
      })
    })

    expect(mockLocation.href).toBe('https://github.com/login/oauth/authorize?client_id=456')
  })

  it('uses custom redirect URL when provided', async () => {
    mockFetch.mockResolvedValueOnce(mockSuccessAuthResponse({
      authUrl: 'https://accounts.google.com/oauth/authorize'
    }))

    render(<SocialLoginButtons redirectTo="/custom-page" />)
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/oauth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirectUri: 'https://example.com/api/oauth/google/callback',
          state: '/custom-page'
        })
      })
    })
  })

  it('handles OAuth initiation failure gracefully', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(500, 'OAuth service unavailable'))

    render(<SocialLoginButtons />)
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    // Should not redirect on error
    expect(mockLocation.href).toBe('')
  })

  it('shows loading state during OAuth initiation', async () => {
    // Mock a delayed response
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(mockSuccessAuthResponse({})), 100)
      )
    )

    render(<SocialLoginButtons />)
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    fireEvent.click(googleButton)

    // Button should be disabled during loading
    expect(googleButton).toBeDisabled()

    await waitFor(() => {
      expect(googleButton).not.toBeDisabled()
    })
  })

  it('prevents multiple simultaneous OAuth requests', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(mockSuccessAuthResponse({})), 100)
      )
    )

    render(<SocialLoginButtons />)
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    const githubButton = screen.getByRole('button', { name: /continue with github/i })
    
    fireEvent.click(googleButton)
    fireEvent.click(githubButton)

    // Only one request should be made
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  it('includes proper accessibility attributes', () => {
    render(<SocialLoginButtons />)
    
    const googleButton = screen.getByRole('button', { name: /continue with google/i })
    const githubButton = screen.getByRole('button', { name: /continue with github/i })
    
    expect(googleButton).toHaveAttribute('type', 'button')
    expect(githubButton).toHaveAttribute('type', 'button')
  })
})