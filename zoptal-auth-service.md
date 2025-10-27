# CLAUDE.md - Zoptal Authentication Service

## Project Overview
The Authentication Service is a critical microservice in the Zoptal platform that handles all authentication, authorization, and user session management for 50,000+ concurrent users. This service must be highly secure, scalable, and integrate with multiple authentication providers.

## Technical Stack
- **Framework**: Fastify (High-performance Node.js framework)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM from @zoptal/database)
- **Cache**: Redis (for sessions and rate limiting)
- **Authentication**: JWT + Refresh Tokens
- **Email Service**: SendGrid
- **SMS Service**: Twilio
- **Password Hashing**: Argon2
- **Validation**: Zod
- **Rate Limiting**: Custom Redis-based implementation
- **2FA**: Speakeasy (TOTP)

## Project Structure

```
services/auth-service/
├── src/
│   ├── index.ts                 # Service entry point
│   ├── app.ts                   # Fastify app configuration
│   ├── config/
│   │   ├── index.ts            # Configuration management
│   │   └── constants.ts        # Service constants
│   ├── routes/
│   │   ├── auth.routes.ts      # Authentication routes
│   │   ├── user.routes.ts      # User management routes
│   │   ├── oauth.routes.ts     # OAuth provider routes
│   │   └── admin.routes.ts     # Admin-only routes
│   ├── controllers/
│   │   ├── auth.controller.ts  # Auth logic
│   │   ├── user.controller.ts  # User management
│   │   ├── oauth.controller.ts # OAuth handling
│   │   └── admin.controller.ts # Admin operations
│   ├── services/
│   │   ├── auth.service.ts     # Core auth business logic
│   │   ├── token.service.ts    # JWT management
│   │   ├── email.service.ts    # Email notifications
│   │   ├── sms.service.ts      # SMS notifications
│   │   ├── otp.service.ts      # OTP generation/validation
│   │   └── session.service.ts  # Session management
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT validation
│   │   ├── rate-limit.ts       # Rate limiting
│   │   ├── validate.ts         # Request validation
│   │   └── error-handler.ts    # Global error handling
│   ├── utils/
│   │   ├── password.ts         # Password utilities
│   │   ├── redis.ts           # Redis client
│   │   ├── logger.ts          # Winston logger
│   │   └── crypto.ts          # Crypto utilities
│   ├── schemas/
│   │   ├── auth.schema.ts     # Zod schemas for auth
│   │   ├── user.schema.ts     # User validation schemas
│   │   └── common.schema.ts   # Shared schemas
│   └── types/
│       ├── auth.types.ts      # Auth-related types
│       └── fastify.d.ts       # Fastify type extensions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
├── tsconfig.json
├── .env.example
├── Dockerfile
└── README.md
```

## Implementation Details

### 1. Package.json Configuration

```json
{
  "name": "@zoptal/auth-service",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:e2e": "vitest run --config vitest.e2e.config.ts",
    "lint": "eslint . --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@fastify/cors": "^9.0.0",
    "@fastify/helmet": "^11.1.0",
    "@fastify/jwt": "^8.0.0",
    "@fastify/rate-limit": "^9.1.0",
    "@zoptal/database": "workspace:*",
    "argon2": "^0.31.2",
    "fastify": "^4.25.0",
    "ioredis": "^5.3.2",
    "nanoid": "^5.0.4",
    "pino": "^8.17.0",
    "speakeasy": "^2.0.0",
    "zod": "^3.22.0",
    "@sendgrid/mail": "^8.1.0",
    "twilio": "^4.20.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/speakeasy": "^2.0.10",
    "@zoptal/eslint-config": "workspace:*",
    "@zoptal/tsconfig": "workspace:*",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0",
    "vitest": "^1.2.0"
  }
}
```

### 2. Environment Variables (.env.example)

```env
# Server
PORT=4001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://zoptal:password@localhost:5432/zoptal_auth"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"
JWT_ACCESS_TOKEN_EXPIRY="15m"
JWT_REFRESH_TOKEN_EXPIRY="7d"

# Email (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
EMAIL_FROM="noreply@zoptal.com"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# URLs
FRONTEND_URL="http://localhost:3000"
API_URL="http://localhost:4000"

# Rate Limiting
RATE_LIMIT_WINDOW="15m"
RATE_LIMIT_MAX_REQUESTS="100"

# Security
BCRYPT_ROUNDS="10"
OTP_SECRET="your-otp-secret"
```

### 3. Core Implementation Files

#### src/index.ts (Entry Point)
```typescript
import { buildApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const start = async () => {
  try {
    const app = await buildApp();
    
    await app.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });
    
    logger.info(`Auth service running on port ${config.PORT}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
```

#### src/app.ts (Fastify Configuration)
```typescript
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@zoptal/database';
import { Redis } from 'ioredis';

