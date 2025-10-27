#!/bin/bash

# Comprehensive test runner script for Zoptal monorepo
# This script runs unit tests, integration tests, and e2e tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_RESULTS_DIR="$ROOT_DIR/test-results"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed. Please install pnpm first."
        exit 1
    fi
    
    # Check if PostgreSQL is available
    if ! command -v postgres &> /dev/null && ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL first."
        exit 1
    fi
    
    # Check if Redis is available
    if ! command -v redis-server &> /dev/null; then
        print_error "Redis is not installed. Please install Redis first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to setup test environment
setup_test_environment() {
    print_info "Setting up test environment..."
    
    # Create test results directory
    mkdir -p "$TEST_RESULTS_DIR"
    
    # Install dependencies
    print_info "Installing dependencies..."
    cd "$ROOT_DIR"
    pnpm install --frozen-lockfile
    
    # Build packages
    print_info "Building packages..."
    pnpm build:packages
    
    print_success "Test environment setup completed!"
}

# Function to run unit tests
run_unit_tests() {
    print_info "Running unit tests..."
    cd "$ROOT_DIR"
    
    # Run unit tests with coverage
    pnpm vitest run --config vitest.config.ts --coverage --reporter=verbose \
        tests/unit/**/*.test.ts \
        services/*/tests/unit/**/*.test.ts \
        packages/*/tests/unit/**/*.test.ts
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_success "Unit tests passed!"
    else
        print_error "Unit tests failed!"
        return $exit_code
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_info "Running integration tests..."
    cd "$ROOT_DIR"
    
    # Start test databases and services
    print_info "Starting test infrastructure..."
    node -r esbuild-register tests/setup/global-setup.ts
    
    # Wait for services to be ready
    sleep 10
    
    # Run integration tests
    pnpm vitest run --config vitest.config.ts --reporter=verbose \
        tests/integration/**/*.test.ts \
        services/*/tests/integration/**/*.test.ts
    
    local exit_code=$?
    
    # Cleanup test infrastructure
    print_info "Cleaning up test infrastructure..."
    node -r esbuild-register tests/setup/global-setup.ts --teardown
    
    if [ $exit_code -eq 0 ]; then
        print_success "Integration tests passed!"
    else
        print_error "Integration tests failed!"
        return $exit_code
    fi
}

# Function to run e2e tests
run_e2e_tests() {
    print_info "Running E2E tests..."
    cd "$ROOT_DIR"
    
    # Install Playwright browsers if not already installed
    print_info "Installing Playwright browsers..."
    npx playwright install
    
    # Run E2E tests
    pnpm playwright test --config playwright.config.ts
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_success "E2E tests passed!"
    else
        print_error "E2E tests failed!"
        return $exit_code
    fi
}

# Function to run service-specific tests
run_service_tests() {
    local service_name=$1
    print_info "Running tests for $service_name..."
    
    cd "$ROOT_DIR/services/$service_name"
    
    if [ -f "package.json" ] && grep -q "test" package.json; then
        pnpm test
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            print_success "$service_name tests passed!"
        else
            print_error "$service_name tests failed!"
            return $exit_code
        fi
    else
        print_warning "No tests found for $service_name"
    fi
}

# Function to run all service tests
run_all_service_tests() {
    print_info "Running all service tests..."
    
    local services=(
        "auth-service"
        "project-service"
        "ai-service"
        "billing-service"
        "notification-service"
        "analytics-service"
    )
    
    for service in "${services[@]}"; do
        if [ -d "$ROOT_DIR/services/$service" ]; then
            run_service_tests "$service"
        else
            print_warning "Service $service not found"
        fi
    done
}

# Function to run package tests
run_package_tests() {
    print_info "Running package tests..."
    
    local packages=(
        "database"
        "ui"
        "auth"
        "api-client"
    )
    
    for package in "${packages[@]}"; do
        if [ -d "$ROOT_DIR/packages/$package" ]; then
            print_info "Running tests for package $package..."
            cd "$ROOT_DIR/packages/$package"
            
            if [ -f "package.json" ] && grep -q "test" package.json; then
                pnpm test
                local exit_code=$?
                
                if [ $exit_code -eq 0 ]; then
                    print_success "$package tests passed!"
                else
                    print_error "$package tests failed!"
                    return $exit_code
                fi
            else
                print_warning "No tests found for package $package"
            fi
        else
            print_warning "Package $package not found"
        fi
    done
}

