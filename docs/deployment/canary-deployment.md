# Canary Deployment Guide

## Overview

Canary deployment is a progressive rollout strategy that reduces risk by gradually routing a small percentage of users to a new version while monitoring key metrics. If the metrics remain healthy, traffic is progressively increased until the new version serves all users.

## Architecture

```
                    ┌─────────────────┐
                    │ Load Balancer   │
                    │ Traffic Splitter│
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │ Traffic Weight  │
                    │ Controller      │
                    └────────┬────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
    ┌───────▼────────┐                ┌──────▼──────┐
    │ Stable Version │                │Canary Version│
    │    (90%)      │                │    (10%)     │
    └────────────────┘                └─────────────┘
            │                                 │
            ▼                                 ▼
    ┌───────────────┐                ┌───────────────┐
    │   Metrics     │                │   Metrics     │
    │   Analysis    │                │   Analysis    │
    └───────────────┘                └───────────────┘
```

## Key Components

### 1. **Canary Controller**
- Manages canary deployments lifecycle
- Automated metrics analysis
- Progressive traffic shifting
- Automatic rollback on failure

### 2. **Metrics Analysis**
- Real-time monitoring of key metrics
- Configurable thresholds
- Trend analysis
- Automated decision making

### 3. **Traffic Management**
- Gradual traffic shifting
- Session affinity support
- Header-based routing
- Instant rollback capability

## Deployment Process

### Using the CLI Script

```bash
# Start a basic canary deployment
./scripts/canary-deploy.sh -s auth-service -v v1.2.0

# Canary with custom settings
./scripts/canary-deploy.sh -s auth-service -v v1.2.0 \
  -i 5 -c 10 -t 99.5 -e 0.5 -l 300

# Automated canary (no manual intervention)
./scripts/canary-deploy.sh -s auth-service -v v1.2.0 -a

# Rollback active canary
./scripts/canary-deploy.sh -s auth-service -r
```

### Using the REST API

**Start Canary**
```bash
curl -X POST http://canary-controller:8090/canaries \
  -H "Content-Type: application/json" \
  -d '{
    "service": "auth-service",
    "version": "v1.2.0",
    "initialPercentage": 10,
    "increment": 20,
    "autoPromote": false,
    "thresholds": {
      "successRate": 99.0,
      "errorRate": 1.0,
      "latency": 500
    }
  }'
```

**Get Canary Status**
```bash
curl http://canary-controller:8090/canaries/{id}
```

**Promote Canary**
```bash
curl -X POST http://canary-controller:8090/canaries/{id}/promote
```

**Rollback Canary**
```bash
curl -X POST http://canary-controller:8090/canaries/{id}/rollback
```

### Using GitHub Actions

1. Navigate to Actions → Canary Deployment
2. Select service and version
3. Configure thresholds and automation
4. Monitor progress in real-time

## Configuration Options

### Traffic Configuration
- **Initial Percentage**: Starting traffic percentage (1-50%)
- **Increment**: Traffic increase per phase (5-50%)
- **Auto-promote**: Enable automatic promotion based on metrics

### Success Thresholds
- **Success Rate**: Minimum success rate percentage (90-100%)
- **Error Rate**: Maximum error rate percentage (0-10%)
- **Latency**: Maximum P95 latency in milliseconds

### Analysis Settings
- **Analysis Duration**: Time to analyze each phase (default: 5 minutes)
- **Max Rollout Duration**: Maximum time for complete rollout (default: 1 hour)

## Metrics and Analysis

### Key Metrics Monitored

1. **Success Rate**: Percentage of successful requests (2xx responses)
2. **Error Rate**: Percentage of failed requests (5xx responses)
3. **Latency Percentiles**: P50, P95, P99 response times
4. **Request Rate**: Requests per second
5. **Resource Usage**: CPU and memory utilization

### Automated Analysis

The system performs continuous analysis:
- Compares canary metrics against thresholds
- Analyzes trends over time
- Makes automatic promotion/rollback decisions
- Provides detailed reasoning for decisions

### Health Checks

Each phase includes:
- Service readiness verification
- Dependency health checks
- Resource availability validation
- Business metric validation

## Progressive Rollout Phases

### Phase 1: Initial Deployment (10%)
- Deploy canary version
- Route 10% of traffic to canary
- Monitor for 5 minutes
- Automatic rollback if thresholds exceeded

### Phase 2: Increased Traffic (30%)
- Increase to 30% if Phase 1 successful
- Extended monitoring period
- Validate business metrics

### Phase 3: Majority Traffic (70%)
- Route majority traffic to canary
- Monitor critical user journeys
- Validate performance under load

### Phase 4: Full Rollout (100%)
- Complete traffic migration
- Final validation period
- Promote to stable if successful

## Rollback Mechanisms

### Automatic Rollback Triggers
- Error rate exceeds threshold
- Latency increases significantly
- Success rate drops below threshold
- Resource exhaustion detected
- Health check failures

### Manual Rollback
- One-click rollback from dashboard
- CLI command rollback
- API-based rollback
- Emergency rollback procedures

