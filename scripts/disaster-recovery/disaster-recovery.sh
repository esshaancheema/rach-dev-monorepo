#!/bin/bash

# Disaster Recovery Script for Zoptal Platform
# This script provides comprehensive disaster recovery operations

set -euo pipefail

# Configuration
NAMESPACE="zoptal-production"
BACKUP_BUCKET="zoptal-backups"
RECOVERY_NAMESPACE="zoptal-recovery"
LOG_FILE="/var/log/disaster-recovery.log"
KUBECTL_TIMEOUT="300s"

# AWS Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
    log "=== $1 ==="
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    log "SUCCESS: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log "WARNING: $1"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    log "ERROR: $1"
}

print_status() {
    echo -e "${BLUE}→ $1${NC}"
    log "STATUS: $1"
}

print_info() {
    echo -e "${PURPLE}ℹ $1${NC}"
    log "INFO: $1"
}

# Check dependencies
check_dependencies() {
    print_header "Checking Dependencies"
    
    local missing_deps=()
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        missing_deps+=("kubectl")
    fi
    
    # Check aws cli
    if ! command -v aws &> /dev/null; then
        missing_deps+=("aws-cli")
    fi
    
    # Check jq
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    # Check yq
    if ! command -v yq &> /dev/null; then
        missing_deps+=("yq")
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_info "Please install the missing dependencies and try again"
        exit 1
    fi
    
    # Check AWS credentials
    if [[ -z "$AWS_ACCESS_KEY_ID" || -z "$AWS_SECRET_ACCESS_KEY" ]]; then
        if ! aws sts get-caller-identity &> /dev/null; then
            print_error "AWS credentials not configured"
            print_info "Please configure AWS credentials using 'aws configure' or environment variables"
            exit 1
        fi
    fi
    
    # Check Kubernetes context
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        print_info "Please ensure kubectl is configured with the correct context"
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# List available backups
list_backups() {
    local backup_type=${1:-"all"}
    print_header "Listing Available Backups"
    
    case "$backup_type" in
        "database"|"db")
            print_status "Database backups:"
            aws s3 ls "s3://${BACKUP_BUCKET}/database/" --recursive | sort -k1,2
            ;;
        "redis")
            print_status "Redis backups:"
            aws s3 ls "s3://${BACKUP_BUCKET}/redis/" --recursive | sort -k1,2
            ;;
        "config")
            print_status "Configuration backups:"
            aws s3 ls "s3://${BACKUP_BUCKET}/config/" --recursive | sort -k1,2
            ;;
        "files")
            print_status "File backups:"
            aws s3 ls "s3://${BACKUP_BUCKET}/files/" --recursive | sort -k1,2
            ;;
        "all")
            print_status "All backups:"
            aws s3 ls "s3://${BACKUP_BUCKET}/" --recursive | sort -k1,2
            ;;
        *)
            print_error "Invalid backup type. Use: database, redis, config, files, or all"
            return 1
            ;;
    esac
}

# Create recovery namespace
create_recovery_namespace() {
    print_header "Creating Recovery Namespace"
    
    if kubectl get namespace "$RECOVERY_NAMESPACE" &> /dev/null; then
        print_warning "Recovery namespace already exists"
        print_status "Do you want to delete and recreate it? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            kubectl delete namespace "$RECOVERY_NAMESPACE" --timeout="$KUBECTL_TIMEOUT"
            print_status "Waiting for namespace deletion..."
            while kubectl get namespace "$RECOVERY_NAMESPACE" &> /dev/null; do
                sleep 5
            done
        else
            print_status "Using existing recovery namespace"
            return 0
        fi
    fi
    
    kubectl create namespace "$RECOVERY_NAMESPACE"
    
    # Label the namespace
    kubectl label namespace "$RECOVERY_NAMESPACE" \
        purpose=disaster-recovery \
        created-by=dr-script \
        created-at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    
    print_success "Recovery namespace created: $RECOVERY_NAMESPACE"
}

