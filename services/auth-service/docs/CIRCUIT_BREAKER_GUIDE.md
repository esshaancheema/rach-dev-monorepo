# Circuit Breaker Pattern Implementation Guide

## Overview

The auth service now includes enhanced error handling for external services (SendGrid and Twilio) using the Circuit Breaker pattern. This ensures the system remains resilient when external services fail or become unavailable.

## Features

### 1. Circuit Breaker States

The circuit breaker can be in one of three states:

- **CLOSED**: Normal operation, requests are allowed through
- **OPEN**: Service is failing, requests are blocked and fallback is used
- **HALF_OPEN**: Testing if service has recovered, limited requests allowed

### 2. Automatic Failure Detection

- Tracks failures per service (email, SMS)
- Opens circuit after 5 consecutive failures
- Automatically attempts recovery after 60 seconds

### 3. Message Queueing

When services are unavailable:
- Messages are queued in Redis for later processing
- Background jobs process queued messages when services recover
- Prevents message loss during outages

### 4. Rate Limiting

Built-in rate limiting to prevent overwhelming external services:
- **Email**: 5 emails per hour per recipient
- **SMS**: 3 SMS per hour per phone number

## Architecture

```
┌─────────────────┐
│   Application   │
└────────┬────────┘
         │
┌────────▼────────┐
│ Enhanced Email/ │
│  SMS Service    │
└────────┬────────┘
         │
┌────────▼────────┐     ┌─────────────┐
│ Circuit Breaker ├─────► Redis Queue │
└────────┬────────┘     └──────┬──────┘
         │                     │
┌────────▼────────┐            │
│ External Service│            │
│(SendGrid/Twilio)│            │
└─────────────────┘            │
                               │
┌──────────────────────────────▼──────┐
│    Message Queue Processor          │
│ (Background Job - Runs every 3-5min)│
└──────────────────────────────────────┘
```

## Usage

### Email Service

```typescript
// The service automatically handles failures
const result = await emailService.sendEmailVerification({
  to: 'user@example.com',
  name: 'John Doe',
  verificationUrl: 'https://example.com/verify/token'
});

if (result.success) {
  // Email sent successfully
  console.log('Message ID:', result.messageId);
} else if (result.fallbackUsed) {
  // Email queued for later delivery
  console.log('Email queued due to:', result.error);
} else {
  // Permanent failure (e.g., invalid email)
  console.log('Email failed:', result.error);
}
```

### SMS Service

```typescript
// The service automatically handles failures
const result = await smsService.sendPhoneVerification({
  to: '+1234567890',
  code: '123456',
  name: 'John Doe'
});

if (result.success) {
  // SMS sent successfully
  console.log('Message ID:', result.messageId);
} else if (result.fallbackUsed) {
  // SMS queued for later delivery
  console.log('SMS queued due to:', result.error);
} else {
  // Permanent failure (e.g., invalid phone number)
  console.log('SMS failed:', result.error);
}
```

## Admin Management

### Monitor Circuit Breaker Status

```bash
GET /api/admin/queue/stats
Authorization: Bearer <admin-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "statistics": {
      "emailQueue": {
        "length": 5,
        "processedCount": 120,
        "failedCount": 2
      },
      "smsQueue": {
        "length": 0,
        "processedCount": 85,
        "failedCount": 0
      },
      "lastProcessedAt": "2024-01-10T15:30:00Z"
    },
    "circuitBreakers": {
      "email": {
        "state": "CLOSED",
        "failureCount": 0,
        "successCount": 0,
        "isAvailable": true
      },
      "sms": {
        "state": "OPEN",
        "failureCount": 5,
        "lastFailureTime": 1704901800000,
        "nextAttemptTime": 1704901860000,
        "isAvailable": false
      }
    },
    "servicesHealthy": false
  }
}
```

### Manually Process Queue

```bash
POST /api/admin/queue/process
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "queue": "all"  // Options: "email", "sms", "all"
}
```

### Reset Circuit Breaker

```bash
POST /api/circuit-breaker/email/reset
Authorization: Bearer <admin-token>
```

## Configuration

### Environment Variables

```env
# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@zoptal.com

# SMS Service
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Circuit Breaker Settings (optional - these are defaults)
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RECOVERY_TIMEOUT=60000
CIRCUIT_BREAKER_MONITORING_PERIOD=30000
CIRCUIT_BREAKER_HALF_OPEN_MAX_CALLS=3
```

