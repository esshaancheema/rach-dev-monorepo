# Multi-Tenancy Migration Guide

This guide provides step-by-step instructions for migrating the Zoptal platform to a multi-tenant architecture with complete tenant isolation, security, and scalability.

## 🎯 Migration Overview

### Current State
- Single-tenant architecture
- Shared database and resources
- Monolithic service structure

### Target State
- Multi-tenant architecture with complete isolation
- Tenant-specific database schemas/databases
- Comprehensive tenant management system
- Resource quotas and billing integration
- Custom domain support

## 📋 Pre-Migration Checklist

### 1. Infrastructure Requirements
- [ ] Kubernetes cluster with sufficient resources
- [ ] MongoDB cluster for tenant data
- [ ] Redis cluster for caching and rate limiting
- [ ] Load balancer with SSL termination
- [ ] Monitoring and logging infrastructure
- [ ] Backup and disaster recovery systems

### 2. Service Dependencies
- [ ] Stripe account for billing integration
- [ ] DNS management system
- [ ] SSL certificate management
- [ ] Email service for notifications
- [ ] External authentication providers (if using SSO)

### 3. Data Preparation
- [ ] Current user and project data inventory
- [ ] Data migration strategy definition
- [ ] Backup of existing data
- [ ] Test environment setup

## 🔄 Migration Process

### Phase 1: Infrastructure Setup (Day 1-2)

#### 1.1 Deploy Tenant Service
```bash
# Apply tenant service configuration
kubectl apply -f k8s/production/multi-tenant-config.yaml

# Verify deployment
kubectl get pods -n zoptal-multi-tenant
kubectl logs -f deployment/tenant-service -n zoptal-multi-tenant
```

#### 1.2 Configure Database
```bash
# Create tenant database schema
kubectl exec -it deployment/tenant-service -n zoptal-multi-tenant -- \
  node scripts/setup-tenant-db.js

# Verify database connectivity
kubectl exec -it deployment/tenant-service -n zoptal-multi-tenant -- \
  node scripts/test-db-connection.js
```

#### 1.3 Set up Monitoring
```bash
# Deploy service monitor
kubectl apply -f k8s/production/multi-tenant-config.yaml

# Verify Prometheus is scraping metrics
curl http://prometheus:9090/api/v1/targets | grep tenant-service
```

### Phase 2: Default Tenant Creation (Day 2-3)

#### 2.1 Create Default Tenant
```javascript
// Execute via tenant service API or direct database operation
const defaultTenant = {
  name: "Zoptal Default",
  slug: "default",
  contact: {
    name: "System Administrator",
    email: "admin@zoptal.com"
  },
  subscription: {
    plan: "enterprise",
    status: "active"
  },
  isolationStrategy: "schema"
};

// Create tenant via API
curl -X POST http://tenant-service/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d @default-tenant.json
```

#### 2.2 Migrate Existing Data
```javascript
// Run data migration script
const migrationScript = `
  // Move existing users to default tenant
  db.users.updateMany({}, { 
    $set: { 
      tenantId: "tenant_default_id",
      migratedAt: new Date()
    }
  });

  // Move existing projects to default tenant
  db.projects.updateMany({}, { 
    $set: { 
      tenantId: "tenant_default_id",
      migratedAt: new Date()
    }
  });

  // Update collection names for schema isolation
  db.users.renameCollection("tenant_default_users");
  db.projects.renameCollection("tenant_default_projects");
  db.files.renameCollection("tenant_default_files");
`;

// Execute migration
kubectl exec -it deployment/tenant-service -n zoptal-multi-tenant -- \
  node scripts/migrate-existing-data.js
```

### Phase 3: Service Integration (Day 3-5)

#### 3.1 Update Existing Services
```javascript
// Update each service to include tenant identification
// Example for auth-service

// Add tenant middleware to all routes
const { identifyTenant, enforceDataIsolation } = require('./middleware/tenant-isolation');

app.use(identifyTenant);
app.use(enforceDataIsolation);

// Update database queries to include tenant filter
const getTenantModel = (req, modelName) => {
  return req.getTenantModel(modelName);
};

// Example user query with tenant isolation
const getUsers = async (req, res) => {
  const User = getTenantModel(req, 'User');
  const users = await User.find({ status: 'active' });
  res.json(users);
};
```

