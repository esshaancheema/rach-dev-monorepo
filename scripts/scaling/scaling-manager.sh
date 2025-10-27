#!/bin/bash

# Scaling Manager for Zoptal Platform
# Provides comprehensive scaling operations and monitoring

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="${NAMESPACE:-zoptal-production}"
KUBECTL_TIMEOUT="300s"
SERVICES=("auth-service" "project-service" "ai-service" "billing-service" "notification-service")
APPS=("dashboard" "admin" "web-main")

# Function to print colored output
print_status() {
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

print_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

# Function to check dependencies
check_dependencies() {
    local missing_tools=()
    local tools=("kubectl" "jq" "bc")
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        return 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        return 1
    fi
    
    print_success "All dependencies are available"
}

# Function to get current scaling status
get_scaling_status() {
    local service=${1:-"all"}
    
    print_header "Current Scaling Status"
    
    if [ "$service" = "all" ]; then
        local all_services=("${SERVICES[@]}" "${APPS[@]}")
        for svc in "${all_services[@]}"; do
            get_service_scaling_status "$svc"
            echo
        done
    else
        get_service_scaling_status "$service"
    fi
}

# Function to get scaling status for a specific service
get_service_scaling_status() {
    local service=$1
    
    print_status "Service: $service"
    
    # Get deployment status
    local deployment_info=$(kubectl get deployment "$service" -n "$NAMESPACE" -o json 2>/dev/null || echo "{}")
    local current_replicas=$(echo "$deployment_info" | jq -r '.status.replicas // 0')
    local ready_replicas=$(echo "$deployment_info" | jq -r '.status.readyReplicas // 0')
    local desired_replicas=$(echo "$deployment_info" | jq -r '.spec.replicas // 0')
    
    printf "  %-20s %s\n" "Current Replicas:" "$current_replicas"
    printf "  %-20s %s\n" "Ready Replicas:" "$ready_replicas"
    printf "  %-20s %s\n" "Desired Replicas:" "$desired_replicas"
    
    # Get HPA status if exists
    local hpa_info=$(kubectl get hpa "${service}-hpa" -n "$NAMESPACE" -o json 2>/dev/null || echo "{}")
    if [ "$hpa_info" != "{}" ]; then
        local min_replicas=$(echo "$hpa_info" | jq -r '.spec.minReplicas // "N/A"')
        local max_replicas=$(echo "$hpa_info" | jq -r '.spec.maxReplicas // "N/A"')
        local target_cpu=$(echo "$hpa_info" | jq -r '.spec.metrics[] | select(.type=="Resource" and .resource.name=="cpu") | .resource.target.averageUtilization // "N/A"')
        local current_cpu=$(echo "$hpa_info" | jq -r '.status.currentMetrics[] | select(.type=="Resource" and .resource.name=="cpu") | .resource.current.averageUtilization // "N/A"')
        
        printf "  %-20s %s\n" "HPA Min Replicas:" "$min_replicas"
        printf "  %-20s %s\n" "HPA Max Replicas:" "$max_replicas"
        printf "  %-20s %s%%" "Target CPU:" "$target_cpu"
        printf "  %-20s %s%%" "Current CPU:" "$current_cpu"
    fi
    
    # Get resource usage
    local pod_metrics=$(kubectl top pods -n "$NAMESPACE" -l "app.kubernetes.io/name=$service" --no-headers 2>/dev/null || echo "")
    if [ -n "$pod_metrics" ]; then
        local total_cpu=0
        local total_memory=0
        local pod_count=0
        
        while IFS= read -r line; do
            if [ -n "$line" ]; then
                local cpu=$(echo "$line" | awk '{print $2}' | sed 's/m$//')
                local memory=$(echo "$line" | awk '{print $3}' | sed 's/Mi$//')
                total_cpu=$((total_cpu + cpu))
                total_memory=$((total_memory + memory))
                pod_count=$((pod_count + 1))
            fi
        done <<< "$pod_metrics"
        
        if [ "$pod_count" -gt 0 ]; then
            local avg_cpu=$((total_cpu / pod_count))
            local avg_memory=$((total_memory / pod_count))
            printf "  %-20s %sm (avg per pod)\n" "CPU Usage:" "$avg_cpu"
            printf "  %-20s %sMi (avg per pod)\n" "Memory Usage:" "$avg_memory"
        fi
    fi
}

# Function to scale a service manually
manual_scale() {
    local service=$1
    local replicas=$2
    
    print_header "Manual Scaling"
    print_status "Scaling $service to $replicas replicas..."
    
    # Check if deployment exists
    if ! kubectl get deployment "$service" -n "$NAMESPACE" &> /dev/null; then
        print_error "Deployment $service not found in namespace $NAMESPACE"
        return 1
    fi
    
    # Scale the deployment
    if kubectl scale deployment "$service" --replicas="$replicas" -n "$NAMESPACE"; then
        print_success "Deployment scaled successfully"
        
        # Wait for rollout to complete
        print_status "Waiting for rollout to complete..."
        if kubectl rollout status deployment/"$service" -n "$NAMESPACE" --timeout="$KUBECTL_TIMEOUT"; then
            print_success "Rollout completed successfully"
            
            # Show final status
            get_service_scaling_status "$service"
        else
            print_error "Rollout timed out"
            return 1
        fi
    else
        print_error "Failed to scale deployment"
        return 1
    fi
}

# Function to enable/disable HPA
manage_hpa() {
    local service=$1
    local action=$2  # enable/disable
    
    print_header "HPA Management"
    
    case $action in
        "enable")
            print_status "Enabling HPA for $service..."
            
            # Check if HPA already exists
            if kubectl get hpa "${service}-hpa" -n "$NAMESPACE" &> /dev/null; then
                print_warning "HPA already exists for $service"
                return 0
            fi
            
            # Create HPA
            cat <<EOF | kubectl apply -f -
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${service}-hpa
  namespace: $NAMESPACE
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: $service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
EOF
            
            print_success "HPA enabled for $service"
            ;;
            
        "disable")
            print_status "Disabling HPA for $service..."
            
            if kubectl delete hpa "${service}-hpa" -n "$NAMESPACE" 2>/dev/null; then
                print_success "HPA disabled for $service"
            else
                print_warning "HPA not found for $service"
            fi
            ;;
            
        *)
            print_error "Invalid action: $action. Use 'enable' or 'disable'"
            return 1
            ;;
    esac
}

