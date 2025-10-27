#!/bin/bash

# Zoptal Auth Service Deployment Script
# This script automates the deployment process for different environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DOCKER_REGISTRY="ghcr.io/zoptal"
SERVICE_NAME="auth-service"
IMAGE_NAME="${DOCKER_REGISTRY}/${SERVICE_NAME}"

# Default values
ENVIRONMENT="development"
SKIP_TESTS=false
SKIP_BUILD=false
SKIP_SECURITY_SCAN=false
CLEANUP=false
VERBOSE=false

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy Zoptal Auth Service to specified environment

OPTIONS:
    -e, --environment ENV    Target environment (development|staging|production) [default: development]
    -t, --skip-tests        Skip running tests
    -b, --skip-build        Skip building Docker image
    -s, --skip-security     Skip security scanning
    -c, --cleanup           Clean up old Docker images and containers
    -v, --verbose           Enable verbose output
    -h, --help              Show this help message

EXAMPLES:
    $0 -e development                    # Deploy to development
    $0 -e staging --skip-tests           # Deploy to staging, skip tests
    $0 -e production --cleanup           # Deploy to production with cleanup
    $0 --environment production -v      # Deploy to production with verbose output

ENVIRONMENTS:
    development     Local development with hot reloading
    staging         Staging environment for testing
    production      Production environment with monitoring

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        -b|--skip-build)
            SKIP_BUILD=true
            shift
            ;;
        -s|--skip-security)
            SKIP_SECURITY_SCAN=true
            shift
            ;;
        -c|--cleanup)
            CLEANUP=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Must be one of: development, staging, production"
fi

# Set verbose mode
if [ "$VERBOSE" = true ]; then
    set -x
fi

log "Starting deployment to $ENVIRONMENT environment..."

# Change to project directory
cd "$PROJECT_DIR"

# Check if required files exist
if [ ! -f "Dockerfile" ]; then
    error "Dockerfile not found in $PROJECT_DIR"
fi

if [ ! -f "package.json" ]; then
    error "package.json not found in $PROJECT_DIR"
fi

# Cleanup old containers and images if requested
if [ "$CLEANUP" = true ]; then
    log "Cleaning up old Docker containers and images..."
    
    # Stop and remove containers
    docker-compose down --remove-orphans 2>/dev/null || true
    
    # Remove old images
    docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | tail -n +2 | head -n -3 | awk '{print $3}' | xargs -r docker rmi 2>/dev/null || true
    
    # Clean up dangling images
    docker image prune -f
    
    success "Cleanup completed"
fi

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    log "Loading environment variables from .env.${ENVIRONMENT}"
    export $(cat .env.${ENVIRONMENT} | xargs)
elif [ -f ".env" ]; then
    log "Loading environment variables from .env"
    export $(cat .env | xargs)
else
    warning "No environment file found. Using default values."
fi

# Run tests
if [ "$SKIP_TESTS" = false ]; then
    log "Running tests..."
    
    if [ "$ENVIRONMENT" = "development" ]; then
        npm test || error "Tests failed"
    else
        # For staging/production, run full test suite including integration tests
        npm run test:all || error "Tests failed"
    fi
    
    success "All tests passed"
fi

# Build Docker image
if [ "$SKIP_BUILD" = false ]; then
    log "Building Docker image for $ENVIRONMENT..."
    
    # Generate build tag
    BUILD_TAG="${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD 2>/dev/null || echo 'local')"
    
    case $ENVIRONMENT in
        development)
            docker build --target development -t "${IMAGE_NAME}:${BUILD_TAG}" -t "${IMAGE_NAME}:dev-latest" .
            ;;
        staging)
            docker build --target production -t "${IMAGE_NAME}:${BUILD_TAG}" -t "${IMAGE_NAME}:staging-latest" .
            ;;
        production)
            docker build --target production -t "${IMAGE_NAME}:${BUILD_TAG}" -t "${IMAGE_NAME}:latest" .
            ;;
    esac
    
    success "Docker image built: ${IMAGE_NAME}:${BUILD_TAG}"
fi

