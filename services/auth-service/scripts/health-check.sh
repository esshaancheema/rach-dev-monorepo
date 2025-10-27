#!/bin/bash

# Comprehensive Health Check Script for Zoptal Auth Service
# This script performs deep health checks for all service components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
HEALTH_CHECK_URL="http://localhost:3001/health"
METRICS_URL="http://localhost:3001/metrics"
READY_URL="http://localhost:3001/ready"

# Default values
ENVIRONMENT="development"
TIMEOUT=30
DETAILED=false
CONTINUOUS=false
INTERVAL=60
SLACK_WEBHOOK=""
EMAIL=""
SAVE_REPORT=false

# Health check results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[✓] $1${NC}"
    ((PASSED_CHECKS++))
}

warning() {
    echo -e "${YELLOW}[⚠] $1${NC}"
    ((WARNINGS++))
}

error() {
    echo -e "${RED}[✗] $1${NC}"
    ((FAILED_CHECKS++))
}

check() {
    echo -e "${BLUE}[→] $1${NC}"
    ((TOTAL_CHECKS++))
}

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Perform comprehensive health checks for Zoptal Auth Service

OPTIONS:
    -e, --environment ENV    Target environment (development|staging|production) [default: development]
    -u, --url URL           Base URL for health checks [default: http://localhost:3001]
    -t, --timeout SECONDS   Request timeout in seconds [default: 30]
    -d, --detailed          Show detailed output
    -c, --continuous        Run continuously
    -i, --interval SECONDS  Interval for continuous checks [default: 60]
    -s, --slack-webhook URL Send alerts to Slack webhook
    -m, --email EMAIL       Send alerts to email address
    -r, --save-report       Save health check report to file
    -h, --help              Show this help message

EXAMPLES:
    $0                                      # Basic health check
    $0 --detailed --save-report             # Detailed check with report
    $0 --continuous --interval 30           # Continuous monitoring every 30s
    $0 -e production --slack-webhook URL    # Production check with Slack alerts

HEALTH CHECKS:
    - Service availability and response time
    - Database connectivity and performance
    - Redis connectivity and memory usage
    - External service dependencies
    - Resource utilization (CPU, memory, disk)
    - Security configurations
    - Backup status
    - Performance metrics

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -u|--url)
            HEALTH_CHECK_URL="$2/health"
            METRICS_URL="$2/metrics"
            READY_URL="$2/ready"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        -d|--detailed)
            DETAILED=true
            shift
            ;;
        -c|--continuous)
            CONTINUOUS=true
            shift
            ;;
        -i|--interval)
            INTERVAL="$2"
            shift 2
            ;;
        -s|--slack-webhook)
            SLACK_WEBHOOK="$2"
            shift 2
            ;;
        -m|--email)
            EMAIL="$2"
            shift 2
            ;;
        -r|--save-report)
            SAVE_REPORT=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Health check functions
check_service_availability() {
    check "Service availability"
    
    local start_time=$(date +%s.%N)
    if curl -sf --max-time "$TIMEOUT" "$HEALTH_CHECK_URL" > /dev/null; then
        local end_time=$(date +%s.%N)
        local response_time=$(echo "$end_time - $start_time" | bc)
        local response_time_ms=$(echo "$response_time * 1000" | bc)
        
        success "Service is available (${response_time_ms%.*}ms)"
        
        if [ "$DETAILED" = true ]; then
            echo "    Health endpoint: $HEALTH_CHECK_URL"
            echo "    Response time: ${response_time_ms%.*}ms"
        fi
    else
        error "Service is not available at $HEALTH_CHECK_URL"
    fi
}

check_readiness() {
    check "Service readiness"
    
    if curl -sf --max-time "$TIMEOUT" "$READY_URL" > /dev/null; then
        success "Service is ready to accept traffic"
    else
        error "Service is not ready"
    fi
}

check_database_connectivity() {
    check "Database connectivity"
    
    # Try to get database health from metrics
    local db_health=$(curl -sf --max-time "$TIMEOUT" "$METRICS_URL" 2>/dev/null | grep -o 'database.*healthy' || echo "unknown")
    
    if [[ "$db_health" == *"healthy"* ]]; then
        success "Database is connected and healthy"
    else
        # Fallback: check if database container is running
        if docker ps --format "table {{.Names}}" | grep -q postgres; then
            warning "Database container is running but health status unknown"
        else
            error "Database container is not running"
        fi
    fi
}

check_redis_connectivity() {
    check "Redis connectivity"
    
    # Try to get Redis health from metrics
    local redis_health=$(curl -sf --max-time "$TIMEOUT" "$METRICS_URL" 2>/dev/null | grep -o 'redis.*healthy' || echo "unknown")
    
    if [[ "$redis_health" == *"healthy"* ]]; then
        success "Redis is connected and healthy"
    else
        # Fallback: check if Redis container is running
        if docker ps --format "table {{.Names}}" | grep -q redis; then
            warning "Redis container is running but health status unknown"
        else
            error "Redis container is not running"
        fi
    fi
}

