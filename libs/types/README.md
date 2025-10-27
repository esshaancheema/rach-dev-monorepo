# @zoptal/types

Shared TypeScript types and interfaces for the Zoptal platform.

## Features

- **Common types**: Base types like ID, Timestamp, pagination, responses
- **User types**: User, authentication, and profile related types
- **API types**: HTTP methods, endpoints, responses, and error types
- **Database types**: Entity interfaces, query filters, and transaction types

## Installation

```bash
npm install @zoptal/types
```

## Usage

```typescript
import { User, ApiResponse, PaginatedResponse, BaseEntity } from '@zoptal/types';

// User types
interface UserService {
  getUser(id: string): Promise<ApiResponse<User>>;
  getUsers(params: PaginationParams): Promise<PaginatedResponse<User>>;
}

// Database entity
interface Product extends BaseEntity {
  name: string;
  price: number;
}
```

## Development

```bash
# Build
npm run build

# Development mode
npm run dev

# Lint
npm run lint

# Type check
npm run type-check
```