import { Client as PostgresClient } from 'pg';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  role?: 'user' | 'admin';
}

interface TestProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
}

interface TestApiKey {
  id: string;
  name: string;
  key: string;
  projectId: string;
}

export const testUsers: TestUser[] = [
  {
    id: uuidv4(),
    email: 'john.doe@test.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    emailVerified: true,
    role: 'user'
  },
  {
    id: uuidv4(),
    email: 'jane.smith@test.com',
    password: 'password456',
    firstName: 'Jane',
    lastName: 'Smith',
    emailVerified: true,
    role: 'user'
  },
  {
    id: uuidv4(),
    email: 'admin@test.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    emailVerified: true,
    role: 'admin'
  },
  {
    id: uuidv4(),
    email: 'unverified@test.com',
    password: 'password789',
    firstName: 'Unverified',
    lastName: 'User',
    emailVerified: false,
    role: 'user'
  }
];

export const testProjects: TestProject[] = [
  {
    id: uuidv4(),
    name: 'Test Project 1',
    description: 'A test project for e2e testing',
    ownerId: testUsers[0].id
  },
  {
    id: uuidv4(),
    name: 'AI Assistant Project',
    description: 'Project for testing AI functionality',
    ownerId: testUsers[1].id
  },
  {
    id: uuidv4(),
    name: 'Analytics Project',
    description: 'Project for testing analytics features',
    ownerId: testUsers[0].id
  }
];

export const testApiKeys: TestApiKey[] = [
  {
    id: uuidv4(),
    name: 'Test API Key 1',
    key: 'zpt_test_' + Math.random().toString(36).substring(7),
    projectId: testProjects[0].id
  },
  {
    id: uuidv4(),
    name: 'AI Service Key',
    key: 'zpt_test_' + Math.random().toString(36).substring(7),
    projectId: testProjects[1].id
  }
];

export async function seedTestData() {
  const client = new PostgresClient({
    host: 'localhost',
    port: 5433,
    user: process.env.USER || 'postgres',
    database: 'zoptal_test'
  });

  try {
    await client.connect();
    
    console.log('Clearing existing test data...');
    await clearTestData(client);
    
    console.log('Seeding test users...');
    await seedUsers(client);
    
    console.log('Seeding test projects...');
    await seedProjects(client);
    
    console.log('Seeding test API keys...');
    await seedApiKeys(client);
    
    console.log('Seeding test subscriptions...');
    await seedSubscriptions(client);
    
    console.log('Seeding test usage metrics...');
    await seedUsageMetrics(client);
    
    await client.end();
    
    console.log('✅ Test data seeded successfully');
  } catch (error) {
    console.error('Failed to seed test data:', error);
    throw error;
  }
}

async function clearTestData(client: PostgresClient) {
  // Clear in reverse order of dependencies
  await client.query('DELETE FROM usage_metrics');
  await client.query('DELETE FROM api_keys');
  await client.query('DELETE FROM subscriptions');
  await client.query('DELETE FROM projects');
  await client.query('DELETE FROM users');
}

async function seedUsers(client: PostgresClient) {
  for (const user of testUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    
    await client.query(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      user.id,
      user.email,
      passwordHash,
      user.firstName,
      user.lastName,
      user.emailVerified
    ]);
  }
}

async function seedProjects(client: PostgresClient) {
  for (const project of testProjects) {
    await client.query(`
      INSERT INTO projects (
        id, name, description, owner_id, settings
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      project.id,
      project.name,
      project.description,
      project.ownerId,
      JSON.stringify({
        allowedOrigins: ['http://localhost:3000'],
        rateLimit: { requests: 1000, window: 3600 }
      })
    ]);
  }
}

async function seedApiKeys(client: PostgresClient) {
  for (const apiKey of testApiKeys) {
    // Hash the API key for storage
    const keyHash = await bcrypt.hash(apiKey.key, 10);
    
    await client.query(`
      INSERT INTO api_keys (
        id, key_hash, name, project_id, permissions
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      apiKey.id,
      keyHash,
      apiKey.name,
      apiKey.projectId,
      JSON.stringify(['read', 'write'])
    ]);
  }
}

async function seedSubscriptions(client: PostgresClient) {
  // Create test subscriptions
  const subscriptions = [
    {
      id: uuidv4(),
      userId: testUsers[0].id,
      stripeSubscriptionId: 'sub_test_1',
      planId: 'pro',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    {
      id: uuidv4(),
      userId: testUsers[1].id,
      stripeSubscriptionId: 'sub_test_2',
      planId: 'starter',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const subscription of subscriptions) {
    await client.query(`
      INSERT INTO subscriptions (
        id, user_id, stripe_subscription_id, plan_id, status,
        current_period_start, current_period_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      subscription.id,
      subscription.userId,
      subscription.stripeSubscriptionId,
      subscription.planId,
      subscription.status,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd
    ]);
  }
}

async function seedUsageMetrics(client: PostgresClient) {
  // Create sample usage metrics
  const metrics = [
    {
      id: uuidv4(),
      userId: testUsers[0].id,
      projectId: testProjects[0].id,
      metricType: 'api_requests',
      value: 150,
      metadata: { method: 'GET', endpoint: '/api/projects' }
    },
    {
      id: uuidv4(),
      userId: testUsers[0].id,
      projectId: testProjects[0].id,
      metricType: 'ai_requests',
      value: 25,
      metadata: { model: 'gpt-4', tokens: 1000 }
    },
    {
      id: uuidv4(),
      userId: testUsers[1].id,
      projectId: testProjects[1].id,
      metricType: 'api_requests',
      value: 75,
      metadata: { method: 'POST', endpoint: '/api/ai/chat' }
    }
  ];

  for (const metric of metrics) {
    await client.query(`
      INSERT INTO usage_metrics (
        id, user_id, project_id, metric_type, value, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      metric.id,
      metric.userId,
      metric.projectId,
      metric.metricType,
      metric.value,
      JSON.stringify(metric.metadata)
    ]);
  }
}

export async function createTestUser(userData: Partial<TestUser> = {}) {
  const user: TestUser = {
    id: uuidv4(),
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    ...userData
  };

  const client = new PostgresClient({
    host: 'localhost',
    port: 5433,
    user: process.env.USER || 'postgres',
    database: 'zoptal_test'
  });

  try {
    await client.connect();
    
    const passwordHash = await bcrypt.hash(user.password, 10);
    
    await client.query(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      user.id,
      user.email,
      passwordHash,
      user.firstName,
      user.lastName,
      user.emailVerified
    ]);
    
    await client.end();
    
    return user;
  } catch (error) {
    await client.end();
    throw error;
  }
}

export async function createTestProject(projectData: Partial<TestProject> = {}) {
  const project: TestProject = {
    id: uuidv4(),
    name: `Test Project ${Date.now()}`,
    description: 'A test project',
    ownerId: testUsers[0].id,
    ...projectData
  };

  const client = new PostgresClient({
    host: 'localhost',
    port: 5433,
    user: process.env.USER || 'postgres',
    database: 'zoptal_test'
  });

  try {
    await client.connect();
    
    await client.query(`
      INSERT INTO projects (
        id, name, description, owner_id, settings
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      project.id,
      project.name,
      project.description,
      project.ownerId,
      JSON.stringify({})
    ]);
    
    await client.end();
    
    return project;
  } catch (error) {
    await client.end();
    throw error;
  }
}

// Export test data for use in tests
export { testUsers, testProjects, testApiKeys };