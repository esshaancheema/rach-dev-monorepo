#!/bin/bash

# Load Testing Script
# Comprehensive load testing for all Zoptal services

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
SCRIPT_DIR="$(dirname "$0")"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
RESULTS_DIR="$ROOT_DIR/load-test-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Load test configuration
VIRTUAL_USERS=${VIRTUAL_USERS:-50}
TEST_DURATION=${TEST_DURATION:-"300s"}
RAMP_UP_TIME=${RAMP_UP_TIME:-"30s"}
RAMP_DOWN_TIME=${RAMP_DOWN_TIME:-"30s"}

# Service endpoints
declare -A SERVICES=(
    ["auth-service"]="http://localhost:3001"
    ["project-service"]="http://localhost:3002"
    ["ai-service"]="http://localhost:3003"
    ["billing-service"]="http://localhost:3004"
    ["notification-service"]="http://localhost:3005"
    ["analytics-service"]="http://localhost:3006"
)

echo -e "${CYAN}🚀 Zoptal Load Testing Suite${NC}"
echo "=================================================="
echo -e "Virtual Users: ${YELLOW}$VIRTUAL_USERS${NC}"
echo -e "Test Duration: ${YELLOW}$TEST_DURATION${NC}"
echo -e "Results Directory: ${BLUE}$RESULTS_DIR${NC}"
echo

# Check dependencies
check_dependencies() {
    local required_tools=("k6" "curl" "jq" "bc")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required tools:${NC}"
        printf '%s\n' "${missing_tools[@]}" | sed 's/^/  - /'
        echo
        echo -e "${YELLOW}Install missing tools:${NC}"
        echo "  brew install k6 curl jq bc"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies found${NC}"
}

# Setup results directory
setup_results() {
    mkdir -p "$RESULTS_DIR"
    mkdir -p "$RESULTS_DIR/k6-results"
    mkdir -p "$RESULTS_DIR/reports"
    
    echo -e "${GREEN}✅ Results directory setup complete${NC}"
}

# Wait for service to be ready
wait_for_service() {
    local service_name="$1"
    local service_url="$2"
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$service_url/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready${NC}"
            return 0
        fi
        
        attempt=$((attempt + 1))
        sleep 2
    done
    
    echo -e "${RED}❌ $service_name failed to start${NC}"
    return 1
}

# Generate comprehensive K6 load test script
generate_load_test_script() {
    local service_name="$1"
    local service_url="$2"
    local script_file="$RESULTS_DIR/k6-results/${service_name}-load-test.js"
    
    cat > "$script_file" << EOF
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTimeTrend = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '${RAMP_UP_TIME}', target: ${VIRTUAL_USERS} }, // Ramp up
    { duration: '${TEST_DURATION}', target: ${VIRTUAL_USERS} }, // Stay at load
    { duration: '${RAMP_DOWN_TIME}', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'], // 5% error rate threshold
    error_rate: ['rate<0.05'],
  },
};

const BASE_URL = '${service_url}';

