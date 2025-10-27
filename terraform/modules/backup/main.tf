# Backup Infrastructure Module for Zoptal Platform

# S3 Buckets for Backups
resource "aws_s3_bucket" "backup_primary" {
  bucket = "${var.project_name}-backups-${var.environment}"

  tags = {
    Name        = "${var.project_name}-backups-${var.environment}"
    Environment = var.environment
    Purpose     = "backup-storage"
  }
}

resource "aws_s3_bucket" "backup_glacier" {
  bucket = "${var.project_name}-backups-glacier-${var.environment}"

  tags = {
    Name        = "${var.project_name}-backups-glacier-${var.environment}"
    Environment = var.environment
    Purpose     = "long-term-backup-storage"
  }
}

# Enable versioning
resource "aws_s3_bucket_versioning" "backup_primary_versioning" {
  bucket = aws_s3_bucket.backup_primary.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "backup_primary_encryption" {
  bucket = aws_s3_bucket.backup_primary.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.backup_key.arn
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backup_glacier_encryption" {
  bucket = aws_s3_bucket.backup_glacier.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.backup_key.arn
    }
  }
}

# Lifecycle policies
resource "aws_s3_bucket_lifecycle_configuration" "backup_lifecycle" {
  bucket = aws_s3_bucket.backup_primary.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = var.backup_retention_days
    }
  }

  rule {
    id     = "delete-incomplete-multipart"
    status = "Enabled"

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Cross-region replication
resource "aws_s3_bucket_replication_configuration" "backup_replication" {
  role   = aws_iam_role.replication_role.arn
  bucket = aws_s3_bucket.backup_primary.id

  rule {
    id     = "backup-replication"
    status = "Enabled"

    destination {
      bucket        = aws_s3_bucket.backup_replica.arn
      storage_class = "STANDARD_IA"

      encryption_configuration {
        replica_kms_key_id = aws_kms_key.backup_key_replica.arn
      }
    }
  }

  depends_on = [aws_s3_bucket_versioning.backup_primary_versioning]
}

# Backup replica bucket in different region
resource "aws_s3_bucket" "backup_replica" {
  provider = aws.replica
  bucket   = "${var.project_name}-backups-replica-${var.environment}"

  tags = {
    Name        = "${var.project_name}-backups-replica-${var.environment}"
    Environment = var.environment
    Purpose     = "backup-replica"
  }
}

# KMS Key for backup encryption
resource "aws_kms_key" "backup_key" {
  description             = "KMS key for ${var.project_name} backups"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name        = "${var.project_name}-backup-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "backup_key_alias" {
  name          = "alias/${var.project_name}-backup-key"
  target_key_id = aws_kms_key.backup_key.key_id
}

# KMS Key in replica region
resource "aws_kms_key" "backup_key_replica" {
  provider                = aws.replica
  description             = "KMS key for ${var.project_name} backup replicas"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name        = "${var.project_name}-backup-key-replica"
    Environment = var.environment
  }
}

# IAM Role for replication
resource "aws_iam_role" "replication_role" {
  name = "${var.project_name}-backup-replication-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "replication_policy" {
  role = aws_iam_role.replication_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetReplicationConfiguration",
          "s3:ListBucket"
        ]
        Resource = aws_s3_bucket.backup_primary.arn
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObjectVersionForReplication",
          "s3:GetObjectVersionAcl",
          "s3:GetObjectVersionTagging"
        ]
        Resource = "${aws_s3_bucket.backup_primary.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ReplicateObject",
          "s3:ReplicateDelete",
          "s3:ReplicateTags"
        ]
        Resource = "${aws_s3_bucket.backup_replica.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.backup_key.arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Encrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.backup_key_replica.arn
      }
    ]
  })
}

# IAM Role for backup jobs
resource "aws_iam_role" "backup_job_role" {
  name = "${var.project_name}-backup-job-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Condition = {
          StringEquals = {
            "sts:ExternalId" = var.backup_external_id
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "backup_job_policy" {
  role = aws_iam_role.backup_job_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.backup_primary.arn,
          "${aws_s3_bucket.backup_primary.arn}/*",
          aws_s3_bucket.backup_glacier.arn,
          "${aws_s3_bucket.backup_glacier.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey",
          "kms:DescribeKey"
        ]
        Resource = aws_kms_key.backup_key.arn
      },
      {
        Effect = "Allow"
        Action = [
          "rds:CreateDBSnapshot",
          "rds:DescribeDBSnapshots",
          "rds:CopyDBSnapshot",
          "rds:DeleteDBSnapshot",
          "rds:RestoreDBInstanceFromDBSnapshot",
          "rds:DescribeDBInstances"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "elasticache:CreateSnapshot",
          "elasticache:DescribeSnapshots",
          "elasticache:CopySnapshot",
          "elasticache:DeleteSnapshot",
          "elasticache:DescribeCacheClusters"
        ]
        Resource = "*"
      }
    ]
  })
}

