variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "zoptal"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

variable "backup_notification_email" {
  description = "Email address for backup notifications"
  type        = string
}

variable "backup_external_id" {
  description = "External ID for backup role assumption"
  type        = string
  default     = "zoptal-backup-external-id"
}

variable "enable_cross_region_replication" {
  description = "Enable cross-region replication for backups"
  type        = bool
  default     = true
}

variable "replica_region" {
  description = "AWS region for backup replicas"
  type        = string
  default     = "us-west-2"
}