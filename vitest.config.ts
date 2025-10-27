import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Global test settings
    globals: true,
    environment: 'node',
    
    // Test file patterns
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'services/*/tests/**/*.test.ts',
      'packages/*/tests/**/*.test.ts'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.next',
      'tests/e2e/**/*'
    ],
    
    // Setup files
    setupFiles: ['./tests/setup/vitest-setup.ts'],
    
    // Global setup and teardown
    globalSetup: ['./tests/setup/global-setup.ts'],
    
    // Test timeout
    testTimeout: 30000,
    
    // Hook timeout
    hookTimeout: 10000,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './test-results/coverage',
      include: [
        'services/*/src/**/*.ts',
        'packages/*/src/**/*.ts',
        'apps/*/src/**/*.ts'
      ],
      exclude: [
        'node_modules',
        'dist',
        'build',
        '.next',
        'tests',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/**',
        '**/*.d.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // Reporters
    reporter: [
      'default',
      'json',
      'html'
    ],
    
    // Output directory
    outputFile: {
      json: './test-results/vitest-results.json',
      html: './test-results/vitest-report.html'
    },
    
    // Pool options for parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4
      }
    },
    
    // Sequence options
    sequence: {
      concurrent: true,
      shuffle: false
    },
    
    // Watch options
    watch: false,
    
    // Environment variables
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres@localhost:5433/zoptal_test',
      REDIS_URL: 'redis://localhost:6380',
      JWT_SECRET: 'test-jwt-secret-key',
    }
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/tests': path.resolve(__dirname, './tests'),
      '@/services': path.resolve(__dirname, './services'),
      '@/packages': path.resolve(__dirname, './packages'),
      '@/apps': path.resolve(__dirname, './apps')
    }
  },
  
  // Esbuild options
  esbuild: {
    target: 'node16'
  }
});