#### 3.2 Update API Gateway
```yaml
# Update nginx configuration for tenant routing
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-gateway-config
data:
  nginx.conf: |
    # Add tenant identification
    map $host $tenant_id {
        ~^(?<tenant>[^.]+)\.zoptal\.com$ $tenant;
    }
    
    # Forward tenant context to services
    location /api/ {
        proxy_set_header X-Tenant-ID $tenant_id;
        proxy_pass http://backend-services;
    }
```

#### 3.3 Update Frontend Applications
```javascript
// Update frontend to handle tenant context
// Add tenant detection
const detectTenant = () => {
  const host = window.location.hostname;
  const subdomain = host.split('.')[0];
  return subdomain !== 'www' ? subdomain : null;
};

// Include tenant in API calls
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'X-Tenant-ID': detectTenant()
  }
});
```

### Phase 4: Testing and Validation (Day 5-7)

#### 4.1 Tenant Isolation Testing
```bash
# Create test tenants
curl -X POST http://tenant-service/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tenant A",
    "slug": "test-a",
    "contact": {"name": "Test User", "email": "test-a@example.com"}
  }'

curl -X POST http://tenant-service/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tenant B", 
    "slug": "test-b",
    "contact": {"name": "Test User", "email": "test-b@example.com"}
  }'

# Test data isolation
# Create data in tenant A
curl -X POST http://test-a.zoptal.com/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Tenant A Project"}'

# Verify data not visible in tenant B
curl http://test-b.zoptal.com/api/projects
# Should not return Tenant A's project
```

#### 4.2 Performance Testing
```bash
# Load test with multiple tenants
k6 run --vus 50 --duration 5m scripts/load-test-multi-tenant.js

# Monitor resource usage
kubectl top pods -n zoptal-multi-tenant
kubectl top nodes
```

#### 4.3 Security Testing
```bash
# Test tenant isolation at database level
kubectl exec -it mongodb-primary -- mongo --eval "
  use tenant_test_a_db;
  db.projects.find({});
  use tenant_test_b_db;
  db.projects.find({});
"

# Verify no cross-tenant data leakage
# Test API with wrong tenant headers
curl -H "X-Tenant-ID: test-a" http://test-b.zoptal.com/api/projects
# Should return error or empty results
```

### Phase 5: Production Cutover (Day 7-8)

#### 5.1 Pre-Cutover Checklist
- [ ] All services updated with tenant middleware
- [ ] Database migration completed and verified
- [ ] Monitoring and alerting configured
- [ ] Backup systems tested
- [ ] Rollback plan prepared
- [ ] Team notifications sent

#### 5.2 Cutover Process
```bash
# 1. Enable maintenance mode
kubectl patch deployment api-gateway -p '{"spec":{"replicas":0}}'

# 2. Final data sync
kubectl exec -it deployment/tenant-service -n zoptal-multi-tenant -- \
  node scripts/final-data-sync.js

# 3. Update DNS to point to new tenant-aware gateway
# Update DNS records to point to tenant-isolation-gateway

# 4. Deploy updated services
kubectl set image deployment/auth-service auth-service=zoptal/auth-service:v2.0.0
kubectl set image deployment/project-service project-service=zoptal/project-service:v2.0.0
kubectl set image deployment/ai-service ai-service=zoptal/ai-service:v2.0.0

# 5. Verify services are running
kubectl get pods -n zoptal-production
kubectl get pods -n zoptal-multi-tenant

# 6. Test critical paths
curl http://default.zoptal.com/api/health
curl http://default.zoptal.com/api/projects

# 7. Disable maintenance mode
kubectl patch deployment api-gateway -p '{"spec":{"replicas":3}}'
```

#### 5.3 Post-Cutover Validation
```bash
# Monitor application metrics
kubectl logs -f deployment/tenant-service -n zoptal-multi-tenant
kubectl logs -f deployment/tenant-isolation-gateway -n zoptal-multi-tenant

# Check database connections
kubectl exec -it deployment/tenant-service -n zoptal-multi-tenant -- \
  node scripts/check-db-connections.js

# Verify monitoring and alerting
curl http://prometheus:9090/api/v1/query?query=up{job="tenant-service"}
```

## 🔧 Rollback Procedure

If issues are encountered during migration:

