import { EventStore } from '../infrastructure/EventStore';
import { AggregateRoot, UserAggregate, ProjectAggregate, AISessionAggregate } from '../core/AggregateRoot';
import { EventMetadata } from '../core/Event';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import Bull, { Queue, Job } from 'bull';
import Redis from 'ioredis';

export interface Command {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  payload: any;
  metadata: EventMetadata;
  timestamp: Date;
}

export interface CommandResult {
  success: boolean;
  aggregateId: string;
  version: number;
  events?: any[];
  error?: string;
}

export abstract class CommandHandler<TCommand extends Command, TAggregate extends AggregateRoot> {
  constructor(protected eventStore: EventStore, protected aggregateType: new (id?: string) => TAggregate) {}

  public abstract canHandle(command: Command): boolean;
  public abstract handle(command: TCommand): Promise<CommandResult>;

  protected async loadAggregate(aggregateId: string): Promise<TAggregate | null> {
    return this.eventStore.loadAggregate(this.aggregateType, aggregateId);
  }

  protected async saveAggregate(aggregate: TAggregate): Promise<void> {
    await this.eventStore.saveAggregate(aggregate);
  }
}

export class CommandBus {
  private handlers: Map<string, CommandHandler<any, any>> = new Map();
  private commandQueue: Queue;
  private redis: Redis;

  constructor(private eventStore: EventStore, redisUrl: string) {
    this.redis = new Redis(redisUrl);
    this.commandQueue = new Bull('command-processing', {
      redis: {
        host: this.redis.options.host,
        port: this.redis.options.port,
        password: this.redis.options.password,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // Process commands
    this.commandQueue.process('execute-command', 10, async (job: Job) => {
      return this.processCommand(job.data.command);
    });
  }

  public registerHandler(commandType: string, handler: CommandHandler<any, any>): void {
    this.handlers.set(commandType, handler);
    logger.info('Command handler registered', { commandType });
  }

  public async send(command: Command): Promise<CommandResult> {
    // Add command to queue for async processing
    const job = await this.commandQueue.add('execute-command', { command }, {
      priority: command.metadata.priority || 5,
      delay: command.metadata.delay || 0,
    });

    // For synchronous processing, wait for job completion
    if (command.metadata.synchronous) {
      const result = await job.finished();
      return result as CommandResult;
    }

    // For async processing, return immediately
    return {
      success: true,
      aggregateId: command.aggregateId,
      version: 0,
    };
  }

  private async processCommand(command: Command): Promise<CommandResult> {
    const startTime = Date.now();
    
    try {
      logger.info('Processing command', {
        commandId: command.id,
        commandType: command.type,
        aggregateId: command.aggregateId,
        aggregateType: command.aggregateType,
      });

      const handler = this.handlers.get(command.type);
      if (!handler) {
        throw new Error(`No handler registered for command type: ${command.type}`);
      }

      if (!handler.canHandle(command)) {
        throw new Error(`Handler cannot process command: ${command.type}`);
      }

      const result = await handler.handle(command);
      
      const processingTime = Date.now() - startTime;
      
      logger.info('Command processed successfully', {
        commandId: command.id,
        commandType: command.type,
        aggregateId: command.aggregateId,
        version: result.version,
        processingTime,
      });

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Command processing failed', {
        error,
        commandId: command.id,
        commandType: command.type,
        aggregateId: command.aggregateId,
        processingTime,
      });

      return {
        success: false,
        aggregateId: command.aggregateId,
        version: 0,
        error: error.message,
      };
    }
  }

  public async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    return this.commandQueue.getJobCounts();
  }

  public async close(): Promise<void> {
    await this.commandQueue.close();
    await this.redis.quit();
  }
}

// User Commands and Handlers
export interface RegisterUserCommand extends Command {
  type: 'RegisterUser';
  payload: {
    email: string;
    firstName: string;
    lastName: string;
    hashedPassword: string;
  };
}

