# Marketplace Service

A comprehensive third-party integration marketplace and plugin management service for the Zoptal platform, enabling developers to create, distribute, and monetize integrations.

## Features

### Developer Portal
- **Integration Management**: Create, update, and publish integrations
- **Package Upload**: Support for ZIP and TAR.GZ packages
- **Version Control**: Semantic versioning with update management
- **Analytics Dashboard**: Installation metrics, usage statistics, revenue tracking
- **Developer Verification**: Identity verification and business validation

### Marketplace
- **Browse Integrations**: Category-based browsing with search and filters
- **Integration Details**: Screenshots, videos, documentation, reviews
- **Installation Management**: One-click install/uninstall with configuration
- **Review System**: User ratings, reviews, and developer responses
- **Featured Integrations**: Curated integration recommendations

### Security & Validation
- **Package Scanning**: Malware detection and security analysis
- **Code Analysis**: Pattern detection for suspicious code
- **Permission Validation**: Granular permission system
- **Manual Review**: Human review process for sensitive integrations
- **Sandboxed Execution**: Safe plugin execution environment

### Plugin Architecture
- **Hook System**: Event-driven plugin execution
- **OAuth Integration**: Secure third-party authentication
- **Webhook Delivery**: Reliable event notifications
- **Configuration Schema**: Type-safe configuration management
- **Component System**: UI component injection

### Monetization
- **Pricing Models**: Free, one-time, subscription, usage-based
- **Stripe Integration**: Secure payment processing
- **Revenue Sharing**: Developer payout management
- **Usage Tracking**: Metered billing for API usage
- **Subscription Management**: Plan upgrades and cancellations

## Architecture

### Core Services

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Integration    │    │  Package         │    │  Security       │
│  Service        │    │  Service         │    │  Service        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────────────────────┼─────────────────────────────────┐
│                                 │                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  │  Database       │    │  Cache           │    │  Webhook        │
│  │  Service        │    │  Service         │    │  Service        │
│  └─────────────────┘    └──────────────────┘    └─────────────────┘
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Data Models

- **Integration**: Core integration metadata and configuration
- **Developer**: Developer account and business information
- **Installation**: User installation state and configuration
- **Review**: User reviews and ratings
- **Analytics**: Usage metrics and performance data

## Quick Start

### Using Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd services/marketplace-service

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f marketplace-service
```

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## API Endpoints

### Integrations

```http
GET    /api/integrations           # Browse marketplace
POST   /api/integrations           # Create integration
GET    /api/integrations/:id       # Get integration details
PUT    /api/integrations/:id       # Update integration
POST   /api/integrations/:id/publish    # Publish integration
POST   /api/integrations/:id/unpublish  # Unpublish integration
GET    /api/integrations/:id/analytics  # Get analytics
```

### Developers

```http
GET    /api/developers/profile     # Get developer profile
PUT    /api/developers/profile     # Update profile
POST   /api/developers/verify      # Request verification
GET    /api/developers/integrations # Get developer integrations
GET    /api/developers/analytics   # Get developer analytics
```

### Installations

```http
GET    /api/installations          # Get user installations
POST   /api/installations          # Install integration
GET    /api/installations/:id      # Get installation details
PUT    /api/installations/:id      # Update configuration
DELETE /api/installations/:id      # Uninstall integration
POST   /api/installations/:id/toggle # Enable/disable installation
```

### Reviews

```http
GET    /api/reviews/:integrationId # Get integration reviews
POST   /api/reviews               # Create review
PUT    /api/reviews/:id           # Update review
DELETE /api/reviews/:id           # Delete review
POST   /api/reviews/:id/helpful   # Mark review helpful
```

## Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3005

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/zoptal_marketplace

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=3

# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key

# File Upload
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads

# Integration Limits
MAX_INTEGRATIONS_PER_DEVELOPER=100
MAX_INSTALLATIONS_PER_INTEGRATION=10000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email Configuration
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key

# CDN Configuration
CDN_BASE_URL=https://cdn.zoptal.com
CDN_ACCESS_KEY_ID=your-access-key
CDN_SECRET_ACCESS_KEY=your-secret-key
```

## Integration Development

### Creating an Integration

1. **Create Manifest**: Define integration metadata and permissions

```json
{
  "name": "slack-integration",
  "version": "1.0.0",
  "description": "Send notifications to Slack channels",
  "author": "Your Company",
  "platformVersion": "^1.0.0",
  "permissions": [
    {
      "name": "webhooks",
      "description": "Send webhook notifications",
      "required": true,
      "category": "external"
    }
  ],
  "hooks": [
    {
      "name": "project_created",
      "trigger": "after_project_create",
      "handler": "src/hooks/project-created.js"
    }
  ],
  "configSchema": {
    "type": "object",
    "properties": {
      "webhookUrl": {
        "type": "string",
        "format": "uri",
        "title": "Slack Webhook URL"
      },
      "channel": {
        "type": "string",
        "title": "Channel Name"
      }
    },
    "required": ["webhookUrl"]
  }
}
```

