#!/bin/bash

# Canary Deployment Script for Zoptal Platform
# 
# This script handles canary deployments with automated analysis,
# progressive rollout, and automatic rollback based on metrics.

set -euo pipefail

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
KUBECONFIG_PATH="${KUBECONFIG:-$HOME/.kube/config}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
DEFAULT_NAMESPACE="zoptal-production"
DEFAULT_INITIAL_CANARY_PERCENTAGE=10
DEFAULT_CANARY_INCREMENT=20
DEFAULT_SUCCESS_RATE_THRESHOLD=99.0
DEFAULT_ERROR_RATE_THRESHOLD=1.0
DEFAULT_LATENCY_THRESHOLD=500
DEFAULT_ANALYSIS_DURATION=300  # 5 minutes
DEFAULT_MAX_ROLLOUT_DURATION=3600  # 1 hour

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -s, --service           Service name to deploy (required)"
    echo "  -v, --version           Version/tag to deploy (required)"
    echo "  -i, --initial           Initial canary percentage (default: $DEFAULT_INITIAL_CANARY_PERCENTAGE)"
    echo "  -c, --increment         Canary increment percentage (default: $DEFAULT_CANARY_INCREMENT)"
    echo "  -t, --success-threshold Success rate threshold % (default: $DEFAULT_SUCCESS_RATE_THRESHOLD)"
    echo "  -e, --error-threshold   Error rate threshold % (default: $DEFAULT_ERROR_RATE_THRESHOLD)"
    echo "  -l, --latency-threshold P95 latency threshold ms (default: $DEFAULT_LATENCY_THRESHOLD)"
    echo "  -d, --duration          Analysis duration in seconds (default: $DEFAULT_ANALYSIS_DURATION)"
    echo "  -a, --auto              Enable automatic promotion (default: manual)"
    echo "  -f, --force             Force deployment without confirmation"
    echo "  -r, --rollback          Rollback canary deployment"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -s auth-service -v v1.2.0"
    echo "  $0 -s auth-service -v v1.2.0 -i 5 -c 10 -a"
    echo "  $0 -s auth-service -r"
    exit 1
}

# Parse command line arguments
SERVICE_NAME=""
VERSION=""
INITIAL_CANARY=$DEFAULT_INITIAL_CANARY_PERCENTAGE
CANARY_INCREMENT=$DEFAULT_CANARY_INCREMENT
SUCCESS_THRESHOLD=$DEFAULT_SUCCESS_RATE_THRESHOLD
ERROR_THRESHOLD=$DEFAULT_ERROR_RATE_THRESHOLD
LATENCY_THRESHOLD=$DEFAULT_LATENCY_THRESHOLD
ANALYSIS_DURATION=$DEFAULT_ANALYSIS_DURATION
AUTO_PROMOTE=false
FORCE=false
ROLLBACK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--service)
            SERVICE_NAME="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -i|--initial)
            INITIAL_CANARY="$2"
            shift 2
            ;;
        -c|--increment)
            CANARY_INCREMENT="$2"
            shift 2
            ;;
        -t|--success-threshold)
            SUCCESS_THRESHOLD="$2"
            shift 2
            ;;
        -e|--error-threshold)
            ERROR_THRESHOLD="$2"
            shift 2
            ;;
        -l|--latency-threshold)
            LATENCY_THRESHOLD="$2"
            shift 2
            ;;
        -d|--duration)
            ANALYSIS_DURATION="$2"
            shift 2
            ;;
        -a|--auto)
            AUTO_PROMOTE=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Validate required parameters
if [[ -z "$SERVICE_NAME" ]]; then
    log_error "Service name is required"
    usage
fi

if [[ -z "$VERSION" ]] && [[ "$ROLLBACK" == "false" ]]; then
    log_error "Version is required for deployment"
    usage
fi

# Get current stable version
get_stable_version() {
    kubectl get deployment "${SERVICE_NAME}-stable" -n "$DEFAULT_NAMESPACE" \
        -o jsonpath='{.spec.template.spec.containers[0].image}' 2>/dev/null | \
        awk -F: '{print $2}' || echo "unknown"
}

