# Geographic IP Restrictions Guide

## Overview

The Zoptal Authentication Service includes a comprehensive geographic IP restrictions system that provides enhanced security by controlling access based on user location. This system offers real-time geolocation lookup, rule-based access control, risk scoring, and detailed analytics.

## Features

### Core Components

1. **Geolocation Service**: Multi-provider IP geolocation with fallback support
2. **Restriction Rules Engine**: Flexible rule-based access control system
3. **Risk Scoring**: Dynamic risk assessment based on multiple factors
4. **Circuit Breaker Integration**: Resilient external service handling
5. **Admin Interface**: Comprehensive management and monitoring tools

### Key Capabilities

- **Multi-Provider Geolocation**: Uses ip-api, IPInfo, and MaxMind with automatic fallback
- **VPN/Proxy Detection**: Identifies and handles VPN, proxy, and Tor traffic
- **Rule-Based Access Control**: Global, user-specific, and endpoint-specific rules
- **Risk Scoring**: Dynamic scoring based on location, connection type, and behavior
- **Real-time Analytics**: Track access patterns and rule effectiveness
- **Circuit Breaker Protection**: Fail-safe operation when geolocation services are down

## Architecture

### Service Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Geographic Restrictions                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │   Middleware    │    │   Admin Routes   │                   │
│  │   - Pre-handler │    │   - Rule mgmt    │                   │
│  │   - IP extract  │    │   - Statistics   │                   │
│  │   - Exemptions  │    │   - Testing      │                   │
│  └─────────────────┘    └──────────────────┘                   │
│           │                       │                             │
│           v                       v                             │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │ Geo Service     │    │ Geolocation Svc  │                   │
│  │ - Rule engine   │    │ - Multi-provider │                   │
│  │ - Risk scoring  │    │ - Circuit breaker│                   │
│  │ - Statistics    │    │ - Caching        │                   │
│  └─────────────────┘    └──────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Request Arrives**: Middleware intercepts all requests
2. **IP Extraction**: Extract real client IP from headers
3. **Exemption Check**: Check if path, IP, or user role is exempt
4. **Geolocation Lookup**: Get location data with caching
5. **Rule Evaluation**: Apply restriction rules in priority order
6. **Risk Assessment**: Calculate risk score
7. **Access Decision**: Allow/block based on rules and risk
8. **Logging & Analytics**: Track decision and update statistics

## Configuration

### Environment Variables

```bash
# Geolocation Providers
IPINFO_API_KEY=your_ipinfo_key
MAXMIND_API_KEY=your_maxmind_key

# Geographic Bypass (for testing/emergency access)
GEO_BYPASS_SECRET=secure_bypass_secret

# Service Configuration
GEO_RESTRICTIONS_ENABLED=true
GEO_DEFAULT_POLICY=ALLOW
GEO_ENABLE_VPN_DETECTION=true
GEO_ENABLE_PROXY_DETECTION=true
GEO_CACHE_TTL=86400
```

### Middleware Configuration

```typescript
await app.register(geoRestrictionsPlugin, {
  enabled: true,
  exemptPaths: ['/health', '/ready', '/metrics', '/docs'],
  exemptIPs: ['127.0.0.1', '10.0.0.0/8'],
  exemptUserRoles: ['admin', 'super_admin'],
  trustProxyHeaders: true,
  logBlocked: true,
  enableBypass: false,
  bypassSecret: process.env.GEO_BYPASS_SECRET
});
```

## Rule Management

### Rule Types

#### Global Rules
Apply to all requests across the system:

```typescript
{
  name: "Block High Risk Countries",
  type: "BLOCK",
  scope: "GLOBAL",
  countries: ["CN", "RU", "KP", "IR"],
  priority: 100,
  enabled: true,
  reason: "High risk country detected"
}
```

#### User-Specific Rules
Apply to specific users:

```typescript
{
  name: "Allow VIP User from Restricted Country",
  type: "ALLOW",
  scope: "USER",
  countries: ["CN"],
  userIds: ["user-123", "user-456"],
  priority: 200,
  enabled: true
}
```

