# Error Handling Guide

## Overview

The Zoptal Authentication Service implements comprehensive error handling with standardized error codes, detailed metadata, and user-friendly messaging. This guide covers error handling best practices, error code definitions, and integration strategies.

## Table of Contents

- [Error Response Format](#error-response-format)
- [Error Categories](#error-categories)
- [Error Code Reference](#error-code-reference)
- [Error Metadata](#error-metadata)
- [Client Integration](#client-integration)
- [Retry Strategies](#retry-strategies)
- [Troubleshooting](#troubleshooting)
- [Monitoring and Alerting](#monitoring-and-alerting)

## Error Response Format

All error responses follow a standardized format:

```json
{
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "details": {
    "field": "email",
    "metadata": {
      "userFriendly": true,
      "retryable": true,
      "severity": "MEDIUM",
      "category": "CLIENT_ERROR"
    },
    "requestId": "req_1703123456_abc123"
  },
  "timestamp": "2024-01-10T15:30:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Standardized error code (see [Error Code Reference](#error-code-reference)) |
| `message` | string | Human-readable error description |
| `details` | object | Additional error context and metadata |
| `details.metadata` | object | Error handling metadata (retryable, severity, etc.) |
| `details.requestId` | string | Unique request identifier for tracing |
| `timestamp` | string | ISO 8601 timestamp when error occurred |

## Error Categories

### 1. Client Errors (4xx)

Errors caused by invalid client requests.

**Common Categories:**
- **Authentication Errors**: Invalid credentials, expired tokens
- **Authorization Errors**: Insufficient permissions, forbidden access
- **Validation Errors**: Invalid input format, missing required fields
- **Rate Limiting**: Too many requests in time window
- **Resource Errors**: Not found, already exists, conflicts

### 2. Server Errors (5xx)

Errors caused by server-side issues.

**Common Categories:**
- **Database Errors**: Connection failures, query timeouts
- **External Service Errors**: Third-party service unavailable
- **System Errors**: Internal failures, configuration issues
- **Circuit Breaker**: Service degradation protection

### 3. Security Errors (4xx/5xx)

Security-related errors and suspicious activity.

**Common Categories:**
- **Fraud Detection**: Suspicious patterns detected
- **IP Restrictions**: Geographic or IP-based blocking
- **Account Protection**: Lockouts, security holds

## Error Code Reference

### Authentication Errors

| Code | HTTP Status | Description | Retryable |
|------|-------------|-------------|-----------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email/password combination is incorrect | ✅ |
| `AUTH_ACCOUNT_LOCKED` | 423 | Account temporarily locked due to suspicious activity | ❌ |
| `AUTH_ACCOUNT_SUSPENDED` | 403 | Account suspended by administrator | ❌ |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email verification required | ❌ |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired | ✅ |
| `AUTH_INVALID_TOKEN` | 401 | Token is malformed or invalid | ❌ |
| `AUTH_2FA_REQUIRED` | 403 | Two-factor authentication required | ✅ |
| `AUTH_2FA_INVALID_CODE` | 400 | 2FA code is incorrect | ✅ |
| `AUTH_FORCE_PASSWORD_RESET` | 403 | Password reset required by policy | ❌ |

### Validation Errors

| Code | HTTP Status | Description | Retryable |
|------|-------------|-------------|-----------|
| `VALIDATION_REQUIRED_FIELD` | 400 | Required field is missing | ✅ |
| `VALIDATION_INVALID_EMAIL` | 400 | Email format is invalid | ✅ |
| `VALIDATION_INVALID_PHONE` | 400 | Phone number format is invalid | ✅ |
| `VALIDATION_PASSWORD_TOO_WEAK` | 400 | Password doesn't meet security requirements | ✅ |
| `VALIDATION_INVALID_LENGTH` | 400 | Field length is outside valid range | ✅ |
| `VALIDATION_INVALID_FORMAT` | 400 | Field format is incorrect | ✅ |

### Rate Limiting Errors

| Code | HTTP Status | Description | Retryable |
|------|-------------|-------------|-----------|
| `RATE_LIMIT_EXCEEDED` | 429 | General rate limit exceeded | ✅ |
| `RATE_LIMIT_LOGIN_ATTEMPTS` | 429 | Too many login attempts | ✅ |
| `RATE_LIMIT_PASSWORD_RESET` | 429 | Too many password reset requests | ✅ |
| `RATE_LIMIT_EMAIL_VERIFICATION` | 429 | Too many email verification requests | ✅ |
| `RATE_LIMIT_SMS_VERIFICATION` | 429 | Too many SMS verification requests | ✅ |

### System Errors

| Code | HTTP Status | Description | Retryable |
|------|-------------|-------------|-----------|
| `DATABASE_CONNECTION_ERROR` | 503 | Database connection failed | ✅ |
| `EXTERNAL_EMAIL_SERVICE_ERROR` | 502 | Email service unavailable | ✅ |
| `EXTERNAL_SMS_SERVICE_ERROR` | 502 | SMS service unavailable | ✅ |
| `SYSTEM_CIRCUIT_BREAKER_OPEN` | 503 | Circuit breaker protecting degraded service | ✅ |
| `SYSTEM_MAINTENANCE_MODE` | 503 | System under maintenance | ✅ |

### Security Errors

| Code | HTTP Status | Description | Retryable |
|------|-------------|-------------|-----------|
| `SECURITY_SUSPICIOUS_ACTIVITY` | 403 | Suspicious activity detected | ❌ |
| `SECURITY_IP_BLOCKED` | 403 | IP address is blocked | ❌ |
| `SECURITY_GEO_RESTRICTION` | 403 | Geographic access restriction | ❌ |
| `SECURITY_FRAUD_DETECTED` | 403 | Fraudulent activity detected | ❌ |

## Error Metadata

Each error includes metadata to help with proper handling:

```json
{
  "metadata": {
    "userFriendly": true,      // Safe to show to end users
    "retryable": true,         // Request can be retried
    "severity": "MEDIUM",      // LOW, MEDIUM, HIGH, CRITICAL
    "category": "CLIENT_ERROR" // CLIENT_ERROR, SERVER_ERROR, SECURITY_ERROR
  }
}
```

### Metadata Fields

| Field | Values | Description |
|-------|--------|-------------|
| `userFriendly` | boolean | Whether error message is safe to display to users |
| `retryable` | boolean | Whether the operation can be retried |
| `severity` | LOW, MEDIUM, HIGH, CRITICAL | Error severity level |
| `category` | CLIENT_ERROR, SERVER_ERROR, SECURITY_ERROR | Error category |

## Client Integration

### JavaScript/TypeScript Example

```typescript
interface ApiError {
  code: string;
  message: string;
  details: {
    metadata?: {
      userFriendly: boolean;
      retryable: boolean;
      severity: string;
      category: string;
    };
    requestId?: string;
    [key: string]: any;
  };
  timestamp: string;
}

class ApiClient {
  async handleApiError(error: ApiError): Promise<void> {
    const { code, message, details } = error;
    const metadata = details.metadata;

    // Check if error is user-friendly
    if (metadata?.userFriendly) {
      this.showUserMessage(message);
    } else {
      this.showGenericErrorMessage();
    }

    // Handle specific error types
    switch (code) {
      case 'AUTH_TOKEN_EXPIRED':
        await this.refreshToken();
        break;
      
      case 'AUTH_2FA_REQUIRED':
        this.redirectTo2FA();
        break;
      
      case 'RATE_LIMIT_EXCEEDED':
        const retryAfter = this.getRetryAfterFromHeaders();
        await this.scheduleRetry(retryAfter);
        break;
      
      case 'VALIDATION_INVALID_EMAIL':
        this.highlightEmailField();
        break;
      
      default:
        if (metadata?.retryable) {
          await this.implementExponentialBackoff();
        }
    }

    // Log error for debugging
    console.error('API Error:', {
      code,
      message,
      requestId: details.requestId,
      severity: metadata?.severity
    });
  }
}
```

### React Hook Example

```typescript
import { useState } from 'react';

interface UseApiErrorOptions {
  showUserFriendlyErrors?: boolean;
  enableAutoRetry?: boolean;
  maxRetries?: number;
}

export function useApiError(options: UseApiErrorOptions = {}) {
  const [error, setError] = useState<ApiError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = async (apiError: ApiError) => {
    setError(apiError);
    
    const { code, details } = apiError;
    const metadata = details.metadata;

    // Show user-friendly errors
    if (options.showUserFriendlyErrors && metadata?.userFriendly) {
      toast.error(apiError.message);
    }

    // Auto-retry for retryable errors
    if (options.enableAutoRetry && metadata?.retryable) {
      await handleRetry(apiError);
    }

    // Handle specific authentication errors
    if (code.startsWith('AUTH_')) {
      await handleAuthError(apiError);
    }
  };

  const handleRetry = async (apiError: ApiError) => {
    const maxRetries = options.maxRetries || 3;
    let retries = 0;
    
    setIsRetrying(true);
    
    while (retries < maxRetries) {
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, retries) * 1000)
      );
      
      try {
        // Retry the original request
        // Implementation depends on your HTTP client
        break;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
      }
    }
    
    setIsRetrying(false);
  };

  const clearError = () => setError(null);

  return {
    error,
    isRetrying,
    handleError,
    clearError
  };
}
```

### Axios Interceptor Example

```typescript
import axios, { AxiosError } from 'axios';

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  (error: AxiosError<ApiError>) => {
    const apiError = error.response?.data;
    
    if (apiError) {
      const { code, details } = apiError;
      const metadata = details.metadata;

      // Handle token expiration
      if (code === 'AUTH_TOKEN_EXPIRED') {
        return refreshTokenAndRetry(error);
      }

      // Handle rate limiting
      if (code === 'RATE_LIMIT_EXCEEDED') {
        const retryAfter = error.response?.headers['retry-after'];
        return retryAfterDelay(error, retryAfter);
      }

      // Handle retryable server errors
      if (metadata?.retryable && metadata?.category === 'SERVER_ERROR') {
        return retryWithExponentialBackoff(error);
      }
    }

    return Promise.reject(error);
  }
);

async function refreshTokenAndRetry(originalError: AxiosError) {
  try {
    await authService.refreshToken();
    // Retry original request with new token
    return axios.request(originalError.config!);
  } catch (refreshError) {
    // Redirect to login if refresh fails
    window.location.href = '/login';
    return Promise.reject(refreshError);
  }
}

async function retryAfterDelay(error: AxiosError, retryAfter?: string) {
  const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
  await new Promise(resolve => setTimeout(resolve, delay));
  return axios.request(error.config!);
}
```

## Retry Strategies

### Exponential Backoff

```typescript
class RetryStrategy {
  async withExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const apiError = error.response?.data as ApiError;
        
        // Don't retry non-retryable errors
        if (!apiError?.details?.metadata?.retryable) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Calculate delay with jitter
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 0.1 * delay;
        
        await new Promise(resolve => 
          setTimeout(resolve, delay + jitter)
        );
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}
```

### Circuit Breaker Pattern

```typescript
class ApiCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

## Troubleshooting

### Common Error Scenarios

#### 1. Authentication Issues

**Symptom**: Getting `AUTH_INVALID_CREDENTIALS` repeatedly
**Possible Causes**:
- Wrong email/password combination
- Account locked due to failed attempts
- Email not verified

**Resolution**:
```typescript
// Check for specific auth errors
if (error.code === 'AUTH_INVALID_CREDENTIALS') {
  // Show password reset option after 3 failed attempts
  if (failedAttempts >= 3) {
    showPasswordResetOption();
  }
}

if (error.code === 'AUTH_EMAIL_NOT_VERIFIED') {
  // Offer to resend verification email
  showEmailVerificationPrompt();
}
```

#### 2. Rate Limiting

**Symptom**: Getting `RATE_LIMIT_EXCEEDED` errors
**Possible Causes**:
- Too many requests in short time
- Automated scripts hitting API
- User repeatedly clicking buttons

**Resolution**:
```typescript
// Handle rate limiting gracefully
if (error.code === 'RATE_LIMIT_EXCEEDED') {
  const retryAfter = response.headers['retry-after'];
  const waitTime = parseInt(retryAfter) || 60;
  
  showRateLimitMessage(waitTime);
  disableSubmitButton(waitTime * 1000);
}
```

#### 3. Service Unavailability

**Symptom**: Getting 5xx errors with circuit breaker codes
**Possible Causes**:
- External service downtime
- Database connectivity issues
- System maintenance

**Resolution**:
```typescript
// Implement graceful degradation
if (error.code === 'SYSTEM_CIRCUIT_BREAKER_OPEN') {
  // Show cached data or limited functionality
  enableOfflineMode();
  showServiceDowngradedMessage();
}

if (error.code === 'DATABASE_CONNECTION_ERROR') {
  // Retry with exponential backoff
  scheduleRetryWithBackoff();
}
```

### Error Debugging

#### Request Tracing

Every error includes a `requestId` for tracing:

```typescript
// Log errors with request ID for support
console.error('API Error', {
  code: error.code,
  message: error.message,
  requestId: error.details.requestId,
  timestamp: error.timestamp,
  userAgent: navigator.userAgent,
  url: window.location.href
});

// Include in support requests
const errorReport = {
  requestId: error.details.requestId,
  timestamp: error.timestamp,
  userDescription: 'What the user was trying to do',
  steps: 'Steps to reproduce'
};
```

#### Error Correlation

```typescript
// Correlate errors across multiple requests
class ErrorTracker {
  private errors: Map<string, ApiError[]> = new Map();
  
  trackError(error: ApiError, operation: string) {
    const key = `${error.code}_${operation}`;
    
    if (!this.errors.has(key)) {
      this.errors.set(key, []);
    }
    
    this.errors.get(key)!.push(error);
    
    // Alert if same error occurs multiple times
    if (this.errors.get(key)!.length >= 3) {
      this.alertRecurringError(key, error);
    }
  }
  
  private alertRecurringError(key: string, error: ApiError) {
    console.warn(`Recurring error detected: ${key}`, {
      occurrences: this.errors.get(key)!.length,
      latestError: error
    });
  }
}
```

## Monitoring and Alerting

### Error Metrics

Track these key metrics for error monitoring:

```typescript
// Error rate by code
const errorRateByCode = {
  'AUTH_INVALID_CREDENTIALS': 0.02,  // 2%
  'RATE_LIMIT_EXCEEDED': 0.01,       // 1%
  'DATABASE_CONNECTION_ERROR': 0.001  // 0.1%
};

// Error severity distribution
const errorSeverityDistribution = {
  'LOW': 0.70,     // 70%
  'MEDIUM': 0.25,  // 25%
  'HIGH': 0.04,    // 4%
  'CRITICAL': 0.01 // 1%
};

// Client vs Server error ratio
const errorCategoryRatio = {
  'CLIENT_ERROR': 0.80,   // 80%
  'SERVER_ERROR': 0.15,   // 15%
  'SECURITY_ERROR': 0.05  // 5%
};
```

### Alert Thresholds

```yaml
alerts:
  error_rate_high:
    condition: error_rate > 0.05  # 5%
    severity: warning
    
  critical_errors:
    condition: severity = "CRITICAL"
    severity: critical
    
  auth_failures_spike:
    condition: AUTH_INVALID_CREDENTIALS > 100/minute
    severity: warning
    
  service_errors:
    condition: category = "SERVER_ERROR" AND rate > 0.02
    severity: critical
```

### Dashboard Queries

```sql
-- Error rate by endpoint
SELECT 
  endpoint,
  COUNT(*) as total_requests,
  SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as errors,
  (SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as error_rate
FROM api_logs 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY endpoint;

-- Top error codes
SELECT 
  error_code,
  COUNT(*) as occurrences,
  error_severity,
  error_category
FROM error_logs 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY error_code, error_severity, error_category
ORDER BY occurrences DESC;

-- Error trends
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  error_code,
  COUNT(*) as occurrences
FROM error_logs 
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY hour, error_code
ORDER BY hour, occurrences DESC;
```

## Best Practices

### For API Developers

1. **Use Standardized Error Codes**: Always use predefined error codes from `ERROR_CODES`
2. **Include Proper Metadata**: Set appropriate severity, category, and retryability
3. **Provide Context**: Include relevant details in error responses
4. **Log Appropriately**: Use correct log levels based on error severity
5. **Test Error Scenarios**: Include error cases in unit and integration tests

### For Client Developers

1. **Handle All Error Types**: Implement handlers for each error category
2. **Respect Retry Metadata**: Only retry retryable errors
3. **Implement Exponential Backoff**: Avoid overwhelming services with retries
4. **Show User-Friendly Messages**: Display appropriate messages based on `userFriendly` flag
5. **Log for Debugging**: Include request IDs and context in error logs

### For Operations Teams

1. **Monitor Error Trends**: Track error rates and patterns
2. **Set Up Alerts**: Configure alerts for critical error thresholds
3. **Correlate Errors**: Link errors to system health and deployments
4. **Maintain Documentation**: Keep error handling guides updated
5. **Review Regularly**: Analyze error patterns to improve system reliability

---

For additional support, refer to the [API Documentation](./API_DOCUMENTATION.md) or contact the development team.