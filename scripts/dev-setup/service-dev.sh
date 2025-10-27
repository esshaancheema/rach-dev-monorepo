#!/bin/bash
# service-dev.sh - Service-specific development utilities

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Available services
SERVICES=(
    "auth-service"
    "project-service"
    "ai-service"
    "billing-service"
    "notification-service"
    "analytics-service"
)

# Available apps
APPS=(
    "web-main"
    "dashboard"
    "admin"
)

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Display help
show_help() {
    echo "Usage: $0 [COMMAND] [SERVICE/APP] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start [service]     Start a specific service"
    echo "  stop [service]      Stop a specific service"
    echo "  restart [service]   Restart a specific service"
    echo "  logs [service]      Show logs for a service"
    echo "  test [service]      Run tests for a service"
    echo "  build [service]     Build a service"
    echo "  clean [service]     Clean build artifacts for a service"
    echo "  migrate [service]   Run database migrations (if applicable)"
    echo "  seed [service]      Seed database with test data"
    echo "  status              Show status of all services"
    echo "  health [service]    Check health of a service"
    echo "  debug [service]     Start service in debug mode"
    echo ""
    echo "Available Services:"
    for service in "${SERVICES[@]}"; do
        echo "  - $service"
    done
    echo ""
    echo "Available Apps:"
    for app in "${APPS[@]}"; do
        echo "  - $app"
    done
    echo ""
    echo "Examples:"
    echo "  $0 start auth-service"
    echo "  $0 test project-service"
    echo "  $0 logs web-main"
    echo "  $0 status"
}

# Validate service/app name
validate_service() {
    local name="$1"
    
    # Check if it's a service
    for service in "${SERVICES[@]}"; do
        if [[ "$service" == "$name" ]]; then
            echo "service"
            return 0
        fi
    done
    
    # Check if it's an app
    for app in "${APPS[@]}"; do
        if [[ "$app" == "$name" ]]; then
            echo "app"
            return 0
        fi
    done
    
    return 1
}

# Get service directory
get_service_dir() {
    local name="$1"
    local type="$2"
    
    if [[ "$type" == "service" ]]; then
        echo "${PROJECT_ROOT}/services/${name}"
    else
        echo "${PROJECT_ROOT}/apps/${name}"
    fi
}

# Check if service is running
is_service_running() {
    local name="$1"
    local port=""
    
    case "$name" in
        "auth-service") port="4000" ;;
        "project-service") port="4001" ;;
        "ai-service") port="4002" ;;
        "billing-service") port="4003" ;;
        "notification-service") port="4004" ;;
        "analytics-service") port="4005" ;;
        "web-main") port="3000" ;;
        "dashboard") port="3001" ;;
        "admin") port="3002" ;;
        *) return 1 ;;
    esac
    
    if command -v nc >/dev/null 2>&1; then
        nc -z localhost "$port" 2>/dev/null
    elif command -v netstat >/dev/null 2>&1; then
        netstat -tuln | grep ":$port " >/dev/null 2>&1
    else
        # Fallback to curl
        curl -s "http://localhost:$port" >/dev/null 2>&1
    fi
}

# Start a service
start_service() {
    local name="$1"
    local type=$(validate_service "$name") || {
        log_error "Unknown service/app: $name"
        return 1
    }
    
    local service_dir=$(get_service_dir "$name" "$type")
    
    if [[ ! -d "$service_dir" ]]; then
        log_error "Service directory not found: $service_dir"
        return 1
    fi
    
    log_info "Starting $name..."
    
    if is_service_running "$name"; then
        log_warning "$name is already running"
        return 0
    fi
    
    cd "$service_dir"
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found in $service_dir"
        return 1
    fi
    
    # Start the service in background
    if [[ "$type" == "service" ]]; then
        pnpm dev > /tmp/${name}.log 2>&1 &
    else
        pnpm dev > /tmp/${name}.log 2>&1 &
    fi
    
    local pid=$!
    echo "$pid" > "/tmp/${name}.pid"
    
    # Wait a moment and check if it's running
    sleep 3
    
    if is_service_running "$name"; then
        log_success "$name started successfully (PID: $pid)"
        return 0
    else
        log_error "Failed to start $name. Check logs: tail -f /tmp/${name}.log"
        return 1
    fi
}