### Immediate Rollback (< 1 hour)
```bash
# 1. Switch DNS back to original services
# Update DNS records

# 2. Scale down tenant services
kubectl scale deployment tenant-service --replicas=0 -n zoptal-multi-tenant
kubectl scale deployment tenant-isolation-gateway --replicas=0 -n zoptal-multi-tenant

# 3. Scale up original services
kubectl scale deployment api-gateway --replicas=3 -n zoptal-production
kubectl scale deployment auth-service --replicas=3 -n zoptal-production

# 4. Restore database from backup if needed
kubectl exec -it mongodb-primary -- mongorestore --drop /backup/pre-migration/
```

### Data Rollback (if data corruption occurs)
```bash
# 1. Stop all services
kubectl scale deployment --all --replicas=0 -n zoptal-production
kubectl scale deployment --all --replicas=0 -n zoptal-multi-tenant

# 2. Restore database from backup
kubectl exec -it mongodb-primary -- mongorestore --drop /backup/pre-migration/

# 3. Restart original services
kubectl scale deployment --all --replicas=3 -n zoptal-production

# 4. Verify data integrity
kubectl exec -it deployment/auth-service -n zoptal-production -- \
  node scripts/verify-data-integrity.js
```

## 📊 Post-Migration Tasks

### 1. Monitoring Setup
```bash
# Create tenant-specific dashboards
kubectl apply -f k8s/monitoring/tenant-dashboards.yaml

# Set up alerts for tenant metrics
kubectl apply -f k8s/monitoring/tenant-alerts.yaml
```

### 2. Documentation Updates
- [ ] Update API documentation with tenant context
- [ ] Create tenant onboarding guide
- [ ] Update operational runbooks
- [ ] Create troubleshooting guides

### 3. Team Training
- [ ] Multi-tenant architecture overview
- [ ] Tenant management procedures
- [ ] Monitoring and alerting changes
- [ ] Incident response updates

## 🚨 Troubleshooting

### Common Issues

#### 1. Tenant Not Found Errors
```bash
# Check tenant service logs
kubectl logs -f deployment/tenant-service -n zoptal-multi-tenant

# Verify tenant exists in database
kubectl exec -it mongodb-primary -- mongo zoptal --eval "
  db.tenants.find({slug: 'problem-tenant'});
"

# Check DNS resolution
nslookup problem-tenant.zoptal.com
```

#### 2. Database Connection Issues
```bash
# Check database connections
kubectl exec -it deployment/tenant-service -n zoptal-multi-tenant -- \
  node -e "
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI);
    mongoose.connection.on('connected', () => console.log('Connected'));
    mongoose.connection.on('error', console.error);
  "

# Verify tenant schema exists
kubectl exec -it mongodb-primary -- mongo zoptal --eval "
  db.runCommand('listCollections').cursor.firstBatch.forEach(
    collection => {
      if (collection.name.startsWith('tenant_')) {
        print(collection.name);
      }
    }
  );
"
```

#### 3. Performance Issues
```bash
# Check resource usage
kubectl top pods -n zoptal-multi-tenant
kubectl describe hpa tenant-service-hpa -n zoptal-multi-tenant

# Monitor database performance
kubectl exec -it mongodb-primary -- mongo --eval "db.serverStatus().connections"

# Check network policies
kubectl describe networkpolicy tenant-isolation-policy -n zoptal-multi-tenant
```

## 📋 Success Criteria

The migration is considered successful when:

- [ ] All existing functionality works with tenant isolation
- [ ] New tenants can be created and provisioned automatically
- [ ] Data isolation is verified between tenants
- [ ] Performance meets or exceeds pre-migration benchmarks
- [ ] Monitoring and alerting are functioning
- [ ] Security testing passes
- [ ] Team is trained on new architecture
- [ ] Documentation is updated
- [ ] Rollback procedures are tested and documented

## 📞 Support Contacts

- **Migration Lead**: [Name] - [email]
- **Database Team**: [Name] - [email]  
- **Infrastructure Team**: [Name] - [email]
- **Security Team**: [Name] - [email]
- **DevOps Team**: [Name] - [email]

## 📚 Additional Resources

- [Multi-Tenant Architecture Documentation](./architecture-overview.md)
- [Tenant Management API Reference](./api-reference.md)
- [Security Best Practices](./security-guide.md)
- [Performance Tuning Guide](./performance-guide.md)
- [Monitoring and Alerting Setup](./monitoring-guide.md)

---

*This migration guide should be customized based on your specific environment and requirements. Always test thoroughly in a staging environment before production migration.*