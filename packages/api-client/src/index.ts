// Main API client
export { ZoptalApiClient } from './api-client';
export type { ZoptalApiClientConfig } from './api-client';

// Base client
export { BaseApiClient } from './base-client';

// Individual service clients
export { AuthClient } from './services/auth-client';
export { ProjectClient } from './services/project-client';
export { AIClient } from './services/ai-client';
export { BillingClient } from './services/billing-client';
export { NotificationClient } from './services/notification-client';
export { AnalyticsClient } from './services/analytics-client';

// Types
export * from './types';

// React hooks
export {
  useAsyncCall,
  usePaginatedData,
  usePolling,
  useOptimisticUpdate,
  useApiCache,
  useDebouncedApi,
} from './hooks';

// Service-specific types
export type {
  CreateProjectRequest,
  ProjectFile,
  CodeGeneration,
  Deployment,
} from './services/project-client';

export type {
  CodeGenerationRequest,
  CodeOptimizationRequest,
  CodeReviewRequest,
  DocumentationRequest,
  ChatRequest,
  Conversation,
  ChatMessage,
  ModelUsage,
} from './services/ai-client';

export type {
  Plan,
  PaymentMethod,
  Invoice,
  UsageRecord,
  BillingAddress,
  TaxInfo,
} from './services/billing-client';

export type {
  NotificationPreferences,
  Notification,
  EmailRequest,
  SMSRequest,
  PushNotificationRequest,
  BulkNotificationRequest,
  DeliveryStatus,
} from './services/notification-client';

export type {
  EventDefinition,
  MetricDefinition,
  Dashboard,
  Funnel,
  Cohort,
  AnalyticsResult,
} from './services/analytics-client';

// Import the types for the utility function
import type { ZoptalApiClientConfig } from './api-client';
import { ZoptalApiClient } from './api-client';

// Utility function to create a configured API client
export function createApiClient(config?: ZoptalApiClientConfig): ZoptalApiClient {
  return new ZoptalApiClient(config);
}

// Default instance for simple usage
export const apiClient = new ZoptalApiClient();