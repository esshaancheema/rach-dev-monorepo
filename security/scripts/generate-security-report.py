#!/usr/bin/env python3

"""
Comprehensive Security Report Generator for Zoptal Platform
Combines results from security audits, penetration tests, and compliance checks
"""

import json
import os
import sys
import glob
import argparse
from datetime import datetime
from pathlib import Path
import base64

class SecurityReportGenerator:
    def __init__(self, input_dir, output_file, report_format='html'):
        self.input_dir = Path(input_dir)
        self.output_file = output_file
        self.format = report_format
        
        # Initialize report data
        self.report_data = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'input_directory': str(input_dir),
                'report_format': report_format
            },
            'executive_summary': {},
            'vulnerability_summary': {
                'total': 0,
                'critical': 0,
                'high': 0,
                'medium': 0,
                'low': 0
            },
            'owasp_top10_coverage': {},
            'compliance_status': {},
            'test_results': {
                'security_audit': {},
                'penetration_test': {},
                'api_security': {},
                'authentication_security': {}
            },
            'recommendations': [],
            'detailed_findings': []
        }
        
        # OWASP Top 10 2021 mapping
        self.owasp_top10 = {
            'A01:2021': {
                'name': 'Broken Access Control',
                'description': 'Restrictions on what authenticated users are allowed to do are often not properly enforced',
                'keywords': ['access control', 'authorization', 'privilege escalation', 'idor', 'path traversal']
            },
            'A02:2021': {
                'name': 'Cryptographic Failures',
                'description': 'Failures related to cryptography which often leads to sensitive data exposure',
                'keywords': ['encryption', 'tls', 'ssl', 'crypto', 'password', 'hash']
            },
            'A03:2021': {
                'name': 'Injection',
                'description': 'Application is vulnerable to injection flaws when user-supplied data is not validated',
                'keywords': ['sql injection', 'xss', 'command injection', 'ldap injection', 'xxe']
            },
            'A04:2021': {
                'name': 'Insecure Design',
                'description': 'Risks related to design flaws in the application architecture',
                'keywords': ['design flaw', 'architecture', 'threat modeling', 'business logic']
            },
            'A05:2021': {
                'name': 'Security Misconfiguration',
                'description': 'Security misconfiguration is the most commonly seen issue',
                'keywords': ['misconfiguration', 'default', 'headers', 'cors', 'permissions']
            },
            'A06:2021': {
                'name': 'Vulnerable and Outdated Components',
                'description': 'Components with known vulnerabilities that may undermine application defenses',
                'keywords': ['outdated', 'vulnerable components', 'dependencies', 'libraries', 'cve']
            },
            'A07:2021': {
                'name': 'Identification and Authentication Failures',
                'description': 'Confirmation of the user\'s identity, authentication, and session management is critical',
                'keywords': ['authentication', 'session', 'jwt', 'brute force', '2fa', 'password']
            },
            'A08:2021': {
                'name': 'Software and Data Integrity Failures',
                'description': 'Assumptions related to software updates, critical data, and CI/CD pipelines without verifying integrity',
                'keywords': ['integrity', 'ci/cd', 'update', 'deserialization', 'plugin']
            },
            'A09:2021': {
                'name': 'Security Logging and Monitoring Failures',
                'description': 'Without logging and monitoring, breaches cannot be detected',
                'keywords': ['logging', 'monitoring', 'alerting', 'incident response', 'audit']
            },
            'A10:2021': {
                'name': 'Server-Side Request Forgery',
                'description': 'SSRF flaws occur whenever a web application is fetching a remote resource without validating the user-supplied URL',
                'keywords': ['ssrf', 'server-side request forgery', 'url validation', 'internal']
            }
        }

    def load_security_data(self):
        """Load all security test results from input directory"""
        print(f"Loading security data from: {self.input_dir}")
        
        # Load security audit results
        self._load_audit_results()
        
        # Load penetration test results
        self._load_pentest_results()
        
        # Load API security test results
        self._load_api_security_results()
        
        # Load authentication security test results
        self._load_auth_security_results()
        
        # Load vulnerability scan results
        self._load_vulnerability_scans()
        
        print(f"Loaded security data. Total vulnerabilities: {self.report_data['vulnerability_summary']['total']}")

    def _load_audit_results(self):
        """Load security audit results"""
        audit_files = list(self.input_dir.glob("**/security-summary.json"))
        
        for audit_file in audit_files:
            try:
                with open(audit_file, 'r') as f:
                    audit_data = json.load(f)
                
                self.report_data['test_results']['security_audit'] = audit_data
                
                # Add vulnerabilities to summary
                if 'vulnerabilities' in audit_data:
                    vulns = audit_data['vulnerabilities']
                    self.report_data['vulnerability_summary']['total'] += vulns.get('total', 0)
                    self.report_data['vulnerability_summary']['critical'] += vulns.get('critical', 0)
                    self.report_data['vulnerability_summary']['high'] += vulns.get('high', 0)
                    self.report_data['vulnerability_summary']['medium'] += vulns.get('medium', 0)
                    self.report_data['vulnerability_summary']['low'] += vulns.get('low', 0)
                
                print(f"Loaded security audit results from: {audit_file}")
                
            except Exception as e:
                print(f"Error loading audit results from {audit_file}: {e}")

    def _load_pentest_results(self):
        """Load penetration test results"""
        pentest_files = list(self.input_dir.glob("**/pentest-summary.json"))
        
        for pentest_file in pentest_files:
            try:
                with open(pentest_file, 'r') as f:
                    pentest_data = json.load(f)
                
                self.report_data['test_results']['penetration_test'] = pentest_data
                
                # Add vulnerabilities to summary
                if 'findings' in pentest_data:
                    findings = pentest_data['findings']
                    self.report_data['vulnerability_summary']['total'] += findings.get('total', 0)
                    self.report_data['vulnerability_summary']['critical'] += findings.get('critical', 0)
                    self.report_data['vulnerability_summary']['high'] += findings.get('high', 0)
                    self.report_data['vulnerability_summary']['medium'] += findings.get('medium', 0)
                    self.report_data['vulnerability_summary']['low'] += findings.get('low', 0)
                
                print(f"Loaded penetration test results from: {pentest_file}")
                
            except Exception as e:
                print(f"Error loading pentest results from {pentest_file}: {e}")

    def _load_api_security_results(self):
        """Load API security test results"""
        api_files = list(self.input_dir.glob("**/api-security.json"))
        
        for api_file in api_files:
            try:
                with open(api_file, 'r') as f:
                    api_data = json.load(f)
                
                self.report_data['test_results']['api_security'] = api_data
                
                # Process API vulnerabilities
                if 'vulnerabilities' in api_data:
                    for vuln in api_data['vulnerabilities']:
                        self._categorize_vulnerability(vuln)
                
                print(f"Loaded API security results from: {api_file}")
                
            except Exception as e:
                print(f"Error loading API security results from {api_file}: {e}")

    def _load_auth_security_results(self):
        """Load authentication security test results"""
        auth_files = list(self.input_dir.glob("**/auth-security.json"))
        
        for auth_file in auth_files:
            try:
                with open(auth_file, 'r') as f:
                    auth_data = json.load(f)
                
                self.report_data['test_results']['authentication_security'] = auth_data
                
                # Process authentication vulnerabilities
                if 'vulnerabilities' in auth_data:
                    for vuln in auth_data['vulnerabilities']:
                        self._categorize_vulnerability(vuln)
                
                print(f"Loaded authentication security results from: {auth_file}")
                
            except Exception as e:
                print(f"Error loading authentication security results from {auth_file}: {e}")

    def _load_vulnerability_scans(self):
        """Load various vulnerability scan results"""
        # Load ZAP results
        zap_files = list(self.input_dir.glob("**/zap-alerts.json"))
        for zap_file in zap_files:
            try:
                with open(zap_file, 'r') as f:
                    zap_data = json.load(f)
                
                if 'alerts' in zap_data:
                    for alert in zap_data['alerts']:
                        self._process_zap_alert(alert)
                
                print(f"Loaded ZAP scan results from: {zap_file}")
                
            except Exception as e:
                print(f"Error loading ZAP results from {zap_file}: {e}")
        
        # Load Nuclei results
        nuclei_files = list(self.input_dir.glob("**/nuclei-results.json"))
        for nuclei_file in nuclei_files:
            try:
                with open(nuclei_file, 'r') as f:
                    nuclei_data = json.load(f)
                
                if isinstance(nuclei_data, list):
                    for finding in nuclei_data:
                        self._process_nuclei_finding(finding)
                
                print(f"Loaded Nuclei scan results from: {nuclei_file}")
                
            except Exception as e:
                print(f"Error loading Nuclei results from {nuclei_file}: {e}")

    def _categorize_vulnerability(self, vulnerability):
        """Categorize vulnerability and add to detailed findings"""
        self.report_data['detailed_findings'].append(vulnerability)
        
        # Map to OWASP Top 10
        vuln_text = f"{vulnerability.get('type', '')} {vulnerability.get('description', '')}".lower()
        
        for owasp_id, owasp_info in self.owasp_top10.items():
            for keyword in owasp_info['keywords']:
                if keyword in vuln_text:
                    if owasp_id not in self.report_data['owasp_top10_coverage']:
                        self.report_data['owasp_top10_coverage'][owasp_id] = {
                            'name': owasp_info['name'],
                            'findings': 0
                        }
                    self.report_data['owasp_top10_coverage'][owasp_id]['findings'] += 1
                    break

    def _process_zap_alert(self, alert):
        """Process OWASP ZAP alert"""
        risk_level = alert.get('risk', 'Low').lower()
        
        vulnerability = {
            'source': 'OWASP ZAP',
            'type': alert.get('alert', 'Unknown'),
            'severity': risk_level.title(),
            'description': alert.get('desc', ''),
            'solution': alert.get('solution', ''),
            'reference': alert.get('reference', ''),
            'instances': len(alert.get('instances', []))
        }
        
        self._categorize_vulnerability(vulnerability)
        
        # Update counts
        if risk_level == 'high':
            self.report_data['vulnerability_summary']['high'] += 1
        elif risk_level == 'medium':
            self.report_data['vulnerability_summary']['medium'] += 1
        elif risk_level == 'low':
            self.report_data['vulnerability_summary']['low'] += 1
        
        self.report_data['vulnerability_summary']['total'] += 1

    def _process_nuclei_finding(self, finding):
        """Process Nuclei finding"""
        severity = finding.get('info', {}).get('severity', 'low')
        
        vulnerability = {
            'source': 'Nuclei',
            'type': finding.get('info', {}).get('name', 'Unknown'),
            'severity': severity.title(),
            'description': finding.get('info', {}).get('description', ''),
            'reference': ', '.join(finding.get('info', {}).get('reference', [])),
            'matched_at': finding.get('matched-at', ''),
            'template_id': finding.get('template-id', '')
        }
        
        self._categorize_vulnerability(vulnerability)
        
        # Update counts
        if severity == 'critical':
            self.report_data['vulnerability_summary']['critical'] += 1
        elif severity == 'high':
            self.report_data['vulnerability_summary']['high'] += 1
        elif severity == 'medium':
            self.report_data['vulnerability_summary']['medium'] += 1
        elif severity == 'low':
            self.report_data['vulnerability_summary']['low'] += 1
        
        self.report_data['vulnerability_summary']['total'] += 1

    def generate_executive_summary(self):
        """Generate executive summary"""
        total_vulns = self.report_data['vulnerability_summary']['total']
        critical_vulns = self.report_data['vulnerability_summary']['critical']
        high_vulns = self.report_data['vulnerability_summary']['high']
        
        # Determine risk level
        if critical_vulns > 0:
            risk_level = "Critical"
            risk_color = "#dc3545"
        elif high_vulns > 0:
            risk_level = "High"
            risk_color = "#fd7e14"
        elif self.report_data['vulnerability_summary']['medium'] > 0:
            risk_level = "Medium"
            risk_color = "#ffc107"
        else:
            risk_level = "Low"
            risk_color = "#28a745"
        
        self.report_data['executive_summary'] = {
            'risk_level': risk_level,
            'risk_color': risk_color,
            'total_vulnerabilities': total_vulns,
            'critical_vulnerabilities': critical_vulns,
            'high_vulnerabilities': high_vulns,
            'owasp_categories_affected': len(self.report_data['owasp_top10_coverage']),
            'recommendations_count': len(self.report_data['recommendations'])
        }

    def generate_recommendations(self):
        """Generate security recommendations based on findings"""
        recommendations = []
        
        # Critical recommendations
        if self.report_data['vulnerability_summary']['critical'] > 0:
            recommendations.append({
                'priority': 'Immediate',
                'category': 'Critical Vulnerabilities',
                'title': 'Address Critical Security Vulnerabilities',
                'description': f"Found {self.report_data['vulnerability_summary']['critical']} critical vulnerabilities that require immediate attention.",
                'actions': [
                    'Review all critical vulnerabilities in detail',
                    'Implement fixes within 24-48 hours',
                    'Conduct emergency security review',
                    'Consider taking affected systems offline if necessary'
                ]
            })
        
        # High priority recommendations
        if self.report_data['vulnerability_summary']['high'] > 0:
            recommendations.append({
                'priority': 'High',
                'category': 'High-Severity Issues',
                'title': 'Remediate High-Severity Security Issues',
                'description': f"Found {self.report_data['vulnerability_summary']['high']} high-severity vulnerabilities.",
                'actions': [
                    'Prioritize high-severity vulnerabilities for remediation',
                    'Implement fixes within 7 days',
                    'Conduct code reviews for affected components',
                    'Implement additional security controls where needed'
                ]
            })
        
        # OWASP Top 10 recommendations
        for owasp_id, owasp_data in self.report_data['owasp_top10_coverage'].items():
            if owasp_data['findings'] > 0:
                recommendations.append({
                    'priority': 'Medium',
                    'category': 'OWASP Top 10',
                    'title': f"Address {owasp_data['name']} ({owasp_id})",
                    'description': f"Found {owasp_data['findings']} vulnerabilities related to {owasp_data['name']}.",
                    'actions': [
                        f'Review OWASP guidelines for {owasp_data["name"]}',
                        'Implement appropriate security controls',
                        'Conduct focused testing for this vulnerability class',
                        'Update security policies and procedures'
                    ]
                })
        
        # General security improvements
        recommendations.extend([
            {
                'priority': 'Medium',
                'category': 'Security Monitoring',
                'title': 'Implement Continuous Security Monitoring',
                'description': 'Establish ongoing security monitoring and alerting capabilities.',
                'actions': [
                    'Deploy security monitoring tools (SIEM)',
                    'Set up automated vulnerability scanning',
                    'Implement intrusion detection systems',
                    'Create security incident response procedures'
                ]
            },
            {
                'priority': 'Low',
                'category': 'Security Culture',
                'title': 'Enhance Security Awareness and Training',
                'description': 'Build a security-conscious development and operations culture.',
                'actions': [
                    'Conduct security awareness training for all staff',
                    'Implement secure coding practices',
                    'Establish security code review processes',
                    'Create security champions program'
                ]
            }
        ])
        
        self.report_data['recommendations'] = recommendations

    def generate_html_report(self):
        """Generate comprehensive HTML security report"""
        self.generate_executive_summary()
        self.generate_recommendations()
        
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zoptal Platform - Comprehensive Security Report</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }}
        
        .risk-badge {{
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 15px 0;
            background: {self.report_data['executive_summary']['risk_color']};
            color: white;
        }}
        
        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }}
        
        .summary-card {{
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            text-align: center;
            border-left: 4px solid #3498db;
        }}
        
        .summary-card.critical {{ border-left-color: #dc3545; }}
        .summary-card.high {{ border-left-color: #fd7e14; }}
        .summary-card.medium {{ border-left-color: #ffc107; }}
        .summary-card.low {{ border-left-color: #28a745; }}
        
        .summary-card h3 {{
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        .summary-card .value {{
            font-size: 2.5em;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 5px;
        }}
        
        .summary-card.critical .value {{ color: #dc3545; }}
        .summary-card.high .value {{ color: #fd7e14; }}
        .summary-card.medium .value {{ color: #ffc107; }}
        .summary-card.low .value {{ color: #28a745; }}
        
        .section {{
            padding: 40px;
            border-bottom: 1px solid #ecf0f1;
        }}
        
        .section:last-child {{
            border-bottom: none;
        }}
        
        .section h2 {{
            color: #2c3e50;
            margin-bottom: 30px;
            font-size: 1.8em;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        
        .owasp-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }}
        
        .owasp-card {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #e74c3c;
        }}
        
        .recommendations {{
            background: #f8f9fa;
        }}
        
        .recommendation {{
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            border-left: 4px solid #3498db;
        }}
        
        .recommendation.immediate {{ border-left-color: #dc3545; }}
        .recommendation.high {{ border-left-color: #fd7e14; }}
        .recommendation.medium {{ border-left-color: #ffc107; }}
        .recommendation.low {{ border-left-color: #28a745; }}
        
        .priority-badge {{
            display: inline-block;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 10px;
        }}
        
        .priority-badge.immediate {{ background: #dc3545; color: white; }}
        .priority-badge.high {{ background: #fd7e14; color: white; }}
        .priority-badge.medium {{ background: #ffc107; color: black; }}
        .priority-badge.low {{ background: #28a745; color: white; }}
        
        .findings-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }}
        
        .findings-table th,
        .findings-table td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        
        .findings-table th {{
            background-color: #f2f2f2;
            font-weight: bold;
        }}
        
        .severity-critical {{ color: #dc3545; font-weight: bold; }}
        .severity-high {{ color: #fd7e14; font-weight: bold; }}
        .severity-medium {{ color: #ffc107; font-weight: bold; }}
        .severity-low {{ color: #28a745; }}
        
        .footer {{
            background: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Comprehensive Security Report</h1>
            <p>Security Assessment for Zoptal Platform</p>
            <div class="risk-badge">
                Risk Level: {self.report_data['executive_summary']['risk_level']}
            </div>
            <p style="margin-top: 10px; opacity: 0.8;">Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>Total Vulnerabilities</h3>
                <div class="value">{self.report_data['vulnerability_summary']['total']}</div>
            </div>
            
            <div class="summary-card critical">
                <h3>Critical</h3>
                <div class="value">{self.report_data['vulnerability_summary']['critical']}</div>
            </div>
            
            <div class="summary-card high">
                <h3>High</h3>
                <div class="value">{self.report_data['vulnerability_summary']['high']}</div>
            </div>
            
            <div class="summary-card medium">
                <h3>Medium</h3>
                <div class="value">{self.report_data['vulnerability_summary']['medium']}</div>
            </div>
            
            <div class="summary-card low">
                <h3>Low</h3>
                <div class="value">{self.report_data['vulnerability_summary']['low']}</div>
            </div>
            
            <div class="summary-card">
                <h3>OWASP Categories</h3>
                <div class="value">{len(self.report_data['owasp_top10_coverage'])}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>📊 OWASP Top 10 2021 Coverage</h2>
            <div class="owasp-grid">
                {self._generate_owasp_cards()}
            </div>
        </div>
        
        <div class="section recommendations">
            <h2>💡 Security Recommendations</h2>
            {self._generate_recommendations_html()}
        </div>
        
        <div class="section">
            <h2>🔍 Detailed Findings</h2>
            <table class="findings-table">
                <thead>
                    <tr>
                        <th>Severity</th>
                        <th>Type</th>
                        <th>Source</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {self._generate_findings_table()}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>Security report generated by Zoptal Security Testing Suite</p>
            <p style="margin-top: 10px;">For detailed technical information, review individual test reports and logs</p>
        </div>
    </div>
</body>
</html>
        """
        
        return html_content

    def _generate_owasp_cards(self):
        """Generate OWASP Top 10 cards HTML"""
        cards_html = ""
        
        for owasp_id, owasp_info in self.owasp_top10.items():
            if owasp_id in self.report_data['owasp_top10_coverage']:
                findings = self.report_data['owasp_top10_coverage'][owasp_id]['findings']
                cards_html += f"""
                <div class="owasp-card">
                    <h4>{owasp_id}: {owasp_info['name']}</h4>
                    <p><strong>Findings:</strong> {findings}</p>
                    <p>{owasp_info['description']}</p>
                </div>
                """
            else:
                cards_html += f"""
                <div class="owasp-card" style="border-left-color: #28a745; opacity: 0.7;">
                    <h4>{owasp_id}: {owasp_info['name']}</h4>
                    <p><strong>Status:</strong> ✅ No vulnerabilities found</p>
                    <p>{owasp_info['description']}</p>
                </div>
                """
        
        return cards_html

    def _generate_recommendations_html(self):
        """Generate recommendations HTML"""
        recommendations_html = ""
        
        for rec in self.report_data['recommendations']:
            priority_class = rec['priority'].lower()
            recommendations_html += f"""
            <div class="recommendation {priority_class}">
                <div class="priority-badge {priority_class}">{rec['priority']} Priority</div>
                <h4>{rec['title']}</h4>
                <p><strong>Category:</strong> {rec['category']}</p>
                <p>{rec['description']}</p>
                <h5>Recommended Actions:</h5>
                <ul>
                    {''.join(f'<li>{action}</li>' for action in rec['actions'])}
                </ul>
            </div>
            """
        
        return recommendations_html

    def _generate_findings_table(self):
        """Generate detailed findings table HTML"""
        table_html = ""
        
        # Sort findings by severity
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        sorted_findings = sorted(
            self.report_data['detailed_findings'],
            key=lambda x: severity_order.get(x.get('severity', 'low').lower(), 3)
        )
        
        for finding in sorted_findings[:50]:  # Limit to first 50 findings
            severity = finding.get('severity', 'Low').lower()
            table_html += f"""
            <tr>
                <td class="severity-{severity}">{finding.get('severity', 'Low')}</td>
                <td>{finding.get('type', 'Unknown')}</td>
                <td>{finding.get('source', 'Unknown')}</td>
                <td>{finding.get('description', 'No description available')}</td>
            </tr>
            """
        
        if len(self.report_data['detailed_findings']) > 50:
            table_html += f"""
            <tr>
                <td colspan="4" style="text-align: center; font-style: italic;">
                    ... and {len(self.report_data['detailed_findings']) - 50} more findings. 
                    See detailed reports for complete list.
                </td>
            </tr>
            """
        
        return table_html

    def generate_json_report(self):
        """Generate JSON report"""
        self.generate_executive_summary()
        self.generate_recommendations()
        return json.dumps(self.report_data, indent=2)

    def save_report(self):
        """Save report in specified format"""
        if self.format.lower() == 'html':
            html_content = self.generate_html_report()
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
        elif self.format.lower() == 'json':
            json_content = self.generate_json_report()
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(json_content)
        else:
            raise ValueError(f"Unsupported format: {self.format}")
        
        print(f"Security report saved to: {self.output_file}")

def main():
    parser = argparse.ArgumentParser(description="Generate comprehensive security report")
    parser.add_argument("--input", required=True, help="Input directory with security test results")
    parser.add_argument("--output", required=True, help="Output file path")
    parser.add_argument("--format", choices=['html', 'json'], default='html', help="Report format")
    
    args = parser.parse_args()
    
    try:
        generator = SecurityReportGenerator(args.input, args.output, args.format)
        generator.load_security_data()
        generator.save_report()
        
        print(f"✅ Security report generated successfully!")
        print(f"📄 Report: {args.output}")
        print(f"📊 Total vulnerabilities: {generator.report_data['vulnerability_summary']['total']}")
        
    except Exception as e:
        print(f"❌ Error generating security report: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()