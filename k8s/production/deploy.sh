#!/bin/bash

# Zoptal Kubernetes Production Deployment Script
# This script deploys the entire Zoptal platform to a Kubernetes cluster

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="zoptal-production"
KUBECTL_TIMEOUT="300s"
ROLLOUT_TIMEOUT="600s"

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

# Function to check if required tools are available
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_tools=()
    
    # Check for required tools
    for tool in kubectl helm docker; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Function to create namespace and basic resources
setup_namespace() {
    print_status "Setting up namespace and basic resources..."
    
    # Apply namespace configuration
    kubectl apply -f namespace.yaml
    
    # Wait for namespace to be ready
    kubectl wait --for=condition=Ready namespace/$NAMESPACE --timeout=$KUBECTL_TIMEOUT
    
    print_success "Namespace $NAMESPACE is ready"
}

# Function to setup secrets
setup_secrets() {
    print_status "Setting up secrets..."
    
    # Check if secrets file exists
    if [ ! -f "secrets.yaml" ]; then
        print_error "secrets.yaml file not found"
        print_warning "Please create secrets.yaml with production secrets"
        exit 1
    fi
    
    # Apply secrets
    kubectl apply -f secrets.yaml
    
    print_success "Secrets have been applied"
}

# Function to setup configuration
setup_config() {
    print_status "Setting up configuration..."
    
    # Apply configmaps
    kubectl apply -f configmap.yaml
    
    print_success "Configuration has been applied"
}

# Function to setup persistent storage
setup_storage() {
    print_status "Setting up persistent storage..."
    
    # Check if storage class exists
    if ! kubectl get storageclass fast-ssd &> /dev/null; then
        print_warning "Storage class 'fast-ssd' not found, creating default one..."
        
        cat <<EOF | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
  replication-type: regional-pd
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
EOF
    fi
    
    # Apply database configurations
    kubectl apply -f database.yaml
    
    print_success "Storage has been configured"
}

# Function to deploy databases
deploy_databases() {
    print_status "Deploying databases..."
    
    # Wait for PVCs to be bound
    print_status "Waiting for PVCs to be bound..."
    kubectl wait --for=condition=Bound pvc/postgres-pvc -n $NAMESPACE --timeout=$KUBECTL_TIMEOUT
    kubectl wait --for=condition=Bound pvc/redis-pvc -n $NAMESPACE --timeout=$KUBECTL_TIMEOUT
    
    # Wait for database pods to be ready
    print_status "Waiting for database pods to be ready..."
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=postgres -n $NAMESPACE --timeout=$ROLLOUT_TIMEOUT
    kubectl wait --for=condition=Ready pod -l app.kubernetes.io/name=redis -n $NAMESPACE --timeout=$ROLLOUT_TIMEOUT
    
    print_success "Databases are ready"
}

# Function to build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Get the current directory (project root)
    PROJECT_ROOT=$(dirname $(dirname $(realpath $0)))
    
    # Docker registry (change this to your registry)
    REGISTRY="zoptal"
    TAG="latest"
    
    # Services to build
    SERVICES=(
        "auth-service:services/auth-service"
        "project-service:services/project-service"
        "ai-service:services/ai-service"
        "billing-service:services/billing-service"
        "notification-service:services/notification-service"
        "admin:apps/admin"
        "web-main:apps/web-main"
    )
    
    for service_info in "${SERVICES[@]}"; do
        IFS=':' read -r service_name service_path <<< "$service_info"
        
        print_status "Building $service_name..."
        
        # Build the image
        docker build -t "$REGISTRY/$service_name:$TAG" "$PROJECT_ROOT/$service_path"
        
        # Push the image
        print_status "Pushing $service_name..."
        docker push "$REGISTRY/$service_name:$TAG"
        
        print_success "$service_name image built and pushed"
    done
    
    print_success "All images have been built and pushed"
}

# Function to deploy backend services
deploy_backend_services() {
    print_status "Deploying backend services..."
    
    # Deploy services in order (auth first, then others)
    local services=(
        "auth-service"
        "project-service"
        "ai-service"
        "billing-service"
        "notification-service"
    )
    
    for service in "${services[@]}"; do
        if [ -f "${service}.yaml" ]; then
            print_status "Deploying $service..."
            kubectl apply -f "${service}.yaml"
            
            # Wait for deployment to be ready
            kubectl rollout status deployment/$service -n $NAMESPACE --timeout=$ROLLOUT_TIMEOUT
            
            print_success "$service deployed successfully"
        else
            print_warning "$service.yaml not found, skipping..."
        fi
    done
    
    print_success "Backend services are ready"
}

# Function to deploy frontend applications
deploy_frontend_apps() {
    print_status "Deploying frontend applications..."
    
    local apps=(
        "web-main"
        "admin"
    )
    
    for app in "${apps[@]}"; do
        if [ -f "${app}.yaml" ]; then
            print_status "Deploying $app..."
            kubectl apply -f "${app}.yaml"
            
            # Wait for deployment to be ready
            kubectl rollout status deployment/$app -n $NAMESPACE --timeout=$ROLLOUT_TIMEOUT
            
            print_success "$app deployed successfully"
        else
            print_warning "$app.yaml not found, skipping..."
        fi
    done
    
    print_success "Frontend applications are ready"
}