export interface VerifyUserEmailCommand extends Command {
  type: 'VerifyUserEmail';
  payload: {};
}

export interface UpdateUserProfileCommand extends Command {
  type: 'UpdateUserProfile';
  payload: {
    updates: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
      bio?: string;
    };
  };
}

export interface DeleteUserCommand extends Command {
  type: 'DeleteUser';
  payload: {
    reason: string;
  };
}

export class UserCommandHandler extends CommandHandler<Command, UserAggregate> {
  constructor(eventStore: EventStore) {
    super(eventStore, UserAggregate);
  }

  public canHandle(command: Command): boolean {
    const userCommandTypes = ['RegisterUser', 'VerifyUserEmail', 'UpdateUserProfile', 'DeleteUser'];
    return userCommandTypes.includes(command.type);
  }

  public async handle(command: Command): Promise<CommandResult> {
    switch (command.type) {
      case 'RegisterUser':
        return this.handleRegisterUser(command as RegisterUserCommand);
      case 'VerifyUserEmail':
        return this.handleVerifyUserEmail(command as VerifyUserEmailCommand);
      case 'UpdateUserProfile':
        return this.handleUpdateUserProfile(command as UpdateUserProfileCommand);
      case 'DeleteUser':
        return this.handleDeleteUser(command as DeleteUserCommand);
      default:
        throw new Error(`Unhandled command type: ${command.type}`);
    }
  }

