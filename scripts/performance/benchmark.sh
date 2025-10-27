#!/bin/bash

# Performance Benchmarking Script
# Runs comprehensive performance tests across all services

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
BENCHMARK_DIR="$(dirname "$0")"
ROOT_DIR="$(cd "$BENCHMARK_DIR/../.." && pwd)"
RESULTS_DIR="$ROOT_DIR/performance-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$RESULTS_DIR/benchmark_report_$TIMESTAMP.json"

# Services to benchmark
SERVICES=(
    "auth-service:3001"
    "project-service:3002"
    "ai-service:3003"
    "billing-service:3004"
    "notification-service:3005"
    "analytics-service:3006"
)

# Frontend apps to benchmark
APPS=(
    "web-main:3000"
    "dashboard:3010"
    "admin:3020"
    "developer-portal:3030"
)

# Test configurations
LOAD_TEST_DURATION=${LOAD_TEST_DURATION:-"60s"}
LOAD_TEST_VUS=${LOAD_TEST_VUS:-"10"}
STRESS_TEST_DURATION=${STRESS_TEST_DURATION:-"30s"}
STRESS_TEST_VUS=${STRESS_TEST_VUS:-"50"}

# Tools required
REQUIRED_TOOLS=("k6" "ab" "wrk" "docker" "curl" "jq")

echo -e "${CYAN}🚀 Zoptal Performance Benchmarking Suite${NC}"
echo "=================================================="
echo -e "Timestamp: ${YELLOW}$TIMESTAMP${NC}"
echo -e "Results will be saved to: ${BLUE}$REPORT_FILE${NC}"
echo

# Check required tools
check_dependencies() {
    echo -e "${BLUE}🔍 Checking dependencies...${NC}"
    
    local missing_tools=()
    for tool in "${REQUIRED_TOOLS[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required tools:${NC}"
        printf '%s\n' "${missing_tools[@]}" | sed 's/^/  - /'
        echo
        echo -e "${YELLOW}Install missing tools:${NC}"
        echo "  brew install k6 apache-bench wrk"
        echo "  # or using your package manager"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies found${NC}"
    echo
}

# Setup results directory
setup_results_dir() {
    mkdir -p "$RESULTS_DIR"
    mkdir -p "$RESULTS_DIR/raw"
    mkdir -p "$RESULTS_DIR/charts"
    
    # Initialize report file
    cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "configuration": {
    "load_test_duration": "$LOAD_TEST_DURATION",
    "load_test_vus": "$LOAD_TEST_VUS",
    "stress_test_duration": "$STRESS_TEST_DURATION",
    "stress_test_vus": "$STRESS_TEST_VUS"
  },
  "results": {
    "services": {},
    "frontend_apps": {},
    "database": {},
    "summary": {}
  }
}
EOF
}

# Wait for services to be ready
wait_for_service() {
    local service_url="$1"
    local service_name="$2"
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

# Run load test with K6
run_k6_load_test() {
    local service_name="$1"
    local base_url="$2"
    local test_script="$3"
    
    echo -e "${BLUE}🧪 Running K6 load test for $service_name...${NC}"
    
    local k6_script="$BENCHMARK_DIR/k6-scripts/$test_script"
    local result_file="$RESULTS_DIR/raw/k6_${service_name}_${TIMESTAMP}.json"
    
    K6_BASE_URL="$base_url" \
    K6_VUS="$LOAD_TEST_VUS" \
    K6_DURATION="$LOAD_TEST_DURATION" \
        k6 run --out json="$result_file" "$k6_script"
    
    # Parse K6 results
    local avg_response_time=$(jq -r '.metrics.http_req_duration.values.avg' "$result_file" 2>/dev/null || echo "0")
    local p95_response_time=$(jq -r '.metrics.http_req_duration.values."p(95)"' "$result_file" 2>/dev/null || echo "0")
    local requests_per_second=$(jq -r '.metrics.http_reqs.values.rate' "$result_file" 2>/dev/null || echo "0")
    local error_rate=$(jq -r '.metrics.http_req_failed.values.rate' "$result_file" 2>/dev/null || echo "0")
    
    # Update report
    local temp_file=$(mktemp)
    jq --arg service "$service_name" \
       --arg avg_rt "$avg_response_time" \
       --arg p95_rt "$p95_response_time" \
       --arg rps "$requests_per_second" \
       --arg error_rate "$error_rate" \
       '.results.services[$service] = {
         "load_test": {
           "avg_response_time": ($avg_rt | tonumber),
           "p95_response_time": ($p95_rt | tonumber),
           "requests_per_second": ($rps | tonumber),
           "error_rate": ($error_rate | tonumber)
         }
       }' "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
    
    echo -e "${GREEN}✅ K6 load test completed for $service_name${NC}"
    echo -e "  Avg Response Time: ${YELLOW}${avg_response_time}ms${NC}"
    echo -e "  P95 Response Time: ${YELLOW}${p95_response_time}ms${NC}"
    echo -e "  Requests/sec: ${YELLOW}$requests_per_second${NC}"
    echo -e "  Error Rate: ${YELLOW}${error_rate}%${NC}"
    echo
}

