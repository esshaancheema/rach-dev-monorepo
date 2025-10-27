import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { EventStore, EventStoreConfig } from './infrastructure/EventStore';
import { ProjectionEngine } from './projections/ProjectionEngine';
import { UserProjection } from './projections/UserProjection';
import { ProjectProjection } from './projections/ProjectProjection';
import { CommandBus, UserCommandHandler, ProjectCommandHandler, AISessionCommandHandler } from './commands/CommandBus';
import { logger } from './utils/logger';
import { config } from './config/config';
import { v4 as uuidv4 } from 'uuid';

export class EventStoreServer {
  private app: express.Application;
  private eventStore!: EventStore;
  private projectionEngine!: ProjectionEngine;
  private commandBus!: CommandBus;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      const requestId = req.headers['x-request-id'] || uuidv4();
      req.requestId = requestId;
      res.setHeader('X-Request-ID', requestId);

      logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        requestId,
      });

      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoints
    this.app.get('/health', async (req, res) => {
      try {
        const [eventStoreHealth, projectionHealth] = await Promise.all([
          this.eventStore.healthCheck(),
          this.projectionEngine.healthCheck(),
        ]);

        const isHealthy = eventStoreHealth.mongodb && 
                         eventStoreHealth.redis && 
                         projectionHealth.mongodb && 
                         projectionHealth.redis;

        res.status(isHealthy ? 200 : 503).json({
          status: isHealthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          services: {
            eventStore: eventStoreHealth,
            projections: projectionHealth,
          },
        });
      } catch (error) {
        logger.error('Health check failed', { error });
        res.status(503).json({
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.app.get('/ready', async (req, res) => {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    // Command endpoints
    this.app.post('/commands', async (req, res) => {
      try {
        const { type, aggregateId, aggregateType, payload, metadata = {} } = req.body;

        if (!type || !aggregateId || !aggregateType || !payload) {
          return res.status(400).json({
            error: 'Missing required fields: type, aggregateId, aggregateType, payload',
          });
        }

        const command = {
          id: uuidv4(),
          type,
          aggregateId,
          aggregateType,
          payload,
          metadata: {
            ...metadata,
            requestId: req.requestId,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip,
          },
          timestamp: new Date(),
        };

        const result = await this.commandBus.send(command);

        res.status(result.success ? 200 : 400).json(result);
      } catch (error) {
        logger.error('Command execution failed', { error, requestId: req.requestId });
        res.status(500).json({
          error: 'Internal server error',
          requestId: req.requestId,
        });
      }
    });

    // Event stream endpoints
    this.app.get('/events/stream/:aggregateId', async (req, res) => {
      try {
        const { aggregateId } = req.params;
        const fromVersion = req.query.fromVersion ? parseInt(req.query.fromVersion as string) : undefined;

        const eventStream = await this.eventStore.getEventStream(aggregateId, fromVersion);
        
        if (!eventStream) {
          return res.status(404).json({ error: 'Event stream not found' });
        }

        res.json({
          aggregateId: eventStream.aggregateId,
          aggregateType: eventStream.aggregateType,
          version: eventStream.version,
          events: eventStream.events.map(event => event.toJSON()),
        });
      } catch (error) {
        logger.error('Failed to get event stream', { error, aggregateId: req.params.aggregateId });
        res.status(500).json({ error: 'Failed to get event stream' });
      }
    });

    this.app.get('/events/history/:aggregateId', async (req, res) => {
      try {
        const { aggregateId } = req.params;
        const history = await this.eventStore.getAggregateHistory(aggregateId);

        res.json({
          aggregateId,
          events: history.events.map(event => event.toJSON()),
          snapshots: history.snapshots,
        });
      } catch (error) {
        logger.error('Failed to get aggregate history', { error, aggregateId: req.params.aggregateId });
        res.status(500).json({ error: 'Failed to get aggregate history' });
      }
    });

    this.app.get('/events/correlation/:correlationId', async (req, res) => {
      try {
        const { correlationId } = req.params;
        const events = await this.eventStore.getEventsByCorrelationId(correlationId);

        res.json({
          correlationId,
          events: events.map(event => event.toJSON()),
        });
      } catch (error) {
        logger.error('Failed to get events by correlation ID', { 
          error, 
          correlationId: req.params.correlationId 
        });
        res.status(500).json({ error: 'Failed to get events by correlation ID' });
      }
    });

    this.app.get('/events/timerange', async (req, res) => {
      try {
        const { startTime, endTime, eventTypes } = req.query;

        if (!startTime || !endTime) {
          return res.status(400).json({ error: 'startTime and endTime are required' });
        }

        const start = new Date(startTime as string);
        const end = new Date(endTime as string);
        const types = eventTypes ? (eventTypes as string).split(',') : undefined;

        const events = await this.eventStore.getEventsByTimeRange(start, end, types);

        res.json({
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          eventTypes: types,
          events: events.map(event => event.toJSON()),
        });
      } catch (error) {
        logger.error('Failed to get events by time range', { error });
        res.status(500).json({ error: 'Failed to get events by time range' });
      }
    });

    // Projection endpoints
    this.app.get('/projections/status/:projectionName?', async (req, res) => {
      try {
        const { projectionName } = req.params;
        const status = await this.projectionEngine.getProjectionStatus(projectionName);

        res.json(status);
      } catch (error) {
        logger.error('Failed to get projection status', { error, projectionName: req.params.projectionName });
        res.status(500).json({ error: 'Failed to get projection status' });
      }
    });

    this.app.post('/projections/rebuild/:projectionName', async (req, res) => {
      try {
        const { projectionName } = req.params;
        await this.projectionEngine.rebuildProjection(projectionName);

        res.json({ 
          message: `Projection ${projectionName} rebuild started`,
          requestId: req.requestId,
        });
      } catch (error) {
        logger.error('Failed to rebuild projection', { error, projectionName: req.params.projectionName });
        res.status(500).json({ error: 'Failed to rebuild projection' });
      }
    });

    this.app.post('/projections/reset/:projectionName', async (req, res) => {
      try {
        const { projectionName } = req.params;
        await this.projectionEngine.resetProjection(projectionName);

        res.json({ 
          message: `Projection ${projectionName} reset successfully`,
          requestId: req.requestId,
        });
      } catch (error) {
        logger.error('Failed to reset projection', { error, projectionName: req.params.projectionName });
        res.status(500).json({ error: 'Failed to reset projection' });
      }
    });

    // Query endpoints for projections
    this.app.get('/query/users', async (req, res) => {
      try {
        const { search, role, status, limit = 50 } = req.query;
        
        // This would use the UserProjection to query the read model
        // For now, we'll return a placeholder response
        res.json({
          users: [],
          total: 0,
          filters: { search, role, status },
          limit: parseInt(limit as string),
        });
      } catch (error) {
        logger.error('Failed to query users', { error });
        res.status(500).json({ error: 'Failed to query users' });
      }
    });

    this.app.get('/query/projects', async (req, res) => {
      try {
        const { search, language, framework, visibility, ownerId, limit = 50 } = req.query;
        
        // This would use the ProjectProjection to query the read model
        res.json({
          projects: [],
          total: 0,
          filters: { search, language, framework, visibility, ownerId },
          limit: parseInt(limit as string),
        });
      } catch (error) {
        logger.error('Failed to query projects', { error });
        res.status(500).json({ error: 'Failed to query projects' });
      }
    });

    // Admin endpoints
    this.app.get('/admin/stats', async (req, res) => {
      try {
        const [queueStatus] = await Promise.all([
          this.commandBus.getQueueStatus(),
        ]);

        res.json({
          commandQueue: queueStatus,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to get admin stats', { error });
        res.status(500).json({ error: 'Failed to get admin stats' });
      }
    });

    // Error handling middleware
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error', {
        error,
        method: req.method,
        url: req.url,
        requestId: req.requestId,
      });

      res.status(500).json({
        error: 'Internal server error',
        requestId: req.requestId,
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Not found',
        method: req.method,
        url: req.url,
        requestId: req.requestId,
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize EventStore
      const eventStoreConfig: EventStoreConfig = {
        mongoUrl: config.mongodb.url,
        redisUrl: config.redis.url,
        databaseName: config.mongodb.database,
        eventsCollectionName: 'events',
        snapshotsCollectionName: 'snapshots',
        batchSize: 1000,
        snapshotFrequency: 10,
      };

      this.eventStore = new EventStore(eventStoreConfig);
      await this.eventStore.initialize();

      // Initialize CommandBus
      this.commandBus = new CommandBus(this.eventStore, config.redis.url);
      
      // Register command handlers
      this.commandBus.registerHandler('RegisterUser', new UserCommandHandler(this.eventStore));
      this.commandBus.registerHandler('VerifyUserEmail', new UserCommandHandler(this.eventStore));
      this.commandBus.registerHandler('UpdateUserProfile', new UserCommandHandler(this.eventStore));
      this.commandBus.registerHandler('DeleteUser', new UserCommandHandler(this.eventStore));
      
      this.commandBus.registerHandler('CreateProject', new ProjectCommandHandler(this.eventStore));
      this.commandBus.registerHandler('UpdateProject', new ProjectCommandHandler(this.eventStore));
      this.commandBus.registerHandler('AddProjectCollaborator', new ProjectCommandHandler(this.eventStore));
      this.commandBus.registerHandler('RemoveProjectCollaborator', new ProjectCommandHandler(this.eventStore));
      this.commandBus.registerHandler('ArchiveProject', new ProjectCommandHandler(this.eventStore));
      this.commandBus.registerHandler('DeleteProject', new ProjectCommandHandler(this.eventStore));
      
      this.commandBus.registerHandler('StartAISession', new AISessionCommandHandler(this.eventStore));
      this.commandBus.registerHandler('AddAIMessage', new AISessionCommandHandler(this.eventStore));
      this.commandBus.registerHandler('CompleteAISession', new AISessionCommandHandler(this.eventStore));

      // Initialize ProjectionEngine
      this.projectionEngine = new ProjectionEngine(
        this.eventStore,
        config.mongodb.url,
        config.redis.url,
        config.mongodb.database
      );

      // Register projections
      this.projectionEngine.registerProjection(new UserProjection());
      this.projectionEngine.registerProjection(new ProjectProjection());

      await this.projectionEngine.initialize();
      await this.projectionEngine.start();

      // Start HTTP server
      const port = config.port || 3100;
      
      this.app.listen(port, () => {
        logger.info(`🚀 Event Store Server ready at http://localhost:${port}`);
        logger.info('📊 Event sourcing and CQRS patterns implemented successfully');
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM received, shutting down gracefully');
        this.shutdown();
      });

      process.on('SIGINT', () => {
        logger.info('SIGINT received, shutting down gracefully');
        this.shutdown();
      });

    } catch (error) {
      logger.error('Failed to start Event Store server', error);
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down Event Store server...');
      
      await Promise.allSettled([
        this.projectionEngine.stop(),
        this.commandBus.close(),
        this.eventStore.close(),
      ]);

      logger.info('Event Store server shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  }
}

// Start the server
if (require.main === module) {
  const server = new EventStoreServer();
  server.start().catch((error) => {
    logger.error('Server startup failed', error);
    process.exit(1);
  });
}