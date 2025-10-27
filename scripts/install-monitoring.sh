#!/bin/bash

# Comprehensive Monitoring Stack Installation Script
# Installs Prometheus, Grafana, Loki, and Jaeger for complete observability

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="zoptal-production"
MONITORING_NAMESPACE="monitoring"
KUBECTL_TIMEOUT="300s"

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

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if we can connect to the cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_success "kubectl is available and cluster is accessible"
}

# Function to check if helm is available
check_helm() {
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed or not in PATH"
        print_status "Installing Helm..."
        
        # Install Helm
        curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
        
        if ! command -v helm &> /dev/null; then
            print_error "Failed to install Helm"
            exit 1
        fi
    fi
    
    print_success "Helm is available"
}

# Function to add required Helm repositories
setup_helm_repos() {
    print_status "Setting up Helm repositories..."
    
    # Add Prometheus community repo
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    
    # Add Grafana repo
    helm repo add grafana https://grafana.github.io/helm-charts
    
    # Add Jaeger repo
    helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
    
    # Update repositories
    helm repo update
    
    print_success "Helm repositories configured"
}

# Function to create monitoring namespace
create_monitoring_namespace() {
    print_status "Creating monitoring namespace..."
    
    kubectl create namespace $MONITORING_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    print_success "Monitoring namespace ready"
}

# Function to install Prometheus stack
install_prometheus_stack() {
    print_status "Installing Prometheus stack..."
    
    # Check if values file exists
    if [ ! -f "../k8s/production/prometheus-values.yaml" ]; then
        print_error "prometheus-values.yaml not found"
        exit 1
    fi
    
    # Install or upgrade Prometheus stack
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace $MONITORING_NAMESPACE \
        --values ../k8s/production/prometheus-values.yaml \
        --wait \
        --timeout 10m
    
    print_success "Prometheus stack installed"
}

# Function to install Loki stack
install_loki_stack() {
    print_status "Installing Loki stack..."
    
    # Apply Loki configurations
    kubectl apply -f ../k8s/production/loki-stack.yaml
    
    # Wait for Loki to be ready
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=loki -n $NAMESPACE --timeout=$KUBECTL_TIMEOUT
    
    print_success "Loki stack installed"
}

# Function to install Jaeger
install_jaeger() {
    print_status "Installing Jaeger tracing..."
    
    # Apply Jaeger configurations
    kubectl apply -f ../k8s/production/jaeger-tracing.yaml
    
    # Wait for Elasticsearch to be ready first
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=elasticsearch -n $NAMESPACE --timeout=$KUBECTL_TIMEOUT
    
    # Wait for Jaeger components to be ready
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=jaeger-collector -n $NAMESPACE --timeout=$KUBECTL_TIMEOUT
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=jaeger-query -n $NAMESPACE --timeout=$KUBECTL_TIMEOUT
    
    print_success "Jaeger tracing installed"
}

# Function to apply monitoring configurations
apply_monitoring_configs() {
    print_status "Applying monitoring configurations..."
    
    # Apply service monitors and alerts
    kubectl apply -f ../k8s/production/monitoring.yaml
    
    print_success "Monitoring configurations applied"
}

# Function to setup ingress for monitoring tools
setup_monitoring_ingress() {
    print_status "Setting up monitoring ingress..."
    
    # Create monitoring ingress
    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: monitoring-ingress
  namespace: $MONITORING_NAMESPACE
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - prometheus.zoptal.com
    - grafana.zoptal.com
    - alertmanager.zoptal.com
    secretName: monitoring-tls
  rules:
  - host: prometheus.zoptal.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: prometheus-prometheus
            port:
              number: 9090
  - host: grafana.zoptal.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: prometheus-grafana
            port:
              number: 80
  - host: alertmanager.zoptal.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: prometheus-alertmanager
            port:
              number: 9093
EOF
    
    print_success "Monitoring ingress configured"
}

