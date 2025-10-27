import { test, expect } from '@playwright/test';
import { testUsers, testProjects, testApiKeys } from '../setup/test-data';
import { getAppUrl } from '../setup/test-services';

test.describe('Dashboard Functionality', () => {
  const dashboardUrl = getAppUrl('dashboard');

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(getAppUrl('web-main'));
    await page.click('text=Sign In');
    await page.fill('[data-testid="email-input"]', testUsers[0].email);
    await page.fill('[data-testid="password-input"]', testUsers[0].password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(new RegExp(dashboardUrl));
  });

  test('should display dashboard overview with key metrics', async ({ page }) => {
    // Check main dashboard elements
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Check overview metrics
    await expect(page.locator('[data-testid="total-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-api-calls"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-api-keys"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-plan"]')).toBeVisible();
    
    // Check recent activity section
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
  });

  test('should navigate between different sections', async ({ page }) => {
    // Test navigation to Projects
    await page.click('[data-testid="nav-projects"]');
    await expect(page).toHaveURL(new RegExp('/projects'));
    await expect(page.locator('[data-testid="projects-page"]')).toBeVisible();
    
    // Test navigation to API Keys
    await page.click('[data-testid="nav-api-keys"]');
    await expect(page).toHaveURL(new RegExp('/api-keys'));
    await expect(page.locator('[data-testid="api-keys-page"]')).toBeVisible();
    
    // Test navigation to Analytics
    await page.click('[data-testid="nav-analytics"]');
    await expect(page).toHaveURL(new RegExp('/analytics'));
    await expect(page.locator('[data-testid="analytics-page"]')).toBeVisible();
    
    // Test navigation to Settings
    await page.click('[data-testid="nav-settings"]');
    await expect(page).toHaveURL(new RegExp('/settings'));
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
    
    // Test navigation back to Dashboard
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page).toHaveURL(new RegExp('/dashboard$'));
  });

  test('should display user information correctly', async ({ page }) => {
    const testUser = testUsers[0];
    
    // Check user name in header
    await expect(page.locator('[data-testid="user-name"]')).toContainText(testUser.firstName);
    
    // Open user menu
    await page.click('[data-testid="user-menu"]');
    
    // Check user details in dropdown
    await expect(page.locator('[data-testid="user-email"]')).toContainText(testUser.email);
    await expect(page.locator('[data-testid="user-full-name"]')).toContainText(`${testUser.firstName} ${testUser.lastName}`);
  });

  test('should show correct subscription information', async ({ page }) => {
    // Check current plan display
    await expect(page.locator('[data-testid="current-plan"]')).toBeVisible();
    
    // Navigate to billing
    await page.click('[data-testid="nav-billing"]');
    
    // Check subscription details
    await expect(page.locator('[data-testid="subscription-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="billing-cycle"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-limits"]')).toBeVisible();
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-trigger"]')).toBeVisible();
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-trigger"]');
    await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible();
    
    // Test navigation on mobile
    await page.click('[data-testid="nav-projects"]');
    await expect(page).toHaveURL(new RegExp('/projects'));
    await expect(page.locator('[data-testid="mobile-sidebar"]')).not.toBeVisible(); // Should close after navigation
  });
});

test.describe('Projects Management', () => {
  const dashboardUrl = getAppUrl('dashboard');

  test.beforeEach(async ({ page }) => {
    // Login and navigate to projects
    await page.goto(getAppUrl('web-main'));
    await page.click('text=Sign In');
    await page.fill('[data-testid="email-input"]', testUsers[0].email);
    await page.fill('[data-testid="password-input"]', testUsers[0].password);
    await page.click('[data-testid="login-button"]');
    
    await page.click('[data-testid="nav-projects"]');
    await expect(page).toHaveURL(new RegExp('/projects'));
  });

  test('should display list of projects', async ({ page }) => {
    // Check projects list
    await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
    
    // Check if test projects are displayed
    const userProjects = testProjects.filter(p => p.ownerId === testUsers[0].id);
    for (const project of userProjects) {
      await expect(page.locator(`[data-testid="project-${project.id}"]`)).toBeVisible();
      await expect(page.locator(`text=${project.name}`)).toBeVisible();
    }
  });

  test('should allow creating a new project', async ({ page }) => {
    await page.click('[data-testid="create-project-button"]');
    
    // Fill project creation form
    const projectName = `Test Project ${Date.now()}`;
    await page.fill('[data-testid="project-name-input"]', projectName);
    await page.fill('[data-testid="project-description-input"]', 'A test project created via E2E testing');
    
    // Submit form
    await page.click('[data-testid="create-project-submit"]');
    
    // Check success notification
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    await expect(page.locator('text=Project created successfully')).toBeVisible();
    
    // Check if project appears in list
    await expect(page.locator(`text=${projectName}`)).toBeVisible();
  });

  test('should validate project creation form', async ({ page }) => {
    await page.click('[data-testid="create-project-button"]');
    
    // Try to submit empty form
    await page.click('[data-testid="create-project-submit"]');
    
    // Check validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('text=Project name is required')).toBeVisible();
    
    // Test name length validation
    await page.fill('[data-testid="project-name-input"]', 'ab'); // Too short
    await page.click('[data-testid="create-project-submit"]');
    await expect(page.locator('text=at least 3 characters')).toBeVisible();
  });

  test('should allow editing project details', async ({ page }) => {
    const testProject = testProjects.find(p => p.ownerId === testUsers[0].id);
    if (!testProject) throw new Error('No test project found for user');
    
    // Click edit button for first project
    await page.click(`[data-testid="edit-project-${testProject.id}"]`);
    
    // Update project details
    const updatedName = `Updated ${testProject.name}`;
    await page.fill('[data-testid="project-name-input"]', updatedName);
    await page.fill('[data-testid="project-description-input"]', 'Updated description');
    
    // Save changes
    await page.click('[data-testid="save-project-button"]');
    
    // Check success notification
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    await expect(page.locator('text=Project updated successfully')).toBeVisible();
    
    // Check updated name appears in list
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();
  });

  test('should allow deleting a project', async ({ page }) => {
    const testProject = testProjects.find(p => p.ownerId === testUsers[0].id);
    if (!testProject) throw new Error('No test project found for user');
    
    // Click delete button
    await page.click(`[data-testid="delete-project-${testProject.id}"]`);
    
    // Confirm deletion in modal
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible();
    await page.fill('[data-testid="delete-confirmation-input"]', testProject.name);
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Check success notification
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    await expect(page.locator('text=Project deleted successfully')).toBeVisible();
    
    // Check project is removed from list
    await expect(page.locator(`[data-testid="project-${testProject.id}"]`)).not.toBeVisible();
  });

  test('should show project analytics', async ({ page }) => {
    const testProject = testProjects.find(p => p.ownerId === testUsers[0].id);
    if (!testProject) throw new Error('No test project found for user');
    
    // Click on project to view details
    await page.click(`[data-testid="project-${testProject.id}"]`);
    
    // Check project details page
    await expect(page).toHaveURL(new RegExp(`/projects/${testProject.id}`));
    await expect(page.locator('[data-testid="project-header"]')).toBeVisible();
    await expect(page.locator(`text=${testProject.name}`)).toBeVisible();
    
    // Check analytics sections
    await expect(page.locator('[data-testid="usage-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="api-calls-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-rate-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="response-time-chart"]')).toBeVisible();
  });
});

