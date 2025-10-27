import { chromium, FullConfig } from '@playwright/test';
import { startTestDatabase, stopTestDatabase } from './test-database';
import { startTestServices, stopTestServices } from './test-services';
import { seedTestData } from './test-data';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');

  // Start test database
  console.log('📊 Starting test database...');
  await startTestDatabase();

  // Start test services
  console.log('🔧 Starting test services...');
  await startTestServices();

  // Wait for services to be ready
  console.log('⏳ Waiting for services to be ready...');
  await waitForServices();

  // Seed test data
  console.log('🌱 Seeding test data...');
  await seedTestData();

  // Setup browser for E2E tests
  console.log('🌐 Setting up browser for E2E tests...');
  const browser = await chromium.launch();
  await browser.close();

  console.log('✅ Global test setup completed!');
}

async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');

  // Stop test services
  console.log('🛑 Stopping test services...');
  await stopTestServices();

  // Stop test database
  console.log('🗃️ Stopping test database...');
  await stopTestDatabase();

  console.log('✅ Global test teardown completed!');
}

async function waitForServices() {
  const services = [
    { name: 'auth-service', url: 'http://localhost:4000/health' },
    { name: 'project-service', url: 'http://localhost:4001/health' },
    { name: 'ai-service', url: 'http://localhost:4002/health' },
    { name: 'billing-service', url: 'http://localhost:4003/health' },
    { name: 'notification-service', url: 'http://localhost:4004/health' },
    { name: 'analytics-service', url: 'http://localhost:4005/health' },
  ];

  const maxRetries = 30;
  const retryDelay = 1000;

  for (const service of services) {
    let retries = 0;
    let isReady = false;

    while (retries < maxRetries && !isReady) {
      try {
        const response = await fetch(service.url);
        if (response.ok) {
          console.log(`✅ ${service.name} is ready`);
          isReady = true;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw new Error(`❌ ${service.name} failed to start after ${maxRetries} retries`);
        }
        console.log(`⏳ Waiting for ${service.name}... (${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
}

export default globalSetup;
export { globalTeardown };