## Error Handling

### Email Errors

The system categorizes email errors as:

**Permanent Failures** (won't retry):
- `INVALID_EMAIL_DATA`: Bad email format or data
- `EMAIL_AUTH_FAILED`: SendGrid authentication failed
- `EMAIL_PERMISSION_DENIED`: Permission issues
- `EMAIL_TOO_LARGE`: Email size exceeds limit

**Temporary Failures** (will retry):
- `EMAIL_RATE_LIMITED`: SendGrid rate limit hit
- `EMAIL_SERVICE_ERROR`: 5xx errors from SendGrid
- `EMAIL_SERVICE_UNAVAILABLE`: Service not configured

### SMS Errors

The system categorizes SMS errors as:

**Permanent Failures** (won't retry):
- `INVALID_PHONE_NUMBER`: Invalid phone number format
- `SMS_DELIVERY_BLOCKED`: Number blocked or unsubscribed
- `SMS_AUTH_FAILED`: Twilio authentication failed
- `SMS_UNVERIFIED_NUMBER`: Number not verified (trial accounts)

**Temporary Failures** (will retry):
- `SMS_RATE_LIMITED`: Twilio rate limit hit
- `SMS_DELIVERY_FAILED`: Temporary delivery issues
- `SMS_SERVICE_ERROR`: 5xx errors from Twilio
- `SMS_SERVICE_UNAVAILABLE`: Service not configured

## Background Processing

### Email Queue Processor
- Runs every 5 minutes
- Processes up to 10 queued emails per run
- Retries failed emails up to 5 times
- Respects circuit breaker state

### SMS Queue Processor
- Runs every 3 minutes (SMS are more time-sensitive)
- Processes up to 10 queued SMS per run
- Retries failed SMS up to 5 times
- Respects circuit breaker state

## Monitoring and Alerts

The system automatically:
- Logs all circuit breaker state changes
- Records metrics for processing duration
- Sends admin alerts when:
  - Queue processing fails repeatedly (>5 times)
  - Services recover from failures
  - Circuit breakers open due to failures

## Best Practices

1. **Don't Disable Circuit Breakers**: They protect external services from being overwhelmed
2. **Monitor Queue Lengths**: High queue lengths indicate service issues
3. **Set Appropriate Timeouts**: Configure based on your SLA requirements
4. **Test Fallback Behavior**: Regularly test with services disabled
5. **Review Failed Messages**: Check logs for permanently failed messages

## Troubleshooting

### Circuit Breaker Stuck Open

1. Check external service status (SendGrid/Twilio)
2. Verify API credentials are correct
3. Check rate limits haven't been exceeded
4. Manually reset if necessary (admin only)

### Messages Not Being Processed

1. Verify background processor is running
2. Check Redis connectivity
3. Review processor logs for errors
4. Manually trigger processing if needed

### High Failure Rates

1. Check external service status pages
2. Verify network connectivity
3. Review error logs for specific error codes
4. Consider increasing rate limits if needed

## Testing

### Unit Tests

```bash
# Run circuit breaker tests
npm test -- circuit-breaker
```

### Integration Tests

```bash
# Test with real services
npm run test:integration -- email-service
npm run test:integration -- sms-service
```

### Load Testing

```bash
# Test circuit breaker under load
npm run test:load -- --scenario=circuit-breaker
```

## Migration Guide

If upgrading from the old email/SMS services:

1. **No Code Changes Required**: The enhanced services maintain the same API
2. **Update Imports**: Services are now imported from the enhanced modules
3. **Monitor Initial Deployment**: Watch for any unexpected circuit breaker trips
4. **Configure Rate Limits**: Adjust based on your usage patterns

## Security Considerations

1. **Queue Security**: Queued messages are stored in Redis - ensure Redis is secured
2. **Admin Access**: Circuit breaker controls require admin authentication
3. **Sensitive Data**: Phone numbers and emails are masked in logs
4. **Rate Limiting**: Prevents abuse of external services

## Performance Impact

- **Minimal Overhead**: Circuit breaker adds <5ms latency
- **Queue Operations**: Redis operations are fast (<10ms)
- **Background Processing**: Runs on separate threads, doesn't block main app
- **Memory Usage**: Queues are size-limited to prevent memory issues