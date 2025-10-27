import { test, expect } from '@playwright/test'

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/login')
  })

  test.describe('Social Login', () => {
    test('should display Google and GitHub login buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /continue with github/i })).toBeVisible()
    })

    test('should initiate Google OAuth flow', async ({ page }) => {
      // Mock the OAuth API response
      await page.route('/api/oauth/google', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            authUrl: 'https://accounts.google.com/oauth/authorize?client_id=mock&redirect_uri=callback'
          })
        })
      })

      const googleButton = page.getByRole('button', { name: /continue with google/i })
      
      // Should navigate to Google OAuth URL
      const navigationPromise = page.waitForURL('**/oauth/authorize*')
      await googleButton.click()
      await navigationPromise
      
      expect(page.url()).toContain('accounts.google.com')
    })

    test('should handle OAuth callback with success', async ({ page }) => {
      await page.goto('/api/oauth/google/callback?code=auth_code&state=%2Fdashboard')
      
      // Should redirect to dashboard with success indication
      await expect(page).toHaveURL(/\/dashboard.*auth=success/)
      await expect(page.getByText(/welcome/i)).toBeVisible()
    })

    test('should handle OAuth callback with error', async ({ page }) => {
      await page.goto('/api/oauth/google/callback?error=access_denied&state=%2Flogin')
      
      // Should redirect back to login with error
      await expect(page).toHaveURL(/\/login.*error=/)
      await expect(page.getByText(/authentication.*failed/i)).toBeVisible()
    })
  })

  test.describe('Magic Link Authentication', () => {
    test('should show magic link form in passwordless options', async ({ page }) => {
      const passwordlessButton = page.getByText(/passwordless/i)
      await passwordlessButton.click()
      
      await expect(page.getByText('Magic Link')).toBeVisible()
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible()
    })

    test('should send magic link with valid email', async ({ page }) => {
      await page.route('/api/auth/magic-link', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Magic link sent successfully'
          })
        })
      })

      const passwordlessButton = page.getByText(/passwordless/i)
      await passwordlessButton.click()
      
      const emailInput = page.getByRole('textbox', { name: /email/i })
      const submitButton = page.getByRole('button', { name: /send magic link/i })
      
      await emailInput.fill('test@example.com')
      await submitButton.click()
      
      await expect(page.getByText(/magic link sent/i)).toBeVisible()
    })

    test('should validate email format', async ({ page }) => {
      const passwordlessButton = page.getByText(/passwordless/i)
      await passwordlessButton.click()
      
      const emailInput = page.getByRole('textbox', { name: /email/i })
      const submitButton = page.getByRole('button', { name: /send magic link/i })
      
      await emailInput.fill('invalid-email')
      await submitButton.click()
      
      await expect(page.getByText(/please enter a valid email/i)).toBeVisible()
    })

    test('should verify magic link token', async ({ page }) => {
      // Mock successful token verification
      await page.route('/api/auth/magic-link/verify*', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              access_token: 'mock-token',
              user: { email: 'test@example.com', name: 'Test User' }
            }
          })
        })
      })

      await page.goto('/magic-link/verify?token=valid-token&email=test@example.com')
      
      // Should redirect to dashboard after successful verification
      await expect(page).toHaveURL(/\/dashboard/)
      await expect(page.getByText(/welcome.*test user/i)).toBeVisible()
    })
  })

  test.describe('Device Authorization Flow', () => {
    test('should show device authorization in passwordless options', async ({ page }) => {
      const passwordlessButton = page.getByText(/passwordless/i)
      await passwordlessButton.click()
      
      const deviceTab = page.getByText('Device Login')
      await deviceTab.click()
      
      await expect(page.getByRole('button', { name: /get device code/i })).toBeVisible()
    })

    test('should generate device code', async ({ page }) => {
      await page.route('/api/oauth/device/authorize', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              device_code: 'device-123',
              user_code: 'ABC-DEF',
              verification_uri: 'https://example.com/device',
              expires_in: 1800
            }
          })
        })
      })

      const passwordlessButton = page.getByText(/passwordless/i)
      await passwordlessButton.click()
      
      const deviceTab = page.getByText('Device Login')
      await deviceTab.click()
      
      const getCodeButton = page.getByRole('button', { name: /get device code/i })
      await getCodeButton.click()
      
      await expect(page.getByText('ABC-DEF')).toBeVisible()
      await expect(page.getByText(/visit.*example.com\/device/i)).toBeVisible()
    })

    test('should handle device verification flow', async ({ page }) => {
      // Mock device code generation
      await page.route('/api/oauth/device/authorize', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              device_code: 'device-123',
              user_code: 'ABC-DEF',
              verification_uri: 'https://example.com/device'
            }
          })
        })
      })

      // Mock successful device verification after polling
      let pollCount = 0
      await page.route('/api/oauth/device/verify', async route => {
        pollCount++
        if (pollCount < 3) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'authorization_pending'
            })
          })
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              data: {
                access_token: 'device-token',
                user: { email: 'test@example.com' }
              }
            })
          })
        }
      })

      await page.goto('/device/demo')
      
      const getCodeButton = page.getByRole('button', { name: /get device code/i })
      await getCodeButton.click()
      
      // Wait for device code to appear
      await expect(page.getByText('ABC-DEF')).toBeVisible()
      
      // Should eventually show success after polling
      await expect(page.getByText(/authentication successful/i)).toBeVisible({ timeout: 15000 })
    })
  })

  test.describe('SAML SSO', () => {
    test('should show SAML login option', async ({ page }) => {
      const samlButton = page.getByText(/enterprise sso/i)
      await samlButton.click()
      
      await expect(page.getByRole('textbox', { name: /company domain/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
    })

    test('should discover SAML provider', async ({ page }) => {
      await page.route('/api/saml/discover', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'saml-123',
              name: 'Acme Corp SSO',
              domain: 'acme.com',
              logoUrl: 'https://example.com/logo.png'
            }
          })
        })
      })

      const samlButton = page.getByText(/enterprise sso/i)
      await samlButton.click()
      
      const domainInput = page.getByRole('textbox', { name: /company domain/i })
      const continueButton = page.getByRole('button', { name: /continue/i })
      
      await domainInput.fill('acme.com')
      await continueButton.click()
      
      await expect(page.getByText('Acme Corp SSO')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in with/i })).toBeVisible()
    })

    test('should handle SAML provider not found', async ({ page }) => {
      await page.route('/api/saml/discover', async route => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'no_provider_found',
            message: 'No SAML provider configured for domain "unknown.com"'
          })
        })
      })

      const samlButton = page.getByText(/enterprise sso/i)
      await samlButton.click()
      
      const domainInput = page.getByRole('textbox', { name: /company domain/i })
      const continueButton = page.getByRole('button', { name: /continue/i })
      
      await domainInput.fill('unknown.com')
      await continueButton.click()
      
      await expect(page.getByText(/no saml provider configured/i)).toBeVisible()
    })

    test('should initiate SAML SSO flow', async ({ page }) => {
      await page.route('/api/saml/discover', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'saml-123',
              name: 'Acme Corp SSO',
              domain: 'acme.com'
            }
          })
        })
      })

      await page.route('/api/saml/initiate', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              redirectUrl: 'https://sso.acme.com/login?SAMLRequest=...'
            }
          })
        })
      })

      const samlButton = page.getByText(/enterprise sso/i)
      await samlButton.click()
      
      const domainInput = page.getByRole('textbox', { name: /company domain/i })
      const continueButton = page.getByRole('button', { name: /continue/i })
      
      await domainInput.fill('acme.com')
      await continueButton.click()
      
      await expect(page.getByText('Acme Corp SSO')).toBeVisible()
      
      const ssoButton = page.getByRole('button', { name: /sign in with/i })
      
      // Should navigate to SAML provider
      const navigationPromise = page.waitForURL('**/sso.acme.com/**')
      await ssoButton.click()
      await navigationPromise
      
      expect(page.url()).toContain('sso.acme.com')
    })
  })

  test.describe('Authentication State', () => {
    test('should redirect authenticated users away from login', async ({ page }) => {
      // Mock authenticated state
      await page.addInitScript(() => {
        localStorage.setItem('auth_token', 'mock-token')
      })

      await page.goto('/login')
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test('should show loading state during authentication', async ({ page }) => {
      await page.route('/api/auth/login', async route => {
        // Delay response to test loading state
        await new Promise(resolve => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      })

      const loginButton = page.getByRole('button', { name: /sign in/i }).first()
      await loginButton.click()
      
      await expect(page.getByText(/signing in/i)).toBeVisible()
    })

    test('should persist authentication across page reloads', async ({ page }) => {
      // Mock successful login
      await page.route('/api/auth/login', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              access_token: 'mock-token',
              user: { email: 'test@example.com' }
            }
          })
        })
      })

      // Login first
      const emailInput = page.getByRole('textbox', { name: /email/i }).first()
      const passwordInput = page.getByRole('textbox', { name: /password/i }).first()
      const loginButton = page.getByRole('button', { name: /sign in/i }).first()
      
      await emailInput.fill('test@example.com')
      await passwordInput.fill('password')
      await loginButton.click()
      
      await expect(page).toHaveURL(/\/dashboard/)
      
      // Reload page
      await page.reload()
      
      // Should still be authenticated
      await expect(page).toHaveURL(/\/dashboard/)
      await expect(page.getByText(/test@example.com/i)).toBeVisible()
    })
  })
})