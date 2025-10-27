# Zoptal Monitoring and Logging Infrastructure

This directory contains the complete monitoring and logging infrastructure for the Zoptal platform using Prometheus, Grafana, AlertManager, and Fluentd.

## 🏗️ Architecture Overview

The monitoring and logging stack includes:

### **Monitoring Components**
- **Prometheus Operator**: Manages Prometheus, AlertManager, and related resources
- **Prometheus**: Metrics collection and storage with 30-day retention
- **Grafana**: Visualization dashboards and alerting interface
- **AlertManager**: Alert routing and notification management
- **Node Exporter**: System metrics collection from Kubernetes nodes

### **Logging Components**
- **Fluentd**: Log collection and forwarding from all pods
- **CloudWatch Logs**: Centralized log storage in AWS
- **Elasticsearch**: Optional log storage and search (can be enabled)

### **Service Discovery**
- **ServiceMonitors**: Auto-discovery of Zoptal services
- **PodMonitors**: Pod-level metric collection
- **PrometheusRules**: Comprehensive alerting rules

## 📊 Dashboards and Metrics

### **Pre-configured Grafana Dashboards**

1. **Kubernetes Overview**
   - Cluster CPU and memory usage
   - Pod and node counts
   - Resource utilization trends

2. **Zoptal Services**
   - Service response times (95th and 50th percentile)
   - Request rates per service
   - Error rates (4xx and 5xx)
   - Service availability

3. **Database Monitoring**
   - PostgreSQL connections and query rates
   - Redis operations and memory usage
   - Database performance metrics

### **Key Metrics Collected**

**Application Metrics:**
- HTTP request duration and count
- Business metrics (signups, API usage, payments)
- Custom application metrics from each service

**Infrastructure Metrics:**
- CPU, memory, disk, and network usage
- Kubernetes resource utilization
- Pod restart counts and health

**Database Metrics:**
- Connection counts and query performance
- Cache hit rates and memory usage
- Backup and replication status

## 🚨 Alerting System

### **Alert Severity Levels**

- **Critical**: Immediate action required (5min repeat)
  - Service down
  - High error rates (>5%)
  - Database connectivity issues
  - Payment failures

- **Warning**: Action needed soon (30min repeat)
  - High response times (>1s)
  - Resource usage (>80% CPU/memory)
  - Low request rates

### **Alert Channels**

- **Email**: All alerts to team@zoptal.com
- **Slack**: Critical alerts to #critical-alerts
- **PagerDuty**: Critical alerts for on-call rotation

### **Business Logic Alerts**

- Low user signup rates
- High API key usage patterns
- Payment processing failures
- Security incidents (unauthorized access)

## 📋 Prerequisites

1. **Kubernetes cluster** with the following requirements:
   - Kubernetes 1.20+
   - StorageClass `gp3` available
   - RBAC enabled
   - Ingress controller (ALB) configured

2. **AWS Permissions** for:
   - CloudWatch Logs access
   - EKS cluster access
   - ALB management

3. **Tools installed:**
   ```bash
   kubectl
   helm (optional)
   ```

## 🚀 Quick Start

### 1. Deploy Complete Stack

```bash
# Deploy everything (monitoring + logging)
./deploy-monitoring.sh deploy-all
```

### 2. Deploy Components Separately

```bash
# Install Prometheus Operator CRDs first
./deploy-monitoring.sh install-crds

# Deploy monitoring only
./deploy-monitoring.sh deploy-monitoring

# Deploy logging only
./deploy-monitoring.sh deploy-logging
```

### 3. Verify Deployment

```bash
# Check deployment status
./deploy-monitoring.sh verify

# Get access information
./deploy-monitoring.sh access-info
```

## 🔐 Access and Security

### **Internal Access (Recommended)**

All monitoring services are configured with internal ingresses for security:

- **Prometheus**: https://prometheus.internal.zoptal.com
- **Grafana**: https://grafana.internal.zoptal.com
- **AlertManager**: https://alertmanager.internal.zoptal.com

### **Local Access (Development)**

For local development or when internal DNS is not available:

```bash
# Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000

# AlertManager
kubectl port-forward -n monitoring svc/alertmanager-main 9093:9093
```

### **Default Credentials**

**Grafana:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important**: Change default passwords in production!

## 📁 File Structure

