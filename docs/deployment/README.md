# Zoptal Platform Deployment Guide

This comprehensive guide covers deploying the Zoptal platform in various environments, from local development to production-ready Kubernetes clusters on AWS.

## Overview

The Zoptal platform consists of:
- **7 microservices** (auth, project, ai, billing, notification, analytics, web-main)
- **3 Next.js applications** (dashboard, admin, developer-portal)
- **Shared packages** (UI components, database, API clients)
- **Infrastructure components** (PostgreSQL, Redis, monitoring stack)

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [AWS Production Deployment](#aws-production-deployment)
6. [Monitoring and Observability](#monitoring-and-observability)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

- **Docker** (v20.10+) and Docker Compose
- **Node.js** (v18+) and pnpm (v8+)
- **kubectl** (v1.25+)
- **Terraform** (v1.5+)
- **AWS CLI** (v2+)
- **Helm** (v3.10+)

### Required Accounts

- AWS Account with appropriate IAM permissions
- Stripe Account (for billing)
- Email service provider (SendGrid, AWS SES, etc.)
- SMS service provider (Twilio, AWS SNS, etc.)
- AI service accounts (OpenAI, Anthropic, Google AI)

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/zoptal/platform.git
cd platform

# Install dependencies
pnpm install

# Build shared packages
pnpm build:packages
```

### 2. Environment Configuration

```bash
# Copy environment templates
cp .env.example .env
cp services/auth-service/.env.example services/auth-service/.env
cp services/project-service/.env.example services/project-service/.env
# ... repeat for all services

# Edit environment files with your configurations
```

### 3. Database Setup

```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run database migrations
cd packages/database
pnpm prisma migrate dev
pnpm prisma db seed

# Generate Prisma client
pnpm prisma generate
```

### 4. Start Development Servers

```bash
# Start all services in development mode
pnpm dev

# Or start individual services
pnpm dev:auth-service
pnpm dev:project-service
pnpm dev:ai-service
# ... etc
```

### 5. Verify Installation

```bash
# Check service health
curl http://localhost:4000/health  # auth-service
curl http://localhost:4001/health  # project-service
curl http://localhost:4002/health  # ai-service

# Access web applications
open http://localhost:3000  # web-main
open http://localhost:3001  # dashboard
open http://localhost:3002  # admin
```

## Docker Deployment

### 1. Build Images

```bash
# Build all service images
docker-compose build

# Or build specific services
docker-compose build auth-service
docker-compose build project-service
```

### 2. Environment Configuration

```bash
# Create production environment file
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

### 3. Deploy Stack

```bash
# Start the complete stack
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Database Migration

```bash
# Run migrations in production
docker-compose exec auth-service npm run migrate
docker-compose exec project-service npm run migrate
```

## Kubernetes Deployment

### 1. Cluster Setup

#### Option A: Local Kubernetes (Kind/Minikube)

```bash
# Create kind cluster
kind create cluster --config k8s/kind-config.yaml

# Or start minikube
minikube start --memory=8192 --cpus=4
```

#### Option B: AWS EKS

```bash
# Create EKS cluster using Terraform
cd terraform
terraform init
terraform plan
terraform apply

# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name zoptal-cluster
```

### 2. Install Dependencies

```bash
# Install Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \\
  --namespace monitoring --create-namespace

# Install Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \\
  --namespace ingress-nginx --create-namespace

# Install Cert Manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### 3. Create Secrets

```bash
# Database credentials
kubectl create secret generic postgres-secret \\
  --from-literal=username=postgres \\
  --from-literal=password=your-password \\
  --from-literal=database=zoptal

# Redis credentials
kubectl create secret generic redis-secret \\
  --from-literal=password=your-redis-password

# API keys and external service credentials
kubectl create secret generic api-secrets \\
  --from-literal=openai-api-key=your-openai-key \\
  --from-literal=stripe-secret-key=your-stripe-key \\
  --from-literal=sendgrid-api-key=your-sendgrid-key \\
  --from-literal=twilio-auth-token=your-twilio-token

# JWT signing keys
kubectl create secret generic jwt-secret \\
  --from-literal=access-token-secret=your-access-secret \\
  --from-literal=refresh-token-secret=your-refresh-secret
```

### 4. Deploy Infrastructure

```bash
# Deploy PostgreSQL
kubectl apply -f k8s/postgres/

# Deploy Redis
kubectl apply -f k8s/redis/

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis --timeout=300s
```

### 5. Deploy Services

```bash
# Deploy all microservices
kubectl apply -f k8s/services/

# Deploy Next.js applications
kubectl apply -f k8s/apps/

# Deploy ingress and load balancer
kubectl apply -f k8s/ingress/

# Check deployment status
kubectl get deployments
kubectl get services
kubectl get ingress
```

### 6. Verify Deployment

```bash
# Check pod status
kubectl get pods

# Check logs
kubectl logs -l app=auth-service
kubectl logs -l app=project-service

# Port forward for testing
kubectl port-forward service/auth-service 4000:4000
curl http://localhost:4000/health
```

## AWS Production Deployment

### 1. Infrastructure Provisioning

```bash
cd terraform

# Initialize Terraform
terraform init

# Review and customize variables
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply
```

This creates:
- VPC with public/private subnets
- EKS cluster with managed node groups
- RDS PostgreSQL instances
- ElastiCache Redis clusters
- Application Load Balancer
- Route53 DNS records
- SSL certificates
- ECR repositories
- CloudWatch monitoring

### 2. Container Registry Setup

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and push images
./scripts/build-and-push.sh

# Or manually for each service
docker build -t auth-service .
docker tag auth-service:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/zoptal/auth-service:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/zoptal/auth-service:latest
```

### 3. Database Setup

```bash
# Connect to RDS instance
psql -h zoptal-db.cluster-xxxxx.us-east-1.rds.amazonaws.com -U postgres -d zoptal

# Run migrations
kubectl create job migrate-auth --from=cronjob/auth-migration
kubectl create job migrate-project --from=cronjob/project-migration
```

### 4. SSL and DNS Configuration

```bash
# Create SSL certificate (handled by Terraform)
# DNS records are automatically created

# Verify SSL certificate
curl -I https://api.zoptal.com/health
curl -I https://app.zoptal.com

# Check certificate details
openssl s_client -connect api.zoptal.com:443 -servername api.zoptal.com
```

### 5. Production Configuration

```bash
# Update production secrets
kubectl apply -f k8s/production/secrets/

# Deploy production configurations
kubectl apply -f k8s/production/

# Enable autoscaling
kubectl apply -f k8s/autoscaling/
```

## Monitoring and Observability

### 1. Access Monitoring Dashboards

```bash
# Grafana
kubectl port-forward service/prometheus-grafana 3000:80 -n monitoring
open http://localhost:3000

# Prometheus
kubectl port-forward service/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
open http://localhost:9090

# AlertManager
kubectl port-forward service/prometheus-kube-prometheus-alertmanager 9093:9093 -n monitoring
open http://localhost:9093
```

### 2. Configure Alerts

```bash
# Apply custom alert rules
kubectl apply -f k8s/monitoring/alerts/

# Configure notification channels
kubectl apply -f k8s/monitoring/notifications/
```

### 3. Log Aggregation

```bash
# Deploy Fluentd for log collection
kubectl apply -f k8s/logging/

# View logs in CloudWatch or your preferred log aggregation service
```

## CI/CD Pipeline

### 1. GitHub Actions Setup

The repository includes comprehensive GitHub Actions workflows:

- **Build and Test** (`.github/workflows/ci.yml`)
- **Deploy to Staging** (`.github/workflows/deploy-staging.yml`)
- **Deploy to Production** (`.github/workflows/deploy-production.yml`)

### 2. Required Secrets

Configure these secrets in GitHub repository settings:

```bash
# AWS credentials
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# Container registry
ECR_REGISTRY
ECR_REPOSITORY

# Kubernetes
KUBE_CONFIG_DATA

# Application secrets
DATABASE_URL
REDIS_URL
JWT_SECRET
STRIPE_SECRET_KEY
OPENAI_API_KEY
```

### 3. Deployment Workflow

```yaml
# Example deployment step
- name: Deploy to Kubernetes
  run: |
    kubectl set image deployment/auth-service auth-service=$ECR_REGISTRY/auth-service:$GITHUB_SHA
    kubectl set image deployment/project-service project-service=$ECR_REGISTRY/project-service:$GITHUB_SHA
    kubectl rollout status deployment/auth-service
    kubectl rollout status deployment/project-service
```

## Troubleshooting

### Common Issues

#### 1. Service Discovery Problems

```bash
# Check DNS resolution
kubectl exec -it debug-pod -- nslookup auth-service
kubectl exec -it debug-pod -- nslookup project-service

# Verify service endpoints
kubectl get endpoints
```

#### 2. Database Connection Issues

```bash
# Check database connectivity
kubectl exec -it auth-service-pod -- nc -zv postgres-service 5432

# Verify credentials
kubectl get secret postgres-secret -o yaml

# Check database logs
kubectl logs -l app=postgres
```

#### 3. Load Balancer Issues

```bash
# Check ingress status
kubectl describe ingress zoptal-ingress

# Verify load balancer
kubectl get service ingress-nginx-controller -n ingress-nginx

# Check certificate status
kubectl get certificate
kubectl describe certificate zoptal-tls
```

#### 4. Performance Issues

```bash
# Check resource usage
kubectl top pods
kubectl top nodes

# Review metrics in Grafana
# Check application logs for errors
kubectl logs -l app=auth-service --tail=100
```

### Health Checks

```bash
# Service health endpoints
curl https://api.zoptal.com/health
curl https://api.zoptal.com/auth/health
curl https://api.zoptal.com/projects/health

# Database connectivity
kubectl exec -it postgres-pod -- pg_isready

# Redis connectivity
kubectl exec -it redis-pod -- redis-cli ping
```

### Rollback Procedures

```bash
# Rollback deployment
kubectl rollout undo deployment/auth-service
kubectl rollout undo deployment/project-service

# Check rollout status
kubectl rollout status deployment/auth-service

# Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=2
```

## Security Considerations

### 1. Network Security

- Services communicate within private subnets
- Database access restricted to application pods
- Ingress controller handles SSL termination
- WAF rules protect against common attacks

### 2. Secret Management

- Kubernetes secrets for sensitive data
- AWS Secrets Manager for production secrets
- Separate secrets per environment
- Regular secret rotation

### 3. RBAC Configuration

```bash
# Apply RBAC policies
kubectl apply -f k8s/rbac/

# Verify permissions
kubectl auth can-i create pods --as=system:serviceaccount:default:auth-service
```

## Backup and Disaster Recovery

### 1. Database Backups

```bash
# Automated RDS backups (configured in Terraform)
# Manual backup
aws rds create-db-snapshot --db-instance-identifier zoptal-db --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

### 2. Application Data Backup

```bash
# Backup user uploads and assets
aws s3 sync s3://zoptal-assets s3://zoptal-assets-backup
```

### 3. Cluster Backup

```bash
# Backup Kubernetes resources
kubectl get all --all-namespaces -o yaml > cluster-backup.yaml

# Use Velero for comprehensive backups
velero backup create zoptal-backup --include-namespaces=default,monitoring
```

## Scaling

### 1. Horizontal Pod Autoscaling

```bash
# Configure HPA
kubectl apply -f k8s/autoscaling/hpa.yaml

# Check HPA status
kubectl get hpa
```

### 2. Cluster Autoscaling

```bash
# Node group autoscaling is configured in Terraform
# Verify cluster autoscaler
kubectl get nodes
kubectl describe nodes
```

### 3. Database Scaling

```bash
# RDS read replicas for read scaling
# Connection pooling in applications
# Redis cluster mode for cache scaling
```

## Cost Optimization

### 1. Resource Requests and Limits

Ensure all pods have appropriate resource specifications:

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### 2. Spot Instances

Use spot instances for non-critical workloads:

```bash
# Configured in Terraform for development environments
# Production uses a mix of on-demand and spot instances
```

### 3. Monitoring Costs

- Set up AWS Cost Explorer alerts
- Use Kubernetes resource quotas
- Monitor resource utilization with Grafana

---

For additional support, refer to:
- [Troubleshooting Guide](./troubleshooting.md)
- [Security Best Practices](./security.md)
- [Performance Optimization](./performance.md)
- [Cost Management](./cost-optimization.md)