# Function to configure auto-scaling policies
configure_scaling_policies() {
    local service=$1
    local min_replicas=${2:-2}
    local max_replicas=${3:-10}
    local cpu_target=${4:-70}
    local memory_target=${5:-80}
    
    print_header "Configuring Scaling Policies"
    print_status "Service: $service"
    print_status "Min Replicas: $min_replicas"
    print_status "Max Replicas: $max_replicas"
    print_status "CPU Target: $cpu_target%"
    print_status "Memory Target: $memory_target%"
    
    # Update or create HPA with custom settings
    cat <<EOF | kubectl apply -f -
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${service}-hpa
  namespace: $NAMESPACE
  labels:
    app.kubernetes.io/name: $service
    app.kubernetes.io/component: autoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: $service
  minReplicas: $min_replicas
  maxReplicas: $max_replicas
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: $cpu_target
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: $memory_target
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Min
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 4
        periodSeconds: 60
      selectPolicy: Max
EOF
    
    print_success "Scaling policies configured for $service"
}

# Function to stress test scaling
stress_test_scaling() {
    local service=$1
    local duration=${2:-300}  # 5 minutes default
    local rps=${3:-100}       # requests per second
    
    print_header "Stress Testing Scaling"
    print_status "Service: $service"
    print_status "Duration: ${duration}s"
    print_status "RPS: $rps"
    
    # Get service endpoint
    local service_url=""
    if kubectl get service "$service" -n "$NAMESPACE" &> /dev/null; then
        local service_ip=$(kubectl get service "$service" -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')
        local service_port=$(kubectl get service "$service" -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].port}')
        service_url="http://${service_ip}:${service_port}/health"
    else
        print_error "Service $service not found"
        return 1
    fi
    
    print_status "Target URL: $service_url"
    print_status "Starting stress test..."
    
    # Create a job to run the stress test
    cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: stress-test-${service}-$(date +%s)
  namespace: $NAMESPACE
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: stress-test
        image: appropriate/curl
        command:
        - /bin/sh
        - -c
        - |
          echo "Starting stress test..."
          for i in \$(seq 1 $duration); do
            for j in \$(seq 1 $rps); do
              curl -s -o /dev/null "$service_url" &
            done
            sleep 1
            if [ \$((i % 30)) -eq 0 ]; then
              echo "Progress: \${i}/${duration}s"
            fi
          done
          wait
          echo "Stress test completed"
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 256Mi
EOF
    
    print_success "Stress test job created"
    print_status "Monitor scaling with: watch 'kubectl get hpa -n $NAMESPACE'"
    print_status "View job logs with: kubectl logs -f job/stress-test-${service}-$(date +%s) -n $NAMESPACE"
}

