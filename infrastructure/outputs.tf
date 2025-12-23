# =============================================================================
# Networking Outputs
# =============================================================================

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

# =============================================================================
# Database Outputs
# =============================================================================

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_address" {
  description = "RDS PostgreSQL address (hostname only)"
  value       = aws_db_instance.main.address
}

output "database_url" {
  description = "Full database connection URL"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.db_name}"
  sensitive   = true
}

# =============================================================================
# Compute Outputs
# =============================================================================

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.backend.id
}

output "ec2_private_ip" {
  description = "EC2 private IP address"
  value       = aws_instance.backend.private_ip
}

# =============================================================================
# Load Balancer Outputs
# =============================================================================

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "api_url" {
  description = "Backend API URL"
  value       = "http://${aws_lb.main.dns_name}"
}

# =============================================================================
# Frontend Outputs
# =============================================================================

output "s3_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = var.enable_cloudfront ? aws_cloudfront_distribution.frontend[0].domain_name : null
}

output "frontend_url" {
  description = "Frontend URL"
  value       = var.enable_cloudfront ? "https://${aws_cloudfront_distribution.frontend[0].domain_name}" : null
}

# =============================================================================
# Deployment Instructions
# =============================================================================

output "next_steps" {
  description = "Instructions for deploying the application"
  value       = <<-EOT

    ========================================
    🎉 Infrastructure Created Successfully!
    ========================================

    📡 API URL: http://${aws_lb.main.dns_name}
    🌐 Frontend URL: ${var.enable_cloudfront ? "https://${aws_cloudfront_distribution.frontend[0].domain_name}" : "CloudFront disabled"}

    Next Steps:
    -----------
    1. Deploy backend to EC2:
       - Connect via SSM: aws ssm start-session --target ${aws_instance.backend.id}
       - Copy your backend code to /opt/taskmanager
       - Restart service: sudo systemctl restart taskmanager

    2. Deploy frontend to S3:
       cd frontend
       npm run build
       aws s3 sync build/ s3://${aws_s3_bucket.frontend.id}/ --delete

    3. Update frontend API URL:
       Set REACT_APP_API_URL=http://${aws_lb.main.dns_name}

    Wait ~5 minutes for RDS and instances to be fully ready.

  EOT
}