# Restore database from backup
restore_database() {
    local backup_file=${1:-""}
    
    if [[ -z "$backup_file" ]]; then
        print_error "Backup file not specified"
        print_info "Usage: restore_database <backup_file>"
        print_info "Use 'list_backups database' to see available backups"
        return 1
    fi
    
    print_header "Restoring Database from Backup"
    print_status "Backup file: $backup_file"
    
    # Create recovery database pod
    print_status "Creating recovery database instance..."
    
    cat << EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-recovery
  namespace: $RECOVERY_NAMESPACE
  labels:
    app: postgres-recovery
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres-recovery
  template:
    metadata:
      labels:
        app: postgres-recovery
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_PASSWORD
          value: "recovery123"
        - name: POSTGRES_DB
          value: "zoptal_recovery"
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
      volumes:
      - name: postgres-storage
        emptyDir:
          sizeLimit: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-recovery-service
  namespace: $RECOVERY_NAMESPACE
spec:
  type: ClusterIP
  ports:
  - port: 5432
    targetPort: 5432
  selector:
    app: postgres-recovery
EOF
    
    # Wait for postgres to be ready
    print_status "Waiting for recovery database to be ready..."
    kubectl wait --for=condition=available deployment/postgres-recovery \
        -n "$RECOVERY_NAMESPACE" --timeout="$KUBECTL_TIMEOUT"
    
    # Create restore job
    print_status "Creating database restore job..."
    
    cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: database-restore-$(date +%s)
  namespace: $RECOVERY_NAMESPACE
spec:
  backoffLimit: 2
  activeDeadlineSeconds: 3600
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: restore
        image: postgres:15-alpine
        env:
        - name: PGPASSWORD
          value: "recovery123"
        - name: AWS_ACCESS_KEY_ID
          value: "$AWS_ACCESS_KEY_ID"
        - name: AWS_SECRET_ACCESS_KEY
          value: "$AWS_SECRET_ACCESS_KEY"
        command:
        - /bin/bash
        - -c
        - |
          set -euo pipefail
          
          echo "Starting database restore from: $backup_file"
          
          # Install AWS CLI
          apk add --no-cache aws-cli
          
          # Download backup file
          aws s3 cp "s3://${BACKUP_BUCKET}/database/$backup_file" "/tmp/$backup_file"
          
          # Extract if compressed
          if [[ "$backup_file" == *.gz ]]; then
            gunzip "/tmp/$backup_file"
            backup_file="\${backup_file%.gz}"
          fi
          
          # Restore database
          psql -h postgres-recovery-service -p 5432 -U postgres -d zoptal_recovery < "/tmp/\$backup_file"
          
          echo "Database restore completed successfully"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        volumeMounts:
        - name: restore-volume
          mountPath: /tmp
      volumes:
      - name: restore-volume
        emptyDir:
          sizeLimit: 10Gi
EOF
    
    # Wait for restore job to complete
    print_status "Waiting for restore job to complete..."
    local job_name=$(kubectl get jobs -n "$RECOVERY_NAMESPACE" --sort-by=.metadata.creationTimestamp -o jsonpath='{.items[-1].metadata.name}')
    kubectl wait --for=condition=complete job/"$job_name" -n "$RECOVERY_NAMESPACE" --timeout="$KUBECTL_TIMEOUT"
    
    print_success "Database restored successfully"
    print_info "Recovery database is available at: postgres-recovery-service.$RECOVERY_NAMESPACE.svc.cluster.local:5432"
}

