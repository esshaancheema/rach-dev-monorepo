#!/bin/bash

# Performance Testing Runner for Zoptal Auth Service
# This script orchestrates all k6 performance tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TESTS_DIR="$PROJECT_DIR/tests/performance"
REPORTS_DIR="$PROJECT_DIR/reports"

# Default values
TEST_TYPE="all"
TARGET_URL="http://localhost:3001"
PARALLEL=false
SKIP_SETUP=false
SKIP_CLEANUP=false
OUTPUT_FORMAT="html"
VERBOSE=false
DRY_RUN=false

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[⚠] $1${NC}"
}

error() {
    echo -e "${RED}[✗] $1${NC}"
    exit 1
}

info() {
    echo -e "${PURPLE}[ℹ] $1${NC}"
}

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Run k6 performance tests for Zoptal Auth Service

OPTIONS:
    -t, --test-type TYPE     Test type: load|stress|spike|endurance|all [default: all]
    -u, --url URL           Target URL [default: http://localhost:3001]
    -p, --parallel          Run tests in parallel (where applicable)
    -s, --skip-setup        Skip test environment setup
    -c, --skip-cleanup      Skip post-test cleanup
    -f, --format FORMAT     Output format: html|json|both [default: html]
    -v, --verbose           Enable verbose output
    -d, --dry-run           Show what would be run without executing
    -h, --help              Show this help message

TEST TYPES:
    load        Normal load testing (26 minutes)
    stress      Stress testing to find breaking points (42 minutes)
    spike       Spike testing for sudden load increases (23 minutes)
    endurance   Long-running stability testing (2+ hours)
    all         Run all tests sequentially

EXAMPLES:
    $0                                    # Run all tests
    $0 -t load                           # Run only load test
    $0 -t stress -u https://api.zoptal.com  # Stress test production
    $0 -t spike --parallel               # Run spike test with parallel monitoring
    $0 --dry-run                         # Show test plan without running

REQUIREMENTS:
    - k6 installed (https://k6.io/docs/getting-started/installation/)
    - Target service running and accessible
    - Sufficient system resources for test load

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--test-type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -u|--url)
            TARGET_URL="$2"
            shift 2
            ;;
        -p|--parallel)
            PARALLEL=true
            shift
            ;;
        -s|--skip-setup)
            SKIP_SETUP=true
            shift
            ;;
        -c|--skip-cleanup)
            SKIP_CLEANUP=true
            shift
            ;;
        -f|--format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
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

# Validate test type
if [[ ! "$TEST_TYPE" =~ ^(load|stress|spike|endurance|all)$ ]]; then
    error "Invalid test type: $TEST_TYPE. Must be one of: load, stress, spike, endurance, all"
fi

# Validate output format
if [[ ! "$OUTPUT_FORMAT" =~ ^(html|json|both)$ ]]; then
    error "Invalid output format: $OUTPUT_FORMAT. Must be one of: html, json, both"
fi

# Set verbose mode
if [ "$VERBOSE" = true ]; then
    set -x
fi

log "🚀 Starting Zoptal Auth Service Performance Testing"
log "Target URL: $TARGET_URL"
log "Test Type: $TEST_TYPE"
log "Output Format: $OUTPUT_FORMAT"

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if k6 is installed
    if ! command -v k6 &> /dev/null; then
        error "k6 is not installed. Install from https://k6.io/docs/getting-started/installation/"
    fi
    
    # Check if target URL is accessible
    if ! curl -sf --max-time 10 "$TARGET_URL/health" > /dev/null; then
        error "Target URL $TARGET_URL is not accessible. Ensure the service is running."
    fi
    
    # Check if test files exist
    if [ ! -f "$TESTS_DIR/k6-setup.js" ]; then
        error "Test setup file not found: $TESTS_DIR/k6-setup.js"
    fi
    
    success "Prerequisites check passed"
}

