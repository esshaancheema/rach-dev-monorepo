# Outputs for important resources
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "VPC CIDR block"
  value       = module.vpc.vpc_cidr_block
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "Public subnet IDs" 
  value       = module.vpc.public_subnets
}

output "eks_cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "eks_cluster_arn" {
  description = "EKS cluster ARN"
  value       = module.eks.cluster_arn
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = module.eks.cluster_security_group_id
}

output "eks_oidc_provider_arn" {
  description = "EKS OIDC provider ARN"
  value       = module.eks.oidc_provider_arn
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_replication_group.main.port
}

output "load_balancer_dns_name" {
  description = "Load balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "load_balancer_zone_id" {
  description = "Load balancer zone ID"
  value       = aws_lb.main.zone_id
}

output "s3_bucket_name" {
  description = "S3 bucket name for application storage"
  value       = aws_s3_bucket.app_storage.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN for application storage"
  value       = aws_s3_bucket.app_storage.arn
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    auth_service        = aws_ecr_repository.auth_service.repository_url
    project_service     = aws_ecr_repository.project_service.repository_url
    ai_service          = aws_ecr_repository.ai_service.repository_url
    billing_service     = aws_ecr_repository.billing_service.repository_url
    notification_service = aws_ecr_repository.notification_service.repository_url
    analytics_service   = aws_ecr_repository.analytics_service.repository_url
    web_main           = aws_ecr_repository.web_main.repository_url
    dashboard          = aws_ecr_repository.dashboard.repository_url
    admin              = aws_ecr_repository.admin.repository_url
    developer_portal   = aws_ecr_repository.developer_portal.repository_url
  }
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].zone_id : null
}

output "route53_name_servers" {
  description = "Route53 name servers"
  value       = var.domain_name != "" ? aws_route53_zone.main[0].name_servers : null
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = var.domain_name != "" ? aws_acm_certificate_validation.main[0].certificate_arn : aws_acm_certificate.self_signed[0].arn
}

output "secrets_manager_rds_secret_arn" {
  description = "Secrets Manager secret ARN for RDS"
  value       = aws_secretsmanager_secret.rds_credentials.arn
  sensitive   = true
}

output "secrets_manager_redis_secret_arn" {
  description = "Secrets Manager secret ARN for Redis"
  value       = aws_secretsmanager_secret.redis_credentials.arn
  sensitive   = true
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log group names"
  value = {
    for k, v in aws_cloudwatch_log_group.application_logs : k => v.name
  }
}

output "sns_topic_alerts_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.main.arn
}

# Target Group ARNs for Kubernetes service integration
output "target_groups" {
  description = "ALB target group ARNs"
  value = {
    web_main             = aws_lb_target_group.web_main.arn
    dashboard            = aws_lb_target_group.dashboard.arn
    admin                = aws_lb_target_group.admin.arn
    developer_portal     = aws_lb_target_group.developer_portal.arn
    auth_service         = aws_lb_target_group.auth_service.arn
    project_service      = aws_lb_target_group.project_service.arn
    ai_service           = aws_lb_target_group.ai_service.arn
    billing_service      = aws_lb_target_group.billing_service.arn
    notification_service = aws_lb_target_group.notification_service.arn
    analytics_service    = aws_lb_target_group.analytics_service.arn
  }
}

# Environment-specific outputs
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

# Kubernetes configuration helper
output "kubectl_config" {
  description = "kubectl configuration command"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_id}"
}

# URLs for applications
output "application_urls" {
  description = "Application URLs"
  value = var.domain_name != "" ? {
    main_website     = "https://${var.domain_name}"
    dashboard        = "https://dashboard.${var.domain_name}"
    admin            = "https://admin.${var.domain_name}"
    developer_portal = "https://developer.${var.domain_name}"
    api_base         = "https://api.${var.domain_name}"
  } : {
    load_balancer = "https://${aws_lb.main.dns_name}"
  }
}

# Database connection information (for CI/CD and migrations)
output "database_connection_info" {
  description = "Database connection information"
  value = {
    host     = aws_db_instance.main.endpoint
    port     = aws_db_instance.main.port
    database = aws_db_instance.main.db_name
    username = aws_db_instance.main.username
    # Password should be retrieved from Secrets Manager
    secret_arn = aws_secretsmanager_secret.rds_credentials.arn
  }
  sensitive = true
}

# Redis connection information
output "redis_connection_info" {
  description = "Redis connection information"
  value = {
    host = aws_elasticache_replication_group.main.primary_endpoint_address
    port = aws_elasticache_replication_group.main.port
    # Auth token should be retrieved from Secrets Manager
    secret_arn = aws_secretsmanager_secret.redis_credentials.arn
  }
  sensitive = true
}