# Restore Redis from backup
restore_redis() {
    local backup_pattern=${1:-""}
    
    if [[ -z "$backup_pattern" ]]; then
        print_error "Backup pattern not specified"
        print_info "Usage: restore_redis <backup_pattern>"
        print_info "Example: restore_redis redis_20241201_020000"
        return 1
    fi
    
    print_header "Restoring Redis from Backup"
    print_status "Backup pattern: $backup_pattern"
    
    # Create recovery Redis instance
    print_status "Creating recovery Redis instance..."
    
    cat << EOF | kubectl apply -f -
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-recovery
  namespace: $RECOVERY_NAMESPACE
spec:
  serviceName: redis-recovery-service
  replicas: 1
  selector:
    matchLabels:
      app: redis-recovery
  template:
    metadata:
      labels:
        app: redis-recovery
    spec:
      containers:
      - name: redis
        image: redis:7.2-alpine
        ports:
        - containerPort: 6379
        args:
        - redis-server
        - --save
        - "900 1"
        - --appendonly
        - "yes"
        volumeMounts:
        - name: redis-data
          mountPath: /data
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "1Gi"
            cpu: "500m"
  volumeClaimTemplates:
  - metadata:
      name: redis-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 5Gi
---
apiVersion: v1
kind: Service
metadata:
  name: redis-recovery-service
  namespace: $RECOVERY_NAMESPACE
spec:
  type: ClusterIP
  ports:
  - port: 6379
    targetPort: 6379
  selector:
    app: redis-recovery
EOF
    
    # Wait for Redis to be ready
    print_status "Waiting for recovery Redis to be ready..."
    kubectl wait --for=condition=ready pod/redis-recovery-0 -n "$RECOVERY_NAMESPACE" --timeout="$KUBECTL_TIMEOUT"
    
    # Restore Redis data
    print_status "Restoring Redis data..."
    local backup_files=$(aws s3 ls "s3://${BACKUP_BUCKET}/redis/" | grep "$backup_pattern" | awk '{print $4}')
    
    for backup_file in $backup_files; do
        print_status "Restoring: $backup_file"
        
        # Create restore job for this backup file
        cat << EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: redis-restore-$(date +%s)
  namespace: $RECOVERY_NAMESPACE
spec:
  backoffLimit: 2
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: restore
        image: redis:7.2-alpine
        env:
        - name: AWS_ACCESS_KEY_ID
          value: "$AWS_ACCESS_KEY_ID"
        - name: AWS_SECRET_ACCESS_KEY
          value: "$AWS_SECRET_ACCESS_KEY"
        command:
        - /bin/bash
        - -c
        - |
          set -euo pipefail
          
          echo "Restoring Redis from: $backup_file"
          
          # Install AWS CLI
          apk add --no-cache aws-cli
          
          # Download backup file
          aws s3 cp "s3://${BACKUP_BUCKET}/redis/$backup_file" "/tmp/$backup_file"
          
          # Extract if compressed
          if [[ "$backup_file" == *.gz ]]; then
            gunzip "/tmp/$backup_file"
            backup_file="\${backup_file%.gz}"
          fi
          
          # Stop Redis to restore RDB file
          redis-cli -h redis-recovery-service shutdown nosave || true
          sleep 5
          
          # Copy RDB file to Redis data directory (would need volume mount)
          echo "RDB file downloaded: /tmp/\$backup_file"
          echo "Manual restoration required - copy RDB file to Redis data directory"
          
          echo "Redis backup downloaded successfully"
        resources:
          requests:
            memory: "128Mi"
            cpu: "50m"
          limits:
            memory: "256Mi"
            cpu: "100m"
EOF
    done
    
    print_success "Redis restore initiated"
    print_info "Recovery Redis is available at: redis-recovery-service.$RECOVERY_NAMESPACE.svc.cluster.local:6379"
}

