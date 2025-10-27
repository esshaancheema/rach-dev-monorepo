# Security Testing Guide

This guide provides comprehensive instructions for conducting security audits and penetration testing on the Zoptal Authentication Service.

## Overview

The Zoptal Auth Service includes automated security testing tools to identify vulnerabilities and ensure robust security posture. This guide covers:

- Security audit procedures
- Penetration testing methodologies
- Manual security testing techniques
- Security best practices
- Remediation guidelines

## Automated Security Testing

### Security Audit Script

The security audit script (`scripts/security-audit.js`) performs automated vulnerability scanning:

```bash
# Run security audit
npm run security:audit

# Or run directly
node scripts/security-audit.js
```

#### Test Categories

1. **Authentication Security**
   - Weak password acceptance
   - SQL injection in login
   - User enumeration prevention
   - JWT token validation

2. **Authorization & Access Control**
   - Admin endpoint protection
   - IDOR (Insecure Direct Object Reference)
   - Privilege escalation prevention

3. **Session Management**
   - Session fixation prevention
   - Secure cookie attributes
   - Session timeout handling

4. **Input Validation**
   - SQL injection testing
   - XSS prevention
   - CSRF protection

5. **Rate Limiting & DoS Protection**
   - Rate limiting enforcement
   - Brute force protection
   - Account lockout mechanisms

6. **Security Headers**
   - Security header presence
   - HSTS configuration
   - Content security policy

7. **Data Protection**
   - Password security requirements
   - Sensitive data exposure
   - Error message information disclosure

### Penetration Testing Script

The penetration testing script (`scripts/penetration-test.js`) performs comprehensive security testing:

```bash
# Run penetration tests
npm run security:pentest

# Or run directly
node scripts/penetration-test.js
```

#### Attack Scenarios

1. **Authentication Attacks**
   - Brute force attacks
   - Credential stuffing
   - Password spraying
   - JWT token manipulation

2. **Session Attacks**
   - Session fixation
   - Session hijacking
   - Concurrent session abuse

3. **Injection Attacks**
   - SQL injection
   - NoSQL injection
   - LDAP injection
   - Command injection

4. **Business Logic Attacks**
   - Account enumeration
   - Password reset abuse
   - Registration abuse

5. **Authorization Attacks**
   - Privilege escalation
   - Horizontal access control bypass
   - API endpoint enumeration

## Manual Security Testing

### 1. Authentication Testing

#### Test Cases

**TC-AUTH-01: Password Policy Enforcement**
```bash
# Test weak passwords
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Expected: 400 Bad Request with password policy error
```

**TC-AUTH-02: Account Lockout**
```bash
# Perform multiple failed login attempts
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "wrongpassword'$i'"
    }'
  sleep 1
done

# Expected: Account should be locked after threshold
```

**TC-AUTH-03: JWT Token Validation**
```bash
# Test with invalid JWT token
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid.jwt.token"

# Expected: 401 Unauthorized
```

### 2. Authorization Testing

**TC-AUTHZ-01: Admin Endpoint Access**
```bash
# Test admin endpoint without authentication
curl -X GET http://localhost:3000/api/admin/users

# Expected: 401 Unauthorized
```

**TC-AUTHZ-02: IDOR Testing**
```bash
# Test accessing other user's data
curl -X GET http://localhost:3000/api/users/profile/999999 \
  -H "Authorization: Bearer <user-token>"

# Expected: 403 Forbidden or 404 Not Found
```

### 3. Input Validation Testing

**TC-INPUT-01: SQL Injection**
```bash
# Test SQL injection in login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin'\''--",
    "password": "anything"
  }'

# Expected: 400 Bad Request, no SQL errors
```

**TC-INPUT-02: XSS Testing**
```bash
# Test XSS in registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "xss@example.com",
    "password": "ValidPassword123!",
    "firstName": "<script>alert(\"xss\")</script>",
    "lastName": "Test"
  }'

# Expected: Input should be sanitized
```

### 4. Session Management Testing

**TC-SESSION-01: Session Fixation**
```bash
# Get initial session
INITIAL_COOKIES=$(curl -c cookies.txt -b cookies.txt -X GET http://localhost:3000/api)

# Login
curl -c cookies_after_login.txt -b cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "ValidPassword123!"
  }'

# Compare session cookies
diff cookies.txt cookies_after_login.txt

# Expected: Session should change after login
```

## Security Configuration Testing

### 1. Security Headers

```bash
# Check security headers
curl -I http://localhost:3000/api

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
```

### 2. HTTPS Configuration

```bash
# Test HTTPS redirect (production)
curl -I http://production-domain.com/api

# Expected: 301/302 redirect to HTTPS
```

### 3. CORS Configuration

```bash
# Test CORS headers
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:3000/api/auth/login

# Expected: Proper CORS restrictions
```

## Load Testing for Security

### Rate Limiting Testing

