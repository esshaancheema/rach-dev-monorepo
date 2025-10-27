import { test, expect } from '@playwright/test';
import { testUsers } from '../setup/test-data';
import { getAppUrl } from '../setup/test-services';

test.describe('Authentication Flow', () => {
  const webMainUrl = getAppUrl('web-main');
  const dashboardUrl = getAppUrl('dashboard');

  test.beforeEach(async ({ page }) => {
    // Start from the main website
    await page.goto(webMainUrl);
  });

  test('should allow user to sign up with valid credentials', async ({ page }) => {
    await page.click('text=Sign Up');
    
    // Fill out registration form
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.fill('[data-testid="email-input"]', uniqueEmail);
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    
    // Accept terms and conditions
    await page.check('[data-testid="terms-checkbox"]');
    
    // Submit form
    await page.click('[data-testid="signup-button"]');
    
    // Should show verification message
    await expect(page.locator('[data-testid="verification-message"]')).toBeVisible();
    await expect(page.locator('text=verification email')).toBeVisible();
  });

  test('should show validation errors for invalid signup data', async ({ page }) => {
    await page.click('text=Sign Up');
    
    // Try to submit empty form
    await page.click('[data-testid="signup-button"]');
    
    // Should show validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    
    // Test invalid email format
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="signup-button"]');
    await expect(page.locator('text=valid email')).toBeVisible();
    
    // Test weak password
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="signup-button"]');
    await expect(page.locator('text=8 characters')).toBeVisible();
    
    // Test password mismatch
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!');
    await page.click('[data-testid="signup-button"]');
    await expect(page.locator('text=passwords do not match')).toBeVisible();
  });

  test('should allow user to login with valid credentials', async ({ page }) => {
    await page.click('text=Sign In');
    
    // Use test user credentials
    const testUser = testUsers[0];
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    
    // Submit login form
    await page.click('[data-testid="login-button"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(new RegExp(dashboardUrl));
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator(`text=${testUser.firstName}`)).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.click('text=Sign In');
    
    // Try invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.click('text=Sign In');
    await page.click('text=Forgot Password');
    
    // Enter email for password reset
    await page.fill('[data-testid="email-input"]', testUsers[0].email);
    await page.click('[data-testid="reset-password-button"]');
    
    // Should show confirmation message
    await expect(page.locator('[data-testid="reset-confirmation"]')).toBeVisible();
    await expect(page.locator('text=reset link has been sent')).toBeVisible();
  });

  test('should allow user to logout', async ({ page }) => {
    // Login first
    await page.click('text=Sign In');
    await page.fill('[data-testid="email-input"]', testUsers[0].email);
    await page.fill('[data-testid="password-input"]', testUsers[0].password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(new RegExp(dashboardUrl));
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to main page
    await expect(page).toHaveURL(webMainUrl);
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should protect dashboard routes for unauthenticated users', async ({ page }) => {
    // Try to access dashboard directly without login
    await page.goto(dashboardUrl);
    
    // Should redirect to login
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
  });

  test('should handle unverified email accounts', async ({ page }) => {
    await page.click('text=Sign In');
    
    // Use unverified test user
    const unverifiedUser = testUsers.find(u => !u.emailVerified);
    if (!unverifiedUser) throw new Error('No unverified test user found');
    
    await page.fill('[data-testid="email-input"]', unverifiedUser.email);
    await page.fill('[data-testid="password-input"]', unverifiedUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Should show email verification required message
    await expect(page.locator('[data-testid="verification-required"]')).toBeVisible();
    await expect(page.locator('text=verify your email')).toBeVisible();
    
    // Should have option to resend verification
    await expect(page.locator('[data-testid="resend-verification"]')).toBeVisible();
  });

  test('should handle session expiration', async ({ page }) => {
    // Login first
    await page.click('text=Sign In');
    await page.fill('[data-testid="email-input"]', testUsers[0].email);
    await page.fill('[data-testid="password-input"]', testUsers[0].password);
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL(new RegExp(dashboardUrl));
    
    // Simulate session expiration by clearing localStorage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to navigate to a protected route
    await page.goto(`${dashboardUrl}/projects`);
    
    // Should redirect to login
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('should remember user preference for staying logged in', async ({ page }) => {
    await page.click('text=Sign In');
    
    await page.fill('[data-testid="email-input"]', testUsers[0].email);
    await page.fill('[data-testid="password-input"]', testUsers[0].password);
    
    // Check "Remember me"
    await page.check('[data-testid="remember-me-checkbox"]');
    await page.click('[data-testid="login-button"]');
    
    await expect(page).toHaveURL(new RegExp(dashboardUrl));
    
    // Verify remember me token is set
    const rememberToken = await page.evaluate(() => 
      localStorage.getItem('remember_token')
    );
    expect(rememberToken).toBeTruthy();
  });
});

test.describe('Two-Factor Authentication', () => {
  test('should allow user to enable 2FA', async ({ page }) => {
    // Login and navigate to security settings
    await page.goto(getAppUrl('web-main'));
    await page.click('text=Sign In');
    await page.fill('[data-testid="email-input"]', testUsers[0].email);
    await page.fill('[data-testid="password-input"]', testUsers[0].password);
    await page.click('[data-testid="login-button"]');
    
    // Go to settings
    await page.goto(`${getAppUrl('dashboard')}/settings/security`);
    
    // Enable 2FA
    await page.click('[data-testid="enable-2fa-button"]');
    
    // Should show QR code
    await expect(page.locator('[data-testid="qr-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="backup-codes"]')).toBeVisible();
    
    // Enter verification code (mock)
    await page.fill('[data-testid="2fa-code-input"]', '123456');
    await page.click('[data-testid="verify-2fa-button"]');
    
    // Should show success message
    await expect(page.locator('[data-testid="2fa-enabled-success"]')).toBeVisible();
  });

  test('should require 2FA code during login when enabled', async ({ page }) => {
    // This test would require a user with 2FA already enabled
    // For now, we'll simulate the flow
    
    await page.goto(getAppUrl('web-main'));
    await page.click('text=Sign In');
    
    // Mock a user with 2FA enabled
    await page.route('**/api/auth/login', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          requiresTwoFactor: true,
          tempToken: 'temp-token-123'
        })
      });
    });
    
    await page.fill('[data-testid="email-input"]', testUsers[0].email);
    await page.fill('[data-testid="password-input"]', testUsers[0].password);
    await page.click('[data-testid="login-button"]');
    
    // Should show 2FA verification form
    await expect(page.locator('[data-testid="2fa-verification-form"]')).toBeVisible();
    await expect(page.locator('text=Enter verification code')).toBeVisible();
  });
});