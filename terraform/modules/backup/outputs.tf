output "backup_bucket_name" {
  description = "Name of the primary backup S3 bucket"
  value       = aws_s3_bucket.backup_primary.id
}

output "backup_bucket_arn" {
  description = "ARN of the primary backup S3 bucket"
  value       = aws_s3_bucket.backup_primary.arn
}

output "backup_glacier_bucket_name" {
  description = "Name of the Glacier backup S3 bucket"
  value       = aws_s3_bucket.backup_glacier.id
}

output "backup_kms_key_id" {
  description = "ID of the KMS key used for backup encryption"
  value       = aws_kms_key.backup_key.id
}

output "backup_kms_key_arn" {
  description = "ARN of the KMS key used for backup encryption"
  value       = aws_kms_key.backup_key.arn
}

output "backup_job_role_arn" {
  description = "ARN of the IAM role for backup jobs"
  value       = aws_iam_role.backup_job_role.arn
}

output "backup_vault_name" {
  description = "Name of the AWS Backup vault"
  value       = aws_backup_vault.main.name
}

output "backup_vault_arn" {
  description = "ARN of the AWS Backup vault"
  value       = aws_backup_vault.main.arn
}

output "backup_plan_id" {
  description = "ID of the AWS Backup plan"
  value       = aws_backup_plan.main.id
}

output "backup_inventory_table_name" {
  description = "Name of the DynamoDB table for backup inventory"
  value       = aws_dynamodb_table.backup_inventory.name
}

output "backup_notification_topic_arn" {
  description = "ARN of the SNS topic for backup notifications"
  value       = aws_sns_topic.backup_notifications.arn
}

output "terraform_state_backup_bucket" {
  description = "Name of the Terraform state backup bucket"
  value       = aws_s3_bucket.terraform_state_backup.id
}