```bash
# Test rate limiting with multiple requests
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}' &
done
wait

# Expected: Rate limiting should kick in
```

## Security Testing Tools Integration

### 1. OWASP ZAP Integration

```bash
# Start ZAP proxy
zap.sh -daemon -host 0.0.0.0 -port 8080

# Configure application to use proxy
export HTTP_PROXY=http://localhost:8080
export HTTPS_PROXY=http://localhost:8080

# Run automated scan
zap-cli quick-scan --self-contained http://localhost:3000

# Generate report
zap-cli report -o security-report.html
```

### 2. SQLMap Integration

```bash
# Test for SQL injection
sqlmap -u "http://localhost:3000/api/auth/login" \
       --data="email=test&password=test" \
       --method=POST \
       --level=3 \
       --risk=3
```

### 3. Burp Suite Integration

1. Configure Burp Suite proxy (default: 127.0.0.1:8080)
2. Configure browser/application to use proxy
3. Perform manual testing through proxy
4. Use Burp Scanner for automated vulnerability detection

## CI/CD Integration

### Security Testing Pipeline

```yaml
# .github/workflows/security-tests.yml
name: Security Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Start services
        run: |
          docker-compose up -d
          sleep 30
          
      - name: Run security audit
        run: npm run security:audit
        
      - name: Run penetration tests
        run: npm run security:pentest
        
      - name: Upload security reports
        uses: actions/upload-artifact@v3
        with:
          name: security-reports
          path: |
            security-audit-report.json
            penetration-test-report.json
```

## Vulnerability Management

### Severity Classification

**Critical (CVSS 9.0-10.0)**
- Authentication bypass
- SQL injection with data access
- Remote code execution
- Complete authorization bypass

**High (CVSS 7.0-8.9)**
- Privilege escalation
- Session hijacking
- Sensitive data exposure
- Cross-site scripting (stored)

**Medium (CVSS 4.0-6.9)**
- Information disclosure
- Cross-site scripting (reflected)
- Cross-site request forgery
- Weak authentication mechanisms

**Low (CVSS 0.1-3.9)**
- Information leakage
- Weak password policy
- Missing security headers
- Directory listing

### Remediation Timeline

- **Critical**: Immediate (0-24 hours)
- **High**: 1-7 days
- **Medium**: 1-30 days
- **Low**: Next planned release

## Security Best Practices

### 1. Input Validation

- Validate all input data
- Use parameterized queries
- Implement proper encoding
- Sanitize user input

### 2. Authentication

- Implement strong password policies
- Use secure session management
- Implement account lockout
- Use multi-factor authentication

### 3. Authorization

- Implement least privilege principle
- Use role-based access control
- Validate all authorization decisions
- Implement proper session management

### 4. Data Protection

- Encrypt sensitive data
- Use secure communication (HTTPS)
- Implement proper key management
- Follow data retention policies

### 5. Error Handling

- Don't expose sensitive information
- Log security events
- Implement proper error pages
- Use generic error messages

## Security Monitoring

### Logging

```javascript
// Security event logging
logger.security('Authentication attempt', {
  email: user.email,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  success: false,
  reason: 'invalid_password'
});
```

### Metrics

- Failed login attempts
- Account lockouts
- Suspicious activities
- Rate limit violations
- Security header violations

### Alerting

Configure alerts for:
- Multiple failed login attempts
- Privilege escalation attempts
- Unusual access patterns
- Security policy violations

## Compliance

### OWASP Top 10 Coverage

1. **A01 Broken Access Control** ✅ Covered
2. **A02 Cryptographic Failures** ✅ Covered
3. **A03 Injection** ✅ Covered
4. **A04 Insecure Design** ✅ Covered
5. **A05 Security Misconfiguration** ✅ Covered
6. **A06 Vulnerable Components** ✅ Covered
7. **A07 ID&Auth Failures** ✅ Covered
8. **A08 Software Integrity Failures** ✅ Covered
9. **A09 Logging Failures** ✅ Covered
10. **A10 SSRF** ✅ Covered

### GDPR Compliance

- Data protection by design
- Right to be forgotten
- Data portability
- Breach notification
- Privacy by default

## Reporting

### Security Report Template

```markdown
# Security Assessment Report

## Executive Summary
- Overall security posture
- Critical findings
- Risk assessment
- Recommendations

## Methodology
- Testing approach
- Tools used
- Scope of testing

## Findings
- Vulnerability details
- Risk ratings
- Evidence
- Recommendations

## Remediation Plan
- Priority timeline
- Resource requirements
- Implementation steps
```

## Contact Information

For security issues or questions:
- **Security Team**: security@zoptal.com
- **Bug Bounty**: https://zoptal.com/security/bug-bounty
- **Emergency**: security-emergency@zoptal.com

---

**Note**: This guide should be regularly updated to reflect new security threats and testing methodologies. Always test in a controlled environment and never perform security testing on production systems without proper authorization.