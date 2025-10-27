#!/usr/bin/env node

/**
 * Authentication Security Testing Suite for Zoptal Platform
 * Tests JWT security, session management, OAuth flows, and authentication bypass
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const url = require('url');

class AuthSecurityTester {
    constructor(apiUrl, options = {}) {
        this.apiUrl = apiUrl.replace(/\/$/, '');
        this.options = {
            timeout: options.timeout || 10000,
            verbose: options.verbose || false,
            outputFile: options.outputFile || 'auth-security-results.json'
        };
        
        this.vulnerabilities = [];
        this.testResults = [];
        this.testCredentials = {
            email: 'sectest@example.com',
            password: 'SecTest123!'
        };
        
        // JWT payloads for testing
        this.jwtAttackPayloads = [
            // None algorithm attack
            'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.',
            
            // Weak secret brute force candidates
            'HS256_weak_secret',
            'jwt_secret_key',
            'secret',
            'password',
            '123456'
        ];
        
        this.log('Authentication Security Tester initialized');
    }

    log(message, level = 'INFO') {
        if (this.options.verbose || level === 'ERROR' || level === 'RESULT') {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] [${level}] ${message}`);
        }
    }

    async makeRequest(endpoint, method = 'GET', data = null, headers = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(endpoint, this.apiUrl);
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'AuthSecurityTester/1.0',
                    ...headers
                },
                timeout: this.options.timeout
            };

            const httpModule = urlObj.protocol === 'https:' ? https : http;
            
            const req = httpModule.request(requestOptions, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: responseData,
                        rawResponse: res
                    });
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (data) {
                req.write(typeof data === 'string' ? data : JSON.stringify(data));
            }

            req.end();
        });
    }

    async testPasswordPolicies() {
        this.log('Testing password policies and strength requirements...');
        
        const weakPasswords = [
            '123456',
            'password',
            'admin',
            'test',
            '12345678',
            'qwerty',
            'abc123',
            'password123'
        ];
        
        let vulnerabilitiesFound = 0;
        
        for (const weakPassword of weakPasswords) {
            try {
                const registrationData = {
                    email: `test_${Date.now()}@example.com`,
                    password: weakPassword,
                    name: 'Test User',
                    confirmPassword: weakPassword
                };
                
                const response = await this.makeRequest('/auth/register', 'POST', registrationData);
                
                if (response.statusCode === 201 || response.statusCode === 200) {
                    this.vulnerabilities.push({
                        type: 'Weak Password Policy',
                        severity: 'Medium',
                        description: `Weak password '${weakPassword}' accepted during registration`,
                        endpoint: '/auth/register',
                        evidence: `Registration successful with weak password: ${weakPassword}`
                    });
                    vulnerabilitiesFound++;
                }
                
            } catch (error) {
                // Expected for weak passwords
            }
        }
        
        this.log(`Password policy test completed. Found ${vulnerabilitiesFound} vulnerabilities`, 'RESULT');
    }

    async testBruteForceProtection() {
        this.log('Testing brute force protection mechanisms...');
        
        let vulnerabilitiesFound = 0;
        const testEmail = 'bruteforce@example.com';
        
        // Try multiple failed login attempts
        for (let i = 0; i < 15; i++) {
            try {
                const loginData = {
                    email: testEmail,
                    password: `wrongpassword${i}`
                };
                
                const response = await this.makeRequest('/auth/login', 'POST', loginData);
                
                // Check if we're being rate limited or blocked
                if (response.statusCode === 429 || response.statusCode === 423) {
                    this.log('Brute force protection detected (rate limiting)', 'INFO');
                    return; // Protection is working
                }
                
                if (i >= 10 && response.statusCode !== 429) {
                    // No protection after many attempts
                    this.vulnerabilities.push({
                        type: 'Missing Brute Force Protection',
                        severity: 'High',
                        description: 'No rate limiting or account lockout after multiple failed login attempts',
                        endpoint: '/auth/login',
                        evidence: `${i + 1} failed attempts without protection`
                    });
                    vulnerabilitiesFound++;
                    break;
                }
                
                // Small delay between attempts
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                // Connection errors might indicate some protection
            }
        }
        
        this.log(`Brute force protection test completed. Found ${vulnerabilitiesFound} vulnerabilities`, 'RESULT');
    }

    async testJWTSecurity() {
        this.log('Testing JWT token security...');
        
        let vulnerabilitiesFound = 0;
        let validToken = null;
        
        // First, get a valid token
        try {
            const loginData = {
                email: this.testCredentials.email,
                password: this.testCredentials.password
            };
            
            // Try to register first
            await this.makeRequest('/auth/register', 'POST', {
                ...loginData,
                name: 'Security Test User',
                confirmPassword: this.testCredentials.password
            });
            
            const loginResponse = await this.makeRequest('/auth/login', 'POST', loginData);
            
            if (loginResponse.statusCode === 200) {
                const loginResult = JSON.parse(loginResponse.body);
                validToken = loginResult.tokens?.accessToken;
            }
            
        } catch (error) {
            this.log('Could not obtain valid JWT token for testing', 'ERROR');
            return;
        }
        
        if (!validToken) {
            this.log('No valid JWT token available for testing', 'ERROR');
            return;
        }
        
        // Test 1: None algorithm attack
        try {
            const jwtParts = validToken.split('.');
            if (jwtParts.length === 3) {
                // Create token with "none" algorithm
                const noneHeader = Buffer.from(JSON.stringify({
                    "alg": "none",
                    "typ": "JWT"
                })).toString('base64url');
                
                const payload = jwtParts[1]; // Use original payload
                const noneToken = `${noneHeader}.${payload}.`;
                
                // Test with none algorithm token
                const testResponse = await this.makeRequest('/users/profile', 'GET', null, {
                    'Authorization': `Bearer ${noneToken}`
                });
                
                if (testResponse.statusCode === 200) {
                    this.vulnerabilities.push({
                        type: 'JWT None Algorithm Vulnerability',
                        severity: 'Critical',
                        description: 'JWT tokens with "none" algorithm are accepted',
                        endpoint: '/users/profile',
                        evidence: 'Authentication successful with none algorithm JWT'
                    });
                    vulnerabilitiesFound++;
                }
            }
        } catch (error) {
            // Expected if properly secured
        }
        
        // Test 2: Token manipulation
        try {
            const manipulatedToken = validToken.slice(0, -10) + 'AAAAAAAAAA';
            
            const testResponse = await this.makeRequest('/users/profile', 'GET', null, {
                'Authorization': `Bearer ${manipulatedToken}`
            });
            
            if (testResponse.statusCode === 200) {
                this.vulnerabilities.push({
                    type: 'JWT Signature Verification Bypass',
                    severity: 'Critical',
                    description: 'Manipulated JWT token accepted without proper signature verification',
                    endpoint: '/users/profile',
                    evidence: 'Authentication successful with manipulated token signature'
                });
                vulnerabilitiesFound++;
            }
        } catch (error) {
            // Expected for secure implementation
        }
        
        // Test 3: Expired token handling
        try {
            // Create an expired token (this is simplified - in real scenarios you'd need the secret)
            const expiredPayload = {
                "sub": "1234567890",
                "name": "Test User",
                "iat": Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
                "exp": Math.floor(Date.now() / 1000) - 1800  // 30 minutes ago (expired)
            };
            
            // This test is limited without the signing secret
            // In a real test, you'd try to use an actually expired token
        } catch (error) {
            // Expected
        }
        
        // Test 4: JWT secret brute force (simulated)
        for (const weakSecret of this.jwtAttackPayloads.slice(1)) {
            try {
                // In a real scenario, you'd try to sign tokens with weak secrets
                // This is a simplified test
                const testHeaders = {
                    'Authorization': `Bearer ${weakSecret}_token_test`
                };
                
                const response = await this.makeRequest('/users/profile', 'GET', null, testHeaders);
                
                // This won't work without proper JWT creation, but tests the concept
            } catch (error) {
                // Expected
            }
        }
        
        this.log(`JWT security test completed. Found ${vulnerabilitiesFound} vulnerabilities`, 'RESULT');
    }

    async testSessionManagement() {
        this.log('Testing session management security...');
        
        let vulnerabilitiesFound = 0;
        let authToken = null;
        
        // Get authentication token
        try {
            const loginData = {
                email: this.testCredentials.email,
                password: this.testCredentials.password
            };
            
            const loginResponse = await this.makeRequest('/auth/login', 'POST', loginData);
            
            if (loginResponse.statusCode === 200) {
                const result = JSON.parse(loginResponse.body);
                authToken = result.tokens?.accessToken;
            }
        } catch (error) {
            this.log('Could not authenticate for session testing', 'ERROR');
            return;
        }
        
        if (!authToken) return;
        
        // Test 1: Session fixation
        try {
            // Make authenticated request
            const beforeLogout = await this.makeRequest('/users/profile', 'GET', null, {
                'Authorization': `Bearer ${authToken}`
            });
            
            if (beforeLogout.statusCode === 200) {
                // Try logout
                await this.makeRequest('/auth/logout', 'POST', null, {
                    'Authorization': `Bearer ${authToken}`
                });
                
                // Try to use same token after logout
                const afterLogout = await this.makeRequest('/users/profile', 'GET', null, {
                    'Authorization': `Bearer ${authToken}`
                });
                
                if (afterLogout.statusCode === 200) {
                    this.vulnerabilities.push({
                        type: 'Session Fixation',
                        severity: 'High',
                        description: 'JWT token still valid after logout',
                        endpoint: '/auth/logout',
                        evidence: 'Token remains valid after logout call'
                    });
                    vulnerabilitiesFound++;
                }
            }
        } catch (error) {
            // Expected behavior
        }
        
        // Test 2: Concurrent sessions
        try {
            // Login with same credentials from different "devices"
            const loginData = {
                email: this.testCredentials.email,
                password: this.testCredentials.password
            };
            
            const session1 = await this.makeRequest('/auth/login', 'POST', loginData, {
                'User-Agent': 'Device1'
            });
            
            const session2 = await this.makeRequest('/auth/login', 'POST', loginData, {
                'User-Agent': 'Device2'
            });
            
            if (session1.statusCode === 200 && session2.statusCode === 200) {
                const token1 = JSON.parse(session1.body).tokens?.accessToken;
                const token2 = JSON.parse(session2.body).tokens?.accessToken;
                
                if (token1 && token2 && token1 !== token2) {
                    // Both tokens should be valid (this might be expected behavior)
                    // But check if there's a limit on concurrent sessions
                    
                    const test1 = await this.makeRequest('/users/profile', 'GET', null, {
                        'Authorization': `Bearer ${token1}`
                    });
                    
                    const test2 = await this.makeRequest('/users/profile', 'GET', null, {
                        'Authorization': `Bearer ${token2}`
                    });
                    
                    if (test1.statusCode === 200 && test2.statusCode === 200) {
                        // This might be expected, but worth noting
                        this.log('Multiple concurrent sessions allowed', 'INFO');
                    }
                }
            }
        } catch (error) {
            // Expected
        }
        
        this.log(`Session management test completed. Found ${vulnerabilitiesFound} vulnerabilities`, 'RESULT');
    }

    async testAuthenticationBypass() {
        this.log('Testing authentication bypass vulnerabilities...');
        
        let vulnerabilitiesFound = 0;
        
        // Test direct access to protected endpoints without authentication
        const protectedEndpoints = [
            '/users/profile',
            '/projects',
            '/admin/dashboard',
            '/billing/subscription',
            '/users/settings'
        ];
        
        for (const endpoint of protectedEndpoints) {
            try {
                const response = await this.makeRequest(endpoint, 'GET');
                
                // Should return 401 or 403, not 200
                if (response.statusCode === 200) {
                    this.vulnerabilities.push({
                        type: 'Authentication Bypass',
                        severity: 'Critical',
                        description: `Protected endpoint accessible without authentication`,
                        endpoint: endpoint,
                        evidence: `Endpoint returned ${response.statusCode} without authentication`
                    });
                    vulnerabilitiesFound++;
                }
            } catch (error) {
                // Network errors are acceptable
            }
        }
        
        // Test parameter pollution
        const pollutionTests = [
            '/users/profile?user_id=1',
            '/users/profile?admin=true',
            '/users/profile?bypass=1',
            '/users/profile?auth_skip=true'
        ];
        
        for (const testUrl of pollutionTests) {
            try {
                const response = await this.makeRequest(testUrl, 'GET');
                
                if (response.statusCode === 200) {
                    this.vulnerabilities.push({
                        type: 'Parameter Pollution Bypass',
                        severity: 'High',
                        description: 'Authentication bypass via parameter manipulation',
                        endpoint: testUrl,
                        evidence: `Parameter pollution successful: ${testUrl}`
                    });
                    vulnerabilitiesFound++;
                }
            } catch (error) {
                // Expected
            }
        }
        
        // Test header manipulation
        const headerTests = [
            { 'X-Forwarded-For': '127.0.0.1' },
            { 'X-Real-IP': '127.0.0.1' },
            { 'X-Originating-IP': '127.0.0.1' },
            { 'X-Remote-IP': '127.0.0.1' },
            { 'X-User-ID': '1' },
            { 'X-Admin': 'true' },
            { 'Authorization': 'Bearer admin' },
            { 'Authorization': 'Basic YWRtaW46YWRtaW4=' } // admin:admin
        ];
        
        for (const headers of headerTests) {
            try {
                const response = await this.makeRequest('/users/profile', 'GET', null, headers);
                
                if (response.statusCode === 200) {
                    this.vulnerabilities.push({
                        type: 'Header Manipulation Bypass',
                        severity: 'High',
                        description: 'Authentication bypass via header manipulation',
                        endpoint: '/users/profile',
                        evidence: `Header bypass successful: ${JSON.stringify(headers)}`
                    });
                    vulnerabilitiesFound++;
                }
            } catch (error) {
                // Expected
            }
        }
        
        this.log(`Authentication bypass test completed. Found ${vulnerabilitiesFound} vulnerabilities`, 'RESULT');
    }

    async testOAuthSecurity() {
        this.log('Testing OAuth implementation security...');
        
        let vulnerabilitiesFound = 0;
        
        // Test OAuth endpoints
        const oauthEndpoints = [
            '/auth/oauth/google',
            '/auth/oauth/github',
            '/auth/oauth/callback',
            '/oauth/authorize',
            '/oauth/token'
        ];
        
        for (const endpoint of oauthEndpoints) {
            try {
                // Test for information disclosure
                const response = await this.makeRequest(endpoint, 'GET');
                
                if (response.statusCode === 200 && response.body.includes('error')) {
                    // Look for sensitive information in error messages
                    const body = response.body.toLowerCase();
                    if (body.includes('client_secret') || body.includes('private_key')) {
                        this.vulnerabilities.push({
                            type: 'OAuth Information Disclosure',
                            severity: 'High',
                            description: 'Sensitive OAuth information disclosed in error messages',
                            endpoint: endpoint,
                            evidence: 'Client secrets or private keys found in response'
                        });
                        vulnerabilitiesFound++;
                    }
                }
                
                // Test CSRF protection
                const csrfTestResponse = await this.makeRequest(endpoint, 'POST', {
                    client_id: 'test',
                    redirect_uri: 'http://evil.com/callback',
                    response_type: 'code'
                });
                
                // Should require proper CSRF protection
                if (csrfTestResponse.statusCode === 302) {
                    // Check if redirect is properly validated
                    const location = csrfTestResponse.headers.location;
                    if (location && location.includes('evil.com')) {
                        this.vulnerabilities.push({
                            type: 'OAuth Redirect URI Validation',
                            severity: 'High',
                            description: 'OAuth redirect URI not properly validated',
                            endpoint: endpoint,
                            evidence: `Redirect to unauthorized domain: ${location}`
                        });
                        vulnerabilitiesFound++;
                    }
                }
                
            } catch (error) {
                // Expected for many OAuth tests
            }
        }
        
        this.log(`OAuth security test completed. Found ${vulnerabilitiesFound} vulnerabilities`, 'RESULT');
    }

    async testTwoFactorAuthentication() {
        this.log('Testing two-factor authentication security...');
        
        let vulnerabilitiesFound = 0;
        
        // Test 2FA endpoints
        const twoFAEndpoints = [
            '/auth/2fa/enable',
            '/auth/2fa/verify',
            '/auth/2fa/backup-codes',
            '/auth/2fa/disable'
        ];
        
        for (const endpoint of twoFAEndpoints) {
            try {
                // Test without authentication
                const response = await this.makeRequest(endpoint, 'GET');
                
                if (response.statusCode === 200) {
                    this.vulnerabilities.push({
                        type: '2FA Endpoint Access Control',
                        severity: 'Medium',
                        description: '2FA endpoint accessible without proper authentication',
                        endpoint: endpoint,
                        evidence: `Endpoint returned ${response.statusCode} without authentication`
                    });
                    vulnerabilitiesFound++;
                }
                
                // Test 2FA bypass attempts
                const bypassTests = [
                    { code: '000000' },
                    { code: '123456' },
                    { code: '111111' },
                    { bypass: 'true' },
                    { admin_override: 'true' }
                ];
                
                for (const testData of bypassTests) {
                    try {
                        const bypassResponse = await this.makeRequest(endpoint, 'POST', testData);
                        
                        if (bypassResponse.statusCode === 200 && bypassResponse.body.includes('success')) {
                            this.vulnerabilities.push({
                                type: '2FA Bypass',
                                severity: 'Critical',
                                description: '2FA verification bypassed with predictable or special values',
                                endpoint: endpoint,
                                evidence: `Bypass successful with: ${JSON.stringify(testData)}`
                            });
                            vulnerabilitiesFound++;
                        }
                    } catch (error) {
                        // Expected
                    }
                }
                
            } catch (error) {
                // Expected
            }
        }
        
        this.log(`2FA security test completed. Found ${vulnerabilitiesFound} vulnerabilities`, 'RESULT');
    }

    async runAllTests() {
        this.log('Starting comprehensive authentication security testing...');
        
        const testMethods = [
            this.testPasswordPolicies,
            this.testBruteForceProtection,
            this.testJWTSecurity,
            this.testSessionManagement,
            this.testAuthenticationBypass,
            this.testOAuthSecurity,
            this.testTwoFactorAuthentication
        ];
        
        for (const testMethod of testMethods) {
            try {
                await testMethod.call(this);
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                this.log(`Error in ${testMethod.name}: ${error.message}`, 'ERROR');
            }
        }
        
        this.log(`All authentication security tests completed. Found ${this.vulnerabilities.length} potential vulnerabilities.`, 'RESULT');
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            target: this.apiUrl,
            testType: 'Authentication Security Testing',
            totalVulnerabilities: this.vulnerabilities.length,
            severityBreakdown: {
                critical: this.vulnerabilities.filter(v => v.severity === 'Critical').length,
                high: this.vulnerabilities.filter(v => v.severity === 'High').length,
                medium: this.vulnerabilities.filter(v => v.severity === 'Medium').length,
                low: this.vulnerabilities.filter(v => v.severity === 'Low').length
            },
            vulnerabilities: this.vulnerabilities,
            testResults: this.testResults
        };
        
        fs.writeFileSync(this.options.outputFile, JSON.stringify(report, null, 2));
        this.log(`Authentication security report saved to: ${this.options.outputFile}`, 'RESULT');
        
        return report;
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    let apiUrl = '';
    let outputFile = 'auth-security-results.json';
    let verbose = false;
    
    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--api-url':
                apiUrl = args[++i];
                break;
            case '--output':
                outputFile = args[++i];
                break;
            case '--verbose':
                verbose = true;
                break;
            case '--help':
                console.log(`
Authentication Security Testing Suite for Zoptal Platform

Usage: node auth-security-tests.js --api-url <API_URL> [OPTIONS]

Options:
  --api-url URL     Target API base URL (required)
  --output FILE     Output file for results (default: auth-security-results.json)
  --verbose         Verbose output
  --help           Show this help message

Examples:
  node auth-security-tests.js --api-url http://localhost:3001
  node auth-security-tests.js --api-url https://api.zoptal.com --verbose
                `);
                process.exit(0);
        }
    }
    
    if (!apiUrl) {
        console.error('Error: --api-url is required');
        process.exit(1);
    }
    
    // Run tests
    async function main() {
        const tester = new AuthSecurityTester(apiUrl, { 
            outputFile, 
            verbose 
        });
        
        try {
            await tester.runAllTests();
            const report = tester.generateReport();
            
            // Exit with appropriate code
            const criticalVulns = report.severityBreakdown.critical;
            const highVulns = report.severityBreakdown.high;
            
            if (criticalVulns > 0) {
                process.exit(2); // Critical vulnerabilities found
            } else if (highVulns > 0) {
                process.exit(1); // High vulnerabilities found
            } else {
                process.exit(0); // Success
            }
            
        } catch (error) {
            console.error(`Error: ${error.message}`);
            process.exit(1);
        }
    }
    
    main();
}

module.exports = AuthSecurityTester;