# Stop a service
stop_service() {
    local name="$1"
    local type=$(validate_service "$name") || {
        log_error "Unknown service/app: $name"
        return 1
    }
    
    log_info "Stopping $name..."
    
    if [[ -f "/tmp/${name}.pid" ]]; then
        local pid=$(cat "/tmp/${name}.pid")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "/tmp/${name}.pid"
            log_success "$name stopped successfully"
        else
            log_warning "$name process not found (PID: $pid)"
            rm -f "/tmp/${name}.pid"
        fi
    else
        log_warning "No PID file found for $name"
    fi
    
    # Cleanup log file
    rm -f "/tmp/${name}.log"
}

# Restart a service
restart_service() {
    local name="$1"
    stop_service "$name"
    sleep 2
    start_service "$name"
}

# Show logs for a service
show_logs() {
    local name="$1"
    validate_service "$name" >/dev/null || {
        log_error "Unknown service/app: $name"
        return 1
    }
    
    if [[ -f "/tmp/${name}.log" ]]; then
        log_info "Showing logs for $name (Ctrl+C to stop):"
        tail -f "/tmp/${name}.log"
    else
        log_warning "No log file found for $name"
        return 1
    fi
}

# Run tests for a service
test_service() {
    local name="$1"
    local type=$(validate_service "$name") || {
        log_error "Unknown service/app: $name"
        return 1
    }
    
    local service_dir=$(get_service_dir "$name" "$type")
    
    if [[ ! -d "$service_dir" ]]; then
        log_error "Service directory not found: $service_dir"
        return 1
    fi
    
    log_info "Running tests for $name..."
    
    cd "$service_dir"
    
    if pnpm test; then
        log_success "Tests passed for $name"
    else
        log_error "Tests failed for $name"
        return 1
    fi
}

# Build a service
build_service() {
    local name="$1"
    local type=$(validate_service "$name") || {
        log_error "Unknown service/app: $name"
        return 1
    }
    
    local service_dir=$(get_service_dir "$name" "$type")
    
    if [[ ! -d "$service_dir" ]]; then
        log_error "Service directory not found: $service_dir"
        return 1
    fi
    
    log_info "Building $name..."
    
    cd "$service_dir"
    
    if pnpm build; then
        log_success "Build completed for $name"
    else
        log_error "Build failed for $name"
        return 1
    fi
}

# Clean build artifacts
clean_service() {
    local name="$1"
    local type=$(validate_service "$name") || {
        log_error "Unknown service/app: $name"
        return 1
    }
    
    local service_dir=$(get_service_dir "$name" "$type")
    
    if [[ ! -d "$service_dir" ]]; then
        log_error "Service directory not found: $service_dir"
        return 1
    fi
    
    log_info "Cleaning $name..."
    
    cd "$service_dir"
    
    # Remove common build directories
    rm -rf dist/ build/ .next/ coverage/
    
    # Run clean script if available
    if pnpm run clean >/dev/null 2>&1; then
        pnpm clean
    fi
    
    log_success "Cleaned $name"
}

# Run database migrations
migrate_service() {
    local name="$1"
    
    case "$name" in
        "auth-service"|"project-service"|"billing-service"|"analytics-service")
            log_info "Running migrations for $name..."
            cd "${PROJECT_ROOT}/packages/database"
            pnpm prisma migrate dev
            log_success "Migrations completed"
            ;;
        *)
            log_warning "$name doesn't require database migrations"
            ;;
    esac
}

# Seed database with test data
seed_service() {
    local name="$1"
    
    case "$name" in
        "auth-service"|"project-service"|"billing-service"|"analytics-service")
            log_info "Seeding database for $name..."
            cd "${PROJECT_ROOT}/packages/database"
            if [[ -f "prisma/seed.ts" ]] || [[ -f "prisma/seed.js" ]]; then
                pnpm prisma db seed
                log_success "Database seeded"
            else
                log_warning "No seed script found"
            fi
            ;;
        *)
            log_warning "$name doesn't require database seeding"
            ;;
    esac
}

# Show status of all services
show_status() {
    log_info "Service Status:"
    echo ""
    
    local all_services=("${SERVICES[@]}" "${APPS[@]}")
    
    for service in "${all_services[@]}"; do
        if is_service_running "$service"; then
            echo -e "  ${GREEN}●${NC} $service - Running"
        else
            echo -e "  ${RED}●${NC} $service - Stopped"
        fi
    done
    
    echo ""
    log_info "Infrastructure Status:"
    
    # Check databases
    if nc -z localhost 5432 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} PostgreSQL - Running"
    else
        echo -e "  ${RED}●${NC} PostgreSQL - Stopped"
    fi
    
    if nc -z localhost 6379 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} Redis - Running"
    else
        echo -e "  ${RED}●${NC} Redis - Stopped"
    fi
    
    if nc -z localhost 8025 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} MailHog - Running"
    else
        echo -e "  ${RED}●${NC} MailHog - Stopped"
    fi
    
    if nc -z localhost 9001 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} MinIO - Running"
    else
        echo -e "  ${RED}●${NC} MinIO - Stopped"
    fi
}

