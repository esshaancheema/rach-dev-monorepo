#!/bin/bash

# Deployment script for Zoptal monitoring and logging infrastructure
# This script deploys Prometheus Operator, Grafana, AlertManager, and logging components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITORING_DIR="$SCRIPT_DIR"
LOGGING_DIR="$SCRIPT_DIR/../logging"

# Function to print colored output
print_info() {
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

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if kubectl is installed and configured
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_error "kubectl cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    # Check if helm is installed (optional but recommended)
    if ! command -v helm &> /dev/null; then
        print_warning "Helm is not installed. Some advanced features may not be available."
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to install Prometheus Operator CRDs
install_prometheus_crds() {
    print_info "Installing Prometheus Operator CRDs..."
    
    kubectl apply --server-side -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.68.0/example/prometheus-operator-crd/monitoring.coreos.com_alertmanagers.yaml
    kubectl apply --server-side -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.68.0/example/prometheus-operator-crd/monitoring.coreos.com_podmonitors.yaml
    kubectl apply --server-side -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.68.0/example/prometheus-operator-crd/monitoring.coreos.com_probes.yaml
    kubectl apply --server-side -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.68.0/example/prometheus-operator-crd/monitoring.coreos.com_prometheuses.yaml
    kubectl apply --server-side -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.68.0/example/prometheus-operator-crd/monitoring.coreos.com_prometheusrules.yaml
    kubectl apply --server-side -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.68.0/example/prometheus-operator-crd/monitoring.coreos.com_servicemonitors.yaml
    kubectl apply --server-side -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.68.0/example/prometheus-operator-crd/monitoring.coreos.com_thanosrulers.yaml
    
    print_success "Prometheus Operator CRDs installed!"
}

# Function to create TLS certificates for Prometheus Operator
create_prometheus_certs() {
    print_info "Creating TLS certificates for Prometheus Operator..."
    
    # Check if the secret already exists
    if kubectl get secret prometheus-operator-certs -n monitoring &> /dev/null; then
        print_warning "Prometheus Operator certificates already exist. Skipping..."
        return
    fi
    
    # Create temporary directory for certificates
    TEMP_DIR=$(mktemp -d)
    cd "$TEMP_DIR"
    
    # Generate private key
    openssl genrsa -out tls.key 2048
    
    # Generate certificate
    openssl req -new -x509 -key tls.key -out tls.crt -days 365 -subj "/CN=prometheus-operator.monitoring.svc.cluster.local"
    
    # Create secret
    kubectl create secret tls prometheus-operator-certs \
        --cert=tls.crt \
        --key=tls.key \
        -n monitoring
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    
    print_success "Prometheus Operator certificates created!"
}

# Function to deploy namespaces
deploy_namespaces() {
    print_info "Creating monitoring and logging namespaces..."
    kubectl apply -f "$MONITORING_DIR/namespace.yaml"
    print_success "Namespaces created!"
}

# Function to deploy Prometheus Operator
deploy_prometheus_operator() {
    print_info "Deploying Prometheus Operator..."
    
    create_prometheus_certs
    kubectl apply -f "$MONITORING_DIR/prometheus-operator.yaml"
    
    # Wait for operator to be ready
    print_info "Waiting for Prometheus Operator to be ready..."
    kubectl wait --for=condition=available deployment/prometheus-operator -n monitoring --timeout=300s
    
    print_success "Prometheus Operator deployed!"
}

# Function to deploy Prometheus
deploy_prometheus() {
    print_info "Deploying Prometheus..."
    
    kubectl apply -f "$MONITORING_DIR/prometheus.yaml"
    kubectl apply -f "$MONITORING_DIR/prometheus-rules.yaml"
    kubectl apply -f "$MONITORING_DIR/service-monitors.yaml"
    
    # Wait for Prometheus to be ready
    print_info "Waiting for Prometheus to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=prometheus -n monitoring --timeout=300s
    
    print_success "Prometheus deployed!"
}

# Function to deploy AlertManager
deploy_alertmanager() {
    print_info "Deploying AlertManager..."
    
    kubectl apply -f "$MONITORING_DIR/alertmanager.yaml"
    
    # Wait for AlertManager to be ready
    print_info "Waiting for AlertManager to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=alertmanager -n monitoring --timeout=300s
    
    print_success "AlertManager deployed!"
}

# Function to deploy Node Exporter
deploy_node_exporter() {
    print_info "Deploying Node Exporter..."
    
    kubectl apply -f "$MONITORING_DIR/node-exporter.yaml"
    
    # Wait for Node Exporter to be ready
    print_info "Waiting for Node Exporter to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=node-exporter -n monitoring --timeout=300s
    
    print_success "Node Exporter deployed!"
}

# Function to deploy Grafana
deploy_grafana() {
    print_info "Deploying Grafana..."
    
    kubectl apply -f "$MONITORING_DIR/grafana-dashboards.yaml"
    kubectl apply -f "$MONITORING_DIR/grafana.yaml"
    
    # Wait for Grafana to be ready
    print_info "Waiting for Grafana to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=grafana -n monitoring --timeout=300s
    
    print_success "Grafana deployed!"
}

# Function to deploy logging infrastructure
deploy_logging() {
    print_info "Deploying logging infrastructure..."
    
    kubectl apply -f "$LOGGING_DIR/fluentd.yaml"
    
    # Wait for Fluentd to be ready
    print_info "Waiting for Fluentd to be ready..."
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=fluentd -n logging --timeout=300s
    
    print_success "Logging infrastructure deployed!"
}

# Function to show access information
show_access_info() {
    print_info "Getting access information..."
    
    echo ""
    echo "=== Monitoring and Logging Access Information ==="
    echo ""
    
    # Prometheus
    if kubectl get ingress prometheus -n monitoring &> /dev/null; then
        PROMETHEUS_URL=$(kubectl get ingress prometheus -n monitoring -o jsonpath='{.spec.rules[0].host}')
        echo "Prometheus: https://$PROMETHEUS_URL"
    else
        echo "Prometheus: kubectl port-forward -n monitoring svc/prometheus 9090:9090"
    fi
    
    # Grafana
    if kubectl get ingress grafana -n monitoring &> /dev/null; then
        GRAFANA_URL=$(kubectl get ingress grafana -n monitoring -o jsonpath='{.spec.rules[0].host}')
        echo "Grafana: https://$GRAFANA_URL"
    else
        echo "Grafana: kubectl port-forward -n monitoring svc/grafana 3000:3000"
    fi
    
    # AlertManager
    if kubectl get ingress alertmanager -n monitoring &> /dev/null; then
        ALERTMANAGER_URL=$(kubectl get ingress alertmanager -n monitoring -o jsonpath='{.spec.rules[0].host}')
        echo "AlertManager: https://$ALERTMANAGER_URL"
    else
        echo "AlertManager: kubectl port-forward -n monitoring svc/alertmanager-main 9093:9093"
    fi
    
    echo ""
    echo "Default Grafana credentials:"
    echo "Username: admin"
    echo "Password: admin123"
    echo ""
    echo "Please change the default password in production!"
    echo ""
}

# Function to verify deployment
verify_deployment() {
    print_info "Verifying deployment..."
    
    # Check if all pods are running
    echo "Checking pod status..."
    kubectl get pods -n monitoring
    kubectl get pods -n logging
    
    echo ""
    echo "Checking services..."
    kubectl get svc -n monitoring
    kubectl get svc -n logging
    
    echo ""
    echo "Checking ingresses..."
    kubectl get ingress -n monitoring
    
    # Check if Prometheus targets are up
    print_info "Checking Prometheus targets..."
    if kubectl port-forward -n monitoring svc/prometheus 9090:9090 &> /dev/null &
    then
        PF_PID=$!
        sleep 5
        
        # Simple check if Prometheus is responding
        if curl -s http://localhost:9090/-/healthy &> /dev/null; then
            print_success "Prometheus is healthy!"
        else
            print_warning "Prometheus health check failed"
        fi
        
        kill $PF_PID 2>/dev/null || true
    fi
    
    print_success "Deployment verification completed!"
}

# Function to show help
show_help() {
    echo "Monitoring and Logging deployment script for Zoptal"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  install-crds     Install Prometheus Operator CRDs"
    echo "  deploy-all       Deploy complete monitoring and logging stack"
    echo "  deploy-monitoring Deploy monitoring components only"
    echo "  deploy-logging   Deploy logging components only"
    echo "  verify          Verify deployment status"
    echo "  access-info     Show access information"
    echo "  clean           Remove all monitoring and logging components"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy-all"
    echo "  $0 verify"
    echo "  $0 access-info"
}

# Function to clean deployment
clean_deployment() {
    print_warning "This will remove ALL monitoring and logging components!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        print_info "Cleaning up monitoring and logging components..."
        
        # Delete all resources
        kubectl delete -f "$LOGGING_DIR/fluentd.yaml" --ignore-not-found=true
        kubectl delete -f "$MONITORING_DIR/grafana.yaml" --ignore-not-found=true
        kubectl delete -f "$MONITORING_DIR/grafana-dashboards.yaml" --ignore-not-found=true
        kubectl delete -f "$MONITORING_DIR/node-exporter.yaml" --ignore-not-found=true
        kubectl delete -f "$MONITORING_DIR/alertmanager.yaml" --ignore-not-found=true
        kubectl delete -f "$MONITORING_DIR/service-monitors.yaml" --ignore-not-found=true
        kubectl delete -f "$MONITORING_DIR/prometheus-rules.yaml" --ignore-not-found=true
        kubectl delete -f "$MONITORING_DIR/prometheus.yaml" --ignore-not-found=true
        kubectl delete -f "$MONITORING_DIR/prometheus-operator.yaml" --ignore-not-found=true
        kubectl delete -f "$MONITORING_DIR/namespace.yaml" --ignore-not-found=true
        
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled."
    fi
}

# Main execution
main() {
    case "${1:-help}" in
        "install-crds")
            check_prerequisites
            install_prometheus_crds
            ;;
        "deploy-all")
            check_prerequisites
            install_prometheus_crds
            deploy_namespaces
            deploy_prometheus_operator
            sleep 10  # Give operator time to start
            deploy_node_exporter
            deploy_prometheus
            deploy_alertmanager
            deploy_grafana
            deploy_logging
            show_access_info
            ;;
        "deploy-monitoring")
            check_prerequisites
            install_prometheus_crds
            deploy_namespaces
            deploy_prometheus_operator
            sleep 10
            deploy_node_exporter
            deploy_prometheus
            deploy_alertmanager
            deploy_grafana
            show_access_info
            ;;
        "deploy-logging")
            check_prerequisites
            deploy_namespaces
            deploy_logging
            ;;
        "verify")
            check_prerequisites
            verify_deployment
            ;;
        "access-info")
            show_access_info
            ;;
        "clean")
            check_prerequisites
            clean_deployment
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"