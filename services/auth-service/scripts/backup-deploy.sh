#!/bin/bash

# Automated Backup Deployment Script for Zoptal Auth Service
# This script sets up automated backups for production deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKUP_DIR="/var/backups/zoptal-auth"
S3_BUCKET="${S3_BACKUP_BUCKET:-zoptal-auth-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Default values
ENVIRONMENT="production"
ENABLE_S3=false
ENABLE_ENCRYPTION=true
SCHEDULE_CRON=false
VERBOSE=false

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Set up automated backups for Zoptal Auth Service

OPTIONS:
    -e, --environment ENV    Target environment (staging|production) [default: production]
    -s, --enable-s3         Enable S3 backup storage
    -n, --no-encryption     Disable backup encryption
    -c, --schedule-cron     Add backup job to crontab
    -r, --retention DAYS    Backup retention period in days [default: 30]
    -v, --verbose           Enable verbose output
    -h, --help              Show this help message

EXAMPLES:
    $0 --enable-s3 --schedule-cron           # Set up S3 backups with cron scheduling
    $0 -e staging --retention 7              # Set up staging backups with 7-day retention
    $0 --enable-s3 --no-encryption           # Set up unencrypted S3 backups

REQUIREMENTS:
    - Docker and docker-compose installed
    - PostgreSQL client tools (pg_dump)
    - Redis tools (redis-cli)
    - AWS CLI (if using S3)
    - GPG (if using encryption)

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--enable-s3)
            ENABLE_S3=true
            shift
            ;;
        -n|--no-encryption)
            ENABLE_ENCRYPTION=false
            shift
            ;;
        -c|--schedule-cron)
            SCHEDULE_CRON=true
            shift
            ;;
        -r|--retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Must be staging or production"
fi

# Set verbose mode
if [ "$VERBOSE" = true ]; then
    set -x
fi

log "Setting up automated backups for $ENVIRONMENT environment..."

# Create backup directory
sudo mkdir -p "$BACKUP_DIR"
sudo chown $(whoami):$(whoami) "$BACKUP_DIR"

# Check dependencies
log "Checking dependencies..."

if ! command -v docker &> /dev/null; then
    error "Docker is not installed"
fi

if ! command -v pg_dump &> /dev/null; then
    warning "pg_dump not found. Installing PostgreSQL client tools..."
    sudo apt-get update && sudo apt-get install -y postgresql-client || brew install postgresql
fi

if ! command -v redis-cli &> /dev/null; then
    warning "redis-cli not found. Installing Redis tools..."
    sudo apt-get install -y redis-tools || brew install redis
fi

if [ "$ENABLE_S3" = true ] && ! command -v aws &> /dev/null; then
    error "AWS CLI is not installed. Install with: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install"
fi

if [ "$ENABLE_ENCRYPTION" = true ] && ! command -v gpg &> /dev/null; then
    warning "GPG not found. Installing..."
    sudo apt-get install -y gnupg || brew install gnupg
fi

success "Dependencies checked"

# Generate backup script
log "Creating backup script..."

cat > "$BACKUP_DIR/backup.sh" << 'EOF'
#!/bin/bash

# Zoptal Auth Service Backup Script
# Generated automatically by backup-deploy.sh

set -e

# Configuration from environment or defaults
BACKUP_DIR="${BACKUP_DIR:-/var/backups/zoptal-auth}"
S3_BUCKET="${S3_BACKUP_BUCKET:-zoptal-auth-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
ENABLE_S3="${ENABLE_S3_BACKUP:-false}"
ENABLE_ENCRYPTION="${ENABLE_BACKUP_ENCRYPTION:-true}"
GPG_RECIPIENT="${BACKUP_GPG_RECIPIENT:-ops@zoptal.com}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PREFIX="zoptal-auth-backup-${TIMESTAMP}"

log "Starting backup process..."

