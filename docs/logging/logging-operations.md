# Logging Operations Guide

## Overview

This guide covers comprehensive logging operations for the Zoptal platform using the ELK (Elasticsearch, Logstash, Kibana) stack with Filebeat for log collection and aggregation.

## Table of Contents

1. [Logging Architecture](#logging-architecture)
2. [ELK Stack Components](#elk-stack-components)
3. [Log Collection and Processing](#log-collection-and-processing)
4. [Index Management](#index-management)
5. [Search and Analysis](#search-and-analysis)
6. [Kibana Dashboards](#kibana-dashboards)
7. [Alerting and Monitoring](#alerting-and-monitoring)
8. [Backup and Recovery](#backup-and-recovery)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

## Logging Architecture

### Overview

The Zoptal platform implements a centralized logging architecture:

- **Log Collection**: Filebeat DaemonSet collects logs from all nodes
- **Log Processing**: Logstash processes and enriches log data
- **Log Storage**: Elasticsearch cluster stores indexed logs
- **Log Visualization**: Kibana provides dashboards and search interface
- **Index Lifecycle**: Automated index rotation and cleanup

### Log Flow

```
Application Logs → Filebeat → Logstash → Elasticsearch → Kibana
                     ↓
              Log Enrichment
              JSON Parsing
              Field Extraction
              Grok Patterns
```

### Log Types

| Log Type | Source | Index Pattern | Processing Pipeline |
|----------|--------|---------------|-------------------|
| Application | Services | `zoptal-application-logs-*` | JSON parsing, field extraction |
| Kubernetes | Containers | `zoptal-kubernetes-logs-*` | Container log parsing |
| Nginx | Ingress | `zoptal-nginx-logs-*` | Access log parsing, GeoIP |
| System | Nodes | `zoptal-system-logs-*` | Syslog parsing |

## ELK Stack Components

### Elasticsearch Configuration

#### Cluster Setup
- **3 Master Nodes**: For high availability and split-brain prevention
- **Data Storage**: SSD-backed persistent volumes
- **Memory**: 2GB heap per node with proper JVM tuning
- **Replication**: 1 replica per shard for fault tolerance

#### Key Settings
```yaml
cluster.name: "zoptal-logs"
discovery.zen.minimum_master_nodes: 2
node.master: true
node.data: true
node.ingest: true
bootstrap.memory_lock: false
xpack.security.enabled: false
```

#### Index Lifecycle Management (ILM)
- **Hot Phase**: New indices, rollover at 5GB or 1 day
- **Warm Phase**: After 2 days, reduce replicas to 0
- **Cold Phase**: After 7 days, allocate to cold nodes
- **Delete Phase**: After 30 days, delete indices

### Logstash Configuration

#### Processing Pipelines
1. **Application Logs Pipeline** (Port 5044)
   - JSON parsing
   - Timestamp extraction
   - Service metadata enrichment
   - Error categorization

2. **Kubernetes Logs Pipeline** (Port 5045)
   - Container log format parsing
   - Kubernetes metadata addition
   - Noise filtering

3. **Nginx Logs Pipeline** (Port 5046)
   - Access log parsing with NGINXACCESS pattern
   - GeoIP lookup
   - User agent parsing
   - Response categorization

#### Performance Settings
```yaml
pipeline.workers: 4
pipeline.batch.size: 1000
pipeline.batch.delay: 50
dead_letter_queue.enable: true
```

### Kibana Configuration

#### Features Enabled
- **Discover**: Log search and exploration
- **Visualize**: Chart and graph creation
- **Dashboard**: Custom dashboard creation
- **Dev Tools**: Elasticsearch query console
- **Monitoring**: ELK stack monitoring

#### Index Patterns
- `zoptal-application-logs-*`: Application log analysis
- `zoptal-kubernetes-logs-*`: Container log analysis
- `zoptal-nginx-logs-*`: Web access log analysis

### Filebeat Configuration

#### Collection Strategy
- **DaemonSet Deployment**: One pod per node
- **Container Log Collection**: Automatic discovery
- **Multi-line Processing**: Stack trace handling
- **Kubernetes Metadata**: Automatic pod/container info

#### Log Routing
```yaml
# Application logs to port 5044
# Kubernetes logs to port 5045  
# Nginx logs to port 5046
```

## Log Collection and Processing

### Application Log Format

Applications should log in structured JSON format:

```json
{
  "timestamp": "2023-12-01T10:30:00.123Z",
  "level": "INFO",
  "service": "auth-service",
  "version": "1.2.3",
  "message": "User authentication successful",
  "user_id": "user123",
  "request_id": "req-456",
  "duration_ms": 45,
  "metadata": {
    "ip": "192.168.1.100",
    "user_agent": "Mozilla/5.0..."
  }
}
```

### Log Levels

| Level | Usage | Retention |
|-------|-------|-----------|
| FATAL | System failures | 90 days |
| ERROR | Application errors | 60 days |
| WARN | Warning conditions | 30 days |
| INFO | General information | 30 days |
| DEBUG | Debug information | 7 days |
| TRACE | Detailed tracing | 3 days |

### Log Enrichment

Logstash automatically enriches logs with:

- **Kubernetes Metadata**: Namespace, pod, container, node
- **Service Information**: Service name, version, instance
- **Request Context**: Request ID, user ID, session ID
- **Geographic Data**: GeoIP for client IPs
- **User Agent Parsing**: Browser, OS, device information
- **Error Classification**: Error type, stack traces

## Index Management

### Using the Log Manager Script

The `/scripts/logging/log-manager.sh` script provides comprehensive index management:

#### List Indices

```bash
# List all Zoptal indices
./scripts/logging/log-manager.sh indices list

# List specific pattern
./scripts/logging/log-manager.sh indices list "zoptal-application-logs-*"
```

#### Delete Old Indices

```bash
# Delete indices older than 7 days
./scripts/logging/log-manager.sh indices delete-old "zoptal-*" 7

# Delete application logs older than 30 days
./scripts/logging/log-manager.sh indices delete-old "zoptal-application-logs-*" 30
```

#### Force Merge Indices

```bash
# Optimize index storage
./scripts/logging/log-manager.sh indices force-merge "zoptal-*"
```

#### Refresh Indices

```bash
# Make recent documents searchable
./scripts/logging/log-manager.sh indices refresh "zoptal-*"
```

### Manual Index Operations

#### Using Elasticsearch API

```bash
# List indices with details
curl -X GET "elasticsearch-master:9200/_cat/indices/zoptal-*?v&s=index"

# Get index settings
curl -X GET "elasticsearch-master:9200/zoptal-application-logs-2023.12.01/_settings"

# Update index settings
curl -X PUT "elasticsearch-master:9200/zoptal-*/_settings" \
  -H "Content-Type: application/json" \
  -d '{"index.number_of_replicas": 0}'

# Delete specific index
curl -X DELETE "elasticsearch-master:9200/zoptal-application-logs-2023.11.01"
```

### Index Templates

Index templates automatically configure new indices:

```json
{
  "index_patterns": ["zoptal-application-logs-*"],
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "index.lifecycle.name": "zoptal-logs-policy"
  },
  "mappings": {
    "properties": {
      "@timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "service_name": { "type": "keyword" },
      "message": { "type": "text" }
    }
  }
}
```

## Search and Analysis

### Using the Log Manager Script

#### Basic Search

```bash
# Search all logs for errors
./scripts/logging/log-manager.sh search "ERROR"

# Search specific service
./scripts/logging/log-manager.sh search "service_name:auth-service"

# Search with time range
./scripts/logging/log-manager.sh search "level:ERROR" "zoptal-*" 20 "2h"
```

#### Advanced Search Examples

```bash
# Search for specific user activity
./scripts/logging/log-manager.sh search "user_id:user123 AND level:INFO"

# Search for slow requests
./scripts/logging/log-manager.sh search "duration_ms:>1000"

# Search for database errors
./scripts/logging/log-manager.sh search "message:database AND level:ERROR"
```

#### Tail Logs in Real-time

```bash
# Follow all logs
./scripts/logging/log-manager.sh tail "*" "*" true

# Follow error logs from auth-service
./scripts/logging/log-manager.sh tail "auth-service" "ERROR" true

# Get recent logs without following
./scripts/logging/log-manager.sh tail "project-service" "INFO" false
```

#### Log Statistics

```bash
# Show 24-hour statistics
./scripts/logging/log-manager.sh stats 24h

# Show weekly statistics
./scripts/logging/log-manager.sh stats 7d
```

### Elasticsearch Query DSL

#### Match Query
```json
{
  "query": {
    "match": {
      "message": "authentication failed"
    }
  }
}
```

#### Range Query
```json
{
  "query": {
    "range": {
      "@timestamp": {
        "gte": "now-1h",
        "lte": "now"
      }
    }
  }
}
```

#### Bool Query with Filters
```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "service_name": "auth-service" } },
        { "term": { "level": "ERROR" } }
      ],
      "filter": [
        {
          "range": {
            "@timestamp": {
              "gte": "now-24h"
            }
          }
        }
      ]
    }
  }
}
```

#### Aggregation Query
```json
{
  "size": 0,
  "aggs": {
    "services": {
      "terms": {
        "field": "service_name.keyword",
        "size": 10
      },
      "aggs": {
        "error_count": {
          "filter": {
            "term": { "level": "ERROR" }
          }
        }
      }
    }
  }
}
```

## Kibana Dashboards

### Setting Up Dashboards

Use the log manager script to set up initial dashboards:

```bash
# Setup default Kibana configuration
./scripts/logging/log-manager.sh setup-kibana
```

### Essential Dashboards

#### 1. Service Overview Dashboard
- Service health status
- Request volume over time
- Error rate by service
- Response time percentiles
- Top error messages

#### 2. Error Analysis Dashboard
- Error count by service
- Error trends over time
- Top error types
- Stack trace analysis
- Error resolution tracking

#### 3. Performance Monitoring Dashboard
- Request duration heatmap
- Slow query detection
- Database performance metrics
- Resource utilization
- Throughput analysis

#### 4. Security Dashboard
- Authentication failures
- Suspicious activity
- Access patterns
- Geographic access analysis
- Failed login attempts

#### 5. Infrastructure Dashboard
- Pod restart events
- Node resource usage
- Container status
- Kubernetes events
- System errors

### Creating Custom Visualizations

#### Log Volume Over Time
```json
{
  "aggs": {
    "2": {
      "date_histogram": {
        "field": "@timestamp",
        "calendar_interval": "1h"
      }
    }
  }
}
```

#### Top Services by Log Volume
```json
{
  "aggs": {
    "services": {
      "terms": {
        "field": "service_name.keyword",
        "size": 10,
        "order": { "_count": "desc" }
      }
    }
  }
}
```

#### Error Rate Calculation
```json
{
  "aggs": {
    "total_logs": {
      "value_count": {
        "field": "@timestamp"
      }
    },
    "error_logs": {
      "filter": {
        "term": { "level": "ERROR" }
      }
    }
  }
}
```

## Alerting and Monitoring

### Elasticsearch Monitoring

#### Cluster Health Checks
```bash
# Check cluster health
./scripts/logging/log-manager.sh health

# Monitor cluster status
watch 'curl -s "elasticsearch-master:9200/_cluster/health" | jq'
```

#### Key Metrics to Monitor
- **Cluster Status**: Green, Yellow, Red
- **Node Count**: Available vs expected nodes
- **Shard Status**: Active, relocating, unassigned
- **Index Statistics**: Size, document count
- **Query Performance**: Search latency
- **Indexing Rate**: Documents per second

### Prometheus Integration

Monitor ELK stack with Prometheus metrics:

```yaml
# ServiceMonitor for Elasticsearch
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: elasticsearch-metrics
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: elasticsearch
  endpoints:
  - port: http
    path: /_prometheus/metrics
```

### Alert Rules

#### Elasticsearch Alerts
```yaml
groups:
- name: elasticsearch.rules
  rules:
  - alert: ElasticsearchClusterRed
    expr: elasticsearch_cluster_health_status{color="red"} == 1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Elasticsearch cluster status is RED"

  - alert: ElasticsearchHighIndexingLatency
    expr: elasticsearch_indices_indexing_index_time_seconds > 10
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High Elasticsearch indexing latency"

  - alert: ElasticsearchLowDiskSpace
    expr: elasticsearch_filesystem_data_available_bytes / elasticsearch_filesystem_data_size_bytes < 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Elasticsearch low disk space"
```

#### Application Log Alerts
```yaml
groups:
- name: application-logs.rules
  rules:
  - alert: HighErrorRate
    expr: |
      (
        rate(elasticsearch_index_stats_primaries_indexing_index_total{index=~"zoptal-application-logs-.*"}[5m])
        and on (index) 
        elasticsearch_index_mapping_stats{field_name="level.keyword",field_value="ERROR"}
      ) / rate(elasticsearch_index_stats_primaries_indexing_index_total{index=~"zoptal-application-logs-.*"}[5m]) > 0.1
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected in application logs"

  - alert: ServiceDown
    expr: |
      absent_over_time(
        elasticsearch_index_stats_primaries_indexing_index_total{index=~"zoptal-application-logs-.*"}[10m]
      )
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Service appears to be down - no logs received"
```

## Backup and Recovery

### Elasticsearch Snapshots

#### Create Backup
```bash
# Create snapshot with log manager
./scripts/logging/log-manager.sh backup daily-backup

# Create backup of specific indices
./scripts/logging/log-manager.sh backup weekly-backup "zoptal-application-logs-*"
```

#### Check Backup Status
```bash
# Check all backups
./scripts/logging/log-manager.sh backup-status

# Check specific backup
./scripts/logging/log-manager.sh backup-status daily-backup
```

#### Manual Snapshot Operations
```bash
# Create snapshot repository
curl -X PUT "elasticsearch-master:9200/_snapshot/backup" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fs",
    "settings": {
      "location": "/usr/share/elasticsearch/backup"
    }
  }'

# Create snapshot
curl -X PUT "elasticsearch-master:9200/_snapshot/backup/snapshot_1" \
  -H "Content-Type: application/json" \
  -d '{
    "indices": "zoptal-*",
    "ignore_unavailable": true,
    "include_global_state": false
  }'

# List snapshots
curl -X GET "elasticsearch-master:9200/_snapshot/backup/_all"

# Restore snapshot
curl -X POST "elasticsearch-master:9200/_snapshot/backup/snapshot_1/_restore" \
  -H "Content-Type: application/json" \
  -d '{
    "indices": "zoptal-application-logs-2023.12.01",
    "ignore_unavailable": true,
    "include_global_state": false
  }'
```

### Backup Strategy

#### Automated Backups
- **Daily**: Application logs for last 7 days
- **Weekly**: All indices for compliance
- **Monthly**: Archive snapshots to long-term storage

#### Retention Policy
- **Local Snapshots**: 30 days
- **S3 Archive**: 1 year
- **Compliance Archive**: 7 years (if required)

### Disaster Recovery

#### Recovery Procedures

1. **Cluster Failure**
   ```bash
   # Restore from latest snapshot
   kubectl apply -f k8s/production/elk-stack.yaml
   
   # Wait for cluster to be healthy
   ./scripts/logging/log-manager.sh health
   
   # Restore indices
   curl -X POST "elasticsearch-master:9200/_snapshot/backup/latest/_restore"
   ```

2. **Data Corruption**
   ```bash
   # Identify corrupted indices
   ./scripts/logging/log-manager.sh indices list
   
   # Delete corrupted indices
   curl -X DELETE "elasticsearch-master:9200/corrupted-index"
   
   # Restore from snapshot
   curl -X POST "elasticsearch-master:9200/_snapshot/backup/latest/_restore" \
     -d '{"indices": "corrupted-index"}'
   ```

3. **Partial Data Loss**
   ```bash
   # Check missing data range
   ./scripts/logging/log-manager.sh search "*" "zoptal-*" 1 "24h"
   
   # Restore specific time range
   curl -X POST "elasticsearch-master:9200/_snapshot/backup/daily/_restore" \
     -d '{"indices": "zoptal-application-logs-2023.12.01"}'
   ```

## Performance Optimization

### Elasticsearch Tuning

#### JVM Settings
```yaml
# jvm.options
-Xms1g
-Xmx1g
-XX:+UseConcMarkSweepGC
-XX:CMSInitiatingOccupancyFraction=75
-XX:+UseCMSInitiatingOccupancyOnly
```

#### Index Settings
```json
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "refresh_interval": "30s",
    "index.codec": "best_compression",
    "index.merge.policy.max_merged_segment": "5gb"
  }
}
```

#### Query Optimization
- **Use filters instead of queries** for exact matches
- **Limit result size** with `size` parameter
- **Use specific indices** instead of wildcards
- **Cache frequently used queries**
- **Use scroll API** for large result sets

### Logstash Tuning

#### Pipeline Configuration
```yaml
pipeline.workers: 4                # CPU cores
pipeline.batch.size: 1000         # Batch size
pipeline.batch.delay: 50          # Batch delay (ms)
```

#### Memory Management
```yaml
# jvm.options
-Xms1g
-Xmx1g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=250
```

#### Output Optimization
```ruby
output {
  elasticsearch {
    hosts => ["elasticsearch-master:9200"]
    index => "zoptal-application-logs-%{+YYYY.MM.dd}"
    workers => 2
    flush_size => 500
    idle_flush_time => 1
  }
}
```

### Kibana Optimization

#### Browser Settings
- **Increase browser cache**
- **Use Chrome for best performance**
- **Limit dashboard refresh rates**
- **Optimize visualization queries**

#### Dashboard Best Practices
- **Limit time ranges** for heavy dashboards
- **Use sampled data** for approximations
- **Cache dashboard results**
- **Minimize real-time updates**

## Troubleshooting

### Using the Log Manager Script

#### General Troubleshooting
```bash
# Run comprehensive troubleshooting
./scripts/logging/log-manager.sh troubleshoot
```

#### Check ELK Stack Status
```bash
# Check overall status
./scripts/logging/log-manager.sh status

# Check Elasticsearch health
./scripts/logging/log-manager.sh health
```

### Common Issues

#### 1. Elasticsearch Cluster Issues

**Red Cluster Status**
```bash
# Check cluster health
curl -s "elasticsearch-master:9200/_cluster/health"

# Check shard allocation
curl -s "elasticsearch-master:9200/_cat/shards?v&h=index,shard,prirep,state,unassigned.reason"

# Fix unassigned shards
curl -X POST "elasticsearch-master:9200/_cluster/reroute" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {
        "allocate_empty_primary": {
          "index": "problem-index",
          "shard": 0,
          "node": "node-1",
          "accept_data_loss": true
        }
      }
    ]
  }'
```

**Split Brain Prevention**
```yaml
# Ensure minimum master nodes is set correctly
discovery.zen.minimum_master_nodes: 2  # (nodes / 2) + 1
```

**Out of Memory Issues**
```bash
# Check JVM heap usage
kubectl exec -n zoptal-production elasticsearch-master-0 -- \
  curl -s "localhost:9200/_cat/nodes?h=heap.percent,heap.current,heap.max&v"

# Increase heap size if needed (up to 50% of available RAM)
```

#### 2. Logstash Issues

**Pipeline Stalled**
```bash
# Check Logstash stats
curl "logstash:9600/_node/stats/pipeline"

# Check dead letter queue
kubectl exec -n zoptal-production logstash-xxx -- \
  find /usr/share/logstash/data/dead_letter_queue -name "*.log"

# Restart Logstash pods
kubectl rollout restart deployment/logstash -n zoptal-production
```

**Parsing Failures**
```bash
# Check Logstash logs
kubectl logs -n zoptal-production -l app.kubernetes.io/name=logstash

# Test grok patterns
# Use Kibana Dev Tools or online grok debugger
```

#### 3. Kibana Issues

**Cannot Connect to Elasticsearch**
```bash
# Check Elasticsearch connectivity
kubectl exec -n zoptal-production kibana-xxx -- \
  curl -s "elasticsearch-master:9200/_cluster/health"

# Check Kibana logs
kubectl logs -n zoptal-production -l app.kubernetes.io/name=kibana
```

**Slow Dashboard Loading**
```bash
# Check query performance
GET /zoptal-*/_search
{
  "profile": true,
  "query": { ... }
}

# Optimize index patterns
# Reduce time ranges
# Use filters instead of queries
```

#### 4. Filebeat Issues

**No Logs Being Collected**
```bash
# Check Filebeat pods
kubectl get pods -n zoptal-production -l app.kubernetes.io/name=filebeat

# Check Filebeat logs
kubectl logs -n zoptal-production filebeat-xxx

# Check log file permissions
kubectl exec -n zoptal-production filebeat-xxx -- \
  ls -la /var/log/containers/
```

**High Resource Usage**
```bash
# Check Filebeat resource usage
kubectl top pods -n zoptal-production -l app.kubernetes.io/name=filebeat

# Tune harvester settings
# Adjust scan frequency
# Exclude noisy logs
```

### Log Analysis for Troubleshooting

#### Application Errors
```bash
# Find recent errors
./scripts/logging/log-manager.sh search "level:ERROR" "zoptal-application-logs-*" 50 "1h"

# Find specific service errors
./scripts/logging/log-manager.sh search "service_name:auth-service AND level:ERROR"

# Find database connection errors
./scripts/logging/log-manager.sh search "message:database AND error"
```

#### Performance Issues
```bash
# Find slow requests
./scripts/logging/log-manager.sh search "duration_ms:>5000"

# Find memory issues
./scripts/logging/log-manager.sh search "OutOfMemoryError OR memory"

# Find timeout errors
./scripts/logging/log-manager.sh search "timeout OR TimeoutException"
```

#### Security Issues
```bash
# Find authentication failures
./scripts/logging/log-manager.sh search "authentication AND (failed OR denied)"

# Find suspicious activity
./scripts/logging/log-manager.sh search "level:WARN AND (suspicious OR attack OR intrusion)"
```

## Best Practices

### Log Generation

#### Structured Logging
- **Always use JSON format** for application logs
- **Include correlation IDs** for request tracing
- **Add contextual information** (user_id, session_id)
- **Use consistent field names** across services
- **Include service metadata** (name, version, instance)

#### Log Levels
- **FATAL**: System-level failures requiring immediate attention
- **ERROR**: Application errors that don't crash the system
- **WARN**: Unusual situations that might indicate problems
- **INFO**: General application flow information
- **DEBUG**: Detailed information for debugging
- **TRACE**: Very detailed tracing information

#### Sensitive Data
- **Never log passwords** or API keys
- **Mask credit card numbers** and PII
- **Use log filtering** for sensitive fields
- **Implement data classification** policies

### Index Management

#### Naming Conventions
- **Use date-based indices**: `service-logs-YYYY.MM.dd`
- **Include environment**: `prod-application-logs-*`
- **Use consistent patterns**: Enable template matching
- **Avoid special characters**: Use hyphens, not underscores

#### Performance Optimization
- **Right-size shards**: 10-50GB per shard optimal
- **Use appropriate replica count**: Balance availability vs storage
- **Set refresh intervals**: 30s for logs vs 1s for real-time
- **Use ILM policies**: Automate lifecycle management

#### Storage Management
- **Monitor disk usage**: Keep below 85% full
- **Implement retention policies**: Delete old indices
- **Use compression**: Enable best_compression codec
- **Archive old data**: Move to cold storage

### Search and Analysis

#### Query Performance
- **Use specific time ranges**: Avoid open-ended queries
- **Filter before query**: Use filters for exact matches
- **Limit result sizes**: Use pagination for large results
- **Cache frequent queries**: Leverage Elasticsearch caching

#### Dashboard Design
- **Keep dashboards focused**: One purpose per dashboard
- **Use appropriate visualizations**: Choose right chart types
- **Optimize refresh rates**: Balance real-time vs performance
- **Document dashboard purpose**: Add descriptions

### Security

#### Access Control
- **Implement RBAC**: Role-based access to indices
- **Use network policies**: Restrict inter-pod communication
- **Enable audit logging**: Track access and changes
- **Regular security reviews**: Audit configurations

#### Data Protection
- **Encrypt data in transit**: Use TLS for all communications
- **Encrypt data at rest**: Enable volume encryption
- **Secure backups**: Encrypt snapshot repositories
- **Data retention compliance**: Follow regulatory requirements

### Monitoring and Alerting

#### Health Monitoring
- **Monitor cluster health**: Green/yellow/red status
- **Track resource usage**: CPU, memory, disk, network
- **Monitor index performance**: Indexing and search rates
- **Set up proactive alerts**: Before issues become critical

#### Operational Metrics
- **Log ingestion rate**: Documents per second
- **Query performance**: Average response time
- **Error rates**: By service and log level
- **Storage growth**: Capacity planning

### Disaster Recovery

#### Backup Strategy
- **Regular snapshots**: Daily for recent data
- **Multiple locations**: Local and remote backups
- **Test restores**: Verify backup integrity
- **Document procedures**: Recovery runbooks

#### High Availability
- **Multi-node clusters**: Minimum 3 master nodes
- **Cross-zone deployment**: Distribute across AZs
- **Load balancing**: Multiple ingestion endpoints
- **Failover procedures**: Automated where possible

---

**Document Version**: 1.0  
**Last Updated**: $(date)  
**Next Review**: $(date -d '+3 months')  
**Owner**: Platform Team  
**Approved By**: Head of Engineering