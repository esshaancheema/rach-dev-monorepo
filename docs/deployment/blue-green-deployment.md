# Blue-Green Deployment Guide

## Overview

Blue-green deployment is a technique that reduces downtime and risk by running two identical production environments called Blue and Green. At any time, only one of the environments is live, with the other serving as a staging environment.

## Architecture

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │ (Traffic Manager)│
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │ Active Selector │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐       ┌───────▼────────┐
        │ Blue Environment│       │Green Environment│
        │   (Active)      │       │   (Inactive)    │
        └────────────────┘       └────────────────┘
```

## Key Components

### 1. **Environments**
- **Blue Environment**: One complete version of the application
- **Green Environment**: Another complete version of the application
- Only one environment receives production traffic at a time

### 2. **Traffic Manager**
- NGINX-based load balancer
- Controls traffic routing between environments
- Provides instant traffic switching capabilities

### 3. **Traffic Controller**
- API service for managing deployments
- Handles health checks and validations
- Supports canary deployments

## Deployment Process

### Using the CLI Script

```bash
# Deploy a new version to the inactive environment
./scripts/blue-green-deploy.sh -s auth-service -v v1.2.0

# Deploy with smoke tests
./scripts/blue-green-deploy.sh -s auth-service -v v1.2.0 -t

# Deploy to specific environment
./scripts/blue-green-deploy.sh -s auth-service -v v1.2.0 -e green

# Rollback to previous environment
./scripts/blue-green-deploy.sh -s auth-service -b
```

### Using GitHub Actions

1. Navigate to Actions → Blue-Green Deployment
2. Click "Run workflow"
3. Select:
   - Service to deploy
   - Version tag
   - Target environment (or auto)
   - Whether to run smoke tests

### Manual Deployment Steps

1. **Identify Current Active Environment**
   ```bash
   kubectl get service auth-service -n zoptal-production \
     -o jsonpath='{.metadata.annotations.active-environment}'
   ```

2. **Deploy to Inactive Environment**
   ```bash
   # If blue is active, deploy to green
   kubectl set image deployment/auth-service-green \
     auth-service=zoptal/auth-service:v1.2.0 \
     -n zoptal-green
   ```

3. **Wait for Deployment**
   ```bash
   kubectl wait --for=condition=available --timeout=600s \
     deployment/auth-service-green -n zoptal-green
   ```

4. **Run Health Checks**
   ```bash
   curl http://auth-service-green.zoptal-green.svc.cluster.local:3001/health
   ```

5. **Switch Traffic**
   ```bash
   kubectl patch service auth-service -n zoptal-production \
     --type merge \
     -p '{"spec":{"selector":{"environment":"green"}},"metadata":{"annotations":{"active-environment":"green"}}}'
   ```

## Traffic Controller API

### Endpoints

**Get Status**
```bash
curl http://traffic-manager.zoptal-production:8080/status
```

**Switch Traffic**
```bash
curl -X POST http://traffic-manager.zoptal-production:8080/switch/green \
  -H "Content-Type: application/json" \
  -d '{"validate": true}'
```

**Canary Deployment**
```bash
curl -X POST http://traffic-manager.zoptal-production:8080/canary \
  -H "Content-Type: application/json" \
  -d '{"targetEnvironment": "green", "percentage": 20}'
```

**Rollback**
```bash
curl -X POST http://traffic-manager.zoptal-production:8080/rollback
```

**Scale Environment**
```bash
curl -X POST http://traffic-manager.zoptal-production:8080/scale/green \
  -H "Content-Type: application/json" \
  -d '{"replicas": 5}'
```

## Monitoring

### Health Checks

Each service must implement:
- `/health` - Basic health check
- `/ready` - Readiness check (dependencies, database, etc.)

### Metrics

Monitor these key metrics during deployment:
- Request rate
- Error rate
- Response time (P50, P95, P99)
- CPU and memory usage
- Pod restart count

### Dashboards

Access deployment dashboards:
- Grafana: `https://grafana.zoptal.com/d/blue-green`
- Traffic Manager UI: `https://traffic.zoptal.com`

## Best Practices

### 1. **Pre-deployment Checks**
- Verify image exists in registry
- Check resource availability
- Review recent deployment history
- Validate configuration changes

### 2. **Deployment Process**
- Always deploy to inactive environment first
- Run comprehensive health checks
- Execute smoke tests
- Monitor for at least 5 minutes before switching

