# Module: rds
# PostgreSQL in private data subnets, KMS at rest, SSL enforced.
#
# Inherits common tags via the provider default_tags block in the root config.

# ---------------------------------------------------------------------------
# DB subnet group — spans the private data subnets
# ---------------------------------------------------------------------------
resource "aws_db_subnet_group" "this" {
  name       = "${var.name_prefix}-db-subnet-group"
  subnet_ids = var.data_subnet_ids

  tags = {
    Name = "${var.name_prefix}-db-subnet-group"
  }
}

# ---------------------------------------------------------------------------
# Security group — only allow 5432 from the ECS task security group
# ---------------------------------------------------------------------------
resource "aws_security_group" "this" {
  name        = "${var.name_prefix}-rds-module-sg"
  description = "Allow PostgreSQL access from the ECS backend only"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.allowed_source_sg]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-rds-module-sg"
  }
}

# ---------------------------------------------------------------------------
# Force SSL on all connections (rds.force_ssl = 1)
# ---------------------------------------------------------------------------
resource "aws_db_parameter_group" "this" {
  name   = "${var.name_prefix}-pg16-force-ssl"
  family = "postgres16"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = {
    Name = "${var.name_prefix}-pg16-force-ssl"
  }
}

# ---------------------------------------------------------------------------
# Pull master credentials from the Secrets Manager entry Olga provisioned
# Expected secret JSON shape: {"username": "...", "password": "..."}
# ---------------------------------------------------------------------------
data "aws_secretsmanager_secret_version" "db" {
  secret_id = var.db_secret_arn
}

locals {
  db_creds = jsondecode(data.aws_secretsmanager_secret_version.db.secret_string)
}

# ---------------------------------------------------------------------------
# The database instance itself
# ---------------------------------------------------------------------------
resource "aws_db_instance" "this" {
  identifier     = "${var.name_prefix}-db"
  engine         = "postgres"
  engine_version = "16.14"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = var.kms_key_arn

  db_name  = "medibridge"
  username = local.db_creds["username"]
  password = local.db_creds["password"]

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]
  parameter_group_name   = aws_db_parameter_group.this.name

  publicly_accessible = false
  multi_az            = false

  backup_retention_period = 7
  skip_final_snapshot     = true
  deletion_protection     = false

  tags = {
    Name = "${var.name_prefix}-db"
  }
}
