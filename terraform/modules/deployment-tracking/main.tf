# DynamoDB tables for deployment tracking

resource "aws_dynamodb_table" "deployments" {
  name           = "${var.project_name}-deployments"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "deploymentId"

  attribute {
    name = "deploymentId"
    type = "S"
  }

  attribute {
    name = "service"
    type = "S"
  }

  attribute {
    name = "environment"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "service-createdAt-index"
    hash_key        = "service"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "environment-createdAt-index"
    hash_key        = "environment"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "status-createdAt-index"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "${var.project_name}-deployments"
    Environment = var.environment
    Purpose     = "deployment-tracking"
  }
}

resource "aws_dynamodb_table" "rollbacks" {
  name           = "${var.project_name}-rollbacks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "rollbackId"

  attribute {
    name = "rollbackId"
    type = "S"
  }

  attribute {
    name = "service"
    type = "S"
  }

  attribute {
    name = "environment"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "service-createdAt-index"
    hash_key        = "service"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "environment-createdAt-index"
    hash_key        = "environment"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "${var.project_name}-rollbacks"
    Environment = var.environment
    Purpose     = "rollback-tracking"
  }
}

resource "aws_dynamodb_table" "deployment_snapshots" {
  name           = "${var.project_name}-deployment-snapshots"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "snapshotId"

  attribute {
    name = "snapshotId"
    type = "S"
  }

  attribute {
    name = "service"
    type = "S"
  }

  attribute {
    name = "environment"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "service-environment-index"
    hash_key        = "service"
    range_key       = "environment"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "environment-createdAt-index"
    hash_key        = "environment"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "${var.project_name}-deployment-snapshots"
    Environment = var.environment
    Purpose     = "deployment-snapshots"
  }
}

# S3 bucket for deployment snapshots
resource "aws_s3_bucket" "deployment_snapshots" {
  bucket = "${var.project_name}-deployment-snapshots-${var.environment}"

  tags = {
    Name        = "${var.project_name}-deployment-snapshots"
    Environment = var.environment
    Purpose     = "deployment-snapshots"
  }
}

resource "aws_s3_bucket_versioning" "deployment_snapshots_versioning" {
  bucket = aws_s3_bucket.deployment_snapshots.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "deployment_snapshots_encryption" {
  bucket = aws_s3_bucket.deployment_snapshots.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "deployment_snapshots_lifecycle" {
  bucket = aws_s3_bucket.deployment_snapshots.id

  rule {
    id     = "deployment_snapshots_lifecycle"
    status = "Enabled"

    expiration {
      days = 90
    }

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }
}

# IAM role for deployment tracker
resource "aws_iam_role" "deployment_tracker_role" {
  name = "${var.project_name}-deployment-tracker-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "deployment_tracker_policy" {
  role = aws_iam_role.deployment_tracker_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.deployments.arn,
          "${aws_dynamodb_table.deployments.arn}/*",
          aws_dynamodb_table.rollbacks.arn,
          "${aws_dynamodb_table.rollbacks.arn}/*",
          aws_dynamodb_table.deployment_snapshots.arn,
          "${aws_dynamodb_table.deployment_snapshots.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.deployment_snapshots.arn,
          "${aws_s3_bucket.deployment_snapshots.arn}/*"
        ]
      }
    ]
  })
}

# ECS service for deployment tracker
resource "aws_ecs_task_definition" "deployment_tracker" {
  family                   = "${var.project_name}-deployment-tracker"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.deployment_tracker_execution_role.arn
  task_role_arn           = aws_iam_role.deployment_tracker_role.arn

  container_definitions = jsonencode([
    {
      name  = "deployment-tracker"
      image = "${var.ecr_registry}/deployment-tracker:latest"
      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "DEPLOYMENTS_TABLE"
          value = aws_dynamodb_table.deployments.name
        },
        {
          name  = "ROLLBACKS_TABLE"
          value = aws_dynamodb_table.rollbacks.name
        },
        {
          name  = "SNAPSHOTS_TABLE"
          value = aws_dynamodb_table.deployment_snapshots.name
        }
      ]
      secrets = [
        {
          name      = "API_TOKEN"
          valueFrom = aws_ssm_parameter.deployment_tracker_token.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.deployment_tracker.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

# ECS execution role
resource "aws_iam_role" "deployment_tracker_execution_role" {
  name = "${var.project_name}-deployment-tracker-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "deployment_tracker_execution_role_policy" {
  role       = aws_iam_role.deployment_tracker_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "deployment_tracker_execution_role_custom" {
  role = aws_iam_role.deployment_tracker_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = [
          aws_ssm_parameter.deployment_tracker_token.arn
        ]
      }
    ]
  })
}

# CloudWatch log group
resource "aws_cloudwatch_log_group" "deployment_tracker" {
  name              = "/ecs/${var.project_name}-deployment-tracker"
  retention_in_days = 7
}

# SSM parameter for API token
resource "aws_ssm_parameter" "deployment_tracker_token" {
  name  = "/${var.project_name}/deployment-tracker/api-token"
  type  = "SecureString"
  value = var.deployment_tracker_token

  tags = {
    Name        = "${var.project_name}-deployment-tracker-token"
    Environment = var.environment
  }
}

# ECS service
resource "aws_ecs_service" "deployment_tracker" {
  name            = "${var.project_name}-deployment-tracker"
  cluster         = var.ecs_cluster_id
  task_definition = aws_ecs_task_definition.deployment_tracker.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.deployment_tracker.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.deployment_tracker.arn
  }
}

# Security group
resource "aws_security_group" "deployment_tracker" {
  name_prefix = "${var.project_name}-deployment-tracker"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-deployment-tracker-sg"
  }
}

# Service discovery
resource "aws_service_discovery_service" "deployment_tracker" {
  name = "deployment-tracker"

  dns_config {
    namespace_id = var.service_discovery_namespace_id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_grace_period_seconds = 30
}