# Create backup directory for this run
BACKUP_RUN_DIR="$BACKUP_DIR/$BACKUP_PREFIX"
mkdir -p "$BACKUP_RUN_DIR"

# Backup PostgreSQL database
log "Backing up PostgreSQL database..."
if docker ps --format "table {{.Names}}" | grep -q postgres; then
    docker exec $(docker ps --format "table {{.Names}}" | grep postgres | head -1) pg_dump -U postgres -d zoptal_auth > "$BACKUP_RUN_DIR/database.sql"
    success "Database backup completed"
else
    error "PostgreSQL container not found"
fi

# Backup Redis data
log "Backing up Redis data..."
if docker ps --format "table {{.Names}}" | grep -q redis; then
    docker exec $(docker ps --format "table {{.Names}}" | grep redis | head -1) redis-cli BGSAVE
    sleep 5  # Wait for background save to complete
    docker cp $(docker ps --format "table {{.Names}}" | grep redis | head -1):/data/dump.rdb "$BACKUP_RUN_DIR/redis-dump.rdb"
    success "Redis backup completed"
else
    error "Redis container not found"
fi

# Backup application uploads (avatars, etc.)
log "Backing up application uploads..."
if [ -d "/app/uploads" ]; then
    cp -r /app/uploads "$BACKUP_RUN_DIR/"
    success "Uploads backup completed"
else
    warning "Uploads directory not found, skipping"
fi

# Backup environment configuration (without secrets)
log "Backing up configuration..."
echo "# Backup created on $(date)" > "$BACKUP_RUN_DIR/backup-info.txt"
echo "Environment: ${ENVIRONMENT:-unknown}" >> "$BACKUP_RUN_DIR/backup-info.txt"
echo "Backup Type: Full" >> "$BACKUP_RUN_DIR/backup-info.txt"
echo "Timestamp: $TIMESTAMP" >> "$BACKUP_RUN_DIR/backup-info.txt"

# Create archive
log "Creating backup archive..."
cd "$BACKUP_DIR"
tar -czf "${BACKUP_PREFIX}.tar.gz" "$BACKUP_PREFIX"

# Encrypt if enabled
if [ "$ENABLE_ENCRYPTION" = true ]; then
    log "Encrypting backup..."
    gpg --trust-model always --encrypt -r "$GPG_RECIPIENT" "${BACKUP_PREFIX}.tar.gz"
    rm "${BACKUP_PREFIX}.tar.gz"
    BACKUP_FILE="${BACKUP_PREFIX}.tar.gz.gpg"
else
    BACKUP_FILE="${BACKUP_PREFIX}.tar.gz"
fi

# Clean up temporary directory
rm -rf "$BACKUP_PREFIX"

# Upload to S3 if enabled
if [ "$ENABLE_S3" = true ]; then
    log "Uploading to S3..."
    aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/backups/$BACKUP_FILE" --storage-class STANDARD_IA
    success "Backup uploaded to S3"
fi

# Clean up old backups
log "Cleaning up old backups..."
find "$BACKUP_DIR" -name "zoptal-auth-backup-*.tar.gz*" -mtime +$RETENTION_DAYS -delete

if [ "$ENABLE_S3" = true ]; then
    # Clean up old S3 backups
    CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
    aws s3 ls "s3://$S3_BUCKET/backups/" | while read -r line; do
        BACKUP_DATE=$(echo $line | awk '{print $1}')
        BACKUP_NAME=$(echo $line | awk '{print $4}')
        if [[ "$BACKUP_DATE" < "$CUTOFF_DATE" ]]; then
            aws s3 rm "s3://$S3_BUCKET/backups/$BACKUP_NAME"
        fi
    done
fi

success "Backup process completed: $BACKUP_FILE"

# Send notification (if webhook URL is configured)
if [ -n "$BACKUP_WEBHOOK_URL" ]; then
    curl -X POST "$BACKUP_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"Zoptal Auth Service backup completed successfully\", \"file\": \"$BACKUP_FILE\", \"timestamp\": \"$(date -Iseconds)\"}" \
        || warning "Failed to send backup notification"
