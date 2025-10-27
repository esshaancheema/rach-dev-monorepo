# Zoptal AWS Deployment Plan - Phase 1
> **Cost-Optimized Infrastructure for 0-500 Daily Users**
> 
> Document Version: 1.0  
> Created: September 9, 2025  
> Target Deployment: Next 3-4 days  
> Estimated Monthly Cost: $30-35

## 📋 Executive Summary

This document outlines a **progressive scaling strategy** for deploying the Zoptal monorepo application to AWS. Starting with a minimal Phase 1 infrastructure (~$30/month), the architecture is designed to automatically scale as user demand grows, eventually supporting 50,000+ concurrent users.

### Key Principles
- **Start small, scale smart** - Begin with minimal infrastructure
- **Zero downtime growth** - Seamless transitions between phases
- **Cost optimization first** - Maximize free tiers and reserved capacity
- **Monitoring from day one** - Know when to scale before users notice

---

## 🎯 User Growth Projections & Infrastructure Phases

| Phase | Daily Users | Concurrent Users | Monthly Cost | Infrastructure |
|-------|------------|------------------|--------------|----------------|
| **Phase 1** | 0-100 | 1-10 | $30-35 | Single EC2 + RDS |
| **Phase 2** | 100-500 | 10-50 | $65-85 | Scaled EC2 + Redis |
| **Phase 3** | 500-5,000 | 50-500 | $150-250 | Auto-scaling + ALB |
| **Phase 4** | 5,000-50,000 | 500-5,000 | $500-1,500 | EKS + Aurora |

---

## 🏗️ Phase 1 Infrastructure Details

### Core Components

#### 1. **Compute**
```yaml
Service: EC2
Instance Type: t3.micro
vCPUs: 2 (burstable)
Memory: 1 GB
Storage: 30 GB EBS (gp3)
Cost: $8.50/month
Free Tier: 750 hours/month (12 months)
```

#### 2. **Database**
```yaml
Service: RDS PostgreSQL
Instance Type: db.t4g.micro
vCPUs: 2 (burstable)
Memory: 1 GB
Storage: 20 GB (auto-scaling to 100 GB)
Backup: 7 days automated
Cost: $12.80/month
Free Tier: 750 hours/month (12 months)
```

#### 3. **Storage & CDN**
```yaml
S3 Bucket:
  - Static assets
  - User uploads
  - Backups
  - Cost: ~$2/month

CloudFront:
  - Global CDN
  - SSL/TLS included
  - Cost: Free tier (50 GB/month)
```

#### 4. **Networking**
```yaml
VPC: Custom VPC with public/private subnets
Elastic IP: Static IP for EC2
Security Groups: Restrictive rules
Cost: $3.60/month (if instance stopped)
```

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                     CloudFront CDN                       │
│                    (Static Assets)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │   Route 53 (DNS)     │
         │   (Optional)         │
         └──────────┬───────────┘
                    │
         ┌──────────▼───────────┐
         │   Elastic IP         │
         └──────────┬───────────┘
                    │
    ┌───────────────▼──────────────┐
    │         EC2 Instance         │
    │      (t3.micro - Docker)     │
    │  ┌────────────────────────┐  │
    │  │ Nginx Reverse Proxy    │  │
    │  ├────────────────────────┤  │
    │  │ Web-Main (Port 3000)   │  │
    │  ├────────────────────────┤  │
    │  │ Dashboard (Port 3001)  │  │
    │  ├────────────────────────┤  │
    │  │ Auth Service (4001)    │  │
    │  ├────────────────────────┤  │
    │  │ AI Service (4003)      │  │
    │  └────────────────────────┘  │
    └───────────────┬──────────────┘
                    │
         ┌──────────▼───────────┐
         │   RDS PostgreSQL     │
         │   (db.t4g.micro)     │
         └──────────────────────┘
