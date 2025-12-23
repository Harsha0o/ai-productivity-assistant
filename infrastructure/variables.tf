# =============================================================================
# General Variables
# =============================================================================

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "task-manager"
}

# =============================================================================
# VPC Variables
# =============================================================================

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

# =============================================================================
# EC2 Variables
# =============================================================================

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "SSH key pair name (optional, leave empty if not using SSH)"
  type        = string
  default     = ""
}

# =============================================================================
# RDS Variables
# =============================================================================

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "taskmanager"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "taskadmin"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password (min 8 characters)"
  type        = string
  sensitive   = true
  
  validation {
    condition     = length(var.db_password) >= 8
    error_message = "Database password must be at least 8 characters long."
  }
}

# =============================================================================
# S3/CloudFront Variables
# =============================================================================

variable "frontend_bucket_name" {
  description = "S3 bucket name for frontend (must be globally unique)"
  type        = string
  default     = ""  # Will be auto-generated if empty
}

# =============================================================================
# Feature Flags
# =============================================================================

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway (costs ~$32/month, required for EC2 in private subnet to access internet)"
  type        = bool
  default     = true
}

variable "enable_cloudfront" {
  description = "Enable CloudFront CDN for frontend"
  type        = bool
  default     = true
}
