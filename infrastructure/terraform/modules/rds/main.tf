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
# Security group — 5432 restricted to approved sources.
#
# Ingress rules are SEPARATE resources, not an inline `ingress` block, on
# purpose. Other modules (db-access adds the SSM jump host) attach their own
# ingress rules to this group. An inline block "owns" the whole rule list and
# silently deletes those external rules on every apply — the flip-flop that
# kept breaking the jump host's access. Keep all ingress external so the rules
# coexist. It also means a manually-added rule (e.g. someone opening the DB to
# a home IP in the console) still gets removed on the next apply, which is the
# correct behaviour — direct DB access should go through the SSM tunnel.
# ---------------------------------------------------------------------------
resource "aws_security_group" "this" {
  name = "${var.name_prefix}-rds-module-sg"
  # Keep this description byte-for-byte — AWS freezes SG descriptions at
  # creation, so editing it forces a destroy-and-recreate of the whole group.
  description = "Allow PostgreSQL access from the ECS backend only"
  vpc_id      = var.vpc_id

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

resource "aws_vpc_security_group_ingress_rule" "ecs" {
  security_group_id            = aws_security_group.this.id
  referenced_security_group_id = var.allowed_source_sg
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "PostgreSQL from ECS tasks"
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
