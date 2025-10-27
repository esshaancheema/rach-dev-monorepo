# Zoptal Authentication Service

A robust, production-ready authentication microservice built with Fastify, TypeScript, and modern security practices.

## Features

### Core Authentication
- ✅ User registration and email verification
- ✅ Secure login with JWT tokens
- ✅ Password reset functionality
- ✅ Token refresh mechanism
- ✅ Session management with device tracking
- ✅ Account lockout protection
- ✅ Password history tracking
- ✅ Force password reset capability

### Advanced Security
- ✅ Two-factor authentication (TOTP) with backup codes
- ✅ Advanced rate limiting with IP blocking
- ✅ Device fingerprinting and trust management
- ✅ Input validation and sanitization
- ✅ Password strength enforcement with Argon2
- ✅ Secure headers and CORS protection
- ✅ Request/response logging with audit trails

### OAuth Integration
- ✅ Google OAuth 2.0
- ✅ GitHub OAuth
- ✅ Account linking/unlinking
- ✅ Social login flows with email verification

### User Management
- ✅ Profile management with preferences
- ✅ Soft delete with grace period
- ✅ Activity tracking and analytics
- ✅ Account restoration capabilities
- ✅ User notification preferences

### Admin Features
- ✅ Advanced user administration
- ✅ Comprehensive audit logging
- ✅ Security event monitoring
- ✅ System analytics and metrics
- ✅ Bulk user operations
- ✅ Force password reset management
- ✅ Device management and blocking
- ✅ Data export capabilities (GDPR compliant)

### Performance & Monitoring
- ✅ Database connection pooling
- ✅ Real-time metrics collection
- ✅ Health checks with detailed diagnostics
- ✅ Slow query monitoring
- ✅ Performance analytics

## Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache/Sessions**: Redis
- **Validation**: Zod
- **Authentication**: JWT
- **Password Hashing**: Argon2
- **Email**: SendGrid
- **SMS**: Twilio
- **Container**: Docker
- **Testing**: Vitest

## Project Structure

```
src/
├── config/           # Configuration and constants
│   ├── index.ts      # Environment configuration
│   └── constants.ts  # Application constants
├── controllers/      # Request handlers
│   └── auth.controller.ts
├── middleware/       # Custom middleware
│   ├── auth.ts       # Authentication middleware
│   ├── error-handler.ts
│   ├── rate-limit.ts # Advanced rate limiting
│   ├── request-logger.ts
│   ├── validate.ts
│   └── force-password-reset.ts
├── routes/           # API routes
│   ├── auth.routes.ts    # Authentication endpoints
│   ├── user.routes.ts    # User management
│   ├── oauth.routes.ts   # OAuth providers
│   ├── admin.routes.ts   # Admin operations
│   ├── twofa.routes.ts   # Two-factor auth
│   └── metrics.routes.ts # System metrics
├── schemas/          # Zod validation schemas
│   ├── common.schema.ts
│   ├── auth.schema.ts
│   ├── user.schema.ts
│   └── admin.schema.ts
├── services/         # Business logic services
│   ├── auth.service.ts
│   ├── admin.service.ts
│   ├── token.service.ts
│   ├── email.service.ts
│   ├── sms.service.ts
│   ├── metrics.service.ts
│   ├── password-history.service.ts
│   ├── device-fingerprint.service.ts
│   ├── soft-delete.service.ts
│   ├── force-password-reset.service.ts
│   ├── session.service.ts
│   ├── activity.service.ts
│   ├── twofa.service.ts
│   └── oauth.service.ts
├── utils/            # Utility functions
│   ├── database.ts   # Connection pooling
│   ├── redis.ts      # Cache management
│   ├── password.ts   # Password utilities
│   ├── crypto.ts     # Cryptographic functions
│   ├── logger.ts     # Structured logging
│   └── device-parser.ts
├── plugins/          # Fastify plugins
├── app.ts           # Fastify app setup
└── index.ts         # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 12+
- Redis 6+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   cd services/auth-service
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start dependencies with Docker**
   ```bash
   docker-compose up postgres redis -d
   ```

5. **Run database migrations**
   ```bash
   # Database setup commands would go here
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