# Function to setup ingress and networking
setup_networking() {
    print_status "Setting up networking and ingress..."
    
    # Install cert-manager if not present
    if ! kubectl get namespace cert-manager &> /dev/null; then
        print_status "Installing cert-manager..."
        kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
        
        # Wait for cert-manager to be ready
        kubectl wait --for=condition=Ready pod -l app=cert-manager -n cert-manager --timeout=$ROLLOUT_TIMEOUT
        kubectl wait --for=condition=Ready pod -l app=cainjector -n cert-manager --timeout=$ROLLOUT_TIMEOUT
        kubectl wait --for=condition=Ready pod -l app=webhook -n cert-manager --timeout=$ROLLOUT_TIMEOUT
    fi
    
    # Apply ingress configuration
    kubectl apply -f ingress.yaml
    
    print_success "Networking has been configured"
}

# Function to setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Install Prometheus Operator if not present
    if ! kubectl get namespace monitoring &> /dev/null; then
        print_status "Installing Prometheus Operator..."
        
        # Add Prometheus community Helm repository
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
        helm repo update
        
        # Install kube-prometheus-stack
        helm install prometheus prometheus-community/kube-prometheus-stack \
            --create-namespace \
            --namespace monitoring \
            --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
            --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
            --wait
        
        print_success "Prometheus Operator installed"
    fi
    
    # Apply service monitors
    if [ -f "monitoring.yaml" ]; then
        kubectl apply -f monitoring.yaml
        print_success "Service monitors applied"
    fi
}

# Function to run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Check if all pods are running
    local not_ready_pods=$(kubectl get pods -n $NAMESPACE --no-headers | grep -v Running | grep -v Completed | wc -l)
    
    if [ "$not_ready_pods" -gt 0 ]; then
        print_warning "Some pods are not ready:"
        kubectl get pods -n $NAMESPACE | grep -v Running | grep -v Completed
    else
        print_success "All pods are running"
    fi
    
    # Check services
    print_status "Checking services..."
    kubectl get services -n $NAMESPACE
    
    # Check ingress
    print_status "Checking ingress..."
    kubectl get ingress -n $NAMESPACE
    
    print_success "Health checks completed"
}

# Function to display deployment information
show_deployment_info() {
    print_success "Deployment completed successfully!"
    echo ""
    echo "=== Deployment Information ==="
    echo "Namespace: $NAMESPACE"
    echo "Cluster: $(kubectl config current-context)"
    echo ""
    echo "=== Services ==="
    kubectl get services -n $NAMESPACE -o wide
    echo ""
    echo "=== Ingress ==="
    kubectl get ingress -n $NAMESPACE
    echo ""
    echo "=== Useful Commands ==="
    echo "View logs: kubectl logs -f deployment/<service-name> -n $NAMESPACE"
    echo "Scale service: kubectl scale deployment <service-name> --replicas=<count> -n $NAMESPACE"
    echo "Port forward: kubectl port-forward service/<service-name> <local-port>:<service-port> -n $NAMESPACE"
    echo "Check status: kubectl get all -n $NAMESPACE"
    echo ""
    echo "=== URLs ==="
    echo "Main Website: https://zoptal.com"
    echo "Dashboard: https://app.zoptal.com"
    echo "Admin Panel: https://admin.zoptal.com"
    echo "API: https://api.zoptal.com"
}

# Function to cleanup deployment
cleanup() {
    print_warning "Cleaning up failed deployment..."
    
    # Delete the namespace (this will delete everything in it)
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    
    print_success "Cleanup completed"
}

# Main deployment function
main() {
    print_status "Starting Zoptal Kubernetes deployment..."
    
    # Change to the script directory
    cd "$(dirname "$0")"
    
    # Trap errors and cleanup
    trap cleanup ERR
    
    # Run deployment steps
    check_dependencies
    check_kubectl
    setup_namespace
    setup_secrets
    setup_config
    setup_storage
    deploy_databases
    
    # Optional: Build and push images (uncomment if needed)
    # build_and_push_images
    
    deploy_backend_services
    deploy_frontend_apps
    setup_networking
    
    # Optional: Setup monitoring (uncomment if needed)
    # setup_monitoring
    
    run_health_checks
    show_deployment_info
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "cleanup")
        cleanup
        ;;
    "health")
        run_health_checks
        ;;
    "build")
        build_and_push_images
        ;;
    *)
        echo "Usage: $0 [deploy|cleanup|health|build]"
        echo "  deploy  - Deploy the entire platform (default)"
        echo "  cleanup - Remove the deployment"
        echo "  health  - Run health checks"
        echo "  build   - Build and push Docker images"
        exit 1
        ;;
esac