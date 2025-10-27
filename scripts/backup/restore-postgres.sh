#!/bin/bash
# restore-postgres.sh - PostgreSQL restore script with decryption and verification

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-postgres-service}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-zoptal}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD}"
RESTORE_DIR="/tmp/restore"
S3_BUCKET="${BACKUP_S3_BUCKET:-zoptal-backups}"
S3_REGION="${AWS_REGION:-us-east-1}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"

# Arguments
BACKUP_DATE="${1:-}"
TARGET_DB="${2:-${DB_NAME}}"

# Usage
if [ -z "${BACKUP_DATE}" ]; then
    echo "Usage: $0 <backup-date> [target-database]"
    echo "Example: $0 20240115_143000 zoptal_restored"
    exit 1
fi

# Create restore directory
mkdir -p ${RESTORE_DIR}

# Logging
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [PostgreSQL Restore] $1"
}

# Find backup file
find_backup() {
    log "Finding backup for date ${BACKUP_DATE}..."
    
    # List available backups
    BACKUP_FILE=$(aws s3 ls s3://${S3_BUCKET}/postgres/ --region ${S3_REGION} | \
        grep "postgres_${DB_NAME}_${BACKUP_DATE}" | \
        awk '{print $4}' | \
        head -1)
    
    if [ -z "${BACKUP_FILE}" ]; then
        log "ERROR: No backup found for date ${BACKUP_DATE}"
        log "Available backups:"
        aws s3 ls s3://${S3_BUCKET}/postgres/ --region ${S3_REGION} | \
            grep "postgres_${DB_NAME}_" | \
            awk '{print $4}' | \
            tail -10
        exit 1
    fi
    
    log "Found backup: ${BACKUP_FILE}"
}

# Download backup
download_backup() {
    log "Downloading backup from S3..."
    
    aws s3 cp s3://${S3_BUCKET}/postgres/${BACKUP_FILE} \
        ${RESTORE_DIR}/${BACKUP_FILE} \
        --region ${S3_REGION}
    
    # Download metadata
    METADATA_FILE="${BACKUP_FILE%.dump.enc}.json"
    aws s3 cp s3://${S3_BUCKET}/postgres/metadata/${METADATA_FILE} \
        ${RESTORE_DIR}/${METADATA_FILE} \
        --region ${S3_REGION} || true
    
    if [ -f ${RESTORE_DIR}/${METADATA_FILE} ]; then
        log "Backup metadata:"
        cat ${RESTORE_DIR}/${METADATA_FILE}
    fi
}

# Decrypt backup
decrypt_backup() {
    log "Decrypting backup..."
    
    openssl enc -aes-256-cbc \
        -d \
        -pbkdf2 \
        -in ${RESTORE_DIR}/${BACKUP_FILE} \
        -out ${RESTORE_DIR}/${BACKUP_FILE%.enc} \
        -k "${ENCRYPTION_KEY}"
    
    if [ ! -f ${RESTORE_DIR}/${BACKUP_FILE%.enc} ]; then
        log "ERROR: Decryption failed"
        exit 1
    fi
    
    log "Decryption completed"
}

# Create target database
create_target_db() {
    if [ "${TARGET_DB}" != "${DB_NAME}" ]; then
        log "Creating target database ${TARGET_DB}..."
        
        PGPASSWORD=${DB_PASSWORD} psql \
            -h ${DB_HOST} \
            -p ${DB_PORT} \
            -U ${DB_USER} \
            -d postgres \
            -c "DROP DATABASE IF EXISTS ${TARGET_DB};"
        
        PGPASSWORD=${DB_PASSWORD} psql \
            -h ${DB_HOST} \
            -p ${DB_PORT} \
            -U ${DB_USER} \
            -d postgres \
            -c "CREATE DATABASE ${TARGET_DB} WITH ENCODING='UTF8' LC_COLLATE='en_US.utf8' LC_CTYPE='en_US.utf8';"
    else
        log "WARNING: Restoring to existing database ${TARGET_DB}"
        read -p "This will overwrite existing data. Continue? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Restore cancelled"
            exit 1
        fi
    fi
}

