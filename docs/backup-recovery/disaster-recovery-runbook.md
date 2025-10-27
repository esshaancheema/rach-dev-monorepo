# Disaster Recovery Runbook

This runbook provides step-by-step procedures for recovering the Zoptal platform from various disaster scenarios.

## Table of Contents

1. [Emergency Contacts](#emergency-contacts)
2. [Disaster Scenarios](#disaster-scenarios)
3. [Recovery Procedures](#recovery-procedures)
4. [Post-Recovery Validation](#post-recovery-validation)
5. [Communication Plan](#communication-plan)

## Emergency Contacts

### Primary Contacts
- **Incident Commander**: ops-lead@zoptal.com | +1-xxx-xxx-xxxx
- **Technical Lead**: tech-lead@zoptal.com | +1-xxx-xxx-xxxx
- **Communications Lead**: comms@zoptal.com | +1-xxx-xxx-xxxx

### Escalation Path
1. On-call Engineer (PagerDuty)
2. Team Lead
3. Engineering Manager
4. CTO

### External Contacts
- **AWS Support**: Premium Support Case
- **Stripe Support**: support@stripe.com
- **Twilio Support**: support@twilio.com

## Disaster Scenarios

### Scenario 1: Database Corruption

**Symptoms:**
- Application errors mentioning database constraints
- Data inconsistencies reported by users
- Failed database health checks

**Severity:** Critical
**Recovery Time Objective (RTO):** 30 minutes
**Recovery Point Objective (RPO):** 5 minutes

### Scenario 2: Region Failure

**Symptoms:**
- Complete loss of connectivity to primary region
- AWS health dashboard showing region issues
- All services in region unreachable

**Severity:** Critical
**RTO:** 15 minutes
**RPO:** 0 minutes (with replication)

### Scenario 3: Data Breach

**Symptoms:**
- Unauthorized access detected
- Suspicious activity in logs
- Security alerts triggered

**Severity:** Critical
**RTO:** Immediate isolation, 2 hours for recovery
**RPO:** Varies based on breach scope

### Scenario 4: Service Compromise

**Symptoms:**
- Unexpected service behavior
- Malicious code detected
- Unauthorized modifications

**Severity:** High
**RTO:** 1 hour
**RPO:** 1 hour

## Recovery Procedures

### 1. Database Corruption Recovery

```bash
#!/bin/bash
# Database Corruption Recovery Procedure

# Step 1: Isolate the corrupted database
echo "=== Step 1: Isolating corrupted database ==="
kubectl scale deployment auth-service project-service billing-service --replicas=0

# Step 2: Create a point-in-time recovery instance
echo "=== Step 2: Creating PITR instance ==="
RECOVERY_TIME=$(date -d '1 hour ago' --utc +%Y-%m-%dT%H:%M:%S)
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier zoptal-production-db \
  --target-db-instance-identifier zoptal-recovery-$(date +%Y%m%d%H%M%S) \
  --restore-time ${RECOVERY_TIME}

# Step 3: Wait for recovery instance
echo "=== Step 3: Waiting for recovery instance ==="
aws rds wait db-instance-available \
  --db-instance-identifier zoptal-recovery-$(date +%Y%m%d%H%M%S)

# Step 4: Validate recovered data
echo "=== Step 4: Validating recovered data ==="
NEW_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier zoptal-recovery-$(date +%Y%m%d%H%M%S) \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

psql -h ${NEW_ENDPOINT} -U postgres -d zoptal -c "
  SELECT COUNT(*) as user_count FROM users;
  SELECT COUNT(*) as project_count FROM projects;
  SELECT MAX(created_at) as latest_record FROM audit_logs;
"

# Step 5: Update application configuration
echo "=== Step 5: Updating application configuration ==="
kubectl create secret generic db-connection \
  --from-literal=host=${NEW_ENDPOINT} \
  --from-literal=database=zoptal \
  --from-literal=username=postgres \
  --from-literal=password=${DB_PASSWORD} \
  --dry-run=client -o yaml | kubectl apply -f -

# Step 6: Resume services
echo "=== Step 6: Resuming services ==="
kubectl scale deployment auth-service project-service billing-service --replicas=3

# Step 7: Monitor recovery
echo "=== Step 7: Monitoring recovery ==="
kubectl logs -f deployment/auth-service --tail=100
```

### 2. Region Failure Recovery

```bash
#!/bin/bash
# Region Failure Recovery Procedure

# Step 1: Confirm region failure
echo "=== Step 1: Confirming region failure ==="
aws ec2 describe-regions --region-names us-east-1 || REGION_DOWN=true

if [ "$REGION_DOWN" = true ]; then
  echo "Primary region confirmed down. Initiating failover..."

  # Step 2: Update Route53 to point to secondary region
  echo "=== Step 2: Updating DNS records ==="
  aws route53 change-resource-record-sets \
    --hosted-zone-id ${HOSTED_ZONE_ID} \
    --change-batch '{
      "Changes": [{
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "api.zoptal.com",
          "Type": "A",
          "AliasTarget": {
            "HostedZoneId": "'${SECONDARY_ALB_ZONE_ID}'",
            "DNSName": "'${SECONDARY_ALB_DNS}'",
            "EvaluateTargetHealth": true
          }
        }
      }]
    }'

  # Step 3: Promote read replica in secondary region
  echo "=== Step 3: Promoting database read replica ==="
  aws rds promote-read-replica \
    --db-instance-identifier zoptal-db-replica-us-west-2 \
    --region us-west-2

  # Step 4: Scale up services in secondary region
  echo "=== Step 4: Scaling up secondary region ==="
  kubectl config use-context us-west-2-cluster
  kubectl scale deployment --all --replicas=5 -n production

  # Step 5: Verify failover
  echo "=== Step 5: Verifying failover ==="
  curl -I https://api.zoptal.com/health
  
  # Step 6: Update status page
  echo "=== Step 6: Updating status page ==="
  curl -X POST https://api.statuspage.io/v1/pages/${PAGE_ID}/incidents \
    -H "Authorization: OAuth ${STATUSPAGE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "incident": {
        "name": "Primary Region Failover",
        "status": "identified",
        "body": "We are experiencing issues with our primary region and have failed over to our secondary region. No data loss is expected.",
        "component_ids": ["'${API_COMPONENT_ID}'"],
        "impact": "minor"
      }
    }'
fi
```

### 3. Data Breach Response

```bash
#!/bin/bash
# Data Breach Response Procedure

# Step 1: Immediate isolation
echo "=== Step 1: IMMEDIATE ISOLATION ==="
# Block all ingress except from security team
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: emergency-lockdown
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  ingress:
  - from:
    - ipBlock:
        cidr: ${SECURITY_TEAM_IP}/32
EOF

# Step 2: Preserve evidence
echo "=== Step 2: Preserving evidence ==="
INCIDENT_ID=$(date +%Y%m%d%H%M%S)
mkdir -p /evidence/${INCIDENT_ID}

# Capture all logs
kubectl logs --all-containers --all-namespaces > /evidence/${INCIDENT_ID}/all-logs.txt
kubectl get events --all-namespaces > /evidence/${INCIDENT_ID}/k8s-events.txt

# Snapshot affected systems
for NODE in $(kubectl get nodes -o jsonpath='{.items[*].metadata.name}'); do
  aws ec2 create-snapshot \
    --volume-id $(aws ec2 describe-instances \
      --filters "Name=private-dns-name,Values=${NODE}" \
      --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' \
      --output text) \
    --description "Security incident ${INCIDENT_ID} - ${NODE}"
done

# Step 3: Rotate all credentials
echo "=== Step 3: Rotating credentials ==="
# Generate new secrets
./scripts/rotate-all-secrets.sh --emergency

# Step 4: Deploy clean systems
echo "=== Step 4: Deploying clean systems ==="
# Use verified clean images
kubectl set image deployment --all \
  app=zoptal/*:verified-clean-${LAST_KNOWN_GOOD_VERSION} \
  -n production

# Step 5: Forensic analysis
echo "=== Step 5: Starting forensic analysis ==="
# This would typically involve security team and tools
```

### 4. Service Recovery

```bash
#!/bin/bash
# Service Recovery Procedure

SERVICE_NAME=$1
RECOVERY_TYPE=$2  # full | partial | rollback

case $RECOVERY_TYPE in
  full)
    echo "=== Full Service Recovery for ${SERVICE_NAME} ==="
    
    # Step 1: Stop compromised service
    kubectl delete deployment ${SERVICE_NAME} -n production
    
    # Step 2: Clean persistent data
    kubectl delete pvc ${SERVICE_NAME}-data -n production
    
    # Step 3: Restore from backup
    ./scripts/restore-service.sh ${SERVICE_NAME} $(date -d '1 hour ago' +%Y%m%d%H%M%S)
    
    # Step 4: Deploy fresh instance
    kubectl apply -f k8s/services/${SERVICE_NAME}.yaml
    
    # Step 5: Verify
    kubectl wait --for=condition=ready pod -l app=${SERVICE_NAME} --timeout=300s
    ;;
    
  partial)
    echo "=== Partial Service Recovery for ${SERVICE_NAME} ==="
    
    # Just restart with clean image
    kubectl rollout restart deployment ${SERVICE_NAME} -n production
    kubectl rollout status deployment ${SERVICE_NAME} -n production
    ;;
    
  rollback)
    echo "=== Rollback for ${SERVICE_NAME} ==="
    
    # Rollback to previous version
    kubectl rollout undo deployment ${SERVICE_NAME} -n production
    kubectl rollout status deployment ${SERVICE_NAME} -n production
    ;;
esac

# Health check
./scripts/health-check.sh ${SERVICE_NAME}
```

## Post-Recovery Validation

### Validation Checklist

```bash
#!/bin/bash
# Post-Recovery Validation Script

echo "=== POST-RECOVERY VALIDATION ==="

# 1. Service Health
echo "Checking service health..."
for SERVICE in auth-service project-service ai-service billing-service notification-service analytics-service; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.zoptal.com/${SERVICE}/health)
  if [ $STATUS -eq 200 ]; then
    echo "✓ ${SERVICE}: Healthy"
  else
    echo "✗ ${SERVICE}: Unhealthy (HTTP ${STATUS})"
  fi
done

# 2. Database Connectivity
echo "Checking database connectivity..."
kubectl exec -it auth-service-pod -- npm run db:health-check

# 3. Cache Status
echo "Checking Redis cache..."
kubectl exec -it redis-0 -- redis-cli ping

# 4. External Services
echo "Checking external service connectivity..."
# Stripe
curl -s https://api.stripe.com/v1/charges \
  -u ${STRIPE_SECRET_KEY}: \
  -d amount=100 \
  -d currency=usd \
  -d source=tok_visa \
  --dry-run

# 5. Data Integrity
echo "Checking data integrity..."
psql -h ${DB_HOST} -U postgres -d zoptal -c "
  SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM projects) as projects,
    (SELECT COUNT(*) FROM sessions WHERE expires_at > NOW()) as active_sessions;
"

# 6. Performance Metrics
echo "Checking performance metrics..."
curl -s http://prometheus:9090/api/v1/query \
  -d 'query=rate(http_request_duration_seconds[5m])'

# 7. Security Scan
echo "Running security scan..."
./scripts/security-scan.sh --quick

# Generate report
cat > /tmp/recovery-report-$(date +%Y%m%d%H%M%S).txt <<EOF
Recovery Validation Report
========================
Date: $(date)
Incident ID: ${INCIDENT_ID}
Recovery Type: ${RECOVERY_TYPE}

Service Status:
$(kubectl get pods -n production)

Database Status:
$(kubectl exec -it postgres-0 -- pg_isready)

External Services: OK
Security Status: $(./scripts/security-status.sh)

Recovery validated by: ${USER}
EOF

echo "Validation complete. Report saved."
```

## Communication Plan

### Internal Communication

1. **Immediate Notification** (0-5 minutes)
   - PagerDuty alert to on-call engineer
   - Slack notification to #incidents channel
   - Email to engineering team

2. **Status Updates** (Every 15 minutes during incident)
   ```
   INCIDENT UPDATE - [TIME]
   Status: [Investigating|Identified|Monitoring|Resolved]
   Impact: [None|Minor|Major|Critical]
   Next Update: [TIME]
   Details: [Brief description]
   ```

3. **Post-Incident** (Within 2 hours of resolution)
   - All-clear notification
   - Initial incident report
   - Scheduled post-mortem

### External Communication

1. **Status Page Update**
   ```bash
   # Update status page
   curl -X POST https://api.statuspage.io/v1/pages/${PAGE_ID}/incidents \
     -H "Authorization: OAuth ${STATUSPAGE_API_KEY}" \
     -H "Content-Type: application/json" \
     -d '{
       "incident": {
         "name": "Service Degradation",
         "status": "investigating",
         "body": "We are investigating reports of service degradation.",
         "component_ids": ["'${COMPONENT_ID}'"],
         "impact": "minor"
       }
     }'
   ```

2. **Customer Email Template**
   ```
   Subject: [Zoptal] Service Status Update

   Dear Customer,

   We are currently experiencing [brief description of issue].

   Current Status: [Investigating/Identified/Monitoring/Resolved]
   
   Impact: [What services are affected]
   
   We expect to have this resolved by [ETA].

   We'll send another update in [timeframe] or as soon as we have more information.

   Thank you for your patience.

   The Zoptal Team
   ```

3. **Social Media Template**
   ```
   We're aware of issues affecting [service]. Our team is working on a fix. 
   
   Check our status page for updates: https://status.zoptal.com
   ```

### Post-Mortem Process

1. **Timeline** 
   - Draft within 24 hours
   - Review within 48 hours
   - Publish within 5 business days

2. **Template**
   ```markdown
   # Incident Post-Mortem: [Incident Title]
   
   ## Summary
   - Date: 
   - Duration: 
   - Impact: 
   - Root Cause: 
   
   ## Timeline
   - HH:MM - Event
   - HH:MM - Event
   
   ## Root Cause Analysis
   
   ## Lessons Learned
   
   ## Action Items
   - [ ] Action item (Owner, Due date)
   ```

---

Remember: **Stay calm, follow the procedures, communicate clearly.**