# S3 Bucket for Terraform state backups
resource "aws_s3_bucket" "terraform_state_backup" {
  bucket = "${var.project_name}-terraform-state-backup-${var.environment}"

  tags = {
    Name        = "${var.project_name}-terraform-state-backup"
    Environment = var.environment
    Purpose     = "terraform-state-backup"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state_backup_versioning" {
  bucket = aws_s3_bucket.terraform_state_backup.id
  versioning_configuration {
    status = "Enabled"
  }
}

# DynamoDB table for backup inventory
resource "aws_dynamodb_table" "backup_inventory" {
  name           = "${var.project_name}-backup-inventory"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "backup_id"
  range_key      = "timestamp"

  attribute {
    name = "backup_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "service"
    type = "S"
  }

  global_secondary_index {
    name            = "service-timestamp-index"
    hash_key        = "service"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiration"
    enabled        = true
  }

  tags = {
    Name        = "${var.project_name}-backup-inventory"
    Environment = var.environment
  }
}

# SNS Topic for backup notifications
resource "aws_sns_topic" "backup_notifications" {
  name = "${var.project_name}-backup-notifications"

  tags = {
    Name        = "${var.project_name}-backup-notifications"
    Environment = var.environment
  }
}

resource "aws_sns_topic_subscription" "backup_email" {
  topic_arn = aws_sns_topic.backup_notifications.arn
  protocol  = "email"
  endpoint  = var.backup_notification_email
}

# CloudWatch Alarms for backup monitoring
resource "aws_cloudwatch_metric_alarm" "backup_failed" {
  alarm_name          = "${var.project_name}-backup-failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BackupFailures"
  namespace           = "Zoptal/Backup"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "This metric monitors backup failures"
  alarm_actions       = [aws_sns_topic.backup_notifications.arn]

  dimensions = {
    Environment = var.environment
  }
}

resource "aws_cloudwatch_metric_alarm" "backup_missing" {
  alarm_name          = "${var.project_name}-backup-missing"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BackupSuccess"
  namespace           = "Zoptal/Backup"
  period              = "86400"
  statistic           = "Sum"
  threshold           = "1"
  alarm_description   = "This metric monitors if daily backups are running"
  alarm_actions       = [aws_sns_topic.backup_notifications.arn]

  dimensions = {
    Environment = var.environment
    BackupType  = "daily"
  }
}

# AWS Backup configuration
resource "aws_backup_vault" "main" {
  name        = "${var.project_name}-backup-vault"
  kms_key_arn = aws_kms_key.backup_key.arn

  tags = {
    Name        = "${var.project_name}-backup-vault"
    Environment = var.environment
  }
}

resource "aws_backup_plan" "main" {
  name = "${var.project_name}-backup-plan"

  rule {
    rule_name         = "daily_backups"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 3 * * ? *)"
    start_window      = 60
    completion_window = 180

    lifecycle {
      delete_after = var.backup_retention_days
      cold_storage_after = 30
    }

    recovery_point_tags = {
      Environment = var.environment
      BackupType  = "scheduled"
    }
  }

  rule {
    rule_name         = "weekly_backups"
    target_vault_name = aws_backup_vault.main.name
    schedule          = "cron(0 4 ? * 1 *)"
    start_window      = 60
    completion_window = 360

    lifecycle {
      delete_after = 90
      cold_storage_after = 7
    }

    recovery_point_tags = {
      Environment = var.environment
      BackupType  = "weekly"
    }
  }

  tags = {
    Name        = "${var.project_name}-backup-plan"
    Environment = var.environment
  }
}

resource "aws_backup_selection" "rds" {
  iam_role_arn = aws_iam_role.backup_service_role.arn
  name         = "${var.project_name}-rds-backup-selection"
  plan_id      = aws_backup_plan.main.id

  resources = [
    "arn:aws:rds:*:*:db:${var.project_name}-*"
  ]

  condition {
    string_equals {
      key   = "aws:ResourceTag/Environment"
      value = var.environment
    }
  }
}

# IAM role for AWS Backup
resource "aws_iam_role" "backup_service_role" {
  name = "${var.project_name}-backup-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "backup.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "backup_service_role_policy" {
  role       = aws_iam_role.backup_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
}

resource "aws_iam_role_policy_attachment" "backup_service_role_restore_policy" {
  role       = aws_iam_role.backup_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForRestores"
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}