import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { buildSubgraphSchema } from '@apollo/subgraph';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { depthLimit } from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-query-complexity';
import { shield, and, or, rule, cache } from 'graphql-shield';
import jwt from 'jsonwebtoken';
import { logger } from './utils/logger';
import { config } from './config/config';
import { typeDefs as authTypeDefs, resolvers as authResolvers } from './schemas/auth';
import { typeDefs as projectTypeDefs, resolvers as projectResolvers } from './schemas/project';
import { typeDefs as aiTypeDefs, resolvers as aiResolvers } from './schemas/ai';
import { typeDefs as notificationTypeDefs, resolvers as notificationResolvers } from './schemas/notification';
import { typeDefs as billingTypeDefs, resolvers as billingResolvers } from './schemas/billing';
import { createDataLoaders } from './dataloaders';
import { rateLimiter } from './middleware/rateLimiter';
import { metricsMiddleware } from './middleware/metrics';
import { Context } from './types/context';

export class GraphQLServer {
  private app: express.Application;
  private server: ApolloServer;
  private httpServer: any;
  private redis: Redis;
  private pubsub: RedisPubSub;

  constructor() {
    this.app = express();
    this.setupRedis();
    this.setupMiddleware();
  }

  private setupRedis(): void {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    this.pubsub = new RedisPubSub({
      publisher: new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      }),
      subscriber: new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
      }),
    });
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
    }));

    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    this.app.use('/graphql', rateLimiter);

    // Metrics collection
    this.app.use(metricsMiddleware);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
      });
    });

    // Ready check endpoint
    this.app.get('/ready', async (req, res) => {
      try {
        await this.redis.ping();
        res.json({ status: 'ready' });
      } catch (error) {
        res.status(503).json({ status: 'not ready', error: error.message });
      }
    });
  }

  private createAuthRules() {
    const isAuthenticated = rule({ cache: 'contextual' })(
      async (parent, args, context: Context, info) => {
        return context.user !== null;
      }
    );

    const isAdmin = rule({ cache: 'contextual' })(
      async (parent, args, context: Context, info) => {
        return context.user && context.user.role === 'admin';
      }
    );

    const isOwner = rule({ cache: 'contextual' })(
      async (parent, args, context: Context, info) => {
        // Implementation depends on the specific resolver
        return true; // Simplified for demo
      }
    );

    return shield({
      Query: {
        me: isAuthenticated,
        myProjects: isAuthenticated,
        adminUsers: isAdmin,
        billingInfo: isAuthenticated,
      },
      Mutation: {
        updateProfile: isAuthenticated,
        createProject: isAuthenticated,
        deleteProject: and(isAuthenticated, isOwner),
        generateAI: isAuthenticated,
        adminDeleteUser: isAdmin,
      },
      Subscription: {
        projectUpdates: isAuthenticated,
        notifications: isAuthenticated,
      },
    });
  }

  private async createApolloServer(): Promise<void> {
    // Create federated gateway
    const gateway = new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs: [
          { name: 'auth', url: `${config.services.auth}/graphql` },
          { name: 'projects', url: `${config.services.project}/graphql` },
          { name: 'ai', url: `${config.services.ai}/graphql` },
          { name: 'notifications', url: `${config.services.notification}/graphql` },
          { name: 'billing', url: `${config.services.billing}/graphql` },
        ],
      }),
      buildService({ url }) {
        return new (require('@apollo/datasource-rest').RESTDataSource)({
          baseURL: url,
        });
      },
    });

    this.server = new ApolloServer({
      gateway,
      plugins: [
        // Query complexity analysis
        {
          requestDidStart() {
            return {
              didResolveOperation({ request, document }) {
                const complexity = getComplexity({
                  estimators: [
                    fieldExtensionsEstimator(),
                    simpleEstimator({ defaultComplexity: 1 }),
                  ],
                  maximumComplexity: 1000,
                  variables: request.variables,
                  query: document,
                });
                
                if (complexity > 1000) {
                  throw new Error(`Query complexity ${complexity} exceeds maximum allowed complexity of 1000`);
                }
              },
            };
          },
        },
        // Performance monitoring
        {
          requestDidStart() {
            return {
              willSendResponse(requestContext) {
                const { request, response } = requestContext;
                logger.info('GraphQL Request', {
                  query: request.query,
                  variables: request.variables,
                  operationName: request.operationName,
                  responseTime: Date.now() - requestContext.request.http.startTime,
                  errors: response.errors?.length || 0,
                });
              },
            };
          },
        },
      ],
      validationRules: [
        depthLimit(10), // Prevent deeply nested queries
        createComplexityLimitRule(1000), // Limit query complexity
      ],
      introspection: config.environment !== 'production',
      formatError: (error) => {
        logger.error('GraphQL Error', {
          message: error.message,
          locations: error.locations,
          path: error.path,
          extensions: error.extensions,
        });

        // Don't expose internal errors in production
        if (config.environment === 'production' && error.message.includes('internal')) {
          return new Error('Internal server error');
        }

        return error;
      },
    });

    await this.server.start();
  }

  private async createContext({ req, res }): Promise<Context> {
    let user = null;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        user = {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          tenantId: decoded.tenantId,
        };
      } catch (error) {
        logger.warn('Invalid JWT token', { token, error: error.message });
      }
    }

    const dataloaders = createDataLoaders({
      redis: this.redis,
      services: config.services,
      user,
    });

    return {
      user,
      dataloaders,
      redis: this.redis,
      pubsub: this.pubsub,
      req,
      res,
      logger,
    };
  }

  private setupWebSocketServer(): void {
    this.httpServer = createServer(this.app);
    
    const wsServer = new WebSocketServer({
      server: this.httpServer,
      path: '/graphql',
    });

    useServer(
      {
        schema: this.server.schema,
        context: async (ctx) => {
          const token = ctx.connectionParams?.authorization?.replace('Bearer ', '');
          let user = null;

          if (token) {
            try {
              const decoded = jwt.verify(token, config.jwt.secret) as any;
              user = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
                tenantId: decoded.tenantId,
              };
            } catch (error) {
              throw new Error('Authentication failed');
            }
          }

          return {
            user,
            pubsub: this.pubsub,
            redis: this.redis,
          };
        },
        onConnect: (ctx) => {
          logger.info('WebSocket connection established', {
            connectionParams: ctx.connectionParams,
          });
        },
        onDisconnect: (ctx) => {
          logger.info('WebSocket connection closed');
        },
      },
      wsServer
    );
  }

  public async start(): Promise<void> {
    try {
      await this.createApolloServer();

      // Apply GraphQL middleware
      this.app.use(
        '/graphql',
        expressMiddleware(this.server, {
          context: async ({ req, res }) => this.createContext({ req, res }),
        })
      );

      // Setup WebSocket server for subscriptions
      this.setupWebSocketServer();

      const port = config.port || 4000;
      
      this.httpServer.listen(port, () => {
        logger.info(`🚀 GraphQL Gateway ready at http://localhost:${port}/graphql`);
        logger.info(`🚀 WebSocket subscriptions ready at ws://localhost:${port}/graphql`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => {
        logger.info('SIGTERM received, shutting down gracefully');
        this.httpServer.close(() => {
          this.redis.disconnect();
          process.exit(0);
        });
      });

    } catch (error) {
      logger.error('Failed to start GraphQL server', error);
      process.exit(1);
    }
  }
}

// Start the server
if (require.main === module) {
  const server = new GraphQLServer();
  server.start().catch((error) => {
    logger.error('Server startup failed', error);
    process.exit(1);
  });
}