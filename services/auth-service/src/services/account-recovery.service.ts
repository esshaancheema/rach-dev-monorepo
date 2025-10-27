import { PrismaClient, User } from '@zoptal/database';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface RecoveryChallenge {
  id: string;
  type: 'email' | 'phone' | 'security_questions' | 'admin_override';
  target?: string;
  questions?: string[];
  code?: string;
  expiresAt: Date;
}

export interface RecoverySession {
  id: string;
  userId: string;
  challenges: RecoveryChallenge[];
  completedChallenges: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  metadata: Record<string, any>;
  expiresAt: Date;
}

export interface AccountRecoveryOptions {
  prisma: PrismaClient;
}

export class AccountRecoveryService {
  constructor(private options: AccountRecoveryOptions) {}

  async initiateRecovery(identifier: string, recoveryType: 'email' | 'username'): Promise<RecoverySession> {
    try {
      const user = recoveryType === 'email' 
        ? await this.options.prisma.user.findUnique({ where: { email: identifier } })
        : await this.options.prisma.user.findFirst({ 
            where: { 
              OR: [
                { username: identifier },
                { email: identifier }
              ]
            }
          });

      if (!user) {
        logger.info(`Account recovery initiated for non-existent user: ${identifier}`);
        return this.createDummySession();
      }

      const sessionId = crypto.randomBytes(32).toString('hex');
      const challenges = await this.generateRecoveryChallenges(user);

      const session: RecoverySession = {
        id: sessionId,
        userId: user.id,
        challenges,
        completedChallenges: [],
        status: 'pending',
        metadata: {
          initiatedAt: new Date(),
          clientIP: null,
          userAgent: null
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      await this.storeRecoverySession(session);

      logger.info(`Account recovery session created for user: ${user.id}`, {
        sessionId,
        challengeTypes: challenges.map(c => c.type)
      });

      return session;

    } catch (error) {
      logger.error('Error initiating account recovery:', error);
      throw new Error('Failed to initiate account recovery');
    }
  }

  async getRecoverySession(sessionId: string): Promise<RecoverySession | null> {
    try {
      const session = await this.retrieveRecoverySession(sessionId);
      
      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      return session;

    } catch (error) {
      logger.error('Error retrieving recovery session:', error);
      return null;
    }
  }

  async submitChallenge(
    sessionId: string, 
    challengeId: string, 
    response: Record<string, any>
  ): Promise<{ success: boolean; nextChallenge?: RecoveryChallenge; completed?: boolean }> {
    try {
      const session = await this.getRecoverySession(sessionId);
      
      if (!session) {
        return { success: false };
      }

      const challenge = session.challenges.find(c => c.id === challengeId);
      
      if (!challenge || session.completedChallenges.includes(challengeId)) {
        return { success: false };
      }

      const isValid = await this.validateChallenge(challenge, response);
      
      if (!isValid) {
        await this.recordFailedAttempt(sessionId, challengeId);
        return { success: false };
      }

      session.completedChallenges.push(challengeId);
      session.status = 'in_progress';

      const requiredChallenges = session.challenges.filter(c => 
        c.type !== 'admin_override'
      ).length;

      const completed = session.completedChallenges.length >= Math.min(2, requiredChallenges);

      if (completed) {
        session.status = 'completed';
        await this.logRecoverySuccess(session);
      }

      await this.updateRecoverySession(session);

      const nextChallenge = !completed ? 
        session.challenges.find(c => !session.completedChallenges.includes(c.id)) :
        undefined;

      return { success: true, nextChallenge, completed };

    } catch (error) {
      logger.error('Error submitting challenge:', error);
      return { success: false };
    }
  }

  async generateTemporaryAccessToken(sessionId: string): Promise<string | null> {
    try {
      const session = await this.getRecoverySession(sessionId);
      
      if (!session || session.status !== 'completed') {
        return null;
      }

      const token = crypto.randomBytes(32).toString('hex');
      
      await this.options.prisma.verificationToken.create({
        data: {
          type: 'ACCOUNT_RECOVERY' as any,
          token,
          value: session.userId,
          userId: session.userId,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
          ipAddress: session.metadata.clientIP,
          userAgent: session.metadata.userAgent
        }
      });

      logger.info(`Temporary access token generated for recovery session: ${sessionId}`);

      return token;

    } catch (error) {
      logger.error('Error generating temporary access token:', error);
      return null;
    }
  }

  async adminOverride(
    adminUserId: string, 
    targetUserId: string, 
    reason: string
  ): Promise<string | null> {
    try {
      const admin = await this.options.prisma.user.findUnique({
        where: { id: adminUserId }
      });

      if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
        throw new Error('Insufficient privileges for admin override');
      }

      const targetUser = await this.options.prisma.user.findUnique({
        where: { id: targetUserId }
      });

      if (!targetUser) {
        throw new Error('Target user not found');
      }

      const overrideToken = crypto.randomBytes(32).toString('hex');

      await this.options.prisma.verificationToken.create({
        data: {
          type: 'ACCOUNT_RECOVERY' as any,
          token: overrideToken,
          value: targetUserId,
          userId: targetUserId,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        }
      });

      await this.options.prisma.securityEvent.create({
        data: {
          userId: targetUserId,
          type: 'ACCOUNT_RECOVERY_OVERRIDE',
          description: `Admin override initiated by ${admin.email}`,
          severity: 'HIGH',
          metadata: {
            adminId: adminUserId,
            adminEmail: admin.email,
            reason,
            overrideToken: overrideToken.substring(0, 8) + '...'
          }
        }
      });

      logger.warn(`Admin override initiated`, {
        adminId: adminUserId,
        targetUserId,
        reason
      });

      return overrideToken;

    } catch (error) {
      logger.error('Error in admin override:', error);
      throw error;
    }
  }

  private async generateRecoveryChallenges(user: User): Promise<RecoveryChallenge[]> {
    const challenges: RecoveryChallenge[] = [];

    // Email challenge (always available if email exists)
    if (user.email) {
      const emailCode = this.generateOTP(6);
      challenges.push({
        id: crypto.randomBytes(16).toString('hex'),
        type: 'email',
        target: this.maskEmail(user.email),
        code: emailCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });

      // Send recovery email (implement email service call)
      // await this.sendRecoveryEmail(user.email, emailCode);
    }

    // Phone challenge (if phone exists and verified)
    if (user.phone && user.phoneVerified) {
      const phoneCode = this.generateOTP(6);
      challenges.push({
        id: crypto.randomBytes(16).toString('hex'),
        type: 'phone',
        target: this.maskPhone(user.phone),
        code: phoneCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });

      // Send recovery SMS (implement SMS service call)
      // await this.sendRecoverySMS(user.phone, phoneCode);
    }

    // Security questions challenge (if configured)
    const securityQuestions = await this.getUserSecurityQuestions(user.id);
    if (securityQuestions.length > 0) {
      challenges.push({
        id: crypto.randomBytes(16).toString('hex'),
        type: 'security_questions',
        questions: securityQuestions,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });
    }

    return challenges;
  }

  private async validateChallenge(challenge: RecoveryChallenge, response: Record<string, any>): Promise<boolean> {
    switch (challenge.type) {
      case 'email':
      case 'phone':
        return response.code === challenge.code;
      
      case 'security_questions':
        // Validate security question answers
        return await this.validateSecurityAnswers(challenge.questions!, response.answers);
      
      case 'admin_override':
        // Admin override validation handled separately
        return true;
      
      default:
        return false;
    }
  }

  private generateOTP(length: number = 6): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 2 
      ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
      : localPart;
    return `${maskedLocal}@${domain}`;
  }