```

---

## 💰 Detailed Cost Breakdown

### Phase 1 Monthly Costs
| Service | Specification | Cost/Month | Free Tier? |
|---------|--------------|------------|------------|
| EC2 t3.micro | 2 vCPU, 1GB RAM | $8.50 | ✅ 750 hrs |
| RDS t4g.micro | PostgreSQL 15 | $12.80 | ✅ 750 hrs |
| EBS Storage | 30GB gp3 | $2.40 | ❌ |
| RDS Storage | 20GB | $2.30 | ✅ 20GB free |
| Data Transfer | ~50GB | $4.50 | ✅ 100GB free |
| Elastic IP | When stopped | $3.60 | ❌ |
| S3 Storage | ~5GB | $0.12 | ✅ 5GB free |
| CloudWatch | Basic metrics | $0.00 | ✅ 10 metrics |
| **Total** | **First Year** | **~$15** | |
| **Total** | **After Free Tier** | **~$34** | |

### Cost Optimization Tips
1. **Use AWS Free Tier** - New accounts get 12 months free
2. **Stop instances when not needed** - Dev/staging environments
3. **Use Spot Instances** - 70% discount for non-critical workloads
4. **Reserve instances** - 40% discount with 1-year commitment
5. **Implement caching** - Reduce database queries by 80%

---

## 🚀 Deployment Steps

### Prerequisites Checklist
- [ ] AWS Account created
- [ ] AWS CLI installed locally
- [ ] Docker & Docker Compose understanding
- [ ] Domain name (optional for Phase 1)
- [ ] SSL certificate (free via Let's Encrypt)

### Step 1: AWS Account Setup
```bash
# Install AWS CLI
brew install awscli  # macOS
# or
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

# Configure credentials
aws configure
# AWS Access Key ID: [Your Key]
# AWS Secret Access Key: [Your Secret]
# Default region: us-east-1
# Default output: json

# Verify setup
aws sts get-caller-identity
```

### Step 2: Terraform Initialization
```bash
# Navigate to Phase 1 directory
cd terraform/environments/phase1-minimal/

# Initialize Terraform
terraform init

# Create terraform.tfvars from example
cp terraform.tfvars.example terraform.tfvars
# Edit with your values

# Review infrastructure plan
terraform plan

# Deploy infrastructure
terraform apply
```

### Step 3: Application Deployment
```bash
# SSH to EC2 instance
ssh -i your-key.pem ec2-user@your-elastic-ip

# Deploy application
git clone https://github.com/your-repo/zoptal-monorepo.git
cd zoptal-monorepo
./deploy-phase1.sh

# Verify services
docker-compose ps
curl http://localhost:3000/health
curl http://localhost:3001/health
```

### Step 4: Domain & SSL Setup (Optional)
```bash
# Point domain to Elastic IP
# A Record: @ -> Your-Elastic-IP
# CNAME: www -> @

# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📊 Monitoring & Alerts

### CloudWatch Alarms (Phase 1)
```yaml
CPU Utilization:
  Threshold: > 80% for 5 minutes
  Action: Send email notification
  
Memory Utilization:
  Threshold: > 85%
  Action: Send email + consider scaling

Database Connections:
  Threshold: > 80% of max_connections
  Action: Alert + review connection pooling

Disk Space:
  Threshold: > 80%
  Action: Clean logs or expand storage

4XX/5XX Errors:
  Threshold: > 1% of requests
  Action: Investigate immediately
```

### Free Monitoring Tools
1. **AWS CloudWatch** - 10 custom metrics free
2. **UptimeRobot** - 50 monitors free
3. **Sentry** - 5,000 errors/month free
4. **Better Stack** - 10 monitors free

---

## 🔄 Auto-Scaling Strategy

### Phase 1 → Phase 2 Triggers
```javascript
if (
  daily_active_users > 100 ||
  avg_response_time > 500ms ||
  peak_concurrent_users > 50 ||
  cpu_utilization > 80% sustained ||
  database_connections > 80%
) {
  trigger_phase2_migration();
}
```

### Scaling Preparation Checklist
- [ ] AMI created with current configuration
- [ ] Database backup automated
- [ ] Deployment scripts ready
- [ ] Load balancer configuration prepared
- [ ] Redis configuration tested locally

---

## 🔐 Security Best Practices

### Phase 1 Security Measures
1. **Network Security**
   - Private subnets for RDS
   - Security groups with minimal ports
   - No SSH, use Systems Manager

2. **Application Security**
   - Environment variables in Secrets Manager
   - HTTPS only with SSL/TLS
   - Rate limiting implemented

3. **Data Security**
   - Encrypted RDS storage
   - S3 bucket encryption
   - Regular automated backups

4. **Access Control**
   - IAM roles for EC2
   - MFA for AWS console
   - Principle of least privilege

---

## 📈 Performance Optimization

