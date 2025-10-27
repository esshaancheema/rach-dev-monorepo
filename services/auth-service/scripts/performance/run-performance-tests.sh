#!/bin/bash

# Performance Testing Runner Script for Zoptal Auth Service
# This script orchestrates different types of performance tests using K6

set -e

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
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORTS_DIR="$PROJECT_ROOT/performance-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Default configuration
DEFAULT_ENV="local"
DEFAULT_PROFILE="load"
DEFAULT_DURATION="5m"
DEFAULT_VUS="50"
DEFAULT_API_URL="http://localhost:3000"

# Test types
AVAILABLE_TESTS=(
    "smoke"
    "load" 
    "stress"
    "spike"
    "volume"
    "endurance"
    "breakpoint"
    "custom"
)

# Usage function
usage() {
    echo -e "${CYAN}Performance Testing Runner for Zoptal Auth Service${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 [OPTIONS] [TEST_TYPE]"
    echo ""
    echo -e "${YELLOW}Available Test Types:${NC}"
    for test in "${AVAILABLE_TESTS[@]}"; do
        echo "  - $test"
    done
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  -e, --env ENV          Environment (local, dev, staging, prod) [default: $DEFAULT_ENV]"
    echo "  -p, --profile PROFILE  Test profile [default: $DEFAULT_PROFILE]"
    echo "  -u, --url URL          API base URL [default: $DEFAULT_API_URL]"
    echo "  -d, --duration TIME    Test duration [default: $DEFAULT_DURATION]"
    echo "  -v, --vus NUMBER       Virtual users [default: $DEFAULT_VUS]"
    echo "  -r, --rps NUMBER       Target requests per second"
    echo "  -t, --tag TAG          Add custom tag to test run"
    echo "  -o, --output FORMAT    Output format (json, html, txt) [default: all]"
    echo "  -c, --compare FILE     Compare with previous test results"
    echo "  -w, --warmup TIME      Warmup duration before test [default: 30s]"
    echo "  -s, --setup            Run setup phase (create test data)"
    echo "  -k, --keep-data        Keep test data after completion"
    echo "  -q, --quiet            Quiet mode (minimal output)"
    echo "  -h, --help             Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 smoke                           # Run smoke test with defaults"
    echo "  $0 load -e staging -v 100         # Run load test on staging with 100 VUs"
    echo "  $0 stress -d 10m -u https://api.zoptal.com  # Run stress test for 10 minutes"
    echo "  $0 custom -p endurance -t nightly # Run custom test with endurance profile"
    echo ""
}

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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_step "Checking dependencies..."
    
    # Check if k6 is installed
    if ! command -v k6 &> /dev/null; then
        log_error "k6 is not installed. Please install k6 first."
        echo "Visit: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    
    # Check k6 version
    K6_VERSION=$(k6 version | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    log_info "Using k6 version: $K6_VERSION"
    
    # Check if Node.js is available (for some utilities)
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js available: $NODE_VERSION"
    fi
    
    # Check if curl is available (for health checks)
    if ! command -v curl &> /dev/null; then
        log_warning "curl is not available. Health checks may not work."
    fi
    
    log_success "Dependencies check completed"
}

# Setup test environment
setup_environment() {
    log_step "Setting up test environment..."
    
    # Create reports directory
    mkdir -p "$REPORTS_DIR"
    
    # Create test-specific directory
    TEST_REPORT_DIR="$REPORTS_DIR/test_${TEST_TYPE}_${TIMESTAMP}"
    mkdir -p "$TEST_REPORT_DIR"
    
    log_info "Reports will be saved to: $TEST_REPORT_DIR"
    
    # Set environment variables
    export API_URL="$API_URL"
    export TEST_DURATION="$DURATION"
    export MAX_VUS="$VUS"
    export TEST_PROFILE="$PROFILE"
    export TEST_ENV="$ENV"
    export REPORTS_DIR="$TEST_REPORT_DIR"
    
    if [ -n "$RPS" ]; then
        export TARGET_RPS="$RPS"
    fi
    
    if [ -n "$TAG" ]; then
        export TEST_TAG="$TAG"
    fi
    
    log_success "Environment setup completed"
}