  private maskPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length > 4) {
      return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
    }
    return '*'.repeat(cleaned.length);
  }

  private async getUserSecurityQuestions(userId: string): Promise<string[]> {
    // This would typically fetch from a security_questions table
    // For now, return empty array - will be implemented when security questions are added
    return [];
  }

  private async validateSecurityAnswers(questions: string[], answers: string[]): Promise<boolean> {
    // Implement security question answer validation
    // This would hash answers and compare with stored hashes
    return false; // Placeholder
  }

  private createDummySession(): RecoverySession {
    // Return a dummy session for security (timing attack prevention)
    return {
      id: crypto.randomBytes(32).toString('hex'),
      userId: 'dummy',
      challenges: [],
      completedChallenges: [],
      status: 'pending',
      metadata: {},
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  private async storeRecoverySession(session: RecoverySession): Promise<void> {
    // Store session in Redis or database with expiration
    // For now, implement in-memory storage (production would use Redis)
    this.memorySessions.set(session.id, session);
  }

  private async retrieveRecoverySession(sessionId: string): Promise<RecoverySession | null> {
    // Retrieve from storage
    return this.memorySessions.get(sessionId) || null;
  }

  private async updateRecoverySession(session: RecoverySession): Promise<void> {
    // Update session in storage
    this.memorySessions.set(session.id, session);
  }

  private async recordFailedAttempt(sessionId: string, challengeId: string): Promise<void> {
    logger.warn(`Failed recovery challenge attempt`, { sessionId, challengeId });
  }

  private async logRecoverySuccess(session: RecoverySession): Promise<void> {
    await this.options.prisma.securityEvent.create({
      data: {
        userId: session.userId,
        type: 'ACCOUNT_RECOVERY_SUCCESS',
        description: 'Account recovery completed successfully',
        severity: 'MEDIUM',
        metadata: {
          sessionId: session.id,
          challengesCompleted: session.completedChallenges.length,
          challengeTypes: session.challenges.map(c => c.type)
        }
      }
    });
  }

  // In-memory session storage (production would use Redis)
  private memorySessions = new Map<string, RecoverySession>();
}

export function createAccountRecoveryService(options: AccountRecoveryOptions): AccountRecoveryService {
  return new AccountRecoveryService(options);
}