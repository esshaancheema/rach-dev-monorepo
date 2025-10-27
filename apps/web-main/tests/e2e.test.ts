/**
 * End-to-End Tests for Zoptal Website
 * 
 * These tests validate complete user journeys and interactions
 * across the website to ensure functionality works as expected.
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

test.describe('Homepage User Journey', () => {
  
  test('should navigate homepage successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Page should load and display key elements
    await expect(page).toHaveTitle(/Zoptal/);
    
    // Hero section should be visible
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();
    
    // Navigation should be present
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    
    // CTA buttons should be clickable
    const ctaButtons = page.locator('a, button').filter({ hasText: /get started|contact|learn more/i });
    const firstCTA = ctaButtons.first();
    if (await firstCTA.count() > 0) {
      await expect(firstCTA).toBeVisible();
      await expect(firstCTA).toBeEnabled();
    }
  });

  test('should navigate to service pages from homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Click on services in navigation or homepage
    const servicesLink = page.locator('a').filter({ hasText: /services/i }).first();
    
    if (await servicesLink.count() > 0) {
      await servicesLink.click();
      
      // Should navigate to services page
      await expect(page).toHaveURL(/\/services/);
      
      // Services page should load properly
      const pageTitle = page.locator('h1').first();
      await expect(pageTitle).toBeVisible();
    }
  });

  test('should display contact information', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Find contact section or link
    const contactElement = page.locator('text=/contact|get in touch|reach out/i').first();
    
    if (await contactElement.count() > 0) {
      await contactElement.click();
      
      // Should show contact information or form
      const contactInfo = page.locator('text=/email|phone|address|contact form/i').first();
      await expect(contactInfo).toBeVisible({ timeout: 5000 });
    }
  });

});

test.describe('Navigation and Menu', () => {
  
  test('should open and close mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/`);
    
    // Look for mobile menu button
    const menuButton = page.locator('button').filter({ hasText: /menu|☰|≡/i });
    const hamburgerButton = page.locator('[aria-label*="menu"], [aria-label*="navigation"]');
    
    const mobileMenuTrigger = await menuButton.count() > 0 ? menuButton.first() : hamburgerButton.first();
    
    if (await mobileMenuTrigger.count() > 0) {
      // Open mobile menu
      await mobileMenuTrigger.click();
      
      // Menu should be visible
      const mobileMenu = page.locator('[role="dialog"], .mobile-menu, [data-testid="mobile-menu"]');
      await expect(mobileMenu.first()).toBeVisible({ timeout: 2000 });
      
      // Close mobile menu (click same button or close button)
      const closeButton = page.locator('button').filter({ hasText: /close|×|✕/i });
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
      } else {
        await mobileMenuTrigger.click();
      }
      
      // Menu should be hidden
      await expect(mobileMenu.first()).toBeHidden({ timeout: 2000 });
    }
  });

  test('should navigate to all main pages', async ({ page }) => {
    const mainPages = [
      { path: '/about', text: 'about' },
      { path: '/services', text: 'services' },
      { path: '/pricing', text: 'pricing' },
      { path: '/contact', text: 'contact' },
      { path: '/case-studies', text: 'case studies' },
      { path: '/resources', text: 'resources' }
    ];
    
    await page.goto(`${BASE_URL}/`);
    
    for (const { path, text } of mainPages) {
      // Find navigation link
      const navLink = page.locator(`nav a[href="${path}"], nav a[href*="${path}"]`).first();
      
      if (await navLink.count() > 0) {
        await navLink.click();
        
        // Should navigate to correct page
        await expect(page).toHaveURL(new RegExp(path.replace('/', '\\/')));
        
        // Page should have meaningful content
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();
        
        // Go back to homepage for next test
        await page.goto(`${BASE_URL}/`);
      }
    }
  });

});

test.describe('Forms and Interactions', () => {
  
  test('should handle contact form submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    
    // Look for contact form
    const contactForm = page.locator('form').first();
    
    if (await contactForm.count() > 0) {
      // Fill out the form
      const nameField = page.locator('input[name*="name"], input[id*="name"]').first();
      const emailField = page.locator('input[type="email"], input[name*="email"]').first();
      const messageField = page.locator('textarea, input[name*="message"]').first();
      
      if (await nameField.count() > 0) {
        await nameField.fill('Test User');
      }
      
      if (await emailField.count() > 0) {
        await emailField.fill('test@example.com');
      }
      
      if (await messageField.count() > 0) {
        await messageField.fill('This is a test message for e2e testing.');
      }
      
      // Submit the form
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Should show some kind of response (success message, new page, etc.)
        const successMessage = page.locator('text=/thank you|success|sent|submitted/i');
        const errorMessage = page.locator('text=/error|failed|try again/i');
        
        // Either success or error should appear
        await expect(successMessage.or(errorMessage).first()).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    
    const contactForm = page.locator('form').first();
    
    if (await contactForm.count() > 0) {
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
      
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Should show validation errors
        const validationErrors = page.locator('text=/required|invalid|error/i');
        await expect(validationErrors.first()).toBeVisible({ timeout: 5000 });
      }
      
      // Test email validation
      const emailField = page.locator('input[type="email"], input[name*="email"]').first();
      
      if (await emailField.count() > 0) {
        await emailField.fill('invalid-email');
        await emailField.blur();
        
        // Should show email validation error
        const emailError = page.locator('text=/invalid.*email|email.*invalid/i');
        await expect(emailError.first()).toBeVisible({ timeout: 3000 });
      }
    }
  });

});

test.describe('Search Functionality', () => {
  
  test('should perform search if available', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Look for search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    
    if (await searchInput.count() > 0) {
      // Perform a search
      await searchInput.fill('development');
      
      // Look for search button or press Enter
      const searchButton = page.locator('button').filter({ hasText: /search/i });
      
      if (await searchButton.count() > 0) {
        await searchButton.click();
      } else {
        await searchInput.press('Enter');
      }
      
      // Should show search results
      const searchResults = page.locator('text=/results|found|search/i');
      await expect(searchResults.first()).toBeVisible({ timeout: 5000 });
    }
  });

});

test.describe('Authentication Flow', () => {
  
  test('should navigate to login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Look for login link
    const loginLink = page.locator('a').filter({ hasText: /login|sign in/i }).first();
    
    if (await loginLink.count() > 0) {
      await loginLink.click();
      
      // Should navigate to login page
      await expect(page).toHaveURL(/\/login/);
      
      // Login form should be visible
      const loginForm = page.locator('form').first();
      await expect(loginForm).toBeVisible();
      
      // Should have email and password fields
      const emailField = page.locator('input[type="email"]').first();
      const passwordField = page.locator('input[type="password"]').first();
      
      await expect(emailField).toBeVisible();
      await expect(passwordField).toBeVisible();
    }
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Look for register/signup link
    const registerLink = page.locator('a').filter({ hasText: /register|sign up|create account/i }).first();
    
    if (await registerLink.count() > 0) {
      await registerLink.click();
      
      // Should navigate to register page
      await expect(page).toHaveURL(/\/register/);
      
      // Register form should be visible
      const registerForm = page.locator('form').first();
      await expect(registerForm).toBeVisible();
    }
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Look for forgot password link
    const forgotPasswordLink = page.locator('a').filter({ hasText: /forgot.*password|reset.*password/i }).first();
    
    if (await forgotPasswordLink.count() > 0) {
      await forgotPasswordLink.click();
      
      // Should navigate to forgot password page
      await expect(page).toHaveURL(/\/forgot-password/);
      
      // Should have email input for reset
      const emailField = page.locator('input[type="email"]').first();
      await expect(emailField).toBeVisible();
      
      // Test reset password form
      await emailField.fill('test@example.com');
      
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // Should show confirmation message
        const confirmationMessage = page.locator('text=/sent|check.*email|reset.*link/i');
        await expect(confirmationMessage.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

});

test.describe('Responsive Design', () => {
  
  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto(`${BASE_URL}/`);
    
    // Main content should be visible
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
    
    // Navigation should be accessible
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/`);
    
    // Content should be readable
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    
    // Text should not be too small
    const bodyText = await page.locator('body').evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });
    
    const fontSize = parseInt(bodyText);
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });

});

test.describe('External Links and Resources', () => {
  
  test('external links should open in new tab', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Find external links
    const externalLinks = page.locator('a[href^="http"]:not([href*="zoptal.com"])');
    
    const linkCount = await externalLinks.count();
    
    if (linkCount > 0) {
      const firstExternalLink = externalLinks.first();
      const target = await firstExternalLink.getAttribute('target');
      const rel = await firstExternalLink.getAttribute('rel');
      
      // External links should open in new tab and have security attributes
      expect(target).toBe('_blank');
      expect(rel).toContain('noopener');
    }
  });

});

test.describe('Error Handling', () => {
  
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/non-existent-page-12345`);
    
    // Should show 404 page or redirect
    const pageContent = await page.textContent('body');
    
    expect(
      pageContent?.includes('404') ||
      pageContent?.includes('not found') ||
      pageContent?.includes('page not found') ||
      page.url() === `${BASE_URL}/` // Redirected to homepage
    ).toBeTruthy();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure for API calls
    await page.route('**/api/**', route => route.abort());
    
    await page.goto(`${BASE_URL}/`);
    
    // Page should still load basic content
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    
    // No JavaScript errors should be visible to user
    const errorMessages = page.locator('text=/error|failed|something went wrong/i');
    const visibleErrors = await errorMessages.count();
    
    // Some error handling is acceptable, but shouldn't break the page
    expect(visibleErrors).toBeLessThan(5);
  });

});

test.describe('Accessibility', () => {
  
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Should be able to navigate using Tab key
    await page.keyboard.press('Tab');
    
    // Check if focus is visible on interactive elements
    const focusedElement = page.locator(':focus');
    
    if (await focusedElement.count() > 0) {
      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
      
      // Focused element should be interactive
      expect(['a', 'button', 'input', 'select', 'textarea']).toContain(tagName);
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    if (headings.length > 0) {
      // Should start with h1
      const firstHeading = headings[0];
      const firstHeadingTag = await firstHeading.evaluate(el => el.tagName.toLowerCase());
      expect(firstHeadingTag).toBe('h1');
      
      // Should not skip heading levels
      let previousLevel = 1;
      
      for (let i = 1; i < headings.length; i++) {
        const heading = headings[i];
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const currentLevel = parseInt(tagName.substring(1));
        
        // Should not skip more than one level
        expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = currentLevel;
      }
    }
  });

});