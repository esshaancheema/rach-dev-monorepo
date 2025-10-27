# API Versioning Guide

## Overview

The Zoptal Auth Service supports multiple API versions to ensure backward compatibility while allowing for new features and improvements. This document explains how to use and manage different API versions.

## Supported Versions

- **v1**: Legacy version with basic functionality
- **v2**: Enhanced version with improved features and response formats

## Version Detection

The API supports multiple ways to specify the version:

### 1. URL Path Versioning (Recommended)

```http
POST /api/v1/auth/login
POST /api/v2/auth/login
```

### 2. Header Versioning

```http
POST /api/auth/login
Accept-Version: v2
```

### 3. Query Parameter Versioning

```http
POST /api/auth/login?version=v2
```

### 4. Default Version

If no version is specified, the API defaults to **v1** for backward compatibility.

## Version Differences

### Login Endpoint

#### V1 Format
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "deviceId": "optional-device-id",
  "rememberMe": false
}
```

**V1 Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isEmailVerified": true,
    "status": "active"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresAt": 1640995200000
}
```

#### V2 Format (Enhanced)
```http
POST /api/v2/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "deviceInfo": {
    "deviceId": "device-uuid",
    "deviceName": "Chrome on MacOS",
    "deviceType": "web",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  },
  "preferences": {
    "rememberMe": false,
    "stayLoggedIn": false
  }
}
```

**V2 Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "isEmailVerified": true,
      "isPhoneVerified": false,
      "status": "active",
      "role": "user",
      "lastLoginAt": "2024-01-10T15:30:00Z",
      "preferences": {},
      "metadata": {}
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "tokenType": "Bearer",
      "expiresAt": 1640995200000,
      "expiresIn": 900
    },
    "security": {
      "requiresTwoFactor": false,
      "isNewDevice": false,
      "riskLevel": "low"
    }
  },
  "meta": {
    "version": "v2",
    "timestamp": "2024-01-10T15:30:00Z",
    "requestId": "req-123"
  }
}
```

### Registration Endpoint

#### V1 Format
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### V2 Format (Enhanced)
```json
{
  "email": "user@example.com",
  "password": "password123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "timezone": "America/New_York",
    "language": "en"
  },
  "preferences": {
    "marketing": false,
    "notifications": true,
    "twoFactorAuth": false
  },
  "metadata": {
    "source": "web",
    "campaign": "signup-2024"
  }
}
```

## Response Headers

All API responses include version information in headers:

```http
X-API-Version: v2
X-API-Supported-Versions: v1, v2
Link: </api/v1/auth/login>; rel="version-v1", </api/v2/auth/login>; rel="version-v2"
```

### Deprecation Headers

When using deprecated versions:

```http
X-API-Deprecation: true
X-API-Deprecation-Date: 2024-06-01T00:00:00Z
X-API-Sunset-Date: 2024-12-01T00:00:00Z
```

## Version Discovery

Get information about all supported versions:

```http
GET /api/versions
```

Response:
```json
{
  "current": "v1",
  "default": "v1",
  "supported": ["v1", "v2"],
  "deprecated": [],
  "migrations": ["v1->v2"]
}
```

## Client Implementation Examples

### JavaScript/TypeScript

```typescript
class ZoptalAuthClient {
  constructor(
    private baseUrl: string,
    private version: 'v1' | 'v2' = 'v2'
  ) {}

