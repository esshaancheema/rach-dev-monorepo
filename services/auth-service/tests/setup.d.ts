import { PrismaClient } from '@zoptal/database';
import Redis from 'ioredis';
declare let testPrisma: PrismaClient;
declare let testRedis: Redis;
export declare const testHelpers: {
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
    createTestRefreshToken: (userId: string, overrides?: Partial<any>) => Promise<{
        deviceId: string | null;
        token: string;
        id: string;
        userId: string;
        userAgent: string | null;
        ipAddress: string | null;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
        revokedAt: Date | null;
    }>;
    createTestOAuthAccount: (userId: string, provider: string, overrides?: Partial<any>) => Promise<any>;
    waitMs: (ms: number) => Promise<unknown>;
};
export { testPrisma, testRedis };
//# sourceMappingURL=setup.d.ts.map