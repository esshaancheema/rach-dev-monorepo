#!/bin/bash

# Cache Management Script for Zoptal Platform
# This script provides comprehensive cache management operations

set -euo pipefail

# Configuration
NAMESPACE="zoptal-production"
REDIS_SERVICE="redis-cluster-client"
NGINX_SERVICE="nginx-cache-service"
LOG_FILE="/var/log/cache-manager.log"
KUBECTL_TIMEOUT="30s"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
    log "=== $1 ==="
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    log "SUCCESS: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log "WARNING: $1"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    log "ERROR: $1"
}

print_status() {
    echo -e "${BLUE}→ $1${NC}"
    log "STATUS: $1"
}

# Check dependencies
check_dependencies() {
    print_header "Checking Dependencies"
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v redis-cli &> /dev/null; then
        print_warning "redis-cli not found locally, will use kubectl exec"
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_error "Namespace $NAMESPACE not found"
        exit 1
    fi
    
    print_success "Dependencies check completed"
}

# Redis cache operations
redis_info() {
    print_header "Redis Cache Information"
    
    local redis_pod=$(kubectl get pods -n "$NAMESPACE" -l app=redis-cluster -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [[ -z "$redis_pod" ]]; then
        print_error "No Redis pods found"
        return 1
    fi
    
    print_status "Getting Redis information from pod: $redis_pod"
    
    # Basic info
    echo -e "\n${GREEN}Memory Usage:${NC}"
    kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning INFO memory | grep -E "(used_memory_human|used_memory_peak_human|maxmemory_human)"
    
    echo -e "\n${GREEN}Keyspace:${NC}"
    kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning INFO keyspace
    
    echo -e "\n${GREEN}Stats:${NC}"
    kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning INFO stats | grep -E "(keyspace_hits|keyspace_misses|evicted_keys|expired_keys)"
    
    echo -e "\n${GREEN}Clients:${NC}"
    kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning INFO clients
    
    echo -e "\n${GREEN}Replication:${NC}"
    kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning INFO replication
}

redis_flush() {
    local db_num=${1:-"all"}
    print_header "Flushing Redis Cache"
    
    local redis_pod=$(kubectl get pods -n "$NAMESPACE" -l app=redis-cluster -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [[ -z "$redis_pod" ]]; then
        print_error "No Redis pods found"
        return 1
    fi
    
    if [[ "$db_num" == "all" ]]; then
        print_warning "This will flush ALL Redis databases. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning FLUSHALL
            print_success "All Redis databases flushed"
        else
            print_status "Operation cancelled"
        fi
    else
        kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning -n "$db_num" FLUSHDB
        print_success "Redis database $db_num flushed"
    fi
}

redis_keys() {
    local pattern=${1:-"*"}
    local limit=${2:-100}
    print_header "Redis Keys Analysis"
    
    local redis_pod=$(kubectl get pods -n "$NAMESPACE" -l app=redis-cluster -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [[ -z "$redis_pod" ]]; then
        print_error "No Redis pods found"
        return 1
    fi
    
    print_status "Scanning keys with pattern: $pattern (limit: $limit)"
    
    # Use SCAN instead of KEYS for better performance
    kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning --scan --pattern "$pattern" | head -n "$limit"
    
    echo -e "\n${GREEN}Key count by pattern:${NC}"
    kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning --scan --pattern "$pattern" | wc -l
}

redis_memory() {
    print_header "Redis Memory Analysis"
    
    local redis_pod=$(kubectl get pods -n "$NAMESPACE" -l app=redis-cluster -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [[ -z "$redis_pod" ]]; then
        print_error "No Redis pods found"
        return 1
    fi
    
    print_status "Analyzing Redis memory usage..."
    
    # Memory usage by database
    for db in {0..15}; do
        local keys=$(kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning -n "$db" DBSIZE 2>/dev/null || echo "0")
        if [[ "$keys" -gt 0 ]]; then
            echo -e "Database $db: $keys keys"
        fi
    done
    
    # Top memory consuming keys (requires Redis 4.0+)
    echo -e "\n${GREEN}Memory usage by key pattern:${NC}"
    kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning --bigkeys || print_warning "BIGKEYS command failed (Redis version might not support it)"
}

# Nginx cache operations
nginx_status() {
    print_header "Nginx Cache Status"
    
    local nginx_pod=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-cache -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [[ -z "$nginx_pod" ]]; then
        print_error "No Nginx cache pods found"
        return 1
    fi
    
    print_status "Getting Nginx status from pod: $nginx_pod"
    
    # Get stub_status
    kubectl exec -n "$NAMESPACE" "$nginx_pod" -- curl -s http://localhost:8080/status || print_error "Failed to get Nginx status"
    
    # Check cache directories
    echo -e "\n${GREEN}Cache Directory Usage:${NC}"
    kubectl exec -n "$NAMESPACE" "$nginx_pod" -- du -sh /var/cache/nginx/* 2>/dev/null || print_warning "Cache directories not found"
}

nginx_purge() {
    local cache_type=${1:-"all"}
    local url_pattern=${2:-""}
    
    print_header "Purging Nginx Cache"
    
    local nginx_pod=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-cache -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [[ -z "$nginx_pod" ]]; then
        print_error "No Nginx cache pods found"
        return 1
    fi
    
    case "$cache_type" in
        "static")
            print_status "Purging static cache..."
            kubectl exec -n "$NAMESPACE" "$nginx_pod" -- find /var/cache/nginx/static -type f -delete 2>/dev/null || true
            ;;
        "api")
            print_status "Purging API cache..."
            kubectl exec -n "$NAMESPACE" "$nginx_pod" -- find /var/cache/nginx/api -type f -delete 2>/dev/null || true
            ;;
        "images")
            print_status "Purging image cache..."
            kubectl exec -n "$NAMESPACE" "$nginx_pod" -- find /var/cache/nginx/images -type f -delete 2>/dev/null || true
            ;;
        "all")
            print_warning "This will purge ALL Nginx caches. Are you sure? (y/N)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                print_status "Purging all caches..."
                kubectl exec -n "$NAMESPACE" "$nginx_pod" -- find /var/cache/nginx -type f -delete 2>/dev/null || true
                print_success "All Nginx caches purged"
            else
                print_status "Operation cancelled"
            fi
            ;;
        *)
            print_error "Invalid cache type. Use: static, api, images, or all"
            return 1
            ;;
    esac
    
    # Reload Nginx to clear in-memory cache
    kubectl exec -n "$NAMESPACE" "$nginx_pod" -- nginx -s reload
    print_success "Nginx cache purged and reloaded"
}

# Performance monitoring
monitor_cache() {
    print_header "Cache Performance Monitoring"
    
    local duration=${1:-60}
    print_status "Monitoring cache performance for $duration seconds..."
    
    # Monitor Redis
    local redis_pod=$(kubectl get pods -n "$NAMESPACE" -l app=redis-cluster -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [[ -n "$redis_pod" ]]; then
        echo -e "\n${GREEN}Redis Performance (every 5 seconds):${NC}"
        for ((i=0; i<duration; i+=5)); do
            echo -n "[$(date +'%H:%M:%S')] "
            kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning INFO stats | grep -E "(instantaneous_ops_per_sec|keyspace_hits|keyspace_misses)" | tr '\n' ' '
            echo ""
            sleep 5
        done
    fi
    
    # Monitor Nginx
    local nginx_pod=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-cache -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [[ -n "$nginx_pod" ]]; then
        echo -e "\n${GREEN}Nginx Performance:${NC}"
        kubectl exec -n "$NAMESPACE" "$nginx_pod" -- curl -s http://localhost:8080/status
    fi
}

# Cache warming
warm_cache() {
    print_header "Cache Warming"
    
    local endpoints=(
        "/api/projects"
        "/api/auth/me"
        "/api/notifications"
        "/api/billing/subscription"
    )
    
    local nginx_service_url="http://${NGINX_SERVICE}"
    
    print_status "Warming up cache with common endpoints..."
    
    for endpoint in "${endpoints[@]}"; do
        print_status "Warming: $endpoint"
        kubectl run cache-warmer-$(date +%s) \
            --image=curlimages/curl:latest \
            --rm -i --restart=Never \
            --namespace="$NAMESPACE" \
            -- curl -s -o /dev/null -w "HTTP %{http_code} - %{time_total}s\n" \
            "${nginx_service_url}${endpoint}" || print_warning "Failed to warm $endpoint"
    done
    
    print_success "Cache warming completed"
}

# Health check
health_check() {
    print_header "Cache Health Check"
    
    local issues=0
    
    # Check Redis
    print_status "Checking Redis cluster health..."
    local redis_pods=$(kubectl get pods -n "$NAMESPACE" -l app=redis-cluster --no-headers | wc -l)
    local redis_ready=$(kubectl get pods -n "$NAMESPACE" -l app=redis-cluster --field-selector=status.phase=Running --no-headers | wc -l)
    
    echo "Redis pods: $redis_ready/$redis_pods ready"
    
    if [[ "$redis_ready" -lt "$redis_pods" ]]; then
        print_warning "Some Redis pods are not ready"
        ((issues++))
    fi
    
    # Check Nginx
    print_status "Checking Nginx cache health..."
    local nginx_pods=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-cache --no-headers | wc -l)
    local nginx_ready=$(kubectl get pods -n "$NAMESPACE" -l app=nginx-cache --field-selector=status.phase=Running --no-headers | wc -l)
    
    echo "Nginx pods: $nginx_ready/$nginx_pods ready"
    
    if [[ "$nginx_ready" -lt "$nginx_pods" ]]; then
        print_warning "Some Nginx pods are not ready"
        ((issues++))
    fi
    
    # Test connectivity
    print_status "Testing cache connectivity..."
    local redis_pod=$(kubectl get pods -n "$NAMESPACE" -l app=redis-cluster -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    
    if [[ -n "$redis_pod" ]]; then
        if kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning ping | grep -q "PONG"; then
            print_success "Redis connectivity test passed"
        else
            print_error "Redis connectivity test failed"
            ((issues++))
        fi
    fi
    
    # Check cache hit rates
    if [[ -n "$redis_pod" ]]; then
        local hits=$(kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning INFO stats | grep keyspace_hits | cut -d: -f2 | tr -d '\r')
        local misses=$(kubectl exec -n "$NAMESPACE" "$redis_pod" -- redis-cli --no-auth-warning INFO stats | grep keyspace_misses | cut -d: -f2 | tr -d '\r')
        
        if [[ -n "$hits" && -n "$misses" && "$hits" -gt 0 ]]; then
            local total=$((hits + misses))
            local hit_rate=$((hits * 100 / total))
            echo "Redis hit rate: ${hit_rate}%"
            
            if [[ "$hit_rate" -lt 70 ]]; then
                print_warning "Redis hit rate is below 70%"
                ((issues++))
            fi
        fi
    fi
    
    if [[ "$issues" -eq 0 ]]; then
        print_success "All cache health checks passed"
    else
        print_warning "$issues issues found during health check"
    fi
    
    return "$issues"
}

# Display usage
usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Cache Management Commands:
  redis-info                    Show Redis cache information
  redis-flush [db|all]         Flush Redis cache (default: all)
  redis-keys [pattern] [limit] List Redis keys (default: * 100)
  redis-memory                 Analyze Redis memory usage
  
  nginx-status                 Show Nginx cache status
  nginx-purge [type]          Purge Nginx cache (static|api|images|all)
  
  monitor [seconds]           Monitor cache performance (default: 60s)
  warm                        Warm up cache with common requests
  health                      Run comprehensive health check
  
Examples:
  $0 redis-info
  $0 redis-flush all
  $0 redis-keys "user:*" 50
  $0 nginx-purge static
  $0 monitor 120
  $0 warm
  $0 health

EOF
}

# Main script logic
main() {
    if [[ $# -eq 0 ]]; then
        usage
        exit 1
    fi
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Check dependencies
    check_dependencies
    
    case "$1" in
        "redis-info")
            redis_info
            ;;
        "redis-flush")
            redis_flush "${2:-all}"
            ;;
        "redis-keys")
            redis_keys "${2:-*}" "${3:-100}"
            ;;
        "redis-memory")
            redis_memory
            ;;
        "nginx-status")
            nginx_status
            ;;
        "nginx-purge")
            nginx_purge "${2:-all}"
            ;;
        "monitor")
            monitor_cache "${2:-60}"
            ;;
        "warm")
            warm_cache
            ;;
        "health")
            health_check
            ;;
        "help"|"-h"|"--help")
            usage
            ;;
        *)
            print_error "Unknown command: $1"
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"