```
k8s/monitoring/
├── namespace.yaml              # Monitoring and logging namespaces
├── prometheus-operator.yaml    # Prometheus Operator deployment
├── prometheus.yaml            # Prometheus server configuration
├── prometheus-rules.yaml      # Alerting and recording rules
├── alertmanager.yaml          # AlertManager configuration
├── grafana.yaml               # Grafana deployment
├── grafana-dashboards.yaml    # Pre-built dashboards
├── service-monitors.yaml      # Service discovery configuration
├── node-exporter.yaml         # Node metrics exporter
├── deploy-monitoring.sh       # Deployment automation script
└── README.md                  # This file

k8s/logging/
└── fluentd.yaml               # Log collection and forwarding
```

## ⚙️ Configuration

### **Prometheus Configuration**

- **Retention**: 30 days
- **Storage**: 50GB persistent volume
- **Replicas**: 2 for high availability
- **Scrape interval**: 30 seconds

### **Grafana Configuration**

- **Storage**: 10GB persistent volume
- **Admin password**: Stored in Kubernetes secret
- **Data sources**: Auto-configured Prometheus and AlertManager

### **AlertManager Configuration**

- **Replicas**: 3 for high availability
- **Storage**: 10GB persistent volume
- **Retention**: 120 hours

### **Fluentd Configuration**

- **Log destinations**: CloudWatch Logs, optional Elasticsearch
- **Buffer**: File-based with retry logic
- **Filters**: Namespace-based routing and parsing

## 🔧 Customization

### **Adding Custom Metrics**

1. **Instrument your service** with Prometheus metrics:
   ```javascript
   // Example for Node.js with prom-client
   const promClient = require('prom-client');
   const httpRequestDuration = new promClient.Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route', 'status']
   });
   ```

2. **Add ServiceMonitor** to discover your service:
   ```yaml
   apiVersion: monitoring.coreos.com/v1
   kind: ServiceMonitor
   metadata:
     name: my-service
     namespace: monitoring
     labels:
       team: zoptal
   spec:
     selector:
       matchLabels:
         app: my-service
     endpoints:
     - port: http
       path: /metrics
   ```

### **Creating Custom Dashboards**

1. **Access Grafana** UI
2. **Import dashboard** JSON or create new
3. **Export configuration** and add to `grafana-dashboards.yaml`

### **Adding Custom Alerts**

1. **Edit `prometheus-rules.yaml`**:
   ```yaml
   - alert: MyCustomAlert
     expr: my_metric > 100
     for: 5m
     labels:
       severity: warning
     annotations:
       summary: "Custom alert triggered"
   ```

2. **Apply changes**:
   ```bash
   kubectl apply -f prometheus-rules.yaml
   ```

## 📈 Best Practices

### **Metric Naming**
- Use descriptive names: `http_requests_total` not `requests`
- Include units: `_seconds`, `_bytes`, `_total`
- Follow Prometheus naming conventions

### **Alert Design**
- Set appropriate thresholds based on SLAs
- Use different severity levels
- Include actionable information in descriptions
- Test alerts in staging environment

### **Dashboard Design**
- Group related metrics together
- Use appropriate visualization types
- Set meaningful time ranges
- Include relevant filters

### **Performance Optimization**
- Use recording rules for expensive queries
- Set appropriate retention periods
- Monitor Prometheus resource usage
- Use federation for large-scale deployments

## 🛠️ Troubleshooting

### **Common Issues**

**Prometheus not scraping targets:**
```bash
# Check ServiceMonitor configuration
kubectl get servicemonitors -n monitoring

# Verify service labels match selector
kubectl get svc -n zoptal --show-labels

# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Visit http://localhost:9090/targets
```

**Grafana dashboard not loading:**
```bash
# Check Grafana logs
kubectl logs -n monitoring deployment/grafana

# Verify data source configuration
kubectl get configmap grafana-datasources -n monitoring -o yaml
```

**Alerts not firing:**
```bash
# Check PrometheusRule status
kubectl get prometheusrules -n monitoring

# Verify AlertManager configuration
kubectl logs -n monitoring alertmanager-main-0
```

**Logs not appearing:**
```bash
# Check Fluentd status
kubectl get pods -n logging -l app.kubernetes.io/name=fluentd

# Check Fluentd logs
kubectl logs -n logging daemonset/fluentd

# Verify AWS permissions for CloudWatch Logs
```

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Operator Guide](https://prometheus-operator.dev/)
- [Kubernetes Monitoring Best Practices](https://kubernetes.io/docs/concepts/cluster-administration/monitoring/)
- [SRE Monitoring Guidelines](https://sre.google/sre-book/monitoring-distributed-systems/)

## 🤝 Contributing

1. Test changes in development environment
2. Update documentation for new features
3. Follow naming conventions for resources
4. Validate configurations before applying

## 📄 License

This monitoring configuration is part of the Zoptal project. See the main project LICENSE file for details.