# Restore database
restore_database() {
    log "Starting database restore to ${TARGET_DB}..."
    
    # Get original database size from metadata
    if [ -f ${RESTORE_DIR}/${METADATA_FILE} ]; then
        ORIGINAL_SIZE=$(jq -r '.backup_size' ${RESTORE_DIR}/${METADATA_FILE} 2>/dev/null || echo "unknown")
        log "Original backup size: ${ORIGINAL_SIZE} bytes"
    fi
    
    # Perform restore
    PGPASSWORD=${DB_PASSWORD} pg_restore \
        -h ${DB_HOST} \
        -p ${DB_PORT} \
        -U ${DB_USER} \
        -d ${TARGET_DB} \
        --verbose \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        ${RESTORE_DIR}/${BACKUP_FILE%.enc} \
        2>&1 | while read line; do
            log "$line"
        done
    
    log "Restore completed"
}

# Verify restore
verify_restore() {
    log "Verifying restored database..."
    
    # Check table count
    TABLE_COUNT=$(PGPASSWORD=${DB_PASSWORD} psql \
        -h ${DB_HOST} \
        -p ${DB_PORT} \
        -U ${DB_USER} \
        -d ${TARGET_DB} \
        -t \
        -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    
    log "Tables restored: ${TABLE_COUNT}"
    
    # Check some critical tables
    for TABLE in users projects sessions; do
        if PGPASSWORD=${DB_PASSWORD} psql \
            -h ${DB_HOST} \
            -p ${DB_PORT} \
            -U ${DB_USER} \
            -d ${TARGET_DB} \
            -c "SELECT COUNT(*) FROM ${TABLE};" &>/dev/null; then
            COUNT=$(PGPASSWORD=${DB_PASSWORD} psql \
                -h ${DB_HOST} \
                -p ${DB_PORT} \
                -U ${DB_USER} \
                -d ${TARGET_DB} \
                -t \
                -c "SELECT COUNT(*) FROM ${TABLE};")
            log "Table ${TABLE}: ${COUNT} records"
        else
            log "WARNING: Table ${TABLE} not found"
        fi
    done
    
    # Run analyze
    log "Running ANALYZE on restored database..."
    PGPASSWORD=${DB_PASSWORD} psql \
        -h ${DB_HOST} \
        -p ${DB_PORT} \
        -U ${DB_USER} \
        -d ${TARGET_DB} \
        -c "ANALYZE;"
}

# Cleanup
cleanup() {
    log "Cleaning up temporary files..."
    rm -rf ${RESTORE_DIR}
}

# Update metrics
update_metrics() {
    if [ -n "${PUSHGATEWAY_URL:-}" ]; then
        cat <<EOF | curl -X POST ${PUSHGATEWAY_URL}/metrics/job/postgres_restore --data-binary @-
# TYPE restore_last_success_timestamp gauge
restore_last_success_timestamp{restore_type="postgres",database="${TARGET_DB}"} $(date +%s)
# TYPE restore_duration_seconds gauge
restore_duration_seconds{restore_type="postgres",database="${TARGET_DB}"} ${SECONDS}
EOF
    fi
}

# Main execution
main() {
    log "PostgreSQL restore script started"
    log "Restoring from backup date: ${BACKUP_DATE}"
    log "Target database: ${TARGET_DB}"
    
    find_backup
    download_backup
    decrypt_backup
    create_target_db
    restore_database
    verify_restore
    cleanup
    update_metrics
    
    log "PostgreSQL restore completed successfully"
    log "Database ${TARGET_DB} is ready for use"
    
    # Print connection info
    echo
    echo "Connection information:"
    echo "Host: ${DB_HOST}"
    echo "Port: ${DB_PORT}"
    echo "Database: ${TARGET_DB}"
    echo "User: ${DB_USER}"
}

# Run main function
main