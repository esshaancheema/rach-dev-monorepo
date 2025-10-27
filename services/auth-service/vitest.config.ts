/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Basic configuration
    globals: true,
    environment: 'node',
    
    // File patterns
    include: [
      'tests/unit/**/*.{test,spec}.{js,ts}',
      'tests/integration/**/*.{test,spec}.{js,ts}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'tests/e2e/**/*',
    ],
    
    // Test timeout
    testTimeout: 15000,
    hookTimeout: 15000,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts',
        'src/types/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    
    // Reporters
    reporter: ['verbose', 'junit'],
    outputFile: {
      junit: './test-results.xml',
    },
    
    // Test isolation
    isolate: true,
    pool: 'forks',
    
    // Watch mode configuration
    watch: false,
    
    // Database and external dependencies
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    
    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only',
      JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing-purposes-only',
      DATABASE_URL: 'postgresql://test_user:test_password@localhost:5432/zoptal_auth_test',
      REDIS_URL: 'redis://localhost:6379/1',
      LOG_LEVEL: 'error',
    },
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
  
  // Define configuration for different test types
  define: {
    __TEST__: true,
  },
});