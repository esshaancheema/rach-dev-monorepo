#!/bin/bash

# Integration Test Runner Script for Zoptal Platform
# This script sets up the test environment and runs comprehensive integration tests

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ROOT="$(cd "${TEST_DIR}/../.." && pwd)"
LOG_FILE="${TEST_DIR}/logs/test-run-$(date +%Y%m%d_%H%M%S).log"

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

print_info() {
    echo -e "${BLUE}→ $1${NC}"
    log "INFO: $1"
}

# Create logs directory
mkdir -p "${TEST_DIR}/logs"

# Function to check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        return 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        return 1
    fi
    
    return 0
}

# Function to check if services are ready
wait_for_services() {
    local max_attempts=30
    local attempt=1
    
    print_info "Waiting for services to be ready..."
    
    local services=(
        "http://localhost:5432"  # PostgreSQL (connection check)
        "http://localhost:6379"  # Redis (connection check)
    )
    
    # Check if test services should be started
    if [[ "${START_SERVICES:-true}" == "true" ]]; then
        services+=(
            "http://localhost:3001/health"  # Auth Service
            "http://localhost:3002/health"  # Project Service
            "http://localhost:3003/health"  # AI Service
            "http://localhost:3004/health"  # Billing Service
            "http://localhost:3005/health"  # Notification Service
        )
    fi
    
    while [[ $attempt -le $max_attempts ]]; do
        local all_ready=true
        
        for service in "${services[@]}"; do
            if [[ "$service" == *"5432" ]]; then
                # Check PostgreSQL connection
                if ! pg_isready -h localhost -p 5432 -U postgres &> /dev/null; then
                    all_ready=false
                    break
                fi
            elif [[ "$service" == *"6379" ]]; then
                # Check Redis connection
                if ! redis-cli -h localhost -p 6379 ping &> /dev/null; then
                    all_ready=false
                    break
                fi
            else
                # Check HTTP service
                if ! curl -f "$service" &> /dev/null; then
                    all_ready=false
                    break
                fi
            fi
        done
        
        if [[ "$all_ready" == "true" ]]; then
            print_success "All services are ready"
            return 0
        fi
        
        print_info "Attempt $attempt/$max_attempts: Services not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    print_error "Services failed to become ready after $max_attempts attempts"
    return 1
}

# Function to setup test environment
setup_test_environment() {
    print_header "Setting Up Test Environment"
    
    cd "$TEST_DIR"
    
    # Install dependencies if package.json exists
    if [[ -f "package.json" ]]; then
        print_info "Installing test dependencies..."
        npm install
        print_success "Dependencies installed"
    fi
    
    # Setup Docker environment if not disabled
    if [[ "${SKIP_DOCKER_SETUP:-false}" != "true" ]]; then
        if check_docker; then
            print_info "Starting test infrastructure with Docker..."
            
            # Start basic infrastructure (databases, mock services)
            docker-compose -f docker-compose.test.yml up -d postgres-test redis-test stripe-mock mailhog
            
            # Optionally start service containers
            if [[ "${START_SERVICES:-false}" == "true" ]]; then
                print_info "Starting service containers..."
                docker-compose -f docker-compose.test.yml --profile services up -d
            fi
            
            print_success "Docker environment started"
        else
            print_warning "Docker not available, assuming services are running externally"
        fi
    fi
    
    # Wait for services to be ready
    wait_for_services
    
    print_success "Test environment setup completed"
}

# Function to run specific test suites
run_test_suite() {
    local suite_name="$1"
    local test_pattern="${2:-}"
    
    print_header "Running $suite_name Tests"
    
    local jest_args=(
        "--config=jest.config.js"
        "--verbose"
        "--colors"
        "--testTimeout=30000"
    )
    
    # Add coverage if requested
    if [[ "${COVERAGE:-false}" == "true" ]]; then
        jest_args+=("--coverage")
    fi
    
    # Add specific test pattern if provided
    if [[ -n "$test_pattern" ]]; then
        jest_args+=("$test_pattern")
    fi
    
    # Run tests
    if npm test -- "${jest_args[@]}"; then
        print_success "$suite_name tests passed"
        return 0
    else
        print_error "$suite_name tests failed"
        return 1
    fi
}