# Health check
health_check() {
    log_step "Performing health check on $API_URL..."
    
    if command -v curl &> /dev/null; then
        if curl -f -s "$API_URL/health" > /dev/null; then
            log_success "Health check passed"
        else
            log_warning "Health check failed. Service may not be ready."
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        log_warning "Skipping health check (curl not available)"
    fi
}

# Warmup phase
warmup() {
    if [ "$WARMUP_DURATION" != "0" ]; then
        log_step "Running warmup phase for $WARMUP_DURATION..."
        
        k6 run \
            --duration "$WARMUP_DURATION" \
            --vus 5 \
            --quiet \
            --no-summary \
            -e API_URL="$API_URL" \
            "$SCRIPT_DIR/k6-load-test.js" || log_warning "Warmup completed with warnings"
        
        log_success "Warmup phase completed"
        sleep 5
    fi
}

# Run smoke test
run_smoke_test() {
    log_step "Running smoke test..."
    
    k6 run \
        --vus 5 \
        --duration 1m \
        --tag testType=smoke \
        --tag environment="$ENV" \
        ${TAG:+--tag custom="$TAG"} \
        -e API_URL="$API_URL" \
        -e SCENARIO=smoke \
        --summary-export="$TEST_REPORT_DIR/smoke-summary.json" \
        "$SCRIPT_DIR/k6-load-test.js"
}

# Run load test
run_load_test() {
    log_step "Running load test..."
    
    k6 run \
        --vus "$VUS" \
        --duration "$DURATION" \
        --tag testType=load \
        --tag environment="$ENV" \
        ${TAG:+--tag custom="$TAG"} \
        -e API_URL="$API_URL" \
        -e SCENARIO=load \
        -e MAX_VUS="$VUS" \
        -e TEST_DURATION="$DURATION" \
        ${RPS:+-e TARGET_RPS="$RPS"} \
        --summary-export="$TEST_REPORT_DIR/load-summary.json" \
        "$SCRIPT_DIR/k6-load-test.js"
}

# Run stress test
run_stress_test() {
    log_step "Running stress test..."
    
    local stress_level="${STRESS_LEVEL:-high}"
    local max_users=$((VUS * 2))
    
    k6 run \
        --tag testType=stress \
        --tag environment="$ENV" \
        --tag stressLevel="$stress_level" \
        ${TAG:+--tag custom="$TAG"} \
        -e API_URL="$API_URL" \
        -e STRESS_LEVEL="$stress_level" \
        -e MAX_USERS="$max_users" \
        -e TEST_DURATION="$DURATION" \
        --summary-export="$TEST_REPORT_DIR/stress-summary.json" \
        "$SCRIPT_DIR/k6-stress-test.js"
}

# Run spike test
run_spike_test() {
    log_step "Running spike test..."
    
    k6 run \
        --tag testType=spike \
        --tag environment="$ENV" \
        ${TAG:+--tag custom="$TAG"} \
        -e API_URL="$API_URL" \
        -e SCENARIO=spike \
        -e MAX_VUS="$((VUS * 3))" \
        --summary-export="$TEST_REPORT_DIR/spike-summary.json" \
        "$SCRIPT_DIR/k6-load-test.js"
}

# Run volume test
run_volume_test() {
    log_step "Running volume test..."
    
    k6 run \
        --vus "$((VUS / 2))" \
        --duration "$DURATION" \
        --tag testType=volume \
        --tag environment="$ENV" \
        ${TAG:+--tag custom="$TAG"} \
        -e API_URL="$API_URL" \
        -e SCENARIO=volume \
        --summary-export="$TEST_REPORT_DIR/volume-summary.json" \
        "$SCRIPT_DIR/k6-load-test.js"
}

# Run endurance test
run_endurance_test() {
    log_step "Running endurance test..."
    
    local endurance_duration="${ENDURANCE_DURATION:-30m}"
    
    k6 run \
        --vus "$((VUS / 3))" \
        --duration "$endurance_duration" \
        --tag testType=endurance \
        --tag environment="$ENV" \
        ${TAG:+--tag custom="$TAG"} \
        -e API_URL="$API_URL" \
        -e SCENARIO=endurance \
        --summary-export="$TEST_REPORT_DIR/endurance-summary.json" \
        "$SCRIPT_DIR/k6-load-test.js"
}