The service will be available at `http://localhost:4001`

### Docker Development

Start the entire stack with Docker:

```bash
# Basic setup
docker-compose up

# With admin tools (pgAdmin, Redis Insight)
docker-compose --profile tools up
```

## API Documentation

Base URL: `http://localhost:4001/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

# Response
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": false,
      "status": "pending"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresAt": 1234567890
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "deviceId": "optional-device-id",
  "rememberMe": false
}

# Response
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresAt": 1234567890,
    "requiresTwoFactor": false
  }
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "email-verification-token"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "password-reset-token",
  "newPassword": "NewSecurePass123!"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "allDevices": false  // Optional: logout from all devices
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer your-access-token
```

### Two-Factor Authentication

#### Setup 2FA
```http
POST /api/2fa/setup
Authorization: Bearer your-access-token

# Response
{
  "success": true,
  "data": {
    "secret": "base32-secret",
    "qrCode": "data:image/png;base64,...",
    "backupCodes": ["code1", "code2", ...]
  }
}
```

#### Enable 2FA
```http
POST /api/2fa/enable
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "verificationCode": "123456"
}
```

#### Disable 2FA
```http
POST /api/2fa/disable
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "verificationCode": "123456"
}
```

#### Verify 2FA During Login
```http
POST /api/2fa/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "rememberDevice": false
}
```

### OAuth Endpoints

#### Google OAuth Initiation
```http
GET /api/oauth/google
```

#### Google OAuth Callback
```http
GET /api/oauth/google/callback?code=auth_code&state=optional_state
```

#### GitHub OAuth Initiation
```http
GET /api/oauth/github
```

#### GitHub OAuth Callback
```http
GET /api/oauth/github/callback?code=auth_code&state=optional_state
```

#### Link OAuth Account
```http
POST /api/oauth/link
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "provider": "google",
  "code": "authorization-code"
}
```

#### Unlink OAuth Account
```http
POST /api/oauth/unlink
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "provider": "google",
  "password": "your-password"
}
```

### User Management

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer your-access-token
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### Get User Preferences
```http
GET /api/users/preferences
Authorization: Bearer your-access-token
```

#### Update User Preferences
```http
PUT /api/users/preferences
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "language": "en",
  "timezone": "UTC",
  "emailNotifications": {
    "marketing": false,
    "security": true,
    "updates": true
  }
}
```

#### Get User Activity
```http
GET /api/users/activity?page=1&limit=10&action=login
Authorization: Bearer your-access-token
```

#### Soft Delete Account
```http
DELETE /api/users/account
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "password": "your-password",
  "reason": "privacy_concerns",
  "customReason": "Optional custom reason"
}
```

#### Restore Account
```http
POST /api/users/restore
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "restoration-token"
}
```

#### Check Deletion Status
```http
GET /api/users/deletion-status/user@example.com
```

#### Check Force Reset Status
```http
GET /api/users/force-reset-status
Authorization: Bearer your-access-token
```

### Admin Endpoints (Require Admin Role)

#### Dashboard Statistics
```http
GET /api/admin/dashboard/stats
Authorization: Bearer admin-access-token

# Response
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "activeUsers": 800,
    "newUsersToday": 25,
    "securityEvents": 12
  }
}
```

#### Search Users
```http
GET /api/admin/users/search?page=1&limit=10&status=active&role=user
Authorization: Bearer admin-access-token
```

#### Update User Status
```http
PUT /api/admin/users/{userId}/status
Authorization: Bearer admin-access-token
Content-Type: application/json

{
  "status": "suspended",
  "reason": "Violation of terms"
}
```

#### Force User Logout
```http
POST /api/admin/users/{userId}/force-logout
Authorization: Bearer admin-access-token
```