### 3. **Traffic Switching**
- Use gradual rollout for critical services
- Monitor error rates closely
- Keep old environment running for quick rollback
- Document reason for deployment

### 4. **Post-deployment**
- Monitor application metrics
- Check user feedback channels
- Run integration tests
- Scale down old environment after confidence period

## Rollback Procedures

### Automatic Rollback

The system automatically triggers rollback if:
- Health checks fail after deployment
- Error rate exceeds threshold (5%)
- Response time degrades significantly

### Manual Rollback

```bash
# Using script
./scripts/blue-green-deploy.sh -s auth-service -b

# Using traffic controller
curl -X POST http://traffic-manager.zoptal-production:8080/rollback

# Manual kubectl
kubectl patch service auth-service -n zoptal-production \
  --type merge \
  -p '{"spec":{"selector":{"environment":"blue"}}}'
```

## Troubleshooting

### Common Issues

**1. Deployment Stuck in Progress**
```bash
# Check pod status
kubectl get pods -n zoptal-green -l app=auth-service

# Check pod logs
kubectl logs -n zoptal-green -l app=auth-service --tail=50

# Describe deployment
kubectl describe deployment auth-service-green -n zoptal-green
```

**2. Health Checks Failing**
```bash
# Test from within cluster
kubectl run debug --rm -i --tty --image=curlimages/curl -- sh
curl http://auth-service-green.zoptal-green:3001/health
```

**3. Traffic Not Switching**
```bash
# Verify service selector
kubectl get service auth-service -n zoptal-production -o yaml

# Check endpoints
kubectl get endpoints auth-service -n zoptal-production
```

### Debug Commands

```bash
# View traffic manager logs
kubectl logs -n zoptal-production deployment/traffic-manager

# Check active environment
kubectl get cm traffic-manager-config -n zoptal-production \
  -o jsonpath='{.data.active-environment}'

# Force reload nginx config
kubectl exec -n zoptal-production deployment/traffic-manager \
  -c nginx -- nginx -s reload
```

## Configuration

### Service Configuration

Each service requires:
```yaml
metadata:
  annotations:
    blue-green-enabled: "true"
    health-check-path: "/health"
    ready-check-path: "/ready"
    port: "3001"
```

### Resource Limits

Standard resource allocations:
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Scaling Configuration

```yaml
minReplicas: 3
maxReplicas: 10
targetCPUUtilization: 70
targetMemoryUtilization: 80
```

## Security Considerations

1. **Access Control**
   - Traffic controller requires admin role
   - Deployment permissions restricted
   - Audit logging enabled

2. **Network Policies**
   - Environments isolated by namespace
   - Ingress/egress rules enforced
   - Service mesh integration ready

3. **Secret Management**
   - Separate secrets per environment
   - Automatic secret rotation
   - Encrypted at rest

## Advanced Features

### Canary Deployments

Deploy to a percentage of users:
```bash
# 20% to new version
./scripts/blue-green-deploy.sh -s auth-service -v v1.2.0 --canary 20

# Increase to 50%
./scripts/blue-green-deploy.sh -s auth-service -v v1.2.0 --canary 50

# Complete rollout
./scripts/blue-green-deploy.sh -s auth-service -v v1.2.0 --canary 100
```

### A/B Testing

Route based on headers:
```nginx
# Route beta users to green
if ($http_x_beta_user = "true") {
    set $active_backend green_backend;
}
```

### Geographic Routing

Route based on location:
```nginx
# Route EU traffic to green
if ($geoip_country_code ~ ^(DE|FR|GB|IT|ES)$) {
    set $active_backend green_backend;
}
```

## Maintenance

### Regular Tasks

1. **Weekly**
   - Review deployment metrics
   - Clean up old images
   - Update deployment scripts

2. **Monthly**
   - Test rollback procedures
   - Review resource utilization
   - Update documentation

3. **Quarterly**
   - Disaster recovery drill
   - Security audit
   - Performance optimization

### Cleanup Commands

```bash
# Remove old deployments
kubectl delete deployment auth-service-green -n zoptal-green

# Clean up completed jobs
kubectl delete jobs --field-selector status.successful=1 -n zoptal-green

# Prune old images
docker image prune -a --filter "until=720h"
```

## Integration with CI/CD

The blue-green deployment integrates with:
- GitHub Actions workflows
- Jenkins pipelines
- ArgoCD GitOps
- Terraform infrastructure

See `.github/workflows/blue-green-deploy.yml` for the complete automation setup.