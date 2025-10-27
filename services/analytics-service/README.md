# Zoptal Analytics Service

A comprehensive analytics and business intelligence service providing advanced data visualization, custom dashboards, and real-time insights for the Zoptal platform.

## Features

### 📊 **Advanced Analytics Engine**
- **Real-time Data Processing**: Stream processing with sub-second latency
- **Multi-dimensional Analysis**: Complex queries across time, geography, and user segments
- **Predictive Analytics**: ML-powered forecasting and trend analysis
- **Anomaly Detection**: Automated detection of unusual patterns and outliers
- **Custom Metrics**: Define and track business-specific KPIs

### 🎯 **Custom Dashboards**
- **Drag-and-Drop Builder**: Intuitive dashboard creation interface
- **Pre-built Templates**: Industry-specific dashboard templates
- **Real-time Updates**: Live data streaming to dashboards
- **Interactive Visualizations**: Drill-down, filtering, and cross-filtering capabilities
- **Mobile Responsive**: Optimized for all device sizes

### 📈 **Visualization Types**
- **Charts**: Line, bar, pie, area, scatter, heatmaps, gauge charts
- **Tables**: Sortable, filterable data tables with pagination
- **Metrics**: KPI cards with trend indicators and sparklines
- **Maps**: Geographic data visualization with heat mapping
- **Funnels**: Conversion funnel analysis and optimization

### 🔍 **Business Intelligence**
- **Cohort Analysis**: Customer retention and behavior analysis
- **Segmentation**: Advanced user and customer segmentation
- **Attribution**: Multi-touch attribution modeling
- **A/B Testing**: Statistical analysis of experiments
- **Revenue Analytics**: Detailed financial performance tracking

### 🚀 **Performance & Scale**
- **High Performance**: Handles billions of events per day
- **Real-time Processing**: Sub-second query response times
- **Auto-scaling**: Automatic resource scaling based on load
- **Caching**: Multi-layer caching with Redis and CDN
- **Data Compression**: Efficient storage with ClickHouse

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Data Ingestion│    │  Analytics      │    │   Dashboard     │
│   (Kafka/Redis) │◄──►│   Engine        │◄──►│   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ClickHouse    │    │   PostgreSQL    │    │   Redis Cache   │
│   (Events)      │    │   (Metadata)    │    │   (Sessions)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- ClickHouse 22+ (optional, for high-volume analytics)

### Installation

1. **Clone and install dependencies**:
```bash
git clone https://github.com/zoptal/analytics-service.git
cd analytics-service
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up databases**:
```bash
# PostgreSQL setup
npm run db:migrate
npm run db:seed

# ClickHouse setup (optional)
npm run clickhouse:setup
```

4. **Start the service**:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Usage

### Event Tracking

Track user events and interactions:

```javascript
// Track a page view
POST /api/events/track
{
  "name": "page_view",
  "properties": {
    "page": "/dashboard",
    "title": "Dashboard",
    "user_id": "user_123",
    "session_id": "session_456"
  }
}

// Track a custom event
POST /api/events/track
{
  "name": "button_click",
  "properties": {
    "button_name": "create_project",
    "page": "/projects",
    "user_id": "user_123"
  }
}
```

### Analytics Queries

Execute complex analytics queries:

```javascript
// Get user engagement metrics
POST /api/analytics/query
{
  "metrics": ["unique_visitors", "page_views", "session_duration"],
  "dimensions": ["date", "country"],
  "filters": {
    "date": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "country": ["US", "UK", "CA"]
  },
  "granularity": "day"
}

// Response
{
  "data": [
    {
      "date": "2024-01-01",
      "country": "US",
      "unique_visitors": 1250,
      "page_views": 4800,
      "session_duration": 245.6
    }
  ],
  "metadata": {
    "totalRows": 31,
    "executionTime": 89,
    "cacheHit": false
  },
  "insights": {
    "trends": [...],
    "anomalies": [...],
    "predictions": [...]
  }
}
```

### Dashboard Management

Create and manage custom dashboards:

```javascript
// Create a dashboard
POST /api/dashboards
{
  "name": "Website Analytics",
  "description": "Track website performance",
  "layout": {
    "type": "grid",
    "columns": 12,
    "responsive": true
  },
  "widgets": [
    {
      "type": "metric",
      "title": "Total Visitors",
      "position": { "x": 0, "y": 0, "width": 3, "height": 2 },
      "config": {
        "metric": "unique_visitors",
        "format": "number",
        "showTrend": true,
        "timeRange": { "relative": "last_30_days" }
      }
    },
    {
      "type": "chart",
      "title": "Traffic Over Time",
      "position": { "x": 0, "y": 2, "width": 8, "height": 4 },
      "config": {
        "chartType": "line",
        "metrics": ["unique_visitors", "page_views"],
        "dimensions": ["date"],
        "timeRange": { "relative": "last_30_days" }
      }
    }
  ]
}

