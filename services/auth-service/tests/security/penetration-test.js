// Advanced Penetration Testing Script for Zoptal Auth Service
// This script performs deep penetration testing with advanced attack vectors

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend, Gauge } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Penetration test metrics
export const criticalFindings = new Counter('critical_findings');
export const highFindings = new Counter('high_findings');
export const mediumFindings = new Counter('medium_findings');
export const lowFindings = new Counter('low_findings');
export const exploitSuccessRate = new Rate('exploit_success_rate');
export const authTokenCompromised = new Counter('auth_token_compromised');
export const dataExfiltrationAttempts = new Counter('data_exfiltration_attempts');
export const privilegeEscalation = new Counter('privilege_escalation');
export const systemCompromise = new Gauge('system_compromise_level');

// Penetration test configuration
export const options = {
  scenarios: {
    // Advanced authentication attacks
    advanced_auth_attacks: {
      executor: 'constant-vus',
      vus: 3,
      duration: '20m',
      env: { SCENARIO: 'advanced_auth' },
    },
    
    // Business logic attacks
    business_logic_attacks: {
      executor: 'constant-vus',
      vus: 2,
      duration: '20m',
      env: { SCENARIO: 'business_logic' },
    },
    
    // Data access attacks
    data_access_attacks: {
      executor: 'constant-vus',
      vus: 2,
      duration: '20m',
      env: { SCENARIO: 'data_access' },
    },
    
    // Advanced injection attacks
    advanced_injection: {
      executor: 'constant-vus',
      vus: 3,
      duration: '20m',
      env: { SCENARIO: 'advanced_injection' },
    },
    
    // Cryptographic attacks
    crypto_attacks: {
      executor: 'constant-vus',
      vus: 2,
      duration: '20m',
      env: { SCENARIO: 'crypto_attacks' },
    },
    
    // Infrastructure attacks
    infrastructure_attacks: {
      executor: 'constant-vus',
      vus: 2,
      duration: '20m',
      env: { SCENARIO: 'infrastructure' },
    },
  },
  
  thresholds: {
    critical_findings: ['count==0'],        // No critical findings allowed
    high_findings: ['count<2'],             // Less than 2 high findings
    exploit_success_rate: ['rate==0'],      // No successful exploits
    auth_token_compromised: ['count==0'],   // No token compromises
    system_compromise_level: ['value==0'],  // No system compromise
  },
};

export function setup() {
  console.log('🏴‍☠️ Starting Advanced Penetration Testing');
  console.log('🎯 Target: Zoptal Auth Service Security Perimeter');
  console.log('⚠️  WARNING: This performs active security attacks');
  console.log('🔒 Testing: Authentication, Authorization, Data Access, Crypto');
  
  return {
    baseURL: __ENV.BASE_URL || 'http://localhost:3001',
    testStartTime: Date.now(),
    adminCredentials: {
      email: __ENV.ADMIN_EMAIL || 'admin@test.com',
      password: __ENV.ADMIN_PASSWORD || 'AdminPass123!'
    }
  };
}

export default function(data) {
  const scenario = __ENV.SCENARIO || 'advanced_auth';
  
  switch (scenario) {
    case 'advanced_auth':
      advancedAuthenticationAttacks(data);
      break;
    case 'business_logic':
      businessLogicAttacks(data);
      break;
    case 'data_access':
      dataAccessAttacks(data);
      break;
    case 'advanced_injection':
      advancedInjectionAttacks(data);
      break;
    case 'crypto_attacks':
      cryptographicAttacks(data);
      break;
    case 'infrastructure':
      infrastructureAttacks(data);
      break;
    default:
      advancedAuthenticationAttacks(data);
  }
}

// Advanced Authentication Attacks
function advancedAuthenticationAttacks(data) {
  const baseURL = data.baseURL;
  
  // Test 1: JWT Token Manipulation
  testJWTTokenManipulation(baseURL);
  
  // Test 2: Session Token Analysis
  testSessionTokenAnalysis(baseURL);
  
  // Test 3: Authentication Timing Attacks
  testTimingAttacks(baseURL);
  
  // Test 4: Password Reset Vulnerabilities
  testPasswordResetVulnerabilities(baseURL);
  
  // Test 5: Multi-factor Authentication Bypass
  testMFABypass(baseURL);
  
  // Test 6: OAuth/SSO Security
  testOAuthSecurity(baseURL);
  
  sleep(Math.random() * 3 + 2);
}

