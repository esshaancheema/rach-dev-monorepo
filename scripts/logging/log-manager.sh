#!/bin/bash

# Log Manager for Zoptal Platform ELK Stack
# Provides comprehensive logging operations and management

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
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
NAMESPACE="${NAMESPACE:-zoptal-production}"
ELASTICSEARCH_HOST="${ELASTICSEARCH_HOST:-elasticsearch-master}"
ELASTICSEARCH_PORT="${ELASTICSEARCH_PORT:-9200}"
KIBANA_HOST="${KIBANA_HOST:-kibana}"
KIBANA_PORT="${KIBANA_PORT:-5601}"

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
    print_header "Checking Dependencies"
    
    local missing_tools=()
    local tools=("kubectl" "curl" "jq")
    
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

# Function to check ELK stack status
check_elk_status() {
    print_header "ELK Stack Status"
    
    # Check Elasticsearch
    print_status "Checking Elasticsearch..."
    local es_pods=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=elasticsearch --no-headers | wc -l)
    local es_ready=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=elasticsearch --no-headers | grep -c "Running" || echo "0")
    
    printf "  %-20s %s/%s\n" "Elasticsearch:" "$es_ready" "$es_pods"
    
    # Check Logstash
    print_status "Checking Logstash..."
    local ls_pods=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=logstash --no-headers | wc -l)
    local ls_ready=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=logstash --no-headers | grep -c "Running" || echo "0")
    
    printf "  %-20s %s/%s\n" "Logstash:" "$ls_ready" "$ls_pods"
    
    # Check Kibana
    print_status "Checking Kibana..."
    local kb_pods=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=kibana --no-headers | wc -l)
    local kb_ready=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=kibana --no-headers | grep -c "Running" || echo "0")
    
    printf "  %-20s %s/%s\n" "Kibana:" "$kb_ready" "$kb_pods"
    
    # Check Filebeat
    print_status "Checking Filebeat..."
    local fb_pods=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=filebeat --no-headers | wc -l)
    local fb_ready=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=filebeat --no-headers | grep -c "Running" || echo "0")
    
    printf "  %-20s %s/%s\n" "Filebeat:" "$fb_ready" "$fb_pods"
    
    # Check services
    echo
    print_status "Service Status:"
    kubectl get services -n "$NAMESPACE" -l 'app.kubernetes.io/name in (elasticsearch,logstash,kibana)' -o wide
}

# Function to check Elasticsearch cluster health
check_elasticsearch_health() {
    print_header "Elasticsearch Cluster Health"
    
    # Port forward to Elasticsearch if needed
    local es_url="http://$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT"
    
    # Try direct connection first, fallback to port-forward
    if ! curl -s "$es_url" > /dev/null 2>&1; then
        print_status "Direct connection failed, trying port-forward..."
        kubectl port-forward -n "$NAMESPACE" svc/elasticsearch-master 9200:9200 &
        local pf_pid=$!
        sleep 3
        es_url="http://localhost:9200"
        
        # Cleanup function for port-forward
        cleanup_port_forward() {
            kill $pf_pid 2>/dev/null || true
        }
        trap cleanup_port_forward EXIT
    fi
    
    # Get cluster health
    local health_response=$(curl -s "$es_url/_cluster/health" 2>/dev/null || echo "{}")
    
    if [ "$health_response" != "{}" ]; then
        echo "$health_response" | jq -r '
            "Cluster Status: " + .status,
            "Number of Nodes: " + (.number_of_nodes | tostring),
            "Number of Data Nodes: " + (.number_of_data_nodes | tostring),
            "Active Primary Shards: " + (.active_primary_shards | tostring),
            "Active Shards: " + (.active_shards | tostring),
            "Relocating Shards: " + (.relocating_shards | tostring),
            "Initializing Shards: " + (.initializing_shards | tostring),
            "Unassigned Shards: " + (.unassigned_shards | tostring)
        '
        
        # Show node information
        echo
        print_status "Elasticsearch Nodes:"
        curl -s "$es_url/_cat/nodes?h=name,heap.percent,ram.percent,cpu,load_1m,role,master&format=json" 2>/dev/null | \
            jq -r '.[] | [.name, .heap.percent, .ram.percent, .cpu, .load_1m, .role, .master] | @tsv' | \
            while IFS=$'\t' read -r name heap ram cpu load role master; do
                printf "  %-30s Heap: %3s%% RAM: %3s%% CPU: %3s%% Load: %s Role: %s Master: %s\n" \
                    "$name" "$heap" "$ram" "$cpu" "$load" "$role" "$master"
            done
        
        # Show index information
        echo
        print_status "Recent Indices:"
        curl -s "$es_url/_cat/indices/zoptal-*?h=index,health,status,pri,rep,docs.count,store.size&s=index:desc&format=json" 2>/dev/null | \
            jq -r '.[:10][] | [.index, .health, .status, .pri, .rep, .docs.count, .store.size] | @tsv' | \
            while IFS=$'\t' read -r index health status pri rep docs size; do
                printf "  %-40s %s %s Pri:%s Rep:%s Docs:%s Size:%s\n" \
                    "$index" "$health" "$status" "$pri" "$rep" "$docs" "$size"
            done
    else
        print_error "Cannot connect to Elasticsearch"
        return 1
    fi
}

