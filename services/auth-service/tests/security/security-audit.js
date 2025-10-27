// Security Audit Script for Zoptal Auth Service
// This script performs automated security testing and vulnerability scanning

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Security test metrics
export const securityViolations = new Counter('security_violations');
export const vulnerabilityCount = new Counter('vulnerability_count');
export const authBypassAttempts = new Rate('auth_bypass_attempts');
export const injectionAttempts = new Rate('injection_attempts');
export const responseTimeSpread = new Trend('response_time_spread');

// Security test configuration
export const options = {
  scenarios: {
    // Authentication security tests
    auth_security: {
      executor: 'constant-vus',
      vus: 5,
      duration: '15m',
      env: { SCENARIO: 'auth_security' },
    },
    
    // Input validation security tests
    input_validation: {
      executor: 'constant-vus',
      vus: 3,
      duration: '15m',
      env: { SCENARIO: 'input_validation' },
    },
    
    // Session management security tests
    session_security: {
      executor: 'constant-vus',
      vus: 2,
      duration: '15m',
      env: { SCENARIO: 'session_security' },
    },
    
    // API security tests
    api_security: {
      executor: 'constant-vus',
      vus: 4,
      duration: '15m',
      env: { SCENARIO: 'api_security' },
    },
    
    // Infrastructure security tests
    infrastructure_security: {
      executor: 'constant-vus',
      vus: 2,
      duration: '15m',
      env: { SCENARIO: 'infrastructure_security' },
    },
  },
  
  thresholds: {
    security_violations: ['count==0'],      // No security violations allowed
    vulnerability_count: ['count<5'],       // Less than 5 minor vulnerabilities
    auth_bypass_attempts: ['rate==0'],      // No successful auth bypasses
    injection_attempts: ['rate==0'],        // No successful injections
    http_req_failed: ['rate<0.1'],          // Less than 10% failures
  },
};

export function setup() {
  console.log('🔒 Starting Zoptal Auth Service Security Audit');
  console.log('🎯 Testing: Authentication, Input Validation, Session Management');
  console.log('⚠️  This is a penetration testing suite - expect security probes');
  
  return {
    baseURL: __ENV.BASE_URL || 'http://localhost:3001',
    testStartTime: Date.now(),
  };
}

export default function(data) {
  const scenario = __ENV.SCENARIO || 'auth_security';
  
  switch (scenario) {
    case 'auth_security':
      authenticationSecurityTests(data.baseURL);
      break;
    case 'input_validation':
      inputValidationTests(data.baseURL);
      break;
    case 'session_security':
      sessionManagementTests(data.baseURL);
      break;
    case 'api_security':
      apiSecurityTests(data.baseURL);
      break;
    case 'infrastructure_security':
      infrastructureSecurityTests(data.baseURL);
      break;
    default:
      authenticationSecurityTests(data.baseURL);
  }
}

// Authentication Security Tests
function authenticationSecurityTests(baseURL) {
  // Test 1: SQL Injection in login
  testSQLInjection(baseURL);
  
  // Test 2: Brute force protection
  testBruteForceProtection(baseURL);
  
  // Test 3: Password policy enforcement
  testPasswordPolicyEnforcement(baseURL);
  
  // Test 4: Account enumeration
  testAccountEnumeration(baseURL);
  
  // Test 5: Authentication bypass attempts
  testAuthenticationBypass(baseURL);
  
  sleep(Math.random() * 2 + 1);
}

// Input Validation Security Tests
function inputValidationTests(baseURL) {
  // Test 1: XSS attempts
  testXSSAttempts(baseURL);
  
  // Test 2: Command injection
  testCommandInjection(baseURL);
  
  // Test 3: Path traversal
  testPathTraversal(baseURL);
  
  // Test 4: JSON injection
  testJSONInjection(baseURL);
  
  // Test 5: LDAP injection
  testLDAPInjection(baseURL);
  
  sleep(Math.random() * 2 + 1);
}