// Business Logic Attacks
function businessLogicAttacks(data) {
  const baseURL = data.baseURL;
  
  // Test 1: Race Conditions
  testRaceConditions(baseURL);
  
  // Test 2: Business Flow Manipulation
  testBusinessFlowManipulation(baseURL);
  
  // Test 3: Rate Limiting Logic Flaws
  testRateLimitingFlaws(baseURL);
  
  // Test 4: Account Lockout Logic
  testAccountLockoutLogic(baseURL);
  
  // Test 5: Registration Flow Attacks
  testRegistrationFlowAttacks(baseURL);
  
  sleep(Math.random() * 3 + 2);
}

// Data Access Attacks
function dataAccessAttacks(data) {
  const baseURL = data.baseURL;
  
  // Test 1: Insecure Direct Object References (IDOR)
  testIDORVulnerabilities(baseURL);
  
  // Test 2: Privilege Escalation
  testPrivilegeEscalation(baseURL);
  
  // Test 3: Data Enumeration
  testDataEnumeration(baseURL);
  
  // Test 4: Mass Assignment
  testMassAssignment(baseURL);
  
  // Test 5: Data Exfiltration
  testDataExfiltration(baseURL);
  
  sleep(Math.random() * 3 + 2);
}

// Advanced Injection Attacks
function advancedInjectionAttacks(data) {
  const baseURL = data.baseURL;
  
  // Test 1: Advanced SQL Injection
  testAdvancedSQLInjection(baseURL);
  
  // Test 2: NoSQL Injection
  testNoSQLInjection(baseURL);
  
  // Test 3: LDAP Injection
  testAdvancedLDAPInjection(baseURL);
  
  // Test 4: Template Injection
  testTemplateInjection(baseURL);
  
  // Test 5: Expression Language Injection
  testExpressionLanguageInjection(baseURL);
  
  sleep(Math.random() * 3 + 2);
}

// Cryptographic Attacks
function cryptographicAttacks(data) {
  const baseURL = data.baseURL;
  
  // Test 1: Weak Cryptographic Implementation
  testWeakCrypto(baseURL);
  
  // Test 2: Cryptographic Oracle Attacks
  testCryptographicOracles(baseURL);
  
  // Test 3: Random Number Generation
  testRandomNumberGeneration(baseURL);
  
  // Test 4: Hash Function Security
  testHashFunctionSecurity(baseURL);
  
  sleep(Math.random() * 3 + 2);
}

// Infrastructure Attacks
function infrastructureAttacks(data) {
  const baseURL = data.baseURL;
  
  // Test 1: HTTP Request Smuggling
  testHTTPRequestSmuggling(baseURL);
  
  // Test 2: Host Header Injection
  testHostHeaderInjection(baseURL);
  
  // Test 3: Cache Poisoning
  testCachePoisoning(baseURL);
  
  // Test 4: Server-Side Request Forgery (SSRF)
  testSSRFVulnerabilities(baseURL);
  
  sleep(Math.random() * 3 + 2);
}

// JWT Token Manipulation Testing
function testJWTTokenManipulation(baseURL) {
  // First, get a valid JWT token
  const loginResponse = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
    email: 'test@test.com',
    password: 'Test123!'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (loginResponse.status === 200) {
    const authHeader = loginResponse.headers['Authorization'] || 
                      (loginResponse.json() && loginResponse.json().token);
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      // Test 1: Algorithm confusion attack (None algorithm)
      testAlgorithmConfusion(baseURL, token);
      
      // Test 2: JWT signature bypass
      testJWTSignatureBypass(baseURL, token);
      
      // Test 3: JWT payload manipulation
      testJWTPayloadManipulation(baseURL, token);
    }
  }
}

