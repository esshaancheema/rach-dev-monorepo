import { Projection } from './ProjectionEngine';
import { DomainEvent } from '../core/Event';
import { Db, Collection } from 'mongodb';
import { logger } from '../utils/logger';

export interface UserProjectionDocument {
  _id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  emailVerified: boolean;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  
  // Aggregated data
  projectCount: number;
  totalAITokensUsed: number;
  totalAICost: number;
  lastActiveAt?: Date;
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Metadata
  version: number;
  lastEventId: string;
  lastEventTimestamp: Date;
}

export class UserProjection extends Projection {
  public readonly name = 'UserProjection';
  public readonly eventTypes = [
    'UserRegistered',
    'UserEmailVerified', 
    'UserProfileUpdated',
    'UserDeleted',
    'ProjectCreated',
    'ProjectDeleted',
    'AISessionCompleted'
  ];
  public readonly collectionName = 'user_projections';

  public async initialize(db: Db): Promise<void> {
    const collection = db.collection<UserProjectionDocument>(this.collectionName);
    
    // Create indexes for query performance
    await collection.createIndex({ userId: 1 }, { unique: true });
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ status: 1, createdAt: -1 });
    await collection.createIndex({ role: 1, status: 1 });
    await collection.createIndex({ lastActiveAt: -1 });
    await collection.createIndex({ 'fullName': 'text', 'email': 'text' });
    
    logger.info('UserProjection initialized with indexes');
  }

  public async handle(event: DomainEvent, collection: Collection<UserProjectionDocument>): Promise<void> {
    try {
      switch (event.eventType) {
        case 'UserRegistered':
          await this.handleUserRegistered(event, collection);
          break;
        case 'UserEmailVerified':
          await this.handleUserEmailVerified(event, collection);
          break;
        case 'UserProfileUpdated':
          await this.handleUserProfileUpdated(event, collection);
          break;
        case 'UserDeleted':
          await this.handleUserDeleted(event, collection);
          break;
        case 'ProjectCreated':
          await this.handleProjectCreated(event, collection);
          break;
        case 'ProjectDeleted':
          await this.handleProjectDeleted(event, collection);
          break;
        case 'AISessionCompleted':
          await this.handleAISessionCompleted(event, collection);
          break;
        default:
          logger.warn('Unhandled event type in UserProjection', { 
            eventType: event.eventType,
            eventId: event.id 
          });
      }
    } catch (error) {
      logger.error('Error handling event in UserProjection', {
        error,
        eventType: event.eventType,
        eventId: event.id,
        aggregateId: event.aggregateId,
      });
      throw error;
    }
  }

  private async handleUserRegistered(event: DomainEvent, collection: Collection<UserProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    
    const userDoc: UserProjectionDocument = {
      _id: event.aggregateId,
      userId: event.aggregateId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      emailVerified: false,
      role: 'USER',
      status: 'ACTIVE',
      
      // Initialize aggregated data
      projectCount: 0,
      totalAITokensUsed: 0,
      totalAICost: 0,
      
      // Audit trail
      createdAt: event.occurredAt,
      updatedAt: event.occurredAt,
      
      // Metadata
      version: 1,
      lastEventId: event.id,
      lastEventTimestamp: event.occurredAt,
    };

    await collection.insertOne(userDoc);
    
    logger.info('User projection created', { 
      userId: event.aggregateId,
      email: data.email 
    });
  }

  private async handleUserEmailVerified(event: DomainEvent, collection: Collection<UserProjectionDocument>): Promise<void> {
    const updateResult = await collection.updateOne(
      { userId: event.aggregateId },
      {
        $set: {
          emailVerified: true,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
        $inc: { version: 1 },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('User not found for email verification', { userId: event.aggregateId });
    } else {
      logger.info('User email verified in projection', { userId: event.aggregateId });
    }
  }

  private async handleUserProfileUpdated(event: DomainEvent, collection: Collection<UserProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    const updates = data.updates;
    
    const updateDoc: any = {
      updatedAt: event.occurredAt,
      lastEventId: event.id,
      lastEventTimestamp: event.occurredAt,
    };

    if (updates.firstName || updates.lastName) {
      // Update full name if first or last name changed
      const user = await collection.findOne({ userId: event.aggregateId });
      if (user) {
        const firstName = updates.firstName || user.firstName;
        const lastName = updates.lastName || user.lastName;
        updateDoc.fullName = `${firstName} ${lastName}`;
      }
    }

    // Copy all update fields
    Object.assign(updateDoc, updates);

    const updateResult = await collection.updateOne(
      { userId: event.aggregateId },
      {
        $set: updateDoc,
        $inc: { version: 1 },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('User not found for profile update', { userId: event.aggregateId });
    } else {
      logger.info('User profile updated in projection', { 
        userId: event.aggregateId,
        updates: Object.keys(updates) 
      });
    }
  }

  private async handleUserDeleted(event: DomainEvent, collection: Collection<UserProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    
    const updateResult = await collection.updateOne(
      { userId: event.aggregateId },
      {
        $set: {
          status: 'DELETED',
          deletedAt: data.deletedAt,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
        $inc: { version: 1 },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('User not found for deletion', { userId: event.aggregateId });
    } else {
      logger.info('User marked as deleted in projection', { userId: event.aggregateId });
    }
  }

  private async handleProjectCreated(event: DomainEvent, collection: Collection<UserProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    const ownerId = data.ownerId;
    
    const updateResult = await collection.updateOne(
      { userId: ownerId },
      {
        $inc: { 
          projectCount: 1,
          version: 1 
        },
        $set: {
          lastActiveAt: event.occurredAt,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('User not found for project creation update', { userId: ownerId });
    } else {
      logger.debug('User project count incremented', { userId: ownerId });
    }
  }

  private async handleProjectDeleted(event: DomainEvent, collection: Collection<UserProjectionDocument>): Promise<void> {
    // We need to get the project owner from the project aggregate or from event metadata
    const ownerId = event.metadata.userId; // Assuming owner ID is in metadata
    
    if (!ownerId) {
      logger.warn('No owner ID found for project deletion', { projectId: event.aggregateId });
      return;
    }

    const updateResult = await collection.updateOne(
      { userId: ownerId },
      {
        $inc: { 
          projectCount: -1,
          version: 1 
        },
        $set: {
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('User not found for project deletion update', { userId: ownerId });
    } else {
      logger.debug('User project count decremented', { userId: ownerId });
    }
  }

  private async handleAISessionCompleted(event: DomainEvent, collection: Collection<UserProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    const userId = event.metadata.userId;
    
    if (!userId) {
      logger.warn('No user ID found for AI session completion', { sessionId: event.aggregateId });
      return;
    }

    const updateResult = await collection.updateOne(
      { userId },
      {
        $inc: { 
          totalAITokensUsed: data.totalTokensUsed || 0,
          totalAICost: data.totalCost || 0,
          version: 1 
        },
        $set: {
          lastActiveAt: event.occurredAt,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('User not found for AI usage update', { userId });
    } else {
      logger.debug('User AI usage updated', { 
        userId,
        tokensUsed: data.totalTokensUsed,
        cost: data.totalCost 
      });
    }
  }

  public async onRebuildStart(collection: Collection<UserProjectionDocument>): Promise<void> {
    logger.info('Starting UserProjection rebuild - clearing existing data');
    await collection.deleteMany({});
  }

  public async onRebuildComplete(collection: Collection<UserProjectionDocument>): Promise<void> {
    const count = await collection.countDocuments();
    logger.info('UserProjection rebuild completed', { totalUsers: count });
    
    // Update any derived fields or run maintenance tasks
    await this.updateDerivedFields(collection);
  }

  private async updateDerivedFields(collection: Collection<UserProjectionDocument>): Promise<void> {
    // Update any calculated fields that might be missing or incorrect
    const users = await collection.find({ fullName: { $exists: false } }).toArray();
    
    for (const user of users) {
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            fullName: `${user.firstName} ${user.lastName}`,
          },
        }
      );
    }

    if (users.length > 0) {
      logger.info('Updated missing full names', { count: users.length });
    }
  }

  // Query helpers for the projection
  public async findActiveUsers(collection: Collection<UserProjectionDocument>, limit: number = 100): Promise<UserProjectionDocument[]> {
    return collection
      .find({ status: 'ACTIVE' })
      .sort({ lastActiveAt: -1 })
      .limit(limit)
      .toArray();
  }

  public async findUsersByRole(collection: Collection<UserProjectionDocument>, role: string): Promise<UserProjectionDocument[]> {
    return collection
      .find({ role, status: { $ne: 'DELETED' } })
      .sort({ createdAt: -1 })
      .toArray();
  }

  public async getUserStats(collection: Collection<UserProjectionDocument>): Promise<{
    total: number;
    active: number;
    deleted: number;
    emailVerified: number;
    totalProjects: number;
    totalAIUsage: { tokens: number; cost: number };
  }> {
    const pipeline = [
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
          deleted: { $sum: { $cond: [{ $eq: ['$status', 'DELETED'] }, 1, 0] } },
          emailVerified: { $sum: { $cond: ['$emailVerified', 1, 0] } },
          totalProjects: { $sum: '$projectCount' },
          totalTokens: { $sum: '$totalAITokensUsed' },
          totalCost: { $sum: '$totalAICost' },
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const stats = result[0] || {};

    return {
      total: stats.total || 0,
      active: stats.active || 0,
      deleted: stats.deleted || 0,
      emailVerified: stats.emailVerified || 0,
      totalProjects: stats.totalProjects || 0,
      totalAIUsage: {
        tokens: stats.totalTokens || 0,
        cost: stats.totalCost || 0,
      },
    };
  }

  public async searchUsers(
    collection: Collection<UserProjectionDocument>,
    query: string,
    limit: number = 50
  ): Promise<UserProjectionDocument[]> {
    return collection
      .find({
        $and: [
          { status: { $ne: 'DELETED' } },
          {
            $or: [
              { fullName: { $regex: query, $options: 'i' } },
              { email: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      })
      .sort({ lastActiveAt: -1 })
      .limit(limit)
      .toArray();
  }
}