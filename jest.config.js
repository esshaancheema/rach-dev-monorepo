const { createJestConfig } = require('./apps/web-main/jest.config.js');

// Root Jest config for VS Code extension compatibility
module.exports = {
  projects: [
    '<rootDir>/apps/web-main',
    // Add other apps with Jest configs here as needed
    // '<rootDir>/apps/dashboard',
  ],
  collectCoverageFrom: [
    'apps/**/*.{js,jsx,ts,tsx}',
    'packages/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  testMatch: [
    '<rootDir>/apps/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/apps/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/packages/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/packages/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/services/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/services/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};