import { DomainEvent } from '../core/Event';
import { EventStore } from '../infrastructure/EventStore';
import { MongoClient, Db, Collection } from 'mongodb';
import Redis from 'ioredis';
import { CronJob } from 'cron';
import { logger } from '../utils/logger';
import Bull, { Queue, Job } from 'bull';

export interface ProjectionConfig {
  name: string;
  eventTypes: string[];
  collectionName: string;
  batchSize: number;
  parallelWorkers: number;
  rebuildOnStart?: boolean;
}

export interface ProjectionCheckpoint {
  projectionName: string;
  lastProcessedTimestamp: Date;
  lastEventId: string;
  version: number;
  isRebuilding: boolean;
}

export abstract class Projection {
  public abstract readonly name: string;
  public abstract readonly eventTypes: string[];
  public abstract readonly collectionName: string;

  public abstract initialize(db: Db): Promise<void>;
  public abstract handle(event: DomainEvent, collection: Collection): Promise<void>;
  public abstract onRebuildStart(collection: Collection): Promise<void>;
  public abstract onRebuildComplete(collection: Collection): Promise<void>;
}

export class ProjectionEngine {
  private eventStore: EventStore;
  private db!: Db;
  private redis: Redis;
  private checkpointsCollection!: Collection<ProjectionCheckpoint>;
  private projections: Map<string, Projection> = new Map();
  private projectionQueues: Map<string, Queue> = new Map();
  private cronJobs: CronJob[] = [];
  private isRunning: boolean = false;

  constructor(
    eventStore: EventStore,
    mongoUrl: string,
    redisUrl: string,
    private databaseName: string
  ) {
    this.eventStore = eventStore;
    this.redis = new Redis(redisUrl);
  }

  public async initialize(): Promise<void> {
    try {
      const client = new MongoClient(process.env.MONGODB_URL!);
      await client.connect();
      
      this.db = client.db(this.databaseName);
      this.checkpointsCollection = this.db.collection<ProjectionCheckpoint>('projection_checkpoints');

      // Create indexes
      await this.checkpointsCollection.createIndex({ projectionName: 1 }, { unique: true });

      // Initialize all registered projections
      for (const projection of this.projections.values()) {
        await this.initializeProjection(projection);
      }

      logger.info('ProjectionEngine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ProjectionEngine', { error });
      throw error;
    }
  }