// Algorithm Confusion Attack
function testAlgorithmConfusion(baseURL, originalToken) {
  const tokenParts = originalToken.split('.');
  if (tokenParts.length === 3) {
    // Modify header to use 'none' algorithm
    const header = JSON.parse(atob(tokenParts[0]));
    header.alg = 'none';
    
    const modifiedHeader = btoa(JSON.stringify(header));
    const modifiedToken = `${modifiedHeader}.${tokenParts[1]}.`;
    
    const response = http.get(`${baseURL}/api/profile`, {
      headers: { 'Authorization': `Bearer ${modifiedToken}` }
    });
    
    if (response.status === 200) {
      criticalFindings.add(1);
      exploitSuccessRate.add(1);
      authTokenCompromised.add(1);
      console.log('🚨 CRITICAL: JWT Algorithm Confusion vulnerability - None algorithm accepted');
    }
  }
}

// Timing Attack Testing
function testTimingAttacks(baseURL) {
  const existingUser = 'existing@test.com';
  const nonExistingUser = 'nonexisting@test.com';
  
  const timings = [];
  
  // Measure response times for existing vs non-existing users
  for (let i = 0; i < 10; i++) {
    const start1 = Date.now();
    http.post(`${baseURL}/api/auth/login`, JSON.stringify({
      email: existingUser,
      password: 'wrongpassword'
    }), { headers: { 'Content-Type': 'application/json' } });
    const end1 = Date.now();
    
    const start2 = Date.now();
    http.post(`${baseURL}/api/auth/login`, JSON.stringify({
      email: nonExistingUser,
      password: 'wrongpassword'
    }), { headers: { 'Content-Type': 'application/json' } });
    const end2 = Date.now();
    
    timings.push({
      existing: end1 - start1,
      nonExisting: end2 - start2
    });
    
    sleep(0.1);
  }
  
  // Analyze timing differences
  const avgExisting = timings.reduce((sum, t) => sum + t.existing, 0) / timings.length;
  const avgNonExisting = timings.reduce((sum, t) => sum + t.nonExisting, 0) / timings.length;
  const timingDifference = Math.abs(avgExisting - avgNonExisting);
  
  if (timingDifference > 50) { // 50ms difference threshold
    mediumFindings.add(1);
    console.log(`⚠️  MEDIUM: Timing attack vulnerability - ${timingDifference}ms difference detected`);
  }
}

// Race Condition Testing
function testRaceConditions(baseURL) {
  const testEmail = `racetest${Date.now()}@test.com`;
  
  // Concurrent registration attempts
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      http.asyncRequest('POST', `${baseURL}/api/auth/register`, JSON.stringify({
        email: testEmail,
        password: 'RaceTest123!',
        profile: { firstName: 'Race', lastName: 'Test' }
      }), { headers: { 'Content-Type': 'application/json' } })
    );
  }
  
  // Check if multiple registrations succeeded
  let successCount = 0;
  promises.forEach(promise => {
    promise.then(response => {
      if (response.status === 201) {
        successCount++;
      }
    });
  });
  
  if (successCount > 1) {
    highFindings.add(1);
    console.log('🚨 HIGH: Race condition vulnerability - multiple registrations succeeded');
  }
}

