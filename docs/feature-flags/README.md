# Feature Flags & A/B Testing Documentation

This document provides comprehensive guidance on using the Zoptal feature flags and A/B testing system.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Feature Flags](#feature-flags)
4. [A/B Testing](#ab-testing)
5. [React Integration](#react-integration)
6. [Admin Dashboard](#admin-dashboard)
7. [API Reference](#api-reference)
8. [Configuration](#configuration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Overview

The Zoptal feature flags and A/B testing system provides:

- **Feature Flags** - Toggle features on/off and control rollouts
- **A/B Testing** - Run experiments with statistical significance
- **User Targeting** - Target specific user segments and attributes
- **Real-time Updates** - Changes propagate instantly without deployments
- **Analytics Integration** - Track flag usage and test performance
- **React Components** - Easy integration with React applications
- **Admin Dashboard** - Visual management interface

## Quick Start

### 1. Installation

```bash
# Install the feature flags package
npm install @zoptal/feature-flags

# Or using yarn
yarn add @zoptal/feature-flags
```

### 2. Basic Setup

```typescript
import { FeatureFlagManager, RedisStorage } from '@zoptal/feature-flags';

// Initialize storage
const storage = new RedisStorage({
  host: 'localhost',
  port: 6379,
  password: 'your-redis-password',
});

// Create feature flag manager
const flagManager = new FeatureFlagManager({
  storage,
  environment: 'production',
  cacheEnabled: true,
  evaluationLogging: true,
});

// Evaluate a flag
const context = {
  userId: 'user123',
  userAttributes: {
    email: 'user@example.com',
    plan: 'premium',
    country: 'US',
  },
  timestamp: new Date(),
  environment: 'production',
};

const result = await flagManager.evaluateFlag('new-dashboard', context);
console.log('Flag enabled:', result.value); // true/false
```

### 3. React Integration

```tsx
import { FeatureFlagProvider, useFeatureFlag } from '@zoptal/feature-flags';

// Wrap your app
function App() {
  return (
    <FeatureFlagProvider
      flagManager={flagManager}
      userId="user123"
      userAttributes={{ plan: 'premium' }}
    >
      <Dashboard />
    </FeatureFlagProvider>
  );
}

// Use flags in components
function Dashboard() {
  const { isEnabled, loading } = useFeatureFlag('new-dashboard');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isEnabled ? <NewDashboard /> : <OldDashboard />}
    </div>
  );
}
```

## Feature Flags

### Creating Feature Flags

```typescript
// Boolean flag
const booleanFlag = await flagManager.createFlag({
  key: 'enable-new-feature',
  name: 'Enable New Feature',
  description: 'Toggle the new feature on/off',
  type: FlagType.BOOLEAN,
  status: FlagStatus.ACTIVE,
  variants: [
    { id: '1', key: 'on', name: 'On', value: true, weight: 0 },
    { id: '2', key: 'off', name: 'Off', value: false, weight: 100 }
  ],
  defaultVariant: 'off',
  rules: [],
  rolloutPercentage: 50, // 50% of users
  tags: ['frontend', 'ui'],
  createdBy: 'admin',
  environment: 'production',
});

// String flag with variants
const stringFlag = await flagManager.createFlag({
  key: 'button-color',
  name: 'Button Color',
  type: FlagType.STRING,
  status: FlagStatus.ACTIVE,
  variants: [
    { id: '1', key: 'blue', name: 'Blue', value: '#0066cc', weight: 50 },
    { id: '2', key: 'green', name: 'Green', value: '#00cc66', weight: 30 },
    { id: '3', key: 'red', name: 'Red', value: '#cc0066', weight: 20 }
  ],
  defaultVariant: 'blue',
  rolloutPercentage: 100,
  tags: ['design', 'ui'],
  createdBy: 'design-team',
  environment: 'production',
});

// JSON configuration flag
const configFlag = await flagManager.createFlag({
  key: 'api-config',
  name: 'API Configuration',
  type: FlagType.JSON,
  status: FlagStatus.ACTIVE,
  variants: [
    {
      id: '1',
      key: 'default',
      name: 'Default Config',
      value: {
        apiUrl: 'https://api.zoptal.com',
        timeout: 5000,
        retries: 3,
        features: ['auth', 'analytics']
      },
      weight: 100
    }
  ],
  defaultVariant: 'default',
  rolloutPercentage: 100,
  createdBy: 'backend-team',
  environment: 'production',
});
```

### Targeting Rules

```typescript
// Create flag with targeting rules
const targetedFlag = await flagManager.createFlag({
  key: 'premium-features',
  name: 'Premium Features',
  type: FlagType.BOOLEAN,
  status: FlagStatus.ACTIVE,
  variants: [
    { id: '1', key: 'enabled', name: 'Enabled', value: true, weight: 100 },
    { id: '2', key: 'disabled', name: 'Disabled', value: false, weight: 0 }
  ],
  defaultVariant: 'disabled',
  rules: [
    {
      id: 'premium-users',
      name: 'Premium Users Only',
      condition: {
        operator: 'AND',
        conditions: [
          {
            attribute: 'plan',
            operator: 'in',
            values: ['premium', 'enterprise']
          },
          {
            attribute: 'country',
            operator: 'not_in',
            values: ['restricted-country']
          }
        ]
      },
      variant: 'enabled',
      enabled: true,
      priority: 1
    }
  ],
  rolloutPercentage: 0, // Only rule-based targeting
  createdBy: 'product-team',
  environment: 'production',
});
```

### Flag Evaluation

```typescript
// Simple boolean evaluation
const isFeatureEnabled = await flagManager.getBooleanFlag(
  'enable-new-feature',
  context,
  false // default value
);

// String flag evaluation
const buttonColor = await flagManager.getStringFlag(
  'button-color',
  context,
  '#0066cc' // default value
);

// JSON configuration evaluation
const apiConfig = await flagManager.getJSONFlag(
  'api-config',
  context,
  { apiUrl: 'https://fallback.api.com' } // default value
);

// Full evaluation with metadata
const evaluation = await flagManager.evaluateFlag('premium-features', context);
console.log({
  value: evaluation.value,
  variant: evaluation.variant,
  reason: evaluation.reason, // 'rule_match', 'rollout', 'default', etc.
  ruleId: evaluation.ruleId,
  evaluationId: evaluation.evaluationId
});

// Bulk evaluation for performance
const flagKeys = ['new-dashboard', 'premium-features', 'button-color'];
const results = await flagManager.evaluateFlags(flagKeys, context);
results.forEach((result, flagKey) => {
  console.log(`${flagKey}: ${result.value}`);
});
```

## A/B Testing

### Creating A/B Tests

```typescript
import { ABTestManager, TestStatus, TestType } from '@zoptal/feature-flags';

const testManager = new ABTestManager(storage, 'production');

// Simple A/B test
const abTest = await testManager.createTest({
  key: 'checkout-button-test',
  name: 'Checkout Button Color Test',
  description: 'Test different button colors for conversion rate',
  status: TestStatus.DRAFT,
  type: TestType.AB,
  variants: [
    {
      id: '1',
      key: 'control',
      name: 'Blue Button (Control)',
      description: 'Current blue checkout button',
      weight: 50,
      config: { buttonColor: '#0066cc', buttonText: 'Buy Now' },
      isControl: true
    },
    {
      id: '2',
      key: 'treatment',
      name: 'Green Button (Treatment)',
      description: 'New green checkout button',
      weight: 50,
      config: { buttonColor: '#00cc66', buttonText: 'Purchase' }
    }
  ],
  allocation: {
    method: AllocationMethod.HASH,
    trafficAllocation: 20, // 20% of users in test
    stickyBucketing: true,
    seed: 'checkout-test-2024'
  },
  targeting: {
    includeRules: [
      {
        attribute: 'hasItems',
        operator: 'equals',
        value: true
      }
    ],
    excludeRules: [
      {
        attribute: 'isBot',
        operator: 'equals',
        value: true
      }
    ]
  },
  metrics: {
    primary: {
      name: 'purchase_conversion',
      type: MetricType.CONVERSION,
      goal: 'increase',
      significanceLevel: 0.95,
      minimumDetectableEffect: 0.05 // 5% improvement
    },
    secondary: [
      {
        name: 'button_clicks',
        type: MetricType.ENGAGEMENT,
        goal: 'increase'
      }
    ],
    guardrail: [
      {
        name: 'page_load_time',
        type: MetricType.CUSTOM,
        threshold: 3000, // 3 seconds
        direction: 'below'
      }
    ]
  },
  schedule: {
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    timeZone: 'UTC'
  },
  settings: {
    confidenceLevel: 95,
    statisticalPower: 80,
    multipleTestingCorrection: true,
    sequentialTesting: false
  },
  createdBy: 'product-manager',
  environment: 'production'
});
```

### Running Tests

```typescript
// Start a test
await testManager.startTest('checkout-button-test');

// Assign user to test variant
const assignment = await testManager.assignVariant(
  'checkout-button-test',
  'user123',
  {
    hasItems: true,
    country: 'US',
    plan: 'premium'
  },
  'session456'
);

if (assignment) {
  console.log('User assigned to variant:', assignment.variant);
  console.log('Variant config:', assignment.config);
  
  // Use variant configuration
  const { buttonColor, buttonText } = assignment.config;
  // Apply to UI...
}

// Track conversions
await testManager.trackConversion({
  testId: abTest.id,
  userId: 'user123',
  sessionId: 'session456',
  variant: assignment.variant,
  eventName: 'purchase_conversion',
  value: 99.99, // purchase amount
  properties: {
    product: 'premium-plan',
    currency: 'USD'
  },
  timestamp: new Date()
});

// Get test results
const results = await testManager.getTestResults('checkout-button-test');
console.log({
  status: results.status, // 'running', 'significant', 'not_significant'
  winningVariant: results.winningVariant,
  confidence: results.confidence,
  significance: results.significance,
  conversionRates: results.conversionRates,
  sampleSizes: results.sampleSizes
});

// Stop test when significant
if (results.status === 'significant') {
  await testManager.stopTest('checkout-button-test', 'Reached significance');
}
```

### Multivariate Testing

```typescript
// Create multivariate test
const multivariateTest = await testManager.createTest({
  key: 'landing-page-test',
  name: 'Landing Page Optimization',
  type: TestType.MULTIVARIATE,
  variants: [
    {
      id: '1',
      key: 'control',
      name: 'Original',
      weight: 25,
      config: {
        headline: 'Welcome to Zoptal',
        buttonColor: '#0066cc',
        layout: 'centered'
      },
      isControl: true
    },
    {
      id: '2',
      key: 'headline-a',
      name: 'New Headline',
      weight: 25,
      config: {
        headline: 'Build Better Software Faster',
        buttonColor: '#0066cc',
        layout: 'centered'
      }
    },
    {
      id: '3',
      key: 'button-b',
      name: 'Green Button',
      weight: 25,
      config: {
        headline: 'Welcome to Zoptal',
        buttonColor: '#00cc66',
        layout: 'centered'
      }
    },
    {
      id: '4',
      key: 'layout-c',
      name: 'Left Layout',
      weight: 25,
      config: {
        headline: 'Welcome to Zoptal',
        buttonColor: '#0066cc',
        layout: 'left-aligned'
      }
    }
  ],
  allocation: {
    method: AllocationMethod.HASH,
    trafficAllocation: 100,
    stickyBucketing: true
  },
  // ... rest of configuration
});
```

## React Integration

### Hooks and Components

```tsx
import {
  FeatureFlagProvider,
  useFeatureFlag,
  useBooleanFlag,
  useStringFlag,
  useABTest,
  FeatureFlagWrapper,
  ABTestWrapper,
  WithFeatureFlag,
  WithABTest
} from '@zoptal/feature-flags';

// Provider setup
function App() {
  return (
    <FeatureFlagProvider
      flagManager={flagManager}
      testManager={testManager}
      userId="user123"
      userAttributes={{
        email: 'user@example.com',
        plan: 'premium',
        country: 'US'
      }}
      sessionId="session456"
      environment="production"
    >
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </FeatureFlagProvider>
  );
}

// Using hooks
function HomePage() {
  // Boolean flag
  const { value: showNewFeature, loading } = useBooleanFlag('new-homepage');
  
  // String flag
  const { value: buttonColor } = useStringFlag('button-color', '#0066cc');
  
  // A/B test
  const { variant, config, trackConversion, isInTest } = useABTest('homepage-test');

  const handleSignUp = async () => {
    // Track conversion for A/B test
    if (isInTest) {
      await trackConversion('signup', 1, { source: 'homepage' });
    }
    
    // Handle signup...
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ color: config?.headlineColor }}>
        {config?.headline || 'Welcome to Zoptal'}
      </h1>
      
      <button
        style={{ backgroundColor: buttonColor }}
        onClick={handleSignUp}
      >
        {config?.buttonText || 'Sign Up'}
      </button>

      {showNewFeature && <NewFeatureComponent />}
    </div>
  );
}

// Component wrappers
function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Feature flag wrapper */}
      <FeatureFlagWrapper
        flagKey="analytics-panel"
        fallback={<div>Analytics coming soon!</div>}
      >
        <AnalyticsPanel />
      </FeatureFlagWrapper>

      {/* A/B test wrapper */}
      <ABTestWrapper
        testKey="dashboard-layout"
        variant="new-layout"
        fallback={<OldDashboardLayout />}
      >
        <NewDashboardLayout />
      </ABTestWrapper>
    </div>
  );
}

// Higher-order components
const PremiumFeature = WithFeatureFlag('premium-features')(
  ({ children }) => <div className="premium">{children}</div>
);

const ExperimentalDashboard = WithABTest('dashboard-experiment', 'treatment')(
  ({ abTestConfig, abVariant }) => (
    <div style={{ theme: abTestConfig?.theme }}>
      <h2>Experimental Dashboard ({abVariant})</h2>
      {/* Dashboard content */}
    </div>
  )
);

// Usage
function App() {
  return (
    <FeatureFlagProvider {...providerProps}>
      <PremiumFeature>
        <AdvancedAnalytics />
      </PremiumFeature>
      
      <ExperimentalDashboard />
    </FeatureFlagProvider>
  );
}
```

### Advanced Patterns

```tsx
// Custom hook for complex logic
function useExperimentalCheckout() {
  const { variant, config, trackConversion } = useABTest('checkout-flow');
  const { value: fastCheckout } = useBooleanFlag('fast-checkout');
  
  const checkout = useCallback(async (items: CartItem[]) => {
    const startTime = Date.now();
    
    try {
      let result;
      
      if (variant === 'one-click' && fastCheckout) {
        result = await oneClickCheckout(items, config);
      } else if (variant === 'multi-step') {
        result = await multiStepCheckout(items, config);
      } else {
        result = await standardCheckout(items);
      }
      
      // Track successful conversion
      await trackConversion('purchase', result.total, {
        items: items.length,
        duration: Date.now() - startTime,
        flow: variant || 'standard'
      });
      
      return result;
    } catch (error) {
      // Track failed conversion
      await trackConversion('checkout_error', 0, {
        error: error.message,
        flow: variant || 'standard'
      });
      throw error;
    }
  }, [variant, config, fastCheckout, trackConversion]);
  
  return {
    checkout,
    variant,
    config,
    isOneClick: variant === 'one-click' && fastCheckout
  };
}

// Conditional rendering with multiple flags
function ConditionalFeatures() {
  const flags = useMultipleFlags([
    'new-navigation',
    'chat-support',
    'dark-mode',
    'beta-features'
  ]);
  
  return (
    <div>
      {flags.getValue('new-navigation') && <NewNavigation />}
      {flags.getValue('chat-support') && <ChatWidget />}
      {flags.getValue('dark-mode') && <DarkModeToggle />}
      {flags.getValue('beta-features') && <BetaFeaturesList />}
    </div>
  );
}

// Performance optimization with memo
const OptimizedFeature = React.memo(function OptimizedFeature() {
  const { value: enabled, loading } = useBooleanFlag('heavy-feature');
  
  // Only render expensive component when flag is enabled
  if (!enabled || loading) return null;
  
  return <ExpensiveComponent />;
});
```

## Admin Dashboard

### Setup Dashboard

```tsx
import {
  FeatureFlagDashboard,
  FlagManagementPanel,
  TestManagementPanel,
  AnalyticsDashboard
} from '@zoptal/feature-flags';

function AdminApp() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [tests, setTests] = useState<ABTest[]>([]);

  // Load data
  useEffect(() => {
    loadFlags().then(setFlags);
    loadTests().then(setTests);
  }, []);

  const handleCreateFlag = async (flagData: CreateFlagData) => {
    const newFlag = await flagManager.createFlag(flagData);
    setFlags(prev => [...prev, newFlag]);
  };

  const handleUpdateFlag = async (flagKey: string, updates: Partial<FeatureFlag>) => {
    const updated = await flagManager.updateFlag(flagKey, updates);
    if (updated) {
      setFlags(prev => prev.map(f => f.key === flagKey ? updated : f));
    }
  };

  // ... other handlers

  return (
    <div className="admin-app">
      <h1>Feature Flags & A/B Testing Admin</h1>
      
      {/* Complete dashboard with tabs */}
      <FeatureFlagDashboard />
      
      {/* Or individual panels */}
      <div className="panels">
        <FlagManagementPanel
          flags={flags}
          onCreateFlag={handleCreateFlag}
          onUpdateFlag={handleUpdateFlag}
          onDeleteFlag={handleDeleteFlag}
          onToggleFlag={handleToggleFlag}
        />
        
        <TestManagementPanel
          tests={tests}
          onCreateTest={handleCreateTest}
          onUpdateTest={handleUpdateTest}
          onStartTest={handleStartTest}
          onStopTest={handleStopTest}
          onDeleteTest={handleDeleteTest}
        />
        
        <AnalyticsDashboard
          flagAnalytics={flagAnalytics}
          testResults={testResults}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>
    </div>
  );
}
```

### Custom Dashboard Components

```tsx
// Custom flag card
function CustomFlagCard({ flag, onUpdate }: { flag: FeatureFlag; onUpdate: Function }) {
  const [rollout, setRollout] = useState(flag.rolloutPercentage);

  const handleRolloutChange = async (newRollout: number) => {
    await onUpdate(flag.key, { rolloutPercentage: newRollout });
    setRollout(newRollout);
  };

  return (
    <div className="custom-flag-card">
      <h3>{flag.name}</h3>
      <p>{flag.description}</p>
      
      <div className="rollout-control">
        <label>Rollout: {rollout}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={rollout}
          onChange={(e) => handleRolloutChange(Number(e.target.value))}
        />
      </div>
      
      <div className="variants">
        {flag.variants.map(variant => (
          <div key={variant.key} className="variant">
            <span>{variant.name}: {JSON.stringify(variant.value)}</span>
            <span>{variant.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Real-time test results
function LiveTestResults({ testKey }: { testKey: string }) {
  const [results, setResults] = useState<ABTestResult | null>(null);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const freshResults = await testManager.getTestResults(testKey);
      setResults(freshResults);
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [testKey]);

  if (!results) return <div>Loading results...</div>;

  return (
    <div className="live-results">
      <h3>Live Results</h3>
      <div className="metrics">
        <div>Confidence: {(results.confidence * 100).toFixed(1)}%</div>
        <div>Status: {results.status}</div>
        <div>Winner: {results.winningVariant || 'TBD'}</div>
      </div>
      
      <div className="conversion-rates">
        {Object.entries(results.conversionRates).map(([variant, rate]) => (
          <div key={variant}>
            {variant}: {(rate * 100).toFixed(2)}% 
            ({results.conversions[variant]}/{results.sampleSizes[variant]})
          </div>
        ))}
      </div>
    </div>
  );
}
```

## API Reference

### Feature Flag Service Endpoints

```bash
# Get all flags
GET /api/flags?environment=production&status=active&limit=50

# Get specific flag
GET /api/flags/new-dashboard

# Create flag
POST /api/flags
{
  "key": "new-feature",
  "name": "New Feature",
  "type": "boolean",
  "variants": [...],
  "rolloutPercentage": 50
}

# Update flag
PUT /api/flags/new-feature
{
  "rolloutPercentage": 75,
  "status": "active"
}

# Evaluate flag
POST /api/flags/new-feature/evaluate
{
  "userId": "user123",
  "userAttributes": {
    "plan": "premium",
    "country": "US"
  }
}

# Bulk evaluate
POST /api/flags/evaluate/bulk
{
  "flagKeys": ["feature-1", "feature-2", "feature-3"],
  "userId": "user123",
  "userAttributes": {...}
}

# Toggle flag
POST /api/flags/new-feature/toggle
{
  "enabled": true
}

# Delete flag
DELETE /api/flags/new-feature
```

### A/B Testing Endpoints

```bash
# Get all tests
GET /api/tests?status=running

# Get specific test
GET /api/tests/checkout-test

# Create test
POST /api/tests
{
  "key": "checkout-test",
  "name": "Checkout Optimization",
  "variants": [...],
  "allocation": {...},
  "metrics": {...}
}

# Start test
POST /api/tests/checkout-test/start

# Stop test
POST /api/tests/checkout-test/stop
{
  "reason": "Reached significance"
}

# Get test assignment
POST /api/tests/checkout-test/assign
{
  "userId": "user123",
  "userAttributes": {...}
}

# Track conversion
POST /api/tests/checkout-test/conversions
{
  "userId": "user123",
  "variant": "treatment",
  "eventName": "purchase",
  "value": 99.99
}

# Get test results
GET /api/tests/checkout-test/results
```

### Analytics Endpoints

```bash
# Get flag analytics
GET /api/analytics/flags?startDate=2024-01-01&endDate=2024-01-31

# Get test analytics
GET /api/analytics/tests?testKey=checkout-test

# Get user segments
GET /api/segments

# Create user segment
POST /api/segments
{
  "name": "Premium Users",
  "rules": [...]
}
```

## Configuration

### Environment Variables

```bash
# Service Configuration
PORT=3007
NODE_ENV=production
API_URL=https://flags.zoptal.com

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/zoptal_flags

# Authentication
JWT_SECRET=your-jwt-secret
API_KEY_SALT=your-api-key-salt

# Feature Flag Configuration
DEFAULT_ENVIRONMENT=production
CACHE_TTL=300000
EVALUATION_LOGGING=true

# A/B Testing Configuration
DEFAULT_CONFIDENCE_LEVEL=95
DEFAULT_STATISTICAL_POWER=80
MAX_TEST_DURATION_DAYS=90

# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=90

# CORS Configuration
CORS_ORIGINS=https://app.zoptal.com,https://admin.zoptal.com

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000
```

### Storage Configuration

```typescript
// Redis Storage
const redisStorage = new RedisStorage({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  keyPrefix: 'zoptal:flags:',
  ttl: 300, // 5 minutes cache
});

// Database Storage
const dbStorage = new DatabaseStorage({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'zoptal_flags',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
  pool: {
    min: 2,
    max: 10,
    idle: 10000,
  },
});

// In-Memory Storage (for testing)
const memoryStorage = new InMemoryStorage();
```

### System Configuration

```typescript
import { createFeatureFlagSystem } from '@zoptal/feature-flags';

const system = createFeatureFlagSystem({
  storage: redisStorage,
  environment: 'production',
  clientId: 'web-app',
  
  // Cache settings
  cacheEnabled: true,
  cacheTTL: 300000, // 5 minutes
  
  // Evaluation settings
  evaluationLogging: true,
  
  // Analytics settings
  analytics: {
    enabled: true,
    provider: 'internal',
    config: {
      retentionDays: 90,
      aggregationInterval: 3600000, // 1 hour
    },
  },
  
  // Targeting settings
  targeting: {
    maxRuleDepth: 5,
    maxConditions: 20,
    enableSegments: true,
  },
  
  // A/B Testing settings
  abTesting: {
    enabled: true,
    maxConcurrentTests: 10,
    defaultConfidenceLevel: 95,
    defaultStatisticalPower: 80,
    minSampleSize: 100,
    maxTestDuration: 90 * 24 * 60 * 60 * 1000, // 90 days
  },
});
```

## Best Practices

### 1. Flag Naming and Organization

```typescript
// Good flag naming conventions
const flags = {
  // Feature flags: use action-oriented names
  'enable-dark-mode': boolean,
  'show-new-onboarding': boolean,
  'allow-file-upload': boolean,
  
  // Configuration flags: use descriptive names
  'api-timeout-ms': number,
  'max-upload-size-mb': number,
  'supported-file-types': string[],
  
  // Rollout flags: include rollout in name
  'new-dashboard-rollout': boolean,
  'premium-features-rollout': boolean,
  
  // A/B test flags: include experiment context
  'checkout-button-color-test': string,
  'pricing-page-layout-test': string,
};

// Use consistent tagging
const tags = {
  component: ['dashboard', 'checkout', 'onboarding'],
  team: ['frontend', 'backend', 'design'],
  environment: ['staging', 'production'],
  type: ['feature', 'killswitch', 'config', 'experiment'],
};
```

### 2. Gradual Rollouts

```typescript
// Start with small rollout
await flagManager.updateFlag('new-feature', { rolloutPercentage: 5 });

// Monitor metrics, then increase gradually
await flagManager.updateFlag('new-feature', { rolloutPercentage: 10 });
await flagManager.updateFlag('new-feature', { rolloutPercentage: 25 });
await flagManager.updateFlag('new-feature', { rolloutPercentage: 50 });
await flagManager.updateFlag('new-feature', { rolloutPercentage: 100 });

// Or use automated rollout rules
const rolloutRule = {
  name: 'Gradual Rollout',
  schedule: [
    { percentage: 5, duration: '1d' },
    { percentage: 10, duration: '2d' },
    { percentage: 25, duration: '3d' },
    { percentage: 50, duration: '1w' },
    { percentage: 100, duration: 'indefinite' }
  ],
  pauseOnError: true,
  errorThreshold: 0.05 // 5% error rate
};
```

### 3. Testing Strategy

```typescript
// Test flag evaluation logic
describe('Feature Flag Evaluation', () => {
  test('should return default value for unknown flag', async () => {
    const result = await flagManager.getBooleanFlag('unknown-flag', context, false);
    expect(result).toBe(false);
  });

  test('should respect user targeting rules', async () => {
    const premiumContext = { ...context, userAttributes: { plan: 'premium' } };
    const freeContext = { ...context, userAttributes: { plan: 'free' } };
    
    const premiumResult = await flagManager.getBooleanFlag('premium-features', premiumContext);
    const freeResult = await flagManager.getBooleanFlag('premium-features', freeContext);
    
    expect(premiumResult).toBe(true);
    expect(freeResult).toBe(false);
  });

  test('should handle rollout percentage correctly', async () => {
    // Create flag with 50% rollout
    await flagManager.createFlag({
      key: 'test-rollout',
      rolloutPercentage: 50,
      // ... other config
    });

    // Test with many users to verify distribution
    const users = Array.from({ length: 1000 }, (_, i) => `user${i}`);
    const results = await Promise.all(
      users.map(userId => 
        flagManager.getBooleanFlag('test-rollout', { ...context, userId })
      )
    );

    const enabledCount = results.filter(Boolean).length;
    expect(enabledCount).toBeCloseTo(500, 50); // Within 50 of expected
  });
});

// Test A/B test assignment consistency
describe('A/B Test Assignment', () => {
  test('should assign users consistently', async () => {
    const assignment1 = await testManager.assignVariant('test-key', 'user123', {});
    const assignment2 = await testManager.assignVariant('test-key', 'user123', {});
    
    expect(assignment1?.variant).toBe(assignment2?.variant);
  });

  test('should respect traffic allocation', async () => {
    // Test with 20% traffic allocation
    const users = Array.from({ length: 1000 }, (_, i) => `user${i}`);
    const assignments = await Promise.all(
      users.map(userId => testManager.assignVariant('test-key', userId, {}))
    );

    const participantCount = assignments.filter(Boolean).length;
    expect(participantCount).toBeCloseTo(200, 50); // 20% ± 5%
  });
});
```

### 4. Error Handling

```typescript
// Graceful degradation
async function getFeatureConfig(flagKey: string, defaultConfig: any) {
  try {
    return await flagManager.getJSONFlag(flagKey, context, defaultConfig);
  } catch (error) {
    logger.error('Flag evaluation failed', { flagKey, error });
    
    // Return default config on error
    return defaultConfig;
  }
}

// Circuit breaker pattern
class FlagCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private isOpen = false;
  
  async evaluateFlag(flagKey: string, context: EvaluationContext, defaultValue: any) {
    if (this.isOpen && Date.now() - this.lastFailureTime < 60000) {
      // Circuit is open, return default
      return defaultValue;
    }
    
    try {
      const result = await flagManager.evaluateFlag(flagKey, context);
      this.failures = 0; // Reset on success
      this.isOpen = false;
      return result.value;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= 5) {
        this.isOpen = true; // Open circuit after 5 failures
      }
      
      logger.error('Flag evaluation failed', { flagKey, error, failures: this.failures });
      return defaultValue;
    }
  }
}

// Timeout wrapper
async function evaluateWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  defaultValue: T
): Promise<T> {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
  );
  
  try {
    return await Promise.race([promise, timeout]);
  } catch (error) {
    logger.warn('Flag evaluation timed out', { error });
    return defaultValue;
  }
}
```

### 5. Performance Optimization

```typescript
// Batch flag evaluations
const flagKeys = ['feature-1', 'feature-2', 'feature-3'];
const results = await flagManager.evaluateFlags(flagKeys, context);

// Instead of individual evaluations
// const feature1 = await flagManager.getBooleanFlag('feature-1', context);
// const feature2 = await flagManager.getBooleanFlag('feature-2', context);
// const feature3 = await flagManager.getBooleanFlag('feature-3', context);

// Cache evaluation context
const memoizedContext = useMemo(() => ({
  userId,
  userAttributes,
  timestamp: new Date(),
  environment,
}), [userId, userAttributes, environment]);

// Preload critical flags
useEffect(() => {
  const criticalFlags = ['auth-enabled', 'maintenance-mode', 'emergency-banner'];
  flagManager.evaluateFlags(criticalFlags, context);
}, []);

// Use React.memo for expensive flag-dependent components
const ExpensiveFeature = React.memo(function ExpensiveFeature({ flagValue }) {
  // Expensive rendering logic
  return <ComplexComponent enabled={flagValue} />;
});
```

### 6. Security Considerations

```typescript
// Sanitize user attributes
function sanitizeUserAttributes(attributes: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const allowedKeys = ['plan', 'country', 'language', 'timezone', 'segments'];
  
  for (const key of allowedKeys) {
    if (key in attributes) {
      sanitized[key] = attributes[key];
    }
  }
  
  return sanitized;
}

// Validate flag keys
function isValidFlagKey(key: string): boolean {
  return /^[a-z0-9-_]+$/.test(key) && key.length <= 100;
}

// Rate limit flag evaluations per user
const userRateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = userRateLimits.get(userId);
  
  if (!limit || now > limit.resetTime) {
    userRateLimits.set(userId, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 1000) { // 1000 evaluations per minute
    return false;
  }
  
  limit.count++;
  return true;
}

// Audit flag changes
async function auditFlagChange(flagKey: string, change: any, userId: string) {
  await auditLogger.log({
    event: 'flag_changed',
    flagKey,
    change,
    userId,
    timestamp: new Date(),
    ip: getClientIp(),
  });
}
```

## Troubleshooting

### Common Issues

#### 1. Flag Not Updating

```typescript
// Check cache TTL
const health = await flagManager.healthCheck();
console.log('Last sync:', health.lastSyncTime);

// Force refresh
await flagManager.syncFlags();

// Check storage connection
const storageHealthy = await storage.healthCheck();
if (!storageHealthy) {
  console.error('Storage connection issue');
}
```

#### 2. A/B Test Assignment Issues

```typescript
// Debug assignment logic
const debugAssignment = await testManager.assignVariant(
  'test-key',
  'debug-user',
  { debug: true },
  'debug-session'
);

console.log('Assignment result:', debugAssignment);

// Check test configuration
const test = testManager.getTest('test-key');
console.log('Test config:', {
  status: test?.status,
  allocation: test?.allocation,
  targeting: test?.targeting,
});

// Verify user attributes
const matchesTargeting = test?.targeting?.includeRules?.every(rule =>
  evaluateTargetingRule(rule, userAttributes)
);
console.log('Matches targeting:', matchesTargeting);
```

#### 3. Performance Issues

```typescript
// Monitor evaluation times
const startTime = Date.now();
const result = await flagManager.evaluateFlag('slow-flag', context);
const duration = Date.now() - startTime;

if (duration > 100) {
  console.warn('Slow flag evaluation:', { flagKey: 'slow-flag', duration });
}

// Check cache hit rates
const cacheStats = await storage.getCacheStats();
console.log('Cache hit rate:', cacheStats.hitRate);

// Monitor storage performance
const storageStats = await storage.getPerformanceStats();
console.log('Storage performance:', storageStats);
```

#### 4. Integration Issues

```typescript
// React integration debugging
function DebugFeatureFlags() {
  const { getAllFlags, getEvaluationContext } = useFeatureFlagDebug();
  
  return (
    <div>
      <h3>Debug Info</h3>
      <pre>{JSON.stringify(getEvaluationContext(), null, 2)}</pre>
      
      <h3>Available Flags</h3>
      {getAllFlags().map(flag => (
        <div key={flag.key}>
          {flag.key}: {flag.status} ({flag.rolloutPercentage}%)
        </div>
      ))}
    </div>
  );
}

// Service integration debugging
app.get('/debug/flags', async (req, res) => {
  const health = await flagManager.healthCheck();
  const flags = flagManager.getAllFlags();
  
  res.json({
    health,
    flagCount: flags.length,
    flags: flags.map(f => ({
      key: f.key,
      status: f.status,
      rollout: f.rolloutPercentage,
    })),
  });
});
```

### Monitoring and Alerts

```typescript
// Set up monitoring
const monitor = {
  flagEvaluationTime: (duration: number, flagKey: string) => {
    if (duration > 500) {
      alert(`Slow flag evaluation: ${flagKey} took ${duration}ms`);
    }
  },
  
  testAssignmentRate: (testKey: string, rate: number) => {
    const expectedRate = 0.2; // 20% expected
    if (Math.abs(rate - expectedRate) > 0.05) {
      alert(`A/B test assignment rate anomaly: ${testKey} at ${rate}`);
    }
  },
  
  storageErrors: (errorCount: number) => {
    if (errorCount > 10) {
      alert(`High storage error count: ${errorCount}`);
    }
  },
};

// Health check endpoint
app.get('/health/flags', async (req, res) => {
  try {
    const flagHealth = await flagManager.healthCheck();
    const testHealth = await testManager.healthCheck();
    
    const overall = flagHealth.status === 'healthy' && testHealth.status === 'healthy'
      ? 'healthy' 
      : 'unhealthy';
    
    res.json({
      status: overall,
      flags: flagHealth,
      tests: testHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});
```

---

For more information and advanced usage, refer to:
- [API Documentation](http://localhost:3007/api/docs)
- [Package Source Code](../packages/feature-flags)
- [Service Implementation](../services/feature-flag-service)
- [Example Applications](../examples/feature-flags)