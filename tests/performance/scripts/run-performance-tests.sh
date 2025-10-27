#!/bin/bash

# Comprehensive Performance Test Runner
# Runs all K6 and Artillery performance tests in sequence or parallel

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PERF_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$(dirname "$PERF_DIR")")"
RESULTS_DIR="$PERF_DIR/results"
LOG_FILE="$RESULTS_DIR/performance-tests-$(date +%Y%m%d_%H%M%S).log"

# Default settings
RUN_K6=true
RUN_ARTILLERY=true
PARALLEL_EXECUTION=false
ENVIRONMENT="development"
CLEANUP_AFTER=true
GENERATE_REPORTS=true

# Test categories
K6_TESTS=(
    "api-performance"
    "auth-performance" 
    "load-test"
    "stress-test"
)

ARTILLERY_TESTS=(
    "websocket-test"
    "file-upload-test"
    "realtime-test"
)

# Logging functions
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_header() {
    echo -e "\n${PURPLE}=== $1 ===${NC}" | tee -a "$LOG_FILE"
}

# Help function
show_help() {
    cat << EOF
Performance Test Runner for Zoptal Platform

Usage: $0 [OPTIONS]

Options:
  --k6-only              Run only K6 tests
  --artillery-only       Run only Artillery tests
  --parallel             Run tests in parallel (faster but more resource intensive)
  --environment ENV      Set environment (development|staging|production) [default: development]
  --no-cleanup          Don't cleanup test data after completion
  --no-reports          Skip report generation
  --list-tests          List available tests
  --test NAME           Run specific test only
  --help                Show this help message

Test Categories:
  K6 Tests:
    - api-performance    : API endpoint performance testing
    - auth-performance   : Authentication flow testing  
    - load-test         : Comprehensive load testing
    - stress-test       : Stress and breaking point testing

  Artillery Tests:
    - websocket-test    : WebSocket and real-time performance
    - file-upload-test  : File upload performance testing
    - realtime-test     : Comprehensive real-time features

Examples:
  $0                                    # Run all tests sequentially
  $0 --parallel                         # Run all tests in parallel
  $0 --k6-only --environment staging     # Run only K6 tests on staging
  $0 --test load-test                   # Run specific test
  $0 --artillery-only --no-cleanup      # Run Artillery tests without cleanup

Environment Variables:
  API_BASE_URL          API base URL (default: http://localhost:3001)
  BASE_URL              Web app base URL (default: http://localhost:3000)
  TEST_USER_EMAIL       Test user email (default: perftest@example.com)
  TEST_USER_PASSWORD    Test user password (default: PerfTest123!)
  MAX_VIRTUAL_USERS     Maximum virtual users (default: 100)
  TEST_DURATION         Test duration (default: 5m)
  RESULTS_DIR           Results directory (default: ./results)

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --k6-only)
                RUN_ARTILLERY=false
                shift
                ;;
            --artillery-only)
                RUN_K6=false
                shift
                ;;
            --parallel)
                PARALLEL_EXECUTION=true
                shift
                ;;
            --environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --no-cleanup)
                CLEANUP_AFTER=false
                shift
                ;;
            --no-reports)
                GENERATE_REPORTS=false
                shift
                ;;
            --list-tests)
                list_tests
                exit 0
                ;;
            --test)
                SPECIFIC_TEST="$2"
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

# List available tests
list_tests() {
    log_header "Available Performance Tests"
    
    echo -e "${BLUE}K6 Tests:${NC}"
    for test in "${K6_TESTS[@]}"; do
        echo "  - $test"
    done
    
    echo -e "\n${BLUE}Artillery Tests:${NC}"
    for test in "${ARTILLERY_TESTS[@]}"; do
        echo "  - $test"
    done
}

