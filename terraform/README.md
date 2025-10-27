# Zoptal Infrastructure with Terraform

This directory contains the complete AWS infrastructure configuration for the Zoptal application using Terraform. The infrastructure includes EKS cluster, RDS database, ElastiCache Redis, Application Load Balancer, S3 storage, monitoring, and security components.

## 🏗️ Architecture Overview

The infrastructure deploys the following components:

### Compute & Orchestration
- **EKS Cluster**: Kubernetes cluster with managed node groups
- **Fargate Profiles**: For system workloads and cost optimization
- **Auto Scaling**: HPA and cluster autoscaler for dynamic scaling

### Database & Cache
- **Amazon RDS**: PostgreSQL database with Multi-AZ deployment
- **ElastiCache**: Redis cluster for caching and session storage
- **Backup**: Automated backups with point-in-time recovery

### Networking & Load Balancing
- **VPC**: Multi-AZ VPC with public, private, and intra subnets
- **Application Load Balancer**: Layer 7 load balancing with SSL termination
- **Route53**: DNS management with health checks
- **CloudFront**: CDN for static assets (optional)

### Storage
- **S3 Buckets**: Application storage, ALB logs, CloudTrail logs
- **EBS**: Persistent storage for Kubernetes workloads
- **ECR**: Container image repositories

### Security
- **WAF**: Web Application Firewall with managed rules
- **Security Groups**: Network-level security
- **IAM Roles**: Least privilege access control
- **KMS**: Encryption key management
- **Secrets Manager**: Secure secrets storage

### Monitoring & Logging
- **CloudWatch**: Metrics, logs, and dashboards
- **CloudTrail**: API audit logging
- **AWS Config**: Compliance monitoring
- **SNS**: Alert notifications

## 📋 Prerequisites

Before deploying the infrastructure, ensure you have:

1. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```

2. **Terraform** >= 1.0 installed
   ```bash
   # Install via Homebrew (macOS)
   brew install terraform
   
   # Or download from https://www.terraform.io/downloads.html
   ```

3. **kubectl** for Kubernetes management
   ```bash
   # Install via Homebrew (macOS)
   brew install kubectl
   ```

4. **AWS IAM Permissions**: Your AWS user/role needs permissions for:
   - EC2, EKS, RDS, ElastiCache
   - IAM role creation and management
   - S3, CloudWatch, Route53
   - VPC, Security Groups, Load Balancers

## 🚀 Quick Start

### 1. Configuration

Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your specific configuration:

```hcl
# Essential configurations
environment = "production"
project_name = "zoptal"
domain_name = "your-domain.com"
alert_email = "alerts@your-domain.com"

# Instance sizes (adjust based on your needs)
rds_instance_class = "db.r5.large"
elasticache_node_type = "cache.r6g.large"
```

### 2. Backend Setup

Set up remote state storage:

```bash
# Create S3 bucket and DynamoDB table for state management
./terraform-deploy.sh create-state-bucket production

# Configure backend
./terraform-deploy.sh setup-backend production
```

### 3. Deploy Infrastructure

```bash
# Initialize Terraform
./terraform-deploy.sh init

# Validate configuration
./terraform-deploy.sh validate

# Plan changes
./terraform-deploy.sh plan terraform.tfvars

# Apply changes
./terraform-deploy.sh apply
```

### 4. Configure kubectl

After deployment, configure kubectl to access your EKS cluster:

```bash
# Get the kubectl configuration command from Terraform output
terraform output kubectl_config

# Or run directly:
aws eks update-kubeconfig --region us-east-1 --name zoptal-production-eks
```

## 📁 File Structure

```
terraform/
├── main.tf                    # Main configuration and providers
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── vpc.tf                     # VPC and networking
├── eks.tf                     # EKS cluster configuration
├── rds.tf                     # RDS PostgreSQL database
├── elasticache.tf             # Redis cache cluster
├── s3.tf                      # S3 buckets and policies
├── ecr.tf                     # Container registries
├── alb.tf                     # Application Load Balancer
├── route53.tf                 # DNS and SSL certificates
├── cloudwatch.tf              # Monitoring and logging
├── terraform.tfvars.example   # Example configuration
├── terraform-deploy.sh        # Deployment script
└── README.md                  # This file
```

## 🔧 Customization

### Environment-Specific Configurations

Create environment-specific tfvars files:

**production.tfvars**:
```hcl
environment = "production"
rds_instance_class = "db.r5.xlarge"
rds_multi_az = true
elasticache_node_type = "cache.r6g.large"
elasticache_num_cache_nodes = 3
eks_node_groups = {
  general = {
    instance_types = ["m5.large", "m5.xlarge"]
    min_size = 3
    max_size = 20
    desired_size = 6
  }
}
```

**staging.tfvars**:
```hcl
environment = "staging"
rds_instance_class = "db.t3.large"
rds_multi_az = false
elasticache_node_type = "cache.t3.medium"
elasticache_num_cache_nodes = 1
cost_budget_limit = 200
```

**development.tfvars**:
```hcl
environment = "development"
rds_instance_class = "db.t3.micro"
rds_multi_az = false
elasticache_node_type = "cache.t3.micro"
single_nat_gateway = true
cost_budget_limit = 50
```

### Node Group Configuration

Customize EKS node groups for your workload:

```hcl
eks_node_groups = {
  # General purpose nodes
  general = {
    instance_types = ["t3.medium", "t3.large"]
    capacity_type  = "ON_DEMAND"
    min_size      = 2
    max_size      = 10
    desired_size  = 3
    labels = {
      role = "general"
    }
    taints = []
  }
  
  # Compute-optimized nodes with spot instances
  compute = {
    instance_types = ["c5.large", "c5.xlarge"]
    capacity_type  = "SPOT"
    min_size      = 0
    max_size      = 20
    desired_size  = 2
    labels = {
      role = "compute"
    }
    taints = [{
      key    = "compute"
      value  = "true"
      effect = "NO_SCHEDULE"
    }]
  }
  
  # Memory-optimized nodes
  memory = {
    instance_types = ["r5.large", "r5.xlarge"]
    capacity_type  = "ON_DEMAND"
    min_size      = 0
    max_size      = 5
    desired_size  = 1
    labels = {
      role = "memory"
    }
    taints = [{
      key    = "memory"
      value  = "true"
      effect = "NO_SCHEDULE"
    }]
  }
}
```

### Security Configuration

Configure WAF rules and security settings:

```hcl
# Block specific countries
blocked_countries = ["CN", "RU", "KP"]

