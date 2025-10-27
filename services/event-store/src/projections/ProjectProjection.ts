import { Projection } from './ProjectionEngine';
import { DomainEvent } from '../core/Event';
import { Db, Collection } from 'mongodb';
import { logger } from '../utils/logger';

export interface ProjectProjectionDocument {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName?: string;
  ownerEmail?: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'TEAM';
  language?: string;
  framework?: string;
  tags: string[];
  
  // Collaboration
  collaborators: Array<{
    userId: string;
    userName?: string;
    userEmail?: string;
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
    permissions: string[];
    joinedAt: Date;
  }>;
  collaboratorCount: number;
  
  // Files and structure
  fileCount: number;
  totalSize: number;
  languageBreakdown: Array<{
    language: string;
    fileCount: number;
    lineCount: number;
    percentage: number;
  }>;
  
  // AI Usage
  aiSessions: Array<{
    sessionId: string;
    type: 'CHAT' | 'CODE_GENERATION' | 'CODE_REVIEW' | 'DOCUMENTATION';
    tokensUsed: number;
    cost: number;
    completedAt: Date;
  }>;
  totalAITokensUsed: number;
  totalAICost: number;
  lastAIUsage?: Date;
  
  // Activity
  lastActivity?: Date;
  lastFileUpdate?: Date;
  
  // Status
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  deletedAt?: Date;
  
  // Search fields
  searchText: string; // Concatenated searchable text
  
  // Metadata
  version: number;
  lastEventId: string;
  lastEventTimestamp: Date;
}

export class ProjectProjection extends Projection {
  public readonly name = 'ProjectProjection';
  public readonly eventTypes = [
    'ProjectCreated',
    'ProjectUpdated',
    'ProjectCollaboratorAdded',
    'ProjectCollaboratorRemoved',
    'ProjectArchived',
    'ProjectDeleted',
    'FileUploaded',
    'FileContentUpdated',
    'FileDeleted',
    'AISessionStarted',
    'AISessionCompleted',
    'UserRegistered', // To get user details for collaborators
    'UserProfileUpdated',
  ];
  public readonly collectionName = 'project_projections';

  public async initialize(db: Db): Promise<void> {
    const collection = db.collection<ProjectProjectionDocument>(this.collectionName);
    
    // Create indexes for query performance
    await collection.createIndex({ projectId: 1 }, { unique: true });
    await collection.createIndex({ ownerId: 1, status: 1, createdAt: -1 });
    await collection.createIndex({ status: 1, lastActivity: -1 });
    await collection.createIndex({ visibility: 1, status: 1 });
    await collection.createIndex({ language: 1, framework: 1 });
    await collection.createIndex({ tags: 1 });
    await collection.createIndex({ 'collaborators.userId': 1 });
    await collection.createIndex({ searchText: 'text' });
    await collection.createIndex({ totalAITokensUsed: -1 });
    await collection.createIndex({ fileCount: -1, totalSize: -1 });
    
    logger.info('ProjectProjection initialized with indexes');
  }

  public async handle(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    try {
      switch (event.eventType) {
        case 'ProjectCreated':
          await this.handleProjectCreated(event, collection);
          break;
        case 'ProjectUpdated':
          await this.handleProjectUpdated(event, collection);
          break;
        case 'ProjectCollaboratorAdded':
          await this.handleCollaboratorAdded(event, collection);
          break;
        case 'ProjectCollaboratorRemoved':
          await this.handleCollaboratorRemoved(event, collection);
          break;
        case 'ProjectArchived':
          await this.handleProjectArchived(event, collection);
          break;
        case 'ProjectDeleted':
          await this.handleProjectDeleted(event, collection);
          break;
        case 'FileUploaded':
          await this.handleFileUploaded(event, collection);
          break;
        case 'FileContentUpdated':
          await this.handleFileContentUpdated(event, collection);
          break;
        case 'FileDeleted':
          await this.handleFileDeleted(event, collection);
          break;
        case 'AISessionStarted':
          await this.handleAISessionStarted(event, collection);
          break;
        case 'AISessionCompleted':
          await this.handleAISessionCompleted(event, collection);
          break;
        case 'UserRegistered':
        case 'UserProfileUpdated':
          await this.handleUserUpdated(event, collection);
          break;
        default:
          logger.warn('Unhandled event type in ProjectProjection', { 
            eventType: event.eventType,
            eventId: event.id 
          });
      }
    } catch (error) {
      logger.error('Error handling event in ProjectProjection', {
        error,
        eventType: event.eventType,
        eventId: event.id,
        aggregateId: event.aggregateId,
      });
      throw error;
    }
  }