# Function to search logs
search_logs() {
    local query=${1:-"*"}
    local index=${2:-"zoptal-*"}
    local size=${3:-10}
    local time_range=${4:-"1h"}
    
    print_header "Log Search"
    print_status "Query: $query"
    print_status "Index: $index"
    print_status "Size: $size"
    print_status "Time Range: $time_range"
    
    local es_url="http://$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT"
    
    # Try direct connection first, fallback to port-forward
    if ! curl -s "$es_url" > /dev/null 2>&1; then
        print_status "Using port-forward to Elasticsearch..."
        kubectl port-forward -n "$NAMESPACE" svc/elasticsearch-master 9200:9200 &
        local pf_pid=$!
        sleep 3
        es_url="http://localhost:9200"
        
        cleanup_port_forward() {
            kill $pf_pid 2>/dev/null || true
        }
        trap cleanup_port_forward EXIT
    fi
    
    # Build search query
    local search_body='{
        "query": {
            "bool": {
                "must": [
                    {
                        "query_string": {
                            "query": "'$query'"
                        }
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": "now-'$time_range'"
                            }
                        }
                    }
                ]
            }
        },
        "sort": [
            {
                "@timestamp": {
                    "order": "desc"
                }
            }
        ],
        "size": '$size'
    }'
    
    # Execute search
    local search_response=$(curl -s -X POST "$es_url/$index/_search" \
        -H "Content-Type: application/json" \
        -d "$search_body" 2>/dev/null || echo '{"hits":{"hits":[]}}')
    
    # Display results
    echo "$search_response" | jq -r '
        .hits.hits[] | 
        {
            timestamp: ._source."@timestamp",
            service: (._source.service_name // ._source.k8s_container // "unknown"),
            level: (._source.level // "INFO"),
            message: (._source.message // ._source.log_message // "")
        } |
        "\(.timestamp) [\(.level)] \(.service): \(.message)"
    ' | head -"$size"
    
    # Show summary
    local total_hits=$(echo "$search_response" | jq -r '.hits.total.value // 0')
    echo
    print_status "Total matches: $total_hits"
}

# Function to show log statistics
show_log_stats() {
    local time_range=${1:-"24h"}
    
    print_header "Log Statistics (Last $time_range)"
    
    local es_url="http://$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT"
    
    # Try direct connection first, fallback to port-forward
    if ! curl -s "$es_url" > /dev/null 2>&1; then
        kubectl port-forward -n "$NAMESPACE" svc/elasticsearch-master 9200:9200 &
        local pf_pid=$!
        sleep 3
        es_url="http://localhost:9200"
        
        cleanup_port_forward() {
            kill $pf_pid 2>/dev/null || true
        }
        trap cleanup_port_forward EXIT
    fi
    
    # Get log counts by service
    print_status "Log counts by service:"
    local service_query='{
        "aggs": {
            "services": {
                "terms": {
                    "field": "service_name.keyword",
                    "size": 20
                }
            }
        },
        "query": {
            "range": {
                "@timestamp": {
                    "gte": "now-'$time_range'"
                }
            }
        },
        "size": 0
    }'
    
    curl -s -X POST "$es_url/zoptal-application-logs-*/_search" \
        -H "Content-Type: application/json" \
        -d "$service_query" 2>/dev/null | \
        jq -r '.aggregations.services.buckets[] | "  \(.key): \(.doc_count)"'
    
    echo
    
    # Get log counts by level
    print_status "Log counts by level:"
    local level_query='{
        "aggs": {
            "levels": {
                "terms": {
                    "field": "level.keyword",
                    "size": 10
                }
            }
        },
        "query": {
            "range": {
                "@timestamp": {
                    "gte": "now-'$time_range'"
                }
            }
        },
        "size": 0
    }'
    
    curl -s -X POST "$es_url/zoptal-application-logs-*/_search" \
        -H "Content-Type: application/json" \
        -d "$level_query" 2>/dev/null | \
        jq -r '.aggregations.levels.buckets[] | "  \(.key): \(.doc_count)"'
    
    echo
    
    # Get error statistics
    print_status "Recent errors:"
    local error_query='{
        "query": {
            "bool": {
                "must": [
                    {
                        "terms": {
                            "level.keyword": ["ERROR", "FATAL"]
                        }
                    },
                    {
                        "range": {
                            "@timestamp": {
                                "gte": "now-'$time_range'"
                            }
                        }
                    }
                ]
            }
        },
        "sort": [
            {
                "@timestamp": {
                    "order": "desc"
                }
            }
        ],
        "size": 5
    }'
    
    curl -s -X POST "$es_url/zoptal-application-logs-*/_search" \
        -H "Content-Type: application/json" \
        -d "$error_query" 2>/dev/null | \
        jq -r '.hits.hits[] | "  \(._source."@timestamp") [\(._source.level)] \(._source.service_name): \(._source.message)"'
}