# Function to analyze scaling performance
analyze_scaling_performance() {
    local service=$1
    local timerange=${2:-"1h"}
    
    print_header "Scaling Performance Analysis"
    print_status "Service: $service"
    print_status "Time Range: $timerange"
    
    # Check if Prometheus is available
    if ! kubectl get service prometheus -n monitoring &> /dev/null; then
        print_warning "Prometheus not found. Cannot perform detailed analysis."
        return 1
    fi
    
    # Get prometheus endpoint
    local prometheus_url="http://$(kubectl get service prometheus -n monitoring -o jsonpath='{.spec.clusterIP}'):9090"
    
    # Queries for analysis
    local queries=(
        "rate(container_cpu_usage_seconds_total{pod=~\"${service}-.*\"}[5m]) * 100"
        "container_memory_usage_bytes{pod=~\"${service}-.*\"} / 1024 / 1024"
        "kube_deployment_status_replicas{deployment=\"$service\"}"
        "rate(http_requests_total{service=\"$service\"}[5m])"
    )
    
    local metrics=("CPU Usage (%)" "Memory Usage (MB)" "Replica Count" "Request Rate (req/s)")
    
    for i in "${!queries[@]}"; do
        local query="${queries[$i]}"
        local metric="${metrics[$i]}"
        
        print_status "Fetching $metric data..."
        
        # This would typically involve API calls to Prometheus
        # For now, we'll show the query that would be used
        echo "  Query: $query"
        echo "  Time Range: $timerange"
        echo
    done
    
    print_status "For detailed analysis, use Grafana dashboard or Prometheus queries"
    print_status "Prometheus URL: $prometheus_url"
}

# Function to create scaling recommendations
generate_scaling_recommendations() {
    local service=${1:-"all"}
    
    print_header "Scaling Recommendations"
    
    if [ "$service" = "all" ]; then
        local all_services=("${SERVICES[@]}" "${APPS[@]}")
        for svc in "${all_services[@]}"; do
            analyze_service_recommendations "$svc"
            echo
        done
    else
        analyze_service_recommendations "$service"
    fi
}

# Function to analyze and recommend scaling for a service
analyze_service_recommendations() {
    local service=$1
    
    print_status "Analyzing $service..."
    
    # Get current resource usage
    local pod_metrics=$(kubectl top pods -n "$NAMESPACE" -l "app.kubernetes.io/name=$service" --no-headers 2>/dev/null || echo "")
    local hpa_info=$(kubectl get hpa "${service}-hpa" -n "$NAMESPACE" -o json 2>/dev/null || echo "{}")
    local deployment_info=$(kubectl get deployment "$service" -n "$NAMESPACE" -o json 2>/dev/null || echo "{}")
    
    if [ "$deployment_info" = "{}" ]; then
        print_warning "Service $service not found"
        return 1
    fi
    
    local current_replicas=$(echo "$deployment_info" | jq -r '.status.replicas // 0')
    local ready_replicas=$(echo "$deployment_info" | jq -r '.status.readyReplicas // 0')
    
    # Resource analysis
    if [ -n "$pod_metrics" ]; then
        local total_cpu=0
        local total_memory=0
        local pod_count=0
        
        while IFS= read -r line; do
            if [ -n "$line" ]; then
                local cpu=$(echo "$line" | awk '{print $2}' | sed 's/m$//')
                local memory=$(echo "$line" | awk '{print $3}' | sed 's/Mi$//')
                total_cpu=$((total_cpu + cpu))
                total_memory=$((total_memory + memory))
                pod_count=$((pod_count + 1))
            fi
        done <<< "$pod_metrics"
        
        if [ "$pod_count" -gt 0 ]; then
            local avg_cpu_per_pod=$((total_cpu / pod_count))
            local avg_memory_per_pod=$((total_memory / pod_count))
            
            # Generate recommendations based on usage
            echo "  Current State:"
            echo "    - Replicas: $current_replicas (${ready_replicas} ready)"
            echo "    - Avg CPU: ${avg_cpu_per_pod}m per pod"
            echo "    - Avg Memory: ${avg_memory_per_pod}Mi per pod"
            echo
            echo "  Recommendations:"
            
            # CPU-based recommendations
            if [ "$avg_cpu_per_pod" -gt 800 ]; then
                echo "    - 🔴 HIGH CPU: Consider increasing replicas or resource limits"
                echo "    - Recommended: Scale up to $((current_replicas + 2)) replicas"
            elif [ "$avg_cpu_per_pod" -lt 200 ] && [ "$current_replicas" -gt 2 ]; then
                echo "    - 🟡 LOW CPU: Consider reducing replicas to save resources"
                echo "    - Recommended: Scale down to $((current_replicas - 1)) replicas"
            else
                echo "    - 🟢 CPU usage is optimal"
            fi
            
            # Memory-based recommendations
            if [ "$avg_memory_per_pod" -gt 1024 ]; then
                echo "    - 🔴 HIGH MEMORY: Consider increasing memory limits or replicas"
            elif [ "$avg_memory_per_pod" -lt 256 ] && [ "$current_replicas" -gt 2 ]; then
                echo "    - 🟡 LOW MEMORY: Memory usage is low, consider consolidation"
            else
                echo "    - 🟢 Memory usage is acceptable"
            fi
            
            # HPA recommendations
            if [ "$hpa_info" = "{}" ]; then
                echo "    - 📈 SCALING: Enable HPA for automatic scaling"
                echo "    - Command: $0 hpa enable $service"
            else
                local current_cpu_target=$(echo "$hpa_info" | jq -r '.spec.metrics[] | select(.type=="Resource" and .resource.name=="cpu") | .resource.target.averageUtilization // 70')
                if [ "$avg_cpu_per_pod" -gt $((current_cpu_target * 10)) ]; then
                    echo "    - 📈 HPA: CPU target too high, consider lowering to 60%"
                fi
            fi
        fi
    else
        echo "  ⚠️  No resource metrics available"
        echo "  Ensure metrics-server is installed and running"
    fi
}

