output "deployments_table_name" {
  description = "Name of the deployments DynamoDB table"
  value       = aws_dynamodb_table.deployments.name
}

output "deployments_table_arn" {
  description = "ARN of the deployments DynamoDB table"
  value       = aws_dynamodb_table.deployments.arn
}

output "rollbacks_table_name" {
  description = "Name of the rollbacks DynamoDB table"
  value       = aws_dynamodb_table.rollbacks.name
}

output "rollbacks_table_arn" {
  description = "ARN of the rollbacks DynamoDB table"
  value       = aws_dynamodb_table.rollbacks.arn
}

output "snapshots_table_name" {
  description = "Name of the deployment snapshots DynamoDB table"
  value       = aws_dynamodb_table.deployment_snapshots.name
}

output "snapshots_table_arn" {
  description = "ARN of the deployment snapshots DynamoDB table"
  value       = aws_dynamodb_table.deployment_snapshots.arn
}

output "snapshots_bucket_name" {
  description = "Name of the deployment snapshots S3 bucket"
  value       = aws_s3_bucket.deployment_snapshots.id
}

output "snapshots_bucket_arn" {
  description = "ARN of the deployment snapshots S3 bucket"
  value       = aws_s3_bucket.deployment_snapshots.arn
}

output "deployment_tracker_service_name" {
  description = "Name of the deployment tracker ECS service"
  value       = aws_ecs_service.deployment_tracker.name
}

output "deployment_tracker_task_role_arn" {
  description = "ARN of the deployment tracker task role"
  value       = aws_iam_role.deployment_tracker_role.arn
}