# Scaling Operations Guide

## Overview

This guide covers comprehensive scaling operations for the Zoptal platform, including horizontal pod autoscaling, vertical pod autoscaling, cluster autoscaling, and operational procedures.

## Table of Contents

1. [Scaling Architecture](#scaling-architecture)
2. [Horizontal Pod Autoscaling (HPA)](#horizontal-pod-autoscaling-hpa)
3. [Vertical Pod Autoscaling (VPA)](#vertical-pod-autoscaling-vpa)
4. [KEDA Event-Driven Autoscaling](#keda-event-driven-autoscaling)
5. [Cluster Autoscaling](#cluster-autoscaling)
6. [Load Balancing](#load-balancing)
7. [Circuit Breakers](#circuit-breakers)
8. [Scaling Operations](#scaling-operations)
9. [Monitoring and Alerting](#monitoring-and-alerting)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

## Scaling Architecture

### Overview

The Zoptal platform implements a multi-tier autoscaling strategy:

- **Pod-level scaling**: HPA for horizontal scaling, VPA for vertical scaling
- **Event-driven scaling**: KEDA for queue-based workloads
- **Node-level scaling**: Cluster autoscaler for infrastructure scaling
- **Load balancing**: Nginx Ingress Controller with advanced routing
- **Circuit breakers**: Envoy proxy for resilience

### Service Scaling Profiles

| Service | Min Replicas | Max Replicas | CPU Target | Memory Target | Special Features |
|---------|--------------|--------------|------------|---------------|------------------|
| auth-service | 3 | 20 | 70% | 80% | Custom metrics, aggressive scaling |
| project-service | 3 | 15 | 75% | 85% | Database connection based |
| ai-service | 2 | 10 | 60% | 70% | Queue-based, longer stabilization |
| notification-service | 2 | 20 | N/A | N/A | KEDA Redis queue scaling |
| billing-service | 2 | 8 | 70% | 80% | Standard scaling |

## Horizontal Pod Autoscaling (HPA)

### Configuration

HPA configurations are defined in `/k8s/production/load-balancing.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 3
  maxReplicas: 20
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
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
```

### Scaling Behaviors

#### Scale-Up Policies
- **Fast Response**: 100% increase every 15 seconds or 4 pods every 60 seconds
- **Stabilization**: 60 seconds to prevent flapping

#### Scale-Down Policies
- **Conservative**: 50% decrease every 60 seconds or 2 pods maximum
- **Stabilization**: 300 seconds to ensure stability

### Custom Metrics

The platform uses custom metrics for more sophisticated scaling:

1. **HTTP Requests per Second**: For request-based scaling
2. **Database Connections**: For database-intensive services
3. **Queue Length**: For asynchronous workloads

### Managing HPA

#### Enable HPA for a Service

```bash
# Using the scaling manager script
./scripts/scaling/scaling-manager.sh hpa enable auth-service

# Manual configuration
kubectl apply -f k8s/production/load-balancing.yaml
```

#### Configure Custom Scaling Policies

```bash
# Set custom min/max replicas and thresholds
./scripts/scaling/scaling-manager.sh policy auth-service 5 25 60 75
```

#### Monitor HPA Status

```bash
# Check HPA status
kubectl get hpa -n zoptal-production

# Detailed HPA information
kubectl describe hpa auth-service-hpa -n zoptal-production

# Watch HPA scaling events
kubectl get events --field-selector involvedObject.kind=HorizontalPodAutoscaler -w
```

## Vertical Pod Autoscaling (VPA)

### Configuration

VPA automatically adjusts CPU and memory requests/limits:

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: auth-service-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: auth-service
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2
        memory: 4Gi
```

### VPA Modes

1. **Auto**: Automatically applies recommendations and restarts pods
2. **Initial**: Only applies recommendations to new pods
3. **Off**: Only provides recommendations without applying them

### Monitoring VPA

```bash
# Check VPA recommendations
kubectl get vpa -n zoptal-production

# Detailed VPA status
kubectl describe vpa auth-service-vpa -n zoptal-production

# View resource recommendations
kubectl get vpa auth-service-vpa -n zoptal-production -o jsonpath='{.status.recommendation}'
```

## KEDA Event-Driven Autoscaling

### Redis Queue Scaling

For the notification service, KEDA scales based on Redis queue length:

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: notification-service-keda
spec:
  scaleTargetRef:
    name: notification-service
  minReplicaCount: 2
  maxReplicaCount: 20
  triggers:
  - type: redis
    metadata:
      address: redis-master:6379
      listName: notification_queue
      listLength: "5"
```

### Prometheus-Based Scaling

KEDA can also scale based on Prometheus metrics:

```yaml
triggers:
- type: prometheus
  metadata:
    serverAddress: http://prometheus:9090
    metricName: notification_processing_time
    threshold: "100"
    query: avg(rate(notification_processing_duration_seconds[5m]))
```

### Managing KEDA Scaling

```bash
# Check KEDA scaled objects
kubectl get scaledobjects -n zoptal-production

# View KEDA scaling events
kubectl describe scaledobject notification-service-keda -n zoptal-production

# Monitor KEDA controller logs
kubectl logs -n keda-system -l app=keda-operator
```

## Cluster Autoscaling

### Configuration

The cluster autoscaler automatically adds/removes nodes based on resource demand:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  containers:
  - name: cluster-autoscaler
    image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.25.0
    command:
    - ./cluster-autoscaler
    - --cloud-provider=aws
    - --skip-nodes-with-local-storage=false
    - --expander=least-waste
    - --scale-down-enabled=true
    - --scale-down-delay-after-add=10m
    - --scale-down-unneeded-time=10m
    - --scale-down-utilization-threshold=0.5
```

### Cluster Autoscaler Policies

- **Scale-up**: Triggered when pods cannot be scheduled
- **Scale-down**: Nodes removed after 10 minutes of low utilization (<50%)
- **Expander**: Least-waste strategy to minimize costs

### Node Groups

Configure node groups with appropriate instance types:

```bash
# Example AWS Auto Scaling Group tags
k8s.io/cluster-autoscaler/enabled=true
k8s.io/cluster-autoscaler/zoptal-cluster=owned
```

### Monitoring Cluster Autoscaler

```bash
# Check cluster autoscaler status
kubectl logs -n kube-system -l app=cluster-autoscaler

# View cluster autoscaler events
kubectl get events -n kube-system --field-selector reason=TriggeredScaleUp
kubectl get events -n kube-system --field-selector reason=ScaleDown
```

## Load Balancing

### Nginx Ingress Controller

The platform uses Nginx Ingress Controller with advanced load balancing:

```yaml
data:
  # Load balancing configuration
  upstream-hash-by: "$request_uri"
  load-balance: "ewma"  # Exponentially Weighted Moving Average
  
  # Connection settings
  upstream-keepalive-connections: "32"
  upstream-keepalive-timeout: "60"
  upstream-keepalive-requests: "100"
  
  # Rate limiting
  rate-limit: "1000"
  rate-limit-window: "1m"
```

### Session Affinity

For stateful applications, session affinity is configured:

```yaml
spec:
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800  # 3 hours
```

### AWS Network Load Balancer

The service uses AWS NLB for external traffic:

```yaml
annotations:
  service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
  service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
  service.beta.kubernetes.io/aws-load-balancer-connection-idle-timeout: "60"
```

## Circuit Breakers

### Envoy Proxy Configuration

Circuit breakers prevent cascade failures:

```yaml
circuit_breakers:
  thresholds:
  - priority: DEFAULT
    max_connections: 1000
    max_pending_requests: 100
    max_requests: 1000
    max_retries: 3
```

### Outlier Detection

Automatically remove unhealthy backends:

```yaml
outlier_detection:
  consecutive_5xx: 3
  consecutive_gateway_failure: 3
  interval: 30s
  base_ejection_time: 30s
  max_ejection_percent: 50
  min_health_percent: 30
```

## Scaling Operations

### Using the Scaling Manager Script

The `/scripts/scaling/scaling-manager.sh` script provides comprehensive scaling operations:

#### Check Scaling Status

```bash
# Check status for all services
./scripts/scaling/scaling-manager.sh status

# Check specific service
./scripts/scaling/scaling-manager.sh status auth-service
```

#### Manual Scaling

```bash
# Scale a service manually
./scripts/scaling/scaling-manager.sh scale auth-service 8

# Scale with confirmation
./scripts/scaling/scaling-manager.sh scale project-service 5
```

#### HPA Management

```bash
# Enable HPA for a service
./scripts/scaling/scaling-manager.sh hpa enable ai-service

# Disable HPA
./scripts/scaling/scaling-manager.sh hpa disable ai-service
```

#### Configure Scaling Policies

```bash
# Set custom scaling policies
# Usage: policy <service> <min> <max> <cpu> <memory>
./scripts/scaling/scaling-manager.sh policy auth-service 5 25 65 75
```

#### Stress Testing

```bash
# Run stress test for scaling validation
# Usage: stress <service> <duration> <rps>
./scripts/scaling/scaling-manager.sh stress auth-service 600 200
```

#### Performance Analysis

```bash
# Analyze scaling performance
./scripts/scaling/scaling-manager.sh analyze auth-service 2h
```

#### Generate Recommendations

```bash
# Get scaling recommendations for all services
./scripts/scaling/scaling-manager.sh recommend

# Get recommendations for specific service
./scripts/scaling/scaling-manager.sh recommend auth-service
```

#### Export Configuration

```bash
# Export scaling configuration
./scripts/scaling/scaling-manager.sh export scaling-config-backup.yaml
```

### Manual Kubernetes Commands

#### Scale Deployments

```bash
# Scale deployment manually
kubectl scale deployment auth-service --replicas=10 -n zoptal-production

# Check scaling status
kubectl get deployment auth-service -n zoptal-production

# Watch pod creation
kubectl get pods -l app.kubernetes.io/name=auth-service -w -n zoptal-production
```

#### Update HPA

```bash
# Update HPA min/max replicas
kubectl patch hpa auth-service-hpa -n zoptal-production -p '{"spec":{"minReplicas":5,"maxReplicas":30}}'

# Update CPU target
kubectl patch hpa auth-service-hpa -n zoptal-production -p '{"spec":{"metrics":[{"type":"Resource","resource":{"name":"cpu","target":{"type":"Utilization","averageUtilization":60}}}]}}'
```

## Monitoring and Alerting

### Key Metrics

#### HPA Metrics

```bash
# Check HPA status
kubectl get hpa -n zoptal-production -o wide

# View HPA metrics
kubectl top pods -n zoptal-production -l app.kubernetes.io/name=auth-service
```

#### Prometheus Queries

```promql
# Current replica count
kube_deployment_status_replicas{deployment="auth-service"}

# HPA target vs current replicas
kube_horizontalpodautoscaler_spec_target_metric{hpa="auth-service-hpa"}

# Scaling events rate
rate(kube_hpa_status_current_replicas[5m])

# Resource utilization
rate(container_cpu_usage_seconds_total{pod=~"auth-service-.*"}[5m]) * 100
```

### Alerting Rules

Critical scaling alerts are configured in Prometheus:

```yaml
groups:
- name: autoscaling.rules
  rules:
  - alert: HPAMaxReplicasReached
    expr: kube_horizontalpodautoscaler_status_current_replicas == kube_horizontalpodautoscaler_spec_max_replicas
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "HPA {{ $labels.horizontalpodautoscaler }} has reached maximum replicas"

  - alert: HPAHighCPUUtilization
    expr: |
      (
        kube_horizontalpodautoscaler_status_current_replicas /
        kube_horizontalpodautoscaler_spec_max_replicas
      ) > 0.8
      and
      (
        rate(container_cpu_usage_seconds_total{container!="POD",container!=""}[5m]) * 100
      ) > 80
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High CPU utilization with near-max replicas"
```

### Grafana Dashboards

Key dashboard panels:

1. **Current Replicas vs Target**: Shows scaling effectiveness
2. **Resource Utilization**: CPU/Memory usage trends
3. **Scaling Events**: Timeline of scaling operations
4. **Response Time vs Load**: Performance impact of scaling
5. **Node Utilization**: Cluster-level resource usage

## Troubleshooting

### Common Scaling Issues

#### HPA Not Scaling

**Symptoms**: HPA shows "unknown" metrics or doesn't scale

**Diagnosis**:
```bash
# Check HPA status
kubectl describe hpa auth-service-hpa -n zoptal-production

# Check metrics server
kubectl top nodes
kubectl top pods -n zoptal-production

# Check custom metrics
kubectl get --raw "/apis/custom.metrics.k8s.io/v1beta1"
```

**Solutions**:
1. Ensure metrics server is running
2. Verify custom metrics are being exported
3. Check resource requests are set on pods
4. Validate HPA configuration

#### Pods Stuck in Pending

**Symptoms**: New pods remain in Pending state during scale-up

**Diagnosis**:
```bash
# Check pod status
kubectl get pods -n zoptal-production | grep Pending

# Describe pending pod
kubectl describe pod <pod-name> -n zoptal-production

# Check node resources
kubectl describe nodes
```

**Solutions**:
1. Check cluster autoscaler is running
2. Verify node capacity and taints
3. Check resource quotas
4. Review pod affinity/anti-affinity rules

#### Slow Scaling Response

**Symptoms**: HPA takes too long to scale up/down

**Diagnosis**:
```bash
# Check HPA configuration
kubectl get hpa auth-service-hpa -n zoptal-production -o yaml

# Review scaling events
kubectl get events --field-selector involvedObject.kind=HorizontalPodAutoscaler
```

**Solutions**:
1. Adjust stabilization windows
2. Modify scaling policies
3. Check metric collection intervals
4. Review CPU/memory targets

#### KEDA Not Scaling

**Symptoms**: KEDA ScaledObjects not responding to queue changes

**Diagnosis**:
```bash
# Check ScaledObject status
kubectl describe scaledobject notification-service-keda -n zoptal-production

# Check KEDA operator logs
kubectl logs -n keda-system -l app=keda-operator

# Test metric connectivity
kubectl logs -n keda-system -l app=keda-metrics-apiserver
```

**Solutions**:
1. Verify trigger authentication
2. Check metric source connectivity
3. Review KEDA operator health
4. Validate queue/metric configuration

### Performance Issues

#### High Resource Utilization

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n zoptal-production --sort-by=cpu
kubectl top pods -n zoptal-production --sort-by=memory

# Analyze resource requests vs usage
kubectl get pods -n zoptal-production -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].resources.requests.cpu}{"\t"}{.spec.containers[*].resources.requests.memory}{"\n"}{end}'
```

#### Load Balancer Issues

```bash
# Check ingress status
kubectl get ingress -n zoptal-production

# View ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Check service endpoints
kubectl get endpoints -n zoptal-production
```

### Emergency Procedures

#### Rapid Scale-Up

```bash
# Emergency scale-up
kubectl scale deployment auth-service --replicas=20 -n zoptal-production
kubectl scale deployment project-service --replicas=15 -n zoptal-production

# Monitor progress
watch kubectl get pods -n zoptal-production
```

#### Disable Autoscaling

```bash
# Temporarily disable HPA
kubectl patch hpa auth-service-hpa -n zoptal-production -p '{"spec":{"minReplicas":10,"maxReplicas":10}}'

# Or delete HPA
kubectl delete hpa auth-service-hpa -n zoptal-production
```

#### Circuit Breaker Override

```bash
# If circuit breakers are causing issues, check Envoy config
kubectl get configmap circuit-breaker-config -n zoptal-production -o yaml

# Temporarily increase thresholds
kubectl patch configmap circuit-breaker-config -n zoptal-production --patch '{"data":{"envoy.yaml":"..."}}'
```

## Best Practices

### Scaling Configuration

1. **Set Appropriate Resource Requests**: Required for HPA to function
2. **Use Conservative Scale-Down**: Prevent flapping with longer stabilization
3. **Multiple Metrics**: Combine CPU, memory, and custom metrics
4. **Pod Disruption Budgets**: Ensure availability during scaling

### Performance Optimization

1. **Warm-Up Periods**: Account for application startup time
2. **Connection Pooling**: Reuse database connections
3. **Caching**: Reduce database load during scale-up
4. **Health Checks**: Ensure pods are ready before receiving traffic

### Monitoring and Alerting

1. **Comprehensive Metrics**: Monitor all scaling dimensions
2. **Proactive Alerting**: Alert before reaching maximum capacity
3. **Scaling History**: Track scaling patterns for optimization
4. **Cost Monitoring**: Monitor scaling costs and efficiency

### Security Considerations

1. **Resource Limits**: Prevent resource exhaustion
2. **Network Policies**: Control traffic during scaling
3. **RBAC**: Limit scaling permissions appropriately
4. **Pod Security**: Ensure scaled pods meet security standards

### Disaster Recovery

1. **Backup Scaling Configs**: Export configurations regularly
2. **Cross-Region Scaling**: Plan for regional failures
3. **Manual Override**: Always have manual scaling capabilities
4. **Rollback Procedures**: Quick rollback for scaling issues

## Operational Runbooks

### Daily Operations

```bash
# Morning health check
./scripts/scaling/scaling-manager.sh status
./scripts/scaling/scaling-manager.sh recommend

# Check scaling events from last 24h
kubectl get events --field-selector involvedObject.kind=HorizontalPodAutoscaler --since="24h"
```

### Weekly Review

```bash
# Export current configuration
./scripts/scaling/scaling-manager.sh export weekly-backup-$(date +%Y%m%d).yaml

# Review scaling recommendations
./scripts/scaling/scaling-manager.sh recommend > scaling-recommendations-$(date +%Y%m%d).txt

# Analyze performance trends
./scripts/scaling/scaling-manager.sh analyze auth-service 7d
```

### Monthly Optimization

```bash
# Review resource utilization
kubectl top nodes --sort-by=cpu
kubectl top pods -n zoptal-production --sort-by=memory

# Update scaling policies based on usage patterns
./scripts/scaling/scaling-manager.sh policy auth-service 4 18 65 75

# Test scaling under load
./scripts/scaling/scaling-manager.sh stress auth-service 1800 150
```

---

**Document Version**: 1.0  
**Last Updated**: $(date)  
**Next Review**: $(date -d '+3 months')  
**Owner**: Platform Team  
**Approved By**: Head of Engineering