# Check health of a service
check_health() {
    local name="$1"
    validate_service "$name" >/dev/null || {
        log_error "Unknown service/app: $name"
        return 1
    }
    
    local port=""
    
    case "$name" in
        "auth-service") port="4000" ;;
        "project-service") port="4001" ;;
        "ai-service") port="4002" ;;
        "billing-service") port="4003" ;;
        "notification-service") port="4004" ;;
        "analytics-service") port="4005" ;;
        "web-main") port="3000" ;;
        "dashboard") port="3001" ;;
        "admin") port="3002" ;;
        *)
            log_warning "$name doesn't have a health check endpoint"
            return 1
            ;;
    esac
    
    log_info "Checking health of $name..."
    
    if [[ "$name" =~ ^(auth|project|ai|billing|notification|analytics)-service$ ]]; then
        # Services have /health endpoint
        if curl -sf "http://localhost:$port/health" >/dev/null 2>&1; then
            log_success "$name is healthy"
        else
            log_error "$name is not healthy"
            return 1
        fi
    else
        # Apps just check if they're responding
        if curl -sf "http://localhost:$port" >/dev/null 2>&1; then
            log_success "$name is responding"
        else
            log_error "$name is not responding"
            return 1
        fi
    fi
}

# Start service in debug mode
debug_service() {
    local name="$1"
    local type=$(validate_service "$name") || {
        log_error "Unknown service/app: $name"
        return 1
    }
    
    local service_dir=$(get_service_dir "$name" "$type")
    
    if [[ ! -d "$service_dir" ]]; then
        log_error "Service directory not found: $service_dir"
        return 1
    fi
    
    log_info "Starting $name in debug mode..."
    
    cd "$service_dir"
    
    if [[ "$type" == "service" ]]; then
        # Check if debug script exists
        if pnpm run debug >/dev/null 2>&1; then
            pnpm debug
        else
            # Fallback to NODE_OPTIONS
            NODE_OPTIONS="--inspect=0.0.0.0:9229" pnpm dev
        fi
    else
        log_warning "Debug mode not available for apps"
        return 1
    fi
}

# Main execution
main() {
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi
    
    local command="$1"
    
    case "$command" in
        "start")
            if [[ $# -lt 2 ]]; then
                log_error "Service name required"
                show_help
                exit 1
            fi
            start_service "$2"
            ;;
        "stop")
            if [[ $# -lt 2 ]]; then
                log_error "Service name required"
                show_help
                exit 1
            fi
            stop_service "$2"
            ;;
        "restart")
            if [[ $# -lt 2 ]]; then
                log_error "Service name required"
                show_help
                exit 1
            fi
            restart_service "$2"
            ;;
        "logs")
            if [[ $# -lt 2 ]]; then
                log_error "Service name required"
                show_help
                exit 1
            fi
            show_logs "$2"
            ;;
        "test")
            if [[ $# -lt 2 ]]; then
                log_error "Service name required"
                show_help
                exit 1
            fi
            test_service "$2"
            ;;
        "build")
            if [[ $# -lt 2 ]]; then
                log_error "Service name required"
                show_help
                exit 1
            fi
            build_service "$2"
            ;;
        "clean")
            if [[ $# -lt 2 ]]; then
                log_error "Service name required"
                show_help
                exit 1
            fi
            clean_service "$2"
            ;;
        "migrate")
            if [[ $# -lt 2 ]]; then
                migrate_service "database"
            else
                migrate_service "$2"
            fi
            ;;
        "seed")
            if [[ $# -lt 2 ]]; then
                seed_service "database"
            else
                seed_service "$2"
            fi
            ;;
        "status")
            show_status
            ;;
        "health")
            if [[ $# -lt 2 ]]; then
                log_error "Service name required"
                show_help
                exit 1
            fi
            check_health "$2"
            ;;
        "debug")
            if [[ $# -lt 2 ]]; then
                log_error "Service name required"
                show_help
                exit 1
            fi
            debug_service "$2"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'log_error "Operation interrupted"; exit 1' INT TERM

# Run main function with all arguments
main "$@"