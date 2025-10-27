#!/bin/bash

# Terraform deployment script for Zoptal infrastructure
# This script provides convenient commands for managing AWS infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR"
STATE_BUCKET=""
STATE_KEY=""
STATE_REGION=""

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if terraform is installed
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install Terraform first."
        exit 1
    fi
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI first."
        exit 1
    fi
    
    # Check if AWS credentials are configured
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to setup backend configuration
setup_backend() {
    local environment=$1
    
    if [ -z "$environment" ]; then
        print_error "Environment parameter is required for backend setup"
        exit 1
    fi
    
    print_info "Setting up Terraform backend for environment: $environment"
    
    # Set backend configuration based on environment
    STATE_BUCKET="zoptal-terraform-state-${environment}"
    STATE_KEY="terraform.tfstate"
    STATE_REGION="us-east-1"
    
    # Create backend configuration file
    cat > "$TERRAFORM_DIR/backend.tf" << EOF
terraform {
  backend "s3" {
    bucket = "$STATE_BUCKET"
    key    = "$STATE_KEY"
    region = "$STATE_REGION"
    
    # Enable state locking
    dynamodb_table = "zoptal-terraform-locks-${environment}"
    encrypt        = true
  }
}
EOF
    
    print_success "Backend configuration created for environment: $environment"
}

# Function to create S3 bucket for state storage
create_state_bucket() {
    local environment=$1
    local bucket_name="zoptal-terraform-state-${environment}"
    local region="us-east-1"
    
    print_info "Creating S3 bucket for Terraform state: $bucket_name"
    
    # Check if bucket exists
    if aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
        print_warning "S3 bucket $bucket_name already exists"
    else
        # Create bucket
        if [ "$region" = "us-east-1" ]; then
            aws s3api create-bucket --bucket "$bucket_name" --region "$region"
        else
            aws s3api create-bucket --bucket "$bucket_name" --region "$region" \
                --create-bucket-configuration LocationConstraint="$region"
        fi
        
        # Enable versioning
        aws s3api put-bucket-versioning --bucket "$bucket_name" \
            --versioning-configuration Status=Enabled
        
        # Enable encryption
        aws s3api put-bucket-encryption --bucket "$bucket_name" \
            --server-side-encryption-configuration '{
                "Rules": [
                    {
                        "ApplyServerSideEncryptionByDefault": {
                            "SSEAlgorithm": "AES256"
                        }
                    }
                ]
            }'
        
        # Block public access
        aws s3api put-public-access-block --bucket "$bucket_name" \
            --public-access-block-configuration \
            BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
        
        print_success "S3 bucket created and configured: $bucket_name"
    fi
    
    # Create DynamoDB table for state locking
    local table_name="zoptal-terraform-locks-${environment}"
    
    print_info "Creating DynamoDB table for state locking: $table_name"
    
    if aws dynamodb describe-table --table-name "$table_name" 2>/dev/null; then
        print_warning "DynamoDB table $table_name already exists"
    else
        aws dynamodb create-table \
            --table-name "$table_name" \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
            --region "$region"
        
        print_success "DynamoDB table created: $table_name"
    fi
}

# Function to initialize Terraform
init_terraform() {
    print_info "Initializing Terraform..."
    cd "$TERRAFORM_DIR"
    terraform init
    print_success "Terraform initialized successfully!"
}

# Function to validate Terraform configuration
validate_terraform() {
    print_info "Validating Terraform configuration..."
    cd "$TERRAFORM_DIR"
    terraform validate
    print_success "Terraform configuration is valid!"
}

# Function to plan Terraform changes
plan_terraform() {
    local var_file=$1
    
    print_info "Planning Terraform changes..."
    cd "$TERRAFORM_DIR"
    
    if [ -n "$var_file" ] && [ -f "$var_file" ]; then
        terraform plan -var-file="$var_file" -out=tfplan
    else
        terraform plan -out=tfplan
    fi
    
    print_success "Terraform plan completed! Review the plan above."
    print_warning "Run 'apply' command to execute the plan."
}

# Function to apply Terraform changes
apply_terraform() {
    print_info "Applying Terraform changes..."
    cd "$TERRAFORM_DIR"
    
    if [ -f "tfplan" ]; then
        terraform apply tfplan
        rm -f tfplan
    else
        print_error "No plan file found. Run 'plan' command first."
        exit 1
    fi
    
    print_success "Terraform apply completed successfully!"
}

# Function to destroy infrastructure
destroy_terraform() {
    local var_file=$1
    
    print_warning "This will destroy ALL infrastructure resources!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        print_info "Destroying Terraform infrastructure..."
        cd "$TERRAFORM_DIR"
        
        if [ -n "$var_file" ] && [ -f "$var_file" ]; then
            terraform destroy -var-file="$var_file" -auto-approve
        else
            terraform destroy -auto-approve
        fi
        
        print_success "Infrastructure destroyed successfully!"
    else
        print_info "Destroy operation cancelled."
    fi
}

# Function to output values
output_terraform() {
    print_info "Getting Terraform outputs..."
    cd "$TERRAFORM_DIR"
    terraform output
}

# Function to show help
show_help() {
    echo "Terraform deployment script for Zoptal infrastructure"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup-backend ENVIRONMENT    Setup Terraform backend for given environment"
    echo "  create-state-bucket ENVIRONMENT  Create S3 bucket and DynamoDB table for state"
    echo "  init                         Initialize Terraform"
    echo "  validate                     Validate Terraform configuration"
    echo "  plan [VAR_FILE]             Plan Terraform changes"
    echo "  apply                       Apply Terraform changes"
    echo "  destroy [VAR_FILE]          Destroy infrastructure"
    echo "  output                      Show Terraform outputs"
    echo "  help                        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup-backend production"
    echo "  $0 create-state-bucket production"
    echo "  $0 init"
    echo "  $0 plan terraform.tfvars"
    echo "  $0 apply"
    echo "  $0 destroy terraform.tfvars"
    echo "  $0 output"
    echo ""
    echo "Environment-specific deployment:"
    echo "  # For production"
    echo "  $0 setup-backend production"
    echo "  $0 create-state-bucket production"
    echo "  $0 init"
    echo "  $0 plan production.tfvars"
    echo "  $0 apply"
    echo ""
    echo "  # For staging"
    echo "  $0 setup-backend staging"
    echo "  $0 create-state-bucket staging"
    echo "  $0 init"
    echo "  $0 plan staging.tfvars"
    echo "  $0 apply"
}

# Main execution
main() {
    case "${1:-help}" in
        "setup-backend")
            check_prerequisites
            setup_backend "$2"
            ;;
        "create-state-bucket")
            check_prerequisites
            create_state_bucket "$2"
            ;;
        "init")
            check_prerequisites
            init_terraform
            ;;
        "validate")
            check_prerequisites
            validate_terraform
            ;;
        "plan")
            check_prerequisites
            plan_terraform "$2"
            ;;
        "apply")
            check_prerequisites
            apply_terraform
            ;;
        "destroy")
            check_prerequisites
            destroy_terraform "$2"
            ;;
        "output")
            check_prerequisites
            output_terraform
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"