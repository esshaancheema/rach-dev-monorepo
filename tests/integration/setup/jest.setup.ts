import { waitForAllServices, waitForDatabases } from '../utils/test-client';
import { waitForDatabases as waitForDBConnections } from '../utils/database-helper';
import { testConfig } from '../config/test-config';

// Extend Jest timeout for integration tests
jest.setTimeout(testConfig.test.timeout);

// Global test setup
beforeAll(async () => {
  console.log('Starting integration test setup...');
  
  try {
    // Wait for databases to be ready
    await waitForDBConnections();
    console.log('✓ Databases are ready');

    // Wait for all services to be ready
    await waitForAllServices();
    console.log('✓ All services are ready');

    console.log('✓ Integration test setup completed');
  } catch (error) {
    console.error('✗ Integration test setup failed:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  console.log('Integration test teardown completed');
});

// Configure axios for tests
import axios from 'axios';

// Set longer timeout for axios in tests
axios.defaults.timeout = testConfig.test.timeout;

// Add request/response interceptors for debugging if needed
if (process.env.DEBUG_HTTP === 'true') {
  axios.interceptors.request.use(
    (config) => {
      console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
      });
      return config;
    },
    (error) => {
      console.error('[HTTP Request Error]', error);
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      console.log(`[HTTP Response] ${response.status} ${response.config.url}`, {
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error(`[HTTP Response Error] ${error.response?.status} ${error.config?.url}`, {
        data: error.response?.data,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );
}

// Mock external services if needed
if (process.env.MOCK_EXTERNAL_SERVICES === 'true') {
  // Mock Stripe
  jest.mock('stripe', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_mock' }),
        retrieve: jest.fn().mockResolvedValue({ id: 'cus_mock' }),
        update: jest.fn().mockResolvedValue({ id: 'cus_mock' }),
      },
      subscriptions: {
        create: jest.fn().mockResolvedValue({ id: 'sub_mock', status: 'active' }),
        retrieve: jest.fn().mockResolvedValue({ id: 'sub_mock', status: 'active' }),
        update: jest.fn().mockResolvedValue({ id: 'sub_mock', status: 'active' }),
      },
      paymentMethods: {
        attach: jest.fn().mockResolvedValue({ id: 'pm_mock' }),
      },
    })),
  }));

  // Mock SendGrid
  jest.mock('@sendgrid/mail', () => ({
    setApiKey: jest.fn(),
    send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
  }));

  // Mock Twilio
  jest.mock('twilio', () => {
    return jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({ sid: 'SM_mock' }),
      },
    }));
  });

  // Mock OpenAI
  jest.mock('openai', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ text: 'Mock AI response' }],
        }),
      },
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mock AI chat response' } }],
          }),
        },
      },
    })),
  }));

  console.log('✓ External services mocked for testing');
}

// Custom matchers for integration tests
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeValidJWT(received) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    const pass = typeof received === 'string' && jwtRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid JWT`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid JWT`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidJWT(): R;
      toBeValidEmail(): R;
    }
  }
}