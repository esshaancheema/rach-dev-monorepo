// Feature Flags and A/B Testing Package - Main Export File

// Core Feature Flag System
export {
  FeatureFlagManager,
  FeatureFlagConfig,
  FeatureFlag,
  FlagType,
  FlagStatus,
  FlagVariant,
  EvaluationContext,
  EvaluationResult,
} from './core/feature-flag-manager';

// A/B Testing Framework
export {
  ABTestManager,
  ABTest,
  ABTestConfig,
  ABTestVariant,
  ABTestResult,
  TestStatus,
  TestType,
  AllocationMethod,
  ConversionEvent,
  StatisticalSignificance,
} from './ab-testing/ab-test-manager';

// Analytics and Metrics
export {
  FeatureFlagAnalytics,
  ABTestAnalytics,
  AnalyticsEvent,
  MetricType,
  AnalyticsConfig,
  ExperimentMetrics,
  ConversionFunnel,
} from './analytics/analytics-manager';

// Storage Providers
export {
  RedisStorage,
  InMemoryStorage,
  DatabaseStorage,
  StorageProvider,
  StorageConfig,
} from './storage/storage-providers';

// Targeting and Segmentation
export {
  UserSegment,
  SegmentRule,
  SegmentCondition,
  SegmentOperator,
  TargetingEngine,
  TargetingRule,
  UserAttributes,
} from './targeting/targeting-engine';

// Feature Flag Middleware
export {
  createFeatureFlagMiddleware,
  createABTestMiddleware,
  MiddlewareConfig,
  FlagMiddlewareOptions,
  TestMiddlewareOptions,
} from './middleware/feature-flag-middleware';

// React Hooks and Components
export {
  FeatureFlagProvider,
  useFeatureFlag,
  useABTest,
  useFeatureFlagAnalytics,
  FeatureFlagWrapper,
  ABTestWrapper,
  WithFeatureFlag,
  WithABTest,
} from './react/feature-flag-hooks';

// Admin Dashboard Components
export {
  FeatureFlagDashboard,
  ABTestDashboard,
  FlagManagementPanel,
  TestManagementPanel,
  AnalyticsDashboard,
  UserSegmentBuilder,
} from './admin/dashboard-components';

// Configuration and Utilities
export {
  FeatureFlagSystem,
  SystemConfig,
  DefaultFeatureFlagConfig,
  createFeatureFlagSystem,
} from './system/feature-flag-system';

// Types and Interfaces
export * from './types/feature-flag-types';
export * from './types/ab-test-types';
export * from './types/analytics-types';
export * from './types/targeting-types';

// Utilities
export {
  flagUtils,
  testUtils,
  analyticsUtils,
  segmentUtils,
} from './utils/feature-flag-utils';

// Version
export const VERSION = '1.0.0';

console.log(`🎌 Zoptal Feature Flags & A/B Testing v${VERSION} loaded`);

export default FeatureFlagSystem;