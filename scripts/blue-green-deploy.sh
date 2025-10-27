#!/bin/bash

# Blue-Green Deployment Script for Zoptal Platform
# 
# This script handles blue-green deployments with automated health checks,
# traffic switching, and rollback capabilities.

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
DEFAULT_HEALTH_CHECK_RETRIES=30
DEFAULT_HEALTH_CHECK_INTERVAL=10
DEFAULT_SMOKE_TEST_TIMEOUT=300

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
    echo "  -e, --environment       Target environment (blue|green) (auto-detected if not specified)"
    echo "  -n, --namespace         Kubernetes namespace (default: $DEFAULT_NAMESPACE)"
    echo "  -r, --replicas          Number of replicas (default: 3)"
    echo "  -f, --force             Force deployment without confirmation"
    echo "  -t, --smoke-test        Run smoke tests after deployment"
    echo "  -b, --rollback          Rollback to previous environment"
    echo "  -d, --dry-run           Perform a dry run without actual deployment"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -s auth-service -v v1.2.0"
    echo "  $0 -s auth-service -v v1.2.0 -e green -t"
    echo "  $0 -s auth-service -b"
    exit 1
}

# Parse command line arguments
SERVICE_NAME=""
VERSION=""
TARGET_ENV=""
NAMESPACE="$DEFAULT_NAMESPACE"
REPLICAS=3
FORCE=false
RUN_SMOKE_TEST=false
ROLLBACK=false
DRY_RUN=false

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
        -e|--environment)
            TARGET_ENV="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -r|--replicas)
            REPLICAS="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -t|--smoke-test)
            RUN_SMOKE_TEST=true
            shift
            ;;
        -b|--rollback)
            ROLLBACK=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
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

# Get current active environment
get_active_environment() {
    local active_env=$(kubectl get service "$SERVICE_NAME" -n "$NAMESPACE" \
        -o jsonpath='{.metadata.annotations.active-environment}' 2>/dev/null || echo "")
    
    if [[ -z "$active_env" ]]; then
        log_warning "No active environment found, defaulting to blue"
        echo "blue"
    else
        echo "$active_env"
    fi
}