# Function to verify installation
verify_installation() {
    print_status "Verifying monitoring stack installation..."
    
    # Check Prometheus
    if kubectl get pods -n $MONITORING_NAMESPACE -l app.kubernetes.io/name=prometheus | grep -q Running; then
        print_success "Prometheus is running"
    else
        print_warning "Prometheus may not be ready yet"
    fi
    
    # Check Grafana
    if kubectl get pods -n $MONITORING_NAMESPACE -l app.kubernetes.io/name=grafana | grep -q Running; then
        print_success "Grafana is running"
    else
        print_warning "Grafana may not be ready yet"
    fi
    
    # Check AlertManager
    if kubectl get pods -n $MONITORING_NAMESPACE -l app.kubernetes.io/name=alertmanager | grep -q Running; then
        print_success "AlertManager is running"
    else
        print_warning "AlertManager may not be ready yet"
    fi
    
    # Check Loki
    if kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=loki | grep -q Running; then
        print_success "Loki is running"
    else
        print_warning "Loki may not be ready yet"
    fi
    
    # Check Jaeger
    if kubectl get pods -n $NAMESPACE -l app.kubernetes.io/component=collector | grep -q Running; then
        print_success "Jaeger is running"
    else
        print_warning "Jaeger may not be ready yet"
    fi
    
    print_success "Monitoring stack verification completed"
}

# Function to display access information
show_access_info() {
    print_success "Monitoring stack installation completed!"
    echo ""
    echo "=== Access Information ==="
    echo "Prometheus: https://prometheus.zoptal.com"
    echo "Grafana: https://grafana.zoptal.com"
    echo "AlertManager: https://alertmanager.zoptal.com"
    echo "Jaeger: https://jaeger.zoptal.com"
    echo ""
    echo "=== Default Credentials ==="
    echo "Grafana: admin / (check prometheus-grafana secret in monitoring namespace)"
    echo "Jaeger: admin / admin (change in production)"
    echo ""
    echo "=== Useful Commands ==="
    echo "Get Grafana password: kubectl get secret prometheus-grafana -n $MONITORING_NAMESPACE -o jsonpath='{.data.admin-password}' | base64 -d"
    echo "Port forward Grafana: kubectl port-forward svc/prometheus-grafana 3000:80 -n $MONITORING_NAMESPACE"
    echo "Port forward Prometheus: kubectl port-forward svc/prometheus-prometheus 9090:9090 -n $MONITORING_NAMESPACE"
    echo "View logs: kubectl logs -f deployment/<service-name> -n $MONITORING_NAMESPACE"
    echo ""
}

# Function to cleanup on error
cleanup() {
    print_warning "Installation failed, cleaning up..."
    
    # Remove Helm releases
    helm uninstall prometheus -n $MONITORING_NAMESPACE || true
    
    # Remove applied configurations
    kubectl delete -f ../k8s/production/monitoring.yaml || true
    kubectl delete -f ../k8s/production/loki-stack.yaml || true
    kubectl delete -f ../k8s/production/jaeger-tracing.yaml || true
    
    print_success "Cleanup completed"
}

# Main installation function
main() {
    print_status "Starting comprehensive monitoring stack installation..."
    
    # Change to the script directory
    cd "$(dirname "$0")"
    
    # Trap errors and cleanup
    trap cleanup ERR
    
    # Run installation steps
    check_kubectl
    check_helm
    setup_helm_repos
    create_monitoring_namespace
    install_prometheus_stack
    install_loki_stack
    install_jaeger
    apply_monitoring_configs
    setup_monitoring_ingress
    verify_installation
    show_access_info
}

# Handle script arguments
case "${1:-install}" in
    "install")
        main
        ;;
    "uninstall")
        cleanup
        ;;
    "verify")
        verify_installation
        ;;
    *)
        echo "Usage: $0 [install|uninstall|verify]"
        echo "  install   - Install the monitoring stack (default)"
        echo "  uninstall - Remove the monitoring stack"
        echo "  verify    - Verify the installation"
        exit 1
        ;;
esac