  public registerProjection(projection: Projection): void {
    this.projections.set(projection.name, projection);
    
    // Create queue for this projection
    const queue = new Bull(`projection:${projection.name}`, {
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

    this.projectionQueues.set(projection.name, queue);

    // Set up queue processor
    queue.process('process-events', 5, async (job: Job) => {
      return this.processProjectionEvents(projection.name, job.data.events);
    });

    logger.info('Projection registered', { projectionName: projection.name });
  }

  private async initializeProjection(projection: Projection): Promise<void> {
    try {
      // Initialize projection-specific collection
      await projection.initialize(this.db);

      // Get or create checkpoint
      let checkpoint = await this.checkpointsCollection.findOne({
        projectionName: projection.name,
      });

      if (!checkpoint) {
        checkpoint = {
          projectionName: projection.name,
          lastProcessedTimestamp: new Date(0),
          lastEventId: '',
          version: 1,
          isRebuilding: false,
        };

        await this.checkpointsCollection.insertOne(checkpoint);
        logger.info('Created initial checkpoint for projection', {
          projectionName: projection.name,
        });
      }

      // Check if rebuild is needed
      const config = this.getProjectionConfig(projection.name);
      if (config?.rebuildOnStart || checkpoint.isRebuilding) {
        await this.rebuildProjection(projection.name);
      }

    } catch (error) {
      logger.error('Failed to initialize projection', {
        error,
        projectionName: projection.name,
      });
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('ProjectionEngine is already running');
      return;
    }

    this.isRunning = true;

    // Start continuous processing for each projection
    for (const projectionName of this.projections.keys()) {
      this.startProjectionProcessing(projectionName);
    }

    // Set up periodic catchup job
    const catchupJob = new CronJob('*/30 * * * * *', () => { // Every 30 seconds
      this.catchupAllProjections().catch(error => {
        logger.error('Error in catchup job', { error });
      });
    });

    this.cronJobs.push(catchupJob);
    catchupJob.start();

    // Subscribe to real-time events
    await this.subscribeToEvents();

    logger.info('ProjectionEngine started successfully');
  }

  public async stop(): Promise<void> {
    this.isRunning = false;

    // Stop cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];

    // Close queues
    for (const queue of this.projectionQueues.values()) {
      await queue.close();
    }

    // Unsubscribe from events
    await this.redis.unsubscribe();

    logger.info('ProjectionEngine stopped');
  }

  private async subscribeToEvents(): Promise<void> {
    const subscriber = this.redis.duplicate();
    
    await subscriber.subscribe('domain-events');
    
    subscriber.on('message', async (channel, message) => {
      if (channel === 'domain-events') {
        try {
          const eventData = JSON.parse(message);
          await this.processRealtimeEvent(eventData);
        } catch (error) {
          logger.error('Error processing realtime event', { error, message });
        }
      }
    });
  }

  private async processRealtimeEvent(eventData: any): Promise<void> {
    // Find projections that are interested in this event type
    const interestedProjections = Array.from(this.projections.values())
      .filter(projection => projection.eventTypes.includes(eventData.eventType));

    // Queue event for processing by interested projections
    for (const projection of interestedProjections) {
      const queue = this.projectionQueues.get(projection.name);
      if (queue) {
        await queue.add('process-events', { events: [eventData] }, {
          priority: 10, // High priority for real-time events
        });
      }
    }
  }

  private async startProjectionProcessing(projectionName: string): Promise<void> {
    const processingJob = new CronJob('*/10 * * * * *', () => { // Every 10 seconds
      this.catchupProjection(projectionName).catch(error => {
        logger.error('Error in projection processing', { error, projectionName });
      });
    });

    this.cronJobs.push(processingJob);
    processingJob.start();
  }

  private async catchupAllProjections(): Promise<void> {
    const projectionNames = Array.from(this.projections.keys());
    
    await Promise.allSettled(
      projectionNames.map(name => this.catchupProjection(name))
    );
  }

  private async catchupProjection(projectionName: string): Promise<void> {
    const projection = this.projections.get(projectionName);
    if (!projection) {
      return;
    }

    try {
      const checkpoint = await this.checkpointsCollection.findOne({
        projectionName,
      });

      if (!checkpoint || checkpoint.isRebuilding) {
        return; // Skip if rebuilding
      }

      // Get events since last checkpoint
      const events = await this.eventStore.getEventsForProjection(
        projection.eventTypes,
        checkpoint.lastProcessedTimestamp,
        this.getProjectionConfig(projectionName)?.batchSize || 100
      );

      if (events.length === 0) {
        return;
      }

      // Queue events for processing
      const queue = this.projectionQueues.get(projectionName);
      if (queue) {
        await queue.add('process-events', { events: events.map(e => e.toJSON()) }, {
          priority: 5, // Normal priority for catchup events
        });
      }

    } catch (error) {
      logger.error('Error in projection catchup', { error, projectionName });
    }
  }

  private async processProjectionEvents(projectionName: string, eventDataArray: any[]): Promise<void> {
    const projection = this.projections.get(projectionName);
    if (!projection) {
      throw new Error(`Projection not found: ${projectionName}`);
    }

    const collection = this.db.collection(projection.collectionName);
    let lastProcessedTimestamp = new Date(0);
    let lastEventId = '';

    try {
      // Process events in order
      for (const eventData of eventDataArray) {
        const event = this.deserializeEvent(eventData);
        
        await projection.handle(event, collection);
        
        lastProcessedTimestamp = event.occurredAt;
        lastEventId = event.id;
      }

      // Update checkpoint
      await this.updateCheckpoint(projectionName, lastProcessedTimestamp, lastEventId);

      logger.debug('Processed events for projection', {
        projectionName,
        eventCount: eventDataArray.length,
        lastProcessedTimestamp,
      });

    } catch (error) {
      logger.error('Error processing projection events', {
        error,
        projectionName,
        eventCount: eventDataArray.length,
      });
      throw error;
    }
  }

  private async updateCheckpoint(
    projectionName: string,
    lastProcessedTimestamp: Date,
    lastEventId: string
  ): Promise<void> {
    await this.checkpointsCollection.updateOne(
      { projectionName },
      {
        $set: {
          lastProcessedTimestamp,
          lastEventId,
        },
        $inc: { version: 1 },
      }
    );
  }

  public async rebuildProjection(projectionName: string): Promise<void> {
    const projection = this.projections.get(projectionName);
    if (!projection) {
      throw new Error(`Projection not found: ${projectionName}`);
    }

    logger.info('Starting projection rebuild', { projectionName });

    try {
      // Mark as rebuilding
      await this.checkpointsCollection.updateOne(
        { projectionName },
        { $set: { isRebuilding: true } }
      );

      const collection = this.db.collection(projection.collectionName);
      
      // Clear existing data and notify projection
      await projection.onRebuildStart(collection);

      // Get all events for this projection
      const events = await this.eventStore.getEventsForProjection(
        projection.eventTypes,
        undefined, // From beginning
        10000 // Large batch size for rebuild
      );

      // Process events in batches
      const batchSize = 1000;
      for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize);
        
        for (const event of batch) {
          await projection.handle(event, collection);
        }

        logger.info('Rebuild progress', {
          projectionName,
          processed: Math.min(i + batchSize, events.length),
          total: events.length,
        });
      }

      // Notify projection that rebuild is complete
      await projection.onRebuildComplete(collection);

      // Update checkpoint
      const lastEvent = events[events.length - 1];
      await this.checkpointsCollection.updateOne(
        { projectionName },
        {
          $set: {
            lastProcessedTimestamp: lastEvent ? lastEvent.occurredAt : new Date(),
            lastEventId: lastEvent ? lastEvent.id : '',
            isRebuilding: false,
          },
          $inc: { version: 1 },
        }
      );

      logger.info('Projection rebuild completed', {
        projectionName,
        eventsProcessed: events.length,
      });

    } catch (error) {
      logger.error('Error rebuilding projection', { error, projectionName });
      
      // Mark as not rebuilding on error
      await this.checkpointsCollection.updateOne(
        { projectionName },
        { $set: { isRebuilding: false } }
      );
      
      throw error;
    }
  }

