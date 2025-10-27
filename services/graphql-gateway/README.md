# Zoptal GraphQL Gateway

A comprehensive GraphQL API gateway that provides a unified interface to all Zoptal platform microservices. Built with Apollo Federation, TypeScript, and enterprise-grade features including rate limiting, caching, real-time subscriptions, and advanced security.

## 🚀 Features

### Core Capabilities
- **Unified GraphQL API** - Single endpoint for all platform services
- **Apollo Federation** - Federated schema composition from microservices
- **Real-time Subscriptions** - WebSocket support for live updates
- **Advanced Caching** - Redis-backed DataLoader with intelligent cache invalidation
- **Rate Limiting** - User-based and IP-based rate limiting with Redis
- **Query Complexity Analysis** - Protection against expensive queries
- **Authentication & Authorization** - JWT-based auth with role-based permissions

### Enterprise Features
- **Distributed Tracing** - Full observability with Jaeger integration
- **Metrics & Monitoring** - Prometheus metrics and health checks
- **Security** - CORS, Helmet, query depth limiting, input validation
- **Error Handling** - Structured error responses with correlation IDs
- **Graceful Shutdown** - Clean resource cleanup on termination
- **High Availability** - Kubernetes-ready with auto-scaling support

## 📋 Prerequisites

- Node.js 18+
- Redis 6+ (for caching and rate limiting)
- Access to Zoptal microservices (auth, project, AI, notification, billing)

## 🛠 Installation & Setup

### Local Development

```bash
# Clone and navigate to the project
cd services/graphql-gateway

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Configure environment variables
# Edit .env with your service URLs and credentials

# Start development server
npm run dev
```

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=4000

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
PROJECT_SERVICE_URL=http://localhost:3002
AI_SERVICE_URL=http://localhost:3003
NOTIFICATION_SERVICE_URL=http://localhost:3004
BILLING_SERVICE_URL=http://localhost:3005

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://zoptal.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Query Limits
MAX_QUERY_DEPTH=10
MAX_QUERY_COMPLEXITY=1000

# Cache Configuration
CACHE_TTL=300

# Monitoring
ENABLE_METRICS=true
ENABLE_TRACING=true
```

## 🏗 Architecture

### GraphQL Schema Structure

```
📦 Unified Schema
├── 👤 User Management
│   ├── Authentication (login, register, logout)
│   ├── User profiles and preferences
│   └── Role-based access control
├── 📁 Project Management
│   ├── Project CRUD operations
│   ├── File and folder management
│   ├── Collaboration and invitations
│   └── Project analytics
├── 🤖 AI Integration
│   ├── AI sessions and conversations
│   ├── Code generation and analysis
│   └── Usage tracking and limits
├── 🔔 Notifications
│   ├── Real-time notifications
│   ├── Multi-channel delivery
│   └── Subscription management
└── 💳 Billing & Subscriptions
    ├── Subscription management
    ├── Payment methods
    ├── Usage tracking
    └── Invoice generation
```

### Data Flow

```
Client Request → GraphQL Gateway → DataLoaders → Microservices → Response
                      ↓
                Redis Cache ← Rate Limiter ← Auth Middleware
```

### Key Components

1. **Server (`src/server.ts`)** - Main application entry point
2. **Schema (`src/schemas/`)** - Unified GraphQL type definitions
3. **Resolvers (`src/resolvers/`)** - Business logic and data fetching
4. **DataLoaders (`src/dataloaders/`)** - Efficient data fetching with caching
5. **Middleware (`src/middleware/`)** - Rate limiting, auth, logging
6. **Types (`src/types/`)** - TypeScript type definitions

## 🚀 Usage

### Starting the Server

```bash
# Development mode with hot reload
npm run dev

# Production build and start
npm run build
npm start

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### GraphQL Playground

Once the server is running, access the GraphQL Playground at:
- Development: http://localhost:4000/graphql
- Production: Disabled for security

### Example Queries

#### Authentication
```graphql
mutation Login {
  login(email: "user@example.com", password: "password") {
    token
    refreshToken
    user {
      id
      email
      firstName
      lastName
      role
    }
    expiresAt
  }
}
```

#### Fetch User Projects
```graphql
query MyProjects {
  myProjects(first: 10) {
    edges {
      node {
        id
        name
        description
        status
        files {
          id
          name
          path
          size
        }
        collaborators {
          user {
            id
            email
            firstName
            lastName
          }
          role
          permissions
        }
        stats {
          totalFiles
          totalSize
          languageBreakdown {
            language
            fileCount
            percentage
          }
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

#### AI Code Generation
```graphql
mutation GenerateCode {
  createAISession(input: {
    type: CODE_GENERATION
    projectId: "project_123"
    model: "gpt-4"
    temperature: 0.7
  }) {
    id
    type
    status
    model
  }
}

mutation SendMessage {
  sendAIMessage(input: {
    sessionId: "session_123"
    content: "Create a React component for a user profile form"
  }) {
    id
    content
    role
    tokens
    timestamp
  }
}
```

#### Real-time Subscriptions
```graphql
subscription ProjectUpdates {
  projectUpdates(projectId: "project_123") {
    type
    project {
      id
      name
      updatedAt
    }
    user {
      id
      email
    }
    timestamp
  }
}

subscription Notifications {
  notifications {
    id
    title
    message
    type
    priority
    read
    createdAt
  }
}
```

#### Complex Query with Fragments
```graphql
fragment UserInfo on User {
  id
  email
  firstName
  lastName
  avatar
  role
  preferences {
    theme
    language
    emailNotifications
  }
}