#### Endpoint-Specific Rules
Apply to specific API endpoints:

```typescript
{
  name: "Block Admin Access from Outside US",
  type: "BLOCK",
  scope: "ENDPOINT",
  countries: ["*"], // All countries except...
  endpoints: ["/api/admin/*"],
  priority: 150,
  enabled: true,
  reason: "Admin access restricted to US only"
}
```

### Rule Priority

Rules are evaluated in priority order (higher numbers first):
- **200+**: User-specific overrides
- **150-199**: Endpoint-specific rules
- **100-149**: Global security rules
- **1-99**: Default/fallback rules

## Risk Scoring

### Risk Factors

The system calculates a risk score (0-10) based on multiple factors:

| Factor | Risk Points | Description |
|--------|-------------|-------------|
| Tor Exit Node | +8 | Very high risk |
| High Risk Country | +4 | Based on configured list |
| VPN Detected | +3 | Commercial VPN usage |
| Proxy Detected | +2 | HTTP/HTTPS proxy |
| Hosting Provider | +2 | Datacenter/hosting IP |
| Low Accuracy | +2 | Poor geolocation accuracy |
| Suspicious User Agent | +1 | Unusual browser patterns |

### Risk Thresholds

- **0-3**: Low risk (normal operation)
- **4-6**: Medium risk (log and monitor)
- **7-8**: High risk (additional verification)
- **9-10**: Critical risk (likely block)

## API Reference

### Admin Endpoints

#### Test Geolocation Lookup
```http
GET /api/admin/geo/test-lookup?ip=8.8.8.8
```

#### Test Access Check
```http
POST /api/admin/geo/test-access
Content-Type: application/json

{
  "ip": "8.8.8.8",
  "endpoint": "/api/users/profile",
  "userId": "user-123",
  "userAgent": "Mozilla/5.0..."
}
```

#### Manage Rules
```http
# Get all rules
GET /api/admin/geo/rules

# Add new rule
POST /api/admin/geo/rules
Content-Type: application/json

{
  "name": "Block Example Country",
  "type": "BLOCK",
  "scope": "GLOBAL",
  "countries": ["XX"],
  "priority": 100,
  "enabled": true,
  "reason": "Security policy"
}

# Remove rule
DELETE /api/admin/geo/rules/{ruleId}
```

#### Statistics and Monitoring
```http
# Get statistics
GET /api/admin/geo/statistics

# Clear statistics
DELETE /api/admin/geo/statistics

# Get service stats
GET /api/admin/geo/service-stats
```

#### Configuration Management
```http
# Update configuration
PUT /api/admin/geo/config
Content-Type: application/json

{
  "enabled": true,
  "defaultPolicy": "ALLOW",
  "enableVpnDetection": true,
  "highRiskCountries": ["CN", "RU", "KP"]
}
```

#### Cache Management
```http
# Clear all cache
DELETE /api/admin/geo/cache

# Clear specific IP
DELETE /api/admin/geo/cache?ip=8.8.8.8
```

## Error Handling

### Error Codes

The system uses standardized error codes:

- `SECURITY_GEO_RESTRICTION`: Access denied due to geographic restrictions
- `EXTERNAL_GEOLOCATION_ERROR`: Geolocation service unavailable
- `RATE_LIMIT_EXCEEDED`: Too many geolocation requests

### Fail-Safe Behavior

- **Geolocation Failure**: Uses fallback data and default policy
- **Service Unavailable**: Circuit breaker prevents cascading failures
- **Unexpected Errors**: Fails open to maintain service availability

## Monitoring and Analytics

### Key Metrics

1. **Access Statistics**
   - Total requests processed
   - Block rate percentage
   - Top blocked/allowed countries
   - Rule effectiveness

2. **Service Performance**
   - Geolocation cache hit rate
   - Average response time
   - Provider usage distribution
   - Error rates by provider

3. **Security Insights**
   - VPN/Proxy detection rates
   - Risk score distribution
   - Suspicious activity patterns
   - Geographic access trends

### Logging

