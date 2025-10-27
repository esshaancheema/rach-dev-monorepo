import { v4 as uuidv4 } from 'uuid';
import { IsString, IsUUID, IsDate, IsOptional, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export interface EventMetadata {
  userId?: string;
  tenantId?: string;
  correlationId?: string;
  causationId?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  source?: string;
  version?: number;
  [key: string]: any;
}

export abstract class DomainEvent {
  @IsUUID()
  public readonly id: string;

  @IsString()
  public readonly aggregateId: string;

  @IsString()
  public readonly aggregateType: string;

  @IsString()
  public readonly eventType: string;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  public readonly occurredAt: Date;

  @IsOptional()
  @IsObject()
  public readonly metadata: EventMetadata;

  @IsOptional()
  public readonly version: number;

  constructor(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    metadata: EventMetadata = {},
    version: number = 1
  ) {
    this.id = uuidv4();
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.eventType = eventType;
    this.occurredAt = new Date();
    this.metadata = metadata;
    this.version = version;
  }

  abstract getData(): any;

  public toJSON(): any {
    return {
      id: this.id,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      eventType: this.eventType,
      occurredAt: this.occurredAt.toISOString(),
      metadata: this.metadata,
      version: this.version,
      data: this.getData(),
    };
  }

  public static fromJSON(json: any): DomainEvent {
    // This would be implemented by concrete event classes
    throw new Error('fromJSON must be implemented by concrete event classes');
  }
}

// User Domain Events
export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly hashedPassword: string,
    aggregateId: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'User', 'UserRegistered', metadata);
  }

  getData() {
    return {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      hashedPassword: this.hashedPassword,
    };
  }
}

export class UserEmailVerifiedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly verifiedAt: Date,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'User', 'UserEmailVerified', metadata);
  }

  getData() {
    return {
      verifiedAt: this.verifiedAt,
    };
  }
}

export class UserProfileUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly updates: Partial<{
      firstName: string;
      lastName: string;
      avatar: string;
      bio: string;
    }>,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'User', 'UserProfileUpdated', metadata);
  }

  getData() {
    return {
      updates: this.updates,
    };
  }
}

export class UserDeletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly deletedAt: Date,
    public readonly reason: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'User', 'UserDeleted', metadata);
  }

  getData() {
    return {
      deletedAt: this.deletedAt,
      reason: this.reason,
    };
  }
}

// Project Domain Events
export class ProjectCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly ownerId: string,
    public readonly visibility: 'PRIVATE' | 'PUBLIC' | 'TEAM',
    public readonly language?: string,
    public readonly framework?: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Project', 'ProjectCreated', metadata);
  }

  getData() {
    return {
      name: this.name,
      description: this.description,
      ownerId: this.ownerId,
      visibility: this.visibility,
      language: this.language,
      framework: this.framework,
    };
  }
}

export class ProjectUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly updates: Partial<{
      name: string;
      description: string;
      visibility: 'PRIVATE' | 'PUBLIC' | 'TEAM';
      language: string;
      framework: string;
      tags: string[];
    }>,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Project', 'ProjectUpdated', metadata);
  }

  getData() {
    return {
      updates: this.updates,
    };
  }
}

export class ProjectCollaboratorAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER',
    public readonly permissions: string[],
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Project', 'ProjectCollaboratorAdded', metadata);
  }

  getData() {
    return {
      userId: this.userId,
      role: this.role,
      permissions: this.permissions,
    };
  }
}

export class ProjectCollaboratorRemovedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly reason: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Project', 'ProjectCollaboratorRemoved', metadata);
  }

  getData() {
    return {
      userId: this.userId,
      reason: this.reason,
    };
  }
}

export class ProjectArchivedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly archivedAt: Date,
    public readonly reason: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Project', 'ProjectArchived', metadata);
  }

  getData() {
    return {
      archivedAt: this.archivedAt,
      reason: this.reason,
    };
  }
}

export class ProjectDeletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly deletedAt: Date,
    public readonly backupLocation: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Project', 'ProjectDeleted', metadata);
  }

  getData() {
    return {
      deletedAt: this.deletedAt,
      backupLocation: this.backupLocation,
    };
  }
}

// File Domain Events
export class FileUploadedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly projectId: string,
    public readonly name: string,
    public readonly path: string,
    public readonly size: number,
    public readonly mimeType: string,
    public readonly checksum: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'File', 'FileUploaded', metadata);
  }

  getData() {
    return {
      projectId: this.projectId,
      name: this.name,
      path: this.path,
      size: this.size,
      mimeType: this.mimeType,
      checksum: this.checksum,
    };
  }
}

export class FileContentUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly content: string,
    public readonly contentHash: string,
    public readonly previousHash: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'File', 'FileContentUpdated', metadata);
  }

  getData() {
    return {
      content: this.content,
      contentHash: this.contentHash,
      previousHash: this.previousHash,
    };
  }
}

export class FileDeletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly deletedAt: Date,
    public readonly backupLocation: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'File', 'FileDeleted', metadata);
  }

  getData() {
    return {
      deletedAt: this.deletedAt,
      backupLocation: this.backupLocation,
    };
  }
}