// Session Management Security Tests
function sessionManagementTests(baseURL) {
  // Test 1: Session fixation
  testSessionFixation(baseURL);
  
  // Test 2: Session hijacking protection
  testSessionHijacking(baseURL);
  
  // Test 3: Concurrent session handling
  testConcurrentSessions(baseURL);
  
  // Test 4: Session timeout enforcement
  testSessionTimeout(baseURL);
  
  // Test 5: Logout security
  testLogoutSecurity(baseURL);
  
  sleep(Math.random() * 2 + 1);
}

// API Security Tests
function apiSecurityTests(baseURL) {
  // Test 1: CORS security
  testCORSSecurity(baseURL);
  
  // Test 2: Rate limiting bypass
  testRateLimitingBypass(baseURL);
  
  // Test 3: API versioning security
  testAPIVersioningSecurity(baseURL);
  
  // Test 4: HTTP method tampering
  testHTTPMethodTampering(baseURL);
  
  // Test 5: Content-Type validation
  testContentTypeValidation(baseURL);
  
  sleep(Math.random() * 2 + 1);
}

// Infrastructure Security Tests
function infrastructureSecurityTests(baseURL) {
  // Test 1: HTTP security headers
  testSecurityHeaders(baseURL);
  
  // Test 2: SSL/TLS configuration
  testSSLConfiguration(baseURL);
  
  // Test 3: Information disclosure
  testInformationDisclosure(baseURL);
  
  // Test 4: Directory enumeration
  testDirectoryEnumeration(baseURL);
  
  // Test 5: Error message analysis
  testErrorMessageSecurity(baseURL);
  
  sleep(Math.random() * 2 + 1);
}

// SQL Injection Testing
function testSQLInjection(baseURL) {
  const sqlPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "' OR 1=1 #",
    "'; WAITFOR DELAY '00:00:05' --",
    "' AND (SELECT COUNT(*) FROM users) > 0 --"
  ];
  
  sqlPayloads.forEach(payload => {
    const response = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
      email: payload,
      password: payload
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const isSQLInjectionVulnerable = checkSQLInjectionResponse(response);
    if (isSQLInjectionVulnerable) {
      securityViolations.add(1);
      vulnerabilityCount.add(1);
      console.log(`🚨 SQL Injection vulnerability detected with payload: ${payload}`);
    }
    
    injectionAttempts.add(isSQLInjectionVulnerable);
  });
}

