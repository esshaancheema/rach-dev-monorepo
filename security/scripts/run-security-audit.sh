#!/bin/bash

# Comprehensive Security Audit Script for Zoptal Platform
# Performs automated security scanning, vulnerability assessment, and compliance checks

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECURITY_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$(dirname "$SECURITY_DIR")")"
REPORTS_DIR="$SECURITY_DIR/reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
AUDIT_ID="security_audit_$TIMESTAMP"

# Default settings
ENVIRONMENT="development"
TARGET_URL="http://localhost:3000"
API_URL="http://localhost:3001"
COMPREHENSIVE_SCAN=false
QUIET_MODE=false
SKIP_INFRASTRUCTURE=false
SKIP_APPLICATION=false
SKIP_DEPENDENCIES=false
OUTPUT_FORMAT="html,json"

# Security tools configuration
TOOLS_AVAILABLE=()
OWASP_ZAP_AVAILABLE=false
NUCLEI_AVAILABLE=false
DOCKER_AVAILABLE=false
SONAR_AVAILABLE=false

# Security test results
declare -A SCAN_RESULTS
TOTAL_VULNERABILITIES=0
CRITICAL_VULNERABILITIES=0
HIGH_VULNERABILITIES=0
MEDIUM_VULNERABILITIES=0
LOW_VULNERABILITIES=0

# Logging functions
log() {
    if [[ "$QUIET_MODE" != "true" ]]; then
        echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$REPORTS_DIR/${AUDIT_ID}.log"
    fi
}

log_info() {
    log "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    log "${GREEN}✅ $1${NC}"
}

log_warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    log "${RED}❌ $1${NC}"
}

log_header() {
    log "\n${PURPLE}=== $1 ===${NC}"
}

log_critical() {
    log "${RED}🚨 CRITICAL: $1${NC}"
}

# Help function
show_help() {
    cat << EOF
Security Audit Script for Zoptal Platform

Usage: $0 [OPTIONS]

Options:
  --environment ENV       Target environment (development|staging|production) [default: development]
  --target-url URL        Main application URL [default: http://localhost:3000]
  --api-url URL          API base URL [default: http://localhost:3001]
  --comprehensive        Run comprehensive security audit (slower but thorough)
  --quiet                Suppress verbose output
  --skip-infrastructure  Skip infrastructure security tests
  --skip-application     Skip application security tests
  --skip-dependencies    Skip dependency vulnerability scanning
  --output-format FORMAT Output format (html,json,pdf,sarif) [default: html,json]
  --help                 Show this help message

Security Test Categories:
  - OWASP Top 10 vulnerability testing
  - Authentication and authorization security
  - API security assessment
  - Input validation and injection testing
  - Infrastructure security scanning
  - Dependency vulnerability analysis
  - Business logic security testing

Examples:
  $0                                          # Basic security audit
  $0 --comprehensive --environment staging    # Comprehensive audit on staging
  $0 --target-url https://app.zoptal.com     # Audit production application
  $0 --skip-infrastructure --quiet           # Quick application-only audit

Environment Variables:
  SECURITY_API_KEY      API key for authenticated scanning
  SECURITY_USER_EMAIL   Test user email for authenticated tests
  SECURITY_USER_PASS    Test user password for authenticated tests
  ZAP_API_KEY          OWASP ZAP API key
  NUCLEI_TEMPLATES_DIR Custom Nuclei templates directory

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --target-url)
                TARGET_URL="$2"
                shift 2
                ;;
            --api-url)
                API_URL="$2"
                shift 2
                ;;
            --comprehensive)
                COMPREHENSIVE_SCAN=true
                shift
                ;;
            --quiet)
                QUIET_MODE=true
                shift
                ;;
            --skip-infrastructure)
                SKIP_INFRASTRUCTURE=true
                shift
                ;;
            --skip-application)
                SKIP_APPLICATION=true
                shift
                ;;
            --skip-dependencies)
                SKIP_DEPENDENCIES=true
                shift
                ;;
            --output-format)
                OUTPUT_FORMAT="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Check available security tools
