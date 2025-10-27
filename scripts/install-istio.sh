#!/bin/bash

# Istio Service Mesh Installation Script for Zoptal Platform
# 
# This script installs and configures Istio service mesh with enterprise-grade
# security, observability, and traffic management features.

set -euo pipefail

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ISTIO_VERSION="${ISTIO_VERSION:-1.20.1}"
ISTIO_DIR="${HOME}/.istio"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -v, --version           Istio version to install (default: $ISTIO_VERSION)"
    echo "  -p, --profile           Istio configuration profile (default: production)"
    echo "  -n, --namespace         Istio system namespace (default: istio-system)"
    echo "  -c, --cluster-name      Cluster name for multi-cluster setup"
    echo "  -d, --dry-run           Show what would be installed without installing"
    echo "  -u, --uninstall         Uninstall Istio"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                      # Install with defaults"
    echo "  $0 -v 1.19.0           # Install specific version"
    echo "  $0 -p demo              # Install with demo profile"
    echo "  $0 -u                   # Uninstall Istio"
    exit 1
}

# Parse command line arguments
PROFILE="production"
NAMESPACE="istio-system"
CLUSTER_NAME="zoptal-production"
DRY_RUN=false
UNINSTALL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--version)
            ISTIO_VERSION="$2"
            shift 2
            ;;
        -p|--profile)
            PROFILE="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -c|--cluster-name)
            CLUSTER_NAME="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -u|--uninstall)
            UNINSTALL=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if cluster is accessible
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check cluster version
    local k8s_version=$(kubectl version --short 2>/dev/null | grep Server | awk '{print $3}' | sed 's/v//')
    local min_version="1.22.0"
    
    if ! version_compare "$k8s_version" "$min_version"; then
        log_error "Kubernetes version $k8s_version is not supported. Minimum required: $min_version"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Version comparison function
version_compare() {
    local version1=$1
    local version2=$2
    
    # Convert version strings to comparable format
    local v1=$(echo "$version1" | sed 's/[^0-9.]//g')
    local v2=$(echo "$version2" | sed 's/[^0-9.]//g')
    
    # Use sort -V to compare versions
    if [[ "$(printf '%s\n' "$v1" "$v2" | sort -V | head -n1)" == "$v2" ]]; then
        return 0
    else
        return 1
    fi
}

# Download and install Istio
download_istio() {
    log_info "Downloading Istio $ISTIO_VERSION..."
    
    # Create Istio directory
    mkdir -p "$ISTIO_DIR"
    cd "$ISTIO_DIR"
    
    # Download Istio if not already present
    if [[ ! -d "istio-$ISTIO_VERSION" ]]; then
        local os=$(uname -s | tr '[:upper:]' '[:lower:]')
        local arch=$(uname -m)
        
        # Map architecture names
        case $arch in
            x86_64) arch="amd64" ;;
            aarch64) arch="arm64" ;;
        esac
        
        local download_url="https://github.com/istio/istio/releases/download/$ISTIO_VERSION/istio-$ISTIO_VERSION-$os-$arch.tar.gz"
        
        log_info "Downloading from: $download_url"
        curl -L "$download_url" | tar xz
        
        if [[ ! -d "istio-$ISTIO_VERSION" ]]; then
            log_error "Failed to download Istio"
            exit 1
        fi
    fi
    
    # Add istioctl to PATH
    export PATH="$ISTIO_DIR/istio-$ISTIO_VERSION/bin:$PATH"
    
    log_success "Istio $ISTIO_VERSION downloaded successfully"
}

# Verify istioctl
verify_istioctl() {
    log_info "Verifying istioctl installation..."
    
    if ! command -v istioctl &> /dev/null; then
        log_error "istioctl not found in PATH"
        exit 1
    fi
    
    local installed_version=$(istioctl version --short --remote=false 2>/dev/null | head -n1)
    log_info "istioctl version: $installed_version"
    
    # Precheck installation
    log_info "Running pre-installation checks..."
    if ! istioctl x precheck; then
        log_error "Pre-installation checks failed"
        exit 1
    fi
    
    log_success "istioctl verification completed"
}

# Install Istio
install_istio() {
    log_info "Installing Istio with $PROFILE profile..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would install Istio with the following configuration:"
        istioctl install --set values.pilot.env.EXTERNAL_ISTIOD=false \
            --set values.global.meshID=zoptal-mesh \
            --set values.global.multiCluster.clusterName="$CLUSTER_NAME" \
            --set values.global.network=zoptal-network \
            --dry-run
        return
    fi
    
    # Create namespace
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Install Istio using the custom configuration
    kubectl apply -f "${PROJECT_ROOT}/k8s/service-mesh/istio-installation.yaml"
    
    # Wait for Istio to be ready
    log_info "Waiting for Istio control plane to be ready..."
    kubectl wait --for=condition=Ready pods -l app=istiod -n "$NAMESPACE" --timeout=600s
    
    log_success "Istio control plane installed successfully"
}

