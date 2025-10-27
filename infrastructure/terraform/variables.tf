# Variable definitions for Zoptal infrastructure

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "zoptal"
}

variable "environment" {
  description = "Environment name (e.g., production, staging, development)"
  type        = string
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development"
  }
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnets" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "domain_name" {
  description = "Primary domain name for the application"
  type        = string
  default     = "zoptal.com"
}

variable "create_route53_zone" {
  description = "Whether to create a Route53 hosted zone"
  type        = bool
  default     = false
}

variable "alert_email" {
  description = "Email address for receiving alerts"
  type        = string
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}

# EKS Variables
variable "eks_cluster_version" {
  description = "Kubernetes version to use for the EKS cluster"
  type        = string
  default     = "1.28"
}

variable "eks_node_groups" {
  description = "Configuration for EKS node groups"
  type = map(object({
    desired_size    = number
    max_size        = number
    min_size        = number
    instance_types  = list(string)
    disk_size       = number
    capacity_type   = string
  }))
  default = {
    general = {
      desired_size   = 3
      max_size       = 10
      min_size       = 2
      instance_types = ["t3.medium"]
      disk_size      = 50
      capacity_type  = "ON_DEMAND"
    }
    spot = {
      desired_size   = 2
      max_size       = 20
      min_size       = 0
      instance_types = ["t3.medium", "t3a.medium", "t3.large", "t3a.large"]
      disk_size      = 50
      capacity_type  = "SPOT"
    }
  }
}

# RDS Variables
variable "rds_instance_class" {
  description = "Instance class for RDS database"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 100
}

variable "rds_max_allocated_storage" {
  description = "Maximum allocated storage for RDS autoscaling in GB"
  type        = number
  default     = 500
}

variable "rds_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "15.4"
}

variable "rds_backup_retention_period" {
  description = "Number of days to retain RDS backups"
  type        = number
  default     = 30
}

variable "rds_backup_window" {
  description = "Preferred backup window for RDS"
  type        = string
  default     = "03:00-04:00"
}

variable "rds_maintenance_window" {
  description = "Preferred maintenance window for RDS"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ deployment for RDS"
  type        = bool
  default     = true
}

variable "rds_deletion_protection" {
  description = "Enable deletion protection for RDS"
  type        = bool
  default     = true
}

# ElastiCache Variables
variable "elasticache_node_type" {
  description = "Node type for ElastiCache Redis"
  type        = string
  default     = "cache.t3.micro"
}

variable "elasticache_num_cache_nodes" {
  description = "Number of cache nodes for ElastiCache"
  type        = number
  default     = 1
}

variable "elasticache_parameter_group_family" {
  description = "ElastiCache parameter group family"
  type        = string
  default     = "redis7"
}

variable "elasticache_engine_version" {
  description = "ElastiCache Redis engine version"
  type        = string
  default     = "7.0"
}

# Application Configuration
variable "app_secrets" {
  description = "Application secrets (stored in AWS Secrets Manager)"
  type = object({
    jwt_secret         = string
    jwt_refresh_secret = string
    nextauth_secret    = string
  })
  sensitive = true
}

# Cost Optimization
variable "enable_cost_optimization" {
  description = "Enable cost optimization features (spot instances, auto-scaling, etc.)"
  type        = bool
  default     = true
}

# Monitoring and Alerting
variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring for RDS and other services"
  type        = bool
  default     = true
}

variable "alarm_thresholds" {
  description = "Thresholds for CloudWatch alarms"
  type = object({
    cpu_utilization_high    = number
    memory_utilization_high = number
    disk_utilization_high   = number
    error_rate_high         = number
  })
  default = {
    cpu_utilization_high    = 80
    memory_utilization_high = 85
    disk_utilization_high   = 90
    error_rate_high         = 5
  }
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to all resources"
  type        = map(string)
  default     = {}
}