# Check prerequisites
check_prerequisites() {
    log_header "Checking Prerequisites"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if K6 is installed (if running K6 tests)
    if [[ "$RUN_K6" == "true" ]] && ! command -v k6 &> /dev/null; then
        log_warning "K6 is not installed. Installing via npm..."
        npm install -g k6 || {
            log_error "Failed to install K6"
            exit 1
        }
    fi
    
    # Check if Artillery is installed (if running Artillery tests)
    if [[ "$RUN_ARTILLERY" == "true" ]] && ! command -v artillery &> /dev/null; then
        log_warning "Artillery is not installed. Installing..."
        cd "$PERF_DIR"
        npm install artillery || {
            log_error "Failed to install Artillery"
            exit 1
        }
    fi
    
    # Create results directory
    mkdir -p "$RESULTS_DIR"
    
    log_success "Prerequisites check completed"
}

# Setup test environment
setup_environment() {
    log_header "Setting Up Test Environment"
    
    # Export environment variables
    export NODE_ENV="$ENVIRONMENT"
    export API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
    export BASE_URL="${BASE_URL:-http://localhost:3000}"
    export TEST_USER_EMAIL="${TEST_USER_EMAIL:-perftest@example.com}"
    export TEST_USER_PASSWORD="${TEST_USER_PASSWORD:-PerfTest123!}"
    export MAX_VIRTUAL_USERS="${MAX_VIRTUAL_USERS:-100}"
    export TEST_DURATION="${TEST_DURATION:-5m}"
    export RESULTS_DIR="$RESULTS_DIR"
    
    # Install dependencies
    cd "$PERF_DIR"
    if [[ -f "package.json" ]]; then
        log_info "Installing performance test dependencies..."
        npm install --silent
    fi
    
    # Create authentication token if needed
    if [[ -z "${TEST_AUTH_TOKEN:-}" ]]; then
        log_info "Creating test authentication token..."
        create_test_auth_token
    fi
    
    log_success "Environment setup completed"
}

# Create test authentication token
create_test_auth_token() {
    local auth_response
    
    auth_response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}" \
        --max-time 30 || echo "")
    
    if [[ -n "$auth_response" ]] && echo "$auth_response" | jq -e '.tokens.accessToken' &> /dev/null; then
        export TEST_AUTH_TOKEN=$(echo "$auth_response" | jq -r '.tokens.accessToken')
        export TEST_USER_ID=$(echo "$auth_response" | jq -r '.user.id')
        log_success "Test authentication token created"
    else
        log_warning "Could not create test auth token - tests may fail if authentication is required"
    fi
}

