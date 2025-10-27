# Integration Testing Suite

This directory contains comprehensive integration tests for the Zoptal platform, covering all microservices and their interactions.

## Test Structure

```
tests/integration/
├── config/                     # Test configuration and setup
├── fixtures/                   # Test data and mock responses
├── utils/                      # Test utilities and helpers
├── auth-service/              # Authentication service tests
├── project-service/           # Project service tests
├── ai-service/               # AI service tests
├── billing-service/          # Billing service tests
├── notification-service/     # Notification service tests
├── workflows/                # End-to-end workflow tests
├── performance/              # Performance integration tests
└── security/                 # Security integration tests
```

## Test Categories

### 1. Service-to-Service Integration Tests
- Authentication flow between services
- Data consistency across services
- Error propagation and handling
- Service dependencies and health checks

### 2. End-to-End Workflow Tests
- Complete user registration and onboarding
- Project creation and collaboration
- AI-powered code generation workflows
- Billing and subscription management
- Notification delivery chains

### 3. Data Integrity Tests
- Cross-service data consistency
- Transaction rollback scenarios
- Concurrent operation handling
- Database synchronization

### 4. API Contract Tests
- OpenAPI specification compliance
- Request/response schema validation
- Error response consistency
- Rate limiting behavior

## Running Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific service tests
npm run test:integration auth-service
npm run test:integration workflows

# Run tests with coverage
npm run test:integration:coverage

# Run tests in watch mode
npm run test:integration:watch
```

## Test Environment

Integration tests run against:
- Dockerized services with test databases
- Mock external services (Stripe, SendGrid, etc.)
- Isolated test data that's cleaned up after each test
- Real service-to-service communication

## Configuration

Tests use environment-specific configuration:
- `test.env` - Test environment variables
- `docker-compose.test.yml` - Test service orchestration
- `jest.integration.config.js` - Jest configuration for integration tests