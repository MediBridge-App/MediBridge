# Module: kms
# Customer-managed KMS key(s) + alias for S3, RDS, Secrets, logs.
#
# TODO (kms):
#   - aws_kms_key with rotation enabled
#   - aws_kms_alias alias/${name_prefix}-main
#   - Key policy granting use to S3, RDS, Secrets Manager, CloudWatch Logs
#
# Inherits common tags via the provider default_tags block in the root config.
