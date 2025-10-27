# Zoptal Testing Infrastructure

This directory contains the comprehensive testing infrastructure for the Zoptal monorepo, including unit tests, integration tests, and end-to-end tests.

## 🧪 Testing Strategy

Our testing strategy follows the testing pyramid approach:

### **Unit Tests (Base Layer)**
- **Purpose**: Test individual functions and components in isolation
- **Coverage**: 70%+ code coverage target
- **Tools**: Vitest, Jest
- **Speed**: Very fast (< 1 second per test)
- **Scope**: Single functions, utility classes, React components

### **Integration Tests (Middle Layer)**
- **Purpose**: Test service interactions and API endpoints
- **Coverage**: All API endpoints and service integrations
- **Tools**: Vitest with Supertest
- **Speed**: Fast (< 5 seconds per test)
- **Scope**: Service-to-service communication, database operations

### **End-to-End Tests (Top Layer)**
- **Purpose**: Test complete user workflows
- **Coverage**: Critical user journeys
- **Tools**: Playwright
- **Speed**: Slower (30-60 seconds per test)
- **Scope**: Full application workflows across multiple services

## 📁 Directory Structure

```
tests/
├── setup/                      # Test setup and configuration
│   ├── global-setup.ts         # Global test setup/teardown
│   ├── test-database.ts        # Test database management
│   ├── test-services.ts        # Test service management
│   ├── test-data.ts            # Test data seeding
│   └── vitest-setup.ts         # Vitest configuration
├── unit/                       # Unit tests
│   ├── auth-utils.test.ts      # Authentication utilities
│   └── ...                     # More unit tests
├── integration/                # Integration tests
│   ├── auth-service.test.ts    # Auth service API tests
│   ├── api-flow.test.ts        # Cross-service integration
│   └── ...                     # More integration tests
├── e2e/                        # End-to-end tests
│   ├── auth.spec.ts            # Authentication flows
│   ├── dashboard.spec.ts       # Dashboard functionality
│   └── ...                     # More e2e tests
├── run-tests.sh               # Test runner script
└── README.md                  # This file
```

## 🚀 Quick Start

### **Run All Tests**
```bash
# Run complete test suite
./tests/run-tests.sh all

# Or using pnpm
pnpm test
```

### **Run Specific Test Types**
```bash
# Unit tests only
./tests/run-tests.sh unit

# Integration tests only
./tests/run-tests.sh integration

# E2E tests only
./tests/run-tests.sh e2e
```

### **Run Tests for Specific Services**
```bash
# All service tests
./tests/run-tests.sh services

# Specific service
./tests/run-tests.sh service auth-service
```

## 🛠️ Setup Requirements

### **Prerequisites**
- Node.js 18+
- pnpm package manager
- PostgreSQL 13+
- Redis 6+
- Chrome/Chromium (for E2E tests)

### **Installation**
```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install

# Setup test environment
./tests/run-tests.sh setup
```

## 📊 Test Configuration

### **Vitest Configuration (Unit & Integration)**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
});
```

### **Playwright Configuration (E2E)**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  }
});
```

## 🔧 Test Environment

### **Test Databases**
- **PostgreSQL**: `postgresql://postgres@localhost:5433/zoptal_test`
- **Redis**: `redis://localhost:6380`

### **Test Services**
- **Auth Service**: `http://localhost:4000`
- **Project Service**: `http://localhost:4001`
- **AI Service**: `http://localhost:4002`
- **Billing Service**: `http://localhost:4003`
- **Notification Service**: `http://localhost:4004`
- **Analytics Service**: `http://localhost:4005`

### **Test Apps**
- **Web Main**: `http://localhost:3000`
- **Dashboard**: `http://localhost:3001`
- **Admin**: `http://localhost:3002`
- **Developer Portal**: `http://localhost:3003`

## 📝 Writing Tests

### **Unit Tests Example**
```typescript
import { describe, test, expect } from 'vitest';
import { AuthUtils } from '../utils/auth';

describe('AuthUtils', () => {
  test('should hash password correctly', async () => {
    const password = 'testpassword123';
    const hash = await AuthUtils.hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
  });
});
```

