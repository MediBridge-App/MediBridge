# Module: secrets
# Secrets Manager entries for the RDS master credential and application
# secrets, both encrypted with the CMK from the kms module.
#
# The database password is GENERATED here and never typed by a human, never
# committed, and never passed around in chat. The rds module and the backend
# both read it from Secrets Manager at runtime by ARN.
#
# NOTE: Terraform writes generated values into state in plaintext. Once this
# module is applied, terraform.tfstate contains the real database password —
# which is why the state file must stay gitignored and belongs in an encrypted
# S3 backend rather than on one laptop.
#
# Inherits common tags via the provider default_tags block in the root config.

resource "random_password" "db" {
  length  = 32
  special = true

  # RDS master passwords may not contain / ' " @ or spaces, so restrict the
  # special characters to a set RDS accepts.
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret" "db" {
  name        = "${var.name_prefix}/rds/master"
  description = "RDS master credentials for ${var.name_prefix}"
  kms_key_id  = var.kms_key_arn

  # Dev convenience: allow the name to be reused immediately after destroy.
  # AWS otherwise reserves a deleted secret's name for 30 days, which makes
  # destroy-then-apply fail. Raise this to 7-30 before anything resembling prod.
  recovery_window_in_days = 0

  tags = {
    Name = "${var.name_prefix}-rds-master"
  }
}

resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id

  # JSON with username/password is the shape RDS and most Postgres clients
  # expect, so consumers can parse one secret instead of reading two.
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db.result
  })
}

# Placeholder for application-level secrets (third-party API keys, etc.).
# Created empty so the ARN exists and can be wired into the ECS task
# definition now; values get filled in later.
resource "aws_secretsmanager_secret" "app" {
  name        = "${var.name_prefix}/app/secrets"
  description = "Application secrets for ${var.name_prefix}"
  kms_key_id  = var.kms_key_arn

  recovery_window_in_days = 0

  tags = {
    Name = "${var.name_prefix}-app-secrets"
  }
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id     = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({})

  # Values added by hand in the console should survive the next apply.
  lifecycle {
    ignore_changes = [secret_string]
  }
}
