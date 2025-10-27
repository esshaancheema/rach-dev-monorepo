export interface Integration {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  developerId: string;
  
  // Basic Information
  version: string;
  category: IntegrationCategory;
  tags: string[];
  homepage: string;
  supportUrl: string;
  documentationUrl: string;
  
  // Pricing
  pricing: IntegrationPricing;
  
  // Technical Details
  manifest: IntegrationManifest;
  packageUrl: string;
  packageHash: string;
  packageSize: number;
  
  // Media
  logo: string;
  screenshots: string[];
  videoUrl?: string;
  
  // Status and Lifecycle
  status: IntegrationStatus;
  visibility: IntegrationVisibility;
  
  // Review and Approval
  reviewStatus: ReviewStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  // Statistics
  totalInstalls: number;
  activeInstalls: number;
  averageRating: number;
  totalRatings: number;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Compliance
  gdprCompliant: boolean;
  dataProcessing: DataProcessingInfo;
  permissions: Permission[];
  
  // Compatibility
  compatibleVersions: string[];
  minimumPlatformVersion: string;
  
  // Webhooks and Events
  webhookEndpoints: WebhookEndpoint[];
  subscribedEvents: string[];
  
  // OAuth Configuration
  oauthConfig?: OAuthConfig;
}

export interface Developer {
  id: string;
  name: string;
  email: string;
  company?: string;
  website?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  
  // Verification
  verified: boolean;
  verifiedAt?: Date;
  verificationDocuments: string[];
  
  // Reputation
  totalIntegrations: number;
  totalInstalls: number;
  averageRating: number;
  
  // Business Information
  taxId?: string;
  businessType?: BusinessType;
  businessAddress?: Address;
  
  // Payment Information
  stripeAccountId?: string;
  payoutEnabled: boolean;
  
  // Status
  status: DeveloperStatus;
  suspendedReason?: string;
  suspendedAt?: Date;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface Installation {
  id: string;
  integrationId: string;
  userId: string;
  organizationId?: string;
  
  // Configuration
  config: Record<string, any>;
  enabled: boolean;
  
  // OAuth Tokens (encrypted)
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  
  // Webhooks
  webhookSecret: string;
  webhookEndpoints: string[];
  
  // Usage Tracking
  lastUsedAt?: Date;
  usageCount: number;
  errorCount: number;
  
  // Health
  healthStatus: HealthStatus;
  lastHealthCheck?: Date;
  healthCheckFailures: number;
  
  // Dates
  installedAt: Date;
  updatedAt: Date;
  uninstalledAt?: Date;
}

export interface IntegrationManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  
  // Entry Points
  main?: string;
  webhook?: string;
  oauth?: string;
  
  // Requirements
  platformVersion: string;
  dependencies: Record<string, string>;
  
  // Permissions
  permissions: Permission[];
  scopes: string[];
  
  // Hooks and Events
  hooks: HookDefinition[];
  events: EventDefinition[];
  
  // UI Components
  components?: ComponentDefinition[];
  
  // Configuration Schema
  configSchema?: ConfigSchema;
  
  // Resources
  resources?: ResourceDefinition[];
  
  // API Endpoints
  endpoints?: EndpointDefinition[];
}

export interface Permission {
  name: string;
  description: string;
  required: boolean;
  sensitive: boolean;
  category: PermissionCategory;
}

export interface HookDefinition {
  name: string;
  description: string;
  trigger: string;
  handler: string;
  async?: boolean;
  timeout?: number;
}

export interface EventDefinition {
  name: string;
  description: string;
  schema: any;
}

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  path: string;
  props?: any;
  placement: ComponentPlacement[];
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  createdAt: Date;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string; // encrypted
  redirectUris: string[];
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl?: string;
}

export interface Review {
  id: string;
  integrationId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  
  // Moderation
  flagged: boolean;
  flagReason?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  
  // Helpful votes
  helpfulCount: number;
  notHelpfulCount: number;
  
  // Developer Response
  developerResponse?: string;
  developerResponseAt?: Date;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  integrationId: string;
  date: Date;
  