# Get inactive environment
get_inactive_environment() {
    local active_env="$1"
    if [[ "$active_env" == "blue" ]]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Check if deployment exists
deployment_exists() {
    local deployment_name="$1"
    local namespace="$2"
    kubectl get deployment "$deployment_name" -n "$namespace" &>/dev/null
}

# Wait for deployment to be ready
wait_for_deployment() {
    local deployment_name="$1"
    local namespace="$2"
    local retries="$DEFAULT_HEALTH_CHECK_RETRIES"
    local interval="$DEFAULT_HEALTH_CHECK_INTERVAL"
    
    log_info "Waiting for deployment $deployment_name to be ready..."
    
    for i in $(seq 1 $retries); do
        local ready_replicas=$(kubectl get deployment "$deployment_name" -n "$namespace" \
            -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        local desired_replicas=$(kubectl get deployment "$deployment_name" -n "$namespace" \
            -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
        
        if [[ "$ready_replicas" == "$desired_replicas" ]] && [[ "$ready_replicas" -gt 0 ]]; then
            log_success "Deployment $deployment_name is ready ($ready_replicas/$desired_replicas replicas)"
            return 0
        fi
        
        log_info "Waiting for deployment... ($ready_replicas/$desired_replicas ready) [Attempt $i/$retries]"
        sleep "$interval"
    done
    
    log_error "Deployment $deployment_name failed to become ready"
    return 1
}

# Run health checks
run_health_checks() {
    local service_name="$1"
    local namespace="$2"
    local environment="$3"
    
    log_info "Running health checks for $service_name in $environment environment..."
    
    # Get service endpoint
    local service_endpoint="${service_name}-${environment}.${namespace}.svc.cluster.local"
    local port=$(kubectl get service "${service_name}-${environment}" -n "$namespace" \
        -o jsonpath='{.spec.ports[0].port}' 2>/dev/null || echo "80")
    
    # Check health endpoint
    local health_url="http://${service_endpoint}:${port}/health"
    
    # Create a test pod to run health check
    kubectl run health-check-${RANDOM} \
        --image=curlimages/curl:latest \
        --rm -i --restart=Never \
        -n "$namespace" \
        -- curl -f -s -o /dev/null -w "%{http_code}" "$health_url" || {
        log_error "Health check failed for $service_name"
        return 1
    }
    
    log_success "Health checks passed for $service_name"
    return 0
}

# Run smoke tests
run_smoke_tests() {
    local service_name="$1"
    local namespace="$2"
    local environment="$3"
    
    log_info "Running smoke tests for $service_name in $environment environment..."
    
    # Check if smoke test script exists
    local smoke_test_script="${PROJECT_ROOT}/tests/smoke/${service_name}-smoke-test.sh"
    
    if [[ -f "$smoke_test_script" ]]; then
        timeout "$DEFAULT_SMOKE_TEST_TIMEOUT" bash "$smoke_test_script" "$environment" "$namespace" || {
            log_error "Smoke tests failed for $service_name"
            return 1
        }
    else
        log_warning "No smoke test script found at $smoke_test_script, skipping smoke tests"
    fi
    
    log_success "Smoke tests completed successfully"
    return 0
}

# Switch traffic to new environment
switch_traffic() {
    local service_name="$1"
    local namespace="$2"
    local new_environment="$3"
    
    log_info "Switching traffic to $new_environment environment..."
    
    # Update the production service selector
    kubectl patch service "$service_name" -n "$namespace" \
        --type merge \
        -p "{\"spec\":{\"selector\":{\"environment\":\"$new_environment\"}},\"metadata\":{\"annotations\":{\"active-environment\":\"$new_environment\"}}}"
    
    log_success "Traffic switched to $new_environment environment"
}

# Deploy to environment
deploy_to_environment() {
    local service_name="$1"
    local version="$2"
    local environment="$3"
    local namespace="$4"
    local replicas="$5"
    
    log_info "Deploying $service_name:$version to $environment environment..."
    
    # Get service configuration
    local service_port=$(get_service_port "$service_name")
    local memory_request=$(get_memory_request "$service_name")
    local memory_limit=$(get_memory_limit "$service_name")
    local cpu_request=$(get_cpu_request "$service_name")
    local cpu_limit=$(get_cpu_limit "$service_name")
    
    # Create deployment manifest from template
    local deployment_manifest="/tmp/${service_name}-${environment}-deployment.yaml"
    
    # Use envsubst to replace variables
    export SERVICE_NAME="$service_name"
    export VERSION="$version"
    export ENVIRONMENT="$environment"
    export REPLICAS="$replicas"
    export SERVICE_PORT="$service_port"
    export IMAGE_REGISTRY="${IMAGE_REGISTRY:-zoptal}"
    export MEMORY_REQUEST="$memory_request"
    export MEMORY_LIMIT="$memory_limit"
    export CPU_REQUEST="$cpu_request"
    export CPU_LIMIT="$cpu_limit"
    export ACTIVE_ENVIRONMENT="$environment"
    
    # Generate deployment manifest
    envsubst < "${PROJECT_ROOT}/k8s/deployments/blue-green/base-deployment.yaml" > "$deployment_manifest"
    
    # Apply the deployment
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would apply the following deployment:"
        cat "$deployment_manifest"
    else
        kubectl apply -f "$deployment_manifest"
    fi
    
    # Clean up temporary file
    rm -f "$deployment_manifest"
    
    log_success "Deployment applied to $environment environment"
}

# Get service configuration (could be from a config file or database)
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

# Save deployment state
save_deployment_state() {
    local service_name="$1"
    local version="$2"
    local environment="$3"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    local state_file="${PROJECT_ROOT}/.deployment-state/${service_name}.json"
    mkdir -p "$(dirname "$state_file")"
    
    cat > "$state_file" <<EOF
{
    "service": "$service_name",
    "version": "$version",
    "environment": "$environment",
    "timestamp": "$timestamp",
    "deployed_by": "${USER:-unknown}",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
}
EOF
}

# Main deployment logic
main() {
    log_info "Starting blue-green deployment process..."
    
    # Get current active environment
    CURRENT_ACTIVE_ENV=$(get_active_environment)
    log_info "Current active environment: $CURRENT_ACTIVE_ENV"
    
    if [[ "$ROLLBACK" == "true" ]]; then
        # Rollback to previous environment
        TARGET_ENV=$(get_inactive_environment "$CURRENT_ACTIVE_ENV")
        log_warning "Performing rollback from $CURRENT_ACTIVE_ENV to $TARGET_ENV"
    else
        # Determine target environment if not specified
        if [[ -z "$TARGET_ENV" ]]; then
            TARGET_ENV=$(get_inactive_environment "$CURRENT_ACTIVE_ENV")
        fi
        
        # Validate target environment
        if [[ "$TARGET_ENV" != "blue" ]] && [[ "$TARGET_ENV" != "green" ]]; then
            log_error "Invalid target environment: $TARGET_ENV (must be blue or green)"
            exit 1
        fi
        
        # Check if we're deploying to active environment
        if [[ "$TARGET_ENV" == "$CURRENT_ACTIVE_ENV" ]] && [[ "$FORCE" != "true" ]]; then
            log_error "Cannot deploy to active environment without --force flag"
            exit 1
        fi
    fi
    
    log_info "Target environment: $TARGET_ENV"
    
    # Confirmation prompt
    if [[ "$FORCE" != "true" ]] && [[ "$DRY_RUN" != "true" ]]; then
        echo -e "${YELLOW}You are about to deploy:${NC}"
        echo "  Service: $SERVICE_NAME"
        echo "  Version: ${VERSION:-current}"
        echo "  From: $CURRENT_ACTIVE_ENV"
        echo "  To: $TARGET_ENV"
        echo ""
        read -p "Do you want to continue? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_warning "Deployment cancelled"
            exit 0
        fi
    fi
    
    # Deploy to target environment (unless rollback)
    if [[ "$ROLLBACK" != "true" ]]; then
        deploy_to_environment "$SERVICE_NAME" "$VERSION" "$TARGET_ENV" \
            "zoptal-${TARGET_ENV}" "$REPLICAS"
        
        if [[ "$DRY_RUN" != "true" ]]; then
            # Wait for deployment to be ready
            wait_for_deployment "${SERVICE_NAME}-${TARGET_ENV}" "zoptal-${TARGET_ENV}" || {
                log_error "Deployment failed to become ready"
                exit 1
            }
            
            # Run health checks
            run_health_checks "$SERVICE_NAME" "zoptal-${TARGET_ENV}" "$TARGET_ENV" || {
                log_error "Health checks failed"
                exit 1
            }
            
            # Run smoke tests if requested
            if [[ "$RUN_SMOKE_TEST" == "true" ]]; then
                run_smoke_tests "$SERVICE_NAME" "zoptal-${TARGET_ENV}" "$TARGET_ENV" || {
                    log_error "Smoke tests failed"
                    exit 1
                }
            fi
        fi
    fi
    
    # Switch traffic
    if [[ "$DRY_RUN" != "true" ]]; then
        switch_traffic "$SERVICE_NAME" "$NAMESPACE" "$TARGET_ENV"
        
        # Verify traffic switch
        sleep 5
        local new_active_env=$(get_active_environment)
        if [[ "$new_active_env" != "$TARGET_ENV" ]]; then
            log_error "Traffic switch verification failed"
            exit 1
        fi
        
        # Save deployment state
        save_deployment_state "$SERVICE_NAME" "${VERSION:-rollback}" "$TARGET_ENV"
        
        log_success "Blue-green deployment completed successfully!"
        log_info "Traffic is now being served by the $TARGET_ENV environment"
        
        # Show post-deployment instructions
        echo ""
        echo -e "${YELLOW}Post-deployment steps:${NC}"
        echo "1. Monitor application metrics and logs"
        echo "2. Run full integration tests if needed"
        echo "3. Keep the old environment ($CURRENT_ACTIVE_ENV) running for quick rollback"
        echo "4. Once confident, scale down the old environment:"
        echo "   kubectl scale deployment ${SERVICE_NAME}-${CURRENT_ACTIVE_ENV} -n zoptal-${CURRENT_ACTIVE_ENV} --replicas=0"
    else
        log_info "DRY RUN completed - no actual changes were made"
    fi
}

# Run main function
main