// IDOR Testing
function testIDORVulnerabilities(baseURL) {
  // Login as regular user
  const loginResponse = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
    email: 'user1@test.com',
    password: 'Test123!'
  }), { headers: { 'Content-Type': 'application/json' } });
  
  if (loginResponse.status === 200) {
    const token = loginResponse.json().token;
    
    // Attempt to access other users' data
    const userIds = [1, 2, 3, 999, 'admin', '../admin'];
    
    userIds.forEach(userId => {
      const response = http.get(`${baseURL}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        const userData = response.json();
        if (userData && userData.email !== 'user1@test.com') {
          highFindings.add(1);
          dataExfiltrationAttempts.add(1);
          console.log(`🚨 HIGH: IDOR vulnerability - accessed user ${userId} data`);
        }
      }
    });
  }
}

// Privilege Escalation Testing
function testPrivilegeEscalation(baseURL) {
  // Login as regular user
  const loginResponse = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
    email: 'user@test.com',
    password: 'Test123!'
  }), { headers: { 'Content-Type': 'application/json' } });
  
  if (loginResponse.status === 200) {
    const token = loginResponse.json().token;
    
    // Attempt to access admin endpoints
    const adminEndpoints = [
      '/api/admin/dashboard',
      '/api/admin/users',
      '/api/admin/settings',
      '/api/admin/logs'
    ];
    
    adminEndpoints.forEach(endpoint => {
      const response = http.get(`${baseURL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        criticalFindings.add(1);
        privilegeEscalation.add(1);
        exploitSuccessRate.add(1);
        console.log(`🚨 CRITICAL: Privilege escalation - regular user accessed ${endpoint}`);
      }
    });
    
    // Test role manipulation
    const profileUpdateResponse = http.put(`${baseURL}/api/profile`, JSON.stringify({
      role: 'admin',
      permissions: ['admin', 'super_user'],
      isAdmin: true
    }), {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profileUpdateResponse.status === 200) {
      criticalFindings.add(1);
      privilegeEscalation.add(1);
      console.log('🚨 CRITICAL: Privilege escalation via profile update');
    }
  }
}

// Advanced SQL Injection Testing
function testAdvancedSQLInjection(baseURL) {
  const advancedSQLPayloads = [
    // Time-based blind SQL injection
    "'; WAITFOR DELAY '00:00:05' --",
    "' AND (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES) > 0 AND SLEEP(5) --",
    
    // Boolean-based blind SQL injection
    "' AND (SELECT SUBSTRING(@@version,1,1))='5' --",
    "' AND (SELECT COUNT(*) FROM users WHERE email LIKE 'admin%') > 0 --",
    
    // Union-based SQL injection
    "' UNION SELECT null,username,password,null FROM admin_users --",
    "' UNION SELECT 1,group_concat(schema_name),3,4 FROM information_schema.schemata --",
    
    // Second-order SQL injection
    "admin'; INSERT INTO logs VALUES ('injected'); --"
  ];
  
  advancedSQLPayloads.forEach(payload => {
    const startTime = Date.now();
    
    const response = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
      email: payload,
      password: payload
    }), { headers: { 'Content-Type': 'application/json' } });
    
    const responseTime = Date.now() - startTime;
    
    // Check for time-based injection
    if (responseTime > 4000) {
      criticalFindings.add(1);
      exploitSuccessRate.add(1);
      console.log(`🚨 CRITICAL: Time-based SQL injection with payload: ${payload}`);
    }
    
    // Check for successful union injection
    if (response.body.includes('admin_users') || response.body.includes('information_schema')) {
      criticalFindings.add(1);
      exploitSuccessRate.add(1);
      dataExfiltrationAttempts.add(1);
      console.log(`🚨 CRITICAL: Union-based SQL injection with payload: ${payload}`);
    }
  });
}