### **Integration Tests Example**
```typescript
import { describe, test, expect } from 'vitest';
import request from 'supertest';
import { getServiceUrl } from '../setup/test-services';

describe('Auth Service', () => {
  test('should login with valid credentials', async () => {
    const response = await request(getServiceUrl('auth-service'))
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.tokens).toBeDefined();
  });
});
```

### **E2E Tests Example**
```typescript
import { test, expect } from '@playwright/test';

test('user can login and access dashboard', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign In');
  
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL(/dashboard/);
});
```

## 🎯 Test Data Management

### **Test Users**
```typescript
export const testUsers = [
  {
    email: 'john.doe@test.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    emailVerified: true
  }
  // ... more test users
];
```

### **Test Projects & API Keys**
- Pre-seeded test projects for each user
- Test API keys with different permissions
- Sample usage metrics and analytics data

## 🔍 Test Coverage

### **Coverage Targets**
- **Unit Tests**: 80%+ line coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: All critical user journeys

### **Coverage Reports**
```bash
# Generate coverage report
pnpm test:coverage

# View HTML coverage report
open test-results/coverage/index.html
```

## 🚨 Debugging Tests

### **Debug Unit Tests**
```bash
# Run tests in debug mode
pnpm vitest --inspect-brk

# Run specific test file
pnpm vitest auth-utils.test.ts
```

### **Debug Integration Tests**
```bash
# Run with verbose output
./tests/run-tests.sh integration --debug

# Check service logs
docker logs zoptal-auth-service-test
```

### **Debug E2E Tests**
```bash
# Run in headed mode
./tests/run-tests.sh e2e --headed

# Run with debug
npx playwright test --debug
```

## 📈 Performance Testing

### **Load Testing**
```typescript
test('should handle concurrent requests', async () => {
  const promises = Array(10).fill(null).map(() =>
    request(apiUrl).get('/endpoint')
  );
  
  const responses = await Promise.all(promises);
  responses.forEach(r => expect(r.status).toBe(200));
});
```

### **Performance Benchmarks**
- API response time < 200ms (95th percentile)
- Database queries < 100ms
- E2E test completion < 60s per test

## 🔄 Continuous Integration

### **GitHub Actions Integration**
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: ./tests/run-tests.sh all
```

### **Test Reports**
- JUnit XML for CI integration
- HTML reports for detailed analysis
- Coverage reports for code quality

## 🛡️ Security Testing

### **Security Test Cases**
- Authentication bypass attempts
- Authorization checks
- Input validation
- XSS/CSRF protection
- Rate limiting enforcement

### **Secrets Management**
- No hardcoded secrets in tests
- Test-specific API keys only
- Secure test data generation

## 📋 Best Practices

### **Test Organization**
1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Names**: Clear test descriptions
3. **Single Responsibility**: One assertion per test
4. **Test Isolation**: No dependencies between tests
5. **Mock External Services**: Avoid external API calls

### **Data Management**
1. **Fresh Data**: Clean database before each test suite
2. **Realistic Data**: Use production-like test data
3. **Data Factories**: Programmatic test data generation
4. **Cleanup**: Remove test data after tests

### **Performance**
1. **Parallel Execution**: Run tests concurrently
2. **Selective Testing**: Test only changed code in CI
3. **Caching**: Cache dependencies and builds
4. **Fast Feedback**: Prioritize fast-running tests

## 🚀 Advanced Features

### **Visual Regression Testing**
```typescript
// Playwright visual testing
test('visual regression test', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

### **API Contract Testing**
```typescript
// OpenAPI schema validation
test('should match OpenAPI schema', async () => {
  const response = await request(apiUrl).get('/users');
  expect(response.body).toMatchSchema(userListSchema);
});
```

### **Cross-Browser Testing**
- Chrome, Firefox, Safari, Edge
- Mobile device simulation
- Different viewport sizes

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)
- [Jest Testing Framework](https://jestjs.io/)

## 🤝 Contributing

1. **Write Tests First**: TDD approach encouraged
2. **Update Documentation**: Keep test docs current
3. **Review Coverage**: Ensure adequate test coverage
4. **Run Full Suite**: Test all changes before PR

## 📄 License

This testing infrastructure is part of the Zoptal project. See the main project LICENSE file for details.