# Setup test environment
setup_test_environment() {
    if [ "$SKIP_SETUP" = true ]; then
        log "Skipping test environment setup"
        return
    fi
    
    log "Setting up test environment..."
    
    # Create reports directory
    mkdir -p "$REPORTS_DIR"
    
    # Check service health
    local health_response=$(curl -sf "$TARGET_URL/health" 2>/dev/null || echo "failed")
    if [[ "$health_response" == "failed" ]]; then
        error "Service health check failed. Ensure the service is running and healthy."
    fi
    
    # Get initial metrics for baseline
    curl -sf "$TARGET_URL/metrics" > "$REPORTS_DIR/baseline-metrics.json" 2>/dev/null || true
    
    success "Test environment setup completed"
}

# Run individual test
run_test() {
    local test_name="$1"
    local test_file="$2"
    local estimated_time="$3"
    
    log "🧪 Running $test_name test (estimated time: $estimated_time)"
    
    if [ "$DRY_RUN" = true ]; then
        info "DRY RUN: Would execute: k6 run -e BASE_URL=$TARGET_URL $test_file"
        return 0
    fi
    
    local start_time=$(date +%s)
    
    # Set k6 environment variables
    export BASE_URL="$TARGET_URL"
    export ADMIN_EMAIL="admin@test.com"
    export ADMIN_PASSWORD="AdminPass123!"
    
    # Run the test
    if k6 run \
        -e BASE_URL="$TARGET_URL" \
        -e ADMIN_EMAIL="admin@test.com" \
        -e ADMIN_PASSWORD="AdminPass123!" \
        "$test_file"; then
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        local duration_formatted=$(printf '%02d:%02d:%02d' $((duration/3600)) $((duration%3600/60)) $((duration%60)))
        
        success "$test_name test completed successfully in $duration_formatted"
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        local duration_formatted=$(printf '%02d:%02d:%02d' $((duration/3600)) $((duration%3600/60)) $((duration%60)))
        
        error "$test_name test failed after $duration_formatted"
        return 1
    fi
}

# Run load test
run_load_test() {
    run_test "Load" "$TESTS_DIR/load-test.js" "26 minutes"
}

# Run stress test
run_stress_test() {
    run_test "Stress" "$TESTS_DIR/stress-test.js" "42 minutes"
}

# Run spike test
run_spike_test() {
    run_test "Spike" "$TESTS_DIR/spike-test.js" "23 minutes"
}

# Run endurance test
run_endurance_test() {
    warning "Endurance test will run for 2+ hours. Ensure system stability."
    read -p "Continue with endurance test? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Endurance test skipped"
        return 0
    fi
    
    run_test "Endurance" "$TESTS_DIR/endurance-test.js" "2+ hours"
}