  async login(credentials: LoginCredentials) {
    const response = await fetch(`${this.baseUrl}/api/${this.version}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Version': this.version
      },
      body: JSON.stringify(credentials)
    });

    return response.json();
  }
}

// Usage
const client = new ZoptalAuthClient('https://api.zoptal.com', 'v2');
```

### Python

```python
import requests

class ZoptalAuthClient:
    def __init__(self, base_url: str, version: str = 'v2'):
        self.base_url = base_url
        self.version = version

    def login(self, credentials: dict):
        url = f"{self.base_url}/api/{self.version}/auth/login"
        headers = {
            'Content-Type': 'application/json',
            'Accept-Version': self.version
        }
        
        response = requests.post(url, json=credentials, headers=headers)
        return response.json()

# Usage
client = ZoptalAuthClient('https://api.zoptal.com', 'v2')
```

### cURL Examples

#### V1 Login
```bash
curl -X POST https://api.zoptal.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "rememberMe": false
  }'
```

#### V2 Login
```bash
curl -X POST https://api.zoptal.com/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "deviceInfo": {
      "deviceType": "web",
      "deviceName": "Chrome Browser"
    },
    "preferences": {
      "rememberMe": false
    }
  }'
```

## Migration Guide

### From V1 to V2

When migrating from V1 to V2, consider these changes:

1. **Response Structure**: V2 uses nested `data` objects and includes `meta` information
2. **Enhanced Request Fields**: V2 supports more detailed device and preference information
3. **Additional User Fields**: V2 includes more user properties like `role`, `lastLoginAt`, etc.
4. **Security Information**: V2 provides security context in responses

### Migration Steps

1. **Update Request Format**:
   ```typescript
   // V1
   const loginData = {
     email: 'user@example.com',
     password: 'password123',
     rememberMe: false
   };

   // V2
   const loginData = {
     email: 'user@example.com',
     password: 'password123',
     preferences: {
       rememberMe: false
     }
   };
   ```

2. **Update Response Handling**:
   ```typescript
   // V1
   const { user, accessToken } = response;

   // V2
   const { data: { user, tokens } } = response;
   const accessToken = tokens.accessToken;
   ```

3. **Update Version Specification**:
   ```typescript
   // Change URL or header
   const url = '/api/v2/auth/login'; // or
   const headers = { 'Accept-Version': 'v2' };
   ```

## Error Handling

### V1 Error Format
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

### V2 Error Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Authentication failed",
    "details": {
      "field": "password",
      "reason": "Password does not meet security requirements"
    }
  },
  "meta": {
    "version": "v2",
    "timestamp": "2024-01-10T15:30:00Z",
    "requestId": "req-123"
  }
}
```

## Version-Specific Endpoints

Some endpoints may only be available in certain versions:

### V2-Only Features
- Enhanced user preferences
- Device management
- Advanced security features
- Detailed audit logging

### V1 Compatibility
- Basic authentication flows
- Simple user management
- Legacy integrations

## Best Practices

### For API Consumers

1. **Always Specify Version**: Don't rely on defaults
2. **Handle Multiple Versions**: Support gradual migration
3. **Check Response Headers**: Monitor deprecation warnings
4. **Version Lock**: Pin to specific versions in production
5. **Test Thoroughly**: Validate behavior across versions

### For API Developers

1. **Maintain Backward Compatibility**: Don't break existing clients
2. **Document Changes**: Clearly explain version differences
3. **Deprecation Policy**: Give adequate notice before sunsetting
4. **Version Headers**: Always include version information
5. **Migration Tools**: Provide utilities to help migration

## Deprecation Policy

### Timeline
- **Announcement**: 6 months notice before deprecation
- **Deprecation**: Version marked as deprecated, warnings added
- **Sunset**: 6 months after deprecation, version removed

### Process
1. **Announce**: Email notifications to registered developers
2. **Document**: Update documentation with migration guides
3. **Headers**: Add deprecation headers to responses
4. **Support**: Provide migration assistance
5. **Removal**: Remove deprecated version after sunset date

## Monitoring and Analytics

### Metrics Tracked
- Version usage statistics
- Migration rates
- Error rates by version
- Performance metrics per version

### Admin Dashboard
Monitor version usage in the admin panel:
```http
GET /api/admin/metrics/versions
Authorization: Bearer <admin-token>
```

## Troubleshooting

### Common Issues

1. **Version Not Found**
   ```json
   {
     "error": "UNSUPPORTED_API_VERSION",
     "message": "API version v3 is not supported",
     "supportedVersions": ["v1", "v2"]
   }
   ```

2. **Endpoint Not Available in Version**
   ```json
   {
     "error": "ROUTE_NOT_FOUND_FOR_VERSION",
     "message": "This endpoint is not available in API version v1",
     "availableVersions": ["v2"]
   }
   ```

3. **Invalid Version Format**
   - Ensure version strings match exactly: `v1`, `v2`
   - Check header names: `Accept-Version`
   - Verify URL paths: `/api/v1/`, `/api/v2/`

### Debugging

Enable debug logging to see version detection:
```javascript
// Check response headers
console.log(response.headers.get('X-API-Version'));
console.log(response.headers.get('X-API-Supported-Versions'));
```

## Security Considerations

1. **Version-Specific Vulnerabilities**: Each version may have different security characteristics
2. **Authentication**: All versions use the same authentication mechanism
3. **Rate Limiting**: Applied consistently across versions
4. **Audit Logging**: Version information included in all logs

## Performance Impact

- **Minimal Overhead**: Version detection adds <5ms latency
- **Route Caching**: Versioned routes are cached for performance
- **Memory Usage**: Each version maintains separate route tables
- **Response Size**: V2 responses are typically 20-30% larger due to additional metadata