  private async handleProjectCreated(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    
    const searchText = [
      data.name,
      data.description,
      data.language,
      data.framework,
      ...(data.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();

    const projectDoc: ProjectProjectionDocument = {
      _id: event.aggregateId,
      projectId: event.aggregateId,
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
      visibility: data.visibility,
      language: data.language,
      framework: data.framework,
      tags: [],
      
      // Initialize collaboration
      collaborators: [{
        userId: data.ownerId,
        role: 'OWNER',
        permissions: ['READ', 'WRITE', 'DELETE', 'MANAGE_COLLABORATORS', 'MANAGE_SETTINGS'],
        joinedAt: event.occurredAt,
      }],
      collaboratorCount: 1,
      
      // Initialize file stats
      fileCount: 0,
      totalSize: 0,
      languageBreakdown: [],
      
      // Initialize AI usage
      aiSessions: [],
      totalAITokensUsed: 0,
      totalAICost: 0,
      
      // Activity
      lastActivity: event.occurredAt,
      
      // Status
      status: 'ACTIVE',
      
      // Audit trail
      createdAt: event.occurredAt,
      updatedAt: event.occurredAt,
      
      // Search
      searchText,
      
      // Metadata
      version: 1,
      lastEventId: event.id,
      lastEventTimestamp: event.occurredAt,
    };

    await collection.insertOne(projectDoc);
    
    logger.info('Project projection created', { 
      projectId: event.aggregateId,
      name: data.name,
      ownerId: data.ownerId 
    });
  }

  private async handleProjectUpdated(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    const updates = data.updates;
    
    const updateDoc: any = {
      updatedAt: event.occurredAt,
      lastActivity: event.occurredAt,
      lastEventId: event.id,
      lastEventTimestamp: event.occurredAt,
    };

    // Copy update fields
    Object.assign(updateDoc, updates);

    // Update search text if relevant fields changed
    if (updates.name || updates.description || updates.language || updates.framework || updates.tags) {
      const project = await collection.findOne({ projectId: event.aggregateId });
      if (project) {
        const searchText = [
          updates.name || project.name,
          updates.description || project.description,
          updates.language || project.language,
          updates.framework || project.framework,
          ...(updates.tags || project.tags || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        updateDoc.searchText = searchText;
      }
    }

    const updateResult = await collection.updateOne(
      { projectId: event.aggregateId },
      {
        $set: updateDoc,
        $inc: { version: 1 },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('Project not found for update', { projectId: event.aggregateId });
    } else {
      logger.info('Project updated in projection', { 
        projectId: event.aggregateId,
        updates: Object.keys(updates) 
      });
    }
  }

  private async handleCollaboratorAdded(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    
    const collaborator = {
      userId: data.userId,
      role: data.role,
      permissions: data.permissions,
      joinedAt: event.occurredAt,
    };

    const updateResult = await collection.updateOne(
      { projectId: event.aggregateId },
      {
        $push: { collaborators: collaborator },
        $inc: { 
          collaboratorCount: 1,
          version: 1 
        },
        $set: {
          updatedAt: event.occurredAt,
          lastActivity: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('Project not found for collaborator addition', { projectId: event.aggregateId });
    } else {
      logger.info('Collaborator added to project projection', { 
        projectId: event.aggregateId,
        userId: data.userId,
        role: data.role 
      });
    }
  }

  private async handleCollaboratorRemoved(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    
    const updateResult = await collection.updateOne(
      { projectId: event.aggregateId },
      {
        $pull: { collaborators: { userId: data.userId } },
        $inc: { 
          collaboratorCount: -1,
          version: 1 
        },
        $set: {
          updatedAt: event.occurredAt,
          lastActivity: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('Project not found for collaborator removal', { projectId: event.aggregateId });
    } else {
      logger.info('Collaborator removed from project projection', { 
        projectId: event.aggregateId,
        userId: data.userId 
      });
    }
  }

  private async handleProjectArchived(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    
    const updateResult = await collection.updateOne(
      { projectId: event.aggregateId },
      {
        $set: {
          status: 'ARCHIVED',
          archivedAt: data.archivedAt,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
        $inc: { version: 1 },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('Project not found for archival', { projectId: event.aggregateId });
    } else {
      logger.info('Project archived in projection', { projectId: event.aggregateId });
    }
  }

  private async handleProjectDeleted(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    
    const updateResult = await collection.updateOne(
      { projectId: event.aggregateId },
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
      logger.warn('Project not found for deletion', { projectId: event.aggregateId });
    } else {
      logger.info('Project marked as deleted in projection', { projectId: event.aggregateId });
    }
  }

  private async handleFileUploaded(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    const projectId = data.projectId;
    
    const updateResult = await collection.updateOne(
      { projectId },
      {
        $inc: { 
          fileCount: 1,
          totalSize: data.size,
          version: 1 
        },
        $set: {
          lastActivity: event.occurredAt,
          lastFileUpdate: event.occurredAt,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      logger.warn('Project not found for file upload', { projectId });
    } else {
      logger.debug('File uploaded stats updated', { projectId, fileName: data.name });
    }
  }

  private async handleFileContentUpdated(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    // For content updates, we just update the last activity
    const fileData = await this.getFileProjectData(event.aggregateId); // Would need to implement
    const projectId = fileData?.projectId;
    
    if (!projectId) {
      logger.warn('Could not determine project for file content update', { fileId: event.aggregateId });
      return;
    }

    await collection.updateOne(
      { projectId },
      {
        $set: {
          lastActivity: event.occurredAt,
          lastFileUpdate: event.occurredAt,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
        $inc: { version: 1 },
      }
    );
  }

  private async handleFileDeleted(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const fileData = await this.getFileProjectData(event.aggregateId);
    const projectId = fileData?.projectId;
    const fileSize = fileData?.size || 0;
    
    if (!projectId) {
      logger.warn('Could not determine project for file deletion', { fileId: event.aggregateId });
      return;
    }

    await collection.updateOne(
      { projectId },
      {
        $inc: { 
          fileCount: -1,
          totalSize: -fileSize,
          version: 1 
        },
        $set: {
          lastActivity: event.occurredAt,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
      }
    );
  }

  private async handleAISessionStarted(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    const projectId = data.projectId;
    
    if (!projectId) {
      return; // AI session not associated with a project
    }

    await collection.updateOne(
      { projectId },
      {
        $set: {
          lastActivity: event.occurredAt,
          lastAIUsage: event.occurredAt,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
        $inc: { version: 1 },
      }
    );
  }

  private async handleAISessionCompleted(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const data = (event as any).getData();
    const sessionData = await this.getAISessionProjectData(event.aggregateId); // Would need to implement
    const projectId = sessionData?.projectId;
    
    if (!projectId) {
      return; // AI session not associated with a project
    }

    const aiSession = {
      sessionId: event.aggregateId,
      type: sessionData.type,
      tokensUsed: data.totalTokensUsed,
      cost: data.totalCost,
      completedAt: event.occurredAt,
    };

    await collection.updateOne(
      { projectId },
      {
        $push: { aiSessions: aiSession },
        $inc: { 
          totalAITokensUsed: data.totalTokensUsed,
          totalAICost: data.totalCost,
          version: 1 
        },
        $set: {
          lastActivity: event.occurredAt,
          lastAIUsage: event.occurredAt,
          updatedAt: event.occurredAt,
          lastEventId: event.id,
          lastEventTimestamp: event.occurredAt,
        },
      }
    );
  }

  private async handleUserUpdated(event: DomainEvent, collection: Collection<ProjectProjectionDocument>): Promise<void> {
    // Update user information in collaborator arrays
    const userData = (event as any).getData();
    const userId = event.aggregateId;
    
    let updateFields: any = {};
    
    if (event.eventType === 'UserRegistered') {
      updateFields = {
        'collaborators.$.userName': `${userData.firstName} ${userData.lastName}`,
        'collaborators.$.userEmail': userData.email,
      };
    } else if (event.eventType === 'UserProfileUpdated') {
      if (userData.updates.firstName || userData.updates.lastName) {
        // Would need to fetch current user data to build full name
        updateFields['collaborators.$.userName'] = 'Updated Name'; // Simplified
      }
    }

    if (Object.keys(updateFields).length > 0) {
      await collection.updateMany(
        { 'collaborators.userId': userId },
        {
          $set: {
            ...updateFields,
            updatedAt: event.occurredAt,
          },
        }
      );
    }
  }

  public async onRebuildStart(collection: Collection<ProjectProjectionDocument>): Promise<void> {
    logger.info('Starting ProjectProjection rebuild - clearing existing data');
    await collection.deleteMany({});
  }

  public async onRebuildComplete(collection: Collection<ProjectProjectionDocument>): Promise<void> {
    const count = await collection.countDocuments();
    logger.info('ProjectProjection rebuild completed', { totalProjects: count });
    
    // Update any derived fields
    await this.updateDerivedFields(collection);
  }

  private async updateDerivedFields(collection: Collection<ProjectProjectionDocument>): Promise<void> {
    // Update search text for projects that might be missing it
    const projects = await collection.find({ searchText: { $exists: false } }).toArray();
    
    for (const project of projects) {
      const searchText = [
        project.name,
        project.description,
        project.language,
        project.framework,
        ...project.tags
      ].filter(Boolean).join(' ').toLowerCase();
      
      await collection.updateOne(
        { _id: project._id },
        { $set: { searchText } }
      );
    }

    if (projects.length > 0) {
      logger.info('Updated missing search text', { count: projects.length });
    }
  }

  // Helper methods to get related data (would need proper implementation)
  private async getFileProjectData(fileId: string): Promise<{ projectId: string; size: number } | null> {
    // This would query the file aggregate or maintain a lookup table
    return null;
  }

  private async getAISessionProjectData(sessionId: string): Promise<{ projectId: string; type: string } | null> {
    // This would query the AI session aggregate or maintain a lookup table
    return null;
  }

  // Query helpers
  public async findProjectsByOwner(collection: Collection<ProjectProjectionDocument>, ownerId: string): Promise<ProjectProjectionDocument[]> {
    return collection
      .find({ ownerId, status: { $ne: 'DELETED' } })
      .sort({ lastActivity: -1 })
      .toArray();
  }

  public async findProjectsByCollaborator(collection: Collection<ProjectProjectionDocument>, userId: string): Promise<ProjectProjectionDocument[]> {
    return collection
      .find({ 
        'collaborators.userId': userId,
        status: { $ne: 'DELETED' } 
      })
      .sort({ lastActivity: -1 })
      .toArray();
  }

  public async searchProjects(
    collection: Collection<ProjectProjectionDocument>,
    query: string,
    filters?: {
      language?: string;
      framework?: string;
      visibility?: string;
    },
    limit: number = 50
  ): Promise<ProjectProjectionDocument[]> {
    const searchQuery: any = {
      status: { $ne: 'DELETED' },
      $text: { $search: query },
    };

    if (filters) {
      if (filters.language) searchQuery.language = filters.language;
      if (filters.framework) searchQuery.framework = filters.framework;
      if (filters.visibility) searchQuery.visibility = filters.visibility;
    }

    return collection
      .find(searchQuery)
      .sort({ score: { $meta: 'textScore' }, lastActivity: -1 })
      .limit(limit)
      .toArray();
  }

  public async getProjectStats(collection: Collection<ProjectProjectionDocument>): Promise<{
    total: number;
    active: number;
    archived: number;
    deleted: number;
    totalFiles: number;
    totalSize: number;
    totalAIUsage: { tokens: number; cost: number };
    languageDistribution: { [key: string]: number };
  }> {
    const pipeline = [
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'ARCHIVED'] }, 1, 0] } },
          deleted: { $sum: { $cond: [{ $eq: ['$status', 'DELETED'] }, 1, 0] } },
          totalFiles: { $sum: '$fileCount' },
          totalSize: { $sum: '$totalSize' },
          totalTokens: { $sum: '$totalAITokensUsed' },
          totalCost: { $sum: '$totalAICost' },
        },
      },
    ];

    const [stats, languageStats] = await Promise.all([
      collection.aggregate(pipeline).toArray(),
      collection.aggregate([
        { $match: { status: { $ne: 'DELETED' }, language: { $exists: true, $ne: null } } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
    ]);

    const result = stats[0] || {};
    const languageDistribution: { [key: string]: number } = {};
    
    languageStats.forEach(stat => {
      languageDistribution[stat._id] = stat.count;
    });

    return {
      total: result.total || 0,
      active: result.active || 0,
      archived: result.archived || 0,
      deleted: result.deleted || 0,
      totalFiles: result.totalFiles || 0,
      totalSize: result.totalSize || 0,
      totalAIUsage: {
        tokens: result.totalTokens || 0,
        cost: result.totalCost || 0,
      },
      languageDistribution,
    };
  }
}