# Generate summary report
generate_summary_report() {
    log "📊 Generating test summary report..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local summary_file="$REPORTS_DIR/performance-summary-$timestamp.html"
    
    cat > "$summary_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Zoptal Auth Service Performance Test Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        .metric { margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Zoptal Auth Service Performance Test Summary</h1>
        <p><strong>Target:</strong> $TARGET_URL</p>
        <p><strong>Date:</strong> $(date)</p>
        <p><strong>Test Type:</strong> $TEST_TYPE</p>
    </div>
    
    <div class="test-section">
        <h2>📋 Test Overview</h2>
        <table>
            <tr><th>Test Type</th><th>Status</th><th>Duration</th><th>Key Metrics</th></tr>
EOF

    # Add test results to summary (this would be populated based on actual results)
    if [ -f "$REPORTS_DIR/load-test-"*.json ]; then
        echo "<tr><td>Load Test</td><td class='success'>✓ Completed</td><td>~26 min</td><td>Check detailed report</td></tr>" >> "$summary_file"
    fi
    
    if [ -f "$REPORTS_DIR/stress-test-"*.json ]; then
        echo "<tr><td>Stress Test</td><td class='success'>✓ Completed</td><td>~42 min</td><td>Check detailed report</td></tr>" >> "$summary_file"
    fi
    
    if [ -f "$REPORTS_DIR/spike-test-"*.json ]; then
        echo "<tr><td>Spike Test</td><td class='success'>✓ Completed</td><td>~23 min</td><td>Check detailed report</td></tr>" >> "$summary_file"
    fi
    
    if [ -f "$REPORTS_DIR/endurance-test-"*.json ]; then
        echo "<tr><td>Endurance Test</td><td class='success'>✓ Completed</td><td>2+ hours</td><td>Check detailed report</td></tr>" >> "$summary_file"
    fi
    
    cat >> "$summary_file" << EOF
        </table>
    </div>
    
    <div class="test-section">
        <h2>📊 Key Recommendations</h2>
        <ul>
            <li>Review detailed reports for specific performance metrics</li>
            <li>Monitor response times and error rates in production</li>
            <li>Set up automated performance regression testing</li>
            <li>Consider scaling strategies based on load test results</li>
            <li>Implement circuit breaker recommendations from stress tests</li>
        </ul>
    </div>
    
    <div class="test-section">
        <h2>📁 Report Files</h2>
        <p>All detailed reports are available in: <code>$REPORTS_DIR/</code></p>
        <ul>
EOF

    # List all generated reports
    for report in "$REPORTS_DIR"/*.html "$REPORTS_DIR"/*.json; do
        if [ -f "$report" ]; then
            echo "<li><a href='$(basename "$report")'>$(basename "$report")</a></li>" >> "$summary_file"
        fi
    done
    
    cat >> "$summary_file" << EOF
        </ul>
    </div>
</body>
</html>
EOF
    
    success "Summary report generated: $summary_file"
}

# Cleanup test environment
cleanup_test_environment() {
    if [ "$SKIP_CLEANUP" = true ]; then
        log "Skipping test environment cleanup"
        return
    fi
    
    log "🧹 Cleaning up test environment..."
    
    # Get final metrics
    curl -sf "$TARGET_URL/metrics" > "$REPORTS_DIR/final-metrics.json" 2>/dev/null || true
    
    # Reset any test data (if applicable)
    # This would depend on your specific service cleanup needs
    
    success "Test environment cleanup completed"
}

# Main execution
main() {
    local overall_start_time=$(date +%s)
    
    # Check prerequisites
    check_prerequisites
    
    # Setup test environment
    setup_test_environment
    
    # Change to tests directory
    cd "$TESTS_DIR"
    
    # Run tests based on type
    case $TEST_TYPE in
        load)
            run_load_test
            ;;
        stress)
            run_stress_test
            ;;
        spike)
            run_spike_test
            ;;
        endurance)
            run_endurance_test
            ;;
        all)
            if [ "$PARALLEL" = true ]; then
                warning "Parallel execution not recommended for 'all' tests due to resource constraints"
                warning "Running tests sequentially for better results"
            fi
            
            log "🏃 Running all performance tests sequentially..."
            
            run_load_test
            sleep 30 # Brief pause between tests
            
            run_stress_test
            sleep 30
            
            run_spike_test
            sleep 30
            
            # Ask for endurance test separately
            run_endurance_test
            ;;
    esac
    
    # Generate summary report
    generate_summary_report
    
    # Cleanup
    cleanup_test_environment
    
    local overall_end_time=$(date +%s)
    local total_duration=$((overall_end_time - overall_start_time))
    local total_formatted=$(printf '%02d:%02d:%02d' $((total_duration/3600)) $((total_duration%3600/60)) $((total_duration%60)))
    
    success "✅ All performance tests completed in $total_formatted"
    
    # Show summary
    echo ""
    log "📊 Performance Testing Summary:"
    echo "  Target URL: $TARGET_URL"
    echo "  Test Type: $TEST_TYPE"
    echo "  Total Duration: $total_formatted"
    echo "  Reports Directory: $REPORTS_DIR"
    echo ""
    echo "🔗 Open the summary report to review results:"
    echo "  file://$REPORTS_DIR/performance-summary-*.html"
}

# Run main function
main "$@"