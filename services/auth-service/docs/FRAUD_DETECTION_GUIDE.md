# Advanced Fraud Detection System Guide

## Overview

The Zoptal Authentication Service includes a sophisticated fraud detection system that uses behavioral analysis, machine learning techniques, and real-time risk assessment to identify and prevent fraudulent activities. The system provides comprehensive protection against account takeovers, automated attacks, and suspicious behavior patterns.

## Features

### Core Detection Capabilities

1. **Velocity Analysis**: Monitors login frequency and API call patterns
2. **Geolocation Analysis**: Detects impossible travel and location anomalies
3. **Device Fingerprinting**: Identifies unrecognized devices and automation tools
4. **Behavioral Analysis**: Learns user patterns and detects deviations
5. **Network Analysis**: Identifies VPNs, proxies, and anonymization tools
6. **Real-time Scoring**: Dynamic risk assessment with configurable thresholds

### Key Components

- **Multi-Signal Detection**: Six distinct signal types for comprehensive analysis
- **Machine Learning Ready**: Infrastructure prepared for ML model integration
- **Adaptive Thresholds**: Configurable blocking and verification thresholds
- **User Profiling**: Behavioral baseline learning for personalized detection
- **Real-time Decisions**: Sub-second fraud analysis and response

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Fraud Detection System                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │   Middleware    │    │   Admin API      │                   │
│  │   - Pre-handler │    │   - Configuration│                   │
│  │   - Fingerprint │    │   - Testing      │                   │
│  │   - Context     │    │   - Analytics    │                   │
│  └─────────────────┘    └──────────────────┘                   │
│           │                       │                             │
│           v                       v                             │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │ Fraud Service   │    │ Signal Analyzers │                   │
│  │ - Risk scoring  │    │ - Velocity       │                   │
│  │ - User profiles │    │ - Geolocation    │                   │
│  │ - ML pipeline   │    │ - Device/Network │                   │
│  └─────────────────┘    └──────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Signal Analysis Flow

1. **Request Interception**: Middleware captures authentication events
2. **Data Collection**: Gather IP, device fingerprint, user context
3. **Multi-Signal Analysis**: Run parallel detection algorithms
4. **Risk Scoring**: Calculate weighted fraud score (0-100)
5. **Decision Engine**: Apply thresholds for block/verify/allow
6. **Profile Updates**: Learn from legitimate user behavior
7. **Logging & Analytics**: Track patterns and effectiveness

## Fraud Signals

### 1. Velocity Signals (Score: 0-95)

**Purpose**: Detect automated attacks and impossible human behavior

**Indicators**:
- Multiple logins per minute from same IP
- High API call frequency beyond human capability
- Burst patterns indicating automated tools
- Excessive failed login attempts

**Scoring**:
- CRITICAL (90-95): Impossible user velocity (>5 logins/min)
- HIGH (70-89): Suspicious IP velocity (>30 logins/hour)
- MEDIUM (40-69): Elevated failed attempts (>10/hour)

### 2. Geolocation Signals (Score: 0-95)

**Purpose**: Identify location-based anomalies and impossible travel

**Indicators**:
- Login from new country not in user profile
- Impossible travel speed between consecutive logins
- High-risk geographic regions
- Distance from normal locations

**Scoring**:
- CRITICAL (90-95): Impossible travel (>900 km/h required speed)
- HIGH (60-89): Login >5000km from normal locations
- MEDIUM (30-59): Login >2000km from normal locations
- LOW (10-29): New country within reasonable distance

### 3. Device Signals (Score: 0-90)

**Purpose**: Detect automated tools and unrecognized devices

**Indicators**:
- Unrecognized device fingerprint
- Headless browser characteristics
- Automation tool signatures (Selenium, WebDriver)
- Suspicious screen resolutions

**Scoring**:
- HIGH (70-90): Automation tools detected
- MEDIUM (40-69): Suspicious device characteristics
- LOW (20-39): New but normal device

### 4. Behavioral Signals (Score: 0-45)

**Purpose**: Identify deviations from normal user patterns

**Indicators**:
- Login at unusual times for user
- Immediate account changes after login
- Atypical session duration
- Navigation pattern anomalies