# Deploy canary version
deploy_canary() {
    local service_name="$1"
    local version="$2"
    local initial_percentage="$3"
    
    log_info "Deploying canary version $version with initial traffic: $initial_percentage%"
    
    # Get service configuration
    local service_port=$(get_service_port "$service_name")
    local memory_request=$(get_memory_request "$service_name")
    local memory_limit=$(get_memory_limit "$service_name")
    local cpu_request=$(get_cpu_request "$service_name")
    local cpu_limit=$(get_cpu_limit "$service_name")
    local stable_version=$(get_stable_version)
    
    # Calculate replicas based on percentage
    local stable_replicas=$(kubectl get deployment "${service_name}-stable" -n "$DEFAULT_NAMESPACE" \
        -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "3")
    local canary_replicas=$(( (stable_replicas * initial_percentage + 99) / 100 ))
    canary_replicas=$(( canary_replicas < 1 ? 1 : canary_replicas ))
    
    # Export variables for envsubst
    export SERVICE_NAME="$service_name"
    export VERSION="$version"
    export STABLE_VERSION="$stable_version"
    export CANARY_REPLICAS="$canary_replicas"
    export STABLE_REPLICAS="$stable_replicas"
    export SERVICE_PORT="$service_port"
    export IMAGE_REGISTRY="${IMAGE_REGISTRY:-zoptal}"
    export MEMORY_REQUEST="$memory_request"
    export MEMORY_LIMIT="$memory_limit"
    export CPU_REQUEST="$cpu_request"
    export CPU_LIMIT="$cpu_limit"
    export CANARY_WEIGHT="$initial_percentage"
    export STABLE_WEIGHT=$((100 - initial_percentage))
    
    # Generate deployment manifest
    local deployment_manifest="/tmp/${service_name}-canary-deployment.yaml"
    envsubst < "${PROJECT_ROOT}/k8s/deployments/canary/canary-deployment.yaml" > "$deployment_manifest"
    
    # Apply the deployment
    kubectl apply -f "$deployment_manifest"
    
    # Clean up
    rm -f "$deployment_manifest"
    
    log_success "Canary deployment created"
}

# Wait for canary to be ready
wait_for_canary() {
    local service_name="$1"
    local timeout=300
    
    log_info "Waiting for canary deployment to be ready..."
    
    kubectl wait --for=condition=available --timeout="${timeout}s" \
        deployment/"${service_name}-canary" -n zoptal-canary || {
        log_error "Canary deployment failed to become ready"
        return 1
    }
    
    log_success "Canary deployment is ready"
}

# Get metrics from Prometheus
get_metrics() {
    local service_name="$1"
    local metric_query="$2"
    local prometheus_url="${PROMETHEUS_URL:-http://prometheus.zoptal-monitoring:9090}"
    
    # Query Prometheus
    local result=$(curl -s "${prometheus_url}/api/v1/query" \
        --data-urlencode "query=${metric_query}" | \
        jq -r '.data.result[0].value[1] // "0"')
    
    echo "$result"
}

# Analyze canary metrics
analyze_canary() {
    local service_name="$1"
    local duration="$2"
    
    log_info "Analyzing canary metrics for $duration seconds..."
    
    # Metric queries
    local success_rate_query="sum(rate(http_requests_total{app=\"${service_name}\",track=\"canary\",status=~\"2..\"}[5m])) / sum(rate(http_requests_total{app=\"${service_name}\",track=\"canary\"}[5m])) * 100"
    local error_rate_query="sum(rate(http_requests_total{app=\"${service_name}\",track=\"canary\",status=~\"5..\"}[5m])) / sum(rate(http_requests_total{app=\"${service_name}\",track=\"canary\"}[5m])) * 100"
    local latency_p95_query="histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{app=\"${service_name}\",track=\"canary\"}[5m])) by (le)) * 1000"
    
    # Wait for metrics to stabilize
    sleep 30
    
    # Collect metrics
    local start_time=$(date +%s)
    local analysis_passed=true
    local metric_history=""
    
    while [[ $(($(date +%s) - start_time)) -lt $duration ]]; do
        local success_rate=$(get_metrics "$service_name" "$success_rate_query")
        local error_rate=$(get_metrics "$service_name" "$error_rate_query")
        local latency_p95=$(get_metrics "$service_name" "$latency_p95_query")
        
        # Default to 100% success if no data
        success_rate=${success_rate:-100}
        error_rate=${error_rate:-0}
        latency_p95=${latency_p95:-0}
        
        # Log current metrics
        log_info "Metrics - Success: ${success_rate}%, Errors: ${error_rate}%, P95 Latency: ${latency_p95}ms"
        
        # Check thresholds
        if (( $(echo "$success_rate < $SUCCESS_THRESHOLD" | bc -l) )); then
            log_error "Success rate ${success_rate}% below threshold ${SUCCESS_THRESHOLD}%"
            analysis_passed=false
            break
        fi
        
        if (( $(echo "$error_rate > $ERROR_THRESHOLD" | bc -l) )); then
            log_error "Error rate ${error_rate}% above threshold ${ERROR_THRESHOLD}%"
            analysis_passed=false
            break
        fi
        
        if (( $(echo "$latency_p95 > $LATENCY_THRESHOLD" | bc -l) )); then
            log_error "P95 latency ${latency_p95}ms above threshold ${LATENCY_THRESHOLD}ms"
            analysis_passed=false
            break
        fi
        
        # Record metrics
        metric_history="${metric_history}\n$(date +%Y-%m-%dT%H:%M:%S) Success:${success_rate}% Errors:${error_rate}% P95:${latency_p95}ms"
        
        # Wait before next check
        sleep 30
    done
    
    echo -e "Metric History:${metric_history}"
    
    if [[ "$analysis_passed" == "true" ]]; then
        log_success "Canary analysis passed all thresholds"
        return 0
    else
        log_error "Canary analysis failed"
        return 1
    fi
}

