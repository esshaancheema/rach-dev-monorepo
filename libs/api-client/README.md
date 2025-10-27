# @zoptal/api-client

Type-safe API client library for communicating with Zoptal platform microservices.

## Features

- **HTTP Client**: Axios-based HTTP client with interceptors
- **Type Safety**: Full TypeScript support with shared types
- **Error Handling**: Comprehensive error handling with custom error classes
- **Authentication**: Built-in token management and refresh handling
- **Service Clients**: Create service-specific API clients

## Installation

```bash
npm install @zoptal/api-client
```

## Usage

```typescript
import { ApiClient } from '@zoptal/api-client';
import { User } from '@zoptal/types';

// Create API client
const client = ApiClient.create({
  baseURL: 'https://api.zoptal.com',
  timeout: 10000
}, {
  token: 'your-auth-token'
});

// Make requests
const response = await client.getHttpClient().get<User>('/users/123');
if (response.success) {
  console.log(response.data);
}

// Create service-specific client
const userService = client.createServiceClient('/users');
```

## Error Handling

```typescript
import { ApiClientError, AuthenticationError } from '@zoptal/api-client';

try {
  const response = await client.getHttpClient().get('/protected');
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle auth error
  } else if (error instanceof ApiClientError) {
    // Handle other API errors
  }
}
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