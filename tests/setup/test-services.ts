import { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';

const execAsync = promisify(exec);

interface ServiceProcess {
  name: string;
  process: ChildProcess | null;
  port: number;
  cwd: string;
}

const services: ServiceProcess[] = [
  {
    name: 'auth-service',
    process: null,
    port: 4000,
    cwd: path.join(process.cwd(), 'services/auth-service')
  },
  {
    name: 'project-service',
    process: null,
    port: 4001,
    cwd: path.join(process.cwd(), 'services/project-service')
  },
  {
    name: 'ai-service',
    process: null,
    port: 4002,
    cwd: path.join(process.cwd(), 'services/ai-service')
  },
  {
    name: 'billing-service',
    process: null,
    port: 4003,
    cwd: path.join(process.cwd(), 'services/billing-service')
  },
  {
    name: 'notification-service',
    process: null,
    port: 4004,
    cwd: path.join(process.cwd(), 'services/notification-service')
  },
  {
    name: 'analytics-service',
    process: null,
    port: 4005,
    cwd: path.join(process.cwd(), 'services/analytics-service')
  }
];

const frontendApps: ServiceProcess[] = [
  {
    name: 'web-main',
    process: null,
    port: 3000,
    cwd: path.join(process.cwd(), 'apps/web-main')
  },
  {
    name: 'admin',
    process: null,
    port: 3002,
    cwd: path.join(process.cwd(), 'apps/admin')
  },
  {
    name: 'developer-portal',
    process: null,
    port: 3003,
    cwd: path.join(process.cwd(), 'apps/developer-portal')
  }
];

export async function startTestServices() {
  console.log('Building services...');
  await buildServices();
  
  console.log('Starting backend services...');
  await startBackendServices();
  
  console.log('Starting frontend applications...');
  await startFrontendServices();
}

export async function stopTestServices() {
  console.log('Stopping all test services...');
  
  // Stop backend services
  for (const service of services) {
    if (service.process) {
      console.log(`Stopping ${service.name}...`);
      service.process.kill('SIGTERM');
      service.process = null;
    }
  }
  
  // Stop frontend apps
  for (const app of frontendApps) {
    if (app.process) {
      console.log(`Stopping ${app.name}...`);
      app.process.kill('SIGTERM');
      app.process = null;
    }
  }
}

async function buildServices() {
  try {
    // Install dependencies if not already installed
    console.log('Installing dependencies...');
    await execAsync('pnpm install', { cwd: process.cwd() });
    
    // Build packages
    console.log('Building packages...');
    await execAsync('pnpm build:packages', { cwd: process.cwd() });
    
    // Build services
    console.log('Building services...');
    for (const service of services) {
      console.log(`Building ${service.name}...`);
      await execAsync('pnpm build', { cwd: service.cwd });
    }
    
    console.log('✅ All services built successfully');
  } catch (error) {
    console.error('Failed to build services:', error);
    throw error;
  }
}

async function startBackendServices() {
  const testEnv = {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://postgres@localhost:5433/zoptal_test',
    REDIS_URL: 'redis://localhost:6380',
    JWT_SECRET: 'test-jwt-secret-key-change-in-production',
    // API Keys for testing (use test keys)
    OPENAI_API_KEY: 'test-openai-key',
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    GOOGLE_AI_API_KEY: 'test-google-key',
    STRIPE_SECRET_KEY: 'sk_test_test',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
    SENDGRID_API_KEY: 'SG.test',
    TWILIO_ACCOUNT_SID: 'test_sid',
    TWILIO_AUTH_TOKEN: 'test_token',
    ...process.env
  };

  for (const service of services) {
    console.log(`Starting ${service.name} on port ${service.port}...`);
    
    service.process = spawn('node', ['dist/app.js'], {
      cwd: service.cwd,
      env: {
        ...testEnv,
        PORT: service.port.toString()
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Log service output for debugging
    service.process.stdout?.on('data', (data) => {
      console.log(`[${service.name}] ${data}`);
    });

    service.process.stderr?.on('data', (data) => {
      console.error(`[${service.name} ERROR] ${data}`);
    });

    service.process.on('exit', (code) => {
      if (code !== 0) {
        console.error(`${service.name} exited with code ${code}`);
      }
    });
  }
}

async function startFrontendServices() {
  const testEnv = {
    NODE_ENV: 'test',
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:4000',
    NEXT_PUBLIC_AUTH_SERVICE_URL: 'http://localhost:4000',
    NEXT_PUBLIC_PROJECT_SERVICE_URL: 'http://localhost:4001',
    NEXT_PUBLIC_AI_SERVICE_URL: 'http://localhost:4002',
    NEXT_PUBLIC_BILLING_SERVICE_URL: 'http://localhost:4003',
    NEXT_PUBLIC_NOTIFICATION_SERVICE_URL: 'http://localhost:4004',
    NEXT_PUBLIC_ANALYTICS_SERVICE_URL: 'http://localhost:4005',
    ...process.env
  };

  for (const app of frontendApps) {
    console.log(`Starting ${app.name} on port ${app.port}...`);
    
    // Build the app first
    try {
      await execAsync('pnpm build', { 
        cwd: app.cwd,
        env: testEnv
      });
    } catch (error) {
      console.error(`Failed to build ${app.name}:`, error);
      continue;
    }
    
    app.process = spawn('pnpm', ['start'], {
      cwd: app.cwd,
      env: {
        ...testEnv,
        PORT: app.port.toString()
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Log app output for debugging
    app.process.stdout?.on('data', (data) => {
      console.log(`[${app.name}] ${data}`);
    });

    app.process.stderr?.on('data', (data) => {
      console.error(`[${app.name} ERROR] ${data}`);
    });

    app.process.on('exit', (code) => {
      if (code !== 0) {
        console.error(`${app.name} exited with code ${code}`);
      }
    });
  }
}

export function getServiceUrl(serviceName: string): string {
  const service = services.find(s => s.name === serviceName);
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }
  return `http://localhost:${service.port}`;
}

export function getAppUrl(appName: string): string {
  const app = frontendApps.find(a => a.name === appName);
  if (!app) {
    throw new Error(`Unknown app: ${appName}`);
  }
  return `http://localhost:${app.port}`;
}