# Run stress test with Apache Bench
run_ab_stress_test() {
    local service_name="$1"
    local base_url="$2"
    local endpoint="$3"
    
    echo -e "${BLUE}💥 Running Apache Bench stress test for $service_name...${NC}"
    
    local full_url="$base_url$endpoint"
    local result_file="$RESULTS_DIR/raw/ab_${service_name}_${TIMESTAMP}.txt"
    local concurrent_requests=50
    local total_requests=1000
    
    ab -n $total_requests -c $concurrent_requests -g "$RESULTS_DIR/raw/ab_${service_name}_${TIMESTAMP}.tsv" "$full_url" > "$result_file" 2>&1
    
    # Parse AB results
    local requests_per_second=$(grep "Requests per second" "$result_file" | awk '{print $4}' || echo "0")
    local mean_response_time=$(grep "Time per request" "$result_file" | head -1 | awk '{print $4}' || echo "0")
    local failed_requests=$(grep "Failed requests" "$result_file" | awk '{print $3}' || echo "0")
    
    # Update report
    local temp_file=$(mktemp)
    jq --arg service "$service_name" \
       --arg rps "$requests_per_second" \
       --arg mean_rt "$mean_response_time" \
       --arg failed "$failed_requests" \
       '.results.services[$service].stress_test = {
         "requests_per_second": ($rps | tonumber),
         "mean_response_time": ($mean_rt | tonumber),
         "failed_requests": ($failed | tonumber)
       }' "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
    
    echo -e "${GREEN}✅ Apache Bench stress test completed for $service_name${NC}"
    echo -e "  Requests/sec: ${YELLOW}$requests_per_second${NC}"
    echo -e "  Mean Response Time: ${YELLOW}${mean_response_time}ms${NC}"
    echo -e "  Failed Requests: ${YELLOW}$failed_requests${NC}"
    echo
}

# Run memory and CPU profiling
run_resource_profiling() {
    local service_name="$1"
    local container_name="$2"
    
    echo -e "${BLUE}📊 Running resource profiling for $service_name...${NC}"
    
    # Get container stats
    local stats_file="$RESULTS_DIR/raw/docker_stats_${service_name}_${TIMESTAMP}.json"
    timeout 30s docker stats "$container_name" --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" > "$stats_file" 2>/dev/null || true
    
    # Parse Docker stats
    local cpu_usage=$(tail -1 "$stats_file" 2>/dev/null | awk '{print $2}' | sed 's/%//' || echo "0")
    local memory_usage=$(tail -1 "$stats_file" 2>/dev/null | awk '{print $3}' | cut -d'/' -f1 || echo "0")
    
    # Update report
    local temp_file=$(mktemp)
    jq --arg service "$service_name" \
       --arg cpu "$cpu_usage" \
       --arg memory "$memory_usage" \
       '.results.services[$service].resources = {
         "cpu_usage_percent": ($cpu | tonumber),
         "memory_usage": $memory
       }' "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
    
    echo -e "${GREEN}✅ Resource profiling completed for $service_name${NC}"
    echo -e "  CPU Usage: ${YELLOW}${cpu_usage}%${NC}"
    echo -e "  Memory Usage: ${YELLOW}$memory_usage${NC}"
    echo
}

