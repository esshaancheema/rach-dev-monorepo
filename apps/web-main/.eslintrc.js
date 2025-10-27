module.exports = {
  root: true,
  extends: [
    'next',
    'next/core-web-vitals'
  ],
  env: {
    node: true,
    es6: true,
    browser: true
  },
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug', 'log', 'group', 'groupEnd'] }],
    'prefer-const': 'error',
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.next/',
    'build/',
    'diagnose.js',
    'public/sw.js',
    'public/**/*.js',
  ],
};