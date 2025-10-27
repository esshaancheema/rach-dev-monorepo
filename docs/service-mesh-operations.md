# Zoptal Service Mesh Operations Guide

## Overview

This guide covers the operation, monitoring, and troubleshooting of the Zoptal platform's Istio service mesh implementation. The service mesh provides advanced traffic management, security, and observability for all microservices.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Installation and Setup](#installation-and-setup)
3. [Traffic Management](#traffic-management)
4. [Security Policies](#security-policies)
5. [Observability](#observability)
6. [Multi-Cluster Operations](#multi-cluster-operations)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Architecture Overview

### Service Mesh Components

- **Istio Control Plane**: Manages configuration and certificate distribution
- **Envoy Sidecars**: Handle all service-to-service communication
- **Gateways**: Manage ingress and egress traffic
- **Observability Stack**: Prometheus, Grafana, Jaeger, Kiali

### Services Configuration

```
Auth Service (3001)     ←→ Project Service (3002)
       ↓                           ↓
AI Service (3003)       ←→ Notification Service (3004)
       ↓                           ↓
Billing Service (3005)  ←→ File Service (embedded)
```

## Installation and Setup

### Prerequisites

- Kubernetes cluster v1.22+
- kubectl configured
- Helm 3.x (optional)
- 4GB+ available memory per node

### Quick Installation

```bash
# Clone the repository
git clone <repository-url>
cd Website_Zoptal

# Install Istio service mesh
./scripts/install-istio.sh

# Apply service mesh configurations
kubectl apply -f k8s/service-mesh/

# Verify installation
kubectl get pods -n istio-system
istioctl proxy-status
```

### Configuration Files Structure

```
k8s/service-mesh/
├── istio-installation.yaml       # Core Istio configuration
├── service-configs/              # Per-service mesh configs
│   ├── auth-service-mesh.yaml
│   ├── project-service-mesh.yaml
│   ├── ai-service-mesh.yaml
│   ├── notification-service-mesh.yaml
│   └── billing-service-mesh.yaml
├── traffic-policies/             # Global traffic rules
│   └── global-policies.yaml
├── security/                     # Security policies
│   └── security-policies.yaml
├── gateways/                     # Gateway configurations
│   └── external-gateway.yaml
├── observability/               # Monitoring stack
│   ├── kiali-config.yaml
│   └── jaeger-config.yaml
└── multi-cluster/               # Multi-cluster setup
    └── cluster-config.yaml
```

## Traffic Management

### Virtual Services

Virtual Services define routing rules for services:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: auth-service
spec:
  hosts:
  - auth-service
  http:
  - route:
    - destination:
        host: auth-service
        port:
          number: 3001
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
```

### Destination Rules

Configure load balancing and circuit breakers:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: auth-service
spec:
  host: auth-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 50
    circuitBreaker:
      consecutiveGatewayErrors: 5
      consecutive5xxErrors: 5
```

### Traffic Splitting

For canary deployments:

```yaml
http:
- match:
  - headers:
      canary:
        exact: "true"
  route:
  - destination:
      host: auth-service
      subset: canary
    weight: 100
- route:
  - destination:
      host: auth-service
      subset: stable
    weight: 100
```

## Security Policies

### Mutual TLS (mTLS)

All services use strict mTLS by default:

```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
spec:
  mtls:
    mode: STRICT
```

### Authorization Policies

Service-to-service authorization:

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: auth-service
spec:
  selector:
    matchLabels:
      app: auth-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/zoptal-production/sa/project-service"]
```

### JWT Authentication

For external API access:

```yaml
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-auth
spec:
  jwtRules:
  - issuer: "https://auth.zoptal.com"
    jwksUri: "https://auth.zoptal.com/api/auth/jwks"
```

## Observability

### Accessing Dashboards

```bash
# Kiali (Service Mesh Topology)
kubectl port-forward svc/kiali 20001:20001 -n istio-system
# Open http://localhost:20001

# Grafana (Metrics Dashboard)
kubectl port-forward svc/grafana 3000:3000 -n istio-system
# Open http://localhost:3000

# Jaeger (Distributed Tracing)
kubectl port-forward svc/jaeger 16686:16686 -n istio-system
# Open http://localhost:16686

# Prometheus (Metrics Storage)
kubectl port-forward svc/prometheus 9090:9090 -n istio-system
# Open http://localhost:9090
```

### Key Metrics to Monitor

1. **Request Rate**: Requests per second per service
2. **Error Rate**: 4xx/5xx error percentage
3. **Response Time**: P50, P90, P99 latencies
4. **Circuit Breaker**: Open/closed state
5. **Connection Pool**: Active connections
6. **mTLS Status**: Certificate expiration

### Custom Dashboards

Import the provided Grafana dashboards:

```bash
# Import Zoptal service mesh dashboards
kubectl apply -f k8s/monitoring/grafana/dashboards/
```

## Multi-Cluster Operations

### Cross-Cluster Service Discovery

Services can communicate across clusters:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: ServiceEntry
metadata:
  name: cross-cluster-auth
spec:
  hosts:
  - auth-service.zoptal-production.global
  location: MESH_EXTERNAL
  ports:
  - number: 3001
    name: http
    protocol: HTTP
```

### Failover Configuration

Automatic failover between clusters:

```yaml
trafficPolicy:
  outlierDetection:
    consecutiveGatewayErrors: 3
  loadBalancer:
    localityLbSetting:
      enabled: true
      failover:
      - from: region1
        to: region2
```

## Troubleshooting

### Common Issues

#### 1. Service Not Accessible

**Symptoms**: 503 Service Unavailable errors

**Diagnosis**:
```bash
# Check proxy status
istioctl proxy-status

# Verify sidecar injection
kubectl get pods -o wide
kubectl describe pod <pod-name>

# Check virtual service configuration
kubectl get virtualservices
istioctl analyze
```

**Solutions**:
- Ensure namespace has `istio-injection=enabled` label
- Verify service selector matches pod labels
- Check destination rule host names

#### 2. mTLS Certificate Issues

**Symptoms**: TLS handshake errors

**Diagnosis**:
```bash
# Check certificate status
istioctl proxy-config secret <pod-name>

# Verify peer authentication
kubectl get peerauthentication

# Check authorization policies
kubectl get authorizationpolicy
```

**Solutions**:
- Restart istiod: `kubectl rollout restart deployment/istiod -n istio-system`
- Verify certificate rotation is working
- Check clock synchronization across nodes

#### 3. High Latency

**Symptoms**: Slow response times

**Diagnosis**:
```bash
# Check circuit breaker status
istioctl proxy-config cluster <pod-name> --fqdn <service-fqdn>

# View connection pool settings
kubectl describe destinationrule <rule-name>

# Check Envoy access logs
kubectl logs <pod-name> -c istio-proxy
```

**Solutions**:
- Adjust connection pool settings
- Tune circuit breaker thresholds
- Scale up service replicas

#### 4. Rate Limiting Issues

**Symptoms**: 429 Too Many Requests errors

**Diagnosis**:
```bash
# Check rate limit configuration
kubectl get envoyfilter

# View rate limit metrics
kubectl port-forward svc/prometheus 9090:9090 -n istio-system
# Query: rate(envoy_http_local_rate_limit_enforced_total[5m])
```

**Solutions**:
- Adjust token bucket parameters
- Implement user-based rate limiting
- Scale rate limiting infrastructure

### Debugging Commands

```bash
# General service mesh status
istioctl proxy-status
istioctl proxy-config cluster <pod-name>
istioctl proxy-config listener <pod-name>
istioctl proxy-config route <pod-name>

# Configuration validation
istioctl analyze
istioctl analyze --all-namespaces

# Traffic inspection
kubectl logs <pod-name> -c istio-proxy -f
istioctl proxy-config log <pod-name> --level debug

# Certificate debugging
istioctl proxy-config secret <pod-name>
openssl s_client -connect <service-ip>:443 -servername <service-name>
```

### Performance Tuning

#### Envoy Proxy Settings

```yaml
# Increase worker threads for high-traffic services
annotations:
  sidecar.istio.io/proxyCPU: "200m"
  sidecar.istio.io/proxyMemory: "256Mi"
  sidecar.istio.io/concurrency: "4"
```

#### Connection Pool Optimization

```yaml
trafficPolicy:
  connectionPool:
    tcp:
      maxConnections: 100
      connectTimeout: 30s
      keepAlive:
        time: 7200s
    http:
      http1MaxPendingRequests: 64
      http2MaxRequests: 1000
      maxRequestsPerConnection: 10
```

## Best Practices

### 1. Gradual Rollout

- Start with a small percentage of traffic
- Monitor metrics closely during rollout
- Use automated rollback triggers

### 2. Security Hardening

- Enable strict mTLS everywhere
- Use namespace isolation
- Implement least-privilege authorization
- Regular certificate rotation

### 3. Observability

- Set up comprehensive alerting
- Use distributed tracing for complex flows
- Monitor service mesh control plane health
- Regular security audits

### 4. Performance

- Right-size connection pools
- Use appropriate circuit breaker settings
- Monitor and tune garbage collection
- Regular load testing

### 5. Operational Excellence

- Infrastructure as Code for all configurations
- Automated testing of mesh configurations
- Regular disaster recovery testing
- Keep Istio version updated

## Monitoring Alerts

Set up the following alerts in your monitoring system:

```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(istio_requests_total{response_code!~"2.."}[5m]) > 0.1

# High latency
- alert: HighLatency
  expr: histogram_quantile(0.99, rate(istio_request_duration_milliseconds_bucket[5m])) > 1000

# Circuit breaker open
- alert: CircuitBreakerOpen
  expr: increase(envoy_cluster_upstream_cx_connect_fail[5m]) > 5

# mTLS certificate expiry
- alert: CertificateExpiry
  expr: (envoy_server_certificate_expiry_timestamp - time()) / 86400 < 7
```

## Support and Resources

### Documentation
- [Istio Official Documentation](https://istio.io/latest/docs/)
- [Envoy Proxy Documentation](https://www.envoyproxy.io/docs/)

### Community
- [Istio Slack](https://istio.slack.com/)
- [Istio GitHub](https://github.com/istio/istio)

### Emergency Procedures

For production issues:

1. **Check service mesh status**: `istioctl proxy-status`
2. **Verify configuration**: `istioctl analyze`
3. **Check control plane logs**: `kubectl logs -n istio-system deployment/istiod`
4. **Emergency disable**: Remove istio-injection label from namespace
5. **Rollback**: Use blue-green deployment to previous version

Contact the platform team for additional support.