# Run breakpoint test
run_breakpoint_test() {
    log_step "Running breakpoint test..."
    
    k6 run \
        --tag testType=breakpoint \
        --tag environment="$ENV" \
        ${TAG:+--tag custom="$TAG"} \
        -e API_URL="$API_URL" \
        -e BREAKING_POINT="$((VUS * 10))" \
        --summary-export="$TEST_REPORT_DIR/breakpoint-summary.json" \
        "$SCRIPT_DIR/k6-stress-test.js"
}

# Run custom test
run_custom_test() {
    log_step "Running custom test with profile: $PROFILE..."
    
    # Select script based on profile
    local script_file="$SCRIPT_DIR/k6-load-test.js"
    if [[ "$PROFILE" == *"stress"* ]] || [[ "$PROFILE" == "breakpoint" ]]; then
        script_file="$SCRIPT_DIR/k6-stress-test.js"
    fi
    
    k6 run \
        --vus "$VUS" \
        --duration "$DURATION" \
        --tag testType=custom \
        --tag profile="$PROFILE" \
        --tag environment="$ENV" \
        ${TAG:+--tag custom="$TAG"} \
        -e API_URL="$API_URL" \
        -e TEST_PROFILE="$PROFILE" \
        -e MAX_VUS="$VUS" \
        -e TEST_DURATION="$DURATION" \
        ${RPS:+-e TARGET_RPS="$RPS"} \
        --summary-export="$TEST_REPORT_DIR/custom-summary.json" \
        "$script_file"
}

# Generate reports
generate_reports() {
    log_step "Generating performance reports..."
    
    # Copy generated reports to test directory
    if [ -f "performance-report.html" ]; then
        mv performance-report.html "$TEST_REPORT_DIR/"
    fi
    
    if [ -f "performance-summary.txt" ]; then
        mv performance-summary.txt "$TEST_REPORT_DIR/"
    fi
    
    if [ -f "performance-results.json" ]; then
        mv performance-results.json "$TEST_REPORT_DIR/"
    fi
    
    if [ -f "stress-test-report.html" ]; then
        mv stress-test-report.html "$TEST_REPORT_DIR/"
    fi
    
    if [ -f "stress-test-summary.txt" ]; then
        mv stress-test-summary.txt "$TEST_REPORT_DIR/"
    fi
    
    if [ -f "stress-test-results.json" ]; then
        mv stress-test-results.json "$TEST_REPORT_DIR/"
    fi
    
    # Generate test metadata
    cat > "$TEST_REPORT_DIR/test-metadata.json" << EOF
{
    "testType": "$TEST_TYPE",
    "environment": "$ENV",
    "profile": "$PROFILE",
    "timestamp": "$TIMESTAMP",
    "configuration": {
        "apiUrl": "$API_URL",
        "duration": "$DURATION",
        "vus": "$VUS",
        "rps": "${RPS:-null}",
        "tag": "${TAG:-null}"
    },
    "system": {
        "os": "$(uname -s)",
        "architecture": "$(uname -m)",
        "k6Version": "$(k6 version | head -1)"
    }
}
EOF
    
    log_success "Reports generated in: $TEST_REPORT_DIR"
    
    # Show quick summary
    if [ -f "$TEST_REPORT_DIR/performance-summary.txt" ]; then
        echo -e "\n${CYAN}Quick Summary:${NC}"
        head -20 "$TEST_REPORT_DIR/performance-summary.txt" 2>/dev/null || true
    fi
    
    # Open HTML report if available and not in quiet mode
    if [ "$QUIET" != "true" ] && [ -f "$TEST_REPORT_DIR/performance-report.html" ]; then
        if command -v open &> /dev/null; then
            read -p "Open HTML report? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                open "$TEST_REPORT_DIR/performance-report.html"
            fi
        fi
    fi
}