fi
EOF

# Make backup script executable
chmod +x "$BACKUP_DIR/backup.sh"

# Set environment variables in the backup script
sed -i "s|BACKUP_DIR=.*|BACKUP_DIR=\"$BACKUP_DIR\"|" "$BACKUP_DIR/backup.sh"
sed -i "s|RETENTION_DAYS=.*|RETENTION_DAYS=\"$RETENTION_DAYS\"|" "$BACKUP_DIR/backup.sh"
sed -i "s|ENABLE_S3=.*|ENABLE_S3=\"$ENABLE_S3\"|" "$BACKUP_DIR/backup.sh"
sed -i "s|ENABLE_ENCRYPTION=.*|ENABLE_ENCRYPTION=\"$ENABLE_ENCRYPTION\"|" "$BACKUP_DIR/backup.sh"

success "Backup script created at $BACKUP_DIR/backup.sh"

# Create restore script
log "Creating restore script..."

cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash

# Zoptal Auth Service Restore Script

set -e

BACKUP_FILE="$1"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/zoptal-auth}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    echo "Available backups:"
    ls -la "$BACKUP_DIR"/zoptal-auth-backup-*.tar.gz* | tail -10
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will replace current data with backup data!"
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

RESTORE_DIR="/tmp/zoptal-restore-$(date +%s)"
mkdir -p "$RESTORE_DIR"

echo "Extracting backup..."
if [[ "$BACKUP_FILE" == *.gpg ]]; then
    gpg --decrypt "$BACKUP_FILE" | tar -xz -C "$RESTORE_DIR"
else
    tar -xz -f "$BACKUP_FILE" -C "$RESTORE_DIR"
fi

BACKUP_NAME=$(basename "$BACKUP_FILE" .tar.gz)
BACKUP_NAME=$(basename "$BACKUP_NAME" .gpg)

# Restore database
echo "Restoring database..."
if [ -f "$RESTORE_DIR/$BACKUP_NAME/database.sql" ]; then
    docker exec -i $(docker ps --format "table {{.Names}}" | grep postgres | head -1) psql -U postgres -d zoptal_auth < "$RESTORE_DIR/$BACKUP_NAME/database.sql"
    echo "Database restored"
fi

# Restore Redis
echo "Restoring Redis..."
if [ -f "$RESTORE_DIR/$BACKUP_NAME/redis-dump.rdb" ]; then
    docker cp "$RESTORE_DIR/$BACKUP_NAME/redis-dump.rdb" $(docker ps --format "table {{.Names}}" | grep redis | head -1):/data/dump.rdb
    docker restart $(docker ps --format "table {{.Names}}" | grep redis | head -1)
    echo "Redis restored"
fi

# Restore uploads
echo "Restoring uploads..."
if [ -d "$RESTORE_DIR/$BACKUP_NAME/uploads" ]; then
    docker cp "$RESTORE_DIR/$BACKUP_NAME/uploads/." $(docker ps --format "table {{.Names}}" | grep auth-service | head -1):/app/uploads/
    echo "Uploads restored"
fi

# Clean up
rm -rf "$RESTORE_DIR"

echo "Restore completed successfully!"
EOF

chmod +x "$BACKUP_DIR/restore.sh"

success "Restore script created at $BACKUP_DIR/restore.sh"

# Set up S3 bucket if enabled
if [ "$ENABLE_S3" = true ]; then
    log "Setting up S3 bucket..."
    
    if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
        aws s3 mb "s3://$S3_BUCKET"
        
        # Configure lifecycle policy
        cat > /tmp/lifecycle.json << EOF
{
    "Rules": [
        {
            "ID": "ZoptalAuthBackupLifecycle",
            "Status": "Enabled",
            "Filter": {
                "Prefix": "backups/"
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "GLACIER"
                },
                {
                    "Days": 90,
                    "StorageClass": "DEEP_ARCHIVE"
                }
            ],
            "Expiration": {
                "Days": 2555
            }
        }
    ]
}
EOF
        
        aws s3api put-bucket-lifecycle-configuration --bucket "$S3_BUCKET" --lifecycle-configuration file:///tmp/lifecycle.json
        rm /tmp/lifecycle.json
        
        success "S3 bucket configured with lifecycle policy"
    else
        success "S3 bucket already exists"
    fi
