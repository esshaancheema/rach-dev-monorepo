#!/bin/bash
# deployment-monitor.sh - Automated deployment monitoring and health checks

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/var/log/zoptal/deployments"
METRICS_ENDPOINT="${PROMETHEUS_URL:-http://prometheus:9090}"
ALERT_THRESHOLD_ERROR_RATE="${ALERT_THRESHOLD_ERROR_RATE:-0.05}"
ALERT_THRESHOLD_LATENCY="${ALERT_THRESHOLD_LATENCY:-2000}"
MONITORING_DURATION="${MONITORING_DURATION:-600}"  # 10 minutes
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# Arguments
SERVICE_NAME="${1:-}"
ENVIRONMENT="${2:-production}"
DEPLOYMENT_ID="${3:-$(date +%Y%m%d_%H%M%S)}"

# Usage
if [ -z "$SERVICE_NAME" ]; then
    echo "Usage: $0 <service-name> [environment] [deployment-id]"
    echo "Example: $0 auth-service production deploy_20240115_143000"
    exit 1
fi

# Create log directory
mkdir -p ${LOG_DIR}
LOG_FILE="${LOG_DIR}/${SERVICE_NAME}_${ENVIRONMENT}_${DEPLOYMENT_ID}.log"

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a ${LOG_FILE}
}

# Send alert function
send_alert() {
    local severity=$1
    local message=$2
    local color="danger"
    
    case $severity in
        "INFO") color="good" ;;
        "WARNING") color="warning" ;;
        "CRITICAL") color="danger" ;;
    esac
    
    if [ -n "${SLACK_WEBHOOK_URL}" ]; then
        curl -X POST ${SLACK_WEBHOOK_URL} \
            -H 'Content-type: application/json' \
            -d '{
                "attachments": [{
                    "color": "'$color'",
                    "title": "'$severity': Deployment Monitor Alert",
                    "fields": [
                        {"title": "Service", "value": "'$SERVICE_NAME'", "short": true},
                        {"title": "Environment", "value": "'$ENVIRONMENT'", "short": true},
                        {"title": "Deployment ID", "value": "'$DEPLOYMENT_ID'", "short": true},
                        {"title": "Message", "value": "'$message'", "short": false}
                    ]
                }]
            }' 2>/dev/null || true
    fi
    
    # Send to monitoring system
    if [ -n "${PUSHGATEWAY_URL:-}" ]; then
        cat <<EOF | curl -X POST ${PUSHGATEWAY_URL}/metrics/job/deployment_monitor --data-binary @-
# TYPE deployment_alert_total counter
deployment_alert_total{service="$SERVICE_NAME",environment="$ENVIRONMENT",severity="$severity"} 1
EOF
    fi
}

# Get Prometheus metrics
get_metric() {
    local query=$1
    local default=${2:-0}
    
    curl -s "${METRICS_ENDPOINT}/api/v1/query" \
        --data-urlencode "query=${query}" \
        2>/dev/null | \
        jq -r '.data.result[0].value[1] // "'$default'"' 2>/dev/null || echo "$default"
}

# Health check function
check_service_health() {
    log "Performing health check for ${SERVICE_NAME}..."
    
    # Direct health check
    if kubectl get service ${SERVICE_NAME} -n ${ENVIRONMENT} &>/dev/null; then
        # Port forward for health check
        kubectl port-forward service/${SERVICE_NAME} 8080:80 -n ${ENVIRONMENT} &
        PF_PID=$!
        
        sleep 5
        
        # Health check with timeout
        if timeout 30s bash -c 'until curl -sf http://localhost:8080/health; do sleep 1; done'; then
            log "✅ Health check passed"
            kill $PF_PID 2>/dev/null || true
            return 0
        else
            log "❌ Health check failed"
            kill $PF_PID 2>/dev/null || true
            return 1
        fi
    else
        log "❌ Service ${SERVICE_NAME} not found in ${ENVIRONMENT}"
        return 1
    fi
}

# Get deployment status
get_deployment_status() {
    kubectl get deployment ${SERVICE_NAME} -n ${ENVIRONMENT} -o jsonpath='{.status}' 2>/dev/null | jq -r '
        {
            replicas: .replicas,
            readyReplicas: .readyReplicas,
            updatedReplicas: .updatedReplicas,
            availableReplicas: .availableReplicas,
            conditions: [.conditions[] | {type: .type, status: .status, reason: .reason}]
        }
    ' 2>/dev/null
}