check_external_dependencies() {
    check "External service dependencies"
    
    local deps_ok=true
    
    # Check SendGrid (if configured)
    if [ -n "$SENDGRID_API_KEY" ]; then
        if curl -sf --max-time 10 "https://api.sendgrid.com/v3/user/profile" -H "Authorization: Bearer $SENDGRID_API_KEY" > /dev/null 2>&1; then
            success "SendGrid API is accessible"
        else
            warning "SendGrid API check failed or not configured"
            deps_ok=false
        fi
    fi
    
    # Check basic internet connectivity
    if curl -sf --max-time 10 "https://httpbin.org/status/200" > /dev/null; then
        success "Internet connectivity is working"
    else
        error "Internet connectivity check failed"
        deps_ok=false
    fi
    
    if [ "$deps_ok" = true ]; then
        success "All external dependencies are accessible"
    fi
}

check_resource_utilization() {
    check "Resource utilization"
    
    # Get metrics from the service
    local metrics=$(curl -sf --max-time "$TIMEOUT" "$METRICS_URL" 2>/dev/null)
    
    if [ -n "$metrics" ]; then
        # Parse memory usage
        local memory_usage=$(echo "$metrics" | grep -o 'memory.*heapUsed.*[0-9]*' | grep -o '[0-9]*$' || echo "0")
        local memory_total=$(echo "$metrics" | grep -o 'memory.*heapTotal.*[0-9]*' | grep -o '[0-9]*$' || echo "1")
        
        if [ "$memory_total" -gt 0 ]; then
            local memory_percent=$((memory_usage * 100 / memory_total))
            
            if [ "$memory_percent" -lt 80 ]; then
                success "Memory usage is healthy (${memory_percent}%)"
            elif [ "$memory_percent" -lt 90 ]; then
                warning "Memory usage is high (${memory_percent}%)"
            else
                error "Memory usage is critical (${memory_percent}%)"
            fi
        fi
        
        # Check uptime
        local uptime=$(echo "$metrics" | grep -o '"uptime":[0-9]*' | grep -o '[0-9]*' || echo "0")
        if [ "$uptime" -gt 3600 ]; then
            success "Service uptime is good (${uptime}s)"
        elif [ "$uptime" -gt 300 ]; then
            warning "Service was recently restarted (${uptime}s uptime)"
        else
            error "Service uptime is very low (${uptime}s)"
        fi
    else
        warning "Could not retrieve resource metrics"
    fi
}

check_security_configuration() {
    check "Security configuration"
    
    local security_ok=true
    
    # Check if HTTPS is enforced (in production)
    if [ "$ENVIRONMENT" = "production" ]; then
        if curl -sf --max-time 10 "$HEALTH_CHECK_URL" -H "X-Forwarded-Proto: http" | grep -q "redirect"; then
            success "HTTPS redirection is working"
        else
            warning "HTTPS redirection may not be configured"
            security_ok=false
        fi
    fi
    
    # Check for security headers
    local headers=$(curl -sf --max-time 10 -I "$HEALTH_CHECK_URL" 2>/dev/null)
    
    if echo "$headers" | grep -qi "x-frame-options"; then
        success "X-Frame-Options header is present"
    else
        warning "X-Frame-Options header is missing"
        security_ok=false
    fi
    
    if echo "$headers" | grep -qi "x-content-type-options"; then
        success "X-Content-Type-Options header is present"
    else
        warning "X-Content-Type-Options header is missing"
        security_ok=false
    fi
    
    if [ "$security_ok" = true ]; then
        success "Security configuration looks good"
    fi
}

check_circuit_breakers() {
    check "Circuit breaker status"
    
    local cb_status=$(curl -sf --max-time "$TIMEOUT" "http://localhost:3001/circuit-breaker/status" 2>/dev/null)
    
    if [ -n "$cb_status" ]; then
        local open_breakers=$(echo "$cb_status" | grep -o '"state":"OPEN"' | wc -l)
        local half_open_breakers=$(echo "$cb_status" | grep -o '"state":"HALF_OPEN"' | wc -l)
        
        if [ "$open_breakers" -eq 0 ] && [ "$half_open_breakers" -eq 0 ]; then
            success "All circuit breakers are healthy"
        elif [ "$open_breakers" -gt 0 ]; then
            error "$open_breakers circuit breaker(s) are OPEN"
        elif [ "$half_open_breakers" -gt 0 ]; then
            warning "$half_open_breakers circuit breaker(s) are HALF_OPEN"
        fi
        
        if [ "$DETAILED" = true ]; then
            echo "$cb_status" | jq '.' 2>/dev/null || echo "$cb_status"
        fi
    else
        warning "Could not retrieve circuit breaker status"
    fi
}

