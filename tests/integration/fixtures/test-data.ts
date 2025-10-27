/**
 * Test Data Fixtures for Integration Tests
 * Provides consistent test data across all integration tests
 */

import { faker } from 'faker';

// User fixtures
export const createUserFixture = (overrides: Partial<any> = {}) => ({
  email: faker.internet.email(),
  name: faker.name.fullName(),
  password: 'TestPassword123!',
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  company: faker.company.name(),
  role: 'developer',
  ...overrides,
});

export const createAdminUserFixture = (overrides: Partial<any> = {}) => ({
  ...createUserFixture(),
  role: 'admin',
  permissions: ['read', 'write', 'admin'],
  ...overrides,
});

// Project fixtures
export const createProjectFixture = (overrides: Partial<any> = {}) => ({
  name: faker.company.name() + ' Project',
  description: faker.lorem.paragraph(),
  visibility: 'private',
  template: 'react-typescript',
  tags: [faker.lorem.word(), faker.lorem.word()],
  settings: {
    enableAI: true,
    enableCollaboration: true,
    autoSave: true,
  },
  ...overrides,
});

// AI request fixtures
export const createAIRequestFixture = (overrides: Partial<any> = {}) => ({
  prompt: 'Create a React component for displaying user profiles',
  context: {
    language: 'typescript',
    framework: 'react',
    style: 'functional',
  },
  model: 'gpt-4',
  maxTokens: 1000,
  temperature: 0.7,
  ...overrides,
});

// Billing fixtures
export const createSubscriptionFixture = (overrides: Partial<any> = {}) => ({
  planId: 'pro',
  paymentMethodId: 'pm_card_visa',
  billingCycle: 'monthly',
  metadata: {
    source: 'integration_test',
  },
  ...overrides,
});

export const createPaymentMethodFixture = (overrides: Partial<any> = {}) => ({
  type: 'card',
  card: {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2025,
    cvc: '123',
  },
  billing_details: {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    address: {
      line1: faker.address.streetAddress(),
      city: faker.address.city(),
      state: faker.address.state(),
      postal_code: faker.address.zipCode(),
      country: 'US',
    },
  },
  ...overrides,
});

// Notification fixtures
export const createEmailNotificationFixture = (overrides: Partial<any> = {}) => ({
  to: faker.internet.email(),
  subject: faker.lorem.sentence(),
  template: 'welcome',
  data: {
    name: faker.name.firstName(),
    company: faker.company.name(),
  },
  ...overrides,
});

export const createSMSNotificationFixture = (overrides: Partial<any> = {}) => ({
  to: '+1234567890',
  message: faker.lorem.sentence(),
  ...overrides,
});

export const createPushNotificationFixture = (overrides: Partial<any> = {}) => ({
  title: faker.lorem.words(3),
  body: faker.lorem.sentence(),
  icon: '/icon-192x192.png',
  badge: '/badge-72x72.png',
  data: {
    url: faker.internet.url(),
    action: 'view',
  },
  ...overrides,
});

// File fixtures
export const createFileFixture = (overrides: Partial<any> = {}) => ({
  name: faker.system.fileName(),
  path: faker.system.directoryPath(),
  content: faker.lorem.paragraphs(3),
  size: faker.datatype.number({ min: 100, max: 10000 }),
  mimeType: 'text/plain',
  ...overrides,
});

export const createImageFileFixture = (overrides: Partial<any> = {}) => ({
  ...createFileFixture(),
  name: 'test-image.jpg',
  mimeType: 'image/jpeg',
  content: 'base64-encoded-image-data',
  metadata: {
    width: 800,
    height: 600,
    format: 'jpeg',
  },
  ...overrides,
});

// Collaboration fixtures
export const createCollaboratorFixture = (overrides: Partial<any> = {}) => ({
  email: faker.internet.email(),
  role: 'editor',
  permissions: ['read', 'write'],
  invitedAt: new Date(),
  ...overrides,
});

export const createCommentFixture = (overrides: Partial<any> = {}) => ({
  content: faker.lorem.paragraph(),
  line: faker.datatype.number({ min: 1, max: 100 }),
  resolved: false,
  metadata: {
    file: faker.system.fileName(),
    position: {
      start: faker.datatype.number({ min: 1, max: 50 }),
      end: faker.datatype.number({ min: 51, max: 100 }),
    },
  },
  ...overrides,
});

// Mock API responses
export const mockSuccessResponse = (data: any) => ({
  success: true,
  data,
  message: 'Operation completed successfully',
  timestamp: new Date().toISOString(),
});

export const mockErrorResponse = (message: string, code: number = 400) => ({
  success: false,
  error: {
    message,
    code,
    timestamp: new Date().toISOString(),
  },
});

export const mockPaginatedResponse = (items: any[], page: number = 1, limit: number = 20) => ({
  success: true,
  data: items.slice((page - 1) * limit, page * limit),
  pagination: {
    page,
    limit,
    total: items.length,
    totalPages: Math.ceil(items.length / limit),
    hasNext: page * limit < items.length,
    hasPrev: page > 1,
  },
});

// Test scenarios
export const testScenarios = {
  newUser: {
    registration: createUserFixture(),
    firstProject: createProjectFixture({ name: 'My First Project' }),
    welcomeEmail: createEmailNotificationFixture({ template: 'welcome' }),
  },
  
  premiumUser: {
    user: createUserFixture({ role: 'premium' }),
    subscription: createSubscriptionFixture({ planId: 'premium' }),
    project: createProjectFixture({ 
      name: 'Premium Project',
      settings: { enableAI: true, enableAdvancedFeatures: true }
    }),
  },
  
  teamCollaboration: {
    owner: createUserFixture({ email: 'owner@example.com' }),
    collaborators: [
      createUserFixture({ email: 'dev1@example.com', role: 'developer' }),
      createUserFixture({ email: 'dev2@example.com', role: 'developer' }),
      createUserFixture({ email: 'designer@example.com', role: 'designer' }),
    ],
    project: createProjectFixture({ 
      name: 'Team Project',
      visibility: 'team',
      settings: { enableCollaboration: true }
    }),
  },
  
  aiWorkflow: {
    user: createUserFixture(),
    project: createProjectFixture({ template: 'react-typescript' }),
    aiRequests: [
      createAIRequestFixture({ prompt: 'Create a login component' }),
      createAIRequestFixture({ prompt: 'Add form validation' }),
      createAIRequestFixture({ prompt: 'Style with Tailwind CSS' }),
    ],
  },
  
  billingWorkflow: {
    user: createUserFixture(),
    paymentMethod: createPaymentMethodFixture(),
    subscriptions: [
      createSubscriptionFixture({ planId: 'free' }),
      createSubscriptionFixture({ planId: 'pro' }),
      createSubscriptionFixture({ planId: 'enterprise' }),
    ],
  },
};

// Utility functions
export const generateTestUsers = (count: number) => 
  Array.from({ length: count }, (_, i) => 
    createUserFixture({ email: `testuser${i + 1}@example.com` })
  );

export const generateTestProjects = (count: number, ownerId: string) =>
  Array.from({ length: count }, (_, i) => 
    createProjectFixture({ 
      name: `Test Project ${i + 1}`,
      ownerId 
    })
  );

export const generateRandomDelay = (min: number = 100, max: number = 1000) =>
  Math.floor(Math.random() * (max - min + 1)) + min;