fragment ProjectInfo on Project {
  id
  name
  description
  status
  visibility
  owner {
    ...UserInfo
  }
  collaborators {
    user {
      ...UserInfo
    }
    role
    joinedAt
  }
  stats {
    totalFiles
    totalSize
    aiUsage {
      totalSessions
      totalTokens
      totalCost
    }
  }
}

query Dashboard {
  me {
    ...UserInfo
    projects(first: 5) {
      edges {
        node {
          ...ProjectInfo
        }
      }
    }
    notifications(first: 10, filters: { read: false }) {
      edges {
        node {
          id
          title
          message
          type
          priority
          createdAt
        }
      }
      unreadCount
    }
    billing {
      subscription {
        plan {
          name
          features {
            name
            included
            limit
          }
        }
        status
        currentPeriodEnd
      }
      usage {
        projects {
          used
          limit
          percentage
        }
        aiTokens {
          used
          limit
          percentage
        }
      }
    }
  }
}
```

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication with configurable expiration
- Role-based access control (USER, ADMIN, SUPER_ADMIN)
- Resource-level ownership validation
- Secure token refresh mechanism

### Query Protection
- Query depth limiting (default: 10 levels)
- Query complexity analysis (default: 1000 points)
- Request size limits (10MB)
- Timeout protection (300s for complex operations)

### Rate Limiting
- Global rate limiting (1000 requests per 15 minutes)
- GraphQL-specific limits (100 operations per minute)
- AI service limits (50 requests per hour)
- User-based and IP-based limiting

### Input Validation
- All inputs validated with Joi schemas
- SQL injection prevention
- XSS protection via Helmet
- CORS configuration with whitelist

### Monitoring & Logging
- Structured logging with Winston
- Security event tracking
- Performance monitoring
- Error correlation and alerting

## 📊 Monitoring & Observability

### Health Checks
```bash
# Basic health check
curl http://localhost:4000/health

# Readiness check (includes Redis connectivity)
curl http://localhost:4000/ready
```

### Metrics Endpoint
```bash
# Prometheus metrics
curl http://localhost:4000/metrics
```

### Key Metrics
- GraphQL operation duration and count
- Error rates by operation type
- DataLoader cache hit ratios
- Rate limiting statistics
- Memory and CPU usage
- Active WebSocket connections

### Distributed Tracing
The gateway integrates with Jaeger for distributed tracing:
- Request correlation across services
- Performance bottleneck identification
- Error propagation tracking
- Service dependency mapping

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t zoptal/graphql-gateway:latest .

# Run container
docker run -d \
  --name graphql-gateway \
  -p 4000:4000 \
  -e REDIS_HOST=redis \
  -e AUTH_SERVICE_URL=http://auth-service:3001 \
  zoptal/graphql-gateway:latest
```

### Kubernetes

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods -l app=graphql-gateway

# View logs
kubectl logs -f deployment/graphql-gateway
```

### Scaling Configuration

The gateway supports horizontal scaling with:
- Stateless design (session data in Redis)
- Load balancer ready
- Auto-scaling based on CPU/memory
- Graceful shutdown handling

## 🔧 Development

### Project Structure

```
src/
├── config/           # Configuration management
├── dataloaders/      # Data fetching and caching
├── middleware/       # Express middleware
├── resolvers/        # GraphQL resolvers
├── schemas/          # GraphQL type definitions
├── types/            # TypeScript types
├── utils/            # Utility functions
└── server.ts         # Main server file
```

### Code Quality

```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run typecheck

# Testing
npm test
npm run test:watch
npm run test:coverage

# Code generation
npm run generate
```

### Adding New Features

1. **Define GraphQL Types** - Add to `src/schemas/`
2. **Create Resolvers** - Implement in `src/resolvers/`
3. **Add DataLoaders** - For efficient data fetching
4. **Write Tests** - Unit and integration tests
5. **Update Documentation** - Schema docs and examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 API Documentation

### Schema Introspection
The GraphQL schema is self-documenting. Use any GraphQL client to explore:
```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      description
      fields {
        name
        description
        type {
          name
        }
      }
    }
  }
}
```

### Generated Documentation
Schema documentation is automatically generated and available at:
- Development: http://localhost:4000/docs
- Production: Contact team for access

## 🆘 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check Redis connectivity
   - Verify microservice URLs
   - Confirm network policies

2. **High Memory Usage**
   - Review DataLoader cache sizes
   - Check for memory leaks in resolvers
   - Monitor query complexity

3. **Slow Queries**
   - Enable query profiling
   - Check DataLoader hit rates
   - Review microservice performance

4. **Rate Limit Errors**
   - Check user quotas
   - Review rate limit configuration
   - Monitor abuse patterns

### Debug Mode

```bash
# Enable debug logging
NODE_ENV=development LOG_LEVEL=debug npm run dev

# Profile memory usage
node --inspect dist/server.js

# Monitor with clinic.js
npx clinic doctor -- node dist/server.js
```

## 📞 Support

- **Documentation**: [Internal Wiki](https://wiki.zoptal.com/graphql-gateway)
- **Issues**: [GitHub Issues](https://github.com/zoptal/platform/issues)
- **Slack**: #graphql-gateway channel
- **Email**: dev-team@zoptal.com

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ by the Zoptal Platform Team