# Test database performance
test_database_performance() {
    echo -e "${BLUE}🗄️ Testing database performance...${NC}"
    
    local db_container="zoptal_postgres"
    local db_stats_file="$RESULTS_DIR/raw/db_performance_${TIMESTAMP}.txt"
    
    # Run database performance queries
    docker exec "$db_container" psql -U postgres -d zoptal -c "
        SELECT 
            schemaname,
            tablename,
            attname,
            n_distinct,
            correlation
        FROM pg_stats
        LIMIT 10;
    " > "$db_stats_file" 2>/dev/null || echo "Database performance test failed" > "$db_stats_file"
    
    # Check connection pool usage
    local active_connections=$(docker exec "$db_container" psql -U postgres -d zoptal -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | xargs || echo "0")
    
    # Update report
    local temp_file=$(mktemp)
    jq --arg connections "$active_connections" \
       '.results.database = {
         "active_connections": ($connections | tonumber),
         "performance_test": "completed"
       }' "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
    
    echo -e "${GREEN}✅ Database performance test completed${NC}"
    echo -e "  Active Connections: ${YELLOW}$active_connections${NC}"
    echo
}

# Test frontend app performance
test_frontend_performance() {
    local app_name="$1"
    local app_url="$2"
    
    echo -e "${BLUE}🌐 Testing frontend performance for $app_name...${NC}"
    
    # Use Lighthouse CI for frontend performance (if available)
    if command -v lhci &> /dev/null; then
        local lhci_result="$RESULTS_DIR/raw/lighthouse_${app_name}_${TIMESTAMP}.json"
        lhci autorun --upload.target=filesystem --upload.outputDir="$RESULTS_DIR/raw" --collect.url="$app_url" > "$lhci_result" 2>/dev/null || true
    fi
    
    # Basic HTTP performance test
    local response_time=$(curl -o /dev/null -s -w "%{time_total}" "$app_url" 2>/dev/null || echo "0")
    local http_code=$(curl -o /dev/null -s -w "%{http_code}" "$app_url" 2>/dev/null || echo "0")
    
    # Update report
    local temp_file=$(mktemp)
    jq --arg app "$app_name" \
       --arg response_time "$response_time" \
       --arg http_code "$http_code" \
       '.results.frontend_apps[$app] = {
         "response_time": ($response_time | tonumber),
         "http_code": ($http_code | tonumber)
       }' "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
    
    echo -e "${GREEN}✅ Frontend performance test completed for $app_name${NC}"
    echo -e "  Response Time: ${YELLOW}${response_time}s${NC}"
    echo -e "  HTTP Code: ${YELLOW}$http_code${NC}"
    echo
}

# Generate performance summary
generate_summary() {
    echo -e "${BLUE}📋 Generating performance summary...${NC}"
    
    # Calculate averages and identify bottlenecks
    local temp_file=$(mktemp)
    jq '.results.summary = {
      "total_services_tested": (.results.services | length),
      "total_apps_tested": (.results.frontend_apps | length),
      "avg_service_response_time": (
        [.results.services[].load_test.avg_response_time] | 
        add / length
      ),
      "bottlenecks": [
        .results.services | 
        to_entries[] | 
        select(.value.load_test.avg_response_time > 1000) | 
        .key
      ],
      "recommendations": []
    }' "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
    
    echo -e "${GREEN}✅ Performance summary generated${NC}"
}

