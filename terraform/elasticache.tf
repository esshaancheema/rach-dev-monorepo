# ElastiCache Subnet Group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name_prefix}-cache-subnet-group"
  subnet_ids = module.vpc.intra_subnets

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-cache-subnet-group"
  })
}

# ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "main" {
  family = "redis7.x"
  name   = "${local.name_prefix}-redis-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "timeout"
    value = "300"
  }

  parameter {
    name  = "tcp-keepalive"
    value = "300"
  }

  parameter {
    name  = "maxclients"
    value = "1000"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-params"
  })
}

# ElastiCache Replication Group (Redis Cluster)
resource "aws_elasticache_replication_group" "main" {
  replication_group_id         = "${local.name_prefix}-redis"
  description                  = "Redis cluster for ${local.name_prefix}"
  
  # Node configuration
  node_type                    = var.elasticache_node_type
  port                         = 6379
  parameter_group_name         = aws_elasticache_parameter_group.main.name
  
  # Cluster configuration
  num_cache_clusters           = var.elasticache_num_cache_nodes
  automatic_failover_enabled   = var.elasticache_num_cache_nodes > 1
  multi_az_enabled            = var.elasticache_num_cache_nodes > 1
  
  # Network configuration
  subnet_group_name           = aws_elasticache_subnet_group.main.name
  security_group_ids          = [aws_security_group.elasticache.id]
  
  # Engine configuration
  engine_version              = "7.0"
  
  # Security
  at_rest_encryption_enabled  = true
  transit_encryption_enabled  = true
  auth_token                  = random_password.redis_auth_token.result
  
  # Backup configuration
  snapshot_retention_limit    = var.environment == "production" ? 7 : 1
  snapshot_window            = "03:00-05:00"
  maintenance_window         = "sun:05:00-sun:06:00"
  
  # Logging
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.elasticache_slow.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis"
  })

  lifecycle {
    ignore_changes = [auth_token]
  }
}

# Random auth token for Redis
resource "random_password" "redis_auth_token" {
  length  = 32
  special = false
}

# Security Group for ElastiCache
resource "aws_security_group" "elasticache" {
  name_prefix = "${local.name_prefix}-elasticache"
  vpc_id      = module.vpc.vpc_id
  description = "Security group for ElastiCache Redis"

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.application.id]
    description     = "Redis from application tier"
  }

  # Allow access from EKS nodes
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
    description     = "Redis from EKS nodes"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-elasticache-sg"
  })
}

# CloudWatch Log Group for ElastiCache slow logs
resource "aws_cloudwatch_log_group" "elasticache_slow" {
  name              = "/aws/elasticache/${local.name_prefix}-redis/slow-log"
  retention_in_days = var.log_retention_days

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-elasticache-slow-logs"
  })
}

# Store Redis credentials in Secrets Manager
resource "aws_secretsmanager_secret" "redis_credentials" {
  name                    = "${local.name_prefix}/redis/credentials"
  description             = "Redis credentials for ${local.name_prefix}"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-credentials"
  })
}

resource "aws_secretsmanager_secret_version" "redis_credentials" {
  secret_id = aws_secretsmanager_secret.redis_credentials.id
  secret_string = jsonencode({
    auth_token = random_password.redis_auth_token.result
    host       = aws_elasticache_replication_group.main.primary_endpoint_address
    port       = aws_elasticache_replication_group.main.port
    url        = "redis://:${random_password.redis_auth_token.result}@${aws_elasticache_replication_group.main.primary_endpoint_address}:${aws_elasticache_replication_group.main.port}"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# CloudWatch alarms for ElastiCache
resource "aws_cloudwatch_metric_alarm" "elasticache_cpu" {
  alarm_name          = "${local.name_prefix}-elasticache-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "75"
  alarm_description   = "This metric monitors ElastiCache CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    CacheClusterId = "${local.name_prefix}-redis-001"
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "elasticache_memory" {
  alarm_name          = "${local.name_prefix}-elasticache-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ElastiCache memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    CacheClusterId = "${local.name_prefix}-redis-001"
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "elasticache_connections" {
  alarm_name          = "${local.name_prefix}-elasticache-high-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CurrConnections"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = "500"
  alarm_description   = "This metric monitors ElastiCache connection count"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    CacheClusterId = "${local.name_prefix}-redis-001"
  }

  tags = local.common_tags
}