# Function to export scaling configuration
export_scaling_config() {
    local output_file=${1:-"scaling-config-$(date +%Y%m%d-%H%M%S).yaml"}
    
    print_header "Exporting Scaling Configuration"
    print_status "Output file: $output_file"
    
    # Export all HPA configurations
    kubectl get hpa -n "$NAMESPACE" -o yaml > "$output_file"
    
    # Add PDB configurations
    echo "---" >> "$output_file"
    kubectl get pdb -n "$NAMESPACE" -o yaml >> "$output_file"
    
    print_success "Scaling configuration exported to $output_file"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 <command> [options]

Commands:
  status [service]                    - Show current scaling status
  scale <service> <replicas>          - Manual scale a service
  hpa <enable|disable> <service>      - Enable/disable HPA for service
  policy <service> [min] [max] [cpu] [memory] - Configure scaling policies
  stress <service> [duration] [rps]  - Run stress test for scaling
  analyze <service> [timerange]       - Analyze scaling performance
  recommend [service]                 - Generate scaling recommendations
  export [file]                       - Export scaling configuration

Examples:
  $0 status                          - Show status for all services
  $0 status auth-service             - Show status for auth-service
  $0 scale auth-service 5            - Scale auth-service to 5 replicas
  $0 hpa enable auth-service         - Enable HPA for auth-service
  $0 policy auth-service 3 15 60 70  - Set min=3, max=15, CPU=60%, Memory=70%
  $0 stress auth-service 600 200     - Stress test for 10min at 200 RPS
  $0 analyze auth-service 2h         - Analyze last 2 hours performance
  $0 recommend                       - Get recommendations for all services

Environment Variables:
  NAMESPACE                          - Kubernetes namespace (default: zoptal-production)
  KUBECTL_TIMEOUT                    - Timeout for kubectl operations (default: 300s)

EOF
}

# Main function
main() {
    local command=${1:-"help"}
    
    case $command in
        "status")
            check_dependencies
            get_scaling_status "${2:-all}"
            ;;
        "scale")
            local service=${2:-}
            local replicas=${3:-}
            
            if [ -z "$service" ] || [ -z "$replicas" ]; then
                print_error "Usage: $0 scale <service> <replicas>"
                exit 1
            fi
            
            check_dependencies
            manual_scale "$service" "$replicas"
            ;;
        "hpa")
            local action=${2:-}
            local service=${3:-}
            
            if [ -z "$action" ] || [ -z "$service" ]; then
                print_error "Usage: $0 hpa <enable|disable> <service>"
                exit 1
            fi
            
            check_dependencies
            manage_hpa "$service" "$action"
            ;;
        "policy")
            local service=${2:-}
            local min_replicas=${3:-2}
            local max_replicas=${4:-10}
            local cpu_target=${5:-70}
            local memory_target=${6:-80}
            
            if [ -z "$service" ]; then
                print_error "Usage: $0 policy <service> [min] [max] [cpu] [memory]"
                exit 1
            fi
            
            check_dependencies
            configure_scaling_policies "$service" "$min_replicas" "$max_replicas" "$cpu_target" "$memory_target"
            ;;
        "stress")
            local service=${2:-}
            local duration=${3:-300}
            local rps=${4:-100}
            
            if [ -z "$service" ]; then
                print_error "Usage: $0 stress <service> [duration] [rps]"
                exit 1
            fi
            
            check_dependencies
            stress_test_scaling "$service" "$duration" "$rps"
            ;;
        "analyze")
            local service=${2:-}
            local timerange=${3:-"1h"}
            
            if [ -z "$service" ]; then
                print_error "Usage: $0 analyze <service> [timerange]"
                exit 1
            fi
            
            check_dependencies
            analyze_scaling_performance "$service" "$timerange"
            ;;
        "recommend")
            check_dependencies
            generate_scaling_recommendations "${2:-all}"
            ;;
        "export")
            check_dependencies
            export_scaling_config "${2:-}"
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"