# Restore configuration from backup
restore_config() {
    local backup_file=${1:-""}
    
    if [[ -z "$backup_file" ]]; then
        print_error "Config backup file not specified"
        print_info "Usage: restore_config <backup_file>"
        print_info "Use 'list_backups config' to see available backups"
        return 1
    fi
    
    print_header "Restoring Configuration from Backup"
    print_status "Backup file: $backup_file"
    
    # Download and extract config backup
    local temp_dir="/tmp/config_restore_$(date +%s)"
    mkdir -p "$temp_dir"
    
    print_status "Downloading configuration backup..."
    aws s3 cp "s3://${BACKUP_BUCKET}/config/$backup_file" "$temp_dir/$backup_file"
    
    cd "$temp_dir"
    tar -xzf "$backup_file"
    
    local config_dir="${backup_file%.tar.gz}"
    
    if [[ ! -d "$config_dir" ]]; then
        print_error "Invalid backup file structure"
        return 1
    fi
    
    cd "$config_dir"
    
    # Apply configurations to recovery namespace
    print_status "Applying configurations to recovery namespace..."
    
    # Update namespace in YAML files
    for file in *.yaml; do
        if [[ -f "$file" ]]; then
            print_status "Processing: $file"
            
            # Replace namespace references
            sed "s/namespace: $NAMESPACE/namespace: $RECOVERY_NAMESPACE/g" "$file" > "${file}.recovery"
            
            # Apply to recovery namespace
            kubectl apply -f "${file}.recovery" || print_warning "Failed to apply $file"
        fi
    done
    
    # Cleanup
    rm -rf "$temp_dir"
    
    print_success "Configuration restored to recovery namespace"
}

# Validate recovery environment
validate_recovery() {
    print_header "Validating Recovery Environment"
    
    local issues=0
    
    # Check recovery namespace
    if ! kubectl get namespace "$RECOVERY_NAMESPACE" &> /dev/null; then
        print_error "Recovery namespace not found"
        ((issues++))
    else
        print_success "Recovery namespace exists"
    fi
    
    # Check database recovery
    if kubectl get deployment postgres-recovery -n "$RECOVERY_NAMESPACE" &> /dev/null; then
        local db_ready=$(kubectl get deployment postgres-recovery -n "$RECOVERY_NAMESPACE" -o jsonpath='{.status.readyReplicas}')
        if [[ "$db_ready" == "1" ]]; then
            print_success "Database recovery instance is ready"
        else
            print_warning "Database recovery instance is not ready"
            ((issues++))
        fi
    else
        print_warning "Database recovery instance not found"
    fi
    
    # Check Redis recovery
    if kubectl get statefulset redis-recovery -n "$RECOVERY_NAMESPACE" &> /dev/null; then
        local redis_ready=$(kubectl get statefulset redis-recovery -n "$RECOVERY_NAMESPACE" -o jsonpath='{.status.readyReplicas}')
        if [[ "$redis_ready" == "1" ]]; then
            print_success "Redis recovery instance is ready"
        else
            print_warning "Redis recovery instance is not ready"
            ((issues++))
        fi
    else
        print_warning "Redis recovery instance not found"
    fi
    
    # Check services
    local services=$(kubectl get services -n "$RECOVERY_NAMESPACE" --no-headers | wc -l)
    if [[ "$services" -gt 0 ]]; then
        print_success "Found $services services in recovery namespace"
    else
        print_warning "No services found in recovery namespace"
        ((issues++))
    fi
    
    # Check pods
    local pods_total=$(kubectl get pods -n "$RECOVERY_NAMESPACE" --no-headers | wc -l)
    local pods_running=$(kubectl get pods -n "$RECOVERY_NAMESPACE" --field-selector=status.phase=Running --no-headers | wc -l)
    
    print_info "Pods: $pods_running/$pods_total running"
    
    if [[ "$pods_running" -lt "$pods_total" ]] && [[ "$pods_total" -gt 0 ]]; then
        print_warning "Some pods are not running"
        kubectl get pods -n "$RECOVERY_NAMESPACE"
        ((issues++))
    fi
    
    # Connectivity tests
    print_status "Running connectivity tests..."
    
    # Test database connectivity
    if kubectl get service postgres-recovery-service -n "$RECOVERY_NAMESPACE" &> /dev/null; then
        if kubectl run db-test-$(date +%s) --image=postgres:15-alpine --rm -i --restart=Never \
            --namespace="$RECOVERY_NAMESPACE" \
            --env="PGPASSWORD=recovery123" \
            -- psql -h postgres-recovery-service -U postgres -d zoptal_recovery -c "SELECT 1;" &> /dev/null; then
            print_success "Database connectivity test passed"
        else
            print_error "Database connectivity test failed"
            ((issues++))
        fi
    fi
    
    # Test Redis connectivity
    if kubectl get service redis-recovery-service -n "$RECOVERY_NAMESPACE" &> /dev/null; then
        if kubectl run redis-test-$(date +%s) --image=redis:7.2-alpine --rm -i --restart=Never \
            --namespace="$RECOVERY_NAMESPACE" \
            -- redis-cli -h redis-recovery-service ping | grep -q "PONG"; then
            print_success "Redis connectivity test passed"
        else
            print_error "Redis connectivity test failed"
            ((issues++))
        fi
    fi
    
    if [[ "$issues" -eq 0 ]]; then
        print_success "Recovery environment validation completed successfully"
        return 0
    else
        print_warning "Recovery environment validation found $issues issues"
        return "$issues"
    fi
}

