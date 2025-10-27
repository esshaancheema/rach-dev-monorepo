import { execSync } from 'child_process';

export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting global integration test teardown...');

  try {
    const skipDockerTeardown = process.env.SKIP_DOCKER_TEARDOWN === 'true';
    const isCI = process.env.CI === 'true';

    if (!skipDockerTeardown && !isCI) {
      console.log('🐳 Stopping test Docker containers...');

      try {
        // Stop Docker Compose services
        execSync('docker-compose -f docker-compose.test.yml down -v', {
          stdio: 'inherit',
          cwd: process.cwd(),
        });
        console.log('✅ Docker Compose services stopped');
      } catch (error) {
        console.warn('⚠️  Docker Compose teardown failed, stopping individual containers...');
        
        // Fallback: stop individual containers
        const containers = ['postgres-test', 'redis-test'];
        
        for (const container of containers) {
          try {
            execSync(`docker stop ${container}`, { stdio: 'ignore' });
            execSync(`docker rm ${container}`, { stdio: 'ignore' });
            console.log(`✅ Stopped and removed ${container}`);
          } catch (containerError) {
            console.warn(`⚠️  Failed to stop container ${container}`);
          }
        }
      }
    }

    // Clean up any test artifacts
    console.log('🗑️  Cleaning up test artifacts...');
    
    // Remove any temporary test files
    try {
      execSync('rm -rf /tmp/zoptal-test-*', { stdio: 'ignore' });
    } catch {
      // Ignore cleanup errors
    }

    console.log('✅ Global integration test teardown completed');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't fail teardown - just log the error
  }
}