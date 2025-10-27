#!/usr/bin/env python3

"""
API Security Testing Suite for Zoptal Platform
Tests authentication, authorization, input validation, and API-specific vulnerabilities
"""

import argparse
import requests
import json
import time
import sys
import urllib.parse
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import random
import string

class APISecurityTester:
    def __init__(self, base_url, email=None, password=None):
        self.base_url = base_url.rstrip('/')
        self.email = email
        self.password = password
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        self.vulnerabilities = []
        
        # Common payloads for injection testing
        self.sql_payloads = [
            "' OR '1'='1", "' OR 1=1--", "'; DROP TABLE users--",
            "' UNION SELECT NULL--", "admin'--", "' OR 'a'='a"
        ]
        
        self.xss_payloads = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "javascript:alert('XSS')",
            "<svg onload=alert('XSS')>",
            "'><script>alert('XSS')</script>"
        ]
        
        self.nosql_payloads = [
            {"$ne": ""},
            {"$gt": ""},
            {"$regex": ".*"},
            {"$where": "function() { return true; }"}
        ]
        
        # Headers for testing
        self.security_headers = [
            'Content-Security-Policy',
            'X-Frame-Options',
            'X-Content-Type-Options',
            'X-XSS-Protection',
            'Strict-Transport-Security',
            'Referrer-Policy'
        ]

    def authenticate(self):
        """Authenticate with the API to get access token"""
        if not self.email or not self.password:
            self.log_info("No credentials provided, testing public endpoints only")
            return False
            
        try:
            login_data = {
                "email": self.email,
                "password": self.password
            }
            
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('tokens', {}).get('accessToken')
                if self.auth_token:
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.auth_token}'
                    })
                    self.log_success("Authentication successful")
                    return True
            
            self.log_error(f"Authentication failed: {response.status_code}")
            return False
            
        except Exception as e:
            self.log_error(f"Authentication error: {str(e)}")
            return False

    def test_sql_injection(self):
        """Test for SQL injection vulnerabilities"""
        self.log_info("Testing for SQL injection vulnerabilities...")
        
        # Common endpoints to test
        endpoints = [
            "/users",
            "/projects",
            "/auth/login",
            "/search",
            "/api/v1/users"
        ]
        
        vulnerabilities_found = []
        
        for endpoint in endpoints:
            for payload in self.sql_payloads:
                # Test GET parameters
                test_url = f"{self.base_url}{endpoint}?id={urllib.parse.quote(payload)}"
                
                try:
                    response = self.session.get(test_url, timeout=5)
                    
                    # Check for SQL error indicators
                    error_indicators = [
                        "SQL syntax",
                        "mysql_fetch",
                        "PostgreSQL",
                        "ORA-",
                        "Microsoft OLE DB",
                        "SQLServer JDBC Driver"
                    ]
                    
                    response_text = response.text.lower()
                    for indicator in error_indicators:
                        if indicator.lower() in response_text:
                            vulnerabilities_found.append({
                                "type": "SQL Injection",
                                "severity": "High",
                                "endpoint": endpoint,
                                "payload": payload,
                                "method": "GET",
                                "evidence": indicator
                            })
                            break
                
                except Exception:
                    continue
                
                # Test POST data
                try:
                    post_data = {"search": payload, "query": payload, "filter": payload}
                    response = self.session.post(
                        f"{self.base_url}{endpoint}",
                        json=post_data,
                        timeout=5
                    )
                    
                    response_text = response.text.lower()
                    for indicator in error_indicators:
                        if indicator.lower() in response_text:
                            vulnerabilities_found.append({
                                "type": "SQL Injection",
                                "severity": "High", 
                                "endpoint": endpoint,
                                "payload": payload,
                                "method": "POST",
                                "evidence": indicator
                            })
                            break
                            
                except Exception:
                    continue
        
        self.vulnerabilities.extend(vulnerabilities_found)
        self.log_result(f"SQL Injection test completed. Found {len(vulnerabilities_found)} potential vulnerabilities")

    def test_xss_vulnerabilities(self):
        """Test for Cross-Site Scripting (XSS) vulnerabilities"""
        self.log_info("Testing for XSS vulnerabilities...")
        
        endpoints = [
            "/search",
            "/projects",
            "/users/profile",
            "/comments",
            "/api/v1/search"
        ]
        
        vulnerabilities_found = []
        
        for endpoint in endpoints:
            for payload in self.xss_payloads:
                # Test reflected XSS in GET parameters
                test_url = f"{self.base_url}{endpoint}?q={urllib.parse.quote(payload)}"
                
                try:
                    response = self.session.get(test_url, timeout=5)
                    
                    # Check if payload is reflected in response
                    if payload in response.text and response.headers.get('content-type', '').startswith('text/html'):
                        vulnerabilities_found.append({
                            "type": "Reflected XSS",
                            "severity": "Medium",
                            "endpoint": endpoint,
                            "payload": payload,
                            "method": "GET",
                            "evidence": "Payload reflected in HTML response"
                        })
                
                except Exception:
                    continue
                
                # Test stored XSS in POST data
                try:
                    post_data = {
                        "content": payload,
                        "message": payload,
                        "description": payload,
                        "name": payload
                    }
                    
                    response = self.session.post(
                        f"{self.base_url}{endpoint}",
                        json=post_data,
                        timeout=5
                    )
                    
                    # For stored XSS, we'd need to check if the payload persists
                    # This is a simplified check
                    if response.status_code in [200, 201] and 'success' in response.text.lower():
                        vulnerabilities_found.append({
                            "type": "Potential Stored XSS",
                            "severity": "High",
                            "endpoint": endpoint,
                            "payload": payload,
                            "method": "POST",
                            "evidence": "Payload accepted, manual verification needed"
                        })
                
                except Exception:
                    continue
        
        self.vulnerabilities.extend(vulnerabilities_found)
        self.log_result(f"XSS test completed. Found {len(vulnerabilities_found)} potential vulnerabilities")

    def test_authentication_bypass(self):
        """Test for authentication bypass vulnerabilities"""
        self.log_info("Testing authentication bypass mechanisms...")
        
        vulnerabilities_found = []
        
        # Test endpoints that should require authentication
        protected_endpoints = [
            "/users/profile",
            "/projects",
            "/admin/users",
            "/billing/subscription",
            "/api/v1/user/profile"
        ]
        
        # Test without authentication
        temp_headers = self.session.headers.copy()
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
        
        for endpoint in protected_endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                
                # If we get 200 OK without authentication, it's a problem
                if response.status_code == 200:
                    vulnerabilities_found.append({
                        "type": "Authentication Bypass",
                        "severity": "High",
                        "endpoint": endpoint,
                        "method": "GET",
                        "evidence": f"Returned {response.status_code} without authentication"
                    })
                
            except Exception:
                continue
        
        # Restore headers
        self.session.headers.update(temp_headers)
        
        # Test JWT token manipulation
        if self.auth_token:
            self.test_jwt_vulnerabilities(vulnerabilities_found)
        
        self.vulnerabilities.extend(vulnerabilities_found)
        self.log_result(f"Authentication bypass test completed. Found {len(vulnerabilities_found)} potential vulnerabilities")

    def test_jwt_vulnerabilities(self, vulnerabilities_found):
        """Test JWT token security"""
        if not self.auth_token:
            return
            
        # Test with modified JWT
        modified_tokens = [
            self.auth_token[:-5] + "AAAAA",  # Modified signature
            self.auth_token.replace(".", "A"),  # Corrupted token
            "Bearer invalid_token",  # Invalid token
        ]
        
        test_endpoint = "/users/profile"
        
        for token in modified_tokens:
            temp_auth = self.session.headers.get('Authorization')
            self.session.headers['Authorization'] = f'Bearer {token}'
            
            try:
                response = self.session.get(f"{self.base_url}{test_endpoint}", timeout=5)
                
                # Should return 401 or 403 for invalid tokens
                if response.status_code == 200:
                    vulnerabilities_found.append({
                        "type": "JWT Validation Bypass",
                        "severity": "Critical",
                        "endpoint": test_endpoint,
                        "evidence": f"Invalid JWT accepted: {response.status_code}"
                    })
            
            except Exception:
                continue
            finally:
                # Restore original token
                if temp_auth:
                    self.session.headers['Authorization'] = temp_auth

    def test_authorization_flaws(self):
        """Test for authorization and privilege escalation vulnerabilities"""
        self.log_info("Testing authorization and privilege escalation...")
        
        vulnerabilities_found = []
        
        # Test IDOR (Insecure Direct Object References)
        idor_endpoints = [
            "/users/{id}",
            "/projects/{id}",
            "/billing/invoices/{id}",
            "/admin/users/{id}"
        ]
        
        # Test with different user IDs
        test_ids = ["1", "2", "999", "admin", "../admin", "0", "-1"]
        
        for endpoint_template in idor_endpoints:
            for test_id in test_ids:
                endpoint = endpoint_template.format(id=test_id)
                
                try:
                    response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                    
                    # If we get data for IDs we shouldn't access
                    if response.status_code == 200 and len(response.text) > 100:
                        vulnerabilities_found.append({
                            "type": "Insecure Direct Object Reference (IDOR)",
                            "severity": "High",
                            "endpoint": endpoint,
                            "evidence": f"Accessed resource with ID: {test_id}"
                        })
                
                except Exception:
                    continue
        
        # Test privilege escalation
        admin_endpoints = [
            "/admin/users",
            "/admin/system",
            "/admin/settings",
            "/api/v1/admin/dashboard"
        ]
        
        for endpoint in admin_endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                
                # Regular users shouldn't access admin endpoints
                if response.status_code == 200:
                    vulnerabilities_found.append({
                        "type": "Privilege Escalation",
                        "severity": "Critical",
                        "endpoint": endpoint,
                        "evidence": f"Admin endpoint accessible to regular user"
                    })
            
            except Exception:
                continue
        
        self.vulnerabilities.extend(vulnerabilities_found)
        self.log_result(f"Authorization test completed. Found {len(vulnerabilities_found)} potential vulnerabilities")

    def test_input_validation(self):
        """Test input validation and sanitization"""
        self.log_info("Testing input validation...")
        
        vulnerabilities_found = []
        
        # Test various input validation issues
        test_cases = [
            # Buffer overflow attempts
            {"payload": "A" * 10000, "type": "Buffer Overflow"},
            # Path traversal
            {"payload": "../../../etc/passwd", "type": "Path Traversal"},
            {"payload": "..\\..\\..\\windows\\system32\\config\\sam", "type": "Path Traversal"},
            # Command injection
            {"payload": "; cat /etc/passwd", "type": "Command Injection"},
            {"payload": "| whoami", "type": "Command Injection"},
            # LDAP injection
            {"payload": "*)(cn=*", "type": "LDAP Injection"},
            # XML injection
            {"payload": "<?xml version=\"1.0\"?><!DOCTYPE root [<!ENTITY test SYSTEM 'file:///etc/passwd'>]><root>&test;</root>", "type": "XXE"},
        ]
        
        test_endpoints = [
            "/search",
            "/users",
            "/projects",
            "/files/upload",
            "/api/v1/search"
        ]
        
        for endpoint in test_endpoints:
            for test_case in test_cases:
                payload = test_case["payload"]
                vuln_type = test_case["type"]
                
                # Test in URL parameters
                try:
                    test_url = f"{self.base_url}{endpoint}?q={urllib.parse.quote(payload)}"
                    response = self.session.get(test_url, timeout=10)
                    
                    # Check for error indicators
                    if response.status_code == 500 or "error" in response.text.lower():
                        vulnerabilities_found.append({
                            "type": vuln_type,
                            "severity": "Medium",
                            "endpoint": endpoint,
                            "payload": payload[:100] + "..." if len(payload) > 100 else payload,
                            "method": "GET",
                            "evidence": f"Server error: {response.status_code}"
                        })
                
                except Exception:
                    continue
                
                # Test in POST data
                try:
                    post_data = {"input": payload, "data": payload, "content": payload}
                    response = self.session.post(
                        f"{self.base_url}{endpoint}",
                        json=post_data,
                        timeout=10
                    )
                    
                    if response.status_code == 500 or "error" in response.text.lower():
                        vulnerabilities_found.append({
                            "type": vuln_type,
                            "severity": "Medium",
                            "endpoint": endpoint,
                            "payload": payload[:100] + "..." if len(payload) > 100 else payload,
                            "method": "POST",
                            "evidence": f"Server error: {response.status_code}"
                        })
                
                except Exception:
                    continue
        
        self.vulnerabilities.extend(vulnerabilities_found)
        self.log_result(f"Input validation test completed. Found {len(vulnerabilities_found)} potential vulnerabilities")

    def test_rate_limiting(self):
        """Test for rate limiting and DoS protection"""
        self.log_info("Testing rate limiting...")
        
        vulnerabilities_found = []
        
        # Test endpoints for rate limiting
        test_endpoints = [
            "/auth/login",
            "/auth/register", 
            "/api/v1/search",
            "/contact"
        ]
        
        for endpoint in test_endpoints:
            # Send multiple requests quickly
            responses = []
            start_time = time.time()
            
            for i in range(20):  # Send 20 requests
                try:
                    if endpoint == "/auth/login":
                        data = {"email": f"test{i}@example.com", "password": "wrongpassword"}
                        response = self.session.post(f"{self.base_url}{endpoint}", json=data, timeout=2)
                    else:
                        response = self.session.get(f"{self.base_url}{endpoint}?test={i}", timeout=2)
                    
                    responses.append(response.status_code)
                
                except Exception:
                    continue
            
            end_time = time.time()
            duration = end_time - start_time
            
            # Check if rate limiting is in place
            rate_limited = any(status in [429, 503] for status in responses)
            success_count = sum(1 for status in responses if status in [200, 201])
            
            if success_count > 15 and not rate_limited:  # More than 15 successful requests
                vulnerabilities_found.append({
                    "type": "Missing Rate Limiting",
                    "severity": "Medium",
                    "endpoint": endpoint,
                    "evidence": f"{success_count}/20 requests succeeded in {duration:.2f}s without rate limiting"
                })
        
        self.vulnerabilities.extend(vulnerabilities_found)
        self.log_result(f"Rate limiting test completed. Found {len(vulnerabilities_found)} potential vulnerabilities")

    def test_security_headers(self):
        """Test for security headers"""
        self.log_info("Testing security headers...")
        
        vulnerabilities_found = []
        
        try:
            response = self.session.get(self.base_url, timeout=5)
            headers = response.headers
            
            # Check for missing security headers
            for header in self.security_headers:
                if header not in headers:
                    vulnerabilities_found.append({
                        "type": "Missing Security Header",
                        "severity": "Low",
                        "header": header,
                        "evidence": f"Security header '{header}' not found"
                    })
            
            # Check for insecure header values
            if 'X-Frame-Options' in headers:
                if headers['X-Frame-Options'].upper() not in ['DENY', 'SAMEORIGIN']:
                    vulnerabilities_found.append({
                        "type": "Insecure Header Value",
                        "severity": "Medium",
                        "header": "X-Frame-Options",
                        "evidence": f"Insecure value: {headers['X-Frame-Options']}"
                    })
        
        except Exception as e:
            self.log_error(f"Error testing security headers: {str(e)}")
        
        self.vulnerabilities.extend(vulnerabilities_found)
        self.log_result(f"Security headers test completed. Found {len(vulnerabilities_found)} potential vulnerabilities")

    def test_information_disclosure(self):
        """Test for information disclosure vulnerabilities"""
        self.log_info("Testing for information disclosure...")
        
        vulnerabilities_found = []
        
        # Test common information disclosure endpoints
        disclosure_endpoints = [
            "/.env",
            "/config.json",
            "/package.json",
            "/api/debug",
            "/phpinfo.php",
            "/server-status",
            "/server-info",
            "/.git/config",
            "/web.config",
            "/robots.txt",
            "/sitemap.xml"
        ]
        
        for endpoint in disclosure_endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=5)
                
                if response.status_code == 200 and len(response.text) > 10:
                    # Check for sensitive information
                    sensitive_patterns = [
                        "password",
                        "secret",
                        "api_key",
                        "database",
                        "config",
                        "private_key"
                    ]
                    
                    response_lower = response.text.lower()
                    for pattern in sensitive_patterns:
                        if pattern in response_lower:
                            vulnerabilities_found.append({
                                "type": "Information Disclosure",
                                "severity": "Medium",
                                "endpoint": endpoint,
                                "evidence": f"Sensitive information '{pattern}' found in response"
                            })
                            break
            
            except Exception:
                continue
        
        self.vulnerabilities.extend(vulnerabilities_found)
        self.log_result(f"Information disclosure test completed. Found {len(vulnerabilities_found)} potential vulnerabilities")

    def run_all_tests(self):
        """Run all security tests"""
        self.log_info("Starting comprehensive API security testing...")
        
        # Authenticate first
        self.authenticate()
        
        # Run all security tests
        test_methods = [
            self.test_sql_injection,
            self.test_xss_vulnerabilities,
            self.test_authentication_bypass,
            self.test_authorization_flaws,
            self.test_input_validation,
            self.test_rate_limiting,
            self.test_security_headers,
            self.test_information_disclosure
        ]
        
        for test_method in test_methods:
            try:
                test_method()
                time.sleep(1)  # Small delay between tests
            except Exception as e:
                self.log_error(f"Error in {test_method.__name__}: {str(e)}")
        
        self.log_success(f"All security tests completed. Found {len(self.vulnerabilities)} potential vulnerabilities.")

    def generate_report(self, output_file):
        """Generate security test report"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "target": self.base_url,
            "total_vulnerabilities": len(self.vulnerabilities),
            "severity_breakdown": {
                "critical": len([v for v in self.vulnerabilities if v.get("severity") == "Critical"]),
                "high": len([v for v in self.vulnerabilities if v.get("severity") == "High"]),
                "medium": len([v for v in self.vulnerabilities if v.get("severity") == "Medium"]),
                "low": len([v for v in self.vulnerabilities if v.get("severity") == "Low"])
            },
            "vulnerabilities": self.vulnerabilities,
            "test_results": self.test_results
        }
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.log_success(f"Security report saved to: {output_file}")

    def log_info(self, message):
        print(f"[INFO] {message}")

    def log_success(self, message):
        print(f"[SUCCESS] {message}")

    def log_error(self, message):
        print(f"[ERROR] {message}")

    def log_result(self, message):
        print(f"[RESULT] {message}")

def main():
    parser = argparse.ArgumentParser(description="API Security Testing Suite for Zoptal Platform")
    parser.add_argument("--target", required=True, help="Target API base URL")
    parser.add_argument("--email", help="Email for authenticated testing")
    parser.add_argument("--password", help="Password for authenticated testing")
    parser.add_argument("--output", default="api-security-results.json", help="Output file for results")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Create security tester instance
    tester = APISecurityTester(args.target, args.email, args.password)
    
    try:
        # Run all security tests
        tester.run_all_tests()
        
        # Generate report
        tester.generate_report(args.output)
        
        # Exit with appropriate code
        critical_vulns = len([v for v in tester.vulnerabilities if v.get("severity") == "Critical"])
        high_vulns = len([v for v in tester.vulnerabilities if v.get("severity") == "High"])
        
        if critical_vulns > 0:
            sys.exit(2)  # Critical vulnerabilities found
        elif high_vulns > 0:
            sys.exit(1)  # High vulnerabilities found
        else:
            sys.exit(0)  # Success
            
    except KeyboardInterrupt:
        print("\n[INFO] Security testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()