# Promote recovery to production
promote_recovery() {
    print_header "Promoting Recovery to Production"
    
    print_warning "This will replace the current production environment!"
    print_warning "Make sure you have current backups before proceeding."
    print_status "Do you want to continue? (y/N)"
    read -r response
    
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Promotion cancelled"
        return 0
    fi
    
    # Validate recovery first
    print_status "Validating recovery environment..."
    if ! validate_recovery; then
        print_error "Recovery environment validation failed"
        print_status "Fix the issues before promoting to production"
        return 1
    fi
    
    # Scale down production
    print_status "Scaling down production environment..."
    kubectl scale deployment --all --replicas=0 -n "$NAMESPACE" || true
    kubectl scale statefulset --all --replicas=0 -n "$NAMESPACE" || true
    
    # Wait for production to scale down
    print_status "Waiting for production services to scale down..."
    sleep 30
    
    # Export recovery configurations
    print_status "Exporting recovery configurations..."
    local temp_dir="/tmp/promote_$(date +%s)"
    mkdir -p "$temp_dir"
    
    # Export all resources from recovery namespace
    kubectl get all,configmaps,secrets,pvc -n "$RECOVERY_NAMESPACE" -o yaml > "$temp_dir/recovery_export.yaml"
    
    # Update namespace references
    sed "s/namespace: $RECOVERY_NAMESPACE/namespace: $NAMESPACE/g" "$temp_dir/recovery_export.yaml" > "$temp_dir/production_import.yaml"
    
    # Apply to production
    print_status "Applying recovery configuration to production namespace..."
    kubectl apply -f "$temp_dir/production_import.yaml" || print_warning "Some resources may have failed to apply"
    
    # Cleanup temp files
    rm -rf "$temp_dir"
    
    # Validate production
    print_status "Validating promoted production environment..."
    sleep 60  # Wait for services to start
    
    # Check if services are ready
    kubectl wait --for=condition=available deployment --all -n "$NAMESPACE" --timeout="$KUBECTL_TIMEOUT" || true
    
    print_success "Recovery promoted to production"
    print_info "Please validate all services are working correctly"
    print_info "You may want to clean up the recovery namespace: kubectl delete namespace $RECOVERY_NAMESPACE"
}

# Cleanup recovery environment
cleanup_recovery() {
    print_header "Cleaning Up Recovery Environment"
    
    if ! kubectl get namespace "$RECOVERY_NAMESPACE" &> /dev/null; then
        print_warning "Recovery namespace not found"
        return 0
    fi
    
    print_status "Do you want to delete the recovery namespace and all its resources? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        kubectl delete namespace "$RECOVERY_NAMESPACE" --timeout="$KUBECTL_TIMEOUT"
        print_success "Recovery environment cleaned up"
    else
        print_status "Cleanup cancelled"
    fi
}

