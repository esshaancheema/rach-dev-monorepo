import { beforeAll, afterAll, vi } from 'vitest';

// Global test setup for Vitest
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://postgres@localhost:5433/zoptal_test';
  process.env.REDIS_URL = 'redis://localhost:6380';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  
  // Mock external services
  mockExternalServices();
  
  // Set timezone to UTC for consistent test results
  process.env.TZ = 'UTC';
});

afterAll(() => {
  // Cleanup
  vi.restoreAllMocks();
});

function mockExternalServices() {
  // Mock OpenAI API
  vi.mock('openai', () => ({
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'This is a mocked AI response'
              }
            }],
            usage: {
              prompt_tokens: 10,
              completion_tokens: 15,
              total_tokens: 25
            }
          })
        }
      }
    }))
  }));

  // Mock Anthropic API
  vi.mock('@anthropic-ai/sdk', () => ({
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{
            text: 'This is a mocked Anthropic response'
          }],
          usage: {
            input_tokens: 10,
            output_tokens: 15
          }
        })
      }
    }))
  }));

  // Mock Stripe
  vi.mock('stripe', () => ({
    default: vi.fn().mockImplementation(() => ({
      customers: {
        create: vi.fn().mockResolvedValue({
          id: 'cus_test_customer',
          email: 'test@example.com'
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'cus_test_customer',
          email: 'test@example.com'
        })
      },
      subscriptions: {
        create: vi.fn().mockResolvedValue({
          id: 'sub_test_subscription',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000 // 30 days
        }),
        retrieve: vi.fn().mockResolvedValue({
          id: 'sub_test_subscription',
          status: 'active'
        }),
        update: vi.fn().mockResolvedValue({
          id: 'sub_test_subscription',
          status: 'active'
        })
      },
      paymentMethods: {
        create: vi.fn().mockResolvedValue({
          id: 'pm_test_payment_method'
        })
      },
      webhooks: {
        constructEvent: vi.fn().mockReturnValue({
          type: 'customer.subscription.updated',
          data: {
            object: {
              id: 'sub_test_subscription',
              status: 'active'
            }
          }
        })
      }
    }))
  }));

  // Mock SendGrid
  vi.mock('@sendgrid/mail', () => ({
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{
      statusCode: 202,
      body: '',
      headers: {}
    }])
  }));

  // Mock Twilio
  vi.mock('twilio', () => ({
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          sid: 'SM_test_message_sid',
          status: 'sent'
        })
      }
    }))
  }));

  // Mock AWS SDK
  vi.mock('aws-sdk', () => ({
    S3: vi.fn().mockImplementation(() => ({
      upload: vi.fn().mockReturnValue({
        promise: vi.fn().mockResolvedValue({
          Location: 'https://s3.amazonaws.com/test-bucket/test-file.jpg',
          Key: 'test-file.jpg'
        })
      }),
      deleteObject: vi.fn().mockReturnValue({
        promise: vi.fn().mockResolvedValue({})
      })
    })),
    CloudWatch: vi.fn().mockImplementation(() => ({
      putMetricData: vi.fn().mockReturnValue({
        promise: vi.fn().mockResolvedValue({})
      })
    }))
  }));

  // Mock Redis
  vi.mock('ioredis', () => ({
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue('OK'),
      del: vi.fn().mockResolvedValue(1),
      exists: vi.fn().mockResolvedValue(0),
      expire: vi.fn().mockResolvedValue(1),
      incr: vi.fn().mockResolvedValue(1),
      ping: vi.fn().mockResolvedValue('PONG'),
      disconnect: vi.fn().mockResolvedValue(undefined)
    }))
  }));

  // Mock nodemailer
  vi.mock('nodemailer', () => ({
    createTransporter: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({
        messageId: 'test-message-id',
        response: '250 Message queued'
      })
    })
  }));

  // Mock fs operations
  vi.mock('fs/promises', () => ({
    readFile: vi.fn().mockResolvedValue('mock file content'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    stat: vi.fn().mockResolvedValue({
      isFile: () => true,
      isDirectory: () => false,
      size: 1024
    })
  }));

  // Mock Date for consistent test results
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  vi.setSystemTime(mockDate);
}

// Global test utilities
global.testUtils = {
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  mockApiResponse: (data: any, status = 200) => ({
    status,
    json: () => Promise.resolve(data),
    ok: status >= 200 && status < 300
  }),
  
  generateTestEmail: () => `test-${Date.now()}@example.com`,
  
  generateTestUser: () => ({
    email: global.testUtils.generateTestEmail(),
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User'
  }),
  
  mockFetch: (responseData: any, status = 200) => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(responseData),
      text: () => Promise.resolve(JSON.stringify(responseData))
    });
  }
};

// Type declaration for global test utilities
declare global {
  var testUtils: {
    waitFor: (ms: number) => Promise<void>;
    mockApiResponse: (data: any, status?: number) => any;
    generateTestEmail: () => string;
    generateTestUser: () => any;
    mockFetch: (responseData: any, status?: number) => void;
  };
}