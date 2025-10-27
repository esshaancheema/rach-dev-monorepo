# Zoptal Platform API Documentation

Welcome to the comprehensive API documentation for the Zoptal platform. This documentation covers all microservices and their respective APIs.

## Overview

The Zoptal platform is built on a microservices architecture with the following core services:

- **Authentication Service** - User authentication and authorization
- **Project Service** - Project management and collaboration
- **AI Service** - AI model integrations and processing
- **Billing Service** - Subscription and payment management
- **Notification Service** - Multi-channel notifications
- **Analytics Service** - User analytics and business intelligence
- **Admin Service** - Platform administration and monitoring

## API Documentation Files

### Core Platform APIs

- **[Main API Specification](./openapi.yaml)** - Complete OpenAPI specification covering core platform functionality
- **[Notifications API](./notifications.yaml)** - Email, SMS, and push notification management
- **[Analytics API](./analytics.yaml)** - User tracking, metrics, and reporting
- **[Admin API](./admin.yaml)** - Administrative operations and system management

### Service Endpoints

| Service | Base URL | Local Development | Documentation |
|---------|----------|-------------------|---------------|
| Authentication | `https://api.zoptal.com/auth` | `http://localhost:4000` | Covered in main API |
| Projects | `https://api.zoptal.com/projects` | `http://localhost:4001` | Covered in main API |
| AI Services | `https://api.zoptal.com/ai` | `http://localhost:4002` | Covered in main API |
| Billing | `https://api.zoptal.com/billing` | `http://localhost:4003` | Covered in main API |
| Notifications | `https://api.zoptal.com/notifications` | `http://localhost:4005` | [notifications.yaml](./notifications.yaml) |
| Analytics | `https://api.zoptal.com/analytics` | `http://localhost:4006` | [analytics.yaml](./analytics.yaml) |
| Admin | `https://api.zoptal.com/admin` | `http://localhost:4000/admin` | [admin.yaml](./admin.yaml) |

## Authentication

### Bearer Token Authentication

Most API endpoints require authentication using JWT Bearer tokens:

```http
Authorization: Bearer <your-jwt-token>
```

To obtain a token, use the authentication endpoints:

```bash
# Register a new user
curl -X POST https://api.zoptal.com/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST https://api.zoptal.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### API Key Authentication

For service-to-service communication, use API keys:

```http
X-API-Key: <your-api-key>
```

## Rate Limiting

All APIs implement rate limiting to ensure fair usage:

- **Free tier**: 1,000 requests per hour
- **Pro tier**: 10,000 requests per hour
- **Enterprise tier**: 100,000 requests per hour

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Error Handling

All APIs use consistent error response formats:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": "Email format is invalid",
    "field": "email"
  }
}
```

### Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 402 | Payment Required |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Common Response Patterns

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Quick Start Examples

### JavaScript/Node.js

```javascript
const API_BASE = 'https://api.zoptal.com';
const token = 'your-jwt-token';

// Create a project
const response = await fetch(`${API_BASE}/projects`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My New Project',
    description: 'A sample project'
  })
});

const result = await response.json();
console.log(result);
```

### Python

```python
import requests

API_BASE = 'https://api.zoptal.com'
token = 'your-jwt-token'

# Create a project
response = requests.post(
    f'{API_BASE}/projects',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    },
    json={
        'name': 'My New Project',
        'description': 'A sample project'
    }
)

result = response.json()
print(result)
```

### cURL

```bash
# Create a project
curl -X POST https://api.zoptal.com/projects \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My New Project",
    "description": "A sample project"
  }'
```

## SDKs and Libraries

### Official SDKs

- **JavaScript/TypeScript**: `@zoptal/api-client`
- **Python**: `zoptal-python` (coming soon)
- **Go**: `zoptal-go` (coming soon)

### Installation

```bash
# npm
npm install @zoptal/api-client

# yarn
yarn add @zoptal/api-client

# pnpm
pnpm add @zoptal/api-client
```

### Usage Example

```javascript
import { ZoptalClient } from '@zoptal/api-client';

const client = new ZoptalClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.zoptal.com'
});

// Create a project
const project = await client.projects.create({
  name: 'My Project',
  description: 'Project description'
});

// Generate AI completion
const completion = await client.ai.generateCompletion({
  prompt: 'Write a summary of quantum computing',
  model: 'openai-gpt4',
  maxTokens: 500
});
```

## Webhook Events

The platform supports webhooks for real-time event notifications:

### Webhook Events

| Event | Description |
|-------|-------------|
| `user.created` | New user registration |
| `user.updated` | User profile updated |
| `project.created` | New project created |
| `project.updated` | Project updated |
| `project.deleted` | Project deleted |
| `subscription.created` | New subscription |
| `subscription.updated` | Subscription changed |
| `subscription.cancelled` | Subscription cancelled |
| `payment.succeeded` | Payment successful |
| `payment.failed` | Payment failed |

### Webhook Payload Format

```json
{
  "id": "evt_1234567890",
  "type": "user.created",
  "created": 1640995200,
  "data": {
    "object": {
      // Event-specific data
    }
  }
}
```

## Testing

### Test Environment

Use the staging environment for testing:

- **Base URL**: `https://staging-api.zoptal.com`
- **Rate Limits**: More lenient for testing
- **Test Data**: Isolated from production

### API Testing Tools

We recommend these tools for API testing:

- **Postman**: Import our Postman collections
- **Insomnia**: REST client with OpenAPI support
- **curl**: Command-line testing
- **HTTPie**: User-friendly command-line HTTP client

### Postman Collection

Import our comprehensive Postman collection:

```bash
# Download and import
curl -O https://docs.zoptal.com/postman/zoptal-api.json
```

## Support and Resources

### Documentation
- [API Reference](https://docs.zoptal.com/api)
- [Guides and Tutorials](https://docs.zoptal.com/guides)
- [SDKs and Libraries](https://docs.zoptal.com/sdks)

### Community
- [Discord Community](https://discord.gg/zoptal)
- [GitHub Discussions](https://github.com/zoptal/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/zoptal)

### Support
- [Help Center](https://help.zoptal.com)
- [Contact Support](mailto:support@zoptal.com)
- [Bug Reports](mailto:bugs@zoptal.com)

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Core authentication and user management
- Project management functionality
- AI service integrations
- Billing and subscription management
- Notification system
- Analytics and reporting
- Administrative operations

### Upcoming Features
- GraphQL API endpoints
- Real-time WebSocket connections
- Enhanced webhook events
- API versioning support
- Additional AI model integrations

## Legal

- [Terms of Service](https://zoptal.com/terms)
- [Privacy Policy](https://zoptal.com/privacy)
- [API Terms](https://zoptal.com/api-terms)

---

For the most up-to-date API documentation, visit [docs.zoptal.com](https://docs.zoptal.com).