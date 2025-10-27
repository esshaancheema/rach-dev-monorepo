import { PrismaClient } from '@zoptal/database';
import Redis from 'ioredis';
import { FastifyInstance } from 'fastify';
declare let testApp: FastifyInstance;
declare let testPrisma: PrismaClient;
declare let testRedis: Redis;
export declare const e2eHelpers: {
    createClient: () => any;
    createTestUser: (overrides?: Partial<any>) => Promise<{
        status: import("@zoptal/database").$Enums.UserStatus;
        email: string;
        password: string | null;
        phone: string | null;
        id: string;
        createdAt: Date;
        role: import("@zoptal/database").$Enums.UserRole;
        lastLoginAt: Date | null;
        updatedAt: Date;
        name: string | null;
        country: string | null;
        city: string | null;
        timezone: string | null;
        language: string;
        emailVerified: Date | null;
        phoneVerified: Date | null;
        image: string | null;
        company: string | null;
        industry: string | null;
        subscriptionTier: import("@zoptal/database").$Enums.SubscriptionTier;
        subscriptionEnd: Date | null;
        aiCredits: number;
    }>;
    registerUser: (userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
    }) => Promise<any>;
    loginUser: (credentials: {
        email: string;
        password: string;
    }) => Promise<any>;
    getAuthHeaders: (accessToken: string) => {
        Authorization: string;
    };
    waitMs: (ms: number) => Promise<unknown>;
    generateTestEmail: () => string;
    generateTestPhone: () => string;
};
export { testApp, testPrisma, testRedis };
//# sourceMappingURL=e2e-setup.d.ts.map