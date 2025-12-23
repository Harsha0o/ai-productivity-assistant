# =============================================================================
# RDS Subnet Group
# =============================================================================

resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-db-subnet-group"
  description = "Database subnet group for Task Manager"
  subnet_ids  = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# =============================================================================
# RDS PostgreSQL Instance
# =============================================================================

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"

  # Engine configuration
  engine               = "postgres"
  engine_version       = "15"
  instance_class       = var.db_instance_class
  allocated_storage    = 20
  max_allocated_storage = 100  # Enable storage autoscaling
  storage_type         = "gp3"
  storage_encrypted    = true

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = false  # Set to true for production

  # Backup configuration
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Performance and monitoring
  performance_insights_enabled = false  # Enable for production
  
  # Deletion protection (disable for dev)
  deletion_protection = false
  skip_final_snapshot = true  # Set to false for production

  tags = {
    Name = "${var.project_name}-db"
  }
}
