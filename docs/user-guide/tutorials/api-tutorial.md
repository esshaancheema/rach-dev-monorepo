# Building a REST API with Node.js and Zoptal

Learn to build a production-ready REST API using Node.js, Express, and AI assistance. We'll create a complete backend for a task management application with authentication, database integration, and advanced features.

## 🎯 What We'll Build

A comprehensive API with:
- **User Authentication** - JWT with refresh tokens
- **Task Management** - Full CRUD operations
- **Real-time Features** - WebSocket support
- **File Uploads** - Image and document handling
- **Database Integration** - MongoDB with Mongoose
- **API Documentation** - Swagger/OpenAPI
- **Security Features** - Rate limiting, validation, CORS
- **Testing Suite** - Unit and integration tests

## 📋 Prerequisites

- Basic knowledge of JavaScript/Node.js
- Understanding of REST API concepts
- Zoptal account
- 45-60 minutes of time

## 🚀 Step 1: Project Setup (5 minutes)

### Create API Project
1. **Open Zoptal** and click "New Project"
2. **Select "Node.js API"** template
3. **Configure project**:
   ```
   Project Name: TaskMaster API
   Description: RESTful API for task management with authentication
   Template: Node.js API (TypeScript)
   Database: MongoDB
   Visibility: Private
   ```
4. **Click "Create Project"**

### Project Structure
```
src/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── types/
├── tests/
├── app.ts
└── server.ts
```

## 🔧 Step 2: Core API Infrastructure (10 minutes)

### Basic Express Setup

**AI Prompt**:
```
Create a robust Express.js server setup with TypeScript including:
1. Express app configuration with middleware
2. CORS setup with environment-based origins
3. Body parsing and request logging
4. Error handling middleware
5. Health check endpoints
6. Environment configuration management
7. MongoDB connection with Mongoose
8. Request validation middleware
9. Security headers with helmet
10. Rate limiting configuration

Use modern Node.js patterns and TypeScript.
```

### Database Models

**AI Prompt**:
```
Create Mongoose models for a task management API:
1. User model with authentication fields
2. Task model with relationships to users
3. Project model for organizing tasks
4. Comment model for task discussions
5. File model for attachments
6. Audit log model for tracking changes

Include:
- Proper TypeScript interfaces
- Schema validation
- Indexes for performance
- Virtual fields and methods
- Pre/post hooks for business logic
- Password hashing for users
```

## 🔐 Step 3: Authentication System (12 minutes)

### JWT Authentication

**AI Prompt**:
```
Build a complete JWT authentication system with:
1. User registration with email verification
2. Login with password validation
3. JWT access and refresh token generation
4. Token refresh endpoint
5. Password reset via email
6. Account lockout after failed attempts
7. OAuth2 integration (Google, GitHub)
8. Two-factor authentication (2FA)
9. Session management
10. Logout and token blacklisting

Include proper error handling and security best practices.
```

### Authentication Middleware

**AI Prompt**:
```
Create authentication and authorization middleware:
1. JWT token verification middleware
2. Role-based access control (RBAC)
3. Permission-based authorization
4. API key authentication for external apps
5. Rate limiting per user/IP
6. Request logging and audit trails
7. CSRF protection
8. Input sanitization
9. API version checking
10. User context injection
```

## 📋 Step 4: Task Management API (15 minutes)

### Core CRUD Operations

**AI Prompt**:
```
Build comprehensive task management endpoints:
1. GET /tasks - List tasks with filtering, sorting, pagination
2. POST /tasks - Create new task with validation
3. GET /tasks/:id - Get single task with related data
4. PUT /tasks/:id - Update task (full update)
5. PATCH /tasks/:id - Partial task update
6. DELETE /tasks/:id - Soft delete task
7. POST /tasks/:id/comments - Add comments
8. GET /tasks/:id/history - Audit trail
9. POST /tasks/bulk - Bulk operations
10. GET /tasks/stats - Task statistics

Include proper validation, error handling, and response formatting.
```

### Advanced Task Features

**AI Prompt**:
```
Add advanced task management features:
1. Task assignment and collaboration
2. Due date notifications and reminders
3. Task templates and duplication
4. Subtask creation and management
5. Task dependencies and blocking
6. Time tracking and logging
7. Task categories and tags
8. Custom field support
9. Task search with full-text indexing
10. Recurring task automation
11. File attachments and metadata
12. Task export (PDF, CSV, JSON)
```

## 📁 Step 5: File Upload System (8 minutes)

### File Management

**AI Prompt**:
```
Create a secure file upload system:
1. Multer configuration for file uploads
2. File type validation and security scanning
3. Image resizing and optimization
4. Cloud storage integration (AWS S3, Google Cloud)
5. File metadata extraction
6. Virus scanning for uploaded files
7. File compression and CDN integration
8. Direct upload to cloud storage
9. File access control and permissions
10. Thumbnail generation for images
11. File versioning and rollback
12. Bulk file operations
```

## 🔄 Step 6: Real-time Features (8 minutes)

### WebSocket Integration

**AI Prompt**:
```
Add real-time capabilities with Socket.IO:
1. WebSocket server setup and configuration
2. User authentication for socket connections
3. Real-time task updates and notifications
4. Live collaboration features
5. Typing indicators and presence
6. Room-based messaging (projects/teams)
7. Connection management and cleanup
8. Message queuing for offline users
9. Rate limiting for socket events
10. Broadcasting system for announcements
11. Real-time analytics and monitoring
12. Fallback to polling for old browsers
```

## 📋 Step 7: API Documentation (5 minutes)

### Swagger/OpenAPI Setup

