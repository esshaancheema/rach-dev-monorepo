# Backup and Disaster Recovery Guide

This comprehensive guide outlines backup strategies, disaster recovery procedures, and business continuity planning for the Zoptal platform.

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Database Backups](#database-backups)
4. [Application Data Backups](#application-data-backups)
5. [Infrastructure Backups](#infrastructure-backups)
6. [Disaster Recovery Procedures](#disaster-recovery-procedures)
7. [Business Continuity](#business-continuity)
8. [Testing and Validation](#testing-and-validation)
9. [Automation](#automation)
10. [Recovery Time Objectives](#recovery-time-objectives)

## Overview

The Zoptal platform implements a comprehensive backup and disaster recovery strategy designed to:

- **Minimize data loss** with automated, frequent backups
- **Ensure rapid recovery** with tested restoration procedures
- **Maintain business continuity** during incidents
- **Meet compliance requirements** for data protection

### Key Principles

1. **3-2-1 Backup Rule**: 3 copies of data, 2 different media types, 1 offsite copy
2. **Automated Processes**: Minimize human error with automation
3. **Regular Testing**: Monthly recovery drills
4. **Geographic Distribution**: Multi-region backup storage
5. **Encryption**: All backups encrypted at rest and in transit

## Backup Strategy

### Backup Types

1. **Full Backups**: Complete system snapshots (weekly)
2. **Incremental Backups**: Changes since last backup (daily)
3. **Continuous Replication**: Real-time replication for critical data
4. **Point-in-Time Recovery**: Database transaction logs

### Backup Schedule

| Component | Full Backup | Incremental | Retention |
|-----------|-------------|-------------|-----------|
| PostgreSQL | Weekly | Daily | 90 days |
| Redis | Daily | Hourly | 7 days |
| Application Files | Weekly | Daily | 30 days |
| User Uploads | Weekly | Real-time | 1 year |
| Logs | N/A | Continuous | 30 days |
| Configurations | Daily | On change | 90 days |

## Database Backups

### PostgreSQL Backup Configuration

#### Automated Backups with AWS RDS

```bash
# RDS automated backup configuration
aws rds modify-db-instance \
  --db-instance-identifier zoptal-production-db \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00"

# Enable point-in-time recovery
aws rds modify-db-instance \
  --db-instance-identifier zoptal-production-db \
  --enable-iam-database-authentication \
  --apply-immediately
```

#### Manual Backup Script

```bash
#!/bin/bash
# backup-postgres.sh

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-zoptal}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="/backups/postgres"
S3_BUCKET="zoptal-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="postgres_${DB_NAME}_${DATE}.sql.gz"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Perform backup
echo "Starting PostgreSQL backup..."
PGPASSWORD=${DB_PASSWORD} pg_dump \
  -h ${DB_HOST} \
  -p ${DB_PORT} \
  -U ${DB_USER} \
  -d ${DB_NAME} \
  --verbose \
  --no-owner \
  --no-acl \
  --format=custom \
  --compress=9 \
  --file=${BACKUP_DIR}/${BACKUP_FILE}

# Encrypt backup
echo "Encrypting backup..."
openssl enc -aes-256-cbc \
  -salt \
  -in ${BACKUP_DIR}/${BACKUP_FILE} \
  -out ${BACKUP_DIR}/${BACKUP_FILE}.enc \
  -k ${ENCRYPTION_KEY}

# Upload to S3
echo "Uploading to S3..."
aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.enc \
  s3://${S3_BUCKET}/postgres/${BACKUP_FILE}.enc \
  --storage-class STANDARD_IA

# Upload to glacier for long-term storage
aws s3 cp ${BACKUP_DIR}/${BACKUP_FILE}.enc \
  s3://${S3_BUCKET}-glacier/postgres/${BACKUP_FILE}.enc \
  --storage-class GLACIER

# Cleanup local files older than 7 days
find ${BACKUP_DIR} -name "*.sql.gz*" -mtime +7 -delete

echo "Backup completed successfully"
```

### Redis Backup Configuration

```bash
#!/bin/bash
# backup-redis.sh

# Configuration
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
BACKUP_DIR="/backups/redis"
S3_BUCKET="zoptal-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Trigger Redis backup
echo "Starting Redis backup..."
redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} BGSAVE

# Wait for backup to complete
while [ $(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} LASTSAVE) -eq $(redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT} LASTSAVE) ]; do
  sleep 1
done

# Copy RDB file
cp /var/lib/redis/dump.rdb ${BACKUP_DIR}/redis_${DATE}.rdb

# Compress and encrypt
gzip ${BACKUP_DIR}/redis_${DATE}.rdb
openssl enc -aes-256-cbc \
  -salt \
  -in ${BACKUP_DIR}/redis_${DATE}.rdb.gz \
  -out ${BACKUP_DIR}/redis_${DATE}.rdb.gz.enc \
  -k ${ENCRYPTION_KEY}

# Upload to S3
aws s3 cp ${BACKUP_DIR}/redis_${DATE}.rdb.gz.enc \
  s3://${S3_BUCKET}/redis/redis_${DATE}.rdb.gz.enc

# Cleanup
find ${BACKUP_DIR} -name "*.rdb*" -mtime +7 -delete
```

## Application Data Backups

### User Uploads and Assets

```yaml
# k8s/backup/user-data-backup.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: user-data-backup
  namespace: default
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: amazon/aws-cli:latest
            command:
            - /bin/bash
            - -c
            - |
              # Sync user uploads to backup bucket
              aws s3 sync s3://zoptal-user-uploads s3://zoptal-backups/user-uploads \
                --storage-class STANDARD_IA \
                --delete
              
              # Create snapshot metadata
              echo "{\"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"source\": \"zoptal-user-uploads\"}" > /tmp/metadata.json
              aws s3 cp /tmp/metadata.json s3://zoptal-backups/user-uploads/_metadata/$(date +%Y%m%d).json
            env:
            - name: AWS_REGION
              value: us-east-1
            volumeMounts:
            - name: aws-credentials
              mountPath: /root/.aws
          volumes:
          - name: aws-credentials
            secret:
              secretName: aws-backup-credentials
          restartPolicy: OnFailure
```

### Application Configuration Backup

```bash
#!/bin/bash
# backup-configs.sh

# Configuration
BACKUP_DIR="/backups/configs"
S3_BUCKET="zoptal-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Backup Kubernetes configurations
echo "Backing up Kubernetes configurations..."
kubectl get all --all-namespaces -o yaml > ${BACKUP_DIR}/k8s_all_resources_${DATE}.yaml
kubectl get configmap --all-namespaces -o yaml > ${BACKUP_DIR}/k8s_configmaps_${DATE}.yaml
kubectl get secret --all-namespaces -o yaml > ${BACKUP_DIR}/k8s_secrets_${DATE}.yaml
kubectl get pv,pvc --all-namespaces -o yaml > ${BACKUP_DIR}/k8s_storage_${DATE}.yaml

# Create archive
tar -czf ${BACKUP_DIR}/configs_${DATE}.tar.gz -C ${BACKUP_DIR} .

# Encrypt archive
openssl enc -aes-256-cbc \
  -salt \
  -in ${BACKUP_DIR}/configs_${DATE}.tar.gz \
  -out ${BACKUP_DIR}/configs_${DATE}.tar.gz.enc \
  -k ${ENCRYPTION_KEY}

# Upload to S3
aws s3 cp ${BACKUP_DIR}/configs_${DATE}.tar.gz.enc \
  s3://${S3_BUCKET}/configs/configs_${DATE}.tar.gz.enc

# Cleanup
find ${BACKUP_DIR} -name "*.yaml" -delete
find ${BACKUP_DIR} -name "*.tar.gz*" -mtime +7 -delete
```

## Infrastructure Backups

### Terraform State Backup

```hcl
# terraform/backend.tf
terraform {
  backend "s3" {
    bucket         = "zoptal-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
    
    # Enable versioning for state file history
    versioning = {
      enabled = true
    }
    
    # Enable cross-region replication
    replication_configuration {
      role = aws_iam_role.replication.arn
      
      rules {
        id     = "backup-to-west"
        status = "Enabled"
        
        destination {
          bucket        = aws_s3_bucket.terraform_state_backup.arn
          storage_class = "STANDARD_IA"
        }
      }
    }
  }
}
```

### AMI Snapshots

```bash
#!/bin/bash
# backup-ami.sh

# Configuration
INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=tag:Environment,Values=production" \
  --query "Reservations[].Instances[].InstanceId" \
  --output text)

DATE=$(date +%Y%m%d)

# Create AMIs for all production instances
for INSTANCE_ID in ${INSTANCE_IDS}; do
  echo "Creating AMI for instance ${INSTANCE_ID}..."
  
  AMI_ID=$(aws ec2 create-image \
    --instance-id ${INSTANCE_ID} \
    --name "zoptal-backup-${INSTANCE_ID}-${DATE}" \
    --description "Automated backup of ${INSTANCE_ID}" \
    --no-reboot \
    --output text)
  
  # Tag the AMI
  aws ec2 create-tags \
    --resources ${AMI_ID} \
    --tags Key=Type,Value=backup Key=AutoDelete,Value=true Key=RetentionDays,Value=30
done

# Clean up old AMIs
OLD_AMIS=$(aws ec2 describe-images \
  --owners self \
  --filters "Name=tag:Type,Values=backup" \
  --query "Images[?CreationDate<'$(date -d '30 days ago' --utc +%Y-%m-%d)'].ImageId" \
  --output text)

for AMI_ID in ${OLD_AMIS}; do
  echo "Deleting old AMI ${AMI_ID}..."
  aws ec2 deregister-image --image-id ${AMI_ID}
done
```

## Disaster Recovery Procedures

### Recovery Scenarios

1. **Service Failure**: Individual service recovery
2. **Database Corruption**: Point-in-time recovery
3. **Region Failure**: Multi-region failover
4. **Complete System Failure**: Full restoration

### Service Recovery Procedure

```bash
#!/bin/bash
# recover-service.sh

SERVICE_NAME=$1
BACKUP_DATE=$2

if [ -z "$SERVICE_NAME" ] || [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 <service-name> <backup-date>"
  exit 1
fi

echo "Starting recovery for ${SERVICE_NAME} from ${BACKUP_DATE}..."

# 1. Scale down current deployment
kubectl scale deployment ${SERVICE_NAME} --replicas=0

# 2. Restore database if needed
if [ "${SERVICE_NAME}" == "auth-service" ] || [ "${SERVICE_NAME}" == "project-service" ]; then
  ./restore-database.sh ${SERVICE_NAME} ${BACKUP_DATE}
fi

# 3. Restore configuration
aws s3 cp s3://zoptal-backups/configs/configs_${BACKUP_DATE}.tar.gz.enc /tmp/
openssl enc -aes-256-cbc -d \
  -in /tmp/configs_${BACKUP_DATE}.tar.gz.enc \
  -out /tmp/configs_${BACKUP_DATE}.tar.gz \
  -k ${ENCRYPTION_KEY}
tar -xzf /tmp/configs_${BACKUP_DATE}.tar.gz -C /tmp/

# 4. Apply configuration
kubectl apply -f /tmp/k8s_configmaps_${BACKUP_DATE}.yaml
kubectl apply -f /tmp/k8s_secrets_${BACKUP_DATE}.yaml

# 5. Restore persistent data if exists
if kubectl get pvc ${SERVICE_NAME}-data; then
  ./restore-pvc.sh ${SERVICE_NAME}-data ${BACKUP_DATE}
fi

# 6. Scale up service
kubectl scale deployment ${SERVICE_NAME} --replicas=3

# 7. Health check
./health-check.sh ${SERVICE_NAME}

echo "Recovery completed for ${SERVICE_NAME}"
```

### Database Point-in-Time Recovery

```bash
#!/bin/bash
# restore-database-pitr.sh

DB_INSTANCE=$1
RESTORE_TIME=$2

if [ -z "$DB_INSTANCE" ] || [ -z "$RESTORE_TIME" ]; then
  echo "Usage: $0 <db-instance> <restore-time>"
  echo "Example: $0 zoptal-production-db '2024-01-15 14:30:00'"
  exit 1
fi

RESTORED_INSTANCE="${DB_INSTANCE}-pitr-$(date +%Y%m%d%H%M%S)"

echo "Starting point-in-time recovery..."

# Create new instance from point-in-time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier ${DB_INSTANCE} \
  --target-db-instance-identifier ${RESTORED_INSTANCE} \
  --restore-time ${RESTORE_TIME} \
  --db-instance-class db.t3.large \
  --publicly-accessible false

# Wait for restoration to complete
echo "Waiting for restoration to complete..."
aws rds wait db-instance-available \
  --db-instance-identifier ${RESTORED_INSTANCE}

# Get endpoint
ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier ${RESTORED_INSTANCE} \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "Database restored to ${ENDPOINT}"
echo "Update your application configuration to use the new endpoint"
```

### Full System Recovery

```bash
#!/bin/bash
# full-system-recovery.sh

BACKUP_DATE=$1

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 <backup-date>"
  exit 1
fi

echo "Starting full system recovery from ${BACKUP_DATE}..."

# 1. Restore infrastructure
echo "Restoring infrastructure..."
cd terraform
terraform init
aws s3 cp s3://zoptal-terraform-state/backups/terraform.tfstate.${BACKUP_DATE} terraform.tfstate
terraform plan
terraform apply -auto-approve

# 2. Restore Kubernetes cluster
echo "Restoring Kubernetes configurations..."
aws s3 cp s3://zoptal-backups/configs/configs_${BACKUP_DATE}.tar.gz.enc /tmp/
openssl enc -aes-256-cbc -d \
  -in /tmp/configs_${BACKUP_DATE}.tar.gz.enc \
  -out /tmp/configs_${BACKUP_DATE}.tar.gz \
  -k ${ENCRYPTION_KEY}
tar -xzf /tmp/configs_${BACKUP_DATE}.tar.gz -C /tmp/

# 3. Apply all resources
kubectl apply -f /tmp/k8s_all_resources_${BACKUP_DATE}.yaml

# 4. Restore databases
for DB in postgres redis; do
  echo "Restoring ${DB}..."
  ./restore-${DB}.sh ${BACKUP_DATE}
done

# 5. Restore user data
echo "Restoring user data..."
aws s3 sync s3://zoptal-backups/user-uploads s3://zoptal-user-uploads \
  --delete

# 6. Verify all services
echo "Verifying services..."
kubectl get pods --all-namespaces
kubectl get services --all-namespaces

# 7. Run health checks
./health-check-all.sh

echo "Full system recovery completed"
```

## Business Continuity

### Multi-Region Failover

```yaml
# k8s/backup/multi-region-sync.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: multi-region-sync
  namespace: backup
spec:
  schedule: "*/15 * * * *"  # Every 15 minutes
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: sync
            image: zoptal/backup-sync:latest
            command:
            - /bin/bash
            - -c
            - |
              # Sync primary region to secondary
              aws s3 sync s3://zoptal-data-us-east-1 s3://zoptal-data-us-west-2 \
                --source-region us-east-1 \
                --region us-west-2 \
                --delete
              
              # Sync database replicas
              ./sync-database-replicas.sh
              
              # Update health status
              curl -X POST http://monitoring-service/backup/status \
                -d '{"region": "us-west-2", "status": "synced", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
            env:
            - name: AWS_REGION
              value: us-east-1
          restartPolicy: OnFailure
```

### Automated Failover

```typescript
// services/failover-controller/src/index.ts
import { Route53, ELB, RDS } from 'aws-sdk';

export class FailoverController {
  private route53 = new Route53();
  private elb = new ELB();
  private rds = new RDS();

  async checkHealth(): Promise<HealthStatus> {
    const checks = await Promise.all([
      this.checkPrimaryRegion(),
      this.checkSecondaryRegion(),
      this.checkDatabaseHealth(),
      this.checkServiceHealth()
    ]);

    return {
      primary: checks[0],
      secondary: checks[1],
      database: checks[2],
      services: checks[3]
    };
  }

  async initiateFailover(): Promise<void> {
    console.log('Initiating failover to secondary region...');

    // 1. Update Route53 records
    await this.updateDNSRecords();

    // 2. Promote read replica
    await this.promoteReadReplica();

    // 3. Scale up secondary region
    await this.scaleSecondaryRegion();

    // 4. Notify teams
    await this.notifyFailover();
  }

  private async updateDNSRecords(): Promise<void> {
    const params = {
      HostedZoneId: process.env.HOSTED_ZONE_ID,
      ChangeBatch: {
        Changes: [{
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: 'api.zoptal.com',
            Type: 'A',
            AliasTarget: {
              HostedZoneId: process.env.SECONDARY_ELB_ZONE_ID,
              DNSName: process.env.SECONDARY_ELB_DNS,
              EvaluateTargetHealth: true
            }
          }
        }]
      }
    };

    await this.route53.changeResourceRecordSets(params).promise();
  }

  private async promoteReadReplica(): Promise<void> {
    const params = {
      DBInstanceIdentifier: 'zoptal-db-read-replica-west',
      BackupRetentionPeriod: 30,
      PreferredBackupWindow: '03:00-04:00'
    };

    await this.rds.promoteReadReplica(params).promise();
  }
}
```

## Testing and Validation

### Backup Validation

```bash
#!/bin/bash
# validate-backups.sh

# Configuration
BACKUP_BUCKET="zoptal-backups"
VALIDATION_DIR="/tmp/backup-validation"
DATE=$(date +%Y%m%d)

mkdir -p ${VALIDATION_DIR}

echo "Starting backup validation for ${DATE}..."

# Test PostgreSQL backup
echo "Testing PostgreSQL backup..."
LATEST_PG_BACKUP=$(aws s3 ls s3://${BACKUP_BUCKET}/postgres/ | grep ${DATE} | awk '{print $4}' | head -1)
if [ -n "$LATEST_PG_BACKUP" ]; then
  aws s3 cp s3://${BACKUP_BUCKET}/postgres/${LATEST_PG_BACKUP} ${VALIDATION_DIR}/
  openssl enc -aes-256-cbc -d \
    -in ${VALIDATION_DIR}/${LATEST_PG_BACKUP} \
    -out ${VALIDATION_DIR}/postgres_test.sql.gz \
    -k ${ENCRYPTION_KEY}
  
  # Test restore to temporary database
  createdb backup_test
  pg_restore -d backup_test ${VALIDATION_DIR}/postgres_test.sql.gz
  
  # Verify data
  RECORD_COUNT=$(psql -d backup_test -t -c "SELECT COUNT(*) FROM users;")
  if [ $RECORD_COUNT -gt 0 ]; then
    echo "✓ PostgreSQL backup valid (${RECORD_COUNT} users)"
  else
    echo "✗ PostgreSQL backup invalid"
    exit 1
  fi
  
  dropdb backup_test
else
  echo "✗ No PostgreSQL backup found for ${DATE}"
  exit 1
fi

# Test Redis backup
echo "Testing Redis backup..."
LATEST_REDIS_BACKUP=$(aws s3 ls s3://${BACKUP_BUCKET}/redis/ | grep ${DATE} | awk '{print $4}' | head -1)
if [ -n "$LATEST_REDIS_BACKUP" ]; then
  aws s3 cp s3://${BACKUP_BUCKET}/redis/${LATEST_REDIS_BACKUP} ${VALIDATION_DIR}/
  openssl enc -aes-256-cbc -d \
    -in ${VALIDATION_DIR}/${LATEST_REDIS_BACKUP} \
    -out ${VALIDATION_DIR}/redis_test.rdb.gz \
    -k ${ENCRYPTION_KEY}
  gunzip ${VALIDATION_DIR}/redis_test.rdb.gz
  
  # Test load
  redis-server --port 6380 --dbfilename redis_test.rdb --dir ${VALIDATION_DIR} &
  REDIS_PID=$!
  sleep 5
  
  # Verify data
  KEY_COUNT=$(redis-cli -p 6380 DBSIZE | awk '{print $1}')
  if [ $KEY_COUNT -gt 0 ]; then
    echo "✓ Redis backup valid (${KEY_COUNT} keys)"
  else
    echo "✗ Redis backup invalid"
    kill $REDIS_PID
    exit 1
  fi
  
  kill $REDIS_PID
else
  echo "✗ No Redis backup found for ${DATE}"
  exit 1
fi

# Test configuration backup
echo "Testing configuration backup..."
LATEST_CONFIG_BACKUP=$(aws s3 ls s3://${BACKUP_BUCKET}/configs/ | grep ${DATE} | awk '{print $4}' | head -1)
if [ -n "$LATEST_CONFIG_BACKUP" ]; then
  aws s3 cp s3://${BACKUP_BUCKET}/configs/${LATEST_CONFIG_BACKUP} ${VALIDATION_DIR}/
  openssl enc -aes-256-cbc -d \
    -in ${VALIDATION_DIR}/${LATEST_CONFIG_BACKUP} \
    -out ${VALIDATION_DIR}/configs_test.tar.gz \
    -k ${ENCRYPTION_KEY}
  tar -tzf ${VALIDATION_DIR}/configs_test.tar.gz > /dev/null
  
  if [ $? -eq 0 ]; then
    echo "✓ Configuration backup valid"
  else
    echo "✗ Configuration backup invalid"
    exit 1
  fi
else
  echo "✗ No configuration backup found for ${DATE}"
  exit 1
fi

# Cleanup
rm -rf ${VALIDATION_DIR}

echo "All backups validated successfully!"

# Send success notification
curl -X POST ${SLACK_WEBHOOK_URL} \
  -H 'Content-type: application/json' \
  -d '{
    "text": "✅ Backup validation successful for '"${DATE}"'",
    "color": "good"
  }'
```

### Recovery Drill

```bash
#!/bin/bash
# recovery-drill.sh

# Monthly recovery drill script
echo "Starting monthly recovery drill..."

# 1. Create test namespace
kubectl create namespace recovery-test

# 2. Deploy test service
kubectl apply -f test-service.yaml -n recovery-test

# 3. Create test data
kubectl exec -it test-service-pod -n recovery-test -- /app/create-test-data.sh

# 4. Backup test data
./backup-service.sh test-service

# 5. Delete test data
kubectl delete pod test-service-pod -n recovery-test

# 6. Recover from backup
./recover-service.sh test-service $(date +%Y%m%d)

# 7. Verify recovery
kubectl exec -it test-service-pod -n recovery-test -- /app/verify-test-data.sh

if [ $? -eq 0 ]; then
  echo "✓ Recovery drill successful"
  RESULT="SUCCESS"
else
  echo "✗ Recovery drill failed"
  RESULT="FAILED"
fi

# 8. Cleanup
kubectl delete namespace recovery-test

# 9. Report results
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: recovery-drill-results
  namespace: monitoring
data:
  date: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  result: "${RESULT}"
  duration: "${SECONDS}s"
EOF
```

## Automation

### Backup Automation with Kubernetes Operators

```yaml
# k8s/backup/backup-operator.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: backup-operator
  namespace: backup
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: backup-operator
rules:
- apiGroups: [""]
  resources: ["pods", "persistentvolumeclaims", "services"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["batch"]
  resources: ["jobs", "cronjobs"]
  verbs: ["create", "get", "list", "watch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: backup-operator
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: backup-operator
subjects:
- kind: ServiceAccount
  name: backup-operator
  namespace: backup
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backup-operator
  namespace: backup
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backup-operator
  template:
    metadata:
      labels:
        app: backup-operator
    spec:
      serviceAccountName: backup-operator
      containers:
      - name: operator
        image: zoptal/backup-operator:latest
        env:
        - name: BACKUP_SCHEDULE
          value: "0 2 * * *"
        - name: S3_BUCKET
          value: "zoptal-backups"
        - name: RETENTION_DAYS
          value: "30"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Backup Monitoring Dashboard

```typescript
// monitoring/backup-dashboard.ts
export const backupDashboard = {
  title: 'Backup and Recovery Dashboard',
  panels: [
    {
      title: 'Backup Status',
      type: 'stat',
      targets: [{
        expr: 'backup_last_success_timestamp',
        legendFormat: '{{backup_type}}'
      }]
    },
    {
      title: 'Backup Size Trend',
      type: 'graph',
      targets: [{
        expr: 'backup_size_bytes',
        legendFormat: '{{backup_type}}'
      }]
    },
    {
      title: 'Recovery Time',
      type: 'gauge',
      targets: [{
        expr: 'recovery_duration_seconds',
        legendFormat: 'RTO'
      }]
    },
    {
      title: 'Backup Failures',
      type: 'table',
      targets: [{
        expr: 'increase(backup_failures_total[24h])',
        format: 'table'
      }]
    }
  ],
  annotations: [
    {
      datasource: 'Prometheus',
      expr: 'backup_failures_total > 0',
      name: 'Backup Failures',
      tags: ['backup', 'critical']
    }
  ]
};
```

## Recovery Time Objectives

### RTO/RPO Matrix

| Service | RTO | RPO | Backup Method |
|---------|-----|-----|---------------|
| Auth Service | 15 min | 5 min | Continuous replication |
| Project Service | 30 min | 15 min | Incremental + WAL |
| AI Service | 1 hour | 1 hour | Daily snapshots |
| Billing Service | 15 min | 0 min | Multi-master replication |
| Notification Service | 1 hour | 1 hour | Daily snapshots |
| Analytics Service | 2 hours | 1 hour | Hourly exports |
| User Uploads | 30 min | 0 min | Real-time S3 replication |

### Monitoring Recovery Objectives

```yaml
# prometheus-rules/backup-alerts.yaml
groups:
- name: backup_alerts
  interval: 5m
  rules:
  - alert: BackupFailed
    expr: time() - backup_last_success_timestamp > 86400
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Backup failed for {{ $labels.backup_type }}"
      description: "No successful backup in the last 24 hours"

  - alert: BackupStorageFull
    expr: backup_storage_used_percent > 90
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Backup storage nearly full"
      description: "Backup storage is {{ $value }}% full"

  - alert: RecoveryTestFailed
    expr: recovery_test_success == 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Recovery test failed"
      description: "Last recovery test failed, manual intervention required"

  - alert: RPOExceeded
    expr: time() - backup_last_success_timestamp > backup_rpo_seconds
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "RPO exceeded for {{ $labels.service }}"
      description: "No backup for {{ $value }} seconds, RPO is {{ $labels.rpo_seconds }}s"
```

---

This comprehensive backup and disaster recovery guide ensures:
- **Automated backups** with multiple retention policies
- **Geographic redundancy** with multi-region storage
- **Encrypted backups** for security compliance
- **Regular testing** with automated validation
- **Quick recovery** with documented procedures
- **Business continuity** with failover capabilities

For additional information:
- [AWS Backup Best Practices](https://docs.aws.amazon.com/prescriptive-guidance/latest/backup-recovery/welcome.html)
- [Kubernetes Backup Guide](https://kubernetes.io/docs/concepts/storage/volume-snapshots/)
- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)