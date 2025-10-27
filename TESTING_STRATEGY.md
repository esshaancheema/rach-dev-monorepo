# 🧪 Zoptal Testing Strategy: Jest vs Vitest

## 📋 **Quick Decision Guide**

| Test Type | Framework | Use When | Examples |
|-----------|-----------|----------|----------|
| **Unit Tests** | **Vitest** | Testing individual functions, components, utilities | `utils.test.ts`, React components, pure functions |
| **Integration Tests** | **Jest** | Testing API endpoints, service interactions, database operations | Cross-service communication, API flows |
| **Component Tests** | **Vitest** | Testing React/Vue components in isolation | Component rendering, props, events |
| **E2E Tests** | **Playwright** | Testing complete user workflows | Full application flows |

---

## 🎯 **When to Use Jest**

### ✅ **Perfect For:**
- **Integration Testing** - API endpoints, service-to-service communication
- **Database Testing** - Complex queries, transactions, migrations
- **Legacy Code** - Existing services already using Jest
- **Complex Mocking** - When you need Jest's mature mocking ecosystem
- **Testcontainers** - Docker-based testing environments

### 🔧 **Configuration:**
- **Location**: `/tests/integration/jest.config.js`
- **Setup**: `/tests/integration/package.json`
- **Test Pattern**: `**/*.test.ts` in `/tests/integration/`

### 📝 **Example:**
```typescript
// tests/integration/auth-service.test.ts
import request from 'supertest';
import { getServiceUrl } from '../setup/test-services';

describe('Auth Service API', () => {
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

---

## ⚡ **When to Use Vitest**

### ✅ **Perfect For:**
- **Unit Testing** - Fast, isolated tests for individual functions
- **Component Testing** - React/Vue component testing
- **Utility Testing** - Pure functions, helpers, formatters
- **New Development** - Modern projects preferring ES modules
- **Performance** - When test speed is critical

### 🔧 **Configuration:**
- **Root Level**: `/vitest.config.ts` (monorepo-wide)
- **App Level**: `/apps/*/vitest.config.ts` (app-specific)
- **Service Level**: `/services/*/vitest.config.ts` (service-specific)

### 📝 **Example:**
```typescript
// src/lib/utils.test.ts
import { describe, test, expect } from 'vitest';
import { formatCurrency, cn } from './utils';

describe('Utils', () => {
  test('should format currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  test('should merge className properly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
```

---

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                         │
├─────────────────────────────────────────────────────────────┤
│  E2E Tests (Playwright)     │ Complete user workflows      │
│  ↑ Slower, Complex          │ Full application testing     │
├─────────────────────────────────────────────────────────────┤
│  Integration Tests (Jest)   │ Service interactions         │
│  ↑ Medium Speed             │ API endpoints, databases     │
├─────────────────────────────────────────────────────────────┤
│  Unit Tests (Vitest)        │ Individual functions         │
│  ↑ Fast, Isolated           │ Components, utilities        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 **File Organization**

```
zoptal-monorepo/
├── apps/
│   └── web-main/
│       ├── vitest.config.ts          # App-specific unit tests
│       ├── jest.config.js            # VS Code compatibility
│       └── src/**/*.test.ts          # Vitest unit tests
├── services/
│   └── auth-service/
│       ├── vitest.config.ts          # Service unit tests
│       └── tests/**/*.test.ts        # Vitest unit tests
├── tests/
│   ├── integration/
│   │   ├── jest.config.js            # Jest integration config
│   │   └── **/*.test.ts              # Jest integration tests
│   ├── e2e/
│   │   └── **/*.spec.ts              # Playwright E2E tests
│   └── vitest.config.ts              # Root Vitest config
├── jest.config.js                    # Root Jest (VS Code)
└── vitest.config.ts                  # Root Vitest config
```

---

## 🚀 **Running Tests**

### **Unit Tests (Vitest)**
```bash
# All unit tests
pnpm test

# Specific app
cd apps/web-main && pnpm test

# Specific service
cd services/auth-service && pnpm test

# Watch mode
pnpm test --watch
```

### **Integration Tests (Jest)**
```bash
# All integration tests
cd tests/integration && pnpm test

# Specific service integration
pnpm test:auth

# With coverage
pnpm test:coverage
```

### **E2E Tests (Playwright)**
```bash
# All E2E tests
pnpm test:e2e

# Specific test file
pnpm test:e2e auth.spec.ts

# Headed mode (with browser UI)
pnpm test:e2e --headed
```

---

## 🎯 **Performance Guidelines**

### **Speed Expectations:**
- **Unit Tests (Vitest)**: < 1 second per test
- **Integration Tests (Jest)**: < 5 seconds per test
- **E2E Tests (Playwright)**: < 60 seconds per test

### **Optimization Tips:**
1. **Use Vitest for speed-critical tests**
2. **Parallelize Jest integration tests**
3. **Mock external services appropriately**
4. **Use test data factories**
5. **Clean up resources properly**

---

## 🛠️ **Migration Guidelines**

### **From Jest to Vitest (Unit Tests):**
```typescript
// OLD (Jest)
import { describe, test, expect } from '@jest/globals';

// NEW (Vitest)
import { describe, test, expect } from 'vitest';
```

### **From Vitest to Jest (Integration Tests):**
```typescript
// When you need complex integration testing
// Move from src/**/*.test.ts to tests/integration/**/*.test.ts
// Update imports to use Jest ecosystem (supertest, testcontainers)
```

---

## ✅ **Best Practices**

### **For Unit Tests (Vitest):**
- ✅ Test pure functions and utilities
- ✅ Mock external dependencies
- ✅ Keep tests fast and isolated
- ✅ Use descriptive test names
- ❌ Don't test external APIs
- ❌ Don't use real databases

### **For Integration Tests (Jest):**
- ✅ Test API endpoints thoroughly
- ✅ Use test databases
- ✅ Test error scenarios
- ✅ Verify service interactions
- ❌ Don't test UI interactions
- ❌ Don't duplicate unit test coverage

### **For E2E Tests (Playwright):**
- ✅ Test critical user journeys
- ✅ Test cross-browser compatibility
- ✅ Use page object models
- ✅ Test responsive design
- ❌ Don't test every edge case
- ❌ Don't duplicate integration tests

---

## 🔧 **IDE Configuration**

### **VS Code Settings:**
```json
{
  "jest.jestCommandLine": "npx jest",
  "vitest.commandLine": "npx vitest",
  "jest.rootPath": "tests/integration",
  "vitest.rootPath": "."
}
```

### **Recommended Extensions:**
- **Jest**: `orta.vscode-jest`
- **Vitest**: `ZixuanChen.vitest-explorer`
- **Playwright**: `ms-playwright.playwright`

---

## 📊 **Coverage Goals**

| Test Type | Coverage Target | Scope |
|-----------|----------------|-------|
| **Unit Tests** | 80%+ | Individual functions, components |
| **Integration Tests** | 100% | API endpoints, service interactions |
| **E2E Tests** | 100% | Critical user journeys |

---

## 🤝 **Contributing**

When adding new tests:

1. **Choose the right framework** based on this guide
2. **Follow naming conventions** (`*.test.ts` for unit, `*.spec.ts` for E2E)
3. **Update coverage requirements** if needed
4. **Document complex test scenarios**
5. **Run the full test suite** before committing

---

## 📚 **Resources**

- [Vitest Documentation](https://vitest.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)
- [Enterprise Testing Strategies](https://martinfowler.com/articles/practical-test-pyramid.html)

---

**💡 Remember**: This dual-framework approach is intentional and supports our enterprise-scale monorepo architecture. Each framework serves specific testing needs optimally.