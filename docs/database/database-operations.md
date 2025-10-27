# Database Operations Guide

## Overview

This guide covers comprehensive database operations for the Zoptal platform, including backup and recovery procedures, high availability setup, monitoring, and troubleshooting.

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Backup and Recovery](#backup-and-recovery)
3. [High Availability](#high-availability)
4. [Monitoring and Alerting](#monitoring-and-alerting)
5. [Performance Tuning](#performance-tuning)
6. [Security](#security)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance Procedures](#maintenance-procedures)

## Database Architecture

### PostgreSQL Setup

The Zoptal platform uses PostgreSQL 15 as the primary database with the following configuration:

- **Primary Database**: Single master for writes
- **Read Replicas**: 2 replicas for read scaling
- **Streaming Replication**: Real-time data replication
- **WAL Archiving**: Point-in-time recovery capability

### Redis Setup

Redis is configured with high availability using Redis Sentinel:

- **Master-Replica**: 1 master + 2 replicas
- **Sentinel Cluster**: 3 sentinels for failover
- **Automatic Failover**: Sentinel-managed failover

### Database Schemas

```sql
-- Main application database
zoptal                  -- Primary application data
zoptal_auth            -- Authentication and user data
zoptal_projects        -- Project management data
zoptal_billing         -- Billing and subscription data
```

## Backup and Recovery

### Automated Backups

#### PostgreSQL Backups

```bash
# Daily full backups at 2 AM UTC
0 2 * * * /scripts/backup/backup-manager.sh backup postgres

# Backup retention: 30 days local, 90 days S3
```

#### Redis Backups

```bash
# Every 6 hours
0 */6 * * * /scripts/backup/backup-manager.sh backup redis
```

### Manual Backup Operations

#### Create PostgreSQL Backup

```bash
# Backup specific database
./scripts/backup/backup-manager.sh backup postgres

# Backup all databases
./scripts/backup/backup-manager.sh backup all
```

#### Create Redis Backup

```bash
# Create Redis backup
./scripts/backup/backup-manager.sh backup redis
```

### Recovery Procedures

#### PostgreSQL Recovery

```bash
# List available backups
./scripts/backup/backup-manager.sh list postgres

# Restore from latest backup
./scripts/backup/backup-manager.sh restore postgres zoptal

# Restore from specific backup
./scripts/backup/backup-manager.sh restore postgres zoptal_20231201_020000.dump

# Restore to different database
./scripts/backup/backup-manager.sh restore postgres zoptal zoptal_restore
```

#### Redis Recovery

```bash
# List Redis backups
./scripts/backup/backup-manager.sh list redis

# Restore from latest backup
./scripts/backup/backup-manager.sh restore redis

# Restore from specific backup
./scripts/backup/backup-manager.sh restore redis redis_20231201_020000.rdb.gz
```

#### Point-in-Time Recovery (PITR)

```bash
# Restore to specific timestamp (PostgreSQL only)
pg_restore --clean --if-exists --create \
  --dbname=zoptal_restore \
  --username=postgres \
  --host=localhost \
  backup_file.dump

# Then apply WAL files up to target time
```

### Backup Verification

```bash
# Check backup health
./scripts/backup/backup-manager.sh health

# Verify specific backup
pg_restore --list backup_file.dump | head -20
```

## High Availability

### PostgreSQL Streaming Replication

#### Primary Configuration

```postgresql
# postgresql.conf
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
wal_keep_size = 1GB
archive_mode = on
archive_command = 'cp %p /archive/%f'
```

#### Replica Setup

```bash
# Initialize replica from primary
pg_basebackup -h postgres-primary -U postgres -D /var/lib/postgresql/data -P -W -R

# Start replica
systemctl start postgresql
```

#### Monitoring Replication

```sql
-- Check replication status on primary
SELECT 
    client_addr,
    state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn,
    write_lag,
    flush_lag,
    replay_lag
FROM pg_stat_replication;

-- Check replica status
SELECT 
    pg_is_in_recovery(),
    pg_last_wal_receive_lsn(),
    pg_last_wal_replay_lsn(),
    pg_last_xact_replay_timestamp();
```

### Redis Sentinel Configuration

#### Sentinel Setup

```bash
# sentinel.conf
port 26379
sentinel monitor mymaster redis-master 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 10000
```

#### Failover Testing

```bash
# Simulate master failure
kubectl exec -it redis-master-0 -- redis-cli DEBUG SEGFAULT

# Check sentinel status
kubectl exec -it redis-sentinel-0 -- redis-cli -p 26379 sentinel masters

# Monitor failover
kubectl logs -f redis-sentinel-0
```

### Kubernetes High Availability

#### StatefulSet Configuration

```yaml
spec:
  replicas: 3
  podManagementPolicy: Parallel
  updateStrategy:
    type: RollingUpdate
```

#### Pod Disruption Budget

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: postgres-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: postgres
```

## Monitoring and Alerting

### Key Metrics

#### PostgreSQL Metrics

```sql
-- Connection count
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('zoptal'));

-- Long-running queries
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Replication lag
SELECT 
    client_addr,
    write_lag,
    flush_lag,
    replay_lag
FROM pg_stat_replication;
```

#### Redis Metrics

```bash
# Memory usage
redis-cli info memory

# Connected clients
redis-cli info clients

# Keyspace statistics
redis-cli info keyspace

# Replication info
redis-cli info replication
```

### Prometheus Metrics

```yaml
# ServiceMonitor for PostgreSQL
spec:
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
```

### Alerting Rules

```yaml
groups:
- name: database.rules
  rules:
  - alert: PostgreSQLDown
    expr: pg_up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "PostgreSQL is down"

  - alert: PostgreSQLReplicationLag
    expr: pg_replication_lag_seconds > 300
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "PostgreSQL replication lag is high"

  - alert: RedisDown
    expr: redis_up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Redis is down"
```

## Performance Tuning

### PostgreSQL Optimization

#### Configuration Parameters

```postgresql
# Memory settings
shared_buffers = 256MB              # 25% of RAM
effective_cache_size = 1GB          # 75% of RAM
work_mem = 4MB                      # Per connection
maintenance_work_mem = 64MB         # For maintenance ops

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
checkpoint_timeout = 15min

# Query planner
random_page_cost = 1.1              # For SSDs
effective_io_concurrency = 200      # For SSDs
```

#### Index Optimization

```sql
-- Find missing indexes
SELECT 
    relname,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    seq_tup_read / seq_scan AS avg_seq_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC;

-- Find unused indexes
SELECT 
    indexrelname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### Redis Optimization

#### Memory Optimization

```bash
# Set maxmemory policy
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Monitor memory usage
redis-cli INFO memory | grep used_memory_human
```

#### Connection Pooling

```javascript
// Application-level connection pooling
const redis = require('redis');
const client = redis.createClient({
  host: 'redis-sentinel',
  port: 26379,
  sentinels: [
    { host: 'redis-sentinel-0', port: 26379 },
    { host: 'redis-sentinel-1', port: 26379 },
    { host: 'redis-sentinel-2', port: 26379 }
  ],
  name: 'mymaster'
});
```

## Security

### Database Security

#### PostgreSQL Security

```sql
-- Create application user
CREATE USER zoptal_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE zoptal TO zoptal_app;
GRANT USAGE ON SCHEMA public TO zoptal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO zoptal_app;

-- Enable SSL
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'ca.crt'
```

#### Redis Security

```bash
# Set password
requirepass your_secure_password

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
```

### Encryption

#### Data at Rest

```yaml
# PostgreSQL encryption
spec:
  containers:
  - name: postgres
    env:
    - name: POSTGRES_INITDB_ARGS
      value: "--data-checksums"
```

#### Data in Transit

```yaml
# TLS configuration
spec:
  containers:
  - name: postgres
    env:
    - name: POSTGRES_SSL_MODE
      value: "require"
```

## Troubleshooting

### Common Issues

#### PostgreSQL Issues

1. **Connection Limit Reached**
   ```sql
   -- Check current connections
   SELECT count(*) FROM pg_stat_activity;
   
   -- Kill idle connections
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle' AND query_start < now() - interval '1 hour';
   ```

2. **Replication Lag**
   ```sql
   -- Check replication status
   SELECT * FROM pg_stat_replication;
   
   -- Check replica status
   SELECT pg_is_in_recovery(), pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();
   ```

3. **Disk Space Issues**
   ```bash
   # Find large tables
   SELECT 
       relname,
       pg_size_pretty(pg_total_relation_size(relname::regclass)) as size
   FROM pg_stat_user_tables
   ORDER BY pg_total_relation_size(relname::regclass) DESC;
   ```

#### Redis Issues

1. **Memory Issues**
   ```bash
   # Check memory usage
   redis-cli info memory
   
   # Set maxmemory
   redis-cli config set maxmemory 256mb
   ```

2. **Sentinel Issues**
   ```bash
   # Check sentinel status
   redis-cli -p 26379 sentinel masters
   
   # Force failover
   redis-cli -p 26379 sentinel failover mymaster
   ```

### Log Analysis

#### PostgreSQL Logs

```bash
# View recent errors
kubectl logs postgres-primary-0 | grep ERROR

# Check slow queries
kubectl logs postgres-primary-0 | grep "duration:"
```

#### Redis Logs

```bash
# View Redis logs
kubectl logs redis-master-0

# Check sentinel logs
kubectl logs redis-sentinel-0
```

## Maintenance Procedures

### Routine Maintenance

#### Weekly Tasks

```bash
# Analyze database statistics
psql -d zoptal -c "ANALYZE;"

# Check replication health
./scripts/backup/backup-manager.sh health

# Review slow query log
kubectl logs postgres-primary-0 | grep "duration:" | tail -100
```

#### Monthly Tasks

```bash
# Vacuum full on low-activity tables
psql -d zoptal -c "VACUUM FULL table_name;"

# Update database statistics
psql -d zoptal -c "VACUUM ANALYZE;"

# Review backup retention
./scripts/backup/backup-manager.sh cleanup 30
```

### Planned Maintenance

#### Database Upgrades

1. **Preparation**
   ```bash
   # Create full backup
   ./scripts/backup/backup-manager.sh backup all
   
   # Stop application connections
   kubectl scale deployment --replicas=0 --all
   ```

2. **Upgrade Process**
   ```bash
   # Upgrade PostgreSQL
   kubectl set image statefulset/postgres-primary postgres=postgres:16
   
   # Wait for rollout
   kubectl rollout status statefulset/postgres-primary
   ```

3. **Verification**
   ```bash
   # Test database connectivity
   kubectl exec -it postgres-primary-0 -- psql -U postgres -d zoptal -c "SELECT version();"
   
   # Restart applications
   kubectl scale deployment --replicas=3 --all
   ```

### Emergency Procedures

#### Database Corruption

1. **Immediate Actions**
   ```bash
   # Stop all write operations
   kubectl scale deployment --replicas=0 --all
   
   # Assess damage
   kubectl exec -it postgres-primary-0 -- pg_dump --schema-only zoptal > schema_backup.sql
   ```

2. **Recovery**
   ```bash
   # Restore from latest backup
   ./scripts/backup/backup-manager.sh restore postgres zoptal zoptal_recovery
   
   # Verify data integrity
   kubectl exec -it postgres-primary-0 -- psql -d zoptal_recovery -c "SELECT count(*) FROM users;"
   ```

#### Split-Brain Scenario

1. **Detection**
   ```bash
   # Check for multiple masters
   kubectl exec -it redis-sentinel-0 -- redis-cli -p 26379 sentinel masters
   ```

2. **Resolution**
   ```bash
   # Force failover to correct master
   kubectl exec -it redis-sentinel-0 -- redis-cli -p 26379 sentinel failover mymaster
   
   # Reset incorrect master as replica
   kubectl exec -it redis-master-1 -- redis-cli REPLICAOF redis-master-0 6379
   ```

## Contacts and Escalation

### On-Call Contacts

- **Primary DBA**: dba@zoptal.com
- **DevOps Team**: devops@zoptal.com
- **Emergency**: +1-XXX-XXX-XXXX

### Escalation Matrix

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| Critical | 15 minutes | CTO, Head of Engineering |
| High | 1 hour | Engineering Manager |
| Medium | 4 hours | Team Lead |
| Low | 24 hours | Assigned Engineer |

---

**Document Version**: 1.0  
**Last Updated**: $(date)  
**Next Review**: $(date -d '+3 months')  
**Owner**: Database Team  
**Approved By**: Head of Engineering