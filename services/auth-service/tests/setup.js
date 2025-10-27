import { vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@zoptal/database';
import Redis from 'ioredis';
// Mock external services for unit/integration tests
vi.mock('@sendgrid/mail', () => ({
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ statusCode: 202 }]),
}));
vi.mock('twilio', () => ({
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
        messages: {
            create: vi.fn().mockResolvedValue({
                sid: 'test-message-sid',
                status: 'sent',
            }),
        },
    })),
}));
vi.mock('googleapis', () => ({
    google: {
        auth: {
            OAuth2: vi.fn().mockImplementation(() => ({
                generateAuthUrl: vi.fn().mockReturnValue('https://test-oauth-url.com'),
                getToken: vi.fn().mockResolvedValue({
                    tokens: {
                        access_token: 'test-access-token',
                        refresh_token: 'test-refresh-token',
                    },
                }),
                setCredentials: vi.fn(),
            })),
        },
        oauth2: vi.fn().mockImplementation(() => ({
            userinfo: {
                get: vi.fn().mockResolvedValue({
                    data: {
                        id: 'test-google-id',
                        email: 'test@example.com',
                        name: 'Test User',
                        picture: 'https://test-avatar.com/avatar.jpg',
                        verified_email: true,
                    },
                }),
            },
        })),
    },
}));
vi.mock('@octokit/rest', () => ({
    Octokit: vi.fn().mockImplementation(() => ({
        request: vi.fn().mockImplementation((endpoint) => {
            if (endpoint.includes('user')) {
                return Promise.resolve({
                    data: {
                        id: 123456,
                        login: 'testuser',
                        email: 'test@example.com',
                        name: 'Test User',
                        avatar_url: 'https://test-avatar.com/avatar.jpg',
                    },
                });
            }
            return Promise.resolve({ data: {} });
        }),
    })),
}));
// Global test database instance
let testPrisma;
let testRedis;
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
    }
    catch (error) {
        console.warn('Test database/Redis connection failed:', error);
    }
});
beforeEach(async () => {
    // Clean up test data before each test
    if (testPrisma) {
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
        }
        catch (error) {
            console.warn('Database cleanup failed:', error);
        }
    }
    // Clean up Redis test data
    if (testRedis?.status === 'ready') {
        try {
            await testRedis.flushdb();
        }
        catch (error) {
            console.warn('Redis cleanup failed:', error);
        }
    }
    // Reset all mocks
    vi.clearAllMocks();
});
afterEach(() => {
    // Reset mocks after each test
    vi.clearAllMocks();
});
afterAll(async () => {
    // Clean up connections
    if (testPrisma) {
        await testPrisma.$disconnect();
    }
    if (testRedis) {
        testRedis.disconnect();
    }
});
// Helper functions for tests
export const testHelpers = {
    createTestUser: async (overrides = {}) => {
        if (!testPrisma)
            throw new Error('Test database not initialized');
        return testPrisma.user.create({
            data: {
                id: `test-user-${Date.now()}-${Math.random()}`,
                email: `test-${Date.now()}@example.com`,
                password: '$argon2id$v=19$m=65536,t=3,p=4$fake-hashed-password',
                firstName: 'Test',
                lastName: 'User',
                status: 'active',
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                ...overrides,
            },
        });
    },
    createTestRefreshToken: async (userId, overrides = {}) => {
        if (!testPrisma)
            throw new Error('Test database not initialized');
        return testPrisma.refreshToken.create({
            data: {
                id: `test-token-${Date.now()}-${Math.random()}`,
                token: `test-refresh-token-${Date.now()}-${Math.random()}`,
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                createdAt: new Date(),
                updatedAt: new Date(),
                ...overrides,
            },
        });
    },
    createTestOAuthAccount: async (userId, provider, overrides = {}) => {
        if (!testPrisma)
            throw new Error('Test database not initialized');
        return testPrisma.oAuthAccount.create({
            data: {
                id: `test-oauth-${Date.now()}-${Math.random()}`,
                userId,
                provider,
                providerId: `test-${provider}-id-${Date.now()}`,
                email: `test-${provider}@example.com`,
                name: `Test ${provider} User`,
                createdAt: new Date(),
                updatedAt: new Date(),
                ...overrides,
            },
        });
    },
    waitMs: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};
// Export test instances for use in tests
export { testPrisma, testRedis };
