import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PasswordlessOptions } from '@/components/auth/PasswordlessOptions'
import { 
  setupFetchMock, 
  mockSuccessAuthResponse, 
  mockErrorResponse,
  mockDeviceAuth,
  mockMagicLink,
  cleanupMocks 
} from './auth-utils'

describe('PasswordlessOptions', () => {
  const mockFetch = setupFetchMock()

  beforeEach(() => {
    cleanupMocks()
  })

  afterEach(() => {
    cleanupMocks()
  })

  it('renders both magic link and device authorization tabs', () => {
    render(<PasswordlessOptions />)
    
    expect(screen.getByText('Magic Link')).toBeInTheDocument()
    expect(screen.getByText('Device Login')).toBeInTheDocument()
  })

  it('defaults to magic link tab', () => {
    render(<PasswordlessOptions />)
    
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument()
  })

  describe('Magic Link Tab', () => {
    it('sends magic link with valid email', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccessAuthResponse(mockMagicLink))

      render(<PasswordlessOptions />)
      
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            redirectTo: '/dashboard'
          })
        })
      })

      expect(screen.getByText(/magic link sent/i)).toBeInTheDocument()
    })

    it('shows error for invalid email format', async () => {
      render(<PasswordlessOptions />)
      
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)

      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('shows error when magic link API fails', async () => {
      mockFetch.mockResolvedValueOnce(mockErrorResponse(400, 'Invalid email'))

      render(<PasswordlessOptions />)
      
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/mock invalid email/i)).toBeInTheDocument()
      })
    })

    it('uses custom redirect URL when provided', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccessAuthResponse(mockMagicLink))

      render(<PasswordlessOptions redirectTo="/custom" />)
      
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            redirectTo: '/custom'
          })
        })
      })
    })
  })

  describe('Device Authorization Tab', () => {
    it('switches to device tab and shows device login form', () => {
      render(<PasswordlessOptions />)
      
      const deviceTab = screen.getByText('Device Login')
      fireEvent.click(deviceTab)

      expect(screen.getByRole('button', { name: /get device code/i })).toBeInTheDocument()
    })

    it('initiates device authorization flow', async () => {
      mockFetch.mockResolvedValueOnce(mockSuccessAuthResponse(mockDeviceAuth))

      render(<PasswordlessOptions />)
      
      const deviceTab = screen.getByText('Device Login')
      fireEvent.click(deviceTab)
      
      const getCodeButton = screen.getByRole('button', { name: /get device code/i })
      fireEvent.click(getCodeButton)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/oauth/device/authorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: 'zoptal-web-app',
            scope: 'read write'
          })
        })
      })

      expect(screen.getByText(mockDeviceAuth.user_code)).toBeInTheDocument()
      expect(screen.getByText(/visit/i)).toBeInTheDocument()
    })

    it('shows error when device authorization fails', async () => {
      mockFetch.mockResolvedValueOnce(mockErrorResponse(500, 'Device auth unavailable'))

      render(<PasswordlessOptions />)
      
      const deviceTab = screen.getByText('Device Login')
      fireEvent.click(deviceTab)
      
      const getCodeButton = screen.getByRole('button', { name: /get device code/i })
      fireEvent.click(getCodeButton)

      await waitFor(() => {
        expect(screen.getByText(/mock device auth unavailable/i)).toBeInTheDocument()
      })
    })

    it('starts polling after successful device code generation', async () => {
      mockFetch
        .mockResolvedValueOnce(mockSuccessAuthResponse(mockDeviceAuth))
        .mockResolvedValueOnce(mockErrorResponse(400, 'authorization_pending'))
        .mockResolvedValueOnce(mockSuccessAuthResponse({
          access_token: 'token-123',
          user: { email: 'test@example.com' }
        }))

      render(<PasswordlessOptions />)
      
      const deviceTab = screen.getByText('Device Login')
      fireEvent.click(deviceTab)
      
      const getCodeButton = screen.getByRole('button', { name: /get device code/i })
      fireEvent.click(getCodeButton)

      await waitFor(() => {
        expect(screen.getByText(mockDeviceAuth.user_code)).toBeInTheDocument()
      })

      // Wait for polling to complete
      await waitFor(() => {
        expect(screen.getByText(/authentication successful/i)).toBeInTheDocument()
      }, { timeout: 10000 })
    })
  })

  it('shows loading states during API calls', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(mockSuccessAuthResponse(mockMagicLink)), 100)
      )
    )

    render(<PasswordlessOptions />)
    
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    const submitButton = screen.getByRole('button', { name: /send magic link/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/sending/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('includes proper accessibility attributes', () => {
    render(<PasswordlessOptions />)
    
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    
    const submitButton = screen.getByRole('button', { name: /send magic link/i })
    expect(submitButton).toHaveAttribute('type', 'submit')
  })
})