### Application-Level Optimizations
```javascript
// 1. Enable Next.js static optimization
export const revalidate = 3600; // Cache for 1 hour

// 2. Implement connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 3. Add Redis caching (Phase 2)
const cached = await redis.get(key);
if (cached) return JSON.parse(cached);

// 4. Optimize images
import Image from 'next/image';
<Image src={url} width={800} height={600} priority={false} />
```

### Database Optimizations
```sql
-- Essential indexes for Phase 1
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Connection pooling settings
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '750MB';
```

---

## 🗓️ Implementation Timeline

### Week 1: Infrastructure Setup
- **Day 1-2**: AWS account setup, Terraform deployment
- **Day 3-4**: Application deployment, initial testing
- **Day 5-7**: Monitoring setup, performance baseline

### Week 2: Trial Run
- **Day 8-10**: Internal testing (5-10 users)
- **Day 11-14**: Closed beta (20-30 users)

### Week 3: Beta Launch
- **Day 15-17**: Open beta announcement
- **Day 18-21**: Monitor and optimize

### Week 4: Production Ready
- **Day 22-24**: Final optimizations
- **Day 25-28**: Production launch preparation

---

## 🛠️ Troubleshooting Guide

### Common Issues & Solutions

#### High Memory Usage
```bash
# Check memory usage
free -h
docker stats

# Solution
docker system prune -a
# Increase swap space if needed
```

#### Database Connection Errors
```bash
# Check connections
SELECT count(*) FROM pg_stat_activity;

# Solution: Optimize connection pool
# Reduce max connections per service
```

#### Slow Response Times
```bash
# Check CPU credits
aws ec2 describe-instances --instance-ids i-xxx \
  --query 'Reservations[0].Instances[0].CpuOptions'

# Solution: Upgrade to t3.small or implement caching
```

---

## 📚 Required Environment Variables

### Essential for Phase 1
```env
# Database
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/zoptal

# Authentication
JWT_SECRET=generate-secure-random-string
NEXTAUTH_SECRET=generate-secure-random-string
NEXTAUTH_URL=http://your-domain.com

# AWS Services
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=zoptal-assets

# Optional for Phase 1
OPENAI_API_KEY=sk-... (can use test key)
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG... (use free tier)
```

---

## 🎯 Success Metrics

### Phase 1 KPIs
- **Uptime**: > 99.5%
- **Response Time**: < 300ms average
- **Error Rate**: < 0.5%
- **Cost per User**: < $0.35
- **Page Load Speed**: < 2 seconds

### Monitoring Dashboard
```yaml
Create custom CloudWatch dashboard with:
- Request count and latency
- Error rates (4xx, 5xx)
- CPU and memory utilization
- Database connections
- Active users
- Cost tracking
```

---

## 📞 Support & Next Steps

### When You're Ready to Deploy
1. **Review this document** thoroughly
2. **Set up AWS account** with billing alerts
3. **Run through deployment steps** with this guide
4. **Test with small group** before launch

### Resources
- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

### Migration Path
When ready for Phase 2:
1. Enable Redis for caching
2. Add second EC2 instance
3. Implement load balancer
4. Enable RDS Multi-AZ
5. Increase monitoring detail

---

## ✅ Pre-Deployment Checklist

### Technical Requirements
- [ ] AWS account created and verified
- [ ] Billing alerts configured ($35, $50, $75)
- [ ] AWS CLI installed and configured
- [ ] Terraform installed (v1.0+)
- [ ] Docker knowledge refreshed
- [ ] Domain name decided (or use EC2 DNS)

### Project Preparation
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] API keys obtained (or test keys)
- [ ] Git repository accessible
- [ ] Backup strategy defined

### Go-Live Checklist
- [ ] Infrastructure deployed via Terraform
- [ ] Application containers running
- [ ] SSL certificate installed
- [ ] Monitoring alerts active
- [ ] Backup verified
- [ ] Load testing completed
- [ ] Documentation updated

---

**Document maintained by**: Claude & Eshan  
**Last updated**: September 9, 2025  
**Next review**: Before deployment (3-4 days)

---

## 📝 Notes for Implementation

This Phase 1 infrastructure provides:
- **Solid foundation** for growth from 0 to 500 daily users
- **Cost-effective** starting point (~$30/month)
- **Auto-scaling ready** with clear upgrade paths
- **Production-grade** security and monitoring
- **Zero-downtime** migration path to Phase 2

When you're ready to proceed, we'll start with the Terraform deployment and have your application running on AWS within a few hours.