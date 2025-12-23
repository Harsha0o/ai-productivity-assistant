# Task Manager - AWS Infrastructure

Terraform configuration for deploying the Task Manager application to AWS.

## Architecture

- **VPC** with public and private subnets across 2 availability zones
- **RDS PostgreSQL** in private subnets
- **EC2** instance in private subnet running FastAPI
- **ALB** in public subnets for load balancing
- **S3 + CloudFront** for React frontend hosting

## Prerequisites

1. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```

2. **Terraform** installed (v1.0+)
   ```bash
   # Windows (using Chocolatey)
   choco install terraform
   
   # Or download from https://terraform.io/downloads
   ```

3. **AWS Credentials** with permissions for:
   - VPC, Subnets, Route Tables
   - EC2, Security Groups
   - RDS
   - S3, CloudFront
   - IAM

## Usage

### Initialize Terraform
```bash
cd infrastructure
terraform init
```

### Review the plan
```bash
terraform plan
```

### Apply the infrastructure
```bash
terraform apply
```

### Get outputs
```bash
terraform output
```

### Destroy (when done)
```bash
terraform destroy
```

## Files

| File | Description |
|------|-------------|
| `main.tf` | Provider configuration |
| `variables.tf` | Input variables |
| `outputs.tf` | Output values |
| `vpc.tf` | VPC, subnets, gateways |
| `security_groups.tf` | Security group rules |
| `rds.tf` | PostgreSQL database |
| `ec2.tf` | Backend compute |
| `alb.tf` | Load balancer |
| `s3.tf` | Frontend bucket |
| `cloudfront.tf` | CDN distribution |

## Estimated Costs (Free Tier Eligible)

| Resource | Type | Est. Monthly |
|----------|------|--------------|
| EC2 | t2.micro | Free (750 hrs) |
| RDS | db.t3.micro | ~$12-15 |
| ALB | - | ~$18 |
| S3 | - | < $1 |
| CloudFront | - | < $1 |
| NAT Gateway | - | ~$32 |

> **Note**: NAT Gateway can be removed for development to save costs.
