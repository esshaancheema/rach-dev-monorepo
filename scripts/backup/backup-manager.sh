#!/bin/bash

# Database Backup Manager for Zoptal Platform
# Provides comprehensive backup and recovery management

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
CONFIG_FILE="${CONFIG_FILE:-$PROJECT_ROOT/.backup-config}"
NAMESPACE="${NAMESPACE:-zoptal-production}"

# Default configuration
DEFAULT_RETENTION_DAYS=30
DEFAULT_S3_BUCKET="zoptal-db-backups"
DEFAULT_POSTGRES_HOST="localhost"
DEFAULT_POSTGRES_PORT="5432"
DEFAULT_REDIS_HOST="localhost"
DEFAULT_REDIS_PORT="6379"

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

print_header() {
    echo -e "${PURPLE}=== $1 ===${NC}"
}

# Function to load configuration
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
        print_status "Configuration loaded from $CONFIG_FILE"
    else
        print_warning "No configuration file found, using defaults"
        
        # Create default configuration
        cat > "$CONFIG_FILE" << EOF
# Zoptal Backup Configuration
# Database settings
POSTGRES_HOST=${DEFAULT_POSTGRES_HOST}
POSTGRES_PORT=${DEFAULT_POSTGRES_PORT}
POSTGRES_USER=postgres
POSTGRES_DB=zoptal
REDIS_HOST=${DEFAULT_REDIS_HOST}
REDIS_PORT=${DEFAULT_REDIS_PORT}

# Backup settings
RETENTION_DAYS=${DEFAULT_RETENTION_DAYS}
S3_BUCKET=${DEFAULT_S3_BUCKET}
AWS_REGION=us-east-1

# Notification settings
SLACK_WEBHOOK_URL=""
EMAIL_RECIPIENTS=""

# Databases to backup
BACKUP_DATABASES="zoptal zoptal_auth zoptal_projects zoptal_billing"
EOF
        print_status "Default configuration created at $CONFIG_FILE"
    fi
}

# Function to check dependencies
check_dependencies() {
    print_header "Checking Dependencies"
    
    local missing_tools=()
    local tools=("pg_dump" "pg_restore" "redis-cli" "kubectl" "aws")
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_status "Please install missing tools before proceeding"
        return 1
    fi
    
    print_success "All dependencies are available"
}

# Function to setup backup environment
setup_backup_env() {
    print_header "Setting Up Backup Environment"
    
    # Create backup directories
    mkdir -p "$BACKUP_DIR"/{postgres,redis,logs,temp}
    
    # Set proper permissions
    chmod 750 "$BACKUP_DIR"
    
    print_success "Backup environment ready at $BACKUP_DIR"
}

# Function to perform PostgreSQL backup
backup_postgres() {
    local db_name=${1:-$POSTGRES_DB}
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/postgres/${db_name}_${timestamp}"
    
    print_status "Starting PostgreSQL backup for database: $db_name"
    
    # Set password if provided
    if [ -n "${POSTGRES_PASSWORD:-}" ]; then
        export PGPASSWORD="$POSTGRES_PASSWORD"
    fi
    
    # Create custom format backup (recommended for large databases)
    print_status "Creating custom format backup..."
    if pg_dump \
        --host="$POSTGRES_HOST" \
        --port="$POSTGRES_PORT" \
        --username="$POSTGRES_USER" \
        --dbname="$db_name" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=custom \
        --compress=9 \
        --file="${backup_file}.dump"; then
        
        print_success "Custom format backup created: ${backup_file}.dump"
    else
        print_error "Failed to create custom format backup"
        return 1
    fi
    
    # Create SQL format backup for compatibility
    print_status "Creating SQL format backup..."
    if pg_dump \
        --host="$POSTGRES_HOST" \
        --port="$POSTGRES_PORT" \
        --username="$POSTGRES_USER" \
        --dbname="$db_name" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --file="${backup_file}.sql"; then
        
        # Compress SQL backup
        gzip "${backup_file}.sql"
        print_success "SQL format backup created: ${backup_file}.sql.gz"
    else
        print_error "Failed to create SQL format backup"
        return 1
    fi
    
    # Verify backup integrity
    if verify_postgres_backup "${backup_file}.dump"; then
        print_success "Backup verification successful"
    else
        print_error "Backup verification failed"
        return 1
    fi
    
    # Upload to S3 if configured
    if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "$S3_BUCKET" ]; then
        upload_to_s3 "${backup_file}.dump" "postgres/$db_name/"
        upload_to_s3 "${backup_file}.sql.gz" "postgres/$db_name/"
    fi
    
    print_success "PostgreSQL backup completed for $db_name"
}

