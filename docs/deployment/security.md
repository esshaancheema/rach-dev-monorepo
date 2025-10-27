# Security Best Practices

This document outlines comprehensive security measures and best practices for deploying and maintaining the Zoptal platform securely.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Network Security](#network-security)
3. [Container Security](#container-security)
4. [Secret Management](#secret-management)
5. [Authentication & Authorization](#authentication--authorization)
6. [Data Protection](#data-protection)
7. [Monitoring & Audit](#monitoring--audit)
8. [Compliance](#compliance)
9. [Incident Response](#incident-response)
10. [Security Checklist](#security-checklist)

## Security Architecture

### Defense in Depth

The Zoptal platform implements multiple layers of security:

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    WAF + DDoS Protection                    │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│              Load Balancer + SSL Termination               │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  Kubernetes Ingress                        │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│              Application Services (Private)                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Auth Service│ │Project Svc  │ │  AI Service │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│              Database Layer (Private Subnets)              │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │ PostgreSQL  │ │    Redis    │                           │
│  └─────────────┘ └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Zero Trust Architecture

- **No implicit trust**: Every request is verified
- **Principle of least privilege**: Minimal required permissions
- **Continuous verification**: Regular security checks
- **Microsegmentation**: Network isolation between services

## Network Security

### VPC Configuration

```hcl
# Terraform configuration for secure VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "zoptal-vpc"
  }
}

# Private subnets for services
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "zoptal-private-${count.index + 1}"
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# Public subnets for load balancers only
resource "aws_subnet" "public" {
  count                   = 3
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 101}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "zoptal-public-${count.index + 1}"
    "kubernetes.io/role/elb" = "1"
  }
}
```

### Network Policies

```yaml
# Default deny all network policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

---
# Allow auth service communication
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: auth-service-policy
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: auth-service
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: api-gateway
    ports:
    - protocol: TCP
      port: 4000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  # Allow external API calls (HTTPS only)
  - to: []
    ports:
    - protocol: TCP
      port: 443
```

### WAF Configuration

```yaml
# AWS WAF rules for application protection
Resources:
  ZoptalWebACL:
    Type: AWS::WAFv2::WebACL
    Properties:
      Name: zoptal-waf
      Scope: REGIONAL
      DefaultAction:
        Allow: {}
      Rules:
        - Name: RateLimitRule
          Priority: 1
          Statement:
            RateBasedStatement:
              Limit: 2000
              AggregateKeyType: IP
          Action:
            Block: {}
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: RateLimitRule

        - Name: SQLInjectionRule
          Priority: 2
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesSQLiRuleSet
          OverrideAction:
            None: {}
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: SQLInjectionRule

        - Name: XSSRule
          Priority: 3
          Statement:
            ManagedRuleGroupStatement:
              VendorName: AWS
              Name: AWSManagedRulesCommonRuleSet
          OverrideAction:
            None: {}
          VisibilityConfig:
            SampledRequestsEnabled: true
            CloudWatchMetricsEnabled: true
            MetricName: XSSRule
```

## Container Security

### Secure Base Images

```dockerfile
# Use official, minimal base images
FROM node:18-alpine AS base

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Copy source code
COPY --chown=nextjs:nodejs . .

# Remove unnecessary files
RUN rm -rf .git .gitignore README.md docs/

# Use non-root user
USER nextjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
```

### Security Context

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        runAsGroup: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      containers:
      - name: auth-service
        image: zoptal/auth-service:latest
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1001
          capabilities:
            drop:
            - ALL
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: app-cache
          mountPath: /app/.cache
      volumes:
      - name: tmp
        emptyDir: {}
      - name: app-cache
        emptyDir: {}
```

### Image Scanning

```yaml
# GitHub Actions for image scanning
name: Security Scan
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Build image
      run: docker build -t test-image .
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'test-image'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'
    
    - name: Fail on high vulnerabilities
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: 'test-image'
        exit-code: '1'
        severity: 'CRITICAL,HIGH'
```

## Secret Management

### Kubernetes Secrets

```bash
# Create secrets with proper labeling
kubectl create secret generic auth-secrets \
  --from-literal=jwt-secret=$(openssl rand -base64 32) \
  --from-literal=database-url="postgresql://user:pass@host:5432/db" \
  --from-literal=redis-url="redis://host:6379" \
  --dry-run=client -o yaml | \
  kubectl label --local -f - \
    app=auth-service \
    component=secrets \
    managed-by=kubectl \
    -o yaml | \
  kubectl apply -f -
```

### AWS Secrets Manager Integration

```yaml
# External Secrets Operator configuration
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: default
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: auth-service-secrets
  namespace: default
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: auth-secrets
    creationPolicy: Owner
  data:
  - secretKey: jwt-secret
    remoteRef:
      key: zoptal/auth/jwt-secret
  - secretKey: database-url
    remoteRef:
      key: zoptal/database/url
```

### Secret Rotation

```bash
#!/bin/bash
# Secret rotation script

# Rotate JWT secrets
NEW_JWT_SECRET=$(openssl rand -base64 32)
kubectl patch secret auth-secrets -p "{\"data\":{\"jwt-secret\":\"$(echo -n $NEW_JWT_SECRET | base64)\"}}"

# Rotate database passwords
NEW_DB_PASSWORD=$(openssl rand -base64 16)
kubectl patch secret postgres-secret -p "{\"data\":{\"password\":\"$(echo -n $NEW_DB_PASSWORD | base64)\"}}"

# Update database password
kubectl exec -it postgres-pod -- psql -U postgres -c "ALTER USER app_user PASSWORD '$NEW_DB_PASSWORD';"

# Restart affected services
kubectl rollout restart deployment/auth-service
kubectl rollout restart deployment/project-service

# Verify rollout
kubectl rollout status deployment/auth-service
kubectl rollout status deployment/project-service
```

## Authentication & Authorization

### RBAC Configuration

```yaml
# Service account for auth service
apiVersion: v1
kind: ServiceAccount
metadata:
  name: auth-service
  namespace: default

---
# Role for auth service
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: auth-service-role
  namespace: default
rules:
- apiGroups: [""]
  resources: ["secrets", "configmaps"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]

---
# Role binding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: auth-service-binding
  namespace: default
subjects:
- kind: ServiceAccount
  name: auth-service
  namespace: default
roleRef:
  kind: Role
  name: auth-service-role
  apiGroup: rbac.authorization.k8s.io

---
# Admin cluster role (restricted)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: zoptal-admin
rules:
- apiGroups: [""]
  resources: ["pods", "services", "endpoints", "persistentvolumeclaims"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses", "networkpolicies"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
```

### Pod Security Standards

```yaml
# Pod Security Policy (deprecated) / Pod Security Standards
apiVersion: v1
kind: Namespace
metadata:
  name: zoptal-production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted

---
# Security context constraints for OpenShift
apiVersion: security.openshift.io/v1
kind: SecurityContextConstraints
metadata:
  name: zoptal-scc
allowHostDirVolumePlugin: false
allowHostIPC: false
allowHostNetwork: false
allowHostPID: false
allowPrivilegedContainer: false
allowedCapabilities: []
defaultAddCapabilities: []
requiredDropCapabilities:
- ALL
runAsUser:
  type: MustRunAsNonRoot
seLinuxContext:
  type: MustRunAs
fsGroup:
  type: MustRunAs
```

### Multi-Factor Authentication

```typescript
// MFA implementation in auth service
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

export class MFAService {
  async enableMFA(userId: string, userEmail: string): Promise<{ secret: string; qrCode: string }> {
    const secret = authenticator.generateSecret();
    const serviceName = 'Zoptal';
    const otpauthUrl = authenticator.keyuri(userEmail, serviceName, secret);
    
    // Generate QR code
    const qrCode = await qrcode.toDataURL(otpauthUrl);
    
    // Store secret in database (encrypted)
    await this.userService.updateMFASecret(userId, this.encrypt(secret));
    
    return { secret, qrCode };
  }

  async verifyMFA(userId: string, token: string): Promise<boolean> {
    const user = await this.userService.findById(userId);
    if (!user.mfaSecret) {
      throw new Error('MFA not enabled for user');
    }
    
    const secret = this.decrypt(user.mfaSecret);
    return authenticator.verify({ token, secret, window: 1 });
  }

  private encrypt(text: string): string {
    // Implement AES encryption
    const cipher = crypto.createCipher('aes-256-cbc', process.env.MFA_ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decrypt(encryptedText: string): string {
    // Implement AES decryption
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.MFA_ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

## Data Protection

### Encryption at Rest

```yaml
# Database encryption configuration
apiVersion: v1
kind: Secret
metadata:
  name: postgres-encryption-key
type: Opaque
data:
  key: <base64-encoded-key>

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  template:
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: zoptal
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        command:
        - postgres
        - -c
        - ssl=on
        - -c
        - ssl_cert_file=/etc/ssl/certs/server.crt
        - -c
        - ssl_key_file=/etc/ssl/private/server.key
        - -c
        - shared_preload_libraries=pg_stat_statements
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
        - name: ssl-certs
          mountPath: /etc/ssl/certs
        - name: ssl-keys
          mountPath: /etc/ssl/private
      volumes:
      - name: postgres-data
        persistentVolumeClaim:
          claimName: postgres-pvc
      - name: ssl-certs
        secret:
          secretName: postgres-ssl-certs
      - name: ssl-keys
        secret:
          secretName: postgres-ssl-keys
          defaultMode: 0600
```

### Encryption in Transit

```yaml
# TLS configuration for services
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-certificate>
  tls.key: <base64-encoded-private-key>

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: zoptal-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/ssl-protocols: "TLSv1.2 TLSv1.3"
    nginx.ingress.kubernetes.io/ssl-ciphers: "ECDHE-RSA-AES128-GCM-SHA256,ECDHE-RSA-AES256-GCM-SHA384"
spec:
  tls:
  - hosts:
    - api.zoptal.com
    - app.zoptal.com
    secretName: tls-secret
  rules:
  - host: api.zoptal.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
```

### Data Anonymization

```typescript
// Data anonymization service
export class DataAnonymizationService {
  async anonymizeUser(userId: string): Promise<void> {
    const user = await this.userService.findById(userId);
    
    // Anonymize PII
    const anonymizedData = {
      email: this.anonymizeEmail(user.email),
      firstName: 'Anonymous',
      lastName: 'User',
      phone: null,
      avatar: null,
      // Keep non-PII data for analytics
      createdAt: user.createdAt,
      role: user.role,
      status: 'anonymized'
    };
    
    await this.userService.update(userId, anonymizedData);
    
    // Anonymize related data
    await this.anonymizeUserProjects(userId);
    await this.anonymizeUserAnalytics(userId);
  }

  private anonymizeEmail(email: string): string {
    const [username, domain] = email.split('@');
    const anonymizedUsername = 'user_' + crypto.randomBytes(8).toString('hex');
    return `${anonymizedUsername}@${domain}`;
  }

  async deleteUserData(userId: string): Promise<void> {
    // Hard delete user and all related data
    await this.userService.hardDelete(userId);
    await this.projectService.deleteUserProjects(userId);
    await this.analyticsService.deleteUserData(userId);
    await this.notificationService.deleteUserPreferences(userId);
  }
}
```

## Monitoring & Audit

### Security Monitoring

```yaml
# Falco security monitoring
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: falco
  namespace: falco-system
spec:
  selector:
    matchLabels:
      app: falco
  template:
    metadata:
      labels:
        app: falco
    spec:
      serviceAccount: falco
      hostNetwork: true
      hostPID: true
      containers:
      - name: falco
        image: falcosecurity/falco:latest
        args:
        - /usr/bin/falco
        - --cri=/run/containerd/containerd.sock
        - --k8s-api
        - --k8s-api-cert=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        - --k8s-api-token=/var/run/secrets/kubernetes.io/serviceaccount/token
        volumeMounts:
        - name: dev
          mountPath: /host/dev
        - name: proc
          mountPath: /host/proc
        - name: boot
          mountPath: /host/boot
        - name: lib-modules
          mountPath: /host/lib/modules
        - name: usr
          mountPath: /host/usr
        - name: etc
          mountPath: /host/etc
        - name: containerd-socket
          mountPath: /run/containerd/containerd.sock
      volumes:
      - name: dev
        hostPath:
          path: /dev
      - name: proc
        hostPath:
          path: /proc
      - name: boot
        hostPath:
          path: /boot
      - name: lib-modules
        hostPath:
          path: /lib/modules
      - name: usr
        hostPath:
          path: /usr
      - name: etc
        hostPath:
          path: /etc
      - name: containerd-socket
        hostPath:
          path: /run/containerd/containerd.sock
```

### Audit Logging

```typescript
// Audit logging service
export class AuditService {
  private readonly logger = new Logger('AuditService');

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditLog = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      userId: event.userId,
      userEmail: event.userEmail,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      success: event.success,
      details: event.details,
      severity: event.severity || 'INFO'
    };

    // Log to multiple destinations
    await Promise.all([
      this.logToDatabase(auditLog),
      this.logToCloudWatch(auditLog),
      this.logToSIEM(auditLog)
    ]);

    // Send alerts for high severity events
    if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
      await this.sendSecurityAlert(auditLog);
    }
  }

  private async logToDatabase(log: AuditLog): Promise<void> {
    await this.auditRepository.create(log);
  }

  private async logToCloudWatch(log: AuditLog): Promise<void> {
    const params = {
      logGroupName: '/zoptal/security/audit',
      logStreamName: `audit-${new Date().toISOString().split('T')[0]}`,
      logEvents: [{
        timestamp: Date.now(),
        message: JSON.stringify(log)
      }]
    };
    
    await this.cloudWatchLogs.putLogEvents(params).promise();
  }

  private async sendSecurityAlert(log: AuditLog): Promise<void> {
    const alert = {
      title: `Security Alert: ${log.eventType}`,
      description: `${log.action} on ${log.resource} by ${log.userEmail}`,
      severity: log.severity,
      timestamp: log.timestamp,
      details: log
    };

    await this.notificationService.sendSecurityAlert(alert);
  }
}

// Usage in middleware
export const auditMiddleware = (eventType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const success = res.statusCode < 400;
      
      auditService.logSecurityEvent({
        type: eventType,
        userId: req.user?.id,
        userEmail: req.user?.email,
        action: req.method,
        resource: req.originalUrl,
        resourceId: req.params.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success,
        details: success ? undefined : data,
        severity: success ? 'INFO' : 'MEDIUM'
      });

      return originalSend.call(this, data);
    };

    next();
  };
};
```

### Intrusion Detection

```yaml
# Network intrusion detection with Suricata
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: suricata
  namespace: security-monitoring
spec:
  selector:
    matchLabels:
      app: suricata
  template:
    metadata:
      labels:
        app: suricata
    spec:
      hostNetwork: true
      containers:
      - name: suricata
        image: jasonish/suricata:latest
        command:
        - suricata
        - -c
        - /etc/suricata/suricata.yaml
        - -i
        - eth0
        volumeMounts:
        - name: suricata-config
          mountPath: /etc/suricata
        - name: suricata-logs
          mountPath: /var/log/suricata
      volumes:
      - name: suricata-config
        configMap:
          name: suricata-config
      - name: suricata-logs
        hostPath:
          path: /var/log/suricata
```

## Compliance

### GDPR Compliance

```typescript
// GDPR compliance service
export class GDPRService {
  async handleDataSubjectRequest(request: DataSubjectRequest): Promise<void> {
    switch (request.type) {
      case 'ACCESS':
        await this.handleAccessRequest(request);
        break;
      case 'RECTIFICATION':
        await this.handleRectificationRequest(request);
        break;
      case 'ERASURE':
        await this.handleErasureRequest(request);
        break;
      case 'PORTABILITY':
        await this.handlePortabilityRequest(request);
        break;
      case 'RESTRICTION':
        await this.handleRestrictionRequest(request);
        break;
    }
  }

  private async handleAccessRequest(request: DataSubjectRequest): Promise<void> {
    const userData = await this.collectUserData(request.userId);
    const exportFile = await this.generateDataExport(userData);
    
    await this.notificationService.sendDataExport(request.email, exportFile);
    await this.auditService.logGDPRRequest(request, 'COMPLETED');
  }

  private async handleErasureRequest(request: DataSubjectRequest): Promise<void> {
    // Check for legal basis to retain data
    const retentionCheck = await this.checkDataRetentionRequirements(request.userId);
    
    if (retentionCheck.canDelete) {
      await this.dataAnonymizationService.deleteUserData(request.userId);
    } else {
      await this.dataAnonymizationService.anonymizeUser(request.userId);
    }
    
    await this.auditService.logGDPRRequest(request, 'COMPLETED');
  }

  private async collectUserData(userId: string): Promise<UserDataExport> {
    const [user, projects, analytics, billing] = await Promise.all([
      this.userService.findById(userId),
      this.projectService.findByUserId(userId),
      this.analyticsService.findByUserId(userId),
      this.billingService.findByUserId(userId)
    ]);

    return {
      user,
      projects,
      analytics: this.anonymizeAnalytics(analytics),
      billing: this.sanitizeBilling(billing)
    };
  }
}
```

### SOC 2 Controls

```yaml
# Access control policies
apiVersion: v1
kind: ConfigMap
metadata:
  name: access-control-policy
data:
  policy.yaml: |
    # Access Control Policy
    version: "1.0"
    
    roles:
      admin:
        permissions:
          - "*"
        conditions:
          - mfa_enabled: true
          - session_timeout: 3600
      
      developer:
        permissions:
          - "read:projects"
          - "write:projects"
          - "read:analytics"
        conditions:
          - mfa_enabled: false
          - session_timeout: 7200
      
      user:
        permissions:
          - "read:own_projects"
          - "write:own_projects"
        conditions:
          - session_timeout: 86400
    
    password_policy:
      min_length: 12
      require_uppercase: true
      require_lowercase: true
      require_numbers: true
      require_symbols: true
      max_age_days: 90
      history_count: 12
    
    session_policy:
      max_concurrent_sessions: 3
      idle_timeout: 1800
      absolute_timeout: 28800
```

## Incident Response

### Incident Response Plan

```yaml
# Incident response runbook
apiVersion: v1
kind: ConfigMap
metadata:
  name: incident-response-runbook
data:
  security-incident.md: |
    # Security Incident Response

    ## Phase 1: Detection and Analysis
    1. **Alert Verification**
       - Verify the alert is not a false positive
       - Gather initial information about the incident
       - Classify the incident severity

    2. **Initial Assessment**
       ```bash
       # Check system status
       kubectl get pods --all-namespaces
       kubectl get events --sort-by=.metadata.creationTimestamp
       
       # Check security logs
       kubectl logs -l app=falco -n falco-system
       kubectl logs -l app=auth-service | grep ERROR
       ```

    ## Phase 2: Containment
    1. **Immediate Actions**
       ```bash
       # Block suspicious IPs
       kubectl apply -f - <<EOF
       apiVersion: networking.k8s.io/v1
       kind: NetworkPolicy
       metadata:
         name: block-suspicious-ip
       spec:
         podSelector: {}
         policyTypes:
         - Ingress
         ingress:
         - from:
           - ipBlock:
               cidr: 0.0.0.0/0
               except:
               - 192.168.1.100/32  # Suspicious IP
       EOF
       ```

    2. **User Account Security**
       ```bash
       # Disable compromised user accounts
       kubectl exec -it auth-service-pod -- npm run disable-user -- --user-id=<user-id>
       
       # Force password reset for all users
       kubectl exec -it auth-service-pod -- npm run force-password-reset-all
       ```

    ## Phase 3: Eradication
    1. **Remove Threats**
       - Patch vulnerabilities
       - Update compromised credentials
       - Remove malicious code/files

    2. **System Hardening**
       ```bash
       # Apply security patches
       kubectl set image deployment/auth-service auth-service=zoptal/auth-service:patched-version
       
       # Rotate secrets
       ./scripts/rotate-secrets.sh
       ```

    ## Phase 4: Recovery
    1. **Service Restoration**
       ```bash
       # Restore from backups if needed
       kubectl apply -f k8s/backups/restore-job.yaml
       
       # Verify system integrity
       kubectl exec -it auth-service-pod -- npm run integrity-check
       ```

    ## Phase 5: Lessons Learned
    1. Document the incident
    2. Update security procedures
    3. Implement additional controls
    4. Conduct team training
```

### Automated Response

```typescript
// Automated incident response
export class IncidentResponseService {
  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Log incident
    await this.auditService.logSecurityEvent({
      type: 'SECURITY_INCIDENT',
      severity: 'CRITICAL',
      details: incident
    });

    // Execute automated response based on incident type
    switch (incident.type) {
      case 'BRUTE_FORCE_ATTACK':
        await this.handleBruteForceAttack(incident);
        break;
      case 'SUSPICIOUS_API_USAGE':
        await this.handleSuspiciousAPIUsage(incident);
        break;
      case 'DATA_BREACH':
        await this.handleDataBreach(incident);
        break;
      case 'MALWARE_DETECTED':
        await this.handleMalwareDetection(incident);
        break;
    }

    // Notify security team
    await this.notificationService.sendSecurityAlert(incident);
  }

  private async handleBruteForceAttack(incident: SecurityIncident): Promise<void> {
    // Block IP address
    await this.firewall.blockIP(incident.sourceIP);
    
    // Lock affected user accounts
    for (const userId of incident.affectedUsers) {
      await this.userService.lockAccount(userId, 'Security incident');
    }
    
    // Increase monitoring
    await this.monitoringService.increaseAlertSensitivity(incident.sourceIP);
  }

  private async handleDataBreach(incident: SecurityIncident): Promise<void> {
    // Immediate containment
    await this.containmentService.isolateAffectedSystems(incident.affectedSystems);
    
    // Notify data protection officer
    await this.notificationService.sendDataBreachNotification(incident);
    
    // Prepare GDPR breach notification (72-hour requirement)
    await this.gdprService.prepareBreach Notification(incident);
    
    // Force password reset for affected users
    for (const userId of incident.affectedUsers) {
      await this.userService.forcePasswordReset(userId);
    }
  }
}
```

## Security Checklist

### Pre-Deployment Security Checklist

- [ ] **Container Security**
  - [ ] Base images scanned for vulnerabilities
  - [ ] No secrets in container images
  - [ ] Non-root user configured
  - [ ] Read-only root filesystem
  - [ ] Minimal attack surface (only required packages)

- [ ] **Kubernetes Security**
  - [ ] RBAC configured with least privilege
  - [ ] Pod Security Standards enforced
  - [ ] Network policies implemented
  - [ ] Resource limits set
  - [ ] Security contexts configured

- [ ] **Network Security**
  - [ ] WAF rules configured
  - [ ] SSL/TLS encryption enabled
  - [ ] Internal traffic encrypted
  - [ ] Unnecessary ports closed
  - [ ] Network segmentation implemented

- [ ] **Secret Management**
  - [ ] No hardcoded secrets
  - [ ] Secrets encrypted at rest
  - [ ] Secret rotation implemented
  - [ ] Least privilege access to secrets

- [ ] **Monitoring & Logging**
  - [ ] Security monitoring configured
  - [ ] Audit logging enabled
  - [ ] Log aggregation configured
  - [ ] Alerting rules configured
  - [ ] Incident response procedures documented

### Post-Deployment Security Checklist

- [ ] **Security Testing**
  - [ ] Penetration testing completed
  - [ ] Vulnerability scanning automated
  - [ ] Security regression testing
  - [ ] Code security analysis

- [ ] **Compliance**
  - [ ] GDPR compliance verified
  - [ ] SOC 2 controls implemented
  - [ ] Data retention policies enforced
  - [ ] Privacy policies updated

- [ ] **Operational Security**
  - [ ] Security training completed
  - [ ] Incident response tested
  - [ ] Backup and recovery tested
  - [ ] Access reviews conducted

### Monthly Security Review

- [ ] **Access Review**
  - [ ] User access permissions reviewed
  - [ ] Service account permissions reviewed
  - [ ] API key access reviewed
  - [ ] Admin access reviewed

- [ ] **Vulnerability Management**
  - [ ] Security patches applied
  - [ ] Vulnerability scan results reviewed
  - [ ] Third-party dependency updates
  - [ ] Container image updates

- [ ] **Monitoring Review**
  - [ ] Security alerts reviewed
  - [ ] False positive rates analyzed
  - [ ] Monitoring coverage assessed
  - [ ] Incident response metrics reviewed

---

For additional security resources:
- [OWASP Kubernetes Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html)
- [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- Contact security team: security@zoptal.com