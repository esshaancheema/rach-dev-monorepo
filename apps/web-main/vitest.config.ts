import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Include our actual test files
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
      'src/**/*.test.ts',
      'src/**/*.test.tsx'
    ],
    // Exclude e2e tests since they should run with Playwright
    exclude: [
      'node_modules',
      'dist',
      'build',
      '.next',
      'tests/e2e/**/*',
      'tests/e2e.test.ts', // Playwright test
      'tests/seo.test.ts', // Playwright test
      'tests/performance.test.ts' // Playwright test
    ],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})