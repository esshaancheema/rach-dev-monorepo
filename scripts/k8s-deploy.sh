#!/bin/bash

# Kubernetes deployment script for Zoptal monorepo

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-zoptal}
KUBECONFIG=${KUBECONFIG:-~/.kube/config}
ENVIRONMENT=${ENVIRONMENT:-production}
REGION=${AWS_REGION:-us-east-1}

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to print usage
print_usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
    deploy          Deploy the entire Zoptal platform
    deploy-db       Deploy only database services
    deploy-backend  Deploy only backend services
    deploy-frontend Deploy only frontend services
    update          Update existing deployment
    destroy         Remove all resources
    status          Show deployment status
    logs            Show logs for services
    scale           Scale services up/down
    rollback        Rollback to previous version

Options:
    --namespace     Kubernetes namespace (default: zoptal)
    --environment   Environment (dev/staging/production)
    --dry-run       Show what would be deployed without applying
    --wait          Wait for rollout to complete
    --timeout       Timeout for operations (default: 600s)

Examples:
    $0 deploy --environment production --wait
    $0 deploy-db --dry-run
    $0 scale auth-service --replicas 5
    $0 logs auth-service --follow
    $0 rollback auth-service

EOF
}

# Function to check prerequisites
check_prerequisites() {
    print_color $BLUE "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl > /dev/null 2>&1; then
        print_color $RED "Error: kubectl is not installed."
        exit 1
    fi
    
    # Check kustomize
    if ! command -v kustomize > /dev/null 2>&1; then
        print_color $RED "Error: kustomize is not installed."
        exit 1
    fi
    
    # Check cluster connection
    if ! kubectl cluster-info > /dev/null 2>&1; then
        print_color $RED "Error: Cannot connect to Kubernetes cluster."
        exit 1
    fi
    
    # Check AWS CLI (optional but recommended)
    if command -v aws > /dev/null 2>&1; then
        print_color $GREEN "AWS CLI found: $(aws --version)"
    else
        print_color $YELLOW "Warning: AWS CLI not found. Some features may not work."
    fi
    
    print_color $GREEN "Prerequisites check passed!"
}

# Function to setup namespace and RBAC
setup_namespace() {
    print_color $BLUE "Setting up namespace and RBAC..."
    
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/rbac.yaml
    
    print_color $GREEN "Namespace and RBAC configured!"
}

# Function to deploy secrets
deploy_secrets() {
    print_color $BLUE "Deploying secrets..."
    
    # Check if external secrets operator is available
    if kubectl get crd externalsecrets.external-secrets.io > /dev/null 2>&1; then
        print_color $BLUE "External Secrets Operator detected. Using external secrets..."
        kubectl apply -f k8s/secrets.yaml
    else
        print_color $YELLOW "External Secrets Operator not found. Using local secrets..."
        print_color $YELLOW "Please ensure you have updated the secrets in k8s/secrets.yaml"
        kubectl apply -f k8s/secrets.yaml
    fi
    
    print_color $GREEN "Secrets deployed!"
}

# Function to deploy configuration
deploy_config() {
    print_color $BLUE "Deploying configuration..."
    
    kubectl apply -f k8s/configmap.yaml
    
    print_color $GREEN "Configuration deployed!"
}

# Function to deploy databases
deploy_databases() {
    print_color $BLUE "Deploying database services..."
    
    # Deploy in order to handle dependencies
    kubectl apply -f k8s/database/postgres.yaml
    kubectl apply -f k8s/database/redis.yaml
    kubectl apply -f k8s/database/clickhouse.yaml
    
    # Wait for databases to be ready
    if [[ "$WAIT" == "true" ]]; then
        print_color $BLUE "Waiting for databases to be ready..."
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-postgres -n $NAMESPACE
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-redis -n $NAMESPACE
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-clickhouse -n $NAMESPACE
    fi
    
    print_color $GREEN "Database services deployed!"
}

# Function to deploy backend services
deploy_backend() {
    print_color $BLUE "Deploying backend services..."
    
    # Deploy auth service first as other services depend on it
    kubectl apply -f k8s/services/auth-service.yaml
    
    if [[ "$WAIT" == "true" ]]; then
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-auth-service -n $NAMESPACE
    fi
    
    # Deploy other services
    kubectl apply -f k8s/services/project-service.yaml
    kubectl apply -f k8s/services/ai-service.yaml
    kubectl apply -f k8s/services/billing-service.yaml
    kubectl apply -f k8s/services/notification-service.yaml
    kubectl apply -f k8s/services/analytics-service.yaml
    
    if [[ "$WAIT" == "true" ]]; then
        print_color $BLUE "Waiting for backend services to be ready..."
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-project-service -n $NAMESPACE
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-ai-service -n $NAMESPACE
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-billing-service -n $NAMESPACE
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-notification-service -n $NAMESPACE
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-analytics-service -n $NAMESPACE
    fi
    
    print_color $GREEN "Backend services deployed!"
}

# Function to deploy frontend applications
deploy_frontend() {
    print_color $BLUE "Deploying frontend applications..."
    
    kubectl apply -f k8s/frontend/web-main.yaml

    if [[ "$WAIT" == "true" ]]; then
        print_color $BLUE "Waiting for frontend applications to be ready..."
        kubectl wait --for=condition=available --timeout=300s deployment/zoptal-web-main -n $NAMESPACE
    fi
    
    print_color $GREEN "Frontend applications deployed!"
}