# Enable advanced security features
enable_guardduty = true
enable_shield_advanced = true  # For high-traffic applications
enable_config = true
enable_cloudtrail = true
```

## 🔍 Monitoring & Alerting

### CloudWatch Dashboards

The infrastructure creates comprehensive CloudWatch dashboards monitoring:

- Application Load Balancer metrics
- EKS cluster and node metrics
- RDS performance metrics
- ElastiCache metrics
- Custom application metrics

### Alerts

Configure email alerts for:

- High CPU/memory usage
- Application errors (4xx/5xx responses)
- Database connection issues
- Cache performance problems
- Infrastructure failures

Set your alert email in the configuration:

```hcl
alert_email = "alerts@your-domain.com"
```

### Log Aggregation

All application logs are centralized in CloudWatch Log Groups:

- `/aws/eks/zoptal-production-eks/cluster` - EKS control plane logs
- `/aws/ecs/zoptal-production/auth-service` - Auth service logs
- `/aws/ecs/zoptal-production/project-service` - Project service logs
- And more for each service...

## 🔒 Security Best Practices

### Network Security
- Private subnets for application workloads
- Security groups with least privilege access
- WAF protection for web applications
- VPC endpoints for AWS services

### Data Protection
- Encryption at rest for RDS and ElastiCache
- KMS key management
- S3 bucket encryption
- Secrets Manager for sensitive data

### Access Control
- IAM roles with least privilege
- EKS RBAC integration
- Service account token authentication
- Multi-factor authentication for admin access

### Compliance
- CloudTrail for audit logging
- AWS Config for compliance monitoring
- GuardDuty for threat detection
- Regular security assessments

## 💰 Cost Optimization

### Instance Right-Sizing
- Use appropriate instance types for workloads
- Implement auto-scaling policies
- Utilize Spot instances for non-critical workloads

### Storage Optimization
- S3 lifecycle policies for data archival
- EBS volume optimization
- Regular cleanup of unused resources

### Monitoring
- Cost anomaly detection
- Budget alerts
- Regular cost reviews

### Development Environments
Use smaller instances and single-AZ deployments:

```hcl
# Development environment optimizations
single_nat_gateway = true
rds_multi_az = false
elasticache_num_cache_nodes = 1
```

## 🔄 Maintenance

### Updates
- Regularly update Terraform providers
- Keep EKS cluster version current
- Apply security patches to RDS and ElastiCache
- Review and update WAF rules

### Backups
- RDS automated backups (configurable retention)
- EKS persistent volume snapshots
- S3 versioning and cross-region replication
- Configuration backup to version control

### Disaster Recovery
- Multi-AZ deployments for high availability
- Database read replicas
- Cross-region backup strategies
- Regular disaster recovery testing

## 🛠️ Troubleshooting

### Common Issues

**EKS cluster creation fails**:
```bash
# Check IAM permissions
aws sts get-caller-identity

# Verify VPC and subnet configuration
terraform plan -target=module.vpc
```

**RDS connection issues**:
```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Test database connectivity
kubectl run temp-pod --image=postgres:13 --rm -it -- psql -h <rds-endpoint> -U postgres
```

**Load balancer health check failures**:
```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn <target-group-arn>

# Verify application health endpoints
kubectl logs deployment/auth-service
```

### Debug Commands

```bash
# Get Terraform state
terraform show

# Debug specific resources
terraform plan -target=aws_lb.main

# View detailed logs
terraform apply -auto-approve -verbose

# Check AWS resource status
aws eks describe-cluster --name zoptal-production-eks
aws rds describe-db-instances --db-instance-identifier zoptal-production-postgres
```

## 📚 Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## 🤝 Contributing

1. Create a feature branch
2. Test changes in development environment
3. Update documentation
4. Submit pull request with detailed description

## 📄 License

This infrastructure configuration is part of the Zoptal project. See the main project LICENSE file for details.