fi

# Generate GPG key if encryption is enabled and no key exists
if [ "$ENABLE_ENCRYPTION" = true ]; then
    log "Checking GPG key..."
    
    if ! gpg --list-keys ops@zoptal.com &> /dev/null; then
        warning "GPG key not found. Generating new key..."
        
        cat > /tmp/gpg-key-config << EOF
%echo Generating GPG key for Zoptal Auth backups
Key-Type: RSA
Key-Length: 4096
Subkey-Type: RSA
Subkey-Length: 4096
Name-Real: Zoptal Auth Backup
Name-Email: ops@zoptal.com
Expire-Date: 2y
Passphrase: 
%commit
%echo GPG key generation complete
EOF
        
        gpg --batch --generate-key /tmp/gpg-key-config
        rm /tmp/gpg-key-config
        
        success "GPG key generated"
    else
        success "GPG key already exists"
    fi
fi

# Schedule cron job if requested
if [ "$SCHEDULE_CRON" = true ]; then
    log "Setting up cron job..."
    
    # Backup at 2 AM daily
    CRON_SCHEDULE="0 2 * * *"
    CRON_COMMAND="$BACKUP_DIR/backup.sh >> $BACKUP_DIR/backup.log 2>&1"
    
    # Add to crontab if not already present
    if ! crontab -l 2>/dev/null | grep -q "$BACKUP_DIR/backup.sh"; then
        (crontab -l 2>/dev/null; echo "$CRON_SCHEDULE $CRON_COMMAND") | crontab -
        success "Cron job scheduled: $CRON_SCHEDULE"
    else
        success "Cron job already exists"
    fi
fi

# Create systemd service for backup monitoring
log "Creating systemd service for backup monitoring..."

sudo tee /etc/systemd/system/zoptal-backup-monitor.service > /dev/null << EOF
[Unit]
Description=Zoptal Auth Service Backup Monitor
After=network.target

[Service]
Type=oneshot
ExecStart=$BACKUP_DIR/backup.sh
User=$(whoami)
Group=$(whoami)
WorkingDirectory=$BACKUP_DIR

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/zoptal-backup-monitor.timer > /dev/null << EOF
[Unit]
Description=Run Zoptal Auth Service Backup Daily
Requires=zoptal-backup-monitor.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable zoptal-backup-monitor.timer

success "Systemd timer created and enabled"

# Test backup
log "Running test backup..."
if "$BACKUP_DIR/backup.sh"; then
    success "Test backup completed successfully"
else
    error "Test backup failed"
fi

# Summary
log "Backup deployment summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Backup directory: $BACKUP_DIR"
echo "  S3 enabled: $ENABLE_S3"
echo "  Encryption enabled: $ENABLE_ENCRYPTION"
echo "  Retention days: $RETENTION_DAYS"
echo "  Cron scheduled: $SCHEDULE_CRON"
echo ""
echo "📝 Useful commands:"
echo "  Manual backup: $BACKUP_DIR/backup.sh"
echo "  Restore backup: $BACKUP_DIR/restore.sh <backup-file>"
echo "  View backup logs: tail -f $BACKUP_DIR/backup.log"
echo "  List backups: ls -la $BACKUP_DIR/zoptal-auth-backup-*"
if [ "$ENABLE_S3" = true ]; then
    echo "  List S3 backups: aws s3 ls s3://$S3_BUCKET/backups/"
fi

success "Backup deployment completed! 🚀"