# Function to verify PostgreSQL backup
verify_postgres_backup() {
    local backup_file=$1
    
    print_status "Verifying backup: $(basename $backup_file)"
    
    # Check if file exists and is not empty
    if [ ! -s "$backup_file" ]; then
        print_error "Backup file is empty or doesn't exist"
        return 1
    fi
    
    # Verify dump file integrity
    if pg_restore --list "$backup_file" > /dev/null 2>&1; then
        local table_count=$(pg_restore --list "$backup_file" | grep -c "TABLE DATA" || echo "0")
        print_status "Backup contains $table_count tables"
        return 0
    else
        print_error "Backup file is corrupted"
        return 1
    fi
}

# Function to restore PostgreSQL database
restore_postgres() {
    local db_name=$1
    local backup_file=${2:-""}
    local target_db=${3:-$db_name}
    
    print_header "PostgreSQL Database Restore"
    print_status "Source database: $db_name"
    print_status "Target database: $target_db"
    print_status "Backup file: $backup_file"
    
    # If no backup file specified, use the latest
    if [ -z "$backup_file" ]; then
        backup_file=$(find "$BACKUP_DIR/postgres" -name "${db_name}_*.dump" | sort -r | head -1)
        if [ -z "$backup_file" ]; then
            print_error "No backup files found for database $db_name"
            return 1
        fi
        print_status "Using latest backup: $(basename $backup_file)"
    fi
    
    # Verify backup before restore
    if ! verify_postgres_backup "$backup_file"; then
        print_error "Backup verification failed, aborting restore"
        return 1
    fi
    
    # Ask for confirmation
    read -p "Are you sure you want to restore $target_db? This will overwrite existing data. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        return 0
    fi
    
    # Set password if provided
    if [ -n "${POSTGRES_PASSWORD:-}" ]; then
        export PGPASSWORD="$POSTGRES_PASSWORD"
    fi
    
    # Perform restore
    print_status "Starting database restore..."
    if pg_restore \
        --host="$POSTGRES_HOST" \
        --port="$POSTGRES_PORT" \
        --username="$POSTGRES_USER" \
        --dbname="$target_db" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --exit-on-error \
        "$backup_file"; then
        
        print_success "Database restore completed successfully"
        
        # Send notification
        send_notification "Database restore completed" "Successfully restored $target_db from backup"
    else
        print_error "Database restore failed"
        send_notification "Database restore failed" "Failed to restore $target_db from backup"
        return 1
    fi
}

# Function to backup Redis
backup_redis() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/redis/redis_${timestamp}.rdb"
    
    print_status "Starting Redis backup"
    
    # Create Redis backup using BGSAVE
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" --rdb "$backup_file"; then
        print_success "Redis backup created: $(basename $backup_file)"
        
        # Compress backup
        gzip "$backup_file"
        print_success "Redis backup compressed: $(basename $backup_file).gz"
        
        # Upload to S3 if configured
        if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "$S3_BUCKET" ]; then
            upload_to_s3 "${backup_file}.gz" "redis/"
        fi
        
        return 0
    else
        print_error "Redis backup failed"
        return 1
    fi
}

# Function to restore Redis
restore_redis() {
    local backup_file=${1:-""}
    
    print_header "Redis Database Restore"
    
    # If no backup file specified, use the latest
    if [ -z "$backup_file" ]; then
        backup_file=$(find "$BACKUP_DIR/redis" -name "redis_*.rdb.gz" | sort -r | head -1)
        if [ -z "$backup_file" ]; then
            print_error "No Redis backup files found"
            return 1
        fi
        print_status "Using latest backup: $(basename $backup_file)"
    fi
    
    # Ask for confirmation
    read -p "Are you sure you want to restore Redis? This will overwrite existing data. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        return 0
    fi
    
    # Stop Redis (if running locally)
    if pgrep redis-server > /dev/null; then
        print_status "Stopping Redis server..."
        pkill redis-server || true
        sleep 2
    fi
    
    # Extract and restore backup
    print_status "Restoring Redis backup..."
    local temp_file="$BACKUP_DIR/temp/dump.rdb"
    
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" > "$temp_file"
    else
        cp "$backup_file" "$temp_file"
    fi
    
    # Move backup to Redis data directory
    # Note: This assumes Redis is configured to use /var/lib/redis
    local redis_data_dir="/var/lib/redis"
    if [ -w "$redis_data_dir" ]; then
        cp "$temp_file" "$redis_data_dir/dump.rdb"
        chown redis:redis "$redis_data_dir/dump.rdb" 2>/dev/null || true
    else
        print_warning "Cannot write to Redis data directory: $redis_data_dir"
        print_status "Please manually copy $temp_file to your Redis data directory"
    fi
    
    # Start Redis
    print_status "Starting Redis server..."
    redis-server --daemonize yes || true
    
    print_success "Redis restore completed"
}