2. **Implement Hooks**: Create event handlers

```javascript
// src/hooks/project-created.js
module.exports = async function(context, config) {
  const { project } = context.data;
  const message = `New project created: ${project.name}`;
  
  await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message,
      channel: config.channel
    })
  });
};
```

3. **Package and Upload**: Create ZIP package and upload to marketplace

```bash
# Create package
zip -r slack-integration.zip manifest.json src/ README.md

# Upload via API or web interface
curl -X POST https://marketplace.zoptal.com/api/integrations \
  -H "Authorization: Bearer $TOKEN" \
  -F "package=@slack-integration.zip" \
  -F "name=Slack Integration" \
  -F "category=communication"
```

### Hook System

Available hooks for plugin integration:

- `before_project_create` - Before project creation
- `after_project_create` - After project creation
- `before_project_update` - Before project update
- `after_project_update` - After project update
- `before_project_delete` - Before project deletion
- `after_project_delete` - After project deletion
- `dashboard_widget` - Custom dashboard widgets
- `settings_panel` - Settings page extensions
- `toolbar_button` - Custom toolbar buttons

### OAuth Integration

```javascript
// OAuth configuration in manifest
{
  "oauthConfig": {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "redirectUris": ["https://your-app.com/callback"],
    "scopes": ["read", "write"],
    "authorizationUrl": "https://api.service.com/oauth/authorize",
    "tokenUrl": "https://api.service.com/oauth/token"
  }
}
```

## Security

### Package Validation

- **File Structure**: Validates package structure and required files
- **Malware Scanning**: Detects malicious code patterns
- **Code Analysis**: Static analysis for security vulnerabilities
- **Size Limits**: Enforces package size restrictions
- **File Type Validation**: Restricts allowed file types

### Permission System

```typescript
enum PermissionCategory {
  DATA_READ = 'data_read',
  DATA_WRITE = 'data_write', 
  USER_INFO = 'user_info',
  SYSTEM = 'system',
  EXTERNAL = 'external'
}
```

### Sandboxed Execution

- **Isolated Environment**: Plugins run in isolated containers
- **Resource Limits**: CPU and memory restrictions
- **Network Restrictions**: Limited external access
- **Timeout Protection**: Execution time limits
- **Error Handling**: Graceful failure management

## Monitoring & Analytics

### Integration Analytics

- **Installation Metrics**: Install/uninstall rates
- **Usage Statistics**: API calls, hook executions
- **Performance Metrics**: Response times, error rates
- **User Engagement**: Active users, session duration
- **Revenue Tracking**: Subscription and usage revenue

### Developer Dashboard

```typescript
interface IntegrationAnalytics {
  installs: number;
  uninstalls: number;
  activeInstalls: number;
  apiCalls: number;
  webhookDeliveries: number;
  errorRate: number;
  avgResponseTime: number;
  revenue: number;
  ratings: {
    average: number;
    total: number;
    distribution: Record<number, number>;
  };
}
```

## Deployment

### Kubernetes

```bash
# Apply production configuration
kubectl apply -f k8s/production/marketplace-service.yaml

# Check deployment status
kubectl get pods -n zoptal -l app=marketplace-service

# View logs
kubectl logs -n zoptal -l app=marketplace-service -f
```

### Docker

```bash
# Build image
docker build -t zoptal/marketplace-service:latest .

# Run container
docker run -d \
  --name marketplace-service \
  -p 3005:3005 \
  -e DATABASE_URL=postgresql://localhost:5432/marketplace \
  -e REDIS_URL=redis://localhost:6379 \
  zoptal/marketplace-service:latest
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "IntegrationService"
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Test package validation
npm run test:packages

# Test security scanning
npm run test:security
```

### Load Testing

```bash
# Install k6
brew install k6

# Test package upload
k6 run tests/load/package-upload.js

# Test marketplace browsing
k6 run tests/load/marketplace-browse.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure security scans pass
5. Submit a pull request

## License

Copyright (c) 2024 Zoptal. All rights reserved.

## Support

- Documentation: https://docs.zoptal.com/marketplace
- API Reference: https://marketplace.zoptal.com/api/docs
- Developer Portal: https://marketplace.zoptal.com/developers
- Support: marketplace@zoptal.com