#### Force Password Reset
```http
POST /api/admin/users/{userId}/force-password-reset
Authorization: Bearer admin-access-token
Content-Type: application/json

{
  "reason": "Security breach detected"
}
```

#### Clear Force Password Reset
```http
DELETE /api/admin/users/{userId}/force-password-reset
Authorization: Bearer admin-access-token
```

#### Bulk Force Password Reset
```http
POST /api/admin/users/bulk-force-password-reset
Authorization: Bearer admin-access-token
Content-Type: application/json

{
  "userIds": ["uuid1", "uuid2"],
  "reason": "Security policy update"
}
```

#### Get Audit Logs
```http
GET /api/admin/audit/logs?page=1&limit=50&action=login&userId=uuid
Authorization: Bearer admin-access-token
```

#### Get Security Events
```http
GET /api/admin/security/events?severity=high&type=failed_login
Authorization: Bearer admin-access-token
```

#### User Device Management
```http
GET /api/admin/users/{userId}/devices
Authorization: Bearer admin-access-token
```

#### Block Device
```http
POST /api/admin/devices/{deviceId}/block
Authorization: Bearer admin-access-token
Content-Type: application/json

{
  "reason": "Suspicious activity detected"
}
```

### System Endpoints

#### Health Check
```http
GET /health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1234567,
  "version": "1.0.0"
}
```

#### Readiness Check
```http
GET /ready

# Response
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy"
  },
  "connectionPool": {
    "poolSize": 10,
    "activeConnections": 3,
    "totalQueries": 1250,
    "averageQueryTime": 45.2,
    "slowQueries": 2
  }
}
```

#### System Metrics
```http
GET /metrics

# Response
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1234567,
  "memory": {
    "rss": 67108864,
    "heapUsed": 45088768,
    "heapTotal": 54525952
  },
  "realtime": {
    "activeUsers": 150,
    "requestsPerMinute": 425
  }
}
```

### Metrics Endpoints

#### Get Real-time Metrics
```http
GET /api/metrics/realtime
Authorization: Bearer your-access-token
```

#### Get Historical Metrics
```http
GET /api/metrics/historical?period=24h&metric=login_attempts
Authorization: Bearer your-access-token
```

## Environment Variables

### Core Configuration
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 4001 |
| `NODE_ENV` | Environment (development/production/test) | No | development |
| `HOST` | Server host | No | 0.0.0.0 |
| `TRUST_PROXY` | Trust proxy headers | No | true |

### Database Configuration
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `DB_POOL_SIZE` | Connection pool size (1-100) | No | 10 |
| `DB_CONNECTION_LIMIT` | Max connections (1-200) | No | 20 |
| `DB_POOL_TIMEOUT` | Pool timeout (ms) | No | 5000 |
| `DB_STATEMENT_TIMEOUT` | Statement timeout (ms) | No | 30000 |
| `DB_QUERY_TIMEOUT` | Query timeout (ms) | No | 60000 |
| `DB_TRANSACTION_TIMEOUT` | Transaction timeout (ms) | No | 120000 |
| `DB_CONNECT_TIMEOUT` | Connection timeout (ms) | No | 10000 |
| `DB_IDLE_TIMEOUT` | Idle timeout (ms) | No | 600000 |
| `DB_ENABLE_LOGGING` | Enable database logging | No | false |
| `DB_LOG_SLOW_QUERIES` | Log slow queries | No | true |
| `DB_SLOW_QUERY_THRESHOLD` | Slow query threshold (ms) | No | 1000 |