# Update traffic split
update_traffic_split() {
    local service_name="$1"
    local canary_percentage="$2"
    
    log_info "Updating traffic split: ${canary_percentage}% to canary"
    
    # Update service annotations
    kubectl annotate service "$service_name" -n "$DEFAULT_NAMESPACE" \
        "canary.deployment/weight=${canary_percentage}" --overwrite
    
    # If using Istio, update VirtualService
    if kubectl get virtualservice "${service_name}-canary-vs" -n "$DEFAULT_NAMESPACE" &>/dev/null; then
        kubectl patch virtualservice "${service_name}-canary-vs" -n "$DEFAULT_NAMESPACE" \
            --type merge -p "{
                \"spec\": {
                    \"http\": [{
                        \"route\": [
                            {\"destination\": {\"host\": \"${service_name}\", \"subset\": \"stable\"}, \"weight\": $((100 - canary_percentage))},
                            {\"destination\": {\"host\": \"${service_name}\", \"subset\": \"canary\"}, \"weight\": ${canary_percentage}}
                        ]
                    }]
                }
            }"
    fi
    
    # If using NGINX Ingress, update annotations
    kubectl annotate ingress "${service_name}-ingress" -n "$DEFAULT_NAMESPACE" \
        "nginx.ingress.kubernetes.io/canary=true" \
        "nginx.ingress.kubernetes.io/canary-weight=${canary_percentage}" --overwrite || true
    
    log_success "Traffic split updated"
}

# Promote canary to stable
promote_canary() {
    local service_name="$1"
    local version="$2"
    
    log_info "Promoting canary version $version to stable"
    
    # Update stable deployment
    kubectl set image deployment/"${service_name}-stable" \
        "${service_name}=${IMAGE_REGISTRY:-zoptal}/${service_name}:${version}" \
        -n "$DEFAULT_NAMESPACE"
    
    # Wait for stable to be ready
    kubectl wait --for=condition=available --timeout=300s \
        deployment/"${service_name}-stable" -n "$DEFAULT_NAMESPACE"
    
    # Remove canary deployment
    kubectl delete deployment "${service_name}-canary" -n zoptal-canary || true
    
    # Reset traffic annotations
    kubectl annotate service "$service_name" -n "$DEFAULT_NAMESPACE" \
        "canary.deployment/weight-" --overwrite || true
    
    log_success "Canary promoted to stable"
}

# Rollback canary
rollback_canary() {
    local service_name="$1"
    
    log_warning "Rolling back canary deployment"
    
    # Delete canary deployment
    kubectl delete deployment "${service_name}-canary" -n zoptal-canary || true
    
    # Reset traffic to 100% stable
    update_traffic_split "$service_name" 0
    
    # Remove canary annotations
    kubectl annotate service "$service_name" -n "$DEFAULT_NAMESPACE" \
        "canary.deployment/enabled-" \
        "canary.deployment/weight-" --overwrite || true
    
    log_success "Canary rollback completed"
}