# Monitor deployment metrics
monitor_deployment() {
    log "Starting deployment monitoring for ${SERVICE_NAME} in ${ENVIRONMENT}"
    log "Monitoring duration: ${MONITORING_DURATION} seconds"
    
    local start_time=$(date +%s)
    local end_time=$((start_time + MONITORING_DURATION))
    local check_interval=30
    local iterations=$((MONITORING_DURATION / check_interval))
    
    local alerts_count=0
    local max_alerts=5
    
    for i in $(seq 1 $iterations); do
        log "Monitoring iteration $i/$iterations"
        
        # Get current timestamp for queries
        local now=$(date +%s)
        local five_min_ago=$((now - 300))
        
        # Health check
        if ! check_service_health; then
            alerts_count=$((alerts_count + 1))
            send_alert "CRITICAL" "Health check failed for ${SERVICE_NAME}"
            
            if [ $alerts_count -ge $max_alerts ]; then
                log "❌ Maximum alerts reached, stopping monitoring"
                return 1
            fi
        fi
        
        # Get deployment status
        local deployment_status=$(get_deployment_status)
        log "Deployment status: $deployment_status"
        
        # Extract metrics
        local replicas=$(echo "$deployment_status" | jq -r '.replicas // 0')
        local ready_replicas=$(echo "$deployment_status" | jq -r '.readyReplicas // 0')
        local available_replicas=$(echo "$deployment_status" | jq -r '.availableReplicas // 0')
        
        log "Replicas: $ready_replicas/$replicas ready, $available_replicas available"
        
        # Check if deployment is ready
        if [ "$ready_replicas" != "$replicas" ] || [ "$available_replicas" != "$replicas" ]; then
            log "⚠️ Deployment not fully ready"
            send_alert "WARNING" "Deployment not fully ready: $ready_replicas/$replicas ready"
        fi
        
        # Application metrics
        local error_rate=$(get_metric "rate(http_requests_total{job=\"$SERVICE_NAME\",code=~\"5..\"}[5m])")
        local success_rate=$(get_metric "rate(http_requests_total{job=\"$SERVICE_NAME\",code=~\"2..\"}[5m])")
        local p95_latency=$(get_metric "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"$SERVICE_NAME\"}[5m]))")
        local p99_latency=$(get_metric "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job=\"$SERVICE_NAME\"}[5m]))")
        
        # Resource metrics
        local cpu_usage=$(get_metric "avg(rate(container_cpu_usage_seconds_total{pod=~\"$SERVICE_NAME-.*\",container!=\"POD\"}[5m]))")
        local memory_usage=$(get_metric "avg(container_memory_usage_bytes{pod=~\"$SERVICE_NAME-.*\",container!=\"POD\"})")
        local memory_limit=$(get_metric "avg(container_spec_memory_limit_bytes{pod=~\"$SERVICE_NAME-.*\",container!=\"POD\"})")
        
        # Business metrics (if available)
        local active_sessions=$(get_metric "active_sessions{service=\"$SERVICE_NAME\"}")
        local queue_depth=$(get_metric "queue_depth{service=\"$SERVICE_NAME\"}")
        
        # Log metrics
        log "Metrics Summary:"
        log "  Error Rate: $error_rate"
        log "  Success Rate: $success_rate"
        log "  P95 Latency: ${p95_latency}ms"
        log "  P99 Latency: ${p99_latency}ms"
        log "  CPU Usage: $cpu_usage"
        log "  Memory Usage: $(echo "scale=2; $memory_usage/1024/1024" | bc -l)MB"
        log "  Memory Limit: $(echo "scale=2; $memory_limit/1024/1024" | bc -l)MB"
        log "  Active Sessions: $active_sessions"
        log "  Queue Depth: $queue_depth"
        
        # Threshold checks
        local alert_triggered=false
        
        # Error rate check
        if (( $(echo "$error_rate > $ALERT_THRESHOLD_ERROR_RATE" | bc -l) )); then
            log "❌ High error rate detected: $error_rate (threshold: $ALERT_THRESHOLD_ERROR_RATE)"
            send_alert "CRITICAL" "High error rate: $error_rate (threshold: $ALERT_THRESHOLD_ERROR_RATE)"
            alert_triggered=true
            alerts_count=$((alerts_count + 1))
        fi
        
        # Latency check (convert to milliseconds)
        local latency_ms=$(echo "$p95_latency * 1000" | bc -l)
        if (( $(echo "$latency_ms > $ALERT_THRESHOLD_LATENCY" | bc -l) )); then
            log "⚠️ High latency detected: ${latency_ms}ms (threshold: ${ALERT_THRESHOLD_LATENCY}ms)"
            send_alert "WARNING" "High latency: ${latency_ms}ms (threshold: ${ALERT_THRESHOLD_LATENCY}ms)"
            alert_triggered=true
        fi
        
        # Memory usage check (> 90% of limit)
        if [ "$memory_limit" != "0" ]; then
            local memory_usage_percent=$(echo "scale=2; $memory_usage * 100 / $memory_limit" | bc -l)
            if (( $(echo "$memory_usage_percent > 90" | bc -l) )); then
                log "⚠️ High memory usage: ${memory_usage_percent}%"
                send_alert "WARNING" "High memory usage: ${memory_usage_percent}%"
            fi
        fi
        
        # Queue depth check
        if [ "$queue_depth" != "0" ] && (( $(echo "$queue_depth > 100" | bc -l) )); then
            log "⚠️ High queue depth: $queue_depth"
            send_alert "WARNING" "High queue depth: $queue_depth"
        fi
        
        # Update monitoring metrics
        if [ -n "${PUSHGATEWAY_URL:-}" ]; then
            cat <<EOF | curl -X POST ${PUSHGATEWAY_URL}/metrics/job/deployment_monitor --data-binary @-
# TYPE deployment_monitor_error_rate gauge
deployment_monitor_error_rate{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $error_rate
# TYPE deployment_monitor_latency_p95 gauge
deployment_monitor_latency_p95{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $p95_latency
# TYPE deployment_monitor_cpu_usage gauge
deployment_monitor_cpu_usage{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $cpu_usage
# TYPE deployment_monitor_memory_usage gauge
deployment_monitor_memory_usage{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $memory_usage
# TYPE deployment_monitor_ready_replicas gauge
deployment_monitor_ready_replicas{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $ready_replicas
# TYPE deployment_monitor_last_check gauge
deployment_monitor_last_check{service="$SERVICE_NAME",environment="$ENVIRONMENT"} $(date +%s)
EOF
        fi
        
        # Early exit if too many alerts
        if [ $alerts_count -ge $max_alerts ]; then
            log "❌ Maximum alerts reached, deployment may be unhealthy"
            send_alert "CRITICAL" "Maximum alerts reached ($max_alerts), deployment monitoring failed"
            return 1
        fi
        
        # Sleep before next iteration
        sleep $check_interval
    done
    
    # Final health check
    if check_service_health; then
        log "✅ Deployment monitoring completed successfully"
        send_alert "INFO" "Deployment monitoring completed successfully. No critical issues detected."
        return 0
    else
        log "❌ Final health check failed"
        send_alert "CRITICAL" "Final health check failed after monitoring period"
        return 1
    fi
}

# Generate monitoring report
generate_report() {
    local status=$1
    local report_file="${LOG_DIR}/${SERVICE_NAME}_${ENVIRONMENT}_${DEPLOYMENT_ID}_report.json"
    
    cat > $report_file <<EOF
{
    "deploymentId": "$DEPLOYMENT_ID",
    "service": "$SERVICE_NAME",
    "environment": "$ENVIRONMENT",
    "startTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "endTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "$status",
    "monitoringDuration": $MONITORING_DURATION,
    "logFile": "$LOG_FILE",
    "finalMetrics": {
        "errorRate": "$(get_metric "rate(http_requests_total{job=\"$SERVICE_NAME\",code=~\"5..\"}[5m])")",
        "p95Latency": "$(get_metric "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"$SERVICE_NAME\"}[5m]))")",
        "cpuUsage": "$(get_metric "avg(rate(container_cpu_usage_seconds_total{pod=~\"$SERVICE_NAME-.*\"}[5m]))")",
        "memoryUsage": "$(get_metric "avg(container_memory_usage_bytes{pod=~\"$SERVICE_NAME-.*\"})")"
    }
}
EOF
    
    log "Monitoring report generated: $report_file"
}

# Main execution
main() {
    log "=== Deployment Monitor Started ==="
    log "Service: $SERVICE_NAME"
    log "Environment: $ENVIRONMENT"
    log "Deployment ID: $DEPLOYMENT_ID"
    
    # Check prerequisites
    if ! command -v kubectl &> /dev/null; then
        log "❌ kubectl not found"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log "❌ jq not found"
        exit 1
    fi
    
    if ! command -v bc &> /dev/null; then
        log "❌ bc not found"
        exit 1
    fi
    
    # Start monitoring
    if monitor_deployment; then
        log "✅ Deployment monitoring successful"
        generate_report "success"
        exit 0
    else
        log "❌ Deployment monitoring failed"
        generate_report "failed"
        
        # Trigger automatic rollback if configured
        if [ "${AUTO_ROLLBACK_ON_FAILURE:-false}" = "true" ]; then
            log "🔄 Triggering automatic rollback..."
            
            # Create rollback payload
            cat > /tmp/rollback_payload.json <<EOF
{
    "event_type": "auto-rollback",
    "client_payload": {
        "service": "$SERVICE_NAME",
        "environment": "$ENVIRONMENT",
        "reason": "Deployment monitoring failed - automatic rollback",
        "rollback_to": "previous",
        "triggered_by": "deployment-monitor"
    }
}
EOF
            
            # Trigger rollback workflow
            curl -X POST \
                -H "Accept: application/vnd.github.v3+json" \
                -H "Authorization: token ${GITHUB_TOKEN}" \
                "${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/dispatches" \
                -d @/tmp/rollback_payload.json
            
            log "🔄 Automatic rollback triggered"
        fi
        
        exit 1
    fi
}

# Run main function
main "$@"