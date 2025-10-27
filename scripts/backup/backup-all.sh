#!/bin/bash
# backup-all.sh - Master backup script for Zoptal platform

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/var/log/zoptal/backup"
LOG_FILE="${LOG_DIR}/backup_$(date +%Y%m%d_%H%M%S).log"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${BACKUP_EMAIL_RECIPIENTS:-ops@zoptal.com}"

# Create log directory
mkdir -p ${LOG_DIR}

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a ${LOG_FILE}
}

# Error handling
error_handler() {
    log "ERROR: Backup failed at line $1"
    
    # Send notifications
    if [ -n "${SLACK_WEBHOOK_URL}" ]; then
        curl -X POST ${SLACK_WEBHOOK_URL} \
            -H 'Content-type: application/json' \
            -d '{
                "text": "❌ Backup failed for Zoptal platform",
                "attachments": [{
                    "color": "danger",
                    "fields": [{
                        "title": "Error",
                        "value": "Backup process failed. Check logs at '"${LOG_FILE}"'",
                        "short": false
                    }]
                }]
            }'
    fi
    
    # Send email alert
    echo "Backup failed. Check logs at ${LOG_FILE}" | \
        mail -s "CRITICAL: Zoptal Backup Failed" ${EMAIL_RECIPIENTS}
    
    exit 1
}

trap 'error_handler $LINENO' ERR

# Main backup process
main() {
    log "Starting Zoptal platform backup..."
    
    # 1. Database backups
    log "Backing up databases..."
    ${SCRIPT_DIR}/backup-postgres.sh >> ${LOG_FILE} 2>&1
    ${SCRIPT_DIR}/backup-redis.sh >> ${LOG_FILE} 2>&1
    
    # 2. Application data
    log "Backing up application data..."
    ${SCRIPT_DIR}/backup-user-data.sh >> ${LOG_FILE} 2>&1
    
    # 3. Configuration backups
    log "Backing up configurations..."
    ${SCRIPT_DIR}/backup-configs.sh >> ${LOG_FILE} 2>&1
    
    # 4. Container images
    log "Backing up container images..."
    ${SCRIPT_DIR}/backup-images.sh >> ${LOG_FILE} 2>&1
    
    # 5. Validate backups
    log "Validating backups..."
    ${SCRIPT_DIR}/validate-backups.sh >> ${LOG_FILE} 2>&1
    
    # 6. Update backup inventory
    log "Updating backup inventory..."
    ${SCRIPT_DIR}/update-inventory.sh >> ${LOG_FILE} 2>&1
    
    # 7. Cleanup old backups
    log "Cleaning up old backups..."
    ${SCRIPT_DIR}/cleanup-backups.sh >> ${LOG_FILE} 2>&1
    
    # Success notification
    BACKUP_SIZE=$(du -sh /backups | cut -f1)
    log "Backup completed successfully. Total size: ${BACKUP_SIZE}"
    
    if [ -n "${SLACK_WEBHOOK_URL}" ]; then
        curl -X POST ${SLACK_WEBHOOK_URL} \
            -H 'Content-type: application/json' \
            -d '{
                "text": "✅ Backup completed successfully",
                "attachments": [{
                    "color": "good",
                    "fields": [
                        {
                            "title": "Status",
                            "value": "All backups completed",
                            "short": true
                        },
                        {
                            "title": "Size",
                            "value": "'"${BACKUP_SIZE}"'",
                            "short": true
                        }
                    ]
                }]
            }'
    fi
    
    # Update monitoring metrics
    curl -X POST http://localhost:9091/metrics/job/backup_job \
        --data-binary @- <<EOF
# TYPE backup_last_success_timestamp gauge
backup_last_success_timestamp{backup_type="full"} $(date +%s)
# TYPE backup_size_bytes gauge
backup_size_bytes{backup_type="full"} $(du -sb /backups | cut -f1)
# TYPE backup_duration_seconds gauge
backup_duration_seconds{backup_type="full"} ${SECONDS}
EOF
}

# Execute main function
main

log "Backup process completed in ${SECONDS} seconds"