import { execSync } from 'child_process';
import { testConfig } from '../config/test-config';

export default async function globalSetup(): Promise<void> {
  console.log('🚀 Starting global integration test setup...');

  try {
    // Check if we're running in CI or local environment
    const isCI = process.env.CI === 'true';
    const skipDockerSetup = process.env.SKIP_DOCKER_SETUP === 'true';

    if (!skipDockerSetup) {
      console.log('📦 Setting up test environment with Docker...');

      // Start test services using Docker Compose
      try {
        execSync('docker-compose -f docker-compose.test.yml up -d', {
          stdio: 'inherit',
          cwd: process.cwd(),
        });
        console.log('✅ Test services started with Docker Compose');
      } catch (error) {
        console.warn('⚠️  Docker Compose failed, attempting to start services individually...');
        
        // Fallback: start individual containers
        try {
          // Start PostgreSQL test database
          execSync(`docker run -d --name postgres-test -p ${testConfig.databases.postgres.port}:5432 ` +
                  `-e POSTGRES_DB=${testConfig.databases.postgres.database} ` +
                  `-e POSTGRES_USER=${testConfig.databases.postgres.username} ` +
                  `-e POSTGRES_PASSWORD=${testConfig.databases.postgres.password} ` +
                  'postgres:15', { stdio: 'inherit' });

          // Start Redis test instance
          execSync(`docker run -d --name redis-test -p ${testConfig.databases.redis.port}:6379 ` +
                  'redis:7-alpine', { stdio: 'inherit' });

          console.log('✅ Individual test containers started');
        } catch (fallbackError) {
          console.warn('⚠️  Docker setup failed, assuming services are already running...');
        }
      }
    }

    // Wait for services to be ready
    console.log('⏳ Waiting for services to be ready...');
    
    // Give services time to start up
    await new Promise(resolve => setTimeout(resolve, 10000));

    console.log('✅ Global integration test setup completed');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    
    // Don't fail setup in CI if services are managed externally
    if (!process.env.CI) {
      throw error;
    }
  }
}

// Helper function to check if Docker is available
function isDockerAvailable(): boolean {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Helper function to check if service is running
async function isServiceRunning(url: string, timeout: number = 5000): Promise<boolean> {
  try {
    const response = await fetch(`${url}/health`, {
      signal: AbortSignal.timeout(timeout),
    });
    return response.ok;
  } catch {
    return false;
  }
}