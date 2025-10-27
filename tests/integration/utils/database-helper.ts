import { Pool, PoolClient } from 'pg';
import { createClient, RedisClientType } from 'redis';
import { testConfig } from '../config/test-config';

// PostgreSQL Helper
export class PostgresHelper {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: testConfig.databases.postgres.host,
      port: testConfig.databases.postgres.port,
      database: testConfig.databases.postgres.database,
      user: testConfig.databases.postgres.username,
      password: testConfig.databases.postgres.password,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async queryOne(text: string, params?: any[]): Promise<any> {
    const rows = await this.query(text, params);
    return rows[0] || null;
  }

  async truncateAllTables(): Promise<void> {
    const client = await this.getClient();
    try {
      // Get all table names
      const tables = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `);

      // Disable foreign key checks and truncate all tables
      await client.query('SET FOREIGN_KEY_CHECKS = 0');
      
      for (const table of tables.rows) {
        await client.query(`TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE`);
      }
      
      await client.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      client.release();
    }
  }

  async seedUsers(count: number = 5): Promise<any[]> {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = {
        id: `user_${i + 1}`,
        email: `test${i + 1}@example.com`,
        name: `Test User ${i + 1}`,
        password_hash: '$2b$10$test.hash.for.password',
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      await this.query(
        `INSERT INTO users (id, email, name, password_hash, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, user.email, user.name, user.password_hash, user.created_at, user.updated_at]
      );
      
      users.push(user);
    }
    return users;
  }

  async seedProjects(userId: string, count: number = 3): Promise<any[]> {
    const projects = [];
    for (let i = 0; i < count; i++) {
      const project = {
        id: `project_${userId}_${i + 1}`,
        name: `Test Project ${i + 1}`,
        description: `Description for test project ${i + 1}`,
        owner_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      };
      
      await this.query(
        `INSERT INTO projects (id, name, description, owner_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [project.id, project.name, project.description, project.owner_id, project.created_at, project.updated_at]
      );
      
      projects.push(project);
    }
    return projects;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Redis Helper
export class RedisHelper {
  private client: RedisClientType;

  constructor() {
    const redisUrl = `redis://${testConfig.databases.redis.host}:${testConfig.databases.redis.port}`;
    this.client = createClient({
      url: redisUrl,
      password: testConfig.databases.redis.password,
    });
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    await this.connect();
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    await this.connect();
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.connect();
    await this.client.del(key);
  }

  async flushAll(): Promise<void> {
    await this.connect();
    await this.client.flushAll();
  }

  async keys(pattern: string): Promise<string[]> {
    await this.connect();
    return this.client.keys(pattern);
  }

  async seedCache(): Promise<void> {
    await this.connect();
    
    // Seed some test cache data
    await this.set('test:config:feature_flags', JSON.stringify({
      new_ui: true,
      ai_assistant: true,
      billing_v2: false,
    }));

    await this.set('test:user:session:user_1', JSON.stringify({
      userId: 'user_1',
      email: 'test1@example.com',
      loginTime: new Date().toISOString(),
    }), 3600);
  }
}

// Database setup and teardown helpers
export const setupDatabases = async (): Promise<{ postgres: PostgresHelper, redis: RedisHelper }> => {
  const postgres = new PostgresHelper();
  const redis = new RedisHelper();

  // Connect to Redis
  await redis.connect();

  // Clean and seed databases
  await postgres.truncateAllTables();
  await redis.flushAll();

  // Seed test data
  const users = await postgres.seedUsers(5);
  for (const user of users) {
    await postgres.seedProjects(user.id, 3);
  }
  await redis.seedCache();

  return { postgres, redis };
};

export const teardownDatabases = async (postgres: PostgresHelper, redis: RedisHelper): Promise<void> => {
  if (testConfig.test.cleanup) {
    await postgres.truncateAllTables();
    await redis.flushAll();
  }
  
  await postgres.close();
  await redis.disconnect();
};

// Helper to wait for database connections
export const waitForDatabases = async (): Promise<void> => {
  const postgres = new PostgresHelper();
  const redis = new RedisHelper();

  const maxRetries = 30;
  const retryDelay = 1000;

  // Wait for PostgreSQL
  for (let i = 0; i < maxRetries; i++) {
    try {
      await postgres.query('SELECT 1');
      break;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error('PostgreSQL not ready');
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // Wait for Redis
  for (let i = 0; i < maxRetries; i++) {
    try {
      await redis.connect();
      await redis.client.ping();
      break;
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error('Redis not ready');
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  await postgres.close();
  await redis.disconnect();

  console.log('Databases are ready');
};