// Get dashboard data
GET /api/dashboards/{id}/data?filters={"country":"US"}
```

### Real-time Metrics

Access real-time performance metrics:

```javascript
// Get current metrics
GET /api/metrics/realtime
{
  "metrics": [
    {
      "name": "active_users",
      "value": 1247,
      "timestamp": "2024-01-15T10:30:00Z",
      "change": "+5.2%"
    },
    {
      "name": "page_views",
      "value": 3891,
      "timestamp": "2024-01-15T10:30:00Z",
      "change": "+12.8%"
    }
  ]
}

// WebSocket for live updates
const ws = new WebSocket('ws://localhost:3000/realtime');
ws.onmessage = (event) => {
  const metric = JSON.parse(event.data);
  console.log('Real-time metric:', metric);
};
```

## Dashboard Templates

### Website Analytics Template

Pre-configured dashboard for website analytics:

```javascript
{
  "name": "Website Analytics",
  "widgets": [
    {
      "type": "metric",
      "title": "Total Visitors",
      "config": { "metric": "unique_visitors" }
    },
    {
      "type": "metric", 
      "title": "Page Views",
      "config": { "metric": "page_views" }
    },
    {
      "type": "metric",
      "title": "Bounce Rate", 
      "config": { "metric": "bounce_rate", "format": "percentage" }
    },
    {
      "type": "chart",
      "title": "Traffic Trends",
      "config": {
        "chartType": "line",
        "metrics": ["unique_visitors", "page_views"],
        "dimensions": ["date"]
      }
    },
    {
      "type": "table",
      "title": "Top Pages",
      "config": {
        "columns": [
          { "field": "page", "title": "Page" },
          { "field": "page_views", "title": "Views" },
          { "field": "unique_visitors", "title": "Visitors" }
        ]
      }
    }
  ]
}
```

### Business Intelligence Template

KPI-focused dashboard for business metrics:

```javascript
{
  "name": "Business Intelligence",
  "widgets": [
    {
      "type": "metric",
      "title": "Revenue",
      "config": { 
        "metric": "revenue", 
        "format": "currency",
        "target": 100000
      }
    },
    {
      "type": "metric",
      "title": "Conversion Rate",
      "config": { 
        "metric": "conversion_rate", 
        "format": "percentage",
        "target": 3.5
      }
    },
    {
      "type": "chart",
      "title": "Revenue Trend",
      "config": {
        "chartType": "area",
        "metrics": ["revenue"],
        "dimensions": ["date"]
      }
    },
    {
      "type": "chart",
      "title": "User Segments",
      "config": {
        "chartType": "pie",
        "metrics": ["users"],
        "dimensions": ["user_segment"]
      }
    }
  ]
}
```

## Advanced Features

### Custom Metrics

Define business-specific metrics:

```javascript
// Register a custom metric
POST /api/metrics/custom
{
  "name": "customer_lifetime_value",
  "displayName": "Customer Lifetime Value",
  "description": "Average revenue per customer",
  "formula": "SUM(revenue) / COUNT(DISTINCT user_id)",
  "type": "currency",
  "category": "Business"
}

// Use in queries
POST /api/analytics/query
{
  "metrics": ["customer_lifetime_value"],
  "dimensions": ["user_segment"],
  "timeRange": { "relative": "last_90_days" }
}
```

### Cohort Analysis

Analyze user retention and behavior:

```javascript
POST /api/analytics/cohort
{
  "cohortType": "retention",
  "cohortBy": "registration_date",
  "actionEvent": "session_start",
  "timeRange": {
    "start": "2024-01-01",
    "end": "2024-03-31"
  },
  "periods": 12
}

// Response includes cohort table and retention curves
{
  "cohorts": [
    {
      "cohort": "2024-01-01",
      "size": 1000,
      "periods": [
        { "period": 0, "users": 1000, "retention": 100 },
        { "period": 1, "users": 450, "retention": 45 },
        { "period": 2, "users": 280, "retention": 28 }
      ]
    }
  ]
}
```

### Funnel Analysis

Track conversion funnels:

```javascript
POST /api/analytics/funnel
{
  "steps": [
    { "name": "Landing", "event": "page_view", "filters": { "page": "/" } },
    { "name": "Signup", "event": "user_registered" },
    { "name": "Onboarding", "event": "onboarding_completed" },
    { "name": "First Action", "event": "project_created" }
  ],
  "timeWindow": "7_days",
  "timeRange": { "relative": "last_30_days" }
}

// Response with conversion rates
{
  "funnel": [
    { "step": "Landing", "users": 10000, "conversionRate": 100 },
    { "step": "Signup", "users": 1200, "conversionRate": 12 },
    { "step": "Onboarding", "users": 980, "conversionRate": 81.67 },
    { "step": "First Action", "users": 756, "conversionRate": 77.14 }
  ]
}
```

### A/B Testing Analysis

Analyze experiment results:

```javascript
POST /api/analytics/experiments/{experimentId}/results
{
  "metrics": ["conversion_rate", "revenue_per_user"],
  "confidenceLevel": 0.95,
  "segments": ["new_users", "returning_users"]
}