import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { oauthRoutes } from './routes/oauth.routes';
import { adminRoutes } from './routes/admin.routes';
import { errorHandler } from './middleware/error-handler';
import { config } from './config';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true,
  });

  // Initialize database
  const prisma = new PrismaClient();
  await prisma.$connect();
  app.decorate('prisma', prisma);

  // Initialize Redis
  const redis = new Redis(config.REDIS_URL);
  app.decorate('redis', redis);

  // Register plugins
  await app.register(helmet);
  await app.register(cors, {
    origin: config.FRONTEND_URL,
    credentials: true,
  });
  await app.register(jwt, {
    secret: config.JWT_SECRET,
  });

  // Register routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(oauthRoutes, { prefix: '/api/oauth' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  // Error handler
  app.setErrorHandler(errorHandler);

  // Graceful shutdown
  app.addHook('onClose', async () => {
    await prisma.$disconnect();
    redis.disconnect();
  });

  return app;
}
```

### 4. Key Features to Implement

#### A. Registration Flow
1. Email/Phone validation
2. Password strength requirements
3. Email verification with OTP
4. Phone verification with SMS OTP
5. Welcome email
6. Auto-login after registration

#### B. Login Flow
1. Email/Phone + Password login
2. OAuth login (Google, GitHub, etc.)
3. 2FA support (TOTP)
4. Device fingerprinting
5. Login attempt tracking
6. Account lockout after failed attempts

#### C. Session Management
1. JWT access tokens (15 min)
2. Refresh tokens (7 days)
3. Redis session storage
4. Multi-device support
5. Session invalidation
6. Activity tracking

#### D. Password Management
1. Forgot password flow
2. Reset password with token
3. Password change (requires current password)
4. Password history (prevent reuse)
5. Force password reset

#### E. User Profile Management
1. Update profile information
2. Email/Phone change with verification
3. Language preference
4. Timezone settings
5. Account deletion (soft delete)

#### F. Admin Features
1. User search and filtering
2. User suspension/activation
3. Force logout
4. Password reset for users
5. Activity logs viewing
6. Bulk operations

### 5. API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/verify-email
POST   /api/auth/verify-phone
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password
GET    /api/auth/me
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/verify
POST   /api/auth/2fa/disable
```

#### OAuth Endpoints
```
GET    /api/oauth/google
GET    /api/oauth/google/callback
GET    /api/oauth/github
GET    /api/oauth/github/callback
```

#### User Management Endpoints
```
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/email
PUT    /api/users/:id/phone
GET    /api/users/:id/sessions
DELETE /api/users/:id/sessions/:sessionId
```

#### Admin Endpoints
```
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id/status
POST   /api/admin/users/:id/force-logout
GET    /api/admin/users/:id/activity
POST   /api/admin/users/bulk-action
```

### 6. Security Measures

1. **Password Security**
   - Argon2 hashing
   - Minimum 8 characters
   - Complexity requirements
   - No common passwords

2. **Rate Limiting**
   - Login: 5 attempts per 15 minutes
   - Registration: 3 per hour per IP
   - Password reset: 3 per hour
   - API calls: 100 per 15 minutes

3. **Token Security**
   - Short-lived access tokens
   - Secure httpOnly cookies for refresh tokens
   - Token rotation on refresh
   - Blacklist for revoked tokens

4. **Input Validation**
   - Zod schemas for all inputs
   - SQL injection prevention (Prisma)
   - XSS prevention
   - CSRF protection

5. **Monitoring & Logging**
   - Failed login attempts
   - Suspicious activities
   - Rate limit violations
   - Error tracking

### 7. Scalability Considerations

1. **Database Optimization**
   - Indexed fields (email, phone, userId)
   - Read replicas for queries
   - Connection pooling

2. **Caching Strategy**
   - Redis for sessions
   - Cache user permissions
   - Cache frequently accessed data

3. **Horizontal Scaling**
   - Stateless design
   - Load balancer ready
   - Shared Redis cluster

4. **Performance Targets**
   - Login: < 200ms
   - Token validation: < 50ms
   - Registration: < 500ms

### 8. Integration Points

1. **Email Service (SendGrid)**
   - Welcome emails
   - Verification emails
   - Password reset emails
   - Security alerts

2. **SMS Service (Twilio)**
   - Phone verification
   - 2FA codes
   - Security alerts

3. **Other Microservices**
   - User service for profile data
   - Notification service for alerts
   - Analytics service for tracking

### 9. Testing Strategy

1. **Unit Tests**
   - Service methods
   - Utility functions
   - Middleware logic

2. **Integration Tests**
   - Database operations
   - Redis operations
   - External service mocks

3. **E2E Tests**
   - Complete auth flows
   - Error scenarios
   - Rate limiting

### 10. Deployment Configuration

#### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 4001
CMD ["node", "dist/index.js"]
```

### 11. Development Workflow

1. **Local Development**
   ```bash
   cd services/auth-service
   pnpm install
   cp .env.example .env
   # Update .env with local values
   pnpm dev
   ```

2. **Testing**
   ```bash
   pnpm test          # Unit tests
   pnpm test:e2e      # E2E tests
   ```

3. **Building**
   ```bash
   pnpm build
   pnpm start         # Production mode
   ```

### 12. Monitoring & Observability

1. **Health Checks**
   - GET /health - Basic health
   - GET /ready - Readiness probe

2. **Metrics**
   - Login success/failure rates
   - Token generation time
   - Database query time
   - Redis operation time

3. **Logging**
   - Structured JSON logs
   - Request/Response logging
   - Error tracking
   - Security event logging

## Next Steps

1. Implement core authentication logic
2. Set up database migrations
3. Create comprehensive test suite
4. Document API with OpenAPI/Swagger
5. Set up CI/CD pipeline
6. Performance testing with k6
7. Security audit

## Dependencies on Other Services

- **Database Service**: Requires @zoptal/database package
- **UI Components**: Will provide components to @zoptal/ui
- **Configuration**: Uses @zoptal/config for shared constants
- **Frontend Apps**: All apps will integrate with this service

## Success Criteria

- Handle 50,000 concurrent users
- 99.9% uptime
- < 200ms response time for auth operations
- Zero security vulnerabilities
- 90%+ test coverage