# Security scanning
if [ "$SKIP_SECURITY_SCAN" = false ] && [[ "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    log "Running security scan..."
    
    # Check if Trivy is installed
    if command -v trivy &> /dev/null; then
        trivy image --severity HIGH,CRITICAL "${IMAGE_NAME}:${BUILD_TAG}" || warning "Security scan found issues"
    else
        warning "Trivy not installed. Skipping security scan. Install with: curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin"
    fi
fi

# Deploy based on environment
log "Deploying to $ENVIRONMENT environment..."

case $ENVIRONMENT in
    development)
        log "Starting development environment..."
        docker-compose up -d
        
        # Wait for services to be healthy
        log "Waiting for services to be ready..."
        sleep 10
        
        # Check health
        if curl -sf http://localhost:3000/health > /dev/null; then
            success "Development environment is running at http://localhost:3000"
        else
            error "Health check failed. Check logs with: docker-compose logs auth-service"
        fi
        ;;
        
    staging)
        log "Deploying to staging environment..."
        
        # Push image to registry
        if [ -n "${DOCKER_REGISTRY_TOKEN}" ]; then
            echo "${DOCKER_REGISTRY_TOKEN}" | docker login "${DOCKER_REGISTRY}" -u "${DOCKER_REGISTRY_USER}" --password-stdin
            docker push "${IMAGE_NAME}:${BUILD_TAG}"
            docker push "${IMAGE_NAME}:staging-latest"
        fi
        
        # Deploy using production compose with staging overrides
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        
        success "Deployed to staging environment"
        ;;
        
    production)
        log "Deploying to production environment..."
        
        # Extra confirmation for production
        echo -e "${YELLOW}WARNING: You are about to deploy to PRODUCTION!${NC}"
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log "Deployment cancelled"
            exit 0
        fi
        
        # Push image to registry
        if [ -n "${DOCKER_REGISTRY_TOKEN}" ]; then
            echo "${DOCKER_REGISTRY_TOKEN}" | docker login "${DOCKER_REGISTRY}" -u "${DOCKER_REGISTRY_USER}" --password-stdin
            docker push "${IMAGE_NAME}:${BUILD_TAG}"
            docker push "${IMAGE_NAME}:latest"
        fi
        
        # Deploy with zero-downtime strategy
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale auth-service=2
        
        # Wait for new instances to be healthy
        sleep 30
        
        # Health check
        for i in {1..5}; do
            if curl -sf http://localhost/health > /dev/null; then
                success "Production deployment completed successfully"
                break
            else
                warning "Health check attempt $i failed, retrying..."
                sleep 10
            fi
        done
        
        # Create deployment tag
        git tag "deploy-${BUILD_TAG}" 2>/dev/null || true
        
        success "Deployed to production environment"
        ;;
esac

# Show useful information
log "Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Build Tag: ${BUILD_TAG:-'not built'}"
echo "  Skip Tests: $SKIP_TESTS"
echo "  Skip Build: $SKIP_BUILD"
echo "  Skip Security: $SKIP_SECURITY_SCAN"

# Show service URLs
case $ENVIRONMENT in
    development)
        echo ""
        echo "🔗 Service URLs:"
        echo "  Auth Service: http://localhost:3000"
        echo "  Health Check: http://localhost:3000/health"
        echo "  API Docs: http://localhost:3000/documentation"
        echo "  Database Admin: http://localhost:8080 (with --profile dev-tools)"
        echo "  Redis Admin: http://localhost:8081 (with --profile dev-tools)"
        echo "  Email Testing: http://localhost:8025 (with --profile dev-tools)"
        echo ""
        echo "📝 Useful Commands:"
        echo "  View logs: docker-compose logs -f auth-service"
        echo "  Stop services: docker-compose down"
        echo "  Restart service: docker-compose restart auth-service"
        ;;
    staging|production)
        echo ""
        echo "🔗 Service URLs:"
        echo "  Auth Service: http://localhost"
        echo "  Health Check: http://localhost/health"
        echo "  Monitoring: http://localhost:3001 (Grafana)"
        echo "  Metrics: http://localhost:9090 (Prometheus)"
        echo ""
        echo "📝 Useful Commands:"
        echo "  View logs: docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f auth-service"
        echo "  Scale service: docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale auth-service=3"
        ;;
esac

log "Deployment completed successfully! 🚀"