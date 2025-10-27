import { DomainEvent, EventMetadata } from './Event';
import { v4 as uuidv4 } from 'uuid';

export abstract class AggregateRoot {
  private _id: string;
  private _version: number = 0;
  private _uncommittedEvents: DomainEvent[] = [];
  private _isDeleted: boolean = false;

  constructor(id?: string) {
    this._id = id || uuidv4();
  }

  get id(): string {
    return this._id;
  }

  get version(): number {
    return this._version;
  }

  get isDeleted(): boolean {
    return this._isDeleted;
  }

  protected addEvent(event: DomainEvent): void {
    this._uncommittedEvents.push(event);
  }

  public getUncommittedEvents(): DomainEvent[] {
    return [...this._uncommittedEvents];
  }

  public clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  public loadFromHistory(events: DomainEvent[]): void {
    events.forEach(event => {
      this.applyEvent(event);
      this._version++;
    });
  }

  protected abstract applyEvent(event: DomainEvent): void;

  protected markAsDeleted(): void {
    this._isDeleted = true;
  }

  public incrementVersion(): void {
    this._version++;
  }
}

// User Aggregate
export class UserAggregate extends AggregateRoot {
  private email!: string;
  private firstName!: string;
  private lastName!: string;
  private hashedPassword!: string;
  private emailVerified: boolean = false;
  private avatar?: string;
  private bio?: string;
  private createdAt!: Date;
  private updatedAt!: Date;
  private deletedAt?: Date;

  constructor(id?: string) {
    super(id);
  }

  // Commands
  public static register(
    email: string,
    firstName: string,
    lastName: string,
    hashedPassword: string,
    metadata: EventMetadata = {}
  ): UserAggregate {
    const user = new UserAggregate();
    const event = new (require('./Event').UserRegisteredEvent)(
      email,
      firstName,
      lastName,
      hashedPassword,
      user.id,
      metadata
    );
    user.addEvent(event);
    user.applyEvent(event);
    return user;
  }

