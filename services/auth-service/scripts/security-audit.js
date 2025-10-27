#!/usr/bin/env node

/**
 * Security Audit Script for Zoptal Authentication Service
 * 
 * This script performs automated security testing and vulnerability scanning
 * for the authentication service to identify potential security issues.
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.API_URL || 'http://localhost:3000',
  testUserEmail: 'security-test@zoptal.com',
  testUserPassword: 'TestPassword123!',
  maxTestDuration: 30000, // 30 seconds
  outputFile: 'security-audit-report.json'
};

class SecurityAudit {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      baseUrl: CONFIG.baseUrl,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        vulnerabilities: []
      }
    };
  }

  async runAllTests() {
    console.log('🔍 Starting Security Audit for Zoptal Auth Service...\n');

    try {
      // Authentication & Authorization Tests
      await this.testAuthenticationSecurity();
      await this.testAuthorizationBypass();
      await this.testSessionManagement();
      
      // Input Validation Tests
      await this.testSQLInjection();
      await this.testXSSPrevention();
      await this.testCSRFProtection();
      
      // Rate Limiting Tests
      await this.testRateLimiting();
      await this.testBruteForceProtection();
      
      // Security Headers Tests
      await this.testSecurityHeaders();
      
      // Data Protection Tests
      await this.testPasswordSecurity();
      await this.testDataExposure();
      
      // API Security Tests
      await this.testAPISecurityMisconfiguration();
      await this.testInformationDisclosure();

      // Generate summary
      this.generateSummary();
      
      // Save results
      await this.saveResults();
      
      console.log('\n✅ Security audit completed successfully!');
      console.log(`📊 Results: ${this.results.summary.passed}/${this.results.summary.total} tests passed`);
      
      if (this.results.summary.vulnerabilities.length > 0) {
        console.log(`⚠️  Found ${this.results.summary.vulnerabilities.length} potential vulnerabilities`);
      }

    } catch (error) {
      console.error('❌ Security audit failed:', error.message);
      process.exit(1);
    }
  }

  async testAuthenticationSecurity() {
    console.log('🔐 Testing Authentication Security...');

    // Test 1: Weak password acceptance
    await this.runTest('Weak Password Rejection', async () => {
      const response = await this.makeRequest('POST', '/api/auth/register', {
        email: 'weak-password-test@zoptal.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      });
      
      return response.status >= 400; // Should reject weak passwords
    });

    // Test 2: SQL injection in login
    await this.runTest('SQL Injection in Login', async () => {
      const response = await this.makeRequest('POST', '/api/auth/login', {
        email: "admin'--",
        password: "anything"
      });
      
      return response.status >= 400; // Should not succeed
    });

    // Test 3: Password enumeration
    await this.runTest('User Enumeration Prevention', async () => {
      const validResponse = await this.makeRequest('POST', '/api/auth/login', {
        email: CONFIG.testUserEmail,
        password: 'wrongpassword'
      });
      
      const invalidResponse = await this.makeRequest('POST', '/api/auth/login', {
        email: 'nonexistent@zoptal.com',
        password: 'wrongpassword'
      });
      
      // Response should be similar for valid and invalid users
      return validResponse.status === invalidResponse.status;
    });

    // Test 4: JWT token validation
    await this.runTest('JWT Token Validation', async () => {
      const response = await this.makeRequest('GET', '/api/auth/me', {}, {
        'Authorization': 'Bearer invalid.jwt.token'
      });
      
      return response.status === 401;
    });
  }

  async testAuthorizationBypass() {
    console.log('🛡️ Testing Authorization Bypass...');

    // Test 1: Admin endpoint access without privileges
    await this.runTest('Admin Endpoint Protection', async () => {
      const response = await this.makeRequest('GET', '/api/admin/users');
      return response.status === 401 || response.status === 403;
    });

    // Test 2: IDOR (Insecure Direct Object Reference)
    await this.runTest('IDOR Protection', async () => {
      const response = await this.makeRequest('GET', '/api/users/profile/999999');
      return response.status >= 400; // Should not allow access to other users
    });

    // Test 3: Privilege escalation
    await this.runTest('Privilege Escalation Prevention', async () => {
      const response = await this.makeRequest('PUT', '/api/admin/users/1/status', {
        status: 'admin'
      });
      return response.status === 401 || response.status === 403;
    });
  }

  async testSessionManagement() {
    console.log('🍪 Testing Session Management...');

    // Test 1: Session fixation
    await this.runTest('Session Fixation Prevention', async () => {
      // Get initial session
      const response1 = await this.makeRequest('GET', '/api');
      const initialCookies = response1.headers['set-cookie'];
      
      // Login and check if session changes
      const loginResponse = await this.makeRequest('POST', '/api/auth/login', {
        email: CONFIG.testUserEmail,
        password: CONFIG.testUserPassword
      });
      
      const loginCookies = loginResponse.headers['set-cookie'];
      
      // Session should change after login
      return !initialCookies || !loginCookies || 
             JSON.stringify(initialCookies) !== JSON.stringify(loginCookies);
    });

    // Test 2: Secure cookie attributes
    await this.runTest('Secure Cookie Attributes', async () => {
      const response = await this.makeRequest('POST', '/api/auth/login', {
        email: CONFIG.testUserEmail,
        password: CONFIG.testUserPassword
      });
      
      const cookies = response.headers['set-cookie'];
      if (!cookies) return true; // No cookies set
      
      // Check for secure attributes in production
      const hasSecureAttrs = cookies.some(cookie => 
        cookie.includes('HttpOnly') && 
        (process.env.NODE_ENV !== 'production' || cookie.includes('Secure'))
      );
      
      return hasSecureAttrs;
    });
  }

  async testSQLInjection() {
    console.log('💉 Testing SQL Injection...');

    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "1' OR '1'='1' /*"
    ];

    for (const payload of sqlPayloads) {
      await this.runTest(`SQL Injection: ${payload}`, async () => {
        const response = await this.makeRequest('POST', '/api/auth/login', {
          email: payload,
          password: payload
        });
        
        return response.status >= 400; // Should reject malicious input
      });
    }
  }

  async testXSSPrevention() {
    console.log('🔗 Testing XSS Prevention...');

    const xssPayloads = [
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>'
    ];

    for (const payload of xssPayloads) {
      await this.runTest(`XSS Prevention: ${payload}`, async () => {
        const response = await this.makeRequest('POST', '/api/auth/register', {
          email: 'xss-test@zoptal.com',
          password: 'ValidPassword123!',
          firstName: payload,
          lastName: 'Test'
        });
        
        // Check if response contains the raw payload (vulnerability)
        const responseText = JSON.stringify(response.data);
        return !responseText.includes(payload);
      });
    }
  }

  async testCSRFProtection() {
    console.log('🛡️ Testing CSRF Protection...');

    await this.runTest('CSRF Token Validation', async () => {
      // Attempt to make state-changing request without proper headers
      const response = await this.makeRequest('POST', '/api/users/profile', {
        firstName: 'Modified',
        lastName: 'Name'
      }, {
        'Origin': 'http://malicious-site.com'
      });
      
      return response.status >= 400; // Should reject cross-origin requests
    });
  }

  async testRateLimiting() {
    console.log('⏱️ Testing Rate Limiting...');

    await this.runTest('Rate Limiting Enforcement', async () => {
      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(this.makeRequest('POST', '/api/auth/login', {
          email: 'rate-limit-test@zoptal.com',
          password: 'TestPassword123!'
        }));
      }
      
      const responses = await Promise.all(requests);
      
      // At least some requests should be rate limited
      return responses.some(response => response.status === 429);
    });
  }

  async testBruteForceProtection() {
    console.log('🔒 Testing Brute Force Protection...');

    await this.runTest('Brute Force Protection', async () => {
      const requests = [];
      
      // Attempt multiple failed logins
      for (let i = 0; i < 10; i++) {
        requests.push(this.makeRequest('POST', '/api/auth/login', {
          email: CONFIG.testUserEmail,
          password: 'wrongpassword' + i
        }));
      }
      
      const responses = await Promise.allSettled(requests);
      
      // Account should be locked or heavily rate limited
      const lastResponses = responses.slice(-3);
      return lastResponses.every(result => 
        result.status === 'fulfilled' && 
        (result.value.status === 429 || result.value.status === 423)
      );
    });
  }

  async testSecurityHeaders() {
    console.log('📋 Testing Security Headers...');

    await this.runTest('Security Headers Present', async () => {
      const response = await this.makeRequest('GET', '/api');
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'referrer-policy'
      ];
      
      return requiredHeaders.every(header => headers[header]);
    });

    await this.runTest('HSTS Header (Production)', async () => {
      if (process.env.NODE_ENV !== 'production') return true;
      
      const response = await this.makeRequest('GET', '/api');
      return response.headers['strict-transport-security'];
    });
  }

  async testPasswordSecurity() {
    console.log('🔑 Testing Password Security...');

    await this.runTest('Password Complexity Requirements', async () => {
      const weakPasswords = ['123', 'password', 'abc123', '12345678'];
      
      for (const password of weakPasswords) {
        const response = await this.makeRequest('POST', '/api/auth/register', {
          email: `weak-${Date.now()}@zoptal.com`,
          password: password,
          firstName: 'Test',
          lastName: 'User'
        });
        
        if (response.status < 400) {
          return false; // Weak password was accepted
        }
      }
      
      return true;
    });

    await this.runTest('Password Reset Security', async () => {
      const response = await this.makeRequest('POST', '/api/auth/forgot-password', {
        email: 'nonexistent@zoptal.com'
      });
      
      // Should not reveal if email exists or not
      return response.status === 200;
    });
  }

  async testDataExposure() {
    console.log('📊 Testing Data Exposure...');

    await this.runTest('Sensitive Data Exposure', async () => {
      const response = await this.makeRequest('GET', '/api/users/profile');
      
      if (response.data && response.data.user) {
        const userData = response.data.user;
        
        // Check if sensitive data is exposed
        const hasSensitiveData = userData.password || 
                               userData.passwordHash || 
                               userData.salt;
        
        return !hasSensitiveData;
      }
      
      return true;
    });

    await this.runTest('Error Message Information Disclosure', async () => {
      const response = await this.makeRequest('GET', '/api/nonexistent-endpoint');
      
      const responseText = JSON.stringify(response.data);
      
      // Check for sensitive information in error messages
      const containsSensitiveInfo = responseText.includes('prisma') ||
                                  responseText.includes('database') ||
                                  responseText.includes('redis') ||
                                  responseText.includes('internal');
      
      return !containsSensitiveInfo;
    });
  }

  async testAPISecurityMisconfiguration() {
    console.log('⚙️ Testing API Security Configuration...');

    await this.runTest('HTTP Methods Restriction', async () => {
      const response = await this.makeRequest('TRACE', '/api');
      return response.status >= 400; // TRACE should be disabled
    });

    await this.runTest('API Versioning Security', async () => {
      // Test if old API versions are properly secured
      const v1Response = await this.makeRequest('GET', '/api/v1/auth/me');
      const v2Response = await this.makeRequest('GET', '/api/v2/auth/me');
      
      // Both should require authentication
      return (v1Response.status === 401 || v1Response.status === 403) &&
             (v2Response.status === 401 || v2Response.status === 403);
    });
  }

  async testInformationDisclosure() {
    console.log('📢 Testing Information Disclosure...');

    await this.runTest('Server Information Disclosure', async () => {
      const response = await this.makeRequest('GET', '/api');
      
      // Check for server information in headers
      const headers = response.headers;
      const hasServerInfo = headers['server'] || 
                           headers['x-powered-by'] ||
                           headers['x-aspnet-version'];
      
      return !hasServerInfo;
    });

    await this.runTest('Debug Information Disclosure', async () => {
      const response = await this.makeRequest('GET', '/api/nonexistent');
      
      const responseText = JSON.stringify(response.data);
      
      // Check for debug information
      const hasDebugInfo = responseText.includes('stack trace') ||
                          responseText.includes('file path') ||
                          responseText.includes('line number');
      
      return !hasDebugInfo;
    });
  }

  async runTest(testName, testFunction) {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        testFunction(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), CONFIG.maxTestDuration)
        )
      ]);
      
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name: testName,
        status: result ? 'PASS' : 'FAIL',
        duration: duration,
        timestamp: new Date().toISOString()
      });
      
      if (result) {
        this.results.summary.passed++;
        console.log(`  ✅ ${testName} - PASSED (${duration}ms)`);
      } else {
        this.results.summary.failed++;
        this.results.summary.vulnerabilities.push({
          test: testName,
          severity: 'medium',
          description: 'Test failed - potential security vulnerability'
        });
        console.log(`  ❌ ${testName} - FAILED (${duration}ms)`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.tests.push({
        name: testName,
        status: 'ERROR',
        error: error.message,
        duration: duration,
        timestamp: new Date().toISOString()
      });
      
      this.results.summary.failed++;
      this.results.summary.vulnerabilities.push({
        test: testName,
        severity: 'high',
        description: `Test error: ${error.message}`
      });
      
      console.log(`  💥 ${testName} - ERROR: ${error.message} (${duration}ms)`);
    }
    
    this.results.summary.total++;
  }

  async makeRequest(method, endpoint, data = {}, headers = {}) {
    try {
      const config = {
        method: method.toLowerCase(),
        url: `${CONFIG.baseUrl}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        validateStatus: () => true // Don't throw on HTTP errors
      };

      if (method.toUpperCase() !== 'GET' && Object.keys(data).length > 0) {
        config.data = data;
      }

      return await axios(config);
    } catch (error) {
      return {
        status: 0,
        data: { error: error.message },
        headers: {}
      };
    }
  }

  generateSummary() {
    const passRate = (this.results.summary.passed / this.results.summary.total * 100).toFixed(2);
    
    this.results.summary.passRate = `${passRate}%`;
    this.results.summary.securityScore = this.calculateSecurityScore();
    
    // Categorize vulnerabilities by severity
    const vulnerabilitiesBySeverity = this.results.summary.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
      return acc;
    }, {});
    
    this.results.summary.vulnerabilitiesBySeverity = vulnerabilitiesBySeverity;
  }

  calculateSecurityScore() {
    const total = this.results.summary.total;
    const passed = this.results.summary.passed;
    const vulnerabilities = this.results.summary.vulnerabilities.length;
    
    if (total === 0) return 0;
    
    let score = (passed / total) * 100;
    
    // Deduct points for vulnerabilities
    const highSeverityVulns = this.results.summary.vulnerabilities.filter(v => v.severity === 'high').length;
    const mediumSeverityVulns = this.results.summary.vulnerabilities.filter(v => v.severity === 'medium').length;
    
    score -= (highSeverityVulns * 10); // -10 points per high severity
    score -= (mediumSeverityVulns * 5); // -5 points per medium severity
    
    return Math.max(0, Math.round(score));
  }

  async saveResults() {
    try {
      const reportPath = path.join(process.cwd(), CONFIG.outputFile);
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Security audit report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Failed to save security audit report:', error.message);
    }
  }
}

// Run the security audit if called directly
if (require.main === module) {
  const audit = new SecurityAudit();
  audit.runAllTests().catch(console.error);
}

module.exports = SecurityAudit;