# Function to deploy networking
deploy_networking() {
    print_color $BLUE "Deploying networking configuration..."
    
    # Check if nginx ingress controller is installed
    if kubectl get ingressclass nginx > /dev/null 2>&1; then
        kubectl apply -f k8s/networking/ingress.yaml
        print_color $GREEN "Ingress configuration applied!"
    else
        print_color $YELLOW "Warning: NGINX Ingress Controller not found. Skipping ingress setup."
    fi
    
    # Apply network policies
    kubectl apply -f k8s/networking/network-policies.yaml
    
    print_color $GREEN "Networking configuration deployed!"
}

# Function to deploy everything
deploy_all() {
    print_color $BLUE "Deploying entire Zoptal platform..."
    
    setup_namespace
    deploy_config
    deploy_secrets
    deploy_databases
    deploy_backend
    deploy_frontend
    deploy_networking
    
    print_color $GREEN "Complete Zoptal platform deployed successfully!"
    
    # Show status
    show_status
}

# Function to update deployment
update_deployment() {
    print_color $BLUE "Updating Zoptal deployment..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        kustomize build k8s/ --enable-helm
    else
        kustomize build k8s/ | kubectl apply -f -
        
        if [[ "$WAIT" == "true" ]]; then
            print_color $BLUE "Waiting for rollout to complete..."
            kubectl rollout status deployment -n $NAMESPACE --timeout=600s
        fi
    fi
    
    print_color $GREEN "Deployment updated!"
}

# Function to show deployment status
show_status() {
    print_color $BLUE "Zoptal Platform Status:"
    echo
    
    # Show namespace status
    print_color $YELLOW "Namespace:"
    kubectl get namespace $NAMESPACE
    echo
    
    # Show deployments
    print_color $YELLOW "Deployments:"
    kubectl get deployments -n $NAMESPACE -o wide
    echo
    
    # Show services
    print_color $YELLOW "Services:"
    kubectl get services -n $NAMESPACE
    echo
    
    # Show pods
    print_color $YELLOW "Pods:"
    kubectl get pods -n $NAMESPACE -o wide
    echo
    
    # Show ingress
    print_color $YELLOW "Ingress:"
    kubectl get ingress -n $NAMESPACE 2>/dev/null || echo "No ingress resources found"
    echo
    
    # Show HPA status
    print_color $YELLOW "Horizontal Pod Autoscalers:"
    kubectl get hpa -n $NAMESPACE 2>/dev/null || echo "No HPA resources found"
}

# Function to show logs
show_logs() {
    local service=$1
    local follow=${2:-false}
    
    if [[ -z "$service" ]]; then
        print_color $RED "Error: Service name required for logs"
        exit 1
    fi
    
    local follow_flag=""
    if [[ "$follow" == "true" ]]; then
        follow_flag="-f"
    fi
    
    kubectl logs -n $NAMESPACE -l app=$service $follow_flag --tail=100
}

# Function to scale services
scale_service() {
    local service=$1
    local replicas=$2
    
    if [[ -z "$service" ]] || [[ -z "$replicas" ]]; then
        print_color $RED "Error: Service name and replica count required"
        exit 1
    fi
    
    kubectl scale deployment zoptal-$service --replicas=$replicas -n $NAMESPACE
    
    print_color $GREEN "Scaled $service to $replicas replicas"
}

# Function to rollback service
rollback_service() {
    local service=$1
    
    if [[ -z "$service" ]]; then
        print_color $RED "Error: Service name required for rollback"
        exit 1
    fi
    
    kubectl rollout undo deployment/zoptal-$service -n $NAMESPACE
    kubectl rollout status deployment/zoptal-$service -n $NAMESPACE
    
    print_color $GREEN "Rolled back $service successfully"
}

# Function to destroy all resources
destroy_all() {
    print_color $YELLOW "This will destroy all Zoptal resources. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_color $BLUE "Destroying Zoptal platform..."
        
        kubectl delete namespace $NAMESPACE --ignore-not-found=true
        
        print_color $GREEN "Zoptal platform destroyed."
    else
        print_color $YELLOW "Destruction cancelled."
    fi
}

# Main script logic
main() {
    # Change to script directory
    cd "$(dirname "$0")/.."
    
    # Parse options
    WAIT=false
    DRY_RUN=false
    TIMEOUT=600
    FOLLOW=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            --environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --wait)
                WAIT=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            --follow)
                FOLLOW=true
                shift
                ;;
            --replicas)
                REPLICAS="$2"
                shift 2
                ;;
            *)
                break
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    # Parse command
    case $1 in
        deploy)
            deploy_all
            ;;
        deploy-db)
            setup_namespace
            deploy_config
            deploy_secrets
            deploy_databases
            ;;
        deploy-backend)
            deploy_backend
            ;;
        deploy-frontend)
            deploy_frontend
            ;;
        update)
            update_deployment
            ;;
        destroy)
            destroy_all
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$2" "$FOLLOW"
            ;;
        scale)
            scale_service "$2" "$REPLICAS"
            ;;
        rollback)
            rollback_service "$2"
            ;;
        help|--help|-h)
            print_usage
            ;;
        *)
            print_color $RED "Unknown command: $1"
            print_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"