  private async handleRegisterUser(command: RegisterUserCommand): Promise<CommandResult> {
    const { email, firstName, lastName, hashedPassword } = command.payload;
    
    // Check if user already exists (this would be optimized with a projection)
    const existingUser = await this.loadAggregate(command.aggregateId);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = UserAggregate.register(email, firstName, lastName, hashedPassword, command.metadata);
    await this.saveAggregate(user);

    return {
      success: true,
      aggregateId: user.id,
      version: user.version,
      events: user.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleVerifyUserEmail(command: VerifyUserEmailCommand): Promise<CommandResult> {
    const user = await this.loadAggregate(command.aggregateId);
    if (!user) {
      throw new Error('User not found');
    }

    user.verifyEmail(command.metadata);
    await this.saveAggregate(user);

    return {
      success: true,
      aggregateId: user.id,
      version: user.version,
      events: user.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleUpdateUserProfile(command: UpdateUserProfileCommand): Promise<CommandResult> {
    const user = await this.loadAggregate(command.aggregateId);
    if (!user) {
      throw new Error('User not found');
    }

    user.updateProfile(command.payload.updates, command.metadata);
    await this.saveAggregate(user);

    return {
      success: true,
      aggregateId: user.id,
      version: user.version,
      events: user.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleDeleteUser(command: DeleteUserCommand): Promise<CommandResult> {
    const user = await this.loadAggregate(command.aggregateId);
    if (!user) {
      throw new Error('User not found');
    }

    user.delete(command.payload.reason, command.metadata);
    await this.saveAggregate(user);

    return {
      success: true,
      aggregateId: user.id,
      version: user.version,
      events: user.getUncommittedEvents().map(e => e.toJSON()),
    };
  }
}

// Project Commands and Handlers
export interface CreateProjectCommand extends Command {
  type: 'CreateProject';
  payload: {
    name: string;
    description: string;
    ownerId: string;
    visibility: 'PRIVATE' | 'PUBLIC' | 'TEAM';
    language?: string;
    framework?: string;
  };
}

export interface UpdateProjectCommand extends Command {
  type: 'UpdateProject';
  payload: {
    updates: {
      name?: string;
      description?: string;
      visibility?: 'PRIVATE' | 'PUBLIC' | 'TEAM';
      language?: string;
      framework?: string;
      tags?: string[];
    };
  };
}

export interface AddProjectCollaboratorCommand extends Command {
  type: 'AddProjectCollaborator';
  payload: {
    userId: string;
    role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
    permissions: string[];
  };
}

export interface RemoveProjectCollaboratorCommand extends Command {
  type: 'RemoveProjectCollaborator';
  payload: {
    userId: string;
    reason: string;
  };
}

export interface ArchiveProjectCommand extends Command {
  type: 'ArchiveProject';
  payload: {
    reason: string;
  };
}

export interface DeleteProjectCommand extends Command {
  type: 'DeleteProject';
  payload: {
    backupLocation: string;
  };
}

export class ProjectCommandHandler extends CommandHandler<Command, ProjectAggregate> {
  constructor(eventStore: EventStore) {
    super(eventStore, ProjectAggregate);
  }

  public canHandle(command: Command): boolean {
    const projectCommandTypes = [
      'CreateProject',
      'UpdateProject', 
      'AddProjectCollaborator',
      'RemoveProjectCollaborator',
      'ArchiveProject',
      'DeleteProject'
    ];
    return projectCommandTypes.includes(command.type);
  }

  public async handle(command: Command): Promise<CommandResult> {
    switch (command.type) {
      case 'CreateProject':
        return this.handleCreateProject(command as CreateProjectCommand);
      case 'UpdateProject':
        return this.handleUpdateProject(command as UpdateProjectCommand);
      case 'AddProjectCollaborator':
        return this.handleAddCollaborator(command as AddProjectCollaboratorCommand);
      case 'RemoveProjectCollaborator':
        return this.handleRemoveCollaborator(command as RemoveProjectCollaboratorCommand);
      case 'ArchiveProject':
        return this.handleArchiveProject(command as ArchiveProjectCommand);
      case 'DeleteProject':
        return this.handleDeleteProject(command as DeleteProjectCommand);
      default:
        throw new Error(`Unhandled command type: ${command.type}`);
    }
  }

  private async handleCreateProject(command: CreateProjectCommand): Promise<CommandResult> {
    const { name, description, ownerId, visibility, language, framework } = command.payload;
    
    const project = ProjectAggregate.create(
      name,
      description,
      ownerId,
      visibility,
      language,
      framework,
      command.metadata
    );
    
    await this.saveAggregate(project);

    return {
      success: true,
      aggregateId: project.id,
      version: project.version,
      events: project.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleUpdateProject(command: UpdateProjectCommand): Promise<CommandResult> {
    const project = await this.loadAggregate(command.aggregateId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.update(command.payload.updates, command.metadata);
    await this.saveAggregate(project);

    return {
      success: true,
      aggregateId: project.id,
      version: project.version,
      events: project.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleAddCollaborator(command: AddProjectCollaboratorCommand): Promise<CommandResult> {
    const project = await this.loadAggregate(command.aggregateId);
    if (!project) {
      throw new Error('Project not found');
    }

    const { userId, role, permissions } = command.payload;
    project.addCollaborator(userId, role, permissions, command.metadata);
    await this.saveAggregate(project);

    return {
      success: true,
      aggregateId: project.id,
      version: project.version,
      events: project.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleRemoveCollaborator(command: RemoveProjectCollaboratorCommand): Promise<CommandResult> {
    const project = await this.loadAggregate(command.aggregateId);
    if (!project) {
      throw new Error('Project not found');
    }

    const { userId, reason } = command.payload;
    project.removeCollaborator(userId, reason, command.metadata);
    await this.saveAggregate(project);

    return {
      success: true,
      aggregateId: project.id,
      version: project.version,
      events: project.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleArchiveProject(command: ArchiveProjectCommand): Promise<CommandResult> {
    const project = await this.loadAggregate(command.aggregateId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.archive(command.payload.reason, command.metadata);
    await this.saveAggregate(project);

    return {
      success: true,
      aggregateId: project.id,
      version: project.version,
      events: project.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleDeleteProject(command: DeleteProjectCommand): Promise<CommandResult> {
    const project = await this.loadAggregate(command.aggregateId);
    if (!project) {
      throw new Error('Project not found');
    }

    project.delete(command.payload.backupLocation, command.metadata);
    await this.saveAggregate(project);

    return {
      success: true,
      aggregateId: project.id,
      version: project.version,
      events: project.getUncommittedEvents().map(e => e.toJSON()),
    };
  }
}

// AI Session Commands and Handlers
export interface StartAISessionCommand extends Command {
  type: 'StartAISession';
  payload: {
    type: 'CHAT' | 'CODE_GENERATION' | 'CODE_REVIEW' | 'DOCUMENTATION';
    projectId: string;
    userId: string;
    model: string;
    parameters: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    };
  };
}

export interface AddAIMessageCommand extends Command {
  type: 'AddAIMessage';
  payload: {
    messageId: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    tokensUsed: number;
  };
}

export interface CompleteAISessionCommand extends Command {
  type: 'CompleteAISession';
  payload: {
    reason: 'USER_ENDED' | 'MAX_TOKENS_REACHED' | 'TIMEOUT' | 'ERROR';
  };
}

export class AISessionCommandHandler extends CommandHandler<Command, AISessionAggregate> {
  constructor(eventStore: EventStore) {
    super(eventStore, AISessionAggregate);
  }

  public canHandle(command: Command): boolean {
    const aiCommandTypes = ['StartAISession', 'AddAIMessage', 'CompleteAISession'];
    return aiCommandTypes.includes(command.type);
  }

  public async handle(command: Command): Promise<CommandResult> {
    switch (command.type) {
      case 'StartAISession':
        return this.handleStartSession(command as StartAISessionCommand);
      case 'AddAIMessage':
        return this.handleAddMessage(command as AddAIMessageCommand);
      case 'CompleteAISession':
        return this.handleCompleteSession(command as CompleteAISessionCommand);
      default:
        throw new Error(`Unhandled command type: ${command.type}`);
    }
  }

  private async handleStartSession(command: StartAISessionCommand): Promise<CommandResult> {
    const { type, projectId, userId, model, parameters } = command.payload;
    
    const session = AISessionAggregate.start(
      type,
      projectId,
      userId,
      model,
      parameters,
      command.metadata
    );
    
    await this.saveAggregate(session);

    return {
      success: true,
      aggregateId: session.id,
      version: session.version,
      events: session.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleAddMessage(command: AddAIMessageCommand): Promise<CommandResult> {
    const session = await this.loadAggregate(command.aggregateId);
    if (!session) {
      throw new Error('AI session not found');
    }

    const { messageId, role, content, tokensUsed } = command.payload;
    session.addMessage(messageId, role, content, tokensUsed, command.metadata);
    await this.saveAggregate(session);

    return {
      success: true,
      aggregateId: session.id,
      version: session.version,
      events: session.getUncommittedEvents().map(e => e.toJSON()),
    };
  }

  private async handleCompleteSession(command: CompleteAISessionCommand): Promise<CommandResult> {
    const session = await this.loadAggregate(command.aggregateId);
    if (!session) {
      throw new Error('AI session not found');
    }

    session.complete(command.payload.reason, command.metadata);
    await this.saveAggregate(session);

    return {
      success: true,
      aggregateId: session.id,
      version: session.version,
      events: session.getUncommittedEvents().map(e => e.toJSON()),
    };
  }
}

// Command Factory
export class CommandFactory {
  public static createCommand(
    type: string,
    aggregateId: string,
    aggregateType: string,
    payload: any,
    metadata: Partial<EventMetadata> = {}
  ): Command {
    return {
      id: uuidv4(),
      type,
      aggregateId,
      aggregateType,
      payload,
      metadata: {
        ...metadata,
        timestamp: new Date(),
      } as EventMetadata,
      timestamp: new Date(),
    };
  }
}