### Rollback Process
1. Immediate traffic switch to stable version
2. Canary deployment termination
3. Metrics reset and cleanup
4. Incident notification
5. Root cause analysis initiation

## Monitoring and Observability

### Real-time Dashboard
- Traffic distribution visualization
- Metrics comparison (stable vs canary)
- Phase progression tracking
- Threshold status indicators

### Alerting
- Threshold violations
- Deployment status changes
- Rollback notifications
- Performance degradation alerts

### Metrics Export
- Prometheus metrics export
- Grafana dashboard integration
- Custom metrics queries
- Historical analysis

## Best Practices

### Pre-deployment
1. **Test Thoroughly**: Ensure comprehensive testing before canary
2. **Set Conservative Thresholds**: Start with strict thresholds
3. **Plan Rollback**: Have rollback procedures ready
4. **Monitor Dependencies**: Ensure dependent services are healthy

### During Deployment
1. **Monitor Actively**: Watch metrics closely during early phases
2. **Check Business Impact**: Validate business metrics and user experience
3. **Communicate**: Keep stakeholders informed of progress
4. **Be Ready to Rollback**: Don't hesitate to rollback if issues arise

### Post-deployment
1. **Analyze Results**: Review metrics and deployment performance
2. **Document Issues**: Record any problems encountered
3. **Update Thresholds**: Adjust thresholds based on experience
4. **Clean Up**: Remove old deployments and resources

## Advanced Features

### Header-based Routing
Route specific users to canary:
```yaml
# Route beta users to canary
if ($http_x_beta_user = "true") {
    set $canary_weight 100;
}
```

### Geographic Routing
Progressive rollout by region:
```yaml
# Start canary in specific regions
location /api/ {
    if ($geoip_country_code = "US") {
        proxy_pass http://canary-backend;
    }
    proxy_pass http://stable-backend;
}
```

### Custom Metrics
Define business-specific metrics:
```javascript
// Custom success criteria
const businessMetrics = {
  signupRate: await getSignupRate(),
  revenuePerUser: await getRevenuePerUser(),
  customerSatisfaction: await getCSAT()
};
```

## Troubleshooting

### Common Issues

**1. Canary Stuck in Analysis**
```bash
# Check canary controller logs
kubectl logs -n zoptal-production deployment/canary-controller

# Verify metrics collection
curl http://canary-controller:8090/canaries/{id}/metrics

# Check Prometheus connectivity
kubectl port-forward -n zoptal-monitoring svc/prometheus 9090:9090
```

**2. Metrics Not Available**
```bash
# Verify service metrics endpoint
kubectl exec -n zoptal-canary deployment/service-canary -- \
  curl http://localhost:3000/metrics

# Check Prometheus scraping
kubectl get servicemonitor -n zoptal-canary
```

**3. Traffic Not Splitting**
```bash
# Verify service annotations
kubectl get service auth-service -n zoptal-production -o yaml

# Check ingress configuration
kubectl describe ingress auth-service-ingress -n zoptal-production
```

### Debug Commands

```bash
# View canary controller status
kubectl get pods -n zoptal-production -l app=canary-controller

# Check active canaries
curl http://canary-controller:8090/canaries

# View canary deployment logs
kubectl logs -n zoptal-canary deployment/auth-service-canary

# Monitor traffic distribution
kubectl top pods -n zoptal-production
kubectl top pods -n zoptal-canary
```

## Integration with CI/CD

### GitHub Actions Integration
The canary deployment integrates seamlessly with GitHub Actions:
- Automated canary start on PR merge
- Metrics-based promotion decisions
- Slack notifications for status updates
- Integration with monitoring systems

### GitOps Integration
```yaml
# ArgoCD Application for canary
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: auth-service-canary
spec:
  source:
    repoURL: https://github.com/company/k8s-manifests
    path: canary/auth-service
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: zoptal-canary
```

## Security Considerations

### Access Control
- Canary controller requires elevated permissions
- API access restricted to authorized users
- Audit logging for all operations

### Data Protection
- Sensitive metrics data encryption
- Secure metric transmission
- Access logs sanitization

### Network Security
- Network policies for canary traffic
- TLS encryption for all communications
- Service mesh integration support

## Performance Impact

### Resource Usage
- Minimal overhead (~5% additional resources)
- Efficient metrics collection
- Optimized traffic routing

### Latency Impact
- Negligible latency increase (<1ms)
- Efficient load balancing
- Connection pooling optimization

## Maintenance

### Regular Tasks
1. **Weekly**: Review canary success rates and adjust thresholds
2. **Monthly**: Update canary controller and dependencies
3. **Quarterly**: Performance optimization and capacity planning

### Health Checks
```bash
# Controller health
curl http://canary-controller:8090/health

# Metrics availability
curl http://prometheus:9090/api/v1/targets

# Traffic routing
curl -H "Host: api.zoptal.com" http://ingress-controller/health
```

This canary deployment system provides enterprise-grade progressive rollout capabilities with automated analysis and rollback, ensuring safe and reliable deployments with minimal risk.