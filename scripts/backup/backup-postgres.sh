#!/bin/bash
# backup-postgres.sh - PostgreSQL backup script with encryption and S3 upload

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-postgres-service}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-zoptal}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"
BACKUP_DIR="/backups/postgres"
S3_BUCKET="${BACKUP_S3_BUCKET:-zoptal-backups}"
S3_REGION="${AWS_REGION:-us-east-1}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="postgres_${DB_NAME}_${DATE}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [PostgreSQL] $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if pg_dump is available
    if ! command -v pg_dump &> /dev/null; then
        log "ERROR: pg_dump not found"
        exit 1
    fi
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log "ERROR: AWS CLI not found"
        exit 1
    fi
    
    # Check database connectivity
    PGPASSWORD=${DB_PASSWORD} pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} || {
        log "ERROR: Cannot connect to PostgreSQL"
        exit 1
    }
}

# Perform backup
perform_backup() {
    log "Starting PostgreSQL backup for ${DB_NAME}..."
    
    # Get database size
    DB_SIZE=$(PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT pg_size_pretty(pg_database_size('${DB_NAME}'));")
    log "Database size: ${DB_SIZE}"
    
    # Create backup with progress
    PGPASSWORD=${DB_PASSWORD} pg_dump \
        -h ${DB_HOST} \
        -p ${DB_PORT} \
        -U ${DB_USER} \
        -d ${DB_NAME} \
        --verbose \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        --format=custom \
        --compress=9 \
        --file=${BACKUP_DIR}/${BACKUP_FILE}.dump \
        2>&1 | while read line; do
            log "$line"
        done
    
    # Verify backup
    if [ ! -f ${BACKUP_DIR}/${BACKUP_FILE}.dump ]; then
        log "ERROR: Backup file not created"
        exit 1
    fi
    
    BACKUP_SIZE=$(du -h ${BACKUP_DIR}/${BACKUP_FILE}.dump | cut -f1)
    log "Backup completed. Size: ${BACKUP_SIZE}"
}

# Encrypt backup
encrypt_backup() {
    log "Encrypting backup..."
    
    openssl enc -aes-256-cbc \
        -salt \
        -pbkdf2 \
        -in ${BACKUP_DIR}/${BACKUP_FILE}.dump \
        -out ${BACKUP_DIR}/${BACKUP_FILE}.dump.enc \
        -k "${ENCRYPTION_KEY}"
    
    # Verify encryption
    if [ ! -f ${BACKUP_DIR}/${BACKUP_FILE}.dump.enc ]; then
        log "ERROR: Encrypted file not created"
        exit 1
    fi
    
    # Remove unencrypted file
    rm -f ${BACKUP_DIR}/${BACKUP_FILE}.dump
    
    log "Encryption completed"
}

# Upload to S3
upload_to_s3() {
    log "Uploading to S3..."
    
    # Upload to standard storage
    aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.dump.enc \
        s3://${S3_BUCKET}/postgres/${BACKUP_FILE}.dump.enc \
        --storage-class STANDARD_IA \
        --metadata "backup-date=${DATE},db-name=${DB_NAME},encrypted=true" \
        --region ${S3_REGION}
    
    # Create a copy in Glacier for long-term storage
    if [ "${ENABLE_GLACIER:-true}" == "true" ]; then
        log "Creating Glacier archive..."
        aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.dump.enc \
            s3://${S3_BUCKET}-glacier/postgres/${BACKUP_FILE}.dump.enc \
            --storage-class GLACIER \
            --region ${S3_REGION}
    fi
    
    log "Upload completed"
}

# Create backup metadata
create_metadata() {
    log "Creating backup metadata..."
    
    cat > ${BACKUP_DIR}/${BACKUP_FILE}.json <<EOF
{
    "backup_date": "${DATE}",
    "database_name": "${DB_NAME}",
    "database_host": "${DB_HOST}",
    "backup_size": "$(du -b ${BACKUP_DIR}/${BACKUP_FILE}.dump.enc | cut -f1)",
    "encrypted": true,
    "compression": "gzip-9",
    "format": "custom",
    "pg_version": "$(PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -t -c 'SELECT version();' | head -1)",
    "retention_days": ${RETENTION_DAYS},
    "s3_location": "s3://${S3_BUCKET}/postgres/${BACKUP_FILE}.dump.enc"
}
EOF
    
    # Upload metadata
    aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.json \
        s3://${S3_BUCKET}/postgres/metadata/${BACKUP_FILE}.json \
        --region ${S3_REGION}
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Local cleanup
    find ${BACKUP_DIR} -name "*.dump.enc" -mtime +7 -delete
    find ${BACKUP_DIR} -name "*.json" -mtime +7 -delete
    
    # S3 lifecycle policy handles S3 cleanup
    # But we can list old backups for monitoring
    OLD_BACKUPS=$(aws s3 ls s3://${S3_BUCKET}/postgres/ \
        --region ${S3_REGION} | \
        awk '{print $4}' | \
        grep -E "postgres_.*_[0-9]{8}" | \
        sort | \
        head -n -${RETENTION_DAYS} || true)
    
    if [ -n "${OLD_BACKUPS}" ]; then
        log "Found old backups to be cleaned by lifecycle policy:"
        echo "${OLD_BACKUPS}"
    fi
}

# Update metrics
update_metrics() {
    if [ -n "${PUSHGATEWAY_URL:-}" ]; then
        cat <<EOF | curl -X POST ${PUSHGATEWAY_URL}/metrics/job/postgres_backup --data-binary @-
# TYPE backup_last_success_timestamp gauge
backup_last_success_timestamp{backup_type="postgres",database="${DB_NAME}"} $(date +%s)
# TYPE backup_size_bytes gauge
backup_size_bytes{backup_type="postgres",database="${DB_NAME}"} $(du -b ${BACKUP_DIR}/${BACKUP_FILE}.dump.enc | cut -f1)
# TYPE backup_duration_seconds gauge
backup_duration_seconds{backup_type="postgres",database="${DB_NAME}"} ${SECONDS}
EOF
    fi
}

# Main execution
main() {
    log "PostgreSQL backup script started"
    
    check_prerequisites
    perform_backup
    encrypt_backup
    upload_to_s3
    create_metadata
    cleanup_old_backups
    update_metrics
    
    log "PostgreSQL backup completed successfully"
}

# Run main function
main