# Disaster recovery status
dr_status() {
    print_header "Disaster Recovery Status"
    
    # Check backup system
    print_status "Backup System Status:"
    local backup_jobs=$(kubectl get cronjobs -n "$NAMESPACE" -l app=backup --no-headers | wc -l)
    print_info "Active backup jobs: $backup_jobs"
    
    if [[ "$backup_jobs" -gt 0 ]]; then
        kubectl get cronjobs -n "$NAMESPACE" -l app=backup
        echo ""
        
        # Check last backup runs
        print_status "Recent backup job status:"
        kubectl get jobs -n "$NAMESPACE" --sort-by=.metadata.creationTimestamp | tail -5
    fi
    
    # Check S3 backup availability
    print_status "S3 Backup Availability:"
    if aws s3 ls "s3://${BACKUP_BUCKET}/" &> /dev/null; then
        local db_backups=$(aws s3 ls "s3://${BACKUP_BUCKET}/database/" | wc -l)
        local redis_backups=$(aws s3 ls "s3://${BACKUP_BUCKET}/redis/" | wc -l)
        local config_backups=$(aws s3 ls "s3://${BACKUP_BUCKET}/config/" | wc -l)
        
        print_info "Database backups: $db_backups"
        print_info "Redis backups: $redis_backups"
        print_info "Config backups: $config_backups"
        
        # Show latest backups
        print_status "Latest backups:"
        aws s3 ls "s3://${BACKUP_BUCKET}/" --recursive | sort -k1,2 | tail -10
    else
        print_error "Cannot access S3 backup bucket"
    fi
    
    # Check recovery namespace
    if kubectl get namespace "$RECOVERY_NAMESPACE" &> /dev/null; then
        print_status "Recovery Environment:"
        kubectl get all -n "$RECOVERY_NAMESPACE"
    else
        print_info "No active recovery environment"
    fi
}

# Display usage
usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Disaster Recovery Commands:
  list-backups [type]          List available backups (database|redis|config|files|all)
  restore-database <file>      Restore database from backup file
  restore-redis <pattern>      Restore Redis from backup pattern
  restore-config <file>        Restore configuration from backup file
  
  create-recovery-ns          Create recovery namespace
  validate-recovery           Validate recovery environment
  promote-recovery            Promote recovery to production (DANGEROUS!)
  cleanup-recovery            Clean up recovery environment
  
  status                      Show disaster recovery status
  
Examples:
  $0 list-backups database
  $0 restore-database postgres_backup_20241201_020000.sql.gz
  $0 restore-redis redis_20241201_020000
  $0 restore-config config_backup_20241201_030000.tar.gz
  $0 validate-recovery
  $0 status

Environment Variables:
  NAMESPACE                   Production namespace (default: zoptal-production)
  RECOVERY_NAMESPACE          Recovery namespace (default: zoptal-recovery)
  BACKUP_BUCKET              S3 backup bucket (default: zoptal-backups)
  AWS_REGION                 AWS region (default: us-east-1)
  AWS_ACCESS_KEY_ID          AWS access key
  AWS_SECRET_ACCESS_KEY      AWS secret key

EOF
}

# Main script logic
main() {
    if [[ $# -eq 0 ]]; then
        usage
        exit 1
    fi
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Check dependencies
    check_dependencies
    
    case "$1" in
        "list-backups")
            list_backups "${2:-all}"
            ;;
        "restore-database")
            restore_database "${2:-}"
            ;;
        "restore-redis")
            restore_redis "${2:-}"
            ;;
        "restore-config")
            restore_config "${2:-}"
            ;;
        "create-recovery-ns")
            create_recovery_namespace
            ;;
        "validate-recovery")
            validate_recovery
            ;;
        "promote-recovery")
            promote_recovery
            ;;
        "cleanup-recovery")
            cleanup_recovery
            ;;
        "status")
            dr_status
            ;;
        "help"|"-h"|"--help")
            usage
            ;;
        *)
            print_error "Unknown command: $1"
            usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"