// XSS Testing
function testXSSAttempts(baseURL) {
  const xssPayloads = [
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "<img src=x onerror=alert('XSS')>",
    "';alert('XSS');//",
    "<svg/onload=alert('XSS')>",
    "'+alert('XSS')+'",
    "<iframe src=javascript:alert('XSS')></iframe>"
  ];
  
  // Test registration endpoint
  xssPayloads.forEach(payload => {
    const response = http.post(`${baseURL}/api/auth/register`, JSON.stringify({
      email: `test${Date.now()}@test.com`,
      password: 'ValidPassword123!',
      profile: {
        firstName: payload,
        lastName: payload
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const isXSSVulnerable = checkXSSResponse(response);
    if (isXSSVulnerable) {
      securityViolations.add(1);
      vulnerabilityCount.add(1);
      console.log(`🚨 XSS vulnerability detected with payload: ${payload}`);
    }
  });
}

// Brute Force Protection Testing
function testBruteForceProtection(baseURL) {
  const testEmail = 'bruteforce@test.com';
  const wrongPassword = 'WrongPassword123!';
  let consecutiveFailures = 0;
  
  // Attempt 10 consecutive login failures
  for (let i = 0; i < 10; i++) {
    const response = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
      email: testEmail,
      password: wrongPassword
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.status === 429) {
      // Rate limiting is working
      break;
    } else if (response.status === 401) {
      consecutiveFailures++;
    }
    
    sleep(0.1); // Small delay between attempts
  }
  
  // If we can make 10+ consecutive failures without rate limiting, it's a vulnerability
  if (consecutiveFailures >= 10) {
    securityViolations.add(1);
    vulnerabilityCount.add(1);
    console.log('🚨 Brute force protection insufficient - no rate limiting detected');
  }
}

// Authentication Bypass Testing
function testAuthenticationBypass(baseURL) {
  const bypassAttempts = [
    // Header manipulation
    () => http.get(`${baseURL}/api/profile`, {
      headers: { 'X-Admin': 'true', 'X-User-ID': '1' }
    }),
    
    // Direct access attempts
    () => http.get(`${baseURL}/api/admin/dashboard`),
    
    // Token manipulation
    () => http.get(`${baseURL}/api/profile`, {
      headers: { 'Authorization': 'Bearer fake-token' }
    }),
    
    // Session manipulation
    () => http.get(`${baseURL}/api/profile`, {
      headers: { 'Cookie': 'session=admin; user_id=1' }
    }),
  ];
  
  bypassAttempts.forEach((attempt, index) => {
    const response = attempt();
    
    // If we get 200 without proper authentication, it's a bypass
    const isBypass = response.status === 200;
    if (isBypass) {
      securityViolations.add(1);
      vulnerabilityCount.add(1);
      console.log(`🚨 Authentication bypass detected in attempt ${index + 1}`);
    }
    
    authBypassAttempts.add(isBypass);
  });
}

// Security Headers Testing
function testSecurityHeaders(baseURL) {
  const response = http.get(`${baseURL}/health`);
  
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'strict-transport-security',
    'content-security-policy'
  ];
  
  let missingHeaders = 0;
  requiredHeaders.forEach(header => {
    if (!response.headers[header] && !response.headers[header.toUpperCase()]) {
      missingHeaders++;
      console.log(`⚠️  Missing security header: ${header}`);
    }
  });
  
  if (missingHeaders > 0) {
    vulnerabilityCount.add(missingHeaders);
  }
}

// Session Security Testing
function testSessionFixation(baseURL) {
  // Get initial session
  const initialResponse = http.get(`${baseURL}/health`);
  const initialSessionId = extractSessionId(initialResponse);
  
  if (initialSessionId) {
    // Try to login with same session ID
    const loginResponse = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
      email: 'test@test.com',
      password: 'Test123!'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `session=${initialSessionId}`
      },
    });
    
    const postLoginSessionId = extractSessionId(loginResponse);
    
    // Session should change after login
    if (initialSessionId === postLoginSessionId) {
      securityViolations.add(1);
      vulnerabilityCount.add(1);
      console.log('🚨 Session fixation vulnerability - session ID not changed after login');
    }
  }
}

// Rate Limiting Bypass Testing
function testRateLimitingBypass(baseURL) {
  const bypassTechniques = [
    // Different user agents
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } },
    
    // X-Forwarded-For manipulation
    { headers: { 'X-Forwarded-For': '192.168.1.' + Math.floor(Math.random() * 255) } },
    
    // X-Real-IP manipulation
    { headers: { 'X-Real-IP': '10.0.0.' + Math.floor(Math.random() * 255) } },
    
    // Via proxy headers
    { headers: { 'Via': '1.1 proxy' + Math.random() } },
  ];
  
  // Test each bypass technique
  bypassTechniques.forEach((technique, index) => {
    let requests = 0;
    let rateLimited = false;
    
    // Make rapid requests
    for (let i = 0; i < 50; i++) {
      const response = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
        email: 'ratetest@test.com',
        password: 'WrongPassword'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...technique.headers
        },
      });
      
      requests++;
      
      if (response.status === 429) {
        rateLimited = true;
        break;
      }
    }
    
    // If we made many requests without rate limiting, it might be a bypass
    if (requests > 20 && !rateLimited) {
      vulnerabilityCount.add(1);
      console.log(`⚠️  Potential rate limiting bypass with technique ${index + 1}`);
    }
  });
}

// Content Type Validation Testing
function testContentTypeValidation(baseURL) {
  const maliciousContentTypes = [
    'text/html',
    'application/xml',
    'text/xml',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain'
  ];
  
  maliciousContentTypes.forEach(contentType => {
    const response = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
      email: 'test@test.com',
      password: 'Test123!'
    }), {
      headers: { 'Content-Type': contentType },
    });
    
    // Should reject non-JSON content types for JSON endpoints
    if (response.status === 200) {
      vulnerabilityCount.add(1);
      console.log(`⚠️  Content-Type validation bypass with: ${contentType}`);
    }
  });
}