### Redis Configuration
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REDIS_URL` | Redis connection string | No | redis://localhost:6379 |
| `REDIS_MAX_RETRIES` | Max retry attempts | No | 3 |
| `REDIS_RETRY_DELAY_MS` | Retry delay | No | 1000 |

### JWT Configuration
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes | - |
| `JWT_REFRESH_SECRET` | JWT refresh secret (min 32 chars) | Yes | - |
| `JWT_ACCESS_TOKEN_EXPIRY` | Access token expiry | No | 15m |
| `JWT_REFRESH_TOKEN_EXPIRY` | Refresh token expiry | No | 7d |
| `JWT_ALGORITHM` | JWT algorithm | No | HS256 |

### External Services
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SENDGRID_API_KEY` | SendGrid API key | Yes | - |
| `EMAIL_FROM` | From email address | No | noreply@zoptal.com |
| `EMAIL_REPLY_TO` | Reply-to email address | No | - |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Yes | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Yes | - |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Yes | - |

### OAuth Providers
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No | - |

### Application URLs
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `FRONTEND_URL` | Frontend application URL | No | http://localhost:3000 |
| `API_URL` | API base URL | No | http://localhost:4001 |
| `CORS_ORIGIN` | CORS allowed origins | No | http://localhost:3000 |

### Rate Limiting
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `RATE_LIMIT_WINDOW` | Global rate limit window | No | 15m |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |
| `RATE_LIMIT_LOGIN_MAX` | Max login attempts | No | 5 |
| `RATE_LIMIT_LOGIN_WINDOW` | Login attempt window | No | 15m |
| `RATE_LIMIT_REGISTER_MAX` | Max registration attempts | No | 3 |
| `RATE_LIMIT_REGISTER_WINDOW` | Registration window | No | 1h |

### Security Configuration
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BCRYPT_ROUNDS` | Password hashing rounds | No | 12 |
| `OTP_SECRET` | OTP generation secret (min 32 chars) | Yes | - |
| `OTP_EXPIRY_MINUTES` | OTP expiry time | No | 10 |
| `PASSWORD_MIN_LENGTH` | Minimum password length | No | 8 |
| `MAX_LOGIN_ATTEMPTS` | Max failed login attempts | No | 5 |
| `ACCOUNT_LOCKOUT_DURATION` | Account lockout duration | No | 15m |
| `PASSWORD_RESET_EXPIRY` | Password reset expiry | No | 1h |
| `EMAIL_VERIFICATION_EXPIRY` | Email verification expiry | No | 24h |

### Session Configuration
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SESSION_SECRET` | Session encryption secret | No | - |
| `SESSION_MAX_AGE_MS` | Session max age | No | 86400000 |
| `MAX_CONCURRENT_SESSIONS` | Max sessions per user | No | 5 |

### Logging & Monitoring
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `LOG_LEVEL` | Logging level | No | info |
| `ENABLE_REQUEST_LOGGING` | Enable request logging | No | true |
| `SENTRY_DSN` | Sentry error tracking DSN | No | - |
| `HEALTH_CHECK_ENDPOINT` | Health check endpoint | No | /health |

### Feature Flags
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ENABLE_2FA` | Enable two-factor authentication | No | true |
| `ENABLE_OAUTH` | Enable OAuth providers | No | true |
| `ENABLE_EMAIL_VERIFICATION` | Require email verification | No | true |
| `ENABLE_PHONE_VERIFICATION` | Enable phone verification | No | true |

## Security Features

### Password Security
- **Argon2 hashing** with configurable rounds (default: 12)
- **Password complexity requirements** with customizable minimum length
- **Password history tracking** to prevent reuse of recent passwords
- **Secure password reset tokens** with configurable expiry
- **Force password reset** capability for security incidents
- **Password age monitoring** with automated warnings

### Token Security
- **Short-lived access tokens** (default: 15 minutes)
- **Refresh token rotation** with secure storage
- **Token blacklisting** for immediate revocation
- **Device-specific sessions** with fingerprinting
- **JWT algorithm validation** with strong secrets
- **Session timeout management** with configurable limits

### Rate Limiting & DDoS Protection
- **Multi-level rate limiting** (global, endpoint-specific, user-specific)
- **Progressive delays** for failed authentication attempts
- **IP-based blocking** with automatic and manual controls
- **Login attempt tracking** with account lockout protection
- **Dynamic rate limiting** based on user behavior
- **Redis-backed rate limiting** for distributed systems

### Data Protection & Validation
- **Comprehensive input validation** using Zod schemas
- **SQL injection prevention** through Prisma ORM
- **XSS protection** with secure headers
- **CSRF protection** with token validation
- **Request sanitization** at middleware level
- **Data encryption** for sensitive information

### Advanced Security Features
- **Device fingerprinting** for login anomaly detection
- **Two-factor authentication** with TOTP and backup codes
- **OAuth security** with state validation and PKCE
- **Audit logging** for all security events
- **Real-time monitoring** of suspicious activities
- **Automatic account suspension** for security violations

## Testing

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run end-to-end tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage
```

