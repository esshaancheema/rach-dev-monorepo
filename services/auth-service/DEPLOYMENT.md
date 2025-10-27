# Zoptal Auth Service - Deployment Guide

This comprehensive guide covers deploying the Zoptal Authentication Service across different environments using Docker, Docker Compose, and Kubernetes.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Production Deployment](#production-deployment)
- [Backup and Recovery](#backup-and-recovery)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Docker**: 20.10+ and Docker Compose 2.0+
- **Node.js**: 18+ (for local development)
- **PostgreSQL**: 15+ (managed or containerized)
- **Redis**: 7+ (managed or containerized)
- **Git**: Latest version

### Production Requirements
- **Kubernetes**: 1.24+ (for K8s deployment)
- **Helm**: 3.8+ (optional, for chart deployment)
- **SSL Certificates**: Valid certificates for HTTPS
- **External Services**: SendGrid, Twilio (configured)

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd services/auth-service

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Development Environment
```bash
# Start with development stack
docker-compose up -d

# With development tools (adminer, redis-commander, mailhog)
docker-compose --profile dev-tools up -d

# View logs
docker-compose logs -f auth-service
```

### 3. Production Environment
```bash
# Deploy to production
./scripts/deploy.sh -e production

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## ⚙️ Environment Configuration

### Required Environment Variables

#### Core Configuration
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port
```

#### Security (Generate with `openssl rand -base64 32`)
```bash
JWT_SECRET=your-super-secure-jwt-secret-32-chars+
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-32-chars+
SESSION_SECRET=your-super-secure-session-secret-32-chars+
ENCRYPTION_KEY=your-32-character-encryption-key-here
```

#### External Services
```bash
SENDGRID_API_KEY=SG.your-sendgrid-api-key
TWILIO_ACCOUNT_SID=AC_your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Environment-Specific Files

Create environment-specific configuration files:

- `.env.development` - Development settings
- `.env.staging` - Staging settings  
- `.env.production` - Production settings

## 🐳 Docker Deployment

### Available Docker Targets

```bash
# Development with hot reload
docker build --target development -t auth-service:dev .

# Production optimized
docker build --target production -t auth-service:prod .
```

### Docker Compose Profiles

```bash
# Basic stack (auth-service, postgres, redis)
docker-compose up -d

# With development tools
docker-compose --profile dev-tools up -d

# With monitoring stack
docker-compose --profile monitoring up -d

# With load balancer
docker-compose --profile load-balancer up -d
```

### Service URLs (Development)

| Service | URL | Description |
|---------|-----|-------------|
| Auth Service | http://localhost:3001 | Main API |
| Health Check | http://localhost:3001/health | Service health |
| API Docs | http://localhost:3001/docs | Swagger UI |
| Database Admin | http://localhost:8080 | Adminer |
| Redis Admin | http://localhost:8081 | Redis Commander |
| Email Testing | http://localhost:8025 | MailHog |
| Monitoring | http://localhost:3001 | Grafana |
| Metrics | http://localhost:9090 | Prometheus |

## ☸️ Kubernetes Deployment

### Prerequisites
```bash
# Create namespace
kubectl create namespace zoptal-auth

# Apply RBAC (if needed)
kubectl apply -f scripts/k8s-rbac.yaml
```

### Deployment Steps

1. **Update Configuration**
   ```bash
   # Edit the ConfigMap and Secret in k8s-deploy.yaml
   nano scripts/k8s-deploy.yaml
   ```

2. **Deploy Services**
   ```bash
   # Apply all resources
   kubectl apply -f scripts/k8s-deploy.yaml

   # Check deployment status
   kubectl get pods -n zoptal-auth
   kubectl get services -n zoptal-auth
   ```

3. **Verify Deployment**
   ```bash
   # Check pod logs
   kubectl logs -f deployment/auth-service -n zoptal-auth

   # Test health endpoint
   kubectl port-forward service/auth-service 3001:80 -n zoptal-auth
   curl http://localhost:3001/health
   ```

### Scaling

```bash
# Manual scaling
kubectl scale deployment auth-service --replicas=5 -n zoptal-auth

# Auto-scaling is configured via HPA in k8s-deploy.yaml
# Scales between 3-10 replicas based on CPU/Memory usage
```

## 🏭 Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations completed
- [ ] External services tested (SendGrid, Twilio)
- [ ] Monitoring stack deployed
- [ ] Backup system configured
- [ ] Load balancer configured
- [ ] DNS records updated
- [ ] Security scan completed

### Deployment Script

```bash
# Full production deployment with all checks
./scripts/deploy.sh -e production -v

# Skip tests (not recommended)
./scripts/deploy.sh -e production --skip-tests

# With cleanup of old images
./scripts/deploy.sh -e production --cleanup
```

### Zero-Downtime Deployment

```bash
# Scale up new instances
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale auth-service=4

# Verify health of new instances
./scripts/health-check.sh -e production

# Traffic will automatically route to healthy instances
# Old instances are automatically removed
```

### SSL Configuration

```bash
# Place certificates in nginx/ssl/ directory
cp your-domain.crt nginx/ssl/
cp your-domain.key nginx/ssl/
cp ca-bundle.crt nginx/ssl/

# Update nginx configuration
nano nginx/nginx.prod.conf
```

## 💾 Backup and Recovery

### Automated Backup Setup

```bash
# Set up automated backups
./scripts/backup-deploy.sh \
  --enable-s3 \
  --schedule-cron \
  --retention 30

# Manual backup
/var/backups/zoptal-auth/backup.sh

# Restore from backup
/var/backups/zoptal-auth/restore.sh backup-file.tar.gz
```

### Backup Components

The backup system includes:
- PostgreSQL database dump
- Redis data snapshot
- Application uploads (avatars, etc.)
- Configuration backup (excluding secrets)

### S3 Backup Configuration

```bash
# Configure AWS credentials
aws configure

# Set S3 bucket name
export S3_BACKUP_BUCKET=your-backup-bucket

# Enable lifecycle policies for cost optimization
# - Standard IA after 30 days
# - Glacier after 90 days
# - Deep Archive after 365 days
```

## 📊 Monitoring and Health Checks

### Health Check Script

```bash
# Basic health check
./scripts/health-check.sh

# Detailed health check with report
./scripts/health-check.sh --detailed --save-report

# Continuous monitoring
./scripts/health-check.sh --continuous --interval 30

# Production health check with alerts
./scripts/health-check.sh \
  -e production \
  --slack-webhook "https://hooks.slack.com/..." \
  --email "ops@yourdomain.com"
```

### Monitoring Stack

When deployed with `--profile monitoring`:

| Service | URL | Purpose |
|---------|-----|---------|
| Grafana | http://localhost:3001 | Dashboards and visualization |
| Prometheus | http://localhost:9090 | Metrics collection |
| AlertManager | http://localhost:9093 | Alert management |
| Loki | http://localhost:3100 | Log aggregation |

### Key Metrics to Monitor

- **Response Time**: API endpoint latency
- **Error Rate**: 4xx/5xx response ratio
- **Throughput**: Requests per second
- **Database**: Connection pool, query time
- **Redis**: Memory usage, hit ratio
- **Circuit Breakers**: Open/closed state
- **Resource Usage**: CPU, memory, disk

### Alerting Rules

Configure alerts for:
- Service down (> 1 minute)
- High error rate (> 5%)
- Slow response time (> 2 seconds)
- Database connection issues
- Redis memory usage (> 80%)
- Circuit breaker open state
- Failed backup operations

## 🔍 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs auth-service

# Common causes:
# - Database connection failed
# - Redis connection failed
# - Environment variables missing
# - Port already in use
```

#### Database Connection Issues
```bash
# Test database connectivity
docker exec postgres pg_isready -U postgres

# Check connection string
echo $DATABASE_URL

# Verify network connectivity
docker network ls
docker network inspect zoptal-network
```

#### Redis Connection Issues
```bash
# Test Redis connectivity
docker exec redis redis-cli ping

# Check Redis logs
docker logs redis

# Verify Redis configuration
docker exec redis redis-cli CONFIG GET "*"
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor slow queries
./scripts/health-check.sh --detailed

# Check circuit breaker status
curl http://localhost:3001/circuit-breaker/status
```

### Debug Mode

```bash
# Enable verbose logging
export LOG_LEVEL=debug

# Enable debug routes (development only)
export ENABLE_DEBUG_ROUTES=true

# View internal metrics
curl http://localhost:3001/metrics

# Check degradation status
curl http://localhost:3001/api/admin/degradation/status
```

### Performance Tuning

#### Database Optimization
```bash
# Adjust connection pool
export DATABASE_POOL_MIN=5
export DATABASE_POOL_MAX=20

# Query timeout
export DATABASE_QUERY_TIMEOUT=30000
```

#### Redis Optimization
```bash
# Memory management
export REDIS_MAXMEMORY=512mb
export REDIS_MAXMEMORY_POLICY=allkeys-lru

# Persistence
export REDIS_SAVE_POLICY="900 1 300 10 60 10000"
```

#### Application Optimization
```bash
# Circuit breaker tuning
export DB_CIRCUIT_BREAKER_THRESHOLD=3
export DB_CIRCUIT_BREAKER_TIMEOUT=30000

# Rate limiting
export RATE_LIMIT_MAX_REQUESTS=200
export RATE_LIMIT_WINDOW=900000
```

## 🚨 Emergency Procedures

### Service Recovery

```bash
# 1. Quick restart
docker-compose restart auth-service

# 2. Full stack restart
docker-compose down && docker-compose up -d

# 3. Emergency rollback
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale auth-service=1

# 4. Database recovery
./scripts/restore.sh latest-backup.tar.gz
```

### Security Incident Response

```bash
# 1. Check for suspicious activity
curl http://localhost:3001/api/admin/degradation/resilience-report

# 2. Review access logs
docker-compose logs auth-service | grep "SUSPICIOUS_ACTIVITY"

# 3. Block suspicious IPs
curl -X POST http://localhost:3001/api/admin/rate-limits/block-ip \
  -H "Content-Type: application/json" \
  -d '{"ip": "suspicious.ip.address", "duration": 3600}'

# 4. Force password reset for affected users
# Use admin dashboard or API endpoints
```

## 📞 Support

### Getting Help

- **Documentation**: Check this deployment guide
- **Health Check**: Run `./scripts/health-check.sh --detailed`
- **Logs**: `docker-compose logs -f auth-service`
- **Metrics**: Visit monitoring dashboard
- **Community**: [GitHub Issues](https://github.com/zoptal/auth-service/issues)

### Reporting Issues

When reporting issues, include:
- Environment details (`docker-compose version`, `kubectl version`)
- Error logs (`docker-compose logs auth-service`)
- Health check results (`./scripts/health-check.sh --detailed`)
- Configuration (without secrets)
- Steps to reproduce

---

**Need help?** Reach out to the development team or create an issue in the repository.