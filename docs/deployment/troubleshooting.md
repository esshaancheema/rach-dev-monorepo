# Troubleshooting Guide

This guide provides solutions to common issues encountered when deploying and running the Zoptal platform.

## Table of Contents

1. [Service Health Issues](#service-health-issues)
2. [Database Connection Problems](#database-connection-problems)
3. [Authentication and Authorization](#authentication-and-authorization)
4. [Load Balancer and Ingress Issues](#load-balancer-and-ingress-issues)
5. [Performance and Scaling](#performance-and-scaling)
6. [Container and Pod Issues](#container-and-pod-issues)
7. [Network Connectivity](#network-connectivity)
8. [SSL/TLS Certificate Issues](#ssltls-certificate-issues)
9. [CI/CD Pipeline Problems](#cicd-pipeline-problems)
10. [Monitoring and Alerting](#monitoring-and-alerting)

## Service Health Issues

### Services Not Starting

**Symptoms:**
- Pods stuck in `Pending` or `CrashLoopBackOff` state
- Health check endpoints returning 500 errors
- Services not responding to requests

**Diagnosis:**
```bash
# Check pod status
kubectl get pods -l app=auth-service

# Describe pod for events
kubectl describe pod <pod-name>

# Check container logs
kubectl logs <pod-name> -c auth-service

# Check resource availability
kubectl top nodes
kubectl describe nodes
```

**Common Solutions:**

1. **Insufficient Resources:**
```bash
# Check node capacity
kubectl describe nodes | grep -A 5 "Allocated resources"

# Increase resource requests/limits
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"containers":[{"name":"auth-service","resources":{"requests":{"memory":"256Mi","cpu":"200m"}}}]}}}}'
```

2. **Missing Environment Variables:**
```bash
# Check configmap and secrets
kubectl get configmap auth-config -o yaml
kubectl get secret auth-secrets -o yaml

# Update missing variables
kubectl patch configmap auth-config --patch '{"data":{"NODE_ENV":"production"}}'
```

3. **Image Pull Issues:**
```bash
# Check image pull status
kubectl describe pod <pod-name> | grep -A 10 "Events"

# Verify image exists
docker pull your-registry/auth-service:latest

# Update image pull secrets
kubectl create secret docker-registry regcred \
  --docker-server=your-registry \
  --docker-username=your-username \
  --docker-password=your-password
```

### Service Discovery Problems

**Symptoms:**
- Services can't communicate with each other
- DNS resolution failures
- Connection timeouts between services

**Diagnosis:**
```bash
# Test DNS resolution
kubectl exec -it debug-pod -- nslookup auth-service
kubectl exec -it debug-pod -- nslookup project-service.default.svc.cluster.local

# Check service endpoints
kubectl get endpoints
kubectl describe service auth-service

# Test connectivity
kubectl exec -it auth-service-pod -- nc -zv project-service 4001
```

**Solutions:**

1. **DNS Issues:**
```bash
# Check CoreDNS status
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Restart CoreDNS
kubectl delete pod -n kube-system -l k8s-app=kube-dns

# Verify DNS configuration
kubectl get configmap coredns -n kube-system -o yaml
```

2. **Service Configuration:**
```bash
# Verify service selectors match pod labels
kubectl get service auth-service -o yaml
kubectl get pods --show-labels

# Check port configuration
kubectl describe service auth-service
```

## Database Connection Problems

### PostgreSQL Connection Issues

**Symptoms:**
- `connection refused` errors
- `authentication failed` errors
- Connection timeouts
- `too many connections` errors

**Diagnosis:**
```bash
# Check PostgreSQL pod status
kubectl get pods -l app=postgres

# Check PostgreSQL logs
kubectl logs -l app=postgres

# Test connectivity
kubectl exec -it auth-service-pod -- nc -zv postgres-service 5432

# Check connection string
kubectl exec -it auth-service-pod -- env | grep DATABASE_URL
```

**Solutions:**

1. **Connection Limits:**
```bash
# Check current connections
kubectl exec -it postgres-pod -- psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Increase max_connections (in PostgreSQL config)
kubectl exec -it postgres-pod -- psql -U postgres -c "ALTER SYSTEM SET max_connections = 200;"
kubectl delete pod -l app=postgres  # Restart to apply
```

2. **Authentication Issues:**
```bash
# Verify credentials in secrets
kubectl get secret postgres-secret -o yaml | base64 -d

# Reset password
kubectl exec -it postgres-pod -- psql -U postgres -c "ALTER USER postgres PASSWORD 'new-password';"

# Update secret
kubectl patch secret postgres-secret --patch '{"data":{"password":"bmV3LXBhc3N3b3Jk"}}'  # base64 encoded
```

3. **Network Policies:**
```bash
# Check network policies
kubectl get networkpolicy

# Allow database access
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-db-access
spec:
  podSelector:
    matchLabels:
      app: postgres
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: api-service
    ports:
    - protocol: TCP
      port: 5432
EOF
```

### Redis Connection Issues

**Symptoms:**
- Redis connection failures
- Cache misses despite data being present
- Authentication errors with Redis

**Diagnosis:**
```bash
# Check Redis status
kubectl get pods -l app=redis
kubectl logs -l app=redis

# Test Redis connectivity
kubectl exec -it redis-pod -- redis-cli ping
kubectl exec -it auth-service-pod -- nc -zv redis-service 6379
```

**Solutions:**

1. **Redis Configuration:**
```bash
# Check Redis configuration
kubectl exec -it redis-pod -- redis-cli CONFIG GET "*"

# Restart Redis
kubectl delete pod -l app=redis
```

2. **Memory Issues:**
```bash
# Check Redis memory usage
kubectl exec -it redis-pod -- redis-cli INFO memory

# Clear cache if needed
kubectl exec -it redis-pod -- redis-cli FLUSHALL
```

## Authentication and Authorization

### JWT Token Issues

**Symptoms:**
- `Invalid token` errors
- `Token expired` errors
- Authentication failures despite correct credentials

**Diagnosis:**
```bash
# Check JWT configuration
kubectl get secret jwt-secret -o yaml

# Verify token generation
curl -X POST https://api.zoptal.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Decode JWT token (using jwt.io or jwt-cli)
echo "your-jwt-token" | jwt decode
```

**Solutions:**

1. **Secret Mismatch:**
```bash
# Ensure all services use the same JWT secret
kubectl get secret jwt-secret -o yaml > jwt-backup.yaml

# Update all services with the same secret
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"containers":[{"name":"auth-service","env":[{"name":"JWT_SECRET","valueFrom":{"secretKeyRef":{"name":"jwt-secret","key":"access-token-secret"}}}]}]}}}}'
```

2. **Clock Synchronization:**
```bash
# Check system time on nodes
kubectl get nodes -o wide

# Sync time if needed (run on nodes)
sudo ntpdate -s time.nist.gov
```

### RBAC Permission Issues

**Symptoms:**
- `Forbidden` errors when accessing resources
- Services can't create/update Kubernetes resources
- Admin operations failing

**Diagnosis:**
```bash
# Check current permissions
kubectl auth can-i create pods --as=system:serviceaccount:default:auth-service

# List role bindings
kubectl get rolebinding
kubectl get clusterrolebinding

# Describe service account
kubectl describe serviceaccount auth-service
```

**Solutions:**

1. **Missing Permissions:**
```bash
# Create service account if missing
kubectl create serviceaccount auth-service

# Create role binding
kubectl create rolebinding auth-service-binding \
  --clusterrole=edit \
  --serviceaccount=default:auth-service

# Update deployment to use service account
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"serviceAccountName":"auth-service"}}}}'
```

## Load Balancer and Ingress Issues

### Ingress Not Working

**Symptoms:**
- 404 errors on public domains
- SSL certificate issues
- Load balancer not created

**Diagnosis:**
```bash
# Check ingress status
kubectl get ingress
kubectl describe ingress zoptal-ingress

# Check ingress controller
kubectl get pods -n ingress-nginx
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Check load balancer
kubectl get service -n ingress-nginx
```

**Solutions:**

1. **Ingress Controller Issues:**
```bash
# Reinstall ingress controller
helm uninstall ingress-nginx -n ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.type=LoadBalancer
```

2. **DNS Configuration:**
```bash
# Check DNS records
nslookup api.zoptal.com
dig api.zoptal.com

# Update Route53 records (if using AWS)
aws route53 change-resource-record-sets --hosted-zone-id Z1234567 \
  --change-batch file://dns-change.json
```

3. **SSL Certificate Issues:**
```bash
# Check certificate status
kubectl get certificate
kubectl describe certificate zoptal-tls

# Force certificate renewal
kubectl delete certificate zoptal-tls
kubectl apply -f k8s/ingress/certificate.yaml
```

## Performance and Scaling

### High CPU/Memory Usage

**Symptoms:**
- Pods being killed due to OOMKilled
- High response times
- CPU throttling

**Diagnosis:**
```bash
# Check resource usage
kubectl top pods
kubectl top nodes

# Check metrics in Grafana
# View detailed pod metrics
kubectl describe pod <pod-name> | grep -A 10 "Limits\|Requests"
```

**Solutions:**

1. **Increase Resource Limits:**
```bash
# Update deployment resources
kubectl patch deployment auth-service -p '{
  "spec": {
    "template": {
      "spec": {
        "containers": [{
          "name": "auth-service",
          "resources": {
            "requests": {"memory": "512Mi", "cpu": "300m"},
            "limits": {"memory": "1Gi", "cpu": "1000m"}
          }
        }]
      }
    }
  }
}'
```

2. **Horizontal Pod Autoscaling:**
```bash
# Create HPA
kubectl autoscale deployment auth-service --cpu-percent=70 --min=2 --max=10

# Check HPA status
kubectl get hpa
kubectl describe hpa auth-service
```

3. **Optimize Application:**
```bash
# Enable connection pooling
# Implement caching strategies
# Optimize database queries
# Use compression for responses
```

### Slow Database Queries

**Symptoms:**
- High database response times
- Connection pool exhaustion
- Query timeouts

**Diagnosis:**
```bash
# Check PostgreSQL slow queries
kubectl exec -it postgres-pod -- psql -U postgres -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"

# Check active connections
kubectl exec -it postgres-pod -- psql -U postgres -c "
SELECT count(*), state 
FROM pg_stat_activity 
GROUP BY state;"
```

**Solutions:**

1. **Database Optimization:**
```bash
# Add indexes for slow queries
kubectl exec -it postgres-pod -- psql -U postgres -d zoptal -c "
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);"

# Analyze and vacuum tables
kubectl exec -it postgres-pod -- psql -U postgres -d zoptal -c "
ANALYZE;
VACUUM ANALYZE;"
```

2. **Connection Pooling:**
```bash
# Configure connection pooling in application
# Use PgBouncer for connection pooling
kubectl apply -f k8s/postgres/pgbouncer.yaml
```

## Container and Pod Issues

### Image Pull Errors

**Symptoms:**
- `ImagePullBackOff` or `ErrImagePull` status
- Pods not starting due to image issues

**Diagnosis:**
```bash
# Check pod events
kubectl describe pod <pod-name>

# Verify image exists
docker pull your-registry/auth-service:latest

# Check image pull secrets
kubectl get secrets
kubectl describe secret regcred
```

**Solutions:**

1. **Update Image Pull Secrets:**
```bash
# Create new pull secret
kubectl create secret docker-registry regcred \
  --docker-server=your-registry.com \
  --docker-username=your-username \
  --docker-password=your-password \
  --docker-email=your-email

# Update deployment
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"regcred"}]}}}}'
```

2. **Registry Authentication:**
```bash
# For ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Update ECR token regularly (in CI/CD)
kubectl create secret docker-registry ecr-secret \
  --docker-server=123456789012.dkr.ecr.us-east-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region us-east-1)
```

### Pod Scheduling Issues

**Symptoms:**
- Pods stuck in `Pending` state
- `Insufficient cpu/memory` errors
- Node affinity/anti-affinity violations

**Diagnosis:**
```bash
# Check pod scheduling events
kubectl describe pod <pod-name>

# Check node resources
kubectl describe nodes
kubectl top nodes

# Check pod requirements
kubectl get pod <pod-name> -o yaml | grep -A 10 resources
```

**Solutions:**

1. **Resource Availability:**
```bash
# Scale cluster if needed
# For AWS EKS, increase node group size
aws eks update-nodegroup-config \
  --cluster-name zoptal-cluster \
  --nodegroup-name worker-nodes \
  --scaling-config minSize=2,maxSize=10,desiredSize=5
```

2. **Node Affinity Issues:**
```bash
# Check node labels
kubectl get nodes --show-labels

# Update pod affinity rules
kubectl patch deployment auth-service -p '{
  "spec": {
    "template": {
      "spec": {
        "affinity": {
          "nodeAffinity": {
            "requiredDuringSchedulingIgnoredDuringExecution": {
              "nodeSelectorTerms": [{
                "matchExpressions": [{
                  "key": "kubernetes.io/arch",
                  "operator": "In",
                  "values": ["amd64"]
                }]
              }]
            }
          }
        }
      }
    }
  }
}'
```

## Network Connectivity

### Service-to-Service Communication

**Symptoms:**
- Services can't reach each other
- Connection timeouts
- DNS resolution failures

**Diagnosis:**
```bash
# Test connectivity between pods
kubectl exec -it auth-service-pod -- curl http://project-service:4001/health
kubectl exec -it auth-service-pod -- nc -zv project-service 4001

# Check service discovery
kubectl exec -it auth-service-pod -- nslookup project-service
kubectl get endpoints project-service
```

**Solutions:**

1. **Service Configuration:**
```bash
# Verify service selectors
kubectl get service project-service -o yaml
kubectl get pods --selector=app=project-service --show-labels

# Update service if needed
kubectl patch service project-service -p '{
  "spec": {
    "selector": {
      "app": "project-service"
    }
  }
}'
```

2. **Network Policies:**
```bash
# Check for restrictive network policies
kubectl get networkpolicy

# Create allow-all policy (for debugging)
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - {}
  egress:
  - {}
EOF
```

### External Service Access

**Symptoms:**
- Can't reach external APIs (OpenAI, Stripe, etc.)
- Outbound connection failures
- DNS resolution issues for external domains

**Diagnosis:**
```bash
# Test external connectivity
kubectl exec -it auth-service-pod -- curl -I https://api.openai.com
kubectl exec -it auth-service-pod -- nslookup google.com

# Check egress policies
kubectl get networkpolicy
```

**Solutions:**

1. **Egress Network Policies:**
```bash
# Allow external API access
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-external-apis
spec:
  podSelector:
    matchLabels:
      role: api-service
  policyTypes:
  - Egress
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 80
EOF
```

2. **DNS Configuration:**
```bash
# Check DNS settings
kubectl get configmap coredns -n kube-system -o yaml

# Update DNS if needed
kubectl patch configmap coredns -n kube-system --patch '
data:
  Corefile: |
    .:53 {
        errors
        health {
           lameduck 5s
        }
        ready
        kubernetes cluster.local in-addr.arpa ip6.arpa {
           pods insecure
           fallthrough in-addr.arpa ip6.arpa
           ttl 30
        }
        prometheus :9153
        forward . 8.8.8.8 8.8.4.4
        cache 30
        loop
        reload
        loadbalance
    }
'
```

## SSL/TLS Certificate Issues

### Certificate Not Valid

**Symptoms:**
- SSL certificate warnings in browser
- `certificate verify failed` errors
- Certificate expiration warnings

**Diagnosis:**
```bash
# Check certificate status
kubectl get certificate
kubectl describe certificate zoptal-tls

# Check certificate details
openssl s_client -connect api.zoptal.com:443 -servername api.zoptal.com

# Check cert-manager logs
kubectl logs -n cert-manager -l app=cert-manager
```

**Solutions:**

1. **Certificate Renewal:**
```bash
# Force certificate renewal
kubectl delete certificate zoptal-tls
kubectl apply -f k8s/ingress/certificate.yaml

# Check renewal status
kubectl get certificaterequest
kubectl describe certificaterequest <request-name>
```

2. **Let's Encrypt Rate Limits:**
```bash
# Use staging environment for testing
kubectl patch certificate zoptal-tls -p '{
  "spec": {
    "issuerRef": {
      "name": "letsencrypt-staging"
    }
  }
}'

# Switch back to production after testing
kubectl patch certificate zoptal-tls -p '{
  "spec": {
    "issuerRef": {
      "name": "letsencrypt-prod"
    }
  }
}'
```

3. **DNS Validation Issues:**
```bash
# Check DNS records for validation
dig _acme-challenge.api.zoptal.com TXT

# Verify Route53 permissions (for AWS)
aws route53 list-hosted-zones
aws sts get-caller-identity
```

## CI/CD Pipeline Problems

### Build Failures

**Symptoms:**
- GitHub Actions workflows failing
- Docker build errors
- Test failures

**Diagnosis:**
```bash
# Check GitHub Actions logs
# Review build output for errors
# Check Dockerfile and build context

# Local testing
docker build -t test-image .
docker run --rm test-image npm test
```

**Solutions:**

1. **Dependency Issues:**
```bash
# Clear package lock and rebuild
rm -rf node_modules package-lock.json
npm install

# Update dependencies
npm audit fix
npm update
```

2. **Environment Variables:**
```bash
# Verify all required secrets are set in GitHub
# Check environment variable names match

# Test locally with same environment
cp .env.example .env.test
# Edit .env.test with test values
docker run --env-file .env.test test-image
```

### Deployment Failures

**Symptoms:**
- Kubernetes deployment fails in CI/CD
- Image push failures
- Kubectl command errors

**Diagnosis:**
```bash
# Check CI/CD logs for specific errors
# Verify Kubernetes credentials
# Test kubectl commands locally

# Check deployment status
kubectl rollout status deployment/auth-service
kubectl get events --sort-by=.metadata.creationTimestamp
```

**Solutions:**

1. **Kubernetes Access:**
```bash
# Update kubeconfig in CI/CD
aws eks update-kubeconfig --region us-east-1 --name zoptal-cluster

# Verify service account permissions
kubectl auth can-i create deployments --as=system:serviceaccount:default:github-actions
```

2. **Image Registry Access:**
```bash
# Update registry credentials
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

# Verify image exists after push
aws ecr describe-images --repository-name auth-service --image-ids imageTag=latest
```

## Monitoring and Alerting

### Metrics Not Available

**Symptoms:**
- Grafana dashboards showing no data
- Prometheus targets down
- Missing metrics from services

**Diagnosis:**
```bash
# Check Prometheus targets
kubectl port-forward service/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
# Visit http://localhost:9090/targets

# Check service monitors
kubectl get servicemonitor -n monitoring

# Verify metrics endpoints
kubectl exec -it auth-service-pod -- curl http://localhost:4000/metrics
```

**Solutions:**

1. **ServiceMonitor Configuration:**
```bash
# Create ServiceMonitor for custom services
kubectl apply -f - <<EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: auth-service-monitor
  namespace: monitoring
spec:
  selector:
    matchLabels:
      app: auth-service
  endpoints:
  - port: http
    path: /metrics
EOF
```

2. **Prometheus Configuration:**
```bash
# Check Prometheus config
kubectl get prometheus -o yaml

# Restart Prometheus if needed
kubectl delete pod -l app.kubernetes.io/name=prometheus
```

### Alerts Not Firing

**Symptoms:**
- No alerts despite issues
- AlertManager not receiving alerts
- Notification channels not working

**Diagnosis:**
```bash
# Check AlertManager status
kubectl port-forward service/prometheus-kube-prometheus-alertmanager 9093:9093 -n monitoring
# Visit http://localhost:9093

# Check alert rules
kubectl get prometheusrule -n monitoring

# Test notification channels
kubectl logs -l app.kubernetes.io/name=alertmanager -n monitoring
```

**Solutions:**

1. **Alert Rules:**
```bash
# Apply custom alert rules
kubectl apply -f k8s/monitoring/alerts/

# Verify rules are loaded
# Check Prometheus -> Status -> Rules
```

2. **Notification Configuration:**
```bash
# Update AlertManager config
kubectl patch secret alertmanager-prometheus-kube-prometheus-alertmanager -n monitoring --patch '
data:
  alertmanager.yml: <base64-encoded-config>
'

# Restart AlertManager
kubectl delete pod -l app.kubernetes.io/name=alertmanager -n monitoring
```

## Emergency Procedures

### Complete Service Outage

1. **Immediate Actions:**
```bash
# Check overall cluster health
kubectl get nodes
kubectl get pods --all-namespaces

# Enable maintenance mode
kubectl apply -f k8s/maintenance-mode.yaml

# Check critical services first
kubectl get pods -l tier=critical
```

2. **Rollback Procedures:**
```bash
# Rollback recent deployments
kubectl rollout undo deployment/auth-service
kubectl rollout undo deployment/project-service

# Check rollback status
kubectl rollout status deployment/auth-service
```

3. **Scale Up Resources:**
```bash
# Increase replica count
kubectl scale deployment auth-service --replicas=5
kubectl scale deployment project-service --replicas=5

# Add more nodes if needed
aws eks update-nodegroup-config \
  --cluster-name zoptal-cluster \
  --nodegroup-name worker-nodes \
  --scaling-config desiredSize=10
```

### Data Recovery

1. **Database Recovery:**
```bash
# Restore from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier zoptal-db-restored \
  --db-snapshot-identifier manual-backup-20241201

# Point-in-time recovery
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier zoptal-db \
  --target-db-instance-identifier zoptal-db-restored \
  --restore-time 2024-12-01T10:00:00Z
```

2. **Application Data Recovery:**
```bash
# Restore from S3 backup
aws s3 sync s3://zoptal-assets-backup s3://zoptal-assets

# Restore Kubernetes resources
kubectl apply -f cluster-backup.yaml
```

For additional help:
- Check [Performance Optimization Guide](./performance.md)
- Review [Security Best Practices](./security.md)
- Contact support: support@zoptal.com