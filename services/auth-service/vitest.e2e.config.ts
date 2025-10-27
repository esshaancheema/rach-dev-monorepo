/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // E2E specific configuration
    globals: true,
    environment: 'node',
    
    // File patterns for E2E tests
    include: [
      'tests/e2e/**/*.{test,spec}.{js,ts}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'tests/unit/**/*',
      'tests/integration/**/*',
    ],
    
    // Longer timeouts for E2E tests
    testTimeout: 60000,
    hookTimeout: 30000,
    
    // No coverage for E2E tests (focus on integration)
    coverage: {
      enabled: false,
    },
    
    // Setup files
    setupFiles: ['./tests/e2e-setup.ts'],
    
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    
    // Reporters
    reporter: ['verbose', 'junit'],
    outputFile: {
      junit: './e2e-test-results.xml',
    },
    
    // Sequential execution for E2E tests to avoid conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    
    // No watch mode for E2E tests
    watch: false,
    
    // Retry configuration for flaky E2E tests
    retry: 2,
    
    // Environment variables for E2E testing
    env: {
      NODE_ENV: 'test',
      TEST_TYPE: 'e2e',
      PORT: '4002', // Different port for E2E tests
      JWT_SECRET: 'e2e-test-jwt-secret-key-for-testing-purposes-only',
      JWT_REFRESH_SECRET: 'e2e-test-refresh-secret-key-for-testing-purposes-only',
      DATABASE_URL: 'postgresql://test_user:test_password@localhost:5432/zoptal_auth_e2e_test',
      REDIS_URL: 'redis://localhost:6379/2',
      LOG_LEVEL: 'error',
      
      // External service testing (use test accounts/mocks)
      SENDGRID_API_KEY: 'SG.test-key-for-e2e-testing',
      EMAIL_FROM: 'test@zoptal-e2e.com',
      TWILIO_ACCOUNT_SID: 'test-twilio-sid',
      TWILIO_AUTH_TOKEN: 'test-twilio-token',
      TWILIO_PHONE_NUMBER: '+15551234567',
      
      // OAuth testing (use test apps)
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      GITHUB_CLIENT_ID: 'test-github-client-id',
      GITHUB_CLIENT_SECRET: 'test-github-client-secret',
      
      // URLs for E2E testing
      FRONTEND_URL: 'http://localhost:3001',
      API_URL: 'http://localhost:4002',
    },
    
    // Test filtering
    testNamePattern: undefined,
    
    // Bail on first failure for CI
    bail: process.env.CI ? 1 : 0,
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
  
  // Define configuration
  define: {
    __TEST__: true,
    __E2E_TEST__: true,
  },
});