**Scoring**:
- MEDIUM (30-45): Immediate sensitive changes after login
- LOW (15-29): Login outside typical hours
- LOW (10-20): Session pattern deviation

### 5. Network Signals (Score: 0-80)

**Purpose**: Analyze network characteristics and anonymization

**Indicators**:
- VPN or proxy usage
- Tor network access
- Hosting/datacenter IP addresses
- Known bot/scraper networks

**Scoring**:
- HIGH (70-80): Tor network usage
- MEDIUM (30-50): VPN/proxy usage
- MEDIUM (25-35): Datacenter/hosting IP
- LOW (10-25): Residential proxy

### 6. Account Signals (Score: 0-85)

**Purpose**: Account-specific risk factors and security events

**Indicators**:
- Recent security incidents
- Account compromise indicators
- Privilege escalation attempts
- Suspicious account modifications

**Scoring**:
- HIGH (70-85): Recent compromise indicators
- MEDIUM (40-69): Security incident history
- LOW (20-39): Minor account inconsistencies

## Risk Scoring Model

### Score Calculation

The fraud score is calculated using a weighted average of signal scores:

```
FraudScore = Σ(SignalScore × SeverityWeight × TypeMultiplier) / TotalWeight
```

**Severity Weights**:
- CRITICAL: 1.0
- HIGH: 0.8
- MEDIUM: 0.6
- LOW: 0.4

**Type Multipliers**:
- VELOCITY: 1.2 (highest impact)
- GEOLOCATION: 1.1
- ACCOUNT: 1.1
- DEVICE: 1.0
- NETWORK: 0.9
- BEHAVIORAL: 0.8 (lowest impact)

### Risk Levels

| Risk Level | Score Range | Action | Description |
|------------|-------------|---------|-------------|
| LOW | 0-29 | Allow | Normal behavior, minimal risk |
| MEDIUM | 30-59 | Monitor | Elevated risk, enhanced logging |
| HIGH | 60-79 | Verify | Additional verification required |
| CRITICAL | 80-100 | Block | Very high fraud probability |

## Configuration

### Environment Variables

```bash
# Fraud Detection Configuration
FRAUD_DETECTION_ENABLED=true
FRAUD_AUTO_BLOCK_THRESHOLD=80
FRAUD_VERIFICATION_THRESHOLD=60
FRAUD_VELOCITY_MAX_LOGINS_PER_MINUTE=5
FRAUD_VELOCITY_MAX_LOGINS_PER_HOUR=30
FRAUD_GEO_ANOMALY_THRESHOLD=500
FRAUD_DEVICE_FINGERPRINTING=true
FRAUD_BEHAVIORAL_ANALYSIS=true
FRAUD_ML_MODEL_ENABLED=false
FRAUD_RETENTION_DAYS=90
```

### Service Configuration

```typescript
const fraudConfig = {
  enabled: true,
  velocityThresholds: {
    maxLoginsPerMinute: 5,
    maxLoginsPerHour: 30,
    maxFailedAttemptsPerHour: 10,
    maxApiCallsPerMinute: 100
  },
  geoAnomalyThreshold: 500, // km
  deviceFingerprintEnabled: true,
  behavioralAnalysisEnabled: true,
  mlModelEnabled: false,
  autoBlockThreshold: 80,
  verificationThreshold: 60,
  retentionDays: 90
};
```

### Middleware Configuration

```typescript
await app.register(fraudDetectionPlugin, {
  enabled: true,
  exemptPaths: ['/health', '/ready', '/metrics'],
  exemptUserRoles: ['admin', 'super_admin'],
  blockThreshold: 80,
  verificationThreshold: 60,
  enableDeviceFingerprinting: true
});
```

## Device Fingerprinting

### Client-Side Collection

The system includes a JavaScript library for collecting device characteristics:

```html
<!-- Include device fingerprinting script -->
<script src="/js/device-fingerprint.js"></script>
```

### Collected Attributes

- Screen resolution and color depth
- Timezone and language settings
- Browser and platform information
- Canvas fingerprinting
- Cookie and local storage availability
- Do Not Track preferences

### Privacy Considerations

- Fingerprints are hashed for privacy
- No personally identifiable information stored
- GDPR and privacy regulation compliant
- User consent mechanisms available

