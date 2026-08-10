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

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Key policy. The first statement is the AWS default — the account root keeps
# full control, so IAM policies (like our admin role) continue to govern the
# key and we can NEVER lock ourselves out. The second statement is the only
# addition: it lets the SNS service encrypt messages it delivers into the
# CMK-encrypted SQS queue. Without it, SNS->SQS delivery fails silently.
data "aws_iam_policy_document" "main" {
  statement {
    sid       = "EnableAccountAdmin"
    effect    = "Allow"
    actions   = ["kms:*"]
    resources = ["*"]
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
  }

  statement {
    sid       = "AllowSNSToUseKeyForSQSDelivery"
    effect    = "Allow"
    actions   = ["kms:GenerateDataKey*", "kms:Decrypt"]
    resources = ["*"]
    principals {
      type        = "Service"
      identifiers = ["sns.amazonaws.com"]
    }
  }

  # CloudWatch Logs can only write to a CMK-encrypted log group if the key
  # policy explicitly lets the regional logs service principal use the key.
  # Scoped by encryption context to log groups in THIS account and region, so
  # the grant can't be used to encrypt/decrypt anything but our own log data.
  statement {
    sid    = "AllowCloudWatchLogsToUseKey"
    effect = "Allow"
    actions = [
      "kms:Encrypt*",
      "kms:Decrypt*",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:Describe*",
    ]
    resources = ["*"]
    principals {
      type        = "Service"
      identifiers = ["logs.${data.aws_region.current.name}.amazonaws.com"]
    }
    condition {
      test     = "ArnLike"
      variable = "kms:EncryptionContext:aws:logs:arn"
      values   = ["arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:*"]
    }
  }
}

resource "aws_kms_key" "main" {
  description = "${var.name_prefix} CMK for S3, RDS, Secrets Manager, SQS, and SNS"

  policy = data.aws_iam_policy_document.main.json

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