**AI Prompt**:
```
Generate comprehensive API documentation:
1. Swagger/OpenAPI 3.0 specification
2. Interactive API explorer with try-it-out
3. Request/response examples
4. Authentication documentation
5. Error code explanations
6. Rate limiting information
7. SDK generation for multiple languages
8. Postman collection export
9. API versioning documentation
10. Webhook documentation
11. GraphQL schema (if implemented)
12. API changelog and migration guides
```

## 🧪 Step 8: Testing Suite (10 minutes)

### Comprehensive Testing

**AI Prompt**:
```
Create a complete testing suite:
1. Unit tests for all controllers and services
2. Integration tests for API endpoints
3. Database mocking and test data fixtures
4. Authentication flow testing
5. Error handling and edge case tests
6. Performance and load testing
7. Security vulnerability testing
8. API contract testing
9. End-to-end workflow tests
10. Test coverage reporting
11. Automated test running in CI/CD
12. API response validation tests
```

## 🔒 Step 9: Security & Performance (7 minutes)

### Security Hardening

**AI Prompt**:
```
Implement production security measures:
1. Input validation and sanitization
2. SQL injection prevention
3. XSS protection headers
4. CSRF token implementation
5. API rate limiting and throttling
6. DDoS protection strategies
7. Secure session management
8. Password strength requirements
9. Audit logging for security events
10. Vulnerability scanning integration
11. Secrets management
12. Security monitoring and alerts
```

### Performance Optimization

**AI Prompt**:
```
Optimize API performance:
1. Database query optimization and indexing
2. Caching strategies (Redis, in-memory)
3. Connection pooling
4. Pagination and data limiting
5. Response compression (gzip)
6. CDN integration for static assets
7. Background job processing
8. Database connection optimization
9. Memory usage monitoring
10. Request/response logging optimization
11. Load balancing configuration
12. Performance monitoring and APM
```

## 🚀 Step 10: Deployment & Monitoring (5 minutes)

### Production Deployment

**AI Prompt**:
```
Set up production deployment:
1. Docker containerization
2. Environment-specific configurations
3. Database migration scripts
4. Health check endpoints
5. Graceful shutdown handling
6. Process management (PM2)
7. Reverse proxy configuration (Nginx)
8. SSL certificate setup
9. Log aggregation and monitoring
10. Error tracking and alerting
11. Performance monitoring (APM)
12. Backup and recovery procedures
```

## 🎉 Final Result

You now have a production-ready API with:

### ✅ Core Features
- **Authentication** - JWT with refresh tokens, 2FA, OAuth2
- **CRUD Operations** - Full task management with validation
- **Real-time** - WebSocket support for live updates
- **File Handling** - Secure upload with cloud storage
- **Security** - Rate limiting, validation, audit logging
- **Documentation** - Interactive Swagger docs
- **Testing** - Comprehensive test coverage
- **Monitoring** - Health checks and performance metrics

### 🏗️ Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   API Gateway   │────│   Node.js API   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐    ┌─────────────────┐
                       │     Redis       │────│    MongoDB      │
                       │    (Cache)      │    │   (Database)    │
                       └─────────────────┘    └─────────────────┘
```

### 📊 Performance Metrics
- **Response Time**: < 100ms average
- **Throughput**: 1000+ requests/second
- **Uptime**: 99.9% availability
- **Test Coverage**: 95%+ code coverage

## 📚 Advanced Topics

### Microservices Architecture
**AI Prompt**:
```
Refactor the monolithic API into microservices:
1. Service decomposition strategy
2. API gateway configuration
3. Service discovery setup
4. Inter-service communication
5. Distributed tracing
6. Event-driven architecture
7. Saga pattern for transactions
8. Circuit breaker implementation
```

### GraphQL Integration
**AI Prompt**:
```
Add GraphQL layer to the existing REST API:
1. GraphQL schema definition
2. Resolver implementation
3. DataLoader integration
4. Subscription support
5. GraphQL playground setup
6. Query optimization
7. Schema stitching
8. Federation support
```

## 💡 Pro Tips

### API Design Best Practices
- **Use consistent naming** - Follow REST conventions
- **Version your API** - /v1/, /v2/ for breaking changes
- **Implement pagination** - Limit response sizes
- **Use HTTP status codes** - Proper error responses
- **Add request/response validation** - Prevent bad data

### Performance Optimization
- **Database indexing** - Index frequently queried fields
- **Caching strategy** - Cache expensive operations
- **Connection pooling** - Reuse database connections
- **Async operations** - Use promises and async/await
- **Background jobs** - Queue heavy operations

### Security Checklist
- ✅ Input validation on all endpoints
- ✅ Rate limiting per user/IP
- ✅ HTTPS only in production
- ✅ Secure headers (helmet.js)
- ✅ Regular security audits
- ✅ Environment variable protection

## 🔍 Testing Your API

### Manual Testing
```bash
# Health check
curl -X GET http://localhost:3000/health

# User registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'

# Create task
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Complete API tutorial","priority":"high"}'
```

### Automated Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance
```

## 🆘 Troubleshooting

### Common Issues
1. **Database connection errors** - Check MongoDB connection string
2. **JWT verification fails** - Verify secret key configuration  
3. **CORS issues** - Configure allowed origins properly
4. **Memory leaks** - Monitor and fix event listener cleanup
5. **Rate limiting blocks** - Adjust rate limit configurations

### Debug Tools
- **Postman/Insomnia** - API testing
- **MongoDB Compass** - Database inspection
- **Redis CLI** - Cache debugging
- **Node.js debugger** - Step-through debugging
- **Performance profiling** - Memory and CPU analysis

---

**API Complete?** → [Frontend Tutorial](react-app-tutorial.md) - Build the UI

**Team Development?** → [Collaboration Tutorial](collaboration-tutorial.md) - Work with others

**Need help?** → [FAQ](../troubleshooting/faq.md) - Common questions

---

*You've built a powerful API! 🚀*