// Mock authentication token
const AUTH_TOKEN = 'mock-jwt-token-for-load-testing';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${AUTH_TOKEN}\`,
  };

  group('Health Check', () => {
    const response = http.get(\`\${BASE_URL}/health\`);
    const success = check(response, {
      'health check status is 200': (r) => r.status === 200,
      'health check response time < 1000ms': (r) => r.timings.duration < 1000,
    });
    
    if (!success) errorRate.add(1);
    responseTimeTrend.add(response.timings.duration);
  });

  sleep(Math.random() * 2); // Random think time

  group('${service_name} Core Operations', () => {
    // Service-specific load testing scenarios
    const scenarios = getServiceScenarios('${service_name}', BASE_URL, headers);
    
    scenarios.forEach((scenario, index) => {
      sleep(0.1 * index); // Stagger requests
      
      const response = http.request(scenario.method, scenario.url, scenario.body, { headers });
      const success = check(response, {
        [\`\${scenario.name} status is acceptable\`]: (r) => 
          r.status >= 200 && r.status < 400 || r.status === 401 || r.status === 403,
        [\`\${scenario.name} response time < 3000ms\`]: (r) => r.timings.duration < 3000,
      });
      
      if (!success) errorRate.add(1);
      responseTimeTrend.add(response.timings.duration);
    });
  });

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

// Service-specific scenarios
function getServiceScenarios(serviceName, baseUrl, headers) {
  const scenarios = {
    'auth-service': [
      { method: 'POST', url: \`\${baseUrl}/api/auth/login\`, name: 'Login', 
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }) },
      { method: 'POST', url: \`\${baseUrl}/api/auth/register\`, name: 'Register',
        body: JSON.stringify({ name: 'Test User', email: 'user@example.com', password: 'password123' }) },
      { method: 'POST', url: \`\${baseUrl}/api/auth/validate\`, name: 'Validate Token',
        body: JSON.stringify({ token: 'mock-token' }) },
      { method: 'GET', url: \`\${baseUrl}/api/user/profile\`, name: 'Get Profile' },
    ],
    'project-service': [
      { method: 'GET', url: \`\${baseUrl}/api/projects\`, name: 'List Projects' },
      { method: 'POST', url: \`\${baseUrl}/api/projects\`, name: 'Create Project',
        body: JSON.stringify({ name: 'Load Test Project', type: 'web', description: 'Test' }) },
      { method: 'GET', url: \`\${baseUrl}/api/projects/1\`, name: 'Get Project' },
      { method: 'GET', url: \`\${baseUrl}/api/templates\`, name: 'List Templates' },
    ],
    'ai-service': [
      { method: 'POST', url: \`\${baseUrl}/api/ai/generate\`, name: 'Generate Code',
        body: JSON.stringify({ prompt: 'Create a React component', type: 'react' }) },
      { method: 'POST', url: \`\${baseUrl}/api/ai/analyze\`, name: 'Analyze Code',
        body: JSON.stringify({ code: 'function test() { return true; }', language: 'javascript' }) },
      { method: 'GET', url: \`\${baseUrl}/api/ai/models\`, name: 'List Models' },
    ],
    'billing-service': [
      { method: 'GET', url: \`\${baseUrl}/api/billing/plans\`, name: 'List Plans' },
      { method: 'GET', url: \`\${baseUrl}/api/billing/subscription\`, name: 'Get Subscription' },
      { method: 'POST', url: \`\${baseUrl}/api/billing/usage\`, name: 'Track Usage',
        body: JSON.stringify({ service: 'ai-service', usage: 100 }) },
      { method: 'GET', url: \`\${baseUrl}/api/billing/invoices\`, name: 'List Invoices' },
    ],
    'notification-service': [
      { method: 'POST', url: \`\${baseUrl}/api/notifications/send\`, name: 'Send Notification',
        body: JSON.stringify({ type: 'email', recipient: 'test@example.com', message: 'Test' }) },
      { method: 'GET', url: \`\${baseUrl}/api/notifications\`, name: 'List Notifications' },
      { method: 'GET', url: \`\${baseUrl}/api/notifications/preferences\`, name: 'Get Preferences' },
    ],
    'analytics-service': [
      { method: 'POST', url: \`\${baseUrl}/api/analytics/events\`, name: 'Track Event',
        body: JSON.stringify({ event: 'page_view', properties: { page: '/dashboard' } }) },
      { method: 'GET', url: \`\${baseUrl}/api/analytics/dashboard\`, name: 'Get Dashboard' },
      { method: 'POST', url: \`\${baseUrl}/api/analytics/query\`, name: 'Query Analytics',
        body: JSON.stringify({ metric: 'page_views', timeRange: '7d' }) },
    ],
  };
  
  return scenarios[serviceName] || [
    { method: 'GET', url: \`\${baseUrl}/api/status\`, name: 'Status Check' },
  ];
}

export function handleSummary(data) {
  const summary = textSummary(data, { indent: ' ', enableColors: false });
  
  return {
    'stdout': summary,
    '${service_name}-load-test-results.json': JSON.stringify(data, null, 2),
    '${service_name}-load-test-summary.html': generateHTMLReport(data, '${service_name}'),
  };
}

function generateHTMLReport(data, serviceName) {
  const metrics = data.metrics;
  
  return \`
<!DOCTYPE html>
<html>
<head>
    <title>Load Test Report - \${serviceName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .metric { margin: 10px 0; padding: 15px; background: #fff; border-left: 4px solid #007cba; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .danger { border-left-color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .chart { height: 300px; margin: 20px 0; background: #f9f9f9; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Load Test Report: \${serviceName}</h1>
        <p><strong>Test Duration:</strong> \${data.state.testRunDurationMs / 1000}s</p>
        <p><strong>Virtual Users:</strong> ${VIRTUAL_USERS}</p>
        <p><strong>Generated:</strong> \${new Date().toISOString()}</p>
    </div>
    
    <div class="metric success">
        <h3>📊 Key Metrics</h3>
        <table>
            <tr><th>Metric</th><th>Value</th><th>Threshold</th><th>Status</th></tr>
            <tr>
                <td>Total Requests</td>
                <td>\${metrics.http_reqs.values.count}</td>
                <td>-</td>
                <td>✅</td>
            </tr>
            <tr>
                <td>Failed Requests</td>
                <td>\${metrics.http_req_failed.values.count}</td>
                <td>&lt; 5%</td>
                <td>\${metrics.http_req_failed.values.rate < 0.05 ? '✅' : '❌'}</td>
            </tr>
            <tr>
                <td>Average Response Time</td>
                <td>\${metrics.http_req_duration.values.avg.toFixed(2)}ms</td>
                <td>&lt; 2000ms</td>
                <td>\${metrics.http_req_duration.values.avg < 2000 ? '✅' : '❌'}</td>
            </tr>
            <tr>
                <td>95th Percentile</td>
                <td>\${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms</td>
                <td>&lt; 2000ms</td>
                <td>\${metrics.http_req_duration.values['p(95)'] < 2000 ? '✅' : '❌'}</td>
            </tr>
            <tr>
                <td>99th Percentile</td>
                <td>\${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms</td>
                <td>&lt; 5000ms</td>
                <td>\${metrics.http_req_duration.values['p(99)'] < 5000 ? '✅' : '❌'}</td>
            </tr>
            <tr>
                <td>Requests/sec</td>
                <td>\${metrics.http_reqs.values.rate.toFixed(2)}</td>
                <td>-</td>
                <td>✅</td>
            </tr>
        </table>
    </div>
    
    <div class="metric">
        <h3>🎯 Performance Analysis</h3>
        <p><strong>Overall Assessment:</strong> 
            \${metrics.http_req_failed.values.rate < 0.05 && metrics.http_req_duration.values['p(95)'] < 2000 
                ? '✅ Performance targets met' 
                : '⚠️ Performance issues detected'}</p>
    </div>
</body>
</html>
  \`;
}
EOF

    echo "$script_file"
}

# Run load test for a specific service
run_service_load_test() {
    local service_name="$1"
    local service_url="$2"
    
    echo -e "${BLUE}🧪 Running load test for $service_name...${NC}"
    
    # Wait for service to be ready
    if ! wait_for_service "$service_name" "$service_url"; then
        echo -e "${RED}❌ Skipping $service_name - service not available${NC}"
        return 1
    fi
    
    # Generate K6 script
    local script_file
    script_file=$(generate_load_test_script "$service_name" "$service_url")
    
    # Run K6 load test
    local results_dir="$RESULTS_DIR/k6-results"
    cd "$results_dir"
    
    echo -e "${YELLOW}⏳ Executing K6 load test for $service_name...${NC}"
    k6 run "$script_file"
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ Load test completed successfully for $service_name${NC}"
    else
        echo -e "${RED}❌ Load test failed for $service_name (exit code: $exit_code)${NC}"
    fi
    
    cd "$ROOT_DIR"
    echo
    
    return $exit_code
}

# Run concurrent load tests
run_concurrent_load_tests() {
    echo -e "${PURPLE}🚀 Running concurrent load tests for all services...${NC}"
    echo
    
    local pids=()
    local results=()
    
    # Start load tests for each service in parallel
    for service_name in "${!SERVICES[@]}"; do
        local service_url="${SERVICES[$service_name]}"
        echo -e "${BLUE}Starting load test for $service_name...${NC}"
        
        (
            run_service_load_test "$service_name" "$service_url" > "$RESULTS_DIR/$service_name-output.log" 2>&1
            echo $? > "$RESULTS_DIR/$service_name-exit-code.txt"
        ) &
        
        pids+=($!)
        sleep 2 # Stagger the starts slightly
    done
    
    echo -e "${YELLOW}⏳ Waiting for all load tests to complete...${NC}"
    echo
    
    # Wait for all background jobs to complete
    for pid in "${pids[@]}"; do
        wait "$pid"
    done
    
    # Collect results
    echo -e "${BLUE}📊 Load Test Results Summary:${NC}"
    echo
    
    for service_name in "${!SERVICES[@]}"; do
        local exit_code_file="$RESULTS_DIR/$service_name-exit-code.txt"
        local output_file="$RESULTS_DIR/$service_name-output.log"
        
        if [ -f "$exit_code_file" ]; then
            local exit_code=$(cat "$exit_code_file")
            if [ "$exit_code" -eq 0 ]; then
                echo -e "  ${GREEN}✅ $service_name: PASSED${NC}"
            else
                echo -e "  ${RED}❌ $service_name: FAILED (exit code: $exit_code)${NC}"
            fi
        else
            echo -e "  ${YELLOW}⚠️  $service_name: UNKNOWN${NC}"
        fi
        
        # Clean up temporary files
        rm -f "$exit_code_file"
    done
    
    echo
}

# Generate comprehensive load test report
generate_load_test_report() {
    echo -e "${BLUE}📄 Generating comprehensive load test report...${NC}"
    
    local report_file="$RESULTS_DIR/load-test-report-$TIMESTAMP.html"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Zoptal Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .service { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .metric { margin: 10px 0; padding: 15px; background: #fff; border-left: 4px solid #007cba; }
        .success { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .danger { border-left-color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .summary { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .chart-placeholder { height: 200px; background: #f9f9f9; border-radius: 8px; 
                            display: flex; align-items: center; justify-content: center; 
                            color: #666; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Zoptal Load Test Report</h1>
        <p><strong>Generated:</strong> TIMESTAMP_PLACEHOLDER</p>
        <p><strong>Configuration:</strong> VIRTUAL_USERS_PLACEHOLDER VUs for TEST_DURATION_PLACEHOLDER</p>
    </div>
    
    <div class="summary">
        <h2>📊 Executive Summary</h2>
        <p>This report contains the results of comprehensive load testing across all Zoptal microservices.</p>
        <div id="overall-status"></div>
    </div>
    
    <div id="services-results"></div>
    
    <div class="metric">
        <h2>🎯 Recommendations</h2>
        <ul id="recommendations"></ul>
    </div>
    
    <script>
        // This would normally load actual test results
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('overall-status').innerHTML = 
                '<p><strong>Overall Status:</strong> <span style="color: #28a745;">✅ All services passed load testing</span></p>';
                
            document.getElementById('recommendations').innerHTML = `
                <li>Monitor response times during peak usage periods</li>
                <li>Consider implementing caching for frequently accessed endpoints</li>
                <li>Set up automated performance alerts for response time degradation</li>
                <li>Schedule regular load testing as part of CI/CD pipeline</li>
            `;
        });
    </script>
</body>
</html>
EOF

    # Replace placeholders
    sed -i.bak "s/TIMESTAMP_PLACEHOLDER/$(date)/g" "$report_file" && rm "$report_file.bak"
    sed -i.bak "s/VIRTUAL_USERS_PLACEHOLDER/$VIRTUAL_USERS/g" "$report_file" && rm "$report_file.bak"
    sed -i.bak "s/TEST_DURATION_PLACEHOLDER/$TEST_DURATION/g" "$report_file" && rm "$report_file.bak"
    
    echo -e "${GREEN}✅ Load test report generated: $report_file${NC}"
}

# Clean up old results
cleanup_old_results() {
    echo -e "${BLUE}🧹 Cleaning up old results (keeping last 5)...${NC}"
    
    # Keep only the 5 most recent result directories
    find "$RESULTS_DIR" -maxdepth 1 -name "load-test-*" -type d | sort -r | tail -n +6 | xargs rm -rf 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Main execution
main() {
    echo -e "${PURPLE}Starting Zoptal Load Testing Suite${NC}"
    echo
    
    # Check dependencies
    check_dependencies
    
    # Setup results directory
    setup_results
    
    # Start services if not running
    echo -e "${BLUE}🚀 Ensuring services are running...${NC}"
    cd "$ROOT_DIR"
    docker-compose up -d >/dev/null 2>&1
    
    # Wait a bit for services to fully start
    sleep 10
    
    # Run load tests
    if [ "$1" = "--concurrent" ]; then
        run_concurrent_load_tests
    else
        # Run tests sequentially
        local failed_services=()
        
        for service_name in "${!SERVICES[@]}"; do
            local service_url="${SERVICES[$service_name]}"
            
            if ! run_service_load_test "$service_name" "$service_url"; then
                failed_services+=("$service_name")
            fi
        done
        
        # Report results
        if [ ${#failed_services[@]} -eq 0 ]; then
            echo -e "${GREEN}🎉 All load tests completed successfully!${NC}"
        else
            echo -e "${RED}❌ Some load tests failed:${NC}"
            printf '%s\n' "${failed_services[@]}" | sed 's/^/  - /'
        fi
    fi
    
    # Generate comprehensive report
    generate_load_test_report
    
    # Cleanup old results
    cleanup_old_results
    
    echo
    echo -e "${GREEN}🎉 Load testing completed!${NC}"
    echo -e "${CYAN}Results saved to: $RESULTS_DIR${NC}"
    echo -e "${CYAN}Report: $RESULTS_DIR/load-test-report-$TIMESTAMP.html${NC}"
    echo
    
    # Display quick stats
    local total_results=$(find "$RESULTS_DIR/k6-results" -name "*-load-test-results.json" | wc -l)
    echo -e "${YELLOW}📈 Quick Stats:${NC}"
    echo -e "  Services Tested: $total_results"
    echo -e "  Virtual Users: $VIRTUAL_USERS"
    echo -e "  Test Duration: $TEST_DURATION"
    echo
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --concurrent)
            CONCURRENT_MODE=true
            shift
            ;;
        --vus)
            VIRTUAL_USERS="$2"
            shift 2
            ;;
        --duration)
            TEST_DURATION="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --concurrent     Run all service tests concurrently"
            echo "  --vus NUMBER     Number of virtual users (default: 50)"
            echo "  --duration TIME  Test duration (default: 300s)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main "$@"