  // Install Metrics
  installs: number;
  uninstalls: number;
  activeInstalls: number;
  
  // Usage Metrics
  apiCalls: number;
  webhookDeliveries: number;
  errorRate: number;
  avgResponseTime: number;
  
  // User Engagement
  activeUsers: number;
  sessionDuration: number;
  bounceRate: number;
  
  // Revenue (for paid integrations)
  revenue: number;
  subscriptions: number;
  churn: number;
}

export interface Subscription {
  id: string;
  integrationId: string;
  userId: string;
  organizationId?: string;
  
  // Billing
  stripeSubscriptionId: string;
  planId: string;
  status: SubscriptionStatus;
  
  // Usage
  currentUsage: Record<string, number>;
  usageLimits: Record<string, number>;
  
  // Billing Cycle
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  canceledAt?: Date;
}

// Enums and Types
export enum IntegrationCategory {
  PRODUCTIVITY = 'productivity',
  COMMUNICATION = 'communication',
  ANALYTICS = 'analytics',
  SECURITY = 'security',
  FINANCE = 'finance',
  MARKETING = 'marketing',
  SALES = 'sales',
  SUPPORT = 'support',
  DEVELOPMENT = 'development',
  DESIGN = 'design',
  AUTOMATION = 'automation',
  DATA = 'data',
  OTHER = 'other',
}

export enum IntegrationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  REVIEW = 'review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  DEPRECATED = 'deprecated',
}

export enum IntegrationVisibility {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private',
  ORGANIZATION_ONLY = 'organization_only',
}

export enum ReviewStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested',
}

export enum DeveloperStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  ERROR = 'error',
  UNKNOWN = 'unknown',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
}

export enum BusinessType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
  NON_PROFIT = 'non_profit',
}

export enum PermissionCategory {
  DATA_READ = 'data_read',
  DATA_WRITE = 'data_write',
  USER_INFO = 'user_info',
  SYSTEM = 'system',
  EXTERNAL = 'external',
}

export enum ComponentType {
  WIDGET = 'widget',
  PANEL = 'panel',
  BUTTON = 'button',
  MODAL = 'modal',
  PAGE = 'page',
}

export enum ComponentPlacement {
  DASHBOARD = 'dashboard',
  SIDEBAR = 'sidebar',
  TOOLBAR = 'toolbar',
  CONTEXT_MENU = 'context_menu',
  SETTINGS = 'settings',
}

export interface IntegrationPricing {
  type: PricingType;
  free: boolean;
  
  // One-time pricing
  price?: number;
  currency?: string;
  
  // Subscription pricing
  plans?: PricingPlan[];
  
  // Usage-based pricing
  usageLimits?: UsageLimit[];
  
  // Trial
  trialDays?: number;
  trialFeatures?: string[];
}

export enum PricingType {
  FREE = 'free',
  ONE_TIME = 'one_time',
  SUBSCRIPTION = 'subscription',
  USAGE_BASED = 'usage_based',
  FREEMIUM = 'freemium',
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
  limits: Record<string, number>;
  stripePriceId?: string;
}

export enum BillingInterval {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  QUARTERLY = 'quarterly',
}

export interface UsageLimit {
  metric: string;
  limit: number;
  overage: number; // price per unit over limit
}

export interface DataProcessingInfo {
  collectsPersonalData: boolean;
  dataTypes: string[];
  processingPurposes: string[];
  dataRetentionDays: number;
  sharesDataWithThirdParties: boolean;
  thirdParties?: string[];
  gdprCompliant: boolean;
  privacyPolicyUrl: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ConfigSchema {
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface ResourceDefinition {
  name: string;
  type: ResourceType;
  path: string;
  public?: boolean;
}

export enum ResourceType {
  ICON = 'icon',
  IMAGE = 'image',
  STYLE = 'style',
  SCRIPT = 'script',
  TEMPLATE = 'template',
  LOCALE = 'locale',
}

export interface EndpointDefinition {
  path: string;
  method: HttpMethod;
  handler: string;
  auth?: boolean;
  rateLimit?: number;
  schema?: any;
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}