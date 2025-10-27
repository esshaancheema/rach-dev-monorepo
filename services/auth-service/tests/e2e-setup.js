import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@zoptal/database';
import Redis from 'ioredis';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import supertest from 'supertest';
// Global test instances
let testApp;
let testPrisma;
let testRedis;
let testServer;
beforeAll(async () => {
    // Initialize test database
    testPrisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        log: ['error'],
    });
    // Initialize test Redis
    testRedis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryDelayOnFailover: 100,
        lazyConnect: true,
    });
    try {
        await testPrisma.$connect();
        await testRedis.connect();
        console.log('✅ E2E test database and Redis connected');
    }
    catch (error) {
        console.error('❌ E2E test database/Redis connection failed:', error);
        throw error;
    }
    // Build and start test server
    try {
        testApp = await buildApp();
        await testApp.listen({
            port: parseInt(process.env.PORT || '4002'),
            host: '127.0.0.1',
        });
        console.log(`✅ E2E test server started on port ${process.env.PORT || '4002'}`);
    }
    catch (error) {
        console.error('❌ Failed to start E2E test server:', error);
        throw error;
    }
});
beforeEach(async () => {
    // Clean up test data before each E2E test
    try {
        // Clean up in reverse dependency order
        await testPrisma.securityEvent.deleteMany();
        await testPrisma.loginAttempt.deleteMany();
        await testPrisma.verificationToken.deleteMany();
        await testPrisma.passwordReset.deleteMany();
        await testPrisma.refreshToken.deleteMany();
        await testPrisma.twoFactorAuth.deleteMany();
        await testPrisma.oAuthAccount.deleteMany();
        await testPrisma.user.deleteMany();
        await testPrisma.rateLimit.deleteMany();
        await testPrisma.oAuthState.deleteMany();
        // Clean up Redis
        await testRedis.flushdb();
        console.log('✅ E2E test data cleaned up');
    }
    catch (error) {
        console.warn('⚠️ E2E test cleanup failed:', error);
    }
});
afterEach(async () => {
    // Additional cleanup if needed
});
afterAll(async () => {
    console.log('🔄 Shutting down E2E test environment...');
    // Close test server
    if (testApp) {
        try {
            await testApp.close();
            console.log('✅ E2E test server closed');
        }
        catch (error) {
            console.error('❌ Error closing E2E test server:', error);
        }
    }
    // Close database connection
    if (testPrisma) {
        try {
            await testPrisma.$disconnect();
            console.log('✅ E2E test database disconnected');
        }
        catch (error) {
            console.error('❌ Error disconnecting E2E test database:', error);
        }
    }
    // Close Redis connection
    if (testRedis) {
        try {
            testRedis.disconnect();
            console.log('✅ E2E test Redis disconnected');
        }
        catch (error) {
            console.error('❌ Error disconnecting E2E test Redis:', error);
        }
    }
});
// Helper functions for E2E tests
export const e2eHelpers = {
    // Create test request client
    createClient: () => {
        if (!testApp)
            throw new Error('E2E test app not initialized');
        return supertest(testApp.server);
    },
    // Create test user with all necessary data
    createTestUser: async (overrides = {}) => {
        if (!testPrisma)
            throw new Error('E2E test database not initialized');
        const userData = {
            id: `e2e-user-${Date.now()}-${Math.random()}`,
            email: `e2e-test-${Date.now()}@example.com`,
            password: '$argon2id$v=19$m=65536,t=3,p=4$fake-hashed-password-for-e2e',
            firstName: 'E2E',
            lastName: 'TestUser',
            status: 'active',
            isEmailVerified: true,
            emailVerifiedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
        return testPrisma.user.create({ data: userData });
    },
    // Helper to register a user via API
    registerUser: async (userData) => {
        const client = e2eHelpers.createClient();
        return client
            .post('/api/auth/register')
            .send(userData)
            .expect(201);
    },
    // Helper to login a user via API
    loginUser: async (credentials) => {
        const client = e2eHelpers.createClient();
        return client
            .post('/api/auth/login')
            .send(credentials)
            .expect(200);
    },
    // Helper to get auth headers
    getAuthHeaders: (accessToken) => ({
        Authorization: `Bearer ${accessToken}`,
    }),
    // Wait for async operations
    waitMs: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    // Generate test email
    generateTestEmail: () => `e2e-test-${Date.now()}-${Math.random()}@example.com`,
    // Generate test phone
    generateTestPhone: () => `+1555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
};
// Export test instances for use in E2E tests
export { testApp, testPrisma, testRedis };
