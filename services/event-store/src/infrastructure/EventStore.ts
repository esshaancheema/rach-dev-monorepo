import { DomainEvent, EventTypeRegistry } from '../core/Event';
import { AggregateRoot } from '../core/AggregateRoot';
import { MongoClient, Db, Collection } from 'mongodb';
import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export interface EventStoreConfig {
  mongoUrl: string;
  redisUrl: string;
  databaseName: string;
  eventsCollectionName: string;
  snapshotsCollectionName: string;
  batchSize: number;
  snapshotFrequency: number;
}

export interface StoredEvent {
  _id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: any;
  eventMetadata: any;
  version: number;
  timestamp: Date;
  correlationId?: string;
  causationId?: string;
}

export interface Snapshot {
  _id: string;
  aggregateId: string;
  aggregateType: string;
  data: any;
  version: number;
  timestamp: Date;
}

export interface EventStream {
  aggregateId: string;
  aggregateType: string;
  events: DomainEvent[];
  version: number;
}

export class EventStore {
  private db!: Db;
  private eventsCollection!: Collection<StoredEvent>;
  private snapshotsCollection!: Collection<Snapshot>;
  private redis: Redis;
  private config: EventStoreConfig;

  constructor(config: EventStoreConfig) {
    this.config = config;
    this.redis = new Redis(config.redisUrl);
  }