# Function to manage index lifecycle
manage_indices() {
    local action=${1:-"list"}
    local pattern=${2:-"zoptal-*"}
    
    print_header "Index Management"
    
    local es_url="http://$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT"
    
    # Try direct connection first, fallback to port-forward
    if ! curl -s "$es_url" > /dev/null 2>&1; then
        kubectl port-forward -n "$NAMESPACE" svc/elasticsearch-master 9200:9200 &
        local pf_pid=$!
        sleep 3
        es_url="http://localhost:9200"
        
        cleanup_port_forward() {
            kill $pf_pid 2>/dev/null || true
        }
        trap cleanup_port_forward EXIT
    fi
    
    case $action in
        "list")
            print_status "Current indices matching pattern: $pattern"
            curl -s "$es_url/_cat/indices/$pattern?h=index,health,status,pri,rep,docs.count,store.size&s=index:desc" 2>/dev/null | \
                while read -r index health status pri rep docs size; do
                    printf "  %-40s %s %s Pri:%s Rep:%s Docs:%s Size:%s\n" \
                        "$index" "$health" "$status" "$pri" "$rep" "$docs" "$size"
                done
            ;;
        "delete-old")
            local days=${3:-7}
            print_status "Deleting indices older than $days days..."
            
            # Get indices older than specified days
            local cutoff_date=$(date -d "$days days ago" '+%Y.%m.%d')
            curl -s "$es_url/_cat/indices/$pattern?h=index&s=index" 2>/dev/null | \
                while read -r index; do
                    # Extract date from index name (assuming format: prefix-YYYY.MM.DD)
                    local index_date=$(echo "$index" | grep -oE '[0-9]{4}\.[0-9]{2}\.[0-9]{2}' || echo "")
                    if [ -n "$index_date" ] && [[ "$index_date" < "$cutoff_date" ]]; then
                        print_status "Deleting old index: $index"
                        curl -s -X DELETE "$es_url/$index" >/dev/null
                    fi
                done
            ;;
        "force-merge")
            print_status "Force merging indices..."
            curl -s -X POST "$es_url/$pattern/_forcemerge?max_num_segments=1" >/dev/null
            print_success "Force merge initiated"
            ;;
        "refresh")
            print_status "Refreshing indices..."
            curl -s -X POST "$es_url/$pattern/_refresh" >/dev/null
            print_success "Indices refreshed"
            ;;
        *)
            print_error "Unknown action: $action"
            print_status "Available actions: list, delete-old, force-merge, refresh"
            return 1
            ;;
    esac
}