check_backup_status() {
    check "Backup status"
    
    local backup_dir="/var/backups/zoptal-auth"
    if [ -d "$backup_dir" ]; then
        local latest_backup=$(ls -t "$backup_dir"/zoptal-auth-backup-*.tar.gz* 2>/dev/null | head -1)
        
        if [ -n "$latest_backup" ]; then
            local backup_age=$(($(date +%s) - $(stat -c %Y "$latest_backup" 2>/dev/null || stat -f %m "$latest_backup")))
            
            if [ "$backup_age" -lt 86400 ]; then  # 24 hours
                success "Recent backup found ($(date -d @$(($(date +%s) - backup_age)) '+%H:%M ago' 2>/dev/null || echo "${backup_age}s ago"))"
            elif [ "$backup_age" -lt 172800 ]; then  # 48 hours
                warning "Backup is older than 24 hours"
            else
                error "No recent backup found (older than 48 hours)"
            fi
        else
            warning "No backup files found"
        fi
    else
        warning "Backup directory not found"
    fi
}

generate_report() {
    local report_file="/tmp/zoptal-auth-health-$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$report_file" << EOF
Zoptal Auth Service Health Check Report
Generated: $(date)
Environment: $ENVIRONMENT
Base URL: $(echo $HEALTH_CHECK_URL | sed 's|/health||')

SUMMARY:
  Total Checks: $TOTAL_CHECKS
  Passed: $PASSED_CHECKS
  Failed: $FAILED_CHECKS
  Warnings: $WARNINGS
  Success Rate: $(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))%

STATUS: $([ $FAILED_CHECKS -eq 0 ] && echo "HEALTHY" || echo "UNHEALTHY")
EOF
    
    if [ "$SAVE_REPORT" = true ]; then
        echo "$report_file"
    fi
}

send_alerts() {
    local status_emoji="✅"
    local status_text="HEALTHY"
    
    if [ "$FAILED_CHECKS" -gt 0 ]; then
        status_emoji="❌"
        status_text="UNHEALTHY"
    elif [ "$WARNINGS" -gt 0 ]; then
        status_emoji="⚠️"
        status_text="WARNING"
    fi
    
    local message="Zoptal Auth Service Health Check $status_emoji
Environment: $ENVIRONMENT
Status: $status_text
Passed: $PASSED_CHECKS, Failed: $FAILED_CHECKS, Warnings: $WARNINGS
Time: $(date)"
    
    # Send Slack alert
    if [ -n "$SLACK_WEBHOOK" ] && [ "$FAILED_CHECKS" -gt 0 ]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"$message\"}" > /dev/null 2>&1
    fi
    
    # Send email alert
    if [ -n "$EMAIL" ] && [ "$FAILED_CHECKS" -gt 0 ]; then
        echo "$message" | mail -s "Zoptal Auth Service Health Alert" "$EMAIL" 2>/dev/null || true
    fi
}

perform_health_check() {
    log "Starting health check for $ENVIRONMENT environment..."
    
    # Reset counters
    TOTAL_CHECKS=0
    PASSED_CHECKS=0
    FAILED_CHECKS=0
    WARNINGS=0
    
    # Run all health checks
    check_service_availability
    check_readiness
    check_database_connectivity
    check_redis_connectivity
    check_external_dependencies
    check_resource_utilization
    check_security_configuration
    check_circuit_breakers
    check_backup_status
    
    # Generate summary
    echo ""
    log "Health check summary:"
    echo "  Total checks: $TOTAL_CHECKS"
    echo "  Passed: $PASSED_CHECKS"
    echo "  Failed: $FAILED_CHECKS"
    echo "  Warnings: $WARNINGS"
    echo "  Success rate: $(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))%"
    
    local overall_status="HEALTHY"
    if [ "$FAILED_CHECKS" -gt 0 ]; then
        overall_status="UNHEALTHY"
        echo -e "  Overall status: ${RED}$overall_status${NC}"
    elif [ "$WARNINGS" -gt 0 ]; then
        overall_status="WARNING"
        echo -e "  Overall status: ${YELLOW}$overall_status${NC}"
    else
        echo -e "  Overall status: ${GREEN}$overall_status${NC}"
    fi
    
    # Generate report if requested
    if [ "$SAVE_REPORT" = true ]; then
        local report_file=$(generate_report)
        success "Health check report saved to $report_file"
    fi
    
    # Send alerts if configured
    send_alerts
    
    return $FAILED_CHECKS
}

# Main execution
if [ "$CONTINUOUS" = true ]; then
    log "Starting continuous health monitoring (interval: ${INTERVAL}s)"
    log "Press Ctrl+C to stop"
    
    while true; do
        perform_health_check
        echo ""
        sleep "$INTERVAL"
    done
else
    perform_health_check
    exit $FAILED_CHECKS
fi