// Mass Assignment Testing
function testMassAssignment(baseURL) {
  // Login first
  const loginResponse = http.post(`${baseURL}/api/auth/login`, JSON.stringify({
    email: 'user@test.com',
    password: 'Test123!'
  }), { headers: { 'Content-Type': 'application/json' } });
  
  if (loginResponse.status === 200) {
    const token = loginResponse.json().token;
    
    // Attempt mass assignment
    const massAssignmentPayload = {
      firstName: 'Updated',
      lastName: 'User',
      // Potentially dangerous fields
      role: 'admin',
      isAdmin: true,
      permissions: ['read', 'write', 'delete'],
      balance: 9999999,
      id: 1,
      email: 'admin@test.com',
      password: 'newpassword',
      isVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const response = http.put(`${baseURL}/api/profile`, JSON.stringify(massAssignmentPayload), {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      const updatedProfile = response.json();
      
      // Check if dangerous fields were updated
      const dangerousFields = ['role', 'isAdmin', 'permissions', 'balance', 'id'];
      dangerousFields.forEach(field => {
        if (updatedProfile[field] === massAssignmentPayload[field]) {
          highFindings.add(1);
          console.log(`🚨 HIGH: Mass assignment vulnerability - ${field} was updated`);
        }
      });
    }
  }
}

// SSRF Testing
function testSSRFVulnerabilities(baseURL) {
  const ssrfPayloads = [
    'http://localhost:8080/admin',
    'http://127.0.0.1:22',
    'http://169.254.169.254/latest/meta-data/',
    'file:///etc/passwd',
    'http://internal-server:3000',
    'http://localhost:6379', // Redis
    'http://localhost:5432', // PostgreSQL
  ];
  
  // Test URL parameters that might trigger SSRF
  ssrfPayloads.forEach(payload => {
    const response = http.post(`${baseURL}/api/webhook`, JSON.stringify({
      url: payload,
      callback: payload
    }), { headers: { 'Content-Type': 'application/json' } });
    
    // Look for indicators of successful SSRF
    if (response.status === 200 && (
      response.body.includes('root:') ||
      response.body.includes('instance-id') ||
      response.body.includes('admin') ||
      response.body.includes('internal')
    )) {
      criticalFindings.add(1);
      exploitSuccessRate.add(1);
      console.log(`🚨 CRITICAL: SSRF vulnerability with payload: ${payload}`);
    }
  });
}

// System Compromise Assessment
function assessSystemCompromise() {
  let compromiseLevel = 0;
  
  // Calculate compromise level based on findings
  const critical = criticalFindings.add(0);
  const high = highFindings.add(0);
  const authCompromised = authTokenCompromised.add(0);
  const privEscalation = privilegeEscalation.add(0);
  
  if (critical > 0) compromiseLevel += 40;
  if (high > 2) compromiseLevel += 30;
  if (authCompromised > 0) compromiseLevel += 20;
  if (privEscalation > 0) compromiseLevel += 10;
  
  systemCompromise.add(Math.min(100, compromiseLevel));
  
  return compromiseLevel;
}

export function teardown(data) {
  const compromiseLevel = assessSystemCompromise();
  
  console.log('🧹 Penetration test cleanup');
  console.log('✅ Penetration test completed');
  
  if (compromiseLevel > 50) {
    console.log('🚨 CRITICAL: System shows signs of significant compromise');
  } else if (compromiseLevel > 20) {
    console.log('⚠️  WARNING: System shows moderate security weaknesses');
  } else {
    console.log('✅ System appears to have good security posture');
  }
}

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Penetration test specific metrics
  const pentestMetrics = {
    criticalFindings: data.metrics.critical_findings ? data.metrics.critical_findings.count : 0,
    highFindings: data.metrics.high_findings ? data.metrics.high_findings.count : 0,
    mediumFindings: data.metrics.medium_findings ? data.metrics.medium_findings.count : 0,
    lowFindings: data.metrics.low_findings ? data.metrics.low_findings.count : 0,
    exploitSuccessRate: data.metrics.exploit_success_rate ? data.metrics.exploit_success_rate.rate : 0,
    authTokenCompromised: data.metrics.auth_token_compromised ? data.metrics.auth_token_compromised.count : 0,
    dataExfiltrationAttempts: data.metrics.data_exfiltration_attempts ? data.metrics.data_exfiltration_attempts.count : 0,
    privilegeEscalation: data.metrics.privilege_escalation ? data.metrics.privilege_escalation.count : 0,
    systemCompromiseLevel: data.metrics.system_compromise_level ? data.metrics.system_compromise_level.value : 0,
    riskScore: calculateRiskScore(data.metrics),
    securityRating: calculateSecurityRating(data.metrics),
  };
  
  return {
    [`reports/penetration-test-${timestamp}.html`]: htmlReport(data),
    [`reports/penetration-test-${timestamp}.json`]: JSON.stringify({
      ...data,
      pentestMetrics
    }, null, 2),
    [`reports/pentest-findings-${timestamp}.json`]: JSON.stringify(pentestMetrics, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function calculateRiskScore(metrics) {
  const critical = metrics.critical_findings ? metrics.critical_findings.count : 0;
  const high = metrics.high_findings ? metrics.high_findings.count : 0;
  const medium = metrics.medium_findings ? metrics.medium_findings.count : 0;
  const low = metrics.low_findings ? metrics.low_findings.count : 0;
  
  return (critical * 10) + (high * 7) + (medium * 4) + (low * 1);
}

function calculateSecurityRating(metrics) {
  const riskScore = calculateRiskScore(metrics);
  
  if (riskScore === 0) return 'A+';
  if (riskScore <= 5) return 'A';
  if (riskScore <= 15) return 'B';
  if (riskScore <= 30) return 'C';
  if (riskScore <= 50) return 'D';
  return 'F';
}