# Function to tail logs in real-time
tail_logs() {
    local service=${1:-"*"}
    local level=${2:-"*"}
    local follow=${3:-true}
    
    print_header "Tailing Logs"
    print_status "Service: $service"
    print_status "Level: $level"
    
    local es_url="http://$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT"
    
    # Try direct connection first, fallback to port-forward
    if ! curl -s "$es_url" > /dev/null 2>&1; then
        kubectl port-forward -n "$NAMESPACE" svc/elasticsearch-master 9200:9200 &
        local pf_pid=$!
        sleep 3
        es_url="http://localhost:9200"
        
        cleanup_port_forward() {
            kill $pf_pid 2>/dev/null || true
        }
        trap cleanup_port_forward EXIT
    fi
    
    # Build query
    local must_clauses='[]'
    
    if [ "$service" != "*" ]; then
        must_clauses=$(echo "$must_clauses" | jq '. + [{"term": {"service_name.keyword": "'$service'"}}]')
    fi
    
    if [ "$level" != "*" ]; then
        must_clauses=$(echo "$must_clauses" | jq '. + [{"term": {"level.keyword": "'$level'"}}]')
    fi
    
    local last_timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
    
    if [ "$follow" = "true" ]; then
        print_status "Following logs (Ctrl+C to stop)..."
        while true; do
            local search_body='{
                "query": {
                    "bool": {
                        "must": '$must_clauses',
                        "filter": [
                            {
                                "range": {
                                    "@timestamp": {
                                        "gt": "'$last_timestamp'"
                                    }
                                }
                            }
                        ]
                    }
                },
                "sort": [
                    {
                        "@timestamp": {
                            "order": "asc"
                        }
                    }
                ],
                "size": 100
            }'
            
            local response=$(curl -s -X POST "$es_url/zoptal-application-logs-*/_search" \
                -H "Content-Type: application/json" \
                -d "$search_body" 2>/dev/null || echo '{"hits":{"hits":[]}}')
            
            # Process and display new logs
            local new_logs=$(echo "$response" | jq -r '
                .hits.hits[] | 
                {
                    timestamp: ._source."@timestamp",
                    service: (._source.service_name // "unknown"),
                    level: (._source.level // "INFO"),
                    message: (._source.message // "")
                } |
                "\(.timestamp) [\(.level)] \(.service): \(.message)"
            ')
            
            if [ -n "$new_logs" ]; then
                echo "$new_logs"
                last_timestamp=$(echo "$response" | jq -r '.hits.hits[-1]._source."@timestamp"')
            fi
            
            sleep 2
        done
    else
        # Single query for recent logs
        local search_body='{
            "query": {
                "bool": {
                    "must": '$must_clauses',
                    "filter": [
                        {
                            "range": {
                                "@timestamp": {
                                    "gte": "now-1h"
                                }
                            }
                        }
                    ]
                }
            },
            "sort": [
                {
                    "@timestamp": {
                        "order": "desc"
                    }
                }
            ],
            "size": 50
        }'
        
        curl -s -X POST "$es_url/zoptal-application-logs-*/_search" \
            -H "Content-Type: application/json" \
            -d "$search_body" 2>/dev/null | \
            jq -r '.hits.hits[] | 
                {
                    timestamp: ._source."@timestamp",
                    service: (._source.service_name // "unknown"),
                    level: (._source.level // "INFO"),
                    message: (._source.message // "")
                } |
                "\(.timestamp) [\(.level)] \(.service): \(.message)"
            '
    fi
}

# Function to backup Elasticsearch indices
backup_indices() {
    local backup_name=${1:-"backup-$(date +%Y%m%d-%H%M%S)"}
    local indices=${2:-"zoptal-*"}
    
    print_header "Elasticsearch Index Backup"
    print_status "Backup name: $backup_name"
    print_status "Indices: $indices"
    
    local es_url="http://$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT"
    
    # Try direct connection first, fallback to port-forward
    if ! curl -s "$es_url" > /dev/null 2>&1; then
        kubectl port-forward -n "$NAMESPACE" svc/elasticsearch-master 9200:9200 &
        local pf_pid=$!
        sleep 3
        es_url="http://localhost:9200"
        
        cleanup_port_forward() {
            kill $pf_pid 2>/dev/null || true
        }
        trap cleanup_port_forward EXIT
    fi
    
    # Create snapshot repository if it doesn't exist
    print_status "Setting up snapshot repository..."
    curl -s -X PUT "$es_url/_snapshot/backup" \
        -H "Content-Type: application/json" \
        -d '{
            "type": "fs",
            "settings": {
                "location": "/usr/share/elasticsearch/backup"
            }
        }' >/dev/null
    
    # Create snapshot
    print_status "Creating snapshot..."
    local snapshot_body='{
        "indices": "'$indices'",
        "ignore_unavailable": true,
        "include_global_state": false,
        "metadata": {
            "taken_by": "log-manager",
            "taken_because": "manual backup"
        }
    }'
    
    if curl -s -X PUT "$es_url/_snapshot/backup/$backup_name" \
        -H "Content-Type: application/json" \
        -d "$snapshot_body" | jq -r '.accepted' | grep -q "true"; then
        print_success "Snapshot creation initiated: $backup_name"
        print_status "Monitor progress with: $0 backup status $backup_name"
    else
        print_error "Failed to create snapshot"
        return 1
    fi
}

# Function to check backup status
backup_status() {
    local backup_name=${1:-"_all"}
    
    print_header "Backup Status"
    
    local es_url="http://$ELASTICSEARCH_HOST:$ELASTICSEARCH_PORT"
    
    # Try direct connection first, fallback to port-forward
    if ! curl -s "$es_url" > /dev/null 2>&1; then
        kubectl port-forward -n "$NAMESPACE" svc/elasticsearch-master 9200:9200 &
        local pf_pid=$!
        sleep 3
        es_url="http://localhost:9200"
        
        cleanup_port_forward() {
            kill $pf_pid 2>/dev/null || true
        }
        trap cleanup_port_forward EXIT
    fi
    
    if [ "$backup_name" = "_all" ]; then
        # List all snapshots
        curl -s "$es_url/_snapshot/backup/_all" 2>/dev/null | \
            jq -r '.snapshots[] | 
                "\(.snapshot) \(.state) \(.start_time) \(.end_time // "in_progress")"' | \
            while read -r snapshot state start_time end_time; do
                printf "  %-30s %s %s -> %s\n" "$snapshot" "$state" "$start_time" "$end_time"
            done
    else
        # Show specific snapshot status
        curl -s "$es_url/_snapshot/backup/$backup_name" 2>/dev/null | \
            jq -r '.snapshots[0] | 
                "Snapshot: " + .snapshot,
                "State: " + .state,
                "Start Time: " + .start_time,
                "End Time: " + (.end_time // "in_progress"),
                "Duration: " + (.duration_in_millis // 0 | tostring) + "ms",
                "Indices: " + (.indices | join(", ")),
                "Shards Total: " + (.shards.total | tostring),
                "Shards Successful: " + (.shards.successful | tostring),
                "Shards Failed: " + (.shards.failed | tostring)
            '
    fi
}

# Function to create Kibana dashboards
setup_kibana_dashboards() {
    print_header "Setting up Kibana Dashboards"
    
    local kibana_url="http://$KIBANA_HOST:$KIBANA_PORT"
    
    # Try direct connection first, fallback to port-forward
    if ! curl -s "$kibana_url/api/status" > /dev/null 2>&1; then
        print_status "Using port-forward to Kibana..."
        kubectl port-forward -n "$NAMESPACE" svc/kibana 5601:5601 &
        local pf_pid=$!
        sleep 5
        kibana_url="http://localhost:5601"
        
        cleanup_port_forward() {
            kill $pf_pid 2>/dev/null || true
        }
        trap cleanup_port_forward EXIT
    fi
    
    # Wait for Kibana to be ready
    print_status "Waiting for Kibana to be ready..."
    local retries=30
    while [ $retries -gt 0 ]; do
        if curl -s "$kibana_url/api/status" | jq -r '.status.overall.state' | grep -q "green"; then
            break
        fi
        sleep 10
        ((retries--))
    done
    
    if [ $retries -eq 0 ]; then
        print_error "Kibana is not ready"
        return 1
    fi
    
    # Create index patterns
    print_status "Creating index patterns..."
    
    # Application logs index pattern
    curl -s -X POST "$kibana_url/api/saved_objects/index-pattern/zoptal-application-logs" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -d '{
            "attributes": {
                "title": "zoptal-application-logs-*",
                "timeFieldName": "@timestamp"
            }
        }' >/dev/null
    
    # Kubernetes logs index pattern
    curl -s -X POST "$kibana_url/api/saved_objects/index-pattern/zoptal-kubernetes-logs" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -d '{
            "attributes": {
                "title": "zoptal-kubernetes-logs-*",
                "timeFieldName": "@timestamp"
            }
        }' >/dev/null
    
    # Nginx logs index pattern
    curl -s -X POST "$kibana_url/api/saved_objects/index-pattern/zoptal-nginx-logs" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: true" \
        -d '{
            "attributes": {
                "title": "zoptal-nginx-logs-*",
                "timeFieldName": "@timestamp"
            }
        }' >/dev/null
    
    print_success "Index patterns created"
    print_status "Access Kibana at: $kibana_url"
}

# Function to troubleshoot logging issues
troubleshoot() {
    print_header "Logging Troubleshooting"
    
    # Check pod status
    print_status "Pod Status:"
    kubectl get pods -n "$NAMESPACE" -l 'app.kubernetes.io/name in (elasticsearch,logstash,kibana,filebeat)' -o wide
    
    echo
    
    # Check recent events
    print_status "Recent Events:"
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -10
    
    echo
    
    # Check persistent volumes
    print_status "Persistent Volumes:"
    kubectl get pv -o wide | grep "$NAMESPACE"
    
    echo
    
    # Check storage usage
    print_status "Storage Usage:"
    kubectl get pvc -n "$NAMESPACE" -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,VOLUME:.spec.volumeName,CAPACITY:.status.capacity.storage,USED:.status.capacity.storage
    
    echo
    
    # Check logs of problematic pods
    print_status "Checking for failed pods..."
    failed_pods=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running --no-headers | awk '{print $1}' || echo "")
    
    if [ -n "$failed_pods" ]; then
        for pod in $failed_pods; do
            print_warning "Logs for failed pod: $pod"
            kubectl logs -n "$NAMESPACE" "$pod" --tail=20
            echo
        done
    else
        print_success "No failed pods found"
    fi
    
    # Check Elasticsearch connectivity
    echo
    print_status "Testing Elasticsearch connectivity..."
    if kubectl exec -n "$NAMESPACE" -it $(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=elasticsearch -o jsonpath='{.items[0].metadata.name}') -- curl -s localhost:9200/_cluster/health > /dev/null; then
        print_success "Elasticsearch is accessible"
    else
        print_error "Cannot connect to Elasticsearch"
    fi
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 <command> [options]

Commands:
  status                          - Show ELK stack status
  health                          - Check Elasticsearch cluster health
  search <query> [index] [size] [time] - Search logs
  stats [time_range]              - Show log statistics
  tail <service> [level] [follow] - Tail logs in real-time
  indices <action> [pattern] [days] - Manage indices (list, delete-old, force-merge, refresh)
  backup <name> [indices]         - Backup Elasticsearch indices
  backup-status [name]            - Check backup status
  setup-kibana                    - Setup Kibana dashboards
  troubleshoot                    - Troubleshoot logging issues

Examples:
  $0 status                       - Show overall ELK stack status
  $0 health                       - Check Elasticsearch cluster health
  $0 search "ERROR"               - Search for error logs
  $0 search "user_id:123" "zoptal-application-logs-*" 20 "2h"
  $0 stats 24h                    - Show 24h log statistics
  $0 tail auth-service ERROR true - Follow error logs from auth-service
  $0 indices list                 - List all indices
  $0 indices delete-old "zoptal-*" 7 - Delete indices older than 7 days
  $0 backup daily-backup          - Create backup named daily-backup
  $0 setup-kibana                 - Setup Kibana dashboards
  $0 troubleshoot                 - Run troubleshooting checks

Environment Variables:
  NAMESPACE                       - Kubernetes namespace (default: zoptal-production)
  ELASTICSEARCH_HOST              - Elasticsearch hostname (default: elasticsearch-master)
  KIBANA_HOST                     - Kibana hostname (default: kibana)

EOF
}

# Main function
main() {
    local command=${1:-"help"}
    
    case $command in
        "status")
            check_dependencies
            check_elk_status
            ;;
        "health")
            check_dependencies
            check_elasticsearch_health
            ;;
        "search")
            local query=${2:-"*"}
            local index=${3:-"zoptal-*"}
            local size=${4:-10}
            local time_range=${5:-"1h"}
            
            check_dependencies
            search_logs "$query" "$index" "$size" "$time_range"
            ;;
        "stats")
            local time_range=${2:-"24h"}
            
            check_dependencies
            show_log_stats "$time_range"
            ;;
        "tail")
            local service=${2:-"*"}
            local level=${3:-"*"}
            local follow=${4:-true}
            
            check_dependencies
            tail_logs "$service" "$level" "$follow"
            ;;
        "indices")
            local action=${2:-"list"}
            local pattern=${3:-"zoptal-*"}
            local days=${4:-7}
            
            check_dependencies
            manage_indices "$action" "$pattern" "$days"
            ;;
        "backup")
            local backup_name=${2:-"backup-$(date +%Y%m%d-%H%M%S)"}
            local indices=${3:-"zoptal-*"}
            
            check_dependencies
            backup_indices "$backup_name" "$indices"
            ;;
        "backup-status")
            local backup_name=${2:-"_all"}
            
            check_dependencies
            backup_status "$backup_name"
            ;;
        "setup-kibana")
            check_dependencies
            setup_kibana_dashboards
            ;;
        "troubleshoot")
            check_dependencies
            troubleshoot
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