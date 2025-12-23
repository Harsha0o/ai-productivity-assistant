# =============================================================================
# S3 Bucket for Frontend
# =============================================================================

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name != "" ? var.frontend_bucket_name : "${var.project_name}-frontend-${random_string.bucket_suffix.result}"

  tags = {
    Name = "${var.project_name}-frontend"
  }
}

# =============================================================================
# S3 Bucket Configuration
# =============================================================================

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# =============================================================================
# S3 Bucket Policy for CloudFront
# =============================================================================

resource "aws_s3_bucket_policy" "frontend" {
  count  = var.enable_cloudfront ? 1 : 0
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend[0].arn
          }
        }
      }
    ]
  })
}