# Function to generate test report
generate_test_report() {
    print_info "Generating test report..."
    
    local report_file="$TEST_RESULTS_DIR/test-summary.md"
    
    cat > "$report_file" << EOF
# Zoptal Test Report

**Generated on:** $(date)

## Test Results Summary

### Unit Tests
- **Status:** $([ -f "$TEST_RESULTS_DIR/vitest-results.json" ] && echo "✅ Completed" || echo "❌ Failed")
- **Coverage Report:** [HTML Coverage Report](./coverage/index.html)

### Integration Tests
- **Status:** $([ -f "$TEST_RESULTS_DIR/integration-results.json" ] && echo "✅ Completed" || echo "❌ Failed")

### E2E Tests
- **Status:** $([ -f "$TEST_RESULTS_DIR/results.json" ] && echo "✅ Completed" || echo "❌ Failed")
- **Playwright Report:** [HTML Report](./html-report/index.html)

## Files Generated
- Unit Test Results: \`vitest-results.json\`
- Integration Test Results: \`integration-results.json\`
- E2E Test Results: \`results.json\`
- Coverage Report: \`coverage/\`
- Playwright Report: \`html-report/\`

## Next Steps
1. Review failed tests if any
2. Check coverage reports for areas needing more tests
3. Update tests based on new features or bug fixes
EOF

    print_success "Test report generated: $report_file"
}

# Function to clean test artifacts
clean_test_artifacts() {
    print_info "Cleaning test artifacts..."
    
    # Remove test results directory
    rm -rf "$TEST_RESULTS_DIR"
    
    # Remove node_modules/.cache if it exists
    find "$ROOT_DIR" -name "node_modules/.cache" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove playwright test results
    rm -rf "$ROOT_DIR/test-results" 2>/dev/null || true
    rm -rf "$ROOT_DIR/playwright-report" 2>/dev/null || true
    
    print_success "Test artifacts cleaned!"
}

# Function to show help
show_help() {
    echo "Comprehensive test runner for Zoptal monorepo"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  all                  Run all tests (unit, integration, e2e)"
    echo "  unit                 Run unit tests only"
    echo "  integration         Run integration tests only"
    echo "  e2e                 Run E2E tests only"
    echo "  services            Run all service tests"
    echo "  service SERVICE     Run tests for specific service"
    echo "  packages            Run all package tests"
    echo "  setup               Setup test environment only"
    echo "  clean               Clean test artifacts"
    echo "  report              Generate test report"
    echo "  help                Show this help message"
    echo ""
    echo "Options:"
    echo "  --coverage          Generate coverage report (for unit tests)"
    echo "  --headed           Run e2e tests in headed mode"
    echo "  --debug            Run tests in debug mode"
    echo ""
    echo "Examples:"
    echo "  $0 all"
    echo "  $0 unit --coverage"
    echo "  $0 service auth-service"
    echo "  $0 e2e --headed"
    echo "  $0 clean"
}

# Main execution
main() {
    local command="${1:-help}"
    local exit_code=0
    
    case "$command" in
        "all")
            check_prerequisites
            setup_test_environment
            run_unit_tests || exit_code=$?
            run_integration_tests || exit_code=$?
            run_e2e_tests || exit_code=$?
            run_all_service_tests || exit_code=$?
            run_package_tests || exit_code=$?
            generate_test_report
            ;;
        "unit")
            check_prerequisites
            setup_test_environment
            run_unit_tests || exit_code=$?
            ;;
        "integration")
            check_prerequisites
            setup_test_environment
            run_integration_tests || exit_code=$?
            ;;
        "e2e")
            check_prerequisites
            setup_test_environment
            run_e2e_tests || exit_code=$?
            ;;
        "services")
            check_prerequisites
            setup_test_environment
            run_all_service_tests || exit_code=$?
            ;;
        "service")
            if [ -z "$2" ]; then
                print_error "Service name is required"
                show_help
                exit 1
            fi
            check_prerequisites
            setup_test_environment
            run_service_tests "$2" || exit_code=$?
            ;;
        "packages")
            check_prerequisites
            setup_test_environment
            run_package_tests || exit_code=$?
            ;;
        "setup")
            check_prerequisites
            setup_test_environment
            ;;
        "clean")
            clean_test_artifacts
            ;;
        "report")
            generate_test_report
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
    
    if [ $exit_code -eq 0 ]; then
        print_success "All tests completed successfully!"
    else
        print_error "Some tests failed. Exit code: $exit_code"
    fi
    
    exit $exit_code
}

# Execute main function with all arguments
main "$@"