# Function to cleanup test environment
cleanup_test_environment() {
    print_header "Cleaning Up Test Environment"
    
    if [[ "${SKIP_DOCKER_TEARDOWN:-false}" != "true" ]] && [[ "${CI:-false}" != "true" ]]; then
        cd "$TEST_DIR"
        
        print_info "Stopping Docker containers..."
        docker-compose -f docker-compose.test.yml down -v
        
        # Clean up any orphaned containers
        docker container prune -f
        
        print_success "Docker cleanup completed"
    fi
    
    print_success "Test environment cleanup completed"
}

# Function to generate test report
generate_test_report() {
    print_header "Generating Test Report"
    
    local report_dir="${TEST_DIR}/reports"
    mkdir -p "$report_dir"
    
    # Copy coverage reports if they exist
    if [[ -d "${TEST_DIR}/coverage" ]]; then
        cp -r "${TEST_DIR}/coverage" "$report_dir/"
        print_success "Coverage report copied to $report_dir/coverage"
    fi
    
    # Generate summary report
    cat > "$report_dir/test-summary.md" << EOF
# Integration Test Summary

**Test Run:** $(date)
**Duration:** ${test_duration:-Unknown}
**Environment:** ${NODE_ENV:-test}

## Test Results

- **Auth Service Tests:** ${auth_test_result:-Not Run}
- **Project Service Tests:** ${project_test_result:-Not Run}
- **AI Service Tests:** ${ai_test_result:-Not Run}
- **Billing Service Tests:** ${billing_test_result:-Not Run}
- **Notification Service Tests:** ${notification_test_result:-Not Run}
- **End-to-End Workflow Tests:** ${e2e_test_result:-Not Run}

## Coverage Summary

$([ -f "${TEST_DIR}/coverage/coverage-summary.json" ] && cat "${TEST_DIR}/coverage/coverage-summary.json" | jq -r '.total | "- **Lines:** \(.lines.pct)%\n- **Statements:** \(.statements.pct)%\n- **Functions:** \(.functions.pct)%\n- **Branches:** \(.branches.pct)%"' || echo "Coverage data not available")

## Logs

Test execution logs are available at: \`$LOG_FILE\`
EOF
    
    print_success "Test report generated at $report_dir/test-summary.md"
}

# Function to display help
show_help() {
    cat << EOF
Integration Test Runner for Zoptal Platform

Usage: $0 [OPTIONS] [TEST_SUITE]

Options:
  --setup-only         Only setup the test environment, don't run tests
  --cleanup-only       Only cleanup the test environment
  --skip-docker        Skip Docker setup and teardown
  --start-services     Start service containers with Docker
  --coverage           Generate coverage reports
  --watch              Run tests in watch mode
  --debug              Enable debug output
  --help               Show this help message

Test Suites:
  auth                 Run authentication service tests
  project              Run project service tests
  ai                   Run AI service tests
  billing              Run billing service tests
  notification         Run notification service tests
  workflows            Run end-to-end workflow tests
  all                  Run all test suites (default)

Environment Variables:
  SKIP_DOCKER_SETUP    Skip Docker setup (default: false)
  SKIP_DOCKER_TEARDOWN Skip Docker teardown (default: false)
  START_SERVICES       Start service containers (default: false)
  COVERAGE             Generate coverage reports (default: false)
  DEBUG                Enable debug output (default: false)
  NODE_ENV             Node environment (default: test)

Examples:
  $0                           # Run all tests
  $0 auth                      # Run only auth service tests
  $0 --coverage workflows      # Run workflow tests with coverage
  $0 --setup-only              # Only setup environment
  $0 --skip-docker auth        # Run auth tests without Docker
EOF
}

# Parse command line arguments
SETUP_ONLY=false
CLEANUP_ONLY=false
TEST_SUITE="all"
WATCH_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --setup-only)
            SETUP_ONLY=true
            shift
            ;;
        --cleanup-only)
            CLEANUP_ONLY=true
            shift
            ;;
        --skip-docker)
            export SKIP_DOCKER_SETUP=true
            export SKIP_DOCKER_TEARDOWN=true
            shift
            ;;
        --start-services)
            export START_SERVICES=true
            shift
            ;;
        --coverage)
            export COVERAGE=true
            shift
            ;;
        --watch)
            WATCH_MODE=true
            shift
            ;;
        --debug)
            export DEBUG=true
            export DEBUG_HTTP=true
            export DEBUG_REQUESTS=true
            export DEBUG_RESPONSES=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        auth|project|ai|billing|notification|workflows|all)
            TEST_SUITE="$1"
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Set test environment
export NODE_ENV=test

# Main execution
main() {
    local start_time=$(date +%s)
    local exit_code=0
    
    print_header "Zoptal Platform Integration Tests"
    print_info "Test suite: $TEST_SUITE"
    print_info "Environment: ${NODE_ENV:-test}"
    print_info "Log file: $LOG_FILE"
    
    # Trap to ensure cleanup on exit
    trap cleanup_test_environment EXIT
    
    try {
        # Cleanup only mode
        if [[ "$CLEANUP_ONLY" == "true" ]]; then
            cleanup_test_environment
            exit 0
        fi
        
        # Setup test environment
        setup_test_environment
        
        # Setup only mode
        if [[ "$SETUP_ONLY" == "true" ]]; then
            print_success "Test environment setup completed. Services are ready for testing."
            exit 0
        fi
        
        # Run tests based on suite selection
        case "$TEST_SUITE" in
            auth)
                run_test_suite "Authentication" "auth-service"
                auth_test_result="✓ Passed"
                ;;
            project)
                run_test_suite "Project" "project-service"
                project_test_result="✓ Passed"
                ;;
            ai)
                run_test_suite "AI" "ai-service"
                ai_test_result="✓ Passed"
                ;;
            billing)
                run_test_suite "Billing" "billing-service"
                billing_test_result="✓ Passed"
                ;;
            notification)
                run_test_suite "Notification" "notification-service"
                notification_test_result="✓ Passed"
                ;;
            workflows)
                run_test_suite "End-to-End Workflows" "workflows"
                e2e_test_result="✓ Passed"
                ;;
            all)
                # Run all test suites
                local suites=("auth-service" "workflows")
                local suite_names=("Authentication" "End-to-End Workflows")
                local failed_suites=()
                
                for i in "${!suites[@]}"; do
                    if ! run_test_suite "${suite_names[$i]}" "${suites[$i]}"; then
                        failed_suites+=("${suite_names[$i]}")
                        exit_code=1
                    fi
                done
                
                if [[ ${#failed_suites[@]} -eq 0 ]]; then
                    print_success "All test suites passed!"
                else
                    print_error "Failed test suites: ${failed_suites[*]}"
                fi
                ;;
        esac
        
    } catch {
        print_error "Test execution failed: $*"
        exit_code=1
    }
    
    # Calculate test duration
    local end_time=$(date +%s)
    local test_duration=$((end_time - start_time))
    local duration_formatted=$(printf '%02d:%02d:%02d' $((test_duration/3600)) $((test_duration%3600/60)) $((test_duration%60)))
    
    # Generate test report
    test_duration="$duration_formatted"
    generate_test_report
    
    print_header "Test Execution Summary"
    print_info "Duration: $duration_formatted"
    print_info "Exit code: $exit_code"
    
    if [[ $exit_code -eq 0 ]]; then
        print_success "Integration tests completed successfully!"
    else
        print_error "Integration tests failed!"
    fi
    
    exit $exit_code
}

# Helper functions for try/catch simulation
try() {
    [[ $- = *e* ]]; SAVED_OPT_E=$?
    set +e
}

catch() {
    export exception_code=$?
    (( SAVED_OPT_E )) && set +e
    return $exception_code
}

# Run main function
main "$@"