The system provides comprehensive logging:

```json
{
  "level": "warn",
  "message": "Geo restriction blocked request",
  "ip": "1.2.3.4",
  "country": "Example Country",
  "countryCode": "XX",
  "allowed": false,
  "reason": "High risk country detected",
  "appliedRules": ["block-high-risk-countries"],
  "riskScore": 6,
  "endpoint": "/api/users/profile",
  "userId": "user-123",
  "timestamp": "2023-12-07T10:00:00Z"
}
```

## Best Practices

### Security

1. **Rule Configuration**
   - Start with permissive rules and gradually restrict
   - Use specific endpoint rules for sensitive operations
   - Regularly review and update country lists

2. **Monitoring**
   - Monitor block rates to avoid false positives
   - Track rule effectiveness and adjust priorities
   - Set up alerts for unusual geographic patterns

3. **Bypass Mechanisms**
   - Configure emergency bypass for critical situations
   - Implement user-specific overrides for legitimate users
   - Document bypass procedures for support teams

### Performance

1. **Caching Strategy**
   - Use appropriate cache TTL (default 24 hours)
   - Monitor cache hit rates
   - Clear cache for dynamic IP ranges

2. **Provider Configuration**
   - Configure multiple geolocation providers
   - Set appropriate rate limits
   - Monitor provider availability

### Operational

1. **Testing**
   - Use test endpoints to verify configurations
   - Test with various IP addresses and scenarios
   - Validate rule logic before enabling

2. **Documentation**
   - Document all custom rules and their purposes
   - Maintain list of approved countries/regions
   - Keep emergency procedures updated

## Troubleshooting

### Common Issues

#### High False Positive Rate
- **Symptom**: Legitimate users being blocked
- **Solution**: Review rule priorities and country lists
- **Prevention**: Use gradual rollout and monitoring

#### Geolocation Service Errors
- **Symptom**: Consistent geolocation failures
- **Solution**: Check provider API keys and quotas
- **Prevention**: Configure multiple providers

#### Performance Issues
- **Symptom**: Slow response times
- **Solution**: Optimize cache settings and provider timeouts
- **Prevention**: Monitor service metrics

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
await app.register(geoRestrictionsPlugin, {
  enabled: true,
  logAllowed: true,  // Log all requests, not just blocked
  logBlocked: true
});
```

## Migration and Deployment

### Initial Setup

1. **Configure Providers**: Set up geolocation provider API keys
2. **Deploy Service**: Enable geo restrictions with permissive rules
3. **Monitor Traffic**: Observe patterns and adjust rules
4. **Gradual Enforcement**: Progressively add stricter rules

### Rollback Plan

1. **Disable Service**: Set `enabled: false` in configuration
2. **Emergency Bypass**: Use bypass header for critical access
3. **Rule Removal**: Remove problematic rules via admin API
4. **Fallback Mode**: System automatically fails open on errors

## Security Considerations

### Data Privacy

- IP addresses are processed for security purposes only
- Geolocation data is cached temporarily
- No permanent storage of location data
- Compliance with data protection regulations

### Attack Vectors

- **IP Spoofing**: Mitigated by proxy header validation
- **VPN Bypass**: Detected and scored appropriately
- **Rule Bypass**: Protected by role-based access control
- **Service DoS**: Protected by rate limiting and circuit breakers

### Compliance

The system supports compliance with various regulations:
- **GDPR**: Data minimization and purpose limitation
- **CCPA**: Transparent data processing
- **SOC 2**: Security controls and monitoring
- **PCI DSS**: Enhanced security for payment processing

## Support and Maintenance

### Regular Tasks

1. **Weekly**: Review blocked request statistics
2. **Monthly**: Update high-risk country lists
3. **Quarterly**: Review rule effectiveness
4. **Annually**: Audit security policies

### Alerting

Set up monitoring alerts for:
- High block rates (>5%)
- Geolocation service failures
- Unusual geographic patterns
- Rule bypass attempts

For technical support or questions about geographic restrictions, contact the security team or refer to the main authentication service documentation.