check_security_tools() {
    log_header "Checking Security Tools Availability"
    
    # Check OWASP ZAP
    if command -v zap-cli &> /dev/null || [[ -f "/Applications/OWASP ZAP.app/Contents/Java/zap-2.12.0.jar" ]]; then
        OWASP_ZAP_AVAILABLE=true
        TOOLS_AVAILABLE+=("zap")
        log_success "OWASP ZAP is available"
    else
        log_warning "OWASP ZAP not found - web application scanning will be limited"
    fi
    
    # Check Nuclei
    if command -v nuclei &> /dev/null; then
        NUCLEI_AVAILABLE=true
        TOOLS_AVAILABLE+=("nuclei")
        log_success "Nuclei is available"
    else
        log_warning "Nuclei not found - vulnerability template scanning will be skipped"
    fi
    
    # Check Docker
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        DOCKER_AVAILABLE=true
        TOOLS_AVAILABLE+=("docker")
        log_success "Docker is available"
    else
        log_warning "Docker not available - container security scanning will be limited"
    fi
    
    # Check SonarQube CLI
    if command -v sonar-scanner &> /dev/null; then
        SONAR_AVAILABLE=true
        TOOLS_AVAILABLE+=("sonar")
        log_success "SonarQube Scanner is available"
    else
        log_warning "SonarQube Scanner not found - SAST analysis will be limited"
    fi
    
    # Check Node.js and npm for dependency scanning
    if command -v npm &> /dev/null; then
        TOOLS_AVAILABLE+=("npm")
        log_success "npm is available for dependency scanning"
    fi
    
    # Check Python and pip for Python-based tools
    if command -v python3 &> /dev/null && command -v pip3 &> /dev/null; then
        TOOLS_AVAILABLE+=("python")
        log_success "Python is available for security scripts"
    fi
    
    if [[ ${#TOOLS_AVAILABLE[@]} -eq 0 ]]; then
        log_error "No security tools available. Please install OWASP ZAP, Nuclei, or Docker."
        exit 1
    fi
    
    log_info "Available tools: ${TOOLS_AVAILABLE[*]}"
}

# Setup audit environment
setup_audit_environment() {
    log_header "Setting Up Security Audit Environment"
    
    # Create reports directory
    mkdir -p "$REPORTS_DIR"
    mkdir -p "$REPORTS_DIR/$AUDIT_ID"
    
    # Set environment variables
    export SECURITY_AUDIT_ID="$AUDIT_ID"
    export SECURITY_TARGET_URL="$TARGET_URL"
    export SECURITY_API_URL="$API_URL"
    export SECURITY_ENVIRONMENT="$ENVIRONMENT"
    
    # Create audit configuration
    cat > "$REPORTS_DIR/$AUDIT_ID/audit-config.json" << EOF
{
  "auditId": "$AUDIT_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "targetUrl": "$TARGET_URL",
  "apiUrl": "$API_URL",
  "comprehensive": $COMPREHENSIVE_SCAN,
  "tools": [$(printf '"%s",' "${TOOLS_AVAILABLE[@]}" | sed 's/,$//')]
}
EOF
    
    log_success "Audit environment setup completed"
    log_info "Audit ID: $AUDIT_ID"
    log_info "Target URL: $TARGET_URL"
    log_info "API URL: $API_URL"
    log_info "Environment: $ENVIRONMENT"
}

# Run dependency vulnerability scanning
run_dependency_scan() {
    if [[ "$SKIP_DEPENDENCIES" == "true" ]]; then
        return 0
    fi
    
    log_header "Running Dependency Vulnerability Scan"
    
    local scan_result=0
    local vulnerabilities_found=0
    
    # npm audit for Node.js dependencies
    if command -v npm &> /dev/null; then
        log_info "Running npm audit for JavaScript dependencies..."
        
        cd "$PROJECT_ROOT" || exit 1
        
        # Run npm audit and capture results
        if npm audit --json > "$REPORTS_DIR/$AUDIT_ID/npm-audit.json" 2>/dev/null; then
            vulnerabilities_found=$(jq -r '.metadata.vulnerabilities.total // 0' "$REPORTS_DIR/$AUDIT_ID/npm-audit.json")
            
            if [[ $vulnerabilities_found -gt 0 ]]; then
                log_warning "Found $vulnerabilities_found npm vulnerabilities"
                scan_result=1
                
                # Extract vulnerability details
                jq -r '.vulnerabilities | to_entries[] | select(.value.severity) | "\(.value.severity): \(.key) - \(.value.title)"' \
                    "$REPORTS_DIR/$AUDIT_ID/npm-audit.json" > "$REPORTS_DIR/$AUDIT_ID/npm-vulnerabilities.txt" 2>/dev/null || true
            else
                log_success "No npm vulnerabilities found"
            fi
        else
            log_warning "npm audit failed or no package.json found"
        fi
    fi
    
    # Docker image vulnerability scanning
    if [[ "$DOCKER_AVAILABLE" == "true" ]]; then
        log_info "Running Docker image vulnerability scan..."
        
        # Scan main application images
        local images=("zoptal-web" "zoptal-api" "zoptal-auth" "zoptal-ai")
        
        for image in "${images[@]}"; do
            if docker image inspect "$image:latest" &> /dev/null; then
                log_info "Scanning Docker image: $image"
                
                # Use docker scout if available, otherwise use basic inspection
                if command -v docker-scout &> /dev/null; then
                    docker scout cves "$image:latest" --format json > "$REPORTS_DIR/$AUDIT_ID/docker-${image}-scan.json" 2>/dev/null || true
                else
                    # Basic image analysis
                    docker history "$image:latest" --no-trunc --format "table {{.CreatedBy}}" > "$REPORTS_DIR/$AUDIT_ID/docker-${image}-history.txt" 2>/dev/null || true
                fi
            fi
        done
        
        log_success "Docker image scanning completed"
    fi
    
    # Python dependency scanning (if Python projects exist)
    if [[ -f "$PROJECT_ROOT/requirements.txt" ]] && command -v pip3 &> /dev/null; then
        log_info "Running Python dependency vulnerability scan..."
        
        # Install and run safety
        pip3 install --quiet safety 2>/dev/null || true
        
        if command -v safety &> /dev/null; then
            safety check --json --file "$PROJECT_ROOT/requirements.txt" > "$REPORTS_DIR/$AUDIT_ID/python-safety.json" 2>/dev/null || true
        fi
    fi
    
    SCAN_RESULTS["dependency"]=$scan_result
    log_success "Dependency vulnerability scan completed"
}

# Run OWASP ZAP security scan
run_zap_scan() {
    if [[ "$OWASP_ZAP_AVAILABLE" != "true" ]] || [[ "$SKIP_APPLICATION" == "true" ]]; then
        return 0
    fi
    
    log_header "Running OWASP ZAP Security Scan"
    
    local zap_port=8090
    local zap_pid=""
    
    # Start ZAP daemon
    log_info "Starting OWASP ZAP daemon..."
    
    if command -v zap.sh &> /dev/null; then
        zap.sh -daemon -port $zap_port -config api.addrs.addr.name=* -config api.addrs.addr.regex=true &
        zap_pid=$!
    elif [[ -f "/Applications/OWASP ZAP.app/Contents/Java/zap-2.12.0.jar" ]]; then
        java -Xmx4g -jar "/Applications/OWASP ZAP.app/Contents/Java/zap-2.12.0.jar" -daemon -port $zap_port &
        zap_pid=$!
    else
        log_error "Cannot start OWASP ZAP"
        return 1
    fi
    
    # Wait for ZAP to start
    sleep 30
    
    # Check if ZAP is running
    if ! curl -s "http://localhost:$zap_port" > /dev/null; then
        log_error "OWASP ZAP failed to start"
        [[ -n "$zap_pid" ]] && kill "$zap_pid" 2>/dev/null || true
        return 1
    fi
    
    log_success "OWASP ZAP daemon started"
    
    # Configure ZAP for authenticated scanning if credentials available
    if [[ -n "${SECURITY_USER_EMAIL:-}" ]] && [[ -n "${SECURITY_USER_PASS:-}" ]]; then
        log_info "Configuring authenticated scanning..."
        
        # Set up authentication
        curl -s "http://localhost:$zap_port/JSON/authentication/action/setAuthenticationMethod/" \
            -d "contextId=0&authMethodName=formBasedAuthentication&authMethodConfigParams=loginUrl%3D${API_URL}%2Fauth%2Flogin%26loginRequestData%3Demail%253D%257Busername%257D%2526password%253D%257Bpassword%257D" || true
    fi
    
    # Spider the application
    log_info "Spidering application: $TARGET_URL"
    spider_id=$(curl -s "http://localhost:$zap_port/JSON/spider/action/scan/?url=$TARGET_URL" | jq -r '.scan')
    
    # Wait for spider to complete
    while true; do
        spider_status=$(curl -s "http://localhost:$zap_port/JSON/spider/view/status/?scanId=$spider_id" | jq -r '.status')
        if [[ "$spider_status" == "100" ]]; then
            break
        fi
        sleep 5
    done
    
    log_success "Spidering completed"
    
    # Run active security scan
    log_info "Running active security scan..."
    scan_id=$(curl -s "http://localhost:$zap_port/JSON/ascan/action/scan/?url=$TARGET_URL" | jq -r '.scan')
    
    # Wait for active scan to complete
    while true; do
        scan_status=$(curl -s "http://localhost:$zap_port/JSON/ascan/view/status/?scanId=$scan_id" | jq -r '.status')
        if [[ "$scan_status" == "100" ]]; then
            break
        fi
        log_info "Active scan progress: $scan_status%"
        sleep 10
    done
    
    log_success "Active security scan completed"
    
    # Generate reports
    log_info "Generating ZAP reports..."
    
    # HTML report
    curl -s "http://localhost:$zap_port/OTHER/core/other/htmlreport/" > "$REPORTS_DIR/$AUDIT_ID/zap-report.html"
    
    # JSON report
    curl -s "http://localhost:$zap_port/JSON/core/view/alerts/" > "$REPORTS_DIR/$AUDIT_ID/zap-alerts.json"
    
    # XML report
    curl -s "http://localhost:$zap_port/OTHER/core/other/xmlreport/" > "$REPORTS_DIR/$AUDIT_ID/zap-report.xml"
    
    # Count vulnerabilities
    local zap_high=$(curl -s "http://localhost:$zap_port/JSON/core/view/alertsSummary/" | jq -r '.alertsSummary.High // 0')
    local zap_medium=$(curl -s "http://localhost:$zap_port/JSON/core/view/alertsSummary/" | jq -r '.alertsSummary.Medium // 0')
    local zap_low=$(curl -s "http://localhost:$zap_port/JSON/core/view/alertsSummary/" | jq -r '.alertsSummary.Low // 0')
    
    HIGH_VULNERABILITIES=$((HIGH_VULNERABILITIES + zap_high))
    MEDIUM_VULNERABILITIES=$((MEDIUM_VULNERABILITIES + zap_medium))
    LOW_VULNERABILITIES=$((LOW_VULNERABILITIES + zap_low))
    
    # Stop ZAP
    curl -s "http://localhost:$zap_port/JSON/core/action/shutdown/"
    [[ -n "$zap_pid" ]] && kill "$zap_pid" 2>/dev/null || true
    
    SCAN_RESULTS["zap"]=$((zap_high > 0 ? 1 : 0))
    log_success "OWASP ZAP scan completed: High=$zap_high, Medium=$zap_medium, Low=$zap_low"
}

# Run Nuclei vulnerability scan
run_nuclei_scan() {
    if [[ "$NUCLEI_AVAILABLE" != "true" ]] || [[ "$SKIP_APPLICATION" == "true" ]]; then
        return 0
    fi
    
    log_header "Running Nuclei Vulnerability Scan"
    
    local nuclei_args=()
    
    # Basic scan arguments
    nuclei_args+=("-u" "$TARGET_URL")
    nuclei_args+=("-o" "$REPORTS_DIR/$AUDIT_ID/nuclei-results.txt")
    nuclei_args+=("-json-export" "$REPORTS_DIR/$AUDIT_ID/nuclei-results.json")
    
    # Comprehensive scan options
    if [[ "$COMPREHENSIVE_SCAN" == "true" ]]; then
        nuclei_args+=("-t" "cves,vulnerabilities,exposures,misconfiguration")
        nuclei_args+=("-severity" "critical,high,medium,low")
    else
        nucleti_args+=("-t" "cves,exposures")
        nuclei_args+=("-severity" "critical,high")
    fi
    
    # Custom templates if available
    if [[ -n "${NUCLEI_TEMPLATES_DIR:-}" ]] && [[ -d "$NUCLEI_TEMPLATES_DIR" ]]; then
        nuclei_args+=("-t" "$NUCLEI_TEMPLATES_DIR")
    fi
    
    log_info "Running Nuclei scan with templates..."
    
    # Run Nuclei scan
    if nuclei "${nuclei_args[@]}" 2>&1 | tee "$REPORTS_DIR/$AUDIT_ID/nuclei-output.log"; then
        # Count vulnerabilities from JSON output
        if [[ -f "$REPORTS_DIR/$AUDIT_ID/nuclei-results.json" ]]; then
            local nuclei_critical=$(jq -r '[.[] | select(.info.severity == "critical")] | length' "$REPORTS_DIR/$AUDIT_ID/nuclei-results.json" 2>/dev/null || echo "0")
            local nuclei_high=$(jq -r '[.[] | select(.info.severity == "high")] | length' "$REPORTS_DIR/$AUDIT_ID/nuclei-results.json" 2>/dev/null || echo "0")
            local nuclei_medium=$(jq -r '[.[] | select(.info.severity == "medium")] | length' "$REPORTS_DIR/$AUDIT_ID/nuclei-results.json" 2>/dev/null || echo "0")
            local nuclei_low=$(jq -r '[.[] | select(.info.severity == "low")] | length' "$REPORTS_DIR/$AUDIT_ID/nuclei-results.json" 2>/dev/null || echo "0")
            
            CRITICAL_VULNERABILITIES=$((CRITICAL_VULNERABILITIES + nuclei_critical))
            HIGH_VULNERABILITIES=$((HIGH_VULNERABILITIES + nuclei_high))
            MEDIUM_VULNERABILITIES=$((MEDIUM_VULNERABILITIES + nuclei_medium))
            LOW_VULNERABILITIES=$((LOW_VULNERABILITIES + nuclei_low))
            
            log_success "Nuclei scan completed: Critical=$nuclei_critical, High=$nuclei_high, Medium=$nuclei_medium, Low=$nuclei_low"
        fi
        
        SCAN_RESULTS["nuclei"]=0
    else
        log_error "Nuclei scan failed"
        SCAN_RESULTS["nuclei"]=1
    fi
}

# Run custom security tests
run_custom_security_tests() {
    log_header "Running Custom Security Tests"
    
    # API security tests
    if [[ -f "$SECURITY_DIR/scripts/api-security-tests.py" ]]; then
        log_info "Running API security tests..."
        python3 "$SECURITY_DIR/scripts/api-security-tests.py" \
            --target "$API_URL" \
            --output "$REPORTS_DIR/$AUDIT_ID/api-security.json" \
            ${SECURITY_USER_EMAIL:+--email "$SECURITY_USER_EMAIL"} \
            ${SECURITY_USER_PASS:+--password "$SECURITY_USER_PASS"} || true
    fi
    
    # Authentication security tests
    if [[ -f "$SECURITY_DIR/scripts/auth-security-tests.js" ]]; then
        log_info "Running authentication security tests..."
        cd "$SECURITY_DIR"
        node scripts/auth-security-tests.js \
            --api-url "$API_URL" \
            --output "$REPORTS_DIR/$AUDIT_ID/auth-security.json" || true
    fi
    
    # Business logic security tests
    if [[ -f "$SECURITY_DIR/scripts/business-logic-tests.sh" ]]; then
        log_info "Running business logic security tests..."
        bash "$SECURITY_DIR/scripts/business-logic-tests.sh" \
            --target "$TARGET_URL" \
            --api-url "$API_URL" \
            --output-dir "$REPORTS_DIR/$AUDIT_ID" || true
    fi
    
    SCAN_RESULTS["custom"]=0
    log_success "Custom security tests completed"
}

# Run infrastructure security checks
run_infrastructure_security() {
    if [[ "$SKIP_INFRASTRUCTURE" == "true" ]]; then
        return 0
    fi
    
    log_header "Running Infrastructure Security Checks"
    
    # SSL/TLS configuration check
    log_info "Checking SSL/TLS configuration..."
    if command -v testssl.sh &> /dev/null; then
        testssl.sh --jsonfile "$REPORTS_DIR/$AUDIT_ID/ssl-scan.json" "$TARGET_URL" > "$REPORTS_DIR/$AUDIT_ID/ssl-scan.txt" || true
    elif command -v sslscan &> /dev/null; then
        sslscan --xml="$REPORTS_DIR/$AUDIT_ID/ssl-scan.xml" "$TARGET_URL" > "$REPORTS_DIR/$AUDIT_ID/ssl-scan.txt" || true
    else
        # Basic SSL check with openssl
        echo "Checking SSL certificate..." > "$REPORTS_DIR/$AUDIT_ID/ssl-basic-check.txt"
        echo | openssl s_client -servername "${TARGET_URL#*://}" -connect "${TARGET_URL#*://}:443" 2>/dev/null | \
            openssl x509 -noout -text >> "$REPORTS_DIR/$AUDIT_ID/ssl-basic-check.txt" 2>/dev/null || true
    fi
    
    # HTTP security headers check
    log_info "Checking HTTP security headers..."
    curl -I "$TARGET_URL" > "$REPORTS_DIR/$AUDIT_ID/security-headers.txt" 2>/dev/null || true
    
    # Check for security headers
    cat > "$REPORTS_DIR/$AUDIT_ID/security-headers-analysis.txt" << EOF
Security Headers Analysis for $TARGET_URL
$(date)

Expected Security Headers:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- X-XSS-Protection
- Referrer-Policy
- Feature-Policy/Permissions-Policy

Found Headers:
$(grep -E "(Content-Security-Policy|X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security|X-XSS-Protection|Referrer-Policy|Feature-Policy|Permissions-Policy)" "$REPORTS_DIR/$AUDIT_ID/security-headers.txt" || echo "No security headers found")
EOF
    
    # Kubernetes security check (if applicable)
    if command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null; then
        log_info "Running Kubernetes security checks..."
        
        # Check for security policies
        kubectl get networkpolicies --all-namespaces > "$REPORTS_DIR/$AUDIT_ID/k8s-network-policies.txt" 2>/dev/null || true
        kubectl get podsecuritypolicies > "$REPORTS_DIR/$AUDIT_ID/k8s-pod-security-policies.txt" 2>/dev/null || true
        
        # Check RBAC configuration
        kubectl get clusterroles,clusterrolebindings > "$REPORTS_DIR/$AUDIT_ID/k8s-rbac.txt" 2>/dev/null || true
    fi
    
    SCAN_RESULTS["infrastructure"]=0
    log_success "Infrastructure security checks completed"
}

# Generate security report
generate_security_report() {
    log_header "Generating Security Report"
    
    # Calculate total vulnerabilities
    TOTAL_VULNERABILITIES=$((CRITICAL_VULNERABILITIES + HIGH_VULNERABILITIES + MEDIUM_VULNERABILITIES + LOW_VULNERABILITIES))
    
    # Create summary JSON
    cat > "$REPORTS_DIR/$AUDIT_ID/security-summary.json" << EOF
{
  "auditId": "$AUDIT_ID",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "targetUrl": "$TARGET_URL",
  "apiUrl": "$API_URL",
  "scanResults": {
$(printf '    "%s": %s,\n' "${!SCAN_RESULTS[@]}" "${SCAN_RESULTS[@]}" | sed '$ s/,$//')
  },
  "vulnerabilities": {
    "total": $TOTAL_VULNERABILITIES,
    "critical": $CRITICAL_VULNERABILITIES,
    "high": $HIGH_VULNERABILITIES,
    "medium": $MEDIUM_VULNERABILITIES,
    "low": $LOW_VULNERABILITIES
  },
  "toolsUsed": [$(printf '"%s",' "${TOOLS_AVAILABLE[@]}" | sed 's/,$//')]
}
EOF
    
    # Generate HTML report if requested
    if [[ "$OUTPUT_FORMAT" == *"html"* ]]; then
        log_info "Generating HTML security report..."
        if [[ -f "$SECURITY_DIR/scripts/generate-security-report.py" ]]; then
            python3 "$SECURITY_DIR/scripts/generate-security-report.py" \
                --input "$REPORTS_DIR/$AUDIT_ID" \
                --output "$REPORTS_DIR/$AUDIT_ID/security-report.html" \
                --format html || true
        fi
    fi
    
    # Create executive summary
    cat > "$REPORTS_DIR/$AUDIT_ID/executive-summary.md" << EOF
# Security Audit Executive Summary

**Audit ID:** $AUDIT_ID  
**Date:** $(date)  
**Environment:** $ENVIRONMENT  
**Target:** $TARGET_URL  

## Summary

A comprehensive security audit was conducted on the Zoptal platform using automated security scanning tools and custom security tests.

## Vulnerability Summary

| Severity | Count |
|----------|-------|
| Critical | $CRITICAL_VULNERABILITIES |
| High     | $HIGH_VULNERABILITIES |
| Medium   | $MEDIUM_VULNERABILITIES |
| Low      | $LOW_VULNERABILITIES |
| **Total** | **$TOTAL_VULNERABILITIES** |

## Risk Assessment

$(if [[ $CRITICAL_VULNERABILITIES -gt 0 ]]; then
    echo "🚨 **CRITICAL RISK**: $CRITICAL_VULNERABILITIES critical vulnerabilities found. Immediate action required."
elif [[ $HIGH_VULNERABILITIES -gt 0 ]]; then
    echo "⚠️ **HIGH RISK**: $HIGH_VULNERABILITIES high-severity vulnerabilities found. Action required within 7 days."
elif [[ $MEDIUM_VULNERABILITIES -gt 0 ]]; then
    echo "📋 **MEDIUM RISK**: $MEDIUM_VULNERABILITIES medium-severity vulnerabilities found. Action required within 30 days."
else
    echo "✅ **LOW RISK**: No critical or high-severity vulnerabilities found."
fi)

## Tools Used

$(printf '- %s\n' "${TOOLS_AVAILABLE[@]}")

## Recommendations

1. **Immediate Actions** (for Critical/High severity):
   - Review and remediate all critical and high-severity vulnerabilities
   - Implement additional security controls where needed
   - Conduct penetration testing for manual verification

2. **Short-term Actions** (1-4 weeks):
   - Address medium-severity vulnerabilities
   - Implement security monitoring and alerting
   - Update security policies and procedures

3. **Long-term Actions** (1-3 months):
   - Establish regular security scanning schedule
   - Implement security awareness training
   - Consider third-party security assessment

## Next Steps

1. Review detailed findings in individual scan reports
2. Prioritize remediation based on risk and business impact
3. Schedule follow-up security audit after remediation
4. Implement continuous security monitoring

---
*This report was generated automatically by the Zoptal Security Audit Suite*
EOF
    
    log_success "Security report generated: $REPORTS_DIR/$AUDIT_ID/"
}

# Display audit results
display_audit_results() {
    log_header "Security Audit Results"
    
    echo -e "\n${CYAN}🔒 SECURITY AUDIT COMPLETE 🔒${NC}"
    echo -e "${CYAN}=================================${NC}"
    
    echo -e "\n📊 ${BLUE}Vulnerability Summary:${NC}"
    echo -e "   Critical: ${RED}$CRITICAL_VULNERABILITIES${NC}"
    echo -e "   High:     ${YELLOW}$HIGH_VULNERABILITIES${NC}" 
    echo -e "   Medium:   ${BLUE}$MEDIUM_VULNERABILITIES${NC}"
    echo -e "   Low:      ${GREEN}$LOW_VULNERABILITIES${NC}"
    echo -e "   Total:    ${PURPLE}$TOTAL_VULNERABILITIES${NC}"
    
    echo -e "\n🛠️  ${BLUE}Tools Used:${NC}"
    printf '   - %s\n' "${TOOLS_AVAILABLE[@]}"
    
    echo -e "\n📁 ${BLUE}Reports Location:${NC}"
    echo -e "   $REPORTS_DIR/$AUDIT_ID/"
    
    # Risk assessment
    echo -e "\n⚠️  ${BLUE}Risk Assessment:${NC}"
    if [[ $CRITICAL_VULNERABILITIES -gt 0 ]]; then
        echo -e "   ${RED}CRITICAL RISK - Immediate action required!${NC}"
    elif [[ $HIGH_VULNERABILITIES -gt 0 ]]; then
        echo -e "   ${YELLOW}HIGH RISK - Action required within 7 days${NC}"
    elif [[ $MEDIUM_VULNERABILITIES -gt 0 ]]; then
        echo -e "   ${BLUE}MEDIUM RISK - Action required within 30 days${NC}"
    else
        echo -e "   ${GREEN}LOW RISK - No critical issues found${NC}"
    fi
    
    echo -e "\n📋 ${BLUE}Next Steps:${NC}"
    echo -e "   1. Review detailed reports in: $REPORTS_DIR/$AUDIT_ID/"
    echo -e "   2. Prioritize remediation based on severity"
    echo -e "   3. Run penetration tests for manual verification"
    echo -e "   4. Schedule follow-up audit after fixes"
}

# Main execution function
main() {
    local start_time=$(date +%s)
    
    log_header "Zoptal Platform Security Audit"
    log_info "Starting comprehensive security assessment..."
    
    # Parse arguments
    parse_arguments "$@"
    
    # Setup and checks
    check_security_tools
    setup_audit_environment
    
    # Run security scans
    run_dependency_scan
    run_zap_scan
    run_nuclei_scan
    run_custom_security_tests
    run_infrastructure_security
    
    # Generate reports
    generate_security_report
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf '%02d:%02d:%02d' $((duration/3600)) $((duration%3600/60)) $((duration%60)))
    
    # Display results
    display_audit_results
    
    log_header "Security Audit Complete"
    log_info "Total Duration: $duration_formatted"
    log_info "Audit ID: $AUDIT_ID"
    
    # Return appropriate exit code
    if [[ $CRITICAL_VULNERABILITIES -gt 0 ]]; then
        exit 2  # Critical vulnerabilities found
    elif [[ $HIGH_VULNERABILITIES -gt 0 ]]; then
        exit 1  # High vulnerabilities found
    else
        exit 0  # Success
    fi
}

# Run main function with all arguments
main "$@"