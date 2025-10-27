# @zoptal/utils

Shared utility functions for the Zoptal platform.

## Features

- **Date utilities**: Date formatting, validation, and manipulation
- **String utilities**: Capitalization, case conversion, truncation, random generation
- **Validation utilities**: Email, password, URL validation with Zod schemas
- **Common utilities**: Debounce, throttle, deep clone, array operations

## Installation

```bash
npm install @zoptal/utils
```

## Usage

```typescript
import { formatDate, capitalize, isValidEmail, debounce } from '@zoptal/utils';

// Date utilities
const formatted = formatDate(new Date(), 'yyyy-MM-dd');

// String utilities
const title = capitalize('hello world');

// Validation
const valid = isValidEmail('user@zoptal.com');

// Common utilities
const debouncedFn = debounce(() => console.log('Called!'), 300);
```

## Development

```bash
# Build
npm run build

# Development mode
npm run dev

# Run tests
npm test

# Lint
npm run lint
```