// AI Session Domain Events
export class AISessionStartedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly type: 'CHAT' | 'CODE_GENERATION' | 'CODE_REVIEW' | 'DOCUMENTATION',
    public readonly projectId: string,
    public readonly userId: string,
    public readonly model: string,
    public readonly parameters: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'AISession', 'AISessionStarted', metadata);
  }

  getData() {
    return {
      type: this.type,
      projectId: this.projectId,
      userId: this.userId,
      model: this.model,
      parameters: this.parameters,
    };
  }
}

export class AISessionMessageAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly messageId: string,
    public readonly role: 'USER' | 'ASSISTANT' | 'SYSTEM',
    public readonly content: string,
    public readonly tokensUsed: number,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'AISession', 'AISessionMessageAdded', metadata);
  }

  getData() {
    return {
      messageId: this.messageId,
      role: this.role,
      content: this.content,
      tokensUsed: this.tokensUsed,
    };
  }
}

export class AISessionCompletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly completedAt: Date,
    public readonly totalTokensUsed: number,
    public readonly totalCost: number,
    public readonly reason: 'USER_ENDED' | 'MAX_TOKENS_REACHED' | 'TIMEOUT' | 'ERROR',
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'AISession', 'AISessionCompleted', metadata);
  }

  getData() {
    return {
      completedAt: this.completedAt,
      totalTokensUsed: this.totalTokensUsed,
      totalCost: this.totalCost,
      reason: this.reason,
    };
  }
}

// Billing Domain Events
export class SubscriptionCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly planId: string,
    public readonly status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'UNPAID',
    public readonly currentPeriodStart: Date,
    public readonly currentPeriodEnd: Date,
    public readonly trialEnd?: Date,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Subscription', 'SubscriptionCreated', metadata);
  }

  getData() {
    return {
      userId: this.userId,
      planId: this.planId,
      status: this.status,
      currentPeriodStart: this.currentPeriodStart,
      currentPeriodEnd: this.currentPeriodEnd,
      trialEnd: this.trialEnd,
    };
  }
}

export class SubscriptionStatusChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly reason: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Subscription', 'SubscriptionStatusChanged', metadata);
  }

  getData() {
    return {
      previousStatus: this.previousStatus,
      newStatus: this.newStatus,
      reason: this.reason,
    };
  }
}

export class PaymentProcessedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: 'SUCCEEDED' | 'FAILED' | 'PENDING',
    public readonly paymentMethodId: string,
    public readonly stripePaymentIntentId: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Payment', 'PaymentProcessed', metadata);
  }

  getData() {
    return {
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      paymentMethodId: this.paymentMethodId,
      stripePaymentIntentId: this.stripePaymentIntentId,
    };
  }
}

// Notification Domain Events
export class NotificationCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly message: string,
    public readonly type: 'SYSTEM' | 'PROJECT_UPDATE' | 'COLLABORATION' | 'BILLING' | 'SECURITY',
    public readonly priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT',
    public readonly channels: ('IN_APP' | 'EMAIL' | 'SMS' | 'PUSH')[],
    public readonly data?: any,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Notification', 'NotificationCreated', metadata);
  }

  getData() {
    return {
      userId: this.userId,
      title: this.title,
      message: this.message,
      type: this.type,
      priority: this.priority,
      channels: this.channels,
      data: this.data,
    };
  }
}

export class NotificationDeliveredEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly channel: 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH',
    public readonly deliveredAt: Date,
    public readonly externalId?: string,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Notification', 'NotificationDelivered', metadata);
  }

  getData() {
    return {
      channel: this.channel,
      deliveredAt: this.deliveredAt,
      externalId: this.externalId,
    };
  }
}

export class NotificationReadEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly readAt: Date,
    metadata: EventMetadata = {}
  ) {
    super(aggregateId, 'Notification', 'NotificationRead', metadata);
  }

  getData() {
    return {
      readAt: this.readAt,
    };
  }
}

// Event Type Registry for deserialization
export const EventTypeRegistry: { [key: string]: new (...args: any[]) => DomainEvent } = {
  // User Events
  UserRegistered: UserRegisteredEvent,
  UserEmailVerified: UserEmailVerifiedEvent,
  UserProfileUpdated: UserProfileUpdatedEvent,
  UserDeleted: UserDeletedEvent,

  // Project Events
  ProjectCreated: ProjectCreatedEvent,
  ProjectUpdated: ProjectUpdatedEvent,
  ProjectCollaboratorAdded: ProjectCollaboratorAddedEvent,
  ProjectCollaboratorRemoved: ProjectCollaboratorRemovedEvent,
  ProjectArchived: ProjectArchivedEvent,
  ProjectDeleted: ProjectDeletedEvent,

  // File Events
  FileUploaded: FileUploadedEvent,
  FileContentUpdated: FileContentUpdatedEvent,
  FileDeleted: FileDeletedEvent,

  // AI Session Events
  AISessionStarted: AISessionStartedEvent,
  AISessionMessageAdded: AISessionMessageAddedEvent,
  AISessionCompleted: AISessionCompletedEvent,

  // Billing Events
  SubscriptionCreated: SubscriptionCreatedEvent,
  SubscriptionStatusChanged: SubscriptionStatusChangedEvent,
  PaymentProcessed: PaymentProcessedEvent,

  // Notification Events
  NotificationCreated: NotificationCreatedEvent,
  NotificationDelivered: NotificationDeliveredEvent,
  NotificationRead: NotificationReadEvent,
};