# Generate HTML report
generate_html_report() {
    echo -e "${BLUE}📄 Generating HTML report...${NC}"
    
    local html_report="$RESULTS_DIR/performance_report_$TIMESTAMP.html"
    
    cat > "$html_report" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Zoptal Performance Benchmark Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .metric { margin: 10px 0; padding: 10px; background: #fff; border-left: 4px solid #007cba; }
        .service { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .good { border-left-color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .danger { border-left-color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Zoptal Performance Benchmark Report</h1>
        <p><strong>Generated:</strong> TIMESTAMP_PLACEHOLDER</p>
    </div>
    
    <div id="summary"></div>
    <div id="services"></div>
    <div id="database"></div>
    <div id="frontend"></div>
    
    <script>
        // Load JSON data and populate the report
        fetch('./benchmark_report_TIMESTAMP_PLACEHOLDER.json')
            .then(response => response.json())
            .then(data => {
                populateReport(data);
            });
            
        function populateReport(data) {
            // Populate summary
            document.getElementById('summary').innerHTML = `
                <h2>📊 Summary</h2>
                <div class="metric">
                    <strong>Services Tested:</strong> ${data.results.summary.total_services_tested}
                </div>
                <div class="metric">
                    <strong>Average Response Time:</strong> ${data.results.summary.avg_service_response_time.toFixed(2)}ms
                </div>
            `;
            
            // Populate services
            let servicesHtml = '<h2>🔧 Services Performance</h2>';
            Object.entries(data.results.services).forEach(([service, metrics]) => {
                const responseClass = metrics.load_test.avg_response_time > 1000 ? 'danger' : 
                                    metrics.load_test.avg_response_time > 500 ? 'warning' : 'good';
                servicesHtml += `
                    <div class="service ${responseClass}">
                        <h3>${service}</h3>
                        <table>
                            <tr><th>Metric</th><th>Load Test</th><th>Stress Test</th></tr>
                            <tr><td>Avg Response Time</td><td>${metrics.load_test.avg_response_time}ms</td><td>${metrics.stress_test.mean_response_time}ms</td></tr>
                            <tr><td>Requests/sec</td><td>${metrics.load_test.requests_per_second}</td><td>${metrics.stress_test.requests_per_second}</td></tr>
                            <tr><td>Error Rate</td><td>${metrics.load_test.error_rate}%</td><td>-</td></tr>
                        </table>
                    </div>
                `;
            });
            document.getElementById('services').innerHTML = servicesHtml;
        }
    </script>
</body>
</html>
EOF
    
    # Replace timestamp placeholder
    sed -i.bak "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/g" "$html_report" && rm "$html_report.bak"
    
    echo -e "${GREEN}✅ HTML report generated: $html_report${NC}"
}

# Main execution
main() {
    echo -e "${PURPLE}Starting Zoptal Performance Benchmark Suite${NC}"
    echo
    
    check_dependencies
    setup_results_dir
    
    # Start services if not running
    echo -e "${BLUE}🚀 Ensuring services are running...${NC}"
    cd "$ROOT_DIR"
    docker-compose up -d
    
    # Wait for services to be ready
    for service_port in "${SERVICES[@]}"; do
        IFS=':' read -r service_name port <<< "$service_port"
        wait_for_service "http://localhost:$port" "$service_name"
    done
    
    # Test database performance
    test_database_performance
    
    # Test each service
    for service_port in "${SERVICES[@]}"; do
        IFS=':' read -r service_name port <<< "$service_port"
        local base_url="http://localhost:$port"
        local container_name="zoptal_${service_name//-/_}"
        
        echo -e "${PURPLE}Testing $service_name...${NC}"
        
        # K6 Load Test
        run_k6_load_test "$service_name" "$base_url" "${service_name}.js"
        
        # Apache Bench Stress Test  
        run_ab_stress_test "$service_name" "$base_url" "/health"
        
        # Resource Profiling
        run_resource_profiling "$service_name" "$container_name"
        
        echo -e "${GREEN}✅ $service_name testing completed${NC}"
        echo "=================================================="
    done
    
    # Test frontend apps
    for app_port in "${APPS[@]}"; do
        IFS=':' read -r app_name port <<< "$app_port"
        test_frontend_performance "$app_name" "http://localhost:$port"
    done
    
    # Generate final reports
    generate_summary
    generate_html_report
    
    echo
    echo -e "${GREEN}🎉 Performance benchmarking completed!${NC}"
    echo -e "${CYAN}Results saved to: $RESULTS_DIR${NC}"
    echo -e "${CYAN}HTML Report: $RESULTS_DIR/performance_report_$TIMESTAMP.html${NC}"
    echo -e "${CYAN}JSON Report: $REPORT_FILE${NC}"
    echo
    
    # Display quick summary
    local avg_response_time=$(jq -r '.results.summary.avg_service_response_time' "$REPORT_FILE" 2>/dev/null || echo "N/A")
    local bottlenecks=$(jq -r '.results.summary.bottlenecks | length' "$REPORT_FILE" 2>/dev/null || echo "0")
    
    echo -e "${YELLOW}📊 Quick Summary:${NC}"
    echo -e "  Average Response Time: ${avg_response_time}ms"
    echo -e "  Services with Performance Issues: $bottlenecks"
    echo
}

# Run main function
main "$@"