# Function to upload files to S3
upload_to_s3() {
    local file_path=$1
    local s3_prefix=$2
    local s3_key="${s3_prefix}$(basename $file_path)"
    
    print_status "Uploading to S3: s3://$S3_BUCKET/$s3_key"
    
    if aws s3 cp "$file_path" "s3://$S3_BUCKET/$s3_key" \
        --region "$AWS_REGION" \
        --storage-class STANDARD_IA; then
        print_success "Upload completed"
    else
        print_error "S3 upload failed"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    local retention_days=${1:-$RETENTION_DAYS}
    
    print_header "Cleaning Up Old Backups"
    print_status "Removing backups older than $retention_days days"
    
    # Local cleanup
    local deleted_count=0
    
    # PostgreSQL backups
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR/postgres" -name "*.dump" -o -name "*.sql.gz" -mtime +$retention_days -print0)
    
    # Redis backups
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR/redis" -name "*.rdb.gz" -mtime +$retention_days -print0)
    
    print_status "Deleted $deleted_count local backup files"
    
    # S3 cleanup if configured
    if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "$S3_BUCKET" ]; then
        print_status "Cleaning up S3 backups..."
        
        local cutoff_date=$(date -d "$retention_days days ago" --iso-8601)
        
        # Get list of old objects and delete them
        aws s3api list-objects-v2 \
            --bucket "$S3_BUCKET" \
            --query "Contents[?LastModified<='$cutoff_date'].Key" \
            --output text | \
        while read -r key; do
            if [ -n "$key" ]; then
                aws s3 rm "s3://$S3_BUCKET/$key"
                print_status "Deleted S3 object: $key"
            fi
        done
    fi
    
    print_success "Backup cleanup completed"
}

# Function to list available backups
list_backups() {
    local service=${1:-"all"}
    
    print_header "Available Backups"
    
    case $service in
        "postgres"|"pg")
            print_status "PostgreSQL Backups:"
            find "$BACKUP_DIR/postgres" -name "*.dump" -o -name "*.sql.gz" | sort -r | while read -r file; do
                local size=$(du -h "$file" | cut -f1)
                local date=$(date -r "$file" '+%Y-%m-%d %H:%M:%S')
                printf "  %-50s %8s %s\n" "$(basename $file)" "$size" "$date"
            done
            ;;
        "redis")
            print_status "Redis Backups:"
            find "$BACKUP_DIR/redis" -name "*.rdb.gz" | sort -r | while read -r file; do
                local size=$(du -h "$file" | cut -f1)
                local date=$(date -r "$file" '+%Y-%m-%d %H:%M:%S')
                printf "  %-50s %8s %s\n" "$(basename $file)" "$size" "$date"
            done
            ;;
        "all"|*)
            list_backups "postgres"
            echo
            list_backups "redis"
            ;;
    esac
    
    # Also show S3 backups if configured
    if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "$S3_BUCKET" ]; then
        echo
        print_status "S3 Backups:"
        aws s3 ls "s3://$S3_BUCKET/" --recursive --human-readable --summarize
    fi
}

# Function to send notifications
send_notification() {
    local subject=$1
    local message=$2
    
    # Slack notification
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"🔄 **$subject**\n$message\"}" \
            > /dev/null 2>&1 || true
    fi
    
    # Email notification (if sendmail is available)
    if [ -n "${EMAIL_RECIPIENTS:-}" ] && command -v sendmail &> /dev/null; then
        {
            echo "Subject: Zoptal Backup: $subject"
            echo "To: $EMAIL_RECIPIENTS"
            echo ""
            echo "$message"
            echo ""
            echo "Timestamp: $(date)"
            echo "Host: $(hostname)"
        } | sendmail "$EMAIL_RECIPIENTS" || true
    fi
}

