terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    # Configure via terraform init -backend-config
    # bucket = "zoptal-terraform-state"
    # key    = "infrastructure/terraform.tfstate"
    # region = "us-east-1"
    # dynamodb_table = "zoptal-terraform-locks"
    # encrypt = true
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Zoptal"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Platform-Team"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# Random suffix for unique resource naming
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# Local values
locals {
  name_prefix = "zoptal-${var.environment}"
  
  common_tags = {
    Project     = "Zoptal"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  # AZ configuration
  azs = slice(data.aws_availability_zones.available.names, 0, 3)
}