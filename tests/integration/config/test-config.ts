import * as dotenv from 'dotenv';
import { join } from 'path';

// Load test environment variables
dotenv.config({ path: join(__dirname, '../.env.test') });

export interface TestConfig {
  services: {
    auth: {
      url: string;
      port: number;
    };
    project: {
      url: string;
      port: number;
    };
    ai: {
      url: string;
      port: number;
    };
    billing: {
      url: string;
      port: number;
    };
    notification: {
      url: string;
      port: number;
    };
  };
  databases: {
    postgres: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
    };
    redis: {
      host: string;
      port: number;
      password?: string;
    };
  };
  external: {
    stripe: {
      secretKey: string;
      publishableKey: string;
      webhookSecret: string;
    };
    sendgrid: {
      apiKey: string;
    };
    twilio: {
      accountSid: string;
      authToken: string;
    };
    openai: {
      apiKey: string;
    };
    anthropic: {
      apiKey: string;
    };
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  test: {
    timeout: number;
    retries: number;
    parallel: boolean;
    cleanup: boolean;
  };
}

export const testConfig: TestConfig = {
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      port: parseInt(process.env.AUTH_SERVICE_PORT || '3001', 10),
    },
    project: {
      url: process.env.PROJECT_SERVICE_URL || 'http://localhost:3002',
      port: parseInt(process.env.PROJECT_SERVICE_PORT || '3002', 10),
    },
    ai: {
      url: process.env.AI_SERVICE_URL || 'http://localhost:3003',
      port: parseInt(process.env.AI_SERVICE_PORT || '3003', 10),
    },
    billing: {
      url: process.env.BILLING_SERVICE_URL || 'http://localhost:3004',
      port: parseInt(process.env.BILLING_SERVICE_PORT || '3004', 10),
    },
    notification: {
      url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
      port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || '3005', 10),
    },
  },
  databases: {
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'zoptal_test',
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'password',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
  },
  external: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_mock',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock',
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || 'SG.mock.key',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || 'AC_mock_sid',
      authToken: process.env.TWILIO_AUTH_TOKEN || 'mock_token',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || 'sk-mock-key',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || 'mock-key',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'test-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  test: {
    timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
    retries: parseInt(process.env.TEST_RETRIES || '2', 10),
    parallel: process.env.TEST_PARALLEL === 'true',
    cleanup: process.env.TEST_CLEANUP !== 'false',
  },
};

export default testConfig;