// Statistical analysis results
{
  "results": {
    "conversion_rate": {
      "control": { "value": 2.4, "sampleSize": 5000 },
      "treatment": { "value": 2.8, "sampleSize": 5100 },
      "improvement": 16.67,
      "pValue": 0.023,
      "significant": true
    }
  },
  "segments": { ... },
  "recommendation": "Deploy treatment to all users"
}
```

## Data Sources

Connect multiple data sources:

### Event Tracking
- Web applications (JavaScript SDK)
- Mobile applications (iOS/Android SDKs)
- Server-side applications (REST API)
- Third-party integrations

### Database Connections
- PostgreSQL
- MySQL
- MongoDB
- BigQuery
- Snowflake

### External APIs
- Google Analytics
- Facebook Ads
- Google Ads
- Stripe
- Salesforce

## Performance Optimization

### Query Optimization

```javascript
// Use aggregation tables for better performance
POST /api/analytics/query
{
  "metrics": ["page_views"],
  "dimensions": ["date"],
  "timeRange": { "relative": "last_year" },
  "granularity": "month", // Coarser granularity for better performance
  "useCache": true,
  "cacheTTL": 3600
}
```

### Caching Strategy

- **Query Results**: Cache frequently accessed queries
- **Dashboard Data**: Cache widget data with TTL
- **Real-time Metrics**: Cache with short TTL (30 seconds)
- **Aggregations**: Pre-compute common aggregations

### Data Partitioning

```sql
-- ClickHouse partitioning by date
CREATE TABLE events (
  timestamp DateTime,
  event_name String,
  user_id String,
  properties String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, user_id);
```

## Monitoring & Observability

### Health Checks

```javascript
GET /health
{
  "status": "healthy",
  "checks": {
    "database": "healthy",
    "redis": "healthy", 
    "clickhouse": "healthy",
    "eventQueue": "healthy"
  },
  "metrics": {
    "queriesPerSecond": 245,
    "averageQueryTime": 89,
    "cacheHitRate": 0.76
  }
}
```

### Metrics Collection

- Query performance metrics
- Cache hit rates
- Error rates
- Resource utilization
- Data freshness

## Security

### Authentication
- JWT-based API authentication
- Role-based access control (RBAC)
- API key authentication for integrations

### Data Privacy
- PII detection and masking
- GDPR compliance features
- Data retention policies
- Audit logging

### Access Control
```javascript
// Dashboard permissions
{
  "dashboardId": "dash_123",
  "permissions": {
    "owner": "user_456",
    "editors": ["user_789"],
    "viewers": ["user_101", "team_marketing"],
    "public": false
  }
}
```

## Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database URLs
DATABASE_URL=postgresql://user:pass@localhost:5432/analytics
REDIS_URL=redis://localhost:6379
CLICKHOUSE_URL=http://localhost:8123

# Authentication
JWT_SECRET=your-jwt-secret
API_KEY_SECRET=your-api-key-secret

# Analytics Configuration
MAX_QUERY_COMPLEXITY=1000
DEFAULT_CACHE_TTL=300
MAX_DASHBOARD_WIDGETS=50

# External Services
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
EMAIL_SERVICE_API_KEY=your-email-key
```

### Feature Flags

```javascript
{
  "realTimeAnalytics": true,
  "predictiveAnalytics": true,
  "cohortAnalysis": true,
  "customMetrics": true,
  "dataExport": true,
  "apiRateLimit": 1000
}
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: analytics-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: analytics-service
  template:
    spec:
      containers:
      - name: analytics-service
        image: zoptal/analytics-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: analytics-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
```

## Development

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### API Testing

```bash
# Load testing with k6
k6 run tests/load/analytics-load-test.js

# Stress testing
k6 run tests/stress/analytics-stress-test.js
```

## Troubleshooting

### Common Issues

1. **Slow Queries**:
   - Check query complexity
   - Add appropriate indexes
   - Use caching
   - Reduce time range

2. **High Memory Usage**:
   - Optimize aggregation queries
   - Implement data sampling
   - Increase cache TTL

3. **Dashboard Loading Issues**:
   - Check widget configurations
   - Verify data source connections
   - Review error logs

### Debug Mode

```bash
DEBUG=analytics:* npm run dev
```

### Performance Monitoring

```javascript
// Query performance logging
POST /api/analytics/query
// Response includes timing information
{
  "data": [...],
  "metadata": {
    "executionTime": 145,
    "cacheHit": false,
    "queryComplexity": 78,
    "dataSourceLatency": 89
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: https://docs.zoptal.com/analytics
- Issues: https://github.com/zoptal/analytics-service/issues
- Slack: #analytics-team
- Email: analytics-support@zoptal.com