# Run K6 tests
run_k6_tests() {
    if [[ "$RUN_K6" != "true" ]]; then
        return 0
    fi
    
    log_header "Running K6 Performance Tests"
    
    local failed_tests=()
    local test_pids=()
    
    for test in "${K6_TESTS[@]}"; do
        # Skip if specific test requested and this isn't it
        if [[ -n "${SPECIFIC_TEST:-}" ]] && [[ "$test" != "$SPECIFIC_TEST" ]]; then
            continue
        fi
        
        local test_file="$PERF_DIR/k6/scenarios/${test}.js"
        
        if [[ ! -f "$test_file" ]]; then
            log_error "K6 test file not found: $test_file"
            failed_tests+=("$test")
            continue
        fi
        
        log_info "Starting K6 test: $test"
        
        if [[ "$PARALLEL_EXECUTION" == "true" ]]; then
            # Run in background
            (
                k6 run "$test_file" \
                    --out json="$RESULTS_DIR/k6-${test}-results.json" \
                    --quiet \
                    && log_success "K6 test completed: $test" \
                    || { log_error "K6 test failed: $test"; echo "$test" >> "$RESULTS_DIR/failed-k6-tests.txt"; }
            ) &
            test_pids+=($!)
        else
            # Run sequentially
            if k6 run "$test_file" --out json="$RESULTS_DIR/k6-${test}-results.json"; then
                log_success "K6 test completed: $test"
            else
                log_error "K6 test failed: $test"
                failed_tests+=("$test")
            fi
        fi
    done
    
    # Wait for parallel tests to complete
    if [[ "$PARALLEL_EXECUTION" == "true" && ${#test_pids[@]} -gt 0 ]]; then
        log_info "Waiting for parallel K6 tests to complete..."
        wait "${test_pids[@]}"
        
        # Check for failed tests
        if [[ -f "$RESULTS_DIR/failed-k6-tests.txt" ]]; then
            while IFS= read -r failed_test; do
                failed_tests+=("$failed_test")
            done < "$RESULTS_DIR/failed-k6-tests.txt"
            rm -f "$RESULTS_DIR/failed-k6-tests.txt"
        fi
    fi
    
    # Report K6 results
    if [[ ${#failed_tests[@]} -eq 0 ]]; then
        log_success "All K6 tests completed successfully"
    else
        log_error "K6 tests failed: ${failed_tests[*]}"
    fi
}

# Run Artillery tests
run_artillery_tests() {
    if [[ "$RUN_ARTILLERY" != "true" ]]; then
        return 0
    fi
    
    log_header "Running Artillery Performance Tests"
    
    local failed_tests=()
    local test_pids=()
    
    for test in "${ARTILLERY_TESTS[@]}"; do
        # Skip if specific test requested and this isn't it
        if [[ -n "${SPECIFIC_TEST:-}" ]] && [[ "$test" != "$SPECIFIC_TEST" ]]; then
            continue
        fi
        
        local test_file="$PERF_DIR/artillery/scenarios/${test}.yml"
        
        if [[ ! -f "$test_file" ]]; then
            log_error "Artillery test file not found: $test_file"
            failed_tests+=("$test")
            continue
        fi
        
        log_info "Starting Artillery test: $test"
        
        if [[ "$PARALLEL_EXECUTION" == "true" ]]; then
            # Run in background
            (
                artillery run "$test_file" \
                    --output "$RESULTS_DIR/artillery-${test}-results.json" \
                    && log_success "Artillery test completed: $test" \
                    || { log_error "Artillery test failed: $test"; echo "$test" >> "$RESULTS_DIR/failed-artillery-tests.txt"; }
            ) &
            test_pids+=($!)
        else
            # Run sequentially
            if artillery run "$test_file" --output "$RESULTS_DIR/artillery-${test}-results.json"; then
                log_success "Artillery test completed: $test"
            else
                log_error "Artillery test failed: $test"
                failed_tests+=("$test")
            fi
        fi
    done
    
    # Wait for parallel tests to complete
    if [[ "$PARALLEL_EXECUTION" == "true" && ${#test_pids[@]} -gt 0 ]]; then
        log_info "Waiting for parallel Artillery tests to complete..."
        wait "${test_pids[@]}"
        
        # Check for failed tests
        if [[ -f "$RESULTS_DIR/failed-artillery-tests.txt" ]]; then
            while IFS= read -r failed_test; do
                failed_tests+=("$failed_test")
            done < "$RESULTS_DIR/failed-artillery-tests.txt"
            rm -f "$RESULTS_DIR/failed-artillery-tests.txt"
        fi
    fi
    
    # Report Artillery results
    if [[ ${#failed_tests[@]} -eq 0 ]]; then
        log_success "All Artillery tests completed successfully"
    else
        log_error "Artillery tests failed: ${failed_tests[*]}"
    fi
}

# Generate comprehensive reports
generate_reports() {
    if [[ "$GENERATE_REPORTS" != "true" ]]; then
        return 0
    fi
    
    log_header "Generating Performance Reports"
    
    # Generate consolidated HTML report
    node "$SCRIPT_DIR/generate-consolidated-report.js" "$RESULTS_DIR"
    
    # Generate performance dashboard
    if [[ -f "$SCRIPT_DIR/generate-dashboard.js" ]]; then
        node "$SCRIPT_DIR/generate-dashboard.js" "$RESULTS_DIR"
    fi
    
    # Generate CSV summary
    if [[ -f "$SCRIPT_DIR/generate-csv-summary.js" ]]; then
        node "$SCRIPT_DIR/generate-csv-summary.js" "$RESULTS_DIR"
    fi
    
    log_success "Performance reports generated in $RESULTS_DIR"
}

# Cleanup test data
cleanup_test_data() {
    if [[ "$CLEANUP_AFTER" != "true" ]]; then
        return 0
    fi
    
    log_header "Cleaning Up Test Data"
    
    # Remove test users and projects created during performance testing
    if [[ -n "${TEST_AUTH_TOKEN:-}" ]]; then
        curl -s -X DELETE "$API_BASE_URL/test/cleanup" \
            -H "Authorization: Bearer $TEST_AUTH_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"testTag":"performance-test"}' || true
    fi
    
    log_success "Test data cleanup completed"
}

# Generate final summary
generate_summary() {
    log_header "Performance Test Summary"
    
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    
    # Count test results
    for result_file in "$RESULTS_DIR"/*.json; do
        if [[ -f "$result_file" ]]; then
            ((total_tests++))
            # Basic check if test passed (more sophisticated analysis in report generation)
            if grep -q '"http_req_failed".*"rate":0' "$result_file" 2>/dev/null || 
               grep -q '"errors":0' "$result_file" 2>/dev/null; then
                ((passed_tests++))
            else
                ((failed_tests++))
            fi
        fi
    done
    
    # Generate summary
    cat > "$RESULTS_DIR/test-summary.txt" << EOF
Performance Test Execution Summary
================================

Execution Details:
- Start Time: $(date)
- Environment: $ENVIRONMENT
- Total Tests: $total_tests
- Passed Tests: $passed_tests
- Failed Tests: $failed_tests
- Success Rate: $(( passed_tests * 100 / total_tests ))%

Test Configuration:
- K6 Tests: $RUN_K6
- Artillery Tests: $RUN_ARTILLERY
- Parallel Execution: $PARALLEL_EXECUTION
- Environment: $ENVIRONMENT

Results Directory: $RESULTS_DIR
Log File: $LOG_FILE

Next Steps:
1. Review detailed reports in $RESULTS_DIR
2. Analyze performance metrics and identify bottlenecks
3. Compare results with baseline performance
4. Update infrastructure or application code as needed
EOF
    
    log_info "Summary:"
    log_info "  Total Tests: $total_tests"
    log_info "  Passed: $passed_tests"
    log_info "  Failed: $failed_tests"
    
    if [[ $failed_tests -eq 0 ]]; then
        log_success "All performance tests completed successfully! 🎉"
    else
        log_warning "Some performance tests failed. Check detailed reports for analysis."
    fi
}

# Main execution function
main() {
    local start_time=$(date +%s)
    
    log_header "Zoptal Platform Performance Testing Suite"
    log_info "Starting performance test execution..."
    
    # Parse arguments
    parse_arguments "$@"
    
    # Setup
    check_prerequisites
    setup_environment
    
    # Run tests
    run_k6_tests
    run_artillery_tests
    
    # Post-test actions
    generate_reports
    cleanup_test_data
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_formatted=$(printf '%02d:%02d:%02d' $((duration/3600)) $((duration%3600/60)) $((duration%60)))
    
    # Generate summary
    generate_summary
    
    log_header "Performance Testing Complete"
    log_info "Total Duration: $duration_formatted"
    log_info "Results available in: $RESULTS_DIR"
    
    # Open results if in interactive mode
    if [[ -t 1 ]] && command -v open &> /dev/null; then
        if [[ -f "$RESULTS_DIR/consolidated-report.html" ]]; then
            log_info "Opening performance report..."
            open "$RESULTS_DIR/consolidated-report.html"
        fi
    fi
}

# Run main function with all arguments
main "$@"