## API Reference

### Admin Endpoints

#### Test Fraud Analysis
```http
POST /api/admin/fraud/test-analysis
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "userId": "user-123",
  "deviceFingerprint": {
    "userAgent": "Mozilla/5.0...",
    "screenResolution": "1920x1080",
    "timezone": "America/New_York",
    "hash": "abc123..."
  },
  "metadata": {
    "endpoint": "/api/auth/login"
  }
}
```

#### Get Statistics
```http
GET /api/admin/fraud/statistics

Response:
{
  "success": true,
  "data": {
    "totalEvents": 10000,
    "blockedEvents": 250,
    "blockRate": 2.5,
    "averageFraudScore": 15.3,
    "topSignalTypes": [
      {"type": "VELOCITY", "count": 120},
      {"type": "GEOLOCATION", "count": 80}
    ]
  }
}
```

#### Update Configuration
```http
PUT /api/admin/fraud/config
Content-Type: application/json

{
  "autoBlockThreshold": 85,
  "verificationThreshold": 65,
  "behavioralAnalysisEnabled": true,
  "velocityThresholds": {
    "maxLoginsPerMinute": 3,
    "maxLoginsPerHour": 25
  }
}
```

#### Clear User Profile
```http
DELETE /api/admin/fraud/user-profile/{userId}
```

#### Bulk Analysis
```http
POST /api/admin/fraud/bulk-analysis
Content-Type: application/json

{
  "scenarios": [
    {
      "name": "Normal US Login",
      "ip": "8.8.8.8",
      "userId": "user-123"
    },
    {
      "name": "Suspicious Multiple Logins",
      "ip": "1.2.3.4",
      "userId": "user-456"
    }
  ]
}
```

#### Signals Reference
```http
GET /api/admin/fraud/signals-reference
```

#### Health Check
```http
GET /api/admin/fraud/health
```

## User Behavior Profiling

### Profile Components

**Normal Locations**: Countries where user typically logs in
**Normal Devices**: Recognized device fingerprints
**Login Patterns**: Typical hours and frequency
**Session Behavior**: Average duration and activity patterns

### Learning Algorithm

1. **Bootstrap Phase**: First 5-10 successful logins establish baseline
2. **Learning Phase**: Continuously update profile with legitimate activity
3. **Mature Phase**: Stable profile with refined normal behavior patterns

### Profile Updates

Profiles are updated after successful, low-risk authentications:
- Geographic locations (keep recent 5)
- Device fingerprints (keep recent 10)
- Login times (keep recent 20)
- Session patterns (rolling averages)

## Machine Learning Integration

### Model Pipeline

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Feature       │    │   ML Model       │    │   Risk Score    │
│   Engineering   │───▶│   Prediction     │───▶│   Enhancement   │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Feature Engineering

- **Temporal Features**: Time since last login, hour of day, day of week
- **Geographical Features**: Distance from normal locations, country risk scores
- **Behavioral Features**: Velocity ratios, pattern deviations
- **Network Features**: IP reputation scores, ASN characteristics
- **Device Features**: Fingerprint similarity scores, automation indicators

### Model Types

1. **Anomaly Detection**: Unsupervised learning for unusual patterns
2. **Classification**: Supervised learning for fraud/legitimate classification
3. **Risk Scoring**: Regression models for continuous risk assessment
4. **Clustering**: User segmentation for personalized thresholds

## Monitoring and Analytics

### Key Metrics

**Detection Metrics**:
- Total fraud events analyzed
- Block rate and false positive rate
- Average fraud score distribution
- Signal type effectiveness

**Performance Metrics**:
- Analysis latency (target: <50ms)
- Throughput (events per second)
- Cache hit rates
- Error rates by component

**Business Metrics**:
- Account takeover prevention
- Automated attack blocking
- User experience impact
- Cost of false positives

### Dashboards

1. **Real-time Monitor**: Live fraud event stream
2. **Analytics Dashboard**: Historical trends and patterns
3. **Signal Effectiveness**: Which signals catch the most fraud
4. **Geographic Insights**: Fraud patterns by location
5. **Performance Metrics**: System health and latency

### Alerting