  public async initialize(): Promise<void> {
    try {
      const client = new MongoClient(this.config.mongoUrl);
      await client.connect();
      
      this.db = client.db(this.config.databaseName);
      this.eventsCollection = this.db.collection<StoredEvent>(this.config.eventsCollectionName);
      this.snapshotsCollection = this.db.collection<Snapshot>(this.config.snapshotsCollectionName);

      // Create indexes for performance
      await this.createIndexes();

      logger.info('EventStore initialized successfully', {
        database: this.config.databaseName,
        eventsCollection: this.config.eventsCollectionName,
        snapshotsCollection: this.config.snapshotsCollectionName,
      });
    } catch (error) {
      logger.error('Failed to initialize EventStore', { error });
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    // Events collection indexes
    await this.eventsCollection.createIndex({ aggregateId: 1, version: 1 }, { unique: true });
    await this.eventsCollection.createIndex({ aggregateType: 1, timestamp: -1 });
    await this.eventsCollection.createIndex({ eventType: 1, timestamp: -1 });
    await this.eventsCollection.createIndex({ timestamp: -1 });
    await this.eventsCollection.createIndex({ correlationId: 1 });
    await this.eventsCollection.createIndex({ 'eventMetadata.userId': 1, timestamp: -1 });
    await this.eventsCollection.createIndex({ 'eventMetadata.tenantId': 1, timestamp: -1 });

    // Snapshots collection indexes
    await this.snapshotsCollection.createIndex({ aggregateId: 1, version: -1 });
    await this.snapshotsCollection.createIndex({ aggregateType: 1, timestamp: -1 });

    logger.info('EventStore indexes created successfully');
  }

  public async saveEvents(
    aggregateId: string,
    expectedVersion: number,
    events: DomainEvent[]
  ): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const session = this.db.client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Check current version
        const lastEvent = await this.eventsCollection.findOne(
          { aggregateId },
          { sort: { version: -1 }, session }
        );

        const currentVersion = lastEvent ? lastEvent.version : 0;
        
        if (currentVersion !== expectedVersion) {
          throw new Error(
            `Concurrency conflict: Expected version ${expectedVersion}, but current version is ${currentVersion}`
          );
        }

        // Prepare events for storage
        const storedEvents: StoredEvent[] = events.map((event, index) => ({
          _id: event.id,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.eventType,
          eventData: event.getData(),
          eventMetadata: event.metadata,
          version: expectedVersion + index + 1,
          timestamp: event.occurredAt,
          correlationId: event.metadata.correlationId,
          causationId: event.metadata.causationId,
        }));

        // Insert events
        await this.eventsCollection.insertMany(storedEvents, { session });

        logger.info('Events saved successfully', {
          aggregateId,
          eventCount: events.length,
          expectedVersion,
          newVersion: expectedVersion + events.length,
        });
      });

      // Invalidate cache after successful save
      await this.invalidateCacheForAggregate(aggregateId);

      // Publish events asynchronously
      this.publishEvents(events).catch(error => {
        logger.error('Failed to publish events', { error, aggregateId });
      });

    } catch (error) {
      logger.error('Failed to save events', { error, aggregateId, expectedVersion });
      throw error;
    } finally {
      await session.endSession();
    }
  }

  public async getEventStream(
    aggregateId: string,
    fromVersion?: number
  ): Promise<EventStream | null> {
    try {
      // Try to get from cache first
      const cachedStream = await this.getCachedEventStream(aggregateId, fromVersion);
      if (cachedStream) {
        return cachedStream;
      }

      // Get from database
      const query: any = { aggregateId };
      if (fromVersion !== undefined) {
        query.version = { $gt: fromVersion };
      }

      const storedEvents = await this.eventsCollection
        .find(query)
        .sort({ version: 1 })
        .toArray();

      if (storedEvents.length === 0) {
        return null;
      }

      // Convert stored events to domain events
      const events = storedEvents.map(storedEvent => this.toDomainEvent(storedEvent));

      const eventStream: EventStream = {
        aggregateId,
        aggregateType: storedEvents[0].aggregateType,
        events,
        version: storedEvents[storedEvents.length - 1].version,
      };

      // Cache the event stream
      await this.cacheEventStream(eventStream);

      return eventStream;
    } catch (error) {
      logger.error('Failed to get event stream', { error, aggregateId, fromVersion });
      throw error;
    }
  }

  public async getEventsForProjection(
    eventTypes: string[],
    fromTimestamp?: Date,
    batchSize: number = this.config.batchSize
  ): Promise<DomainEvent[]> {
    try {
      const query: any = {};
      
      if (eventTypes.length > 0) {
        query.eventType = { $in: eventTypes };
      }
      
      if (fromTimestamp) {
        query.timestamp = { $gt: fromTimestamp };
      }

      const storedEvents = await this.eventsCollection
        .find(query)
        .sort({ timestamp: 1 })
        .limit(batchSize)
        .toArray();

      return storedEvents.map(storedEvent => this.toDomainEvent(storedEvent));
    } catch (error) {
      logger.error('Failed to get events for projection', { error, eventTypes, fromTimestamp });
      throw error;
    }
  }

  public async saveSnapshot(aggregate: AggregateRoot): Promise<void> {
    try {
      const snapshot: Snapshot = {
        _id: uuidv4(),
        aggregateId: aggregate.id,
        aggregateType: aggregate.constructor.name.replace('Aggregate', ''),
        data: (aggregate as any).getSnapshot(),
        version: aggregate.version,
        timestamp: new Date(),
      };

      await this.snapshotsCollection.replaceOne(
        { aggregateId: aggregate.id },
        snapshot,
        { upsert: true }
      );

      logger.info('Snapshot saved successfully', {
        aggregateId: aggregate.id,
        version: aggregate.version,
      });
    } catch (error) {
      logger.error('Failed to save snapshot', { error, aggregateId: aggregate.id });
      throw error;
    }
  }

  public async getSnapshot(aggregateId: string): Promise<Snapshot | null> {
    try {
      const snapshot = await this.snapshotsCollection.findOne(
        { aggregateId },
        { sort: { version: -1 } }
      );

      return snapshot;
    } catch (error) {
      logger.error('Failed to get snapshot', { error, aggregateId });
      throw error;
    }
  }

  public async loadAggregate<T extends AggregateRoot>(
    aggregateType: new (id?: string) => T,
    aggregateId: string
  ): Promise<T | null> {
    try {
      let aggregate = new aggregateType(aggregateId);
      let fromVersion = 0;

      // Try to load from snapshot first
      const snapshot = await this.getSnapshot(aggregateId);
      if (snapshot) {
        aggregate = this.createAggregateFromSnapshot<T>(aggregateType, snapshot);
        fromVersion = snapshot.version;
      }

      // Load events after snapshot
      const eventStream = await this.getEventStream(aggregateId, fromVersion);
      if (!eventStream || eventStream.events.length === 0) {
        return snapshot ? aggregate : null;
      }

      aggregate.loadFromHistory(eventStream.events);
      
      // Create snapshot if enough events have been processed
      if (eventStream.events.length >= this.config.snapshotFrequency) {
        this.saveSnapshot(aggregate).catch(error => {
          logger.error('Failed to save automatic snapshot', { error, aggregateId });
        });
      }

      return aggregate;
    } catch (error) {
      logger.error('Failed to load aggregate', { error, aggregateId });
      throw error;
    }
  }

  public async saveAggregate(aggregate: AggregateRoot): Promise<void> {
    const events = aggregate.getUncommittedEvents();
    if (events.length === 0) {
      return;
    }

    await this.saveEvents(aggregate.id, aggregate.version - events.length, events);
    aggregate.clearUncommittedEvents();
  }

  private async getCachedEventStream(
    aggregateId: string,
    fromVersion?: number
  ): Promise<EventStream | null> {
    try {
      const cacheKey = `eventstream:${aggregateId}:${fromVersion || 0}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          events: parsed.events.map((eventData: any) => this.deserializeEvent(eventData)),
        };
      }

      return null;
    } catch (error) {
      logger.warn('Failed to get cached event stream', { error, aggregateId });
      return null;
    }
  }

  private async cacheEventStream(eventStream: EventStream): Promise<void> {
    try {
      const cacheKey = `eventstream:${eventStream.aggregateId}:0`;
      const serialized = {
        ...eventStream,
        events: eventStream.events.map(event => event.toJSON()),
      };
      
      await this.redis.setex(cacheKey, 300, JSON.stringify(serialized)); // 5 minutes cache
    } catch (error) {
      logger.warn('Failed to cache event stream', { error, aggregateId: eventStream.aggregateId });
    }
  }

  private async invalidateCacheForAggregate(aggregateId: string): Promise<void> {
    try {
      const pattern = `eventstream:${aggregateId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.warn('Failed to invalidate cache', { error, aggregateId });
    }
  }

  private async publishEvents(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      try {
        // Publish to Redis for immediate processing
        await this.redis.publish('domain-events', JSON.stringify(event.toJSON()));
        
        // Publish to specific channel for event type
        await this.redis.publish(`domain-events:${event.eventType}`, JSON.stringify(event.toJSON()));
        
        // Publish to aggregate-specific channel
        await this.redis.publish(
          `domain-events:${event.aggregateType}:${event.aggregateId}`,
          JSON.stringify(event.toJSON())
        );
      } catch (error) {
        logger.error('Failed to publish event', { error, eventId: event.id });
      }
    }
  }

  private toDomainEvent(storedEvent: StoredEvent): DomainEvent {
    const EventClass = EventTypeRegistry[storedEvent.eventType];
    if (!EventClass) {
      throw new Error(`Unknown event type: ${storedEvent.eventType}`);
    }

    // Create event with stored data
    const event = Object.create(EventClass.prototype);
    Object.assign(event, {
      id: storedEvent._id,
      aggregateId: storedEvent.aggregateId,
      aggregateType: storedEvent.aggregateType,
      eventType: storedEvent.eventType,
      occurredAt: storedEvent.timestamp,
      metadata: storedEvent.eventMetadata,
      version: storedEvent.version,
      ...storedEvent.eventData,
    });

    return event;
  }

  private deserializeEvent(eventData: any): DomainEvent {
    const EventClass = EventTypeRegistry[eventData.eventType];
    if (!EventClass) {
      throw new Error(`Unknown event type: ${eventData.eventType}`);
    }

    const event = Object.create(EventClass.prototype);
    Object.assign(event, eventData);
    return event;
  }

  private createAggregateFromSnapshot<T extends AggregateRoot>(
    aggregateType: new (id?: string) => T,
    snapshot: Snapshot
  ): T {
    const aggregate = new aggregateType(snapshot.aggregateId);
    
    // Restore state from snapshot
    Object.assign(aggregate, snapshot.data);
    
    // Set version from snapshot
    for (let i = 0; i < snapshot.version; i++) {
      aggregate.incrementVersion();
    }

    return aggregate;
  }

  public async getEventsByCorrelationId(correlationId: string): Promise<DomainEvent[]> {
    try {
      const storedEvents = await this.eventsCollection
        .find({ correlationId })
        .sort({ timestamp: 1 })
        .toArray();

      return storedEvents.map(storedEvent => this.toDomainEvent(storedEvent));
    } catch (error) {
      logger.error('Failed to get events by correlation ID', { error, correlationId });
      throw error;
    }
  }

  public async getEventsByTimeRange(
    startTime: Date,
    endTime: Date,
    eventTypes?: string[]
  ): Promise<DomainEvent[]> {
    try {
      const query: any = {
        timestamp: { $gte: startTime, $lte: endTime },
      };

      if (eventTypes && eventTypes.length > 0) {
        query.eventType = { $in: eventTypes };
      }

      const storedEvents = await this.eventsCollection
        .find(query)
        .sort({ timestamp: 1 })
        .toArray();

      return storedEvents.map(storedEvent => this.toDomainEvent(storedEvent));
    } catch (error) {
      logger.error('Failed to get events by time range', { error, startTime, endTime });
      throw error;
    }
  }

  public async getAggregateHistory(aggregateId: string): Promise<{
    events: DomainEvent[];
    snapshots: Snapshot[];
  }> {
    try {
      const [eventStream, snapshots] = await Promise.all([
        this.getEventStream(aggregateId),
        this.snapshotsCollection
          .find({ aggregateId })
          .sort({ version: -1 })
          .toArray(),
      ]);

      return {
        events: eventStream?.events || [],
        snapshots,
      };
    } catch (error) {
      logger.error('Failed to get aggregate history', { error, aggregateId });
      throw error;
    }
  }

  public async healthCheck(): Promise<{ mongodb: boolean; redis: boolean }> {
    const health = { mongodb: false, redis: false };

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

    return health;
  }

  public async close(): Promise<void> {
    try {
      await this.redis.quit();
      // MongoDB client will be closed when the connection is closed
      logger.info('EventStore connections closed');
    } catch (error) {
      logger.error('Error closing EventStore connections', { error });
    }
  }
}