# Progressive rollout
progressive_rollout() {
    local service_name="$1"
    local version="$2"
    local current_percentage="$3"
    local increment="$4"
    local auto_promote="$5"
    
    while [[ $current_percentage -lt 100 ]]; do
        # Analyze current state
        if ! analyze_canary "$service_name" "$ANALYSIS_DURATION"; then
            log_error "Canary analysis failed at ${current_percentage}%"
            rollback_canary "$service_name"
            return 1
        fi
        
        # Calculate next percentage
        local next_percentage=$((current_percentage + increment))
        if [[ $next_percentage -gt 100 ]]; then
            next_percentage=100
        fi
        
        # Prompt for manual approval if not auto
        if [[ "$auto_promote" != "true" ]] && [[ $next_percentage -lt 100 ]]; then
            echo -e "${YELLOW}Current canary traffic: ${current_percentage}%${NC}"
            echo -e "${YELLOW}Metrics look good. Increase to ${next_percentage}%?${NC}"
            read -p "Continue? (y/N) " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_warning "Manual promotion cancelled"
                return 1
            fi
        fi
        
        # Update traffic split
        update_traffic_split "$service_name" "$next_percentage"
        current_percentage=$next_percentage
        
        if [[ $current_percentage -eq 100 ]]; then
            log_success "Canary at 100% traffic"
            break
        fi
        
        log_info "Increased canary traffic to ${current_percentage}%"
    done
    
    # Final analysis at 100%
    if analyze_canary "$service_name" "$ANALYSIS_DURATION"; then
        if [[ "$auto_promote" == "true" ]]; then
            promote_canary "$service_name" "$version"
        else
            echo -e "${YELLOW}Canary at 100% and healthy. Promote to stable?${NC}"
            read -p "Promote? (y/N) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                promote_canary "$service_name" "$version"
            fi
        fi
    else
        log_error "Final canary analysis failed"
        rollback_canary "$service_name"
        return 1
    fi
}

# Get service configuration
get_service_port() {
    case "$1" in
        auth-service) echo "3001" ;;
        project-service) echo "3002" ;;
        ai-service) echo "3003" ;;
        file-service) echo "3004" ;;
        notification-service) echo "3005" ;;
        billing-service) echo "3006" ;;
        security-service) echo "3007" ;;
        *) echo "3000" ;;
    esac
}

get_memory_request() {
    case "$1" in
        ai-service) echo "512Mi" ;;
        *) echo "256Mi" ;;
    esac
}

get_memory_limit() {
    case "$1" in
        ai-service) echo "2Gi" ;;
        *) echo "512Mi" ;;
    esac
}

get_cpu_request() {
    case "$1" in
        ai-service) echo "500m" ;;
        *) echo "200m" ;;
    esac
}

get_cpu_limit() {
    case "$1" in
        ai-service) echo "2000m" ;;
        *) echo "500m" ;;
    esac
}

# Main execution
main() {
    if [[ "$ROLLBACK" == "true" ]]; then
        log_info "Rolling back canary deployment for $SERVICE_NAME"
        rollback_canary "$SERVICE_NAME"
        exit 0
    fi
    
    log_info "Starting canary deployment for $SERVICE_NAME:$VERSION"
    
    # Get current stable version
    STABLE_VERSION=$(get_stable_version)
    log_info "Current stable version: $STABLE_VERSION"
    
    # Confirmation prompt
    if [[ "$FORCE" != "true" ]]; then
        echo -e "${YELLOW}You are about to deploy:${NC}"
        echo "  Service: $SERVICE_NAME"
        echo "  New Version: $VERSION"
        echo "  Current Version: $STABLE_VERSION"
        echo "  Initial Canary: ${INITIAL_CANARY}%"
        echo "  Auto-promote: $AUTO_PROMOTE"
        echo ""
        read -p "Do you want to continue? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_warning "Deployment cancelled"
            exit 0
        fi
    fi
    
    # Deploy canary
    deploy_canary "$SERVICE_NAME" "$VERSION" "$INITIAL_CANARY"
    
    # Wait for canary to be ready
    wait_for_canary "$SERVICE_NAME" || exit 1
    
    # Update initial traffic split
    update_traffic_split "$SERVICE_NAME" "$INITIAL_CANARY"
    
    # Start progressive rollout
    progressive_rollout "$SERVICE_NAME" "$VERSION" "$INITIAL_CANARY" "$CANARY_INCREMENT" "$AUTO_PROMOTE"
    
    log_success "Canary deployment completed successfully!"
}

# Run main function
main