**Critical Alerts**:
- Fraud score threshold breaches
- System component failures
- Unusual spike in fraud events
- Model prediction accuracy degradation

**Warning Alerts**:
- High false positive rates
- Performance degradation
- Configuration changes
- Profile learning anomalies

## Security and Privacy

### Data Protection

- **Encryption**: All fraud data encrypted at rest and in transit
- **Retention**: Configurable data retention policies
- **Anonymization**: Personal data anonymized for analytics
- **Access Control**: Role-based access to fraud systems

### Privacy Compliance

- **GDPR Compliance**: Right to be forgotten, data portability
- **CCPA Compliance**: Consumer data rights protection
- **Consent Management**: User consent for behavioral tracking
- **Data Minimization**: Collect only necessary information

### Security Measures

- **API Security**: Authentication and authorization for admin endpoints
- **Audit Logging**: Complete audit trail of all fraud decisions
- **Rate Limiting**: Protection against abuse of fraud analysis
- **Fail-Safe Design**: System fails open to maintain availability

## Best Practices

### Implementation

1. **Gradual Rollout**
   - Start with monitoring mode (no blocking)
   - Gradually increase thresholds
   - Monitor false positive rates
   - Adjust based on user feedback

2. **Threshold Tuning**
   - Begin with conservative thresholds
   - Use A/B testing for threshold optimization
   - Monitor business impact of changes
   - Consider user segment differences

3. **Profile Management**
   - Allow legitimate profile updates
   - Handle user travel scenarios
   - Provide user override mechanisms
   - Clear profiles after security incidents

### Operations

1. **Monitoring**
   - Set up comprehensive alerting
   - Monitor false positive rates daily
   - Review blocked events regularly
   - Track model performance metrics

2. **Incident Response**
   - Have escalation procedures for high fraud scores
   - Maintain manual override capabilities
   - Document fraud patterns and responses
   - Regular review of blocked events

3. **Performance**
   - Monitor analysis latency
   - Optimize hot paths
   - Use caching effectively
   - Scale components independently

### User Experience

1. **Communication**
   - Clear messaging for blocked users
   - Explain additional verification requirements
   - Provide alternative authentication methods
   - Offer support contact information

2. **Friction Balance**
   - Minimize false positives
   - Provide quick verification options
   - Remember verified devices
   - Respect user preferences

## Troubleshooting

### Common Issues

#### High False Positive Rate
- **Symptoms**: Legitimate users frequently blocked
- **Causes**: Thresholds too low, profile learning insufficient
- **Solutions**: Increase thresholds, review signal weights, improve profiling

#### Performance Issues
- **Symptoms**: Slow authentication, timeouts
- **Causes**: Complex analysis, external service delays
- **Solutions**: Optimize algorithms, add caching, async processing

#### Inconsistent Detection
- **Symptoms**: Similar patterns scored differently
- **Causes**: Profile differences, temporal factors
- **Solutions**: Normalize features, improve consistency checks

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
const fraudConfig = {
  enabled: true,
  logAllEvents: true,  // Log all analyses
  debugMode: true      // Detailed debug information
};
```

### Testing Tools

1. **Scenario Testing**: Bulk analysis for various fraud scenarios
2. **Threshold Testing**: A/B test different threshold values
3. **Signal Testing**: Evaluate individual signal effectiveness
4. **Performance Testing**: Load testing with realistic fraud patterns

## Future Enhancements

### Planned Features

1. **Advanced ML Models**
   - Deep learning for pattern recognition
   - Ensemble methods for improved accuracy
   - Real-time model updates
   - Federated learning capabilities

2. **Enhanced Profiling**
   - Biometric behavioral patterns
   - Advanced device fingerprinting
   - Social graph analysis
   - Cross-account correlation

3. **Integration Improvements**
   - Third-party threat intelligence
   - Industry fraud databases
   - Real-time risk feeds
   - Enhanced geolocation services

### Research Areas

- **Explainable AI**: Interpretable fraud decisions
- **Adversarial Robustness**: Protection against evasion attacks
- **Privacy-Preserving ML**: Differential privacy, federated learning
- **Real-time Adaptation**: Dynamic threshold adjustment

For technical support or questions about fraud detection, contact the security team or refer to the main authentication service documentation.