# Function to check backup health
check_backup_health() {
    print_header "Backup Health Check"
    
    local health_status="healthy"
    local issues=()
    
    # Check if backups exist
    local postgres_backups=$(find "$BACKUP_DIR/postgres" -name "*.dump" -mtime -1 | wc -l)
    local redis_backups=$(find "$BACKUP_DIR/redis" -name "*.rdb.gz" -mtime -1 | wc -l)
    
    if [ "$postgres_backups" -eq 0 ]; then
        health_status="unhealthy"
        issues+=("No PostgreSQL backups found in the last 24 hours")
    else
        print_success "PostgreSQL: $postgres_backups recent backup(s) found"
    fi
    
    if [ "$redis_backups" -eq 0 ]; then
        health_status="unhealthy"
        issues+=("No Redis backups found in the last 24 hours")
    else
        print_success "Redis: $redis_backups recent backup(s) found"
    fi
    
    # Check disk usage
    local backup_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    local disk_usage=$(df "$BACKUP_DIR" | awk 'NR==2{print $5}' | sed 's/%//')
    
    print_status "Backup directory size: $backup_size"
    print_status "Disk usage: $disk_usage%"
    
    if [ "$disk_usage" -gt 90 ]; then
        health_status="unhealthy"
        issues+=("Disk usage is above 90%: $disk_usage%")
    fi
    
    # Check S3 connectivity if configured
    if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "$S3_BUCKET" ]; then
        if aws s3 ls "s3://$S3_BUCKET/" > /dev/null 2>&1; then
            print_success "S3 connectivity: OK"
        else
            health_status="unhealthy"
            issues+=("Cannot connect to S3 bucket: $S3_BUCKET")
        fi
    fi
    
    # Report health status
    if [ "$health_status" = "healthy" ]; then
        print_success "Backup system is healthy"
    else
        print_error "Backup system issues detected:"
        for issue in "${issues[@]}"; do
            print_error "  - $issue"
        done
        
        # Send alert notification
        send_notification "Backup Health Alert" "Issues detected: $(IFS='; '; echo "${issues[*]}")"
    fi
}

# Function to run automated backup
run_backup() {
    local backup_type=${1:-"all"}
    
    print_header "Running Automated Backup"
    
    local start_time=$(date +%s)
    local success=true
    
    case $backup_type in
        "postgres"|"pg")
            for db in $BACKUP_DATABASES; do
                if ! backup_postgres "$db"; then
                    success=false
                fi
            done
            ;;
        "redis")
            if ! backup_redis; then
                success=false
            fi
            ;;
        "all"|*)
            # Backup PostgreSQL databases
            for db in $BACKUP_DATABASES; do
                if ! backup_postgres "$db"; then
                    success=false
                fi
            done
            
            # Backup Redis
            if ! backup_redis; then
                success=false
            fi
            ;;
    esac
    
    # Cleanup old backups
    cleanup_old_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ "$success" = true ]; then
        print_success "Backup completed successfully in ${duration}s"
        send_notification "Backup Completed" "All backups completed successfully in ${duration}s"
    else
        print_error "Backup completed with errors in ${duration}s"
        send_notification "Backup Failed" "Some backups failed. Please check logs."
    fi
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 <command> [options]

Commands:
  backup [postgres|redis|all]    - Create database backups
  restore <type> [file] [target] - Restore database from backup
  list [postgres|redis|all]      - List available backups
  cleanup [days]                  - Clean up old backups
  health                          - Check backup system health
  config                          - Show current configuration
  init                            - Initialize backup environment

Examples:
  $0 backup all                   - Backup all databases
  $0 backup postgres              - Backup PostgreSQL only
  $0 restore postgres zoptal      - Restore zoptal database from latest backup
  $0 restore redis backup.rdb.gz - Restore Redis from specific backup
  $0 list                         - List all available backups
  $0 cleanup 7                    - Remove backups older than 7 days
  $0 health                       - Check backup system status

Configuration:
The script uses configuration from: $CONFIG_FILE
Edit this file to customize backup settings.

EOF
}

# Main function
main() {
    local command=${1:-"help"}
    
    # Load configuration
    load_config
    
    case $command in
        "backup")
            check_dependencies
            setup_backup_env
            run_backup "${2:-all}"
            ;;
        "restore")
            local restore_type=${2:-}
            local backup_file=${3:-}
            local target_db=${4:-}
            
            if [ -z "$restore_type" ]; then
                print_error "Please specify restore type (postgres|redis)"
                show_usage
                exit 1
            fi
            
            check_dependencies
            
            case $restore_type in
                "postgres"|"pg")
                    if [ -z "$backup_file" ]; then
                        print_error "Please specify database name to restore"
                        exit 1
                    fi
                    restore_postgres "$backup_file" "" "$target_db"
                    ;;
                "redis")
                    restore_redis "$backup_file"
                    ;;
                *)
                    print_error "Invalid restore type: $restore_type"
                    exit 1
                    ;;
            esac
            ;;
        "list")
            list_backups "${2:-all}"
            ;;
        "cleanup")
            cleanup_old_backups "${2:-$RETENTION_DAYS}"
            ;;
        "health")
            check_backup_health
            ;;
        "config")
            print_header "Current Configuration"
            cat "$CONFIG_FILE"
            ;;
        "init")
            check_dependencies
            setup_backup_env
            print_success "Backup environment initialized"
            ;;
        "help"|"-h"|"--help")
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"