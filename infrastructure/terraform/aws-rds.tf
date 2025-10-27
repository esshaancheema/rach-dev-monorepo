# RDS PostgreSQL Configuration for Zoptal

# Random password for RDS
resource "random_password" "rds" {
  length  = 32
  special = true
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-rds"
  subnet_ids = module.vpc.private_subnets

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds-subnet-group"
  })
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "${local.name_prefix}-rds-"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id, aws_security_group.eks_pods.id]
    description     = "Allow PostgreSQL from EKS nodes and pods"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds-sg"
  })
}

# RDS Parameter Group
resource "aws_db_parameter_group" "main" {
  name   = "${local.name_prefix}-postgres${replace(var.rds_engine_version, ".", "")}"
  family = "postgres${split(".", var.rds_engine_version)[0]}"

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_duration"
    value = "on"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries taking more than 1 second
  }

  parameter {
    name  = "shared_preload_libraries"
    value = "pg_stat_statements"
  }

  parameter {
    name  = "pg_stat_statements.track"
    value = "all"
  }

  parameter {
    name  = "autovacuum"
    value = "on"
  }

  parameter {
    name  = "autovacuum_max_workers"
    value = "3"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds-params"
  })
}

# RDS PostgreSQL Instance
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${local.name_prefix}-postgres"

  # Engine
  engine               = "postgres"
  engine_version       = var.rds_engine_version
  family               = "postgres${split(".", var.rds_engine_version)[0]}"
  major_engine_version = split(".", var.rds_engine_version)[0]
  instance_class       = var.rds_instance_class

  # Storage
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.main.arn
  storage_type          = "gp3"
  iops                  = 3000
  
  # Database
  db_name  = "zoptal_${var.environment}"
  username = "zoptal_admin"
  password = random_password.rds.result
  port     = 5432

  # High Availability
  multi_az               = var.rds_multi_az
  create_db_subnet_group = false
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Backup
  backup_retention_period = var.rds_backup_retention_period
  backup_window           = var.rds_backup_window
  maintenance_window      = var.rds_maintenance_window
  deletion_protection     = var.rds_deletion_protection
  skip_final_snapshot     = false
  final_snapshot_identifier_prefix = "${local.name_prefix}-final-snapshot"

  # Monitoring
  enabled_cloudwatch_logs_exports = ["postgresql"]
  create_cloudwatch_log_group     = true
  performance_insights_enabled    = var.enable_enhanced_monitoring
  performance_insights_retention_period = 7
  performance_insights_kms_key_id = aws_kms_key.main.arn
  monitoring_interval             = var.enable_enhanced_monitoring ? 60 : 0
  monitoring_role_name            = "${local.name_prefix}-rds-monitoring"
  create_monitoring_role          = true

  # Parameter group
  parameter_group_name = aws_db_parameter_group.main.name

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds"
  })
}

# Store RDS credentials in Secrets Manager
resource "aws_secretsmanager_secret" "rds_credentials" {
  name_prefix             = "${local.name_prefix}-rds-credentials-"
  description             = "RDS PostgreSQL credentials for ${local.name_prefix}"
  kms_key_id              = aws_kms_key.main.id
  recovery_window_in_days = 7

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds-credentials"
  })
}

resource "aws_secretsmanager_secret_version" "rds_credentials" {
  secret_id = aws_secretsmanager_secret.rds_credentials.id
  secret_string = jsonencode({
    username = module.rds.db_instance_username
    password = random_password.rds.result
    endpoint = module.rds.db_instance_endpoint
    port     = module.rds.db_instance_port
    database = module.rds.db_instance_name
    connection_string = "postgresql://${module.rds.db_instance_username}:${random_password.rds.result}@${module.rds.db_instance_endpoint}/${module.rds.db_instance_name}"
  })
}

# CloudWatch Alarms for RDS
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${local.name_prefix}-rds-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.alarm_thresholds.cpu_utilization_high
  alarm_description   = "RDS CPU utilization is too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = module.rds.db_instance_id
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds-cpu-alarm"
  })
}

resource "aws_cloudwatch_metric_alarm" "rds_storage" {
  alarm_name          = "${local.name_prefix}-rds-free-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = 10737418240 # 10GB in bytes
  alarm_description   = "RDS free storage space is low"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = module.rds.db_instance_id
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds-storage-alarm"
  })
}

resource "aws_cloudwatch_metric_alarm" "rds_connections" {
  alarm_name          = "${local.name_prefix}-rds-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS connection count is high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = module.rds.db_instance_id
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-rds-connections-alarm"
  })
}

# ElastiCache Redis Cluster
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${local.name_prefix}-redis"
  subnet_ids = module.vpc.private_subnets

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-subnet-group"
  })
}

resource "aws_security_group" "redis" {
  name_prefix = "${local.name_prefix}-redis-"
  description = "Security group for ElastiCache Redis"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id, aws_security_group.eks_pods.id]
    description     = "Allow Redis from EKS nodes and pods"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-sg"
  })
}

resource "aws_elasticache_parameter_group" "redis" {
  name   = "${local.name_prefix}-redis${replace(var.elasticache_engine_version, ".", "")}"
  family = var.elasticache_parameter_group_family

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis-params"
  })
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${local.name_prefix}-redis"
  engine               = "redis"
  node_type            = var.elasticache_node_type
  num_cache_nodes      = var.elasticache_num_cache_nodes
  parameter_group_name = aws_elasticache_parameter_group.redis.name
  engine_version       = var.elasticache_engine_version
  port                 = 6379

  subnet_group_name = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]

  snapshot_retention_limit = 5
  snapshot_window          = "03:00-05:00"

  # Enable encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  # Enable automatic failover for production
  automatic_failover_enabled = var.environment == "production" ? true : false

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-redis"
  })
}

# Store application secrets
resource "aws_secretsmanager_secret" "app_secrets" {
  name_prefix             = "${local.name_prefix}-app-secrets-"
  description             = "Application secrets for ${local.name_prefix}"
  kms_key_id              = aws_kms_key.main.id
  recovery_window_in_days = 7

  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-app-secrets"
  })
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    jwt_secret         = var.app_secrets.jwt_secret
    jwt_refresh_secret = var.app_secrets.jwt_refresh_secret
    nextauth_secret    = var.app_secrets.nextauth_secret
    database_url       = "postgresql://${module.rds.db_instance_username}:${random_password.rds.result}@${module.rds.db_instance_endpoint}/${module.rds.db_instance_name}"
    redis_url          = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:${aws_elasticache_cluster.redis.cache_nodes[0].port}"
  })
}