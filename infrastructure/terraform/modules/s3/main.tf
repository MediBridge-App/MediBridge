# Module: s3
# Encrypted document bucket (SSE-KMS), block public access, versioning, lifecycle.
#
# TODO (s3):
#   - Bucket ${name_prefix}-documents
#   - SSE-KMS with var.kms_key_arn; bucket key enabled
#   - Block ALL public access; versioning on; lifecycle rule for cost
#   - No public bucket policy (access via backend presigned URLs)
#
# Inherits common tags via the provider default_tags block in the root config.