  private deserializeEvent(eventData: any): DomainEvent {
    // This would use the same deserialization logic as EventStore
    const { EventTypeRegistry } = require('../core/Event');
    const EventClass = EventTypeRegistry[eventData.eventType];
    
    if (!EventClass) {
      throw new Error(`Unknown event type: ${eventData.eventType}`);
    }

    const event = Object.create(EventClass.prototype);
    Object.assign(event, eventData);
    return event;
  }

  private getProjectionConfig(projectionName: string): ProjectionConfig | undefined {
    // This would come from configuration
    const configs: { [key: string]: ProjectionConfig } = {
      'UserProjection': {
        name: 'UserProjection',
        eventTypes: ['UserRegistered', 'UserEmailVerified', 'UserProfileUpdated', 'UserDeleted'],
        collectionName: 'user_projections',
        batchSize: 100,
        parallelWorkers: 2,
        rebuildOnStart: false,
      },
      'ProjectProjection': {
        name: 'ProjectProjection',
        eventTypes: ['ProjectCreated', 'ProjectUpdated', 'ProjectArchived', 'ProjectDeleted'],
        collectionName: 'project_projections',
        batchSize: 100,
        parallelWorkers: 2,
        rebuildOnStart: false,
      },
      'AIUsageProjection': {
        name: 'AIUsageProjection',
        eventTypes: ['AISessionStarted', 'AISessionCompleted', 'AISessionMessageAdded'],
        collectionName: 'ai_usage_projections',
        batchSize: 500,
        parallelWorkers: 3,
        rebuildOnStart: false,
      },
    };

    return configs[projectionName];
  }

  public async getProjectionStatus(projectionName?: string): Promise<any> {
    const query = projectionName ? { projectionName } : {};
    const checkpoints = await this.checkpointsCollection.find(query).toArray();
    
    const status = await Promise.all(
      checkpoints.map(async checkpoint => {
        const queue = this.projectionQueues.get(checkpoint.projectionName);
        const queueCounts = queue ? await queue.getJobCounts() : null;

        return {
          name: checkpoint.projectionName,
          lastProcessedTimestamp: checkpoint.lastProcessedTimestamp,
          version: checkpoint.version,
          isRebuilding: checkpoint.isRebuilding,
          queueStatus: queueCounts,
          isHealthy: !checkpoint.isRebuilding && queueCounts?.failed === 0,
        };
      })
    );

    return projectionName ? status[0] : status;
  }

  public async resetProjection(projectionName: string): Promise<void> {
    const projection = this.projections.get(projectionName);
    if (!projection) {
      throw new Error(`Projection not found: ${projectionName}`);
    }

    logger.info('Resetting projection', { projectionName });

    // Reset checkpoint
    await this.checkpointsCollection.updateOne(
      { projectionName },
      {
        $set: {
          lastProcessedTimestamp: new Date(0),
          lastEventId: '',
          isRebuilding: false,
        },
        $inc: { version: 1 },
      }
    );

    // Clear projection data
    const collection = this.db.collection(projection.collectionName);
    await collection.deleteMany({});

    logger.info('Projection reset completed', { projectionName });
  }

  public async healthCheck(): Promise<{ 
    mongodb: boolean; 
    redis: boolean; 
    projections: { [key: string]: boolean } 
  }> {
    const health = {
      mongodb: false,
      redis: false,
      projections: {} as { [key: string]: boolean },
    };

    try {
      await this.db.admin().ping();
      health.mongodb = true;
    } catch (error) {
      logger.error('MongoDB health check failed', { error });
    }

    try {
      await this.redis.ping();
      health.redis = true;
    } catch (error) {
      logger.error('Redis health check failed', { error });
    }

    // Check projection health
    for (const projectionName of this.projections.keys()) {
      try {
        const status = await this.getProjectionStatus(projectionName);
        health.projections[projectionName] = status.isHealthy;
      } catch (error) {
        health.projections[projectionName] = false;
      }
    }

    return health;
  }
}