## Production Deployment

### Docker Production Build

```bash
# Build production image
docker build --target production -t zoptal/auth-service:latest .

# Run production container
docker run -p 4001:4001 --env-file .env.production zoptal/auth-service:latest
```

### Health Checks

The service includes built-in health checks:

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1234567,
  "services": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

## Monitoring and Logging

### Structured Logging
- **JSON-formatted logs** in production with structured fields
- **Contextual logging** with request IDs and user context
- **Error tracking** with stack traces and user actions
- **Performance metrics** with response time tracking
- **Security event logging** with severity levels
- **Database query logging** with slow query detection

### Health Monitoring
- **Comprehensive health checks** at `/health` and `/ready`
- **Database connection pooling** metrics and monitoring
- **Redis connectivity** status and performance
- **Service dependency** health validation
- **Real-time performance** monitoring with alerts

### Key Metrics Collection
- **Authentication metrics**: Success/failure rates, login patterns
- **Security metrics**: Failed attempts, blocked IPs, suspicious activities
- **Performance metrics**: Response times, database query performance
- **User activity**: Session analytics, feature usage patterns
- **System metrics**: Memory usage, CPU utilization, connection pools
- **Business metrics**: User registration trends, feature adoption

### Audit & Compliance
- **Complete audit trails** for all user actions
- **Admin action logging** with full context and justification
- **Security event tracking** with threat classification
- **Data access logging** for GDPR compliance
- **Retention policies** for log data management
- **Export capabilities** for compliance reporting

### Alerting & Notifications
- **Real-time security alerts** for suspicious activities
- **Performance degradation** notifications
- **System health alerts** for service disruptions
- **Capacity planning** alerts for resource utilization
- **Error rate monitoring** with threshold-based alerts

## Development

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Conventional commits

### Adding New Features

1. **Create schemas** in `src/schemas/` using Zod validation
2. **Add middleware** if needed in `src/middleware/` (auth, validation, rate limiting)
3. **Implement services** in `src/services/` with proper error handling
4. **Create routes** in `src/routes/` with OpenAPI documentation
5. **Add comprehensive tests** in `tests/` (unit, integration, e2e)
6. **Update documentation** including README and API docs
7. **Add metrics collection** for monitoring new features
8. **Consider security implications** and add appropriate protections

### Performance Optimization

- **Database connection pooling** with configurable pool sizes
- **Redis caching** for frequently accessed data
- **Query optimization** with slow query monitoring
- **Rate limiting** to prevent abuse and ensure fair usage
- **Efficient pagination** for large data sets
- **Background job processing** for heavy operations
- **CDN integration** for static assets
- **Database indexing** for optimal query performance

### Deployment Considerations

- **Environment-specific configurations** with validation
- **Secret management** with proper encryption
- **Database migrations** with rollback capabilities
- **Health check endpoints** for load balancer integration
- **Graceful shutdown** handling for zero-downtime deploys
- **Monitoring integration** with external services
- **Log aggregation** for centralized monitoring
- **Backup strategies** for data protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is proprietary to Zoptal.

## Support

For issues and support, contact the development team or create an issue in the project repository.