# Install Istio addons
install_addons() {
    log_info "Installing Istio addons..."
    
    local addons_dir="$ISTIO_DIR/istio-$ISTIO_VERSION/samples/addons"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would install the following addons:"
        ls "$addons_dir"/*.yaml
        return
    fi
    
    # Install Prometheus
    if [[ -f "$addons_dir/prometheus.yaml" ]]; then
        kubectl apply -f "$addons_dir/prometheus.yaml"
        log_info "Prometheus addon installed"
    fi
    
    # Install Grafana
    if [[ -f "$addons_dir/grafana.yaml" ]]; then
        kubectl apply -f "$addons_dir/grafana.yaml"
        log_info "Grafana addon installed"
    fi
    
    # Install Jaeger
    if [[ -f "$addons_dir/jaeger.yaml" ]]; then
        kubectl apply -f "$addons_dir/jaeger.yaml"
        log_info "Jaeger addon installed"
    fi
    
    # Install Kiali
    if [[ -f "$addons_dir/kiali.yaml" ]]; then
        kubectl apply -f "$addons_dir/kiali.yaml"
        log_info "Kiali addon installed"
    fi
    
    # Wait for addons to be ready
    log_info "Waiting for addons to be ready..."
    kubectl wait --for=condition=available --timeout=600s \
        deployment/prometheus -n "$NAMESPACE" || true
    kubectl wait --for=condition=available --timeout=600s \
        deployment/grafana -n "$NAMESPACE" || true
    kubectl wait --for=condition=available --timeout=600s \
        deployment/jaeger -n "$NAMESPACE" || true
    kubectl wait --for=condition=available --timeout=600s \
        deployment/kiali -n "$NAMESPACE" || true
    
    log_success "Istio addons installed successfully"
}

# Configure service mesh for Zoptal services
configure_service_mesh() {
    log_info "Configuring service mesh for Zoptal services..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Would configure service mesh"
        return
    fi
    
    # Label namespaces for automatic sidecar injection
    local namespaces=("zoptal-production" "zoptal-blue" "zoptal-green" "zoptal-canary")
    
    for ns in "${namespaces[@]}"; do
        if kubectl get namespace "$ns" &> /dev/null; then
            kubectl label namespace "$ns" istio-injection=enabled --overwrite
            log_info "Enabled sidecar injection for namespace: $ns"
        else
            log_warning "Namespace $ns does not exist, skipping"
        fi
    done
    
    # Apply service mesh configurations
    kubectl apply -f "${PROJECT_ROOT}/k8s/service-mesh/" || true
    
    log_success "Service mesh configuration applied"
}

# Verify installation
verify_installation() {
    log_info "Verifying Istio installation..."
    
    # Check control plane status
    if ! istioctl proxy-status; then
        log_error "Istio proxy status check failed"
        return 1
    fi
    
    # Validate configuration
    if ! istioctl analyze; then
        log_warning "Configuration analysis found issues"
    fi
    
    # Check if gateway is ready
    kubectl wait --for=condition=available --timeout=300s \
        deployment/istio-ingressgateway -n "$NAMESPACE"
    
    # Get gateway external IP
    local external_ip=$(kubectl get svc istio-ingressgateway -n "$NAMESPACE" \
        -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    
    log_success "Istio installation verified successfully"
    log_info "Ingress Gateway External IP: $external_ip"
}

# Uninstall Istio
uninstall_istio() {
    log_warning "Uninstalling Istio service mesh..."
    
    read -p "Are you sure you want to uninstall Istio? This will remove all service mesh functionality. (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Uninstall cancelled"
        return 0
    fi
    
    # Remove Istio configuration
    kubectl delete -f "${PROJECT_ROOT}/k8s/service-mesh/" --ignore-not-found=true || true
    
    # Uninstall Istio
    if command -v istioctl &> /dev/null; then
        istioctl uninstall --purge -y
    fi
    
    # Remove namespace labels
    local namespaces=("zoptal-production" "zoptal-blue" "zoptal-green" "zoptal-canary")
    for ns in "${namespaces[@]}"; do
        if kubectl get namespace "$ns" &> /dev/null; then
            kubectl label namespace "$ns" istio-injection- --ignore-not-found=true
        fi
    done
    
    # Delete Istio namespace
    kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
    
    log_success "Istio uninstalled successfully"
}

# Display post-installation information
show_post_install_info() {
    echo ""
    echo -e "${GREEN}=================================="
    echo -e "Istio Installation Complete!"
    echo -e "==================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update your applications to work with Istio service mesh"
    echo "2. Configure traffic policies and security rules"
    echo "3. Set up monitoring and observability"
    echo ""
    echo "Useful commands:"
    echo "  # Check proxy status:"
    echo "  istioctl proxy-status"
    echo ""
    echo "  # View configuration:"
    echo "  istioctl proxy-config cluster <pod-name> -n <namespace>"
    echo ""
    echo "  # Access Kiali dashboard:"
    echo "  kubectl port-forward svc/kiali 20001:20001 -n $NAMESPACE"
    echo "  # Then open http://localhost:20001"
    echo ""
    echo "  # Access Grafana dashboard:"
    echo "  kubectl port-forward svc/grafana 3000:3000 -n $NAMESPACE"
    echo "  # Then open http://localhost:3000"
    echo ""
    echo "  # Access Jaeger UI:"
    echo "  kubectl port-forward svc/jaeger 16686:16686 -n $NAMESPACE"
    echo "  # Then open http://localhost:16686"
    echo ""
    echo "Documentation: https://istio.io/latest/docs/"
}

# Main function
main() {
    log_info "Starting Istio service mesh installation..."
    
    if [[ "$UNINSTALL" == "true" ]]; then
        uninstall_istio
        return 0
    fi
    
    check_prerequisites
    download_istio
    verify_istioctl
    install_istio
    install_addons
    configure_service_mesh
    verify_installation
    
    if [[ "$DRY_RUN" != "true" ]]; then
        show_post_install_info
    fi
    
    log_success "Istio service mesh installation completed successfully!"
}

# Run main function
main "$@"