test.describe('API Keys Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to API keys
    await page.goto(getAppUrl('web-main'));
    await page.click('text=Sign In');
    await page.fill('[data-testid="email-input"]', testUsers[0].email);
    await page.fill('[data-testid="password-input"]', testUsers[0].password);
    await page.click('[data-testid="login-button"]');
    
    await page.click('[data-testid="nav-api-keys"]');
    await expect(page).toHaveURL(new RegExp('/api-keys'));
  });

  test('should display list of API keys', async ({ page }) => {
    await expect(page.locator('[data-testid="api-keys-list"]')).toBeVisible();
    
    // Check if test API keys are displayed
    const userProjects = testProjects.filter(p => p.ownerId === testUsers[0].id);
    const userApiKeys = testApiKeys.filter(key => 
      userProjects.some(p => p.id === key.projectId)
    );
    
    for (const apiKey of userApiKeys) {
      await expect(page.locator(`[data-testid="api-key-${apiKey.id}"]`)).toBeVisible();
      await expect(page.locator(`text=${apiKey.name}`)).toBeVisible();
    }
  });

  test('should allow creating a new API key', async ({ page }) => {
    await page.click('[data-testid="create-api-key-button"]');
    
    // Fill API key creation form
    const keyName = `Test API Key ${Date.now()}`;
    await page.fill('[data-testid="api-key-name-input"]', keyName);
    await page.selectOption('[data-testid="project-select"]', testProjects[0].id);
    
    // Set permissions
    await page.check('[data-testid="permission-read"]');
    await page.check('[data-testid="permission-write"]');
    
    // Submit form
    await page.click('[data-testid="create-api-key-submit"]');
    
    // Check success notification and API key display
    await expect(page.locator('[data-testid="api-key-created-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-api-key"]')).toBeVisible();
    
    // Copy API key (important for user)
    await page.click('[data-testid="copy-api-key"]');
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible();
    
    // Close modal
    await page.click('[data-testid="close-api-key-modal"]');
    
    // Check if API key appears in list
    await expect(page.locator(`text=${keyName}`)).toBeVisible();
  });

  test('should allow revoking an API key', async ({ page }) => {
    const userApiKey = testApiKeys.find(key => 
      testProjects.some(p => p.id === key.projectId && p.ownerId === testUsers[0].id)
    );
    if (!userApiKey) throw new Error('No test API key found for user');
    
    // Click revoke button
    await page.click(`[data-testid="revoke-api-key-${userApiKey.id}"]`);
    
    // Confirm revocation
    await expect(page.locator('[data-testid="revoke-confirmation-modal"]')).toBeVisible();
    await page.click('[data-testid="confirm-revoke-button"]');
    
    // Check success notification
    await expect(page.locator('[data-testid="success-notification"]')).toBeVisible();
    await expect(page.locator('text=API key revoked successfully')).toBeVisible();
    
    // Check API key is marked as revoked
    await expect(page.locator(`[data-testid="api-key-${userApiKey.id}"] [data-testid="revoked-badge"]`)).toBeVisible();
  });

  test('should show API key usage statistics', async ({ page }) => {
    const userApiKey = testApiKeys.find(key => 
      testProjects.some(p => p.id === key.projectId && p.ownerId === testUsers[0].id)
    );
    if (!userApiKey) throw new Error('No test API key found for user');
    
    // Click on API key to view details
    await page.click(`[data-testid="api-key-${userApiKey.id}"]`);
    
    // Check usage statistics
    await expect(page.locator('[data-testid="api-key-usage"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-requests"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-used"]')).toBeVisible();
    await expect(page.locator('[data-testid="usage-chart"]')).toBeVisible();
  });
});