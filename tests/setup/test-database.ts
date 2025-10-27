import { spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import Redis from 'ioredis';
import { Client as PostgresClient } from 'pg';

const execAsync = promisify(exec);

let postgresProcess: ChildProcess | null = null;
let redisProcess: ChildProcess | null = null;

export async function startTestDatabase() {
  console.log('Starting test PostgreSQL...');
  await startPostgres();
  
  console.log('Starting test Redis...');
  await startRedis();
  
  console.log('Waiting for databases to be ready...');
  await waitForDatabases();
  
  console.log('Setting up test database schema...');
  await setupDatabase();
}

export async function stopTestDatabase() {
  if (postgresProcess) {
    console.log('Stopping test PostgreSQL...');
    postgresProcess.kill('SIGTERM');
    postgresProcess = null;
  }
  
  if (redisProcess) {
    console.log('Stopping test Redis...');
    redisProcess.kill('SIGTERM');
    redisProcess = null;
  }
}

async function startPostgres() {
  try {
    // Check if PostgreSQL is already running
    const { stdout } = await execAsync('pg_isready -h localhost -p 5433');
    if (stdout.includes('accepting connections')) {
      console.log('PostgreSQL test instance already running');
      return;
    }
  } catch (error) {
    // PostgreSQL is not running, start it
  }

  // Start PostgreSQL in a temporary directory
  const tempDir = '/tmp/zoptal-test-postgres';
  
  try {
    await execAsync(`rm -rf ${tempDir}`);
    await execAsync(`mkdir -p ${tempDir}`);
    await execAsync(`initdb -D ${tempDir} --auth-local=trust --auth-host=trust`);
  } catch (error) {
    console.error('Failed to initialize PostgreSQL:', error);
    throw error;
  }

  postgresProcess = spawn('postgres', [
    '-D', tempDir,
    '-p', '5433',
    '-k', tempDir,
    '-F' // Run in foreground
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  postgresProcess.stdout?.on('data', (data) => {
    console.log(`PostgreSQL: ${data}`);
  });

  postgresProcess.stderr?.on('data', (data) => {
    console.error(`PostgreSQL Error: ${data}`);
  });
}

async function startRedis() {
  try {
    // Check if Redis is already running
    const redis = new Redis({ host: 'localhost', port: 6380, lazyConnect: true });
    await redis.ping();
    console.log('Redis test instance already running');
    redis.disconnect();
    return;
  } catch (error) {
    // Redis is not running, start it
  }

  redisProcess = spawn('redis-server', [
    '--port', '6380',
    '--save', '', // Disable persistence
    '--appendonly', 'no'
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  redisProcess.stdout?.on('data', (data) => {
    console.log(`Redis: ${data}`);
  });

  redisProcess.stderr?.on('data', (data) => {
    console.error(`Redis Error: ${data}`);
  });
}

async function waitForDatabases() {
  // Wait for PostgreSQL
  let postgresReady = false;
  let retries = 0;
  const maxRetries = 30;

  while (!postgresReady && retries < maxRetries) {
    try {
      const client = new PostgresClient({
        host: 'localhost',
        port: 5433,
        user: process.env.USER || 'postgres',
        database: 'postgres'
      });
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      postgresReady = true;
      console.log('✅ PostgreSQL is ready');
    } catch (error) {
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!postgresReady) {
    throw new Error('PostgreSQL failed to start');
  }

  // Wait for Redis
  let redisReady = false;
  retries = 0;

  while (!redisReady && retries < maxRetries) {
    try {
      const redis = new Redis({ host: 'localhost', port: 6380 });
      await redis.ping();
      redis.disconnect();
      redisReady = true;
      console.log('✅ Redis is ready');
    } catch (error) {
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!redisReady) {
    throw new Error('Redis failed to start');
  }
}

async function setupDatabase() {
  const client = new PostgresClient({
    host: 'localhost',
    port: 5433,
    user: process.env.USER || 'postgres',
    database: 'postgres'
  });

  try {
    await client.connect();
    
    // Create test database
    await client.query('DROP DATABASE IF EXISTS zoptal_test');
    await client.query('CREATE DATABASE zoptal_test');
    
    await client.end();

    // Connect to test database and run migrations
    const testClient = new PostgresClient({
      host: 'localhost',
      port: 5433,
      user: process.env.USER || 'postgres',
      database: 'zoptal_test'
    });

    await testClient.connect();
    
    // Run database migrations
    await runMigrations(testClient);
    
    await testClient.end();
    
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

async function runMigrations(client: PostgresClient) {
  // Create users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      avatar_url TEXT,
      email_verified BOOLEAN DEFAULT FALSE,
      phone_verified BOOLEAN DEFAULT FALSE,
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login_at TIMESTAMP WITH TIME ZONE
    )
  `);

  // Create projects table
  await client.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  // Create api_keys table
  await client.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key_hash VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      permissions JSONB DEFAULT '[]',
      last_used_at TIMESTAMP WITH TIME ZONE,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  // Create subscriptions table
  await client.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_subscription_id VARCHAR(255) UNIQUE,
      plan_id VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL,
      current_period_start TIMESTAMP WITH TIME ZONE,
      current_period_end TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  // Create usage_metrics table
  await client.query(`
    CREATE TABLE IF NOT EXISTS usage_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      metric_type VARCHAR(100) NOT NULL,
      value BIGINT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  console.log('✅ Database migrations completed');
}