# Compare with previous results
compare_results() {
    if [ -n "$COMPARE_FILE" ] && [ -f "$COMPARE_FILE" ]; then
        log_step "Comparing with previous results..."
        
        # Simple comparison logic (can be enhanced)
        echo -e "\n${CYAN}Performance Comparison:${NC}"
        echo "Previous: $COMPARE_FILE"
        echo "Current:  $TEST_REPORT_DIR"
        
        # Here you could add more sophisticated comparison logic
        log_info "Comparison completed (basic)"
    fi
}

# Cleanup function
cleanup() {
    log_step "Cleaning up..."
    
    if [ "$KEEP_DATA" != "true" ]; then
        # Clean up any temporary test data
        log_info "Removing temporary test data..."
    else
        log_info "Keeping test data as requested"
    fi
    
    # Remove any temporary files
    rm -f k6-*.log 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                ENV="$2"
                shift 2
                ;;
            -p|--profile)
                PROFILE="$2"
                shift 2
                ;;
            -u|--url)
                API_URL="$2"
                shift 2
                ;;
            -d|--duration)
                DURATION="$2"
                shift 2
                ;;
            -v|--vus)
                VUS="$2"
                shift 2
                ;;
            -r|--rps)
                RPS="$2"
                shift 2
                ;;
            -t|--tag)
                TAG="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_FORMAT="$2"
                shift 2
                ;;
            -c|--compare)
                COMPARE_FILE="$2"
                shift 2
                ;;
            -w|--warmup)
                WARMUP_DURATION="$2"
                shift 2
                ;;
            -s|--setup)
                SETUP_DATA="true"
                shift
                ;;
            -k|--keep-data)
                KEEP_DATA="true"
                shift
                ;;
            -q|--quiet)
                QUIET="true"
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                if [ -z "$TEST_TYPE" ]; then
                    TEST_TYPE="$1"
                else
                    log_error "Multiple test types specified"
                    usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
}

# Main function
main() {
    # Set default values
    ENV="$DEFAULT_ENV"
    PROFILE="$DEFAULT_PROFILE"
    API_URL="$DEFAULT_API_URL"
    DURATION="$DEFAULT_DURATION"
    VUS="$DEFAULT_VUS"
    WARMUP_DURATION="30s"
    QUIET="false"
    SETUP_DATA="false"
    KEEP_DATA="false"
    
    # Parse arguments
    parse_args "$@"
    
    # Default test type if not specified
    if [ -z "$TEST_TYPE" ]; then
        TEST_TYPE="load"
    fi
    
    # Validate test type
    if [[ ! " ${AVAILABLE_TESTS[@]} " =~ " $TEST_TYPE " ]]; then
        log_error "Invalid test type: $TEST_TYPE"
        echo "Available test types: ${AVAILABLE_TESTS[*]}"
        exit 1
    fi
    
    # Show configuration if not in quiet mode
    if [ "$QUIET" != "true" ]; then
        echo -e "${CYAN}Performance Test Configuration:${NC}"
        echo "  Test Type: $TEST_TYPE"
        echo "  Environment: $ENV"
        echo "  Profile: $PROFILE"
        echo "  API URL: $API_URL"
        echo "  Duration: $DURATION"
        echo "  Virtual Users: $VUS"
        [ -n "$RPS" ] && echo "  Target RPS: $RPS"
        [ -n "$TAG" ] && echo "  Custom Tag: $TAG"
        echo ""
    fi
    
    # Run the test pipeline
    check_dependencies
    setup_environment
    health_check
    warmup
    
    # Run the specific test
    case "$TEST_TYPE" in
        smoke)
            run_smoke_test
            ;;
        load)
            run_load_test
            ;;
        stress)
            run_stress_test
            ;;
        spike)
            run_spike_test
            ;;
        volume)
            run_volume_test
            ;;
        endurance)
            run_endurance_test
            ;;
        breakpoint)
            run_breakpoint_test
            ;;
        custom)
            run_custom_test
            ;;
        *)
            log_error "Unsupported test type: $TEST_TYPE"
            exit 1
            ;;
    esac
    
    # Post-test operations
    generate_reports
    compare_results
    cleanup
    
    log_success "Performance testing completed successfully!"
    echo -e "\n${GREEN}Reports saved to:${NC} $TEST_REPORT_DIR"
}

# Trap for cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"