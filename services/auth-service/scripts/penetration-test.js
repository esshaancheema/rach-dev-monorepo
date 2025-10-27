#!/usr/bin/env node

/**
 * Penetration Testing Script for Zoptal Authentication Service
 * 
 * This script performs comprehensive penetration testing against the auth service
 * to identify security vulnerabilities and potential attack vectors.
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.API_URL || 'http://localhost:3000',
  testUserEmail: 'pentest@zoptal.com',
  testUserPassword: 'PenTest123!',
  outputFile: 'penetration-test-report.json',
  maxConcurrentRequests: 10,
  delayBetweenRequests: 100 // ms
};

class PenetrationTest {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      baseUrl: CONFIG.baseUrl,
      testSuites: [],
      summary: {
        totalTests: 0,
        vulnerabilitiesFound: 0,
        criticalVulnerabilities: 0,
        highVulnerabilities: 0,
        mediumVulnerabilities: 0,
        lowVulnerabilities: 0
      }
    };
    this.testUser = null;
  }

  async runPenetrationTests() {
    console.log('🔥 Starting Penetration Testing for Zoptal Auth Service...\n');

    try {
      // Setup test environment
      await this.setupTestEnvironment();

      // Run penetration test suites
      await this.runAuthenticationAttacks();
      await this.runSessionAttacks();
      await this.runInjectionAttacks();
      await this.runAuthorizationAttacks();
      await this.runBusinessLogicAttacks();
      await this.runInformationGatheringAttacks();
      await this.runDenialOfServiceAttacks();

      // Generate comprehensive report
      this.generateReport();
      await this.saveResults();

      console.log('\n🎯 Penetration testing completed!');
      this.printSummary();

    } catch (error) {
      console.error('❌ Penetration testing failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }

  async setupTestEnvironment() {
    console.log('🔧 Setting up test environment...');

    try {
      // Create test user for authentication tests
      const registerResponse = await this.makeRequest('POST', '/api/auth/register', {
        email: CONFIG.testUserEmail,
        password: CONFIG.testUserPassword,
        firstName: 'Penetration',
        lastName: 'Test'
      });

      if (registerResponse.status === 201 || registerResponse.status === 409) {
        // Login to get access token
        const loginResponse = await this.makeRequest('POST', '/api/auth/login', {
          email: CONFIG.testUserEmail,
          password: CONFIG.testUserPassword
        });

        if (loginResponse.status === 200 && loginResponse.data.data.accessToken) {
          this.testUser = {
            email: CONFIG.testUserEmail,
            accessToken: loginResponse.data.data.accessToken,
            refreshToken: loginResponse.data.data.refreshToken
          };
          console.log('✅ Test user authenticated successfully');
        }
      }
    } catch (error) {
      console.log('⚠️ Could not setup test user:', error.message);
    }
  }

  async runAuthenticationAttacks() {
    const suite = {
      name: 'Authentication Attacks',
      tests: []
    };

    console.log('🔐 Testing Authentication Vulnerabilities...');

    // Brute Force Attack
    await this.testBruteForceAttack(suite);

    // Credential Stuffing
    await this.testCredentialStuffing(suite);

    // Password Spraying
    await this.testPasswordSpraying(suite);

    // JWT Token Attacks
    await this.testJWTAttacks(suite);

    // OAuth Attacks
    await this.testOAuthAttacks(suite);

    this.results.testSuites.push(suite);
  }

  async testBruteForceAttack(suite) {
    const test = {
      name: 'Brute Force Attack',
      description: 'Attempt to brute force user credentials',
      vulnerabilities: []
    };

    try {
      const passwords = ['password', '123456', 'admin', 'test', CONFIG.testUserPassword];
      let successfulAttempts = 0;
      let blockedAttempts = 0;

      for (const password of passwords) {
        const response = await this.makeRequest('POST', '/api/auth/login', {
          email: CONFIG.testUserEmail,
          password: password
        });

        if (response.status === 200) {
          successfulAttempts++;
        } else if (response.status === 429 || response.status === 423) {
          blockedAttempts++;
        }

        await this.delay(CONFIG.delayBetweenRequests);
      }

      if (successfulAttempts > 1) {
        test.vulnerabilities.push({
          severity: 'high',
          description: 'Multiple passwords accepted for the same user',
          impact: 'Account compromise'
        });
      }

      if (blockedAttempts === 0) {
        test.vulnerabilities.push({
          severity: 'medium',
          description: 'No rate limiting detected for login attempts',
          impact: 'Brute force attacks possible'
        });
      }

    } catch (error) {
      test.error = error.message;
    }

    suite.tests.push(test);
    this.updateSummary(test);
  }

  async testCredentialStuffing(suite) {
    const test = {
      name: 'Credential Stuffing Attack',
      description: 'Test with common compromised credentials',
      vulnerabilities: []
    };

    try {
      const compromisedCreds = [
        { email: 'admin@admin.com', password: 'admin' },
        { email: 'test@test.com', password: 'password' },
        { email: 'user@example.com', password: '123456' },
        { email: 'demo@demo.com', password: 'demo' }
      ];

      let successfulLogins = 0;

      for (const cred of compromisedCreds) {
        const response = await this.makeRequest('POST', '/api/auth/login', cred);
        
        if (response.status === 200) {
          successfulLogins++;
          test.vulnerabilities.push({
            severity: 'critical',
            description: `Compromised credentials accepted: ${cred.email}`,
            impact: 'Unauthorized access'
          });
        }

        await this.delay(CONFIG.delayBetweenRequests);
      }

    } catch (error) {
      test.error = error.message;
    }

    suite.tests.push(test);
    this.updateSummary(test);
  }

  async testPasswordSpraying(suite) {
    const test = {
      name: 'Password Spraying Attack',
      description: 'Test common passwords against multiple accounts',
      vulnerabilities: []
    };

    try {
      const commonPasswords = ['password', '123456', 'admin', 'test'];
      const testEmails = ['admin@zoptal.com', 'support@zoptal.com', 'info@zoptal.com'];

      for (const password of commonPasswords) {
        for (const email of testEmails) {
          const response = await this.makeRequest('POST', '/api/auth/login', {
            email,
            password
          });

          if (response.status === 200) {
            test.vulnerabilities.push({
              severity: 'high',
              description: `Weak password found: ${email} / ${password}`,
              impact: 'Account compromise'
            });
          }

          await this.delay(CONFIG.delayBetweenRequests);
        }
      }

    } catch (error) {
      test.error = error.message;
    }

    suite.tests.push(test);
    this.updateSummary(test);
  }

  async testJWTAttacks(suite) {
    const test = {
      name: 'JWT Token Attacks',
      description: 'Test JWT token vulnerabilities',
      vulnerabilities: []
    };

    try {
      if (!this.testUser?.accessToken) {
        test.error = 'No access token available for testing';
        suite.tests.push(test);
        return;
      }

      // Test 1: None Algorithm Attack
      await this.testJWTNoneAlgorithm(test);

      // Test 2: Key Confusion Attack
      await this.testJWTKeyConfusion(test);

      // Test 3: Weak Secret Testing
      await this.testJWTWeakSecret(test);

      // Test 4: Token Expiration
      await this.testJWTExpiration(test);

    } catch (error) {
      test.error = error.message;
    }

    suite.tests.push(test);
    this.updateSummary(test);
  }

  async testJWTNoneAlgorithm(test) {
    try {
      // Create a JWT with 'none' algorithm
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(JSON.stringify({ 
        sub: this.testUser.email, 
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600 
      })).toString('base64url');
      
      const noneToken = `${header}.${payload}.`;

      const response = await this.makeRequest('GET', '/api/auth/me', {}, {
        'Authorization': `Bearer ${noneToken}`
      });

      if (response.status === 200) {
        test.vulnerabilities.push({
          severity: 'critical',
          description: 'JWT none algorithm attack successful',
          impact: 'Complete authentication bypass'
        });
      }

    } catch (error) {
      // Expected to fail
    }
  }

  async testJWTKeyConfusion(test) {
    try {
      // Try to create a token using the public key as HMAC secret
      const publicKey = 'fake-public-key'; // In real test, you'd try to obtain the actual public key
      const token = this.createJWTWithHMAC(publicKey, { sub: this.testUser.email, role: 'admin' });

      const response = await this.makeRequest('GET', '/api/auth/me', {}, {
        'Authorization': `Bearer ${token}`
      });

      if (response.status === 200) {
        test.vulnerabilities.push({
          severity: 'critical',
          description: 'JWT key confusion attack successful',
          impact: 'Authentication bypass and privilege escalation'
        });
      }

    } catch (error) {
      // Expected to fail
    }
  }

  async testJWTWeakSecret(test) {
    const weakSecrets = ['secret', '123456', 'password', 'jwt-secret', 'test'];
    
    for (const secret of weakSecrets) {
      try {
        const token = this.createJWTWithHMAC(secret, { 
          sub: this.testUser.email, 
          role: 'admin',
          exp: Math.floor(Date.now() / 1000) + 3600 
        });

        const response = await this.makeRequest('GET', '/api/auth/me', {}, {
          'Authorization': `Bearer ${token}`
        });

        if (response.status === 200) {
          test.vulnerabilities.push({
            severity: 'critical',
            description: `JWT signed with weak secret: ${secret}`,
            impact: 'Token forgery and privilege escalation'
          });
        }

      } catch (error) {
        // Expected to fail
      }
    }
  }

  async testJWTExpiration(test) {
    try {
      // Create an expired token
      const expiredToken = this.createJWTWithHMAC('test-secret', {
        sub: this.testUser.email,
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      });

      const response = await this.makeRequest('GET', '/api/auth/me', {}, {
        'Authorization': `Bearer ${expiredToken}`
      });

      if (response.status === 200) {
        test.vulnerabilities.push({
          severity: 'high',
          description: 'Expired JWT token accepted',
          impact: 'Unauthorized access with expired credentials'
        });
      }

    } catch (error) {
      // Expected to fail
    }
  }

  async testOAuthAttacks(suite) {
    const test = {
      name: 'OAuth Attacks',
      description: 'Test OAuth vulnerability scenarios',
      vulnerabilities: []
    };

    try {
      // Test 1: State parameter manipulation
      await this.testOAuthStateAttack(test);

      // Test 2: Redirect URI manipulation
      await this.testOAuthRedirectAttack(test);

    } catch (error) {
      test.error = error.message;
    }

    suite.tests.push(test);
    this.updateSummary(test);
  }

  async testOAuthStateAttack(test) {
    try {
      // Test if OAuth state parameter is properly validated
      const response = await this.makeRequest('GET', '/api/oauth/google/callback', {
        code: 'fake-auth-code',
        state: 'malicious-state'
      });

      if (response.status === 200) {
        test.vulnerabilities.push({
          severity: 'high',
          description: 'OAuth state parameter not properly validated',
          impact: 'CSRF attacks on OAuth flow'
        });
      }

    } catch (error) {
      // Expected to fail
    }
  }

  async testOAuthRedirectAttack(test) {
    try {
      // Test redirect URI validation
      const response = await this.makeRequest('GET', '/api/oauth/google', {
        redirect_uri: 'http://malicious-site.com/callback'
      });

      // Check if the redirect URI is accepted
      if (response.status === 302 && response.headers.location?.includes('malicious-site.com')) {
        test.vulnerabilities.push({
          severity: 'critical',
          description: 'OAuth redirect URI validation bypass',
          impact: 'Authorization code interception'
        });
      }

    } catch (error) {
      // Expected to fail
    }
  }

  async runSessionAttacks(suite) {
    const testSuite = {
      name: 'Session Management Attacks',
      tests: []
    };

    console.log('🍪 Testing Session Vulnerabilities...');

    await this.testSessionFixation(testSuite);
    await this.testSessionHijacking(testSuite);
    await this.testConcurrentSessions(testSuite);

    this.results.testSuites.push(testSuite);
  }

  async testSessionFixation(suite) {
    const test = {
      name: 'Session Fixation Attack',
      description: 'Test if session ID changes after authentication',
      vulnerabilities: []
    };

    try {
      // Get initial session
      const initialResponse = await this.makeRequest('GET', '/api');
      const initialCookies = this.extractCookies(initialResponse);

      // Login
      const loginResponse = await this.makeRequest('POST', '/api/auth/login', {
        email: CONFIG.testUserEmail,
        password: CONFIG.testUserPassword
      });

      const loginCookies = this.extractCookies(loginResponse);

      // Check if session changed
      const sessionChanged = this.compareSessionIds(initialCookies, loginCookies);

      if (!sessionChanged) {
        test.vulnerabilities.push({
          severity: 'medium',
          description: 'Session ID does not change after authentication',
          impact: 'Session fixation attacks possible'
        });
      }

    } catch (error) {
      test.error = error.message;
    }

    suite.tests.push(test);
    this.updateSummary(test);
  }

  async runInjectionAttacks() {
    const suite = {
      name: 'Injection Attacks',
      tests: []
    };

    console.log('💉 Testing Injection Vulnerabilities...');

    await this.testSQLInjection(suite);
    await this.testNoSQLInjection(suite);
    await this.testLDAPInjection(suite);
    await this.testCommandInjection(suite);

    this.results.testSuites.push(suite);
  }

  async testSQLInjection(suite) {
    const test = {
      name: 'SQL Injection Attack',
      description: 'Test for SQL injection vulnerabilities',
      vulnerabilities: []
    };

    const sqlPayloads = [
      "' OR '1'='1' --",
      "'; DROP TABLE users; --",
      "' UNION SELECT password FROM users WHERE '1'='1",
      "1' AND EXTRACTVALUE(1, CONCAT('~', (SELECT password FROM users LIMIT 1))) AND '1'='1"
    ];

    const endpoints = [
      { method: 'POST', path: '/api/auth/login', field: 'email' },
      { method: 'POST', path: '/api/auth/login', field: 'password' },
      { method: 'GET', path: '/api/users/profile' },
      { method: 'POST', path: '/api/auth/forgot-password', field: 'email' }
    ];

    for (const endpoint of endpoints) {
      for (const payload of sqlPayloads) {
        try {
          let data = {};
          if (endpoint.field) {
            data[endpoint.field] = payload;
            if (endpoint.field === 'email') {
              data.password = 'test';
            } else if (endpoint.field === 'password') {
              data.email = 'test@test.com';
            }
          }

          const response = await this.makeRequest(endpoint.method, endpoint.path, data);

          // Check for SQL error messages or unusual responses
          const responseText = JSON.stringify(response.data).toLowerCase();
          
          if (responseText.includes('sql') || 
              responseText.includes('mysql') || 
              responseText.includes('postgresql') ||
              responseText.includes('syntax error') ||
              response.status === 500) {
            
            test.vulnerabilities.push({
              severity: 'critical',
              description: `SQL injection possible at ${endpoint.method} ${endpoint.path}`,
              payload: payload,
              impact: 'Database compromise'
            });
          }

          await this.delay(CONFIG.delayBetweenRequests);

        } catch (error) {
          // Expected for most payloads
        }
      }
    }

    suite.tests.push(test);
    this.updateSummary(test);
  }

  async runBusinessLogicAttacks() {
    const suite = {
      name: 'Business Logic Attacks',
      tests: []
    };

    console.log('🎯 Testing Business Logic Vulnerabilities...');

    await this.testAccountEnumeration(suite);
    await this.testPasswordResetAbuse(suite);
    await this.testRegistrationAbuse(suite);

    this.results.testSuites.push(suite);
  }

  async testAccountEnumeration(suite) {
    const test = {
      name: 'Account Enumeration Attack',
      description: 'Test if valid accounts can be enumerated',
      vulnerabilities: []
    };

    try {
      const validEmail = CONFIG.testUserEmail;
      const invalidEmail = 'nonexistent-' + Date.now() + '@zoptal.com';

      // Test login responses
      const validResponse = await this.makeRequest('POST', '/api/auth/login', {
        email: validEmail,
        password: 'wrongpassword'
      });

      const invalidResponse = await this.makeRequest('POST', '/api/auth/login', {
        email: invalidEmail,
        password: 'wrongpassword'
      });

      // Test password reset responses
      const validResetResponse = await this.makeRequest('POST', '/api/auth/forgot-password', {
        email: validEmail
      });

      const invalidResetResponse = await this.makeRequest('POST', '/api/auth/forgot-password', {
        email: invalidEmail
      });

      // Check for different responses that could indicate account existence
      if (validResponse.status !== invalidResponse.status ||
          JSON.stringify(validResponse.data) !== JSON.stringify(invalidResponse.data)) {
        
        test.vulnerabilities.push({
          severity: 'medium',
          description: 'Account enumeration possible via login response differences',
          impact: 'Attacker can identify valid email addresses'
        });
      }

      if (validResetResponse.status !== invalidResetResponse.status ||
          JSON.stringify(validResetResponse.data) !== JSON.stringify(invalidResetResponse.data)) {
        
        test.vulnerabilities.push({
          severity: 'medium',
          description: 'Account enumeration possible via password reset response differences',
          impact: 'Attacker can identify valid email addresses'
        });
      }

    } catch (error) {
      test.error = error.message;
    }

    suite.tests.push(test);
    this.updateSummary(test);
  }

  // Helper methods
  createJWTWithHMAC(secret, payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  extractCookies(response) {
    return response.headers['set-cookie'] || [];
  }

  compareSessionIds(cookies1, cookies2) {
    const session1 = cookies1.find(c => c.includes('session'));
    const session2 = cookies2.find(c => c.includes('session'));
    
    return session1 !== session2;
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
        validateStatus: () => true
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

  updateSummary(test) {
    this.results.summary.totalTests++;
    
    test.vulnerabilities.forEach(vuln => {
      this.results.summary.vulnerabilitiesFound++;
      
      switch (vuln.severity) {
        case 'critical':
          this.results.summary.criticalVulnerabilities++;
          break;
        case 'high':
          this.results.summary.highVulnerabilities++;
          break;
        case 'medium':
          this.results.summary.mediumVulnerabilities++;
          break;
        case 'low':
          this.results.summary.lowVulnerabilities++;
          break;
      }
    });
  }

  generateReport() {
    // Add recommendations based on findings
    this.results.recommendations = this.generateRecommendations();
    
    // Calculate risk score
    this.results.riskScore = this.calculateRiskScore();
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.summary.criticalVulnerabilities > 0) {
      recommendations.push({
        priority: 'critical',
        title: 'Address Critical Vulnerabilities Immediately',
        description: 'Critical vulnerabilities found that could lead to complete system compromise.'
      });
    }
    
    if (this.results.summary.highVulnerabilities > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Implement Additional Security Controls',
        description: 'High-severity vulnerabilities detected that require immediate attention.'
      });
    }
    
    recommendations.push({
      priority: 'medium',
      title: 'Regular Security Testing',
      description: 'Implement automated security testing in CI/CD pipeline.'
    });
    
    return recommendations;
  }

  calculateRiskScore() {
    const critical = this.results.summary.criticalVulnerabilities * 10;
    const high = this.results.summary.highVulnerabilities * 7;
    const medium = this.results.summary.mediumVulnerabilities * 4;
    const low = this.results.summary.lowVulnerabilities * 1;
    
    return Math.min(100, critical + high + medium + low);
  }

  printSummary() {
    console.log('\n📊 PENETRATION TEST SUMMARY');
    console.log('='.repeat(40));
    console.log(`Total Tests: ${this.results.summary.totalTests}`);
    console.log(`Vulnerabilities Found: ${this.results.summary.vulnerabilitiesFound}`);
    console.log(`Critical: ${this.results.summary.criticalVulnerabilities}`);
    console.log(`High: ${this.results.summary.highVulnerabilities}`);
    console.log(`Medium: ${this.results.summary.mediumVulnerabilities}`);
    console.log(`Low: ${this.results.summary.lowVulnerabilities}`);
    console.log(`Risk Score: ${this.results.riskScore}/100`);
  }

  async saveResults() {
    try {
      const reportPath = path.join(process.cwd(), CONFIG.outputFile);
      await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
      console.log(`\n📄 Penetration test report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Failed to save penetration test report:', error.message);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async cleanup() {
    // Clean up test data if needed
    console.log('🧹 Cleaning up test environment...');
  }

  // Placeholder methods for additional test suites
  async testSessionHijacking(suite) { /* Implementation */ }
  async testConcurrentSessions(suite) { /* Implementation */ }
  async testNoSQLInjection(suite) { /* Implementation */ }
  async testLDAPInjection(suite) { /* Implementation */ }
  async testCommandInjection(suite) { /* Implementation */ }
  async testPasswordResetAbuse(suite) { /* Implementation */ }
  async testRegistrationAbuse(suite) { /* Implementation */ }
  async runAuthorizationAttacks() { /* Implementation */ }
  async runInformationGatheringAttacks() { /* Implementation */ }
  async runDenialOfServiceAttacks() { /* Implementation */ }
}

// Run penetration tests if called directly
if (require.main === module) {
  const penTest = new PenetrationTest();
  penTest.runPenetrationTests().catch(console.error);
}

module.exports = PenetrationTest;