// Error Message Security Testing
function testErrorMessageSecurity(baseURL) {
  const sensitiveInfoPatterns = [
    /stack trace/i,
    /internal server error/i,
    /database error/i,
    /sql error/i,
    /path.*node_modules/i,
    /\.js:\d+:\d+/,
    /prisma/i,
    /fastify/i
  ];
  
  // Trigger various error conditions
  const errorTriggers = [
    () => http.post(`${baseURL}/api/auth/login`, 'invalid-json', {
      headers: { 'Content-Type': 'application/json' }
    }),
    
    () => http.get(`${baseURL}/api/nonexistent-endpoint`),
    
    () => http.post(`${baseURL}/api/auth/register`, JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json' }
    }),
  ];
  
  errorTriggers.forEach((trigger, index) => {
    const response = trigger();
    const responseBody = response.body;
    
    sensitiveInfoPatterns.forEach(pattern => {
      if (pattern.test(responseBody)) {
        vulnerabilityCount.add(1);
        console.log(`⚠️  Sensitive information disclosure in error ${index + 1}: ${pattern}`);
      }
    });
  });
}

// Helper Functions
function checkSQLInjectionResponse(response) {
  const body = response.body.toLowerCase();
  const sqlErrorIndicators = [
    'sql syntax',
    'mysql_fetch',
    'ora-01756',
    'microsoft jet database',
    'odbc drivers error',
    'sqlite_error',
    'postgresql error',
    'warning: mysql'
  ];
  
  return sqlErrorIndicators.some(indicator => body.includes(indicator)) ||
         response.status === 200 && body.includes('welcome'); // Successful login with injection
}

function checkXSSResponse(response) {
  const body = response.body;
  return body.includes('<script>') || 
         body.includes('javascript:') || 
         body.includes('onerror=') ||
         body.includes('onload=') ||
         (response.status === 200 && body.includes('alert'));
}

function extractSessionId(response) {
  const setCookie = response.headers['Set-Cookie'] || response.headers['set-cookie'];
  if (setCookie) {
    const match = setCookie.match(/session=([^;]+)/);
    return match ? match[1] : null;
  }
  return null;
}

export function teardown(data) {
  console.log('🧹 Security audit cleanup');
  console.log('✅ Security audit completed');
  console.log('📊 Review detailed report for vulnerability findings');
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Security-specific metrics
  const securityMetrics = {
    totalSecurityViolations: data.metrics.security_violations ? data.metrics.security_violations.count : 0,
    totalVulnerabilities: data.metrics.vulnerability_count ? data.metrics.vulnerability_count.count : 0,
    authBypassAttempts: data.metrics.auth_bypass_attempts ? data.metrics.auth_bypass_attempts.rate : 0,
    injectionAttempts: data.metrics.injection_attempts ? data.metrics.injection_attempts.rate : 0,
    securityScore: calculateSecurityScore(data.metrics),
    riskLevel: calculateRiskLevel(data.metrics),
  };
  
  return {
    [`reports/security-audit-${timestamp}.html`]: htmlReport(data),
    [`reports/security-audit-${timestamp}.json`]: JSON.stringify({
      ...data,
      securityMetrics
    }, null, 2),
    [`reports/security-findings-${timestamp}.json`]: JSON.stringify(securityMetrics, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function calculateSecurityScore(metrics) {
  const violations = metrics.security_violations ? metrics.security_violations.count : 0;
  const vulnerabilities = metrics.vulnerability_count ? metrics.vulnerability_count.count : 0;
  
  // Score out of 100, deduct points for issues
  let score = 100;
  score -= violations * 20; // Major deduction for security violations
  score -= vulnerabilities * 5; // Minor deduction for vulnerabilities
  
  return Math.max(0, Math.min(100, score));
}

function calculateRiskLevel(metrics) {
  const violations = metrics.security_violations ? metrics.security_violations.count : 0;
  const vulnerabilities = metrics.vulnerability_count ? metrics.vulnerability_count.count : 0;
  
  if (violations > 0) return 'HIGH';
  if (vulnerabilities > 10) return 'MEDIUM';
  if (vulnerabilities > 5) return 'LOW';
  return 'MINIMAL';
}