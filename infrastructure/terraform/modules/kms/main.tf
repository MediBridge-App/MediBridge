# Module: kms
# Customer-managed key (CMK) that encrypts everything at rest: the S3 document
# bucket, RDS storage, Secrets Manager entries, and SQS queues.
#
# No explicit key policy is set, so AWS applies its default: the account root
# has full access and IAM policies decide who may use the key. That is the
# correct pattern for same-account access — S3, RDS, Secrets Manager, and SQS
# all work this way. CloudWatch Logs is the exception; it needs an explicit
# statement here, so add one when the observability module lands.
#
# One key covers all data classes for dev. If we later want the OCR pipeline to
# decrypt documents without also being able to decrypt the database, split this
# into a documents key and a data key.
#
# Inherits common tags via the provider default_tags block in the root config.

resource "aws_kms_key" "main" {
  description = "${var.name_prefix} CMK for S3, RDS, Secrets Manager, and SQS"

  # Rotate the backing key material annually. AWS keeps older material so
  # previously-encrypted data stays readable.
  enable_key_rotation = true

  # Grace period after `terraform destroy` before AWS permanently deletes the
  # key. 7 is the minimum (max 30). Anything encrypted with a deleted key is
  # unrecoverable, so this window is the last chance to cancel.
  deletion_window_in_days = 7

  tags = {
    Name = "${var.name_prefix}-cmk"
  }
}

# Human-readable pointer to the key. Everything should reference the alias
# rather than the raw key ID, so the key can be rotated or replaced without
# every consumer changing.
resource "aws_kms_alias" "main" {
  name          = "alias/${var.name_prefix}-main"
  target_key_id = aws_kms_key.main.key_id
}