  public verifyEmail(metadata: EventMetadata = {}): void {
    if (this.emailVerified) {
      throw new Error('Email is already verified');
    }

    const event = new (require('./Event').UserEmailVerifiedEvent)(
      this.id,
      new Date(),
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  public updateProfile(
    updates: Partial<{
      firstName: string;
      lastName: string;
      avatar: string;
      bio: string;
    }>,
    metadata: EventMetadata = {}
  ): void {
    if (this.isDeleted) {
      throw new Error('Cannot update deleted user');
    }

    const event = new (require('./Event').UserProfileUpdatedEvent)(
      this.id,
      updates,
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  public delete(reason: string, metadata: EventMetadata = {}): void {
    if (this.isDeleted) {
      throw new Error('User is already deleted');
    }

    const event = new (require('./Event').UserDeletedEvent)(
      this.id,
      new Date(),
      reason,
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  // Event handlers
  protected applyEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'UserRegistered':
        this.applyUserRegisteredEvent(event as any);
        break;
      case 'UserEmailVerified':
        this.applyUserEmailVerifiedEvent(event as any);
        break;
      case 'UserProfileUpdated':
        this.applyUserProfileUpdatedEvent(event as any);
        break;
      case 'UserDeleted':
        this.applyUserDeletedEvent(event as any);
        break;
      default:
        throw new Error(`Unknown event type: ${event.eventType}`);
    }
    this.updatedAt = new Date();
  }

  private applyUserRegisteredEvent(event: any): void {
    this.email = event.email;
    this.firstName = event.firstName;
    this.lastName = event.lastName;
    this.hashedPassword = event.hashedPassword;
    this.createdAt = event.occurredAt;
    this.updatedAt = event.occurredAt;
  }

  private applyUserEmailVerifiedEvent(event: any): void {
    this.emailVerified = true;
  }

  private applyUserProfileUpdatedEvent(event: any): void {
    const { updates } = event.getData();
    Object.assign(this, updates);
  }

  private applyUserDeletedEvent(event: any): void {
    this.deletedAt = event.deletedAt;
    this.markAsDeleted();
  }

  // Getters
  public getEmail(): string {
    return this.email;
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public isEmailVerified(): boolean {
    return this.emailVerified;
  }

  public getSnapshot(): any {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      hashedPassword: this.hashedPassword,
      emailVerified: this.emailVerified,
      avatar: this.avatar,
      bio: this.bio,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      version: this.version,
      isDeleted: this.isDeleted,
    };
  }
}

// Project Aggregate
export class ProjectAggregate extends AggregateRoot {
  private name!: string;
  private description!: string;
  private ownerId!: string;
  private visibility!: 'PRIVATE' | 'PUBLIC' | 'TEAM';
  private language?: string;
  private framework?: string;
  private tags: string[] = [];
  private collaborators: Map<string, { role: string; permissions: string[]; joinedAt: Date }> = new Map();
  private createdAt!: Date;
  private updatedAt!: Date;
  private archivedAt?: Date;
  private deletedAt?: Date;

  constructor(id?: string) {
    super(id);
  }

  // Commands
  public static create(
    name: string,
    description: string,
    ownerId: string,
    visibility: 'PRIVATE' | 'PUBLIC' | 'TEAM',
    language?: string,
    framework?: string,
    metadata: EventMetadata = {}
  ): ProjectAggregate {
    const project = new ProjectAggregate();
    const event = new (require('./Event').ProjectCreatedEvent)(
      project.id,
      name,
      description,
      ownerId,
      visibility,
      language,
      framework,
      metadata
    );
    project.addEvent(event);
    project.applyEvent(event);
    return project;
  }

  public update(
    updates: Partial<{
      name: string;
      description: string;
      visibility: 'PRIVATE' | 'PUBLIC' | 'TEAM';
      language: string;
      framework: string;
      tags: string[];
    }>,
    metadata: EventMetadata = {}
  ): void {
    if (this.isDeleted || this.archivedAt) {
      throw new Error('Cannot update archived or deleted project');
    }

    const event = new (require('./Event').ProjectUpdatedEvent)(
      this.id,
      updates,
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  public addCollaborator(
    userId: string,
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER',
    permissions: string[],
    metadata: EventMetadata = {}
  ): void {
    if (this.isDeleted || this.archivedAt) {
      throw new Error('Cannot add collaborators to archived or deleted project');
    }

    if (this.collaborators.has(userId)) {
      throw new Error('User is already a collaborator');
    }

    const event = new (require('./Event').ProjectCollaboratorAddedEvent)(
      this.id,
      userId,
      role,
      permissions,
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  public removeCollaborator(
    userId: string,
    reason: string,
    metadata: EventMetadata = {}
  ): void {
    if (!this.collaborators.has(userId)) {
      throw new Error('User is not a collaborator');
    }

    if (userId === this.ownerId) {
      throw new Error('Cannot remove project owner');
    }

    const event = new (require('./Event').ProjectCollaboratorRemovedEvent)(
      this.id,
      userId,
      reason,
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  public archive(reason: string, metadata: EventMetadata = {}): void {
    if (this.isDeleted || this.archivedAt) {
      throw new Error('Project is already archived or deleted');
    }

    const event = new (require('./Event').ProjectArchivedEvent)(
      this.id,
      new Date(),
      reason,
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  public delete(backupLocation: string, metadata: EventMetadata = {}): void {
    if (this.isDeleted) {
      throw new Error('Project is already deleted');
    }

    const event = new (require('./Event').ProjectDeletedEvent)(
      this.id,
      new Date(),
      backupLocation,
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  // Event handlers
  protected applyEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'ProjectCreated':
        this.applyProjectCreatedEvent(event as any);
        break;
      case 'ProjectUpdated':
        this.applyProjectUpdatedEvent(event as any);
        break;
      case 'ProjectCollaboratorAdded':
        this.applyProjectCollaboratorAddedEvent(event as any);
        break;
      case 'ProjectCollaboratorRemoved':
        this.applyProjectCollaboratorRemovedEvent(event as any);
        break;
      case 'ProjectArchived':
        this.applyProjectArchivedEvent(event as any);
        break;
      case 'ProjectDeleted':
        this.applyProjectDeletedEvent(event as any);
        break;
      default:
        throw new Error(`Unknown event type: ${event.eventType}`);
    }
    this.updatedAt = new Date();
  }

  private applyProjectCreatedEvent(event: any): void {
    const data = event.getData();
    this.name = data.name;
    this.description = data.description;
    this.ownerId = data.ownerId;
    this.visibility = data.visibility;
    this.language = data.language;
    this.framework = data.framework;
    this.createdAt = event.occurredAt;
    this.updatedAt = event.occurredAt;

    // Add owner as first collaborator
    this.collaborators.set(data.ownerId, {
      role: 'OWNER',
      permissions: ['READ', 'WRITE', 'DELETE', 'MANAGE_COLLABORATORS', 'MANAGE_SETTINGS'],
      joinedAt: event.occurredAt,
    });
  }

  private applyProjectUpdatedEvent(event: any): void {
    const { updates } = event.getData();
    Object.assign(this, updates);
  }

  private applyProjectCollaboratorAddedEvent(event: any): void {
    const data = event.getData();
    this.collaborators.set(data.userId, {
      role: data.role,
      permissions: data.permissions,
      joinedAt: event.occurredAt,
    });
  }

  private applyProjectCollaboratorRemovedEvent(event: any): void {
    const data = event.getData();
    this.collaborators.delete(data.userId);
  }

  private applyProjectArchivedEvent(event: any): void {
    const data = event.getData();
    this.archivedAt = data.archivedAt;
  }

  private applyProjectDeletedEvent(event: any): void {
    const data = event.getData();
    this.deletedAt = data.deletedAt;
    this.markAsDeleted();
  }

  // Getters
  public getName(): string {
    return this.name;
  }

  public getOwnerId(): string {
    return this.ownerId;
  }

  public getCollaborators(): Map<string, { role: string; permissions: string[]; joinedAt: Date }> {
    return new Map(this.collaborators);
  }

  public isArchived(): boolean {
    return !!this.archivedAt;
  }

  public hasCollaborator(userId: string): boolean {
    return this.collaborators.has(userId);
  }

  public getCollaboratorRole(userId: string): string | undefined {
    return this.collaborators.get(userId)?.role;
  }

  public getSnapshot(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerId: this.ownerId,
      visibility: this.visibility,
      language: this.language,
      framework: this.framework,
      tags: this.tags,
      collaborators: Array.from(this.collaborators.entries()).map(([userId, info]) => ({
        userId,
        ...info,
      })),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      archivedAt: this.archivedAt,
      deletedAt: this.deletedAt,
      version: this.version,
      isDeleted: this.isDeleted,
    };
  }
}

// AI Session Aggregate
export class AISessionAggregate extends AggregateRoot {
  private type!: 'CHAT' | 'CODE_GENERATION' | 'CODE_REVIEW' | 'DOCUMENTATION';
  private projectId!: string;
  private userId!: string;
  private model!: string;
  private parameters!: { temperature?: number; maxTokens?: number; systemPrompt?: string };
  private messages: Array<{
    id: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    tokensUsed: number;
    timestamp: Date;
  }> = [];
  private status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'CANCELLED' = 'ACTIVE';
  private totalTokensUsed: number = 0;
  private totalCost: number = 0;
  private createdAt!: Date;
  private completedAt?: Date;

  constructor(id?: string) {
    super(id);
  }

  // Commands
  public static start(
    type: 'CHAT' | 'CODE_GENERATION' | 'CODE_REVIEW' | 'DOCUMENTATION',
    projectId: string,
    userId: string,
    model: string,
    parameters: { temperature?: number; maxTokens?: number; systemPrompt?: string },
    metadata: EventMetadata = {}
  ): AISessionAggregate {
    const session = new AISessionAggregate();
    const event = new (require('./Event').AISessionStartedEvent)(
      session.id,
      type,
      projectId,
      userId,
      model,
      parameters,
      metadata
    );
    session.addEvent(event);
    session.applyEvent(event);
    return session;
  }

  public addMessage(
    messageId: string,
    role: 'USER' | 'ASSISTANT' | 'SYSTEM',
    content: string,
    tokensUsed: number,
    metadata: EventMetadata = {}
  ): void {
    if (this.status !== 'ACTIVE') {
      throw new Error('Cannot add messages to inactive session');
    }

    const event = new (require('./Event').AISessionMessageAddedEvent)(
      this.id,
      messageId,
      role,
      content,
      tokensUsed,
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  public complete(
    reason: 'USER_ENDED' | 'MAX_TOKENS_REACHED' | 'TIMEOUT' | 'ERROR',
    metadata: EventMetadata = {}
  ): void {
    if (this.status !== 'ACTIVE') {
      throw new Error('Session is not active');
    }

    const event = new (require('./Event').AISessionCompletedEvent)(
      this.id,
      new Date(),
      this.totalTokensUsed,
      this.totalCost,
      reason,
      metadata
    );
    this.addEvent(event);
    this.applyEvent(event);
  }

  // Event handlers
  protected applyEvent(event: DomainEvent): void {
    switch (event.eventType) {
      case 'AISessionStarted':
        this.applyAISessionStartedEvent(event as any);
        break;
      case 'AISessionMessageAdded':
        this.applyAISessionMessageAddedEvent(event as any);
        break;
      case 'AISessionCompleted':
        this.applyAISessionCompletedEvent(event as any);
        break;
      default:
        throw new Error(`Unknown event type: ${event.eventType}`);
    }
  }

  private applyAISessionStartedEvent(event: any): void {
    const data = event.getData();
    this.type = data.type;
    this.projectId = data.projectId;
    this.userId = data.userId;
    this.model = data.model;
    this.parameters = data.parameters;
    this.createdAt = event.occurredAt;
  }

  private applyAISessionMessageAddedEvent(event: any): void {
    const data = event.getData();
    this.messages.push({
      id: data.messageId,
      role: data.role,
      content: data.content,
      tokensUsed: data.tokensUsed,
      timestamp: event.occurredAt,
    });
    this.totalTokensUsed += data.tokensUsed;
    // Simple cost calculation - would be more complex in real implementation
    this.totalCost += data.tokensUsed * 0.002; // $0.002 per 1K tokens
  }

  private applyAISessionCompletedEvent(event: any): void {
    const data = event.getData();
    this.status = 'COMPLETED';
    this.completedAt = data.completedAt;
    this.totalTokensUsed = data.totalTokensUsed;
    this.totalCost = data.totalCost;
  }

  // Getters
  public getStatus(): string {
    return this.status;
  }

  public getTotalTokensUsed(): number {
    return this.totalTokensUsed;
  }

  public getTotalCost(): number {
    return this.totalCost;
  }

  public getMessages(): any[] {
    return [...this.messages];
  }

  public getSnapshot(): any {
    return {
      id: this.id,
      type: this.type,
      projectId: this.projectId,
      userId: this.userId,
      model: this.model,
      parameters: this.parameters,
      messages: this.messages,
      status: this.status,
      totalTokensUsed: this.totalTokensUsed,
      totalCost: this.totalCost,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      version: this.version,
    };
  }
}