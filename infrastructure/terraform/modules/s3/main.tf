# Module: s3
# Encrypted document bucket — the PDFs live here; Postgres stores only the
# pointer (documents.file_s3_key). Bucket is fully private: reads happen via
# short-lived presigned URLs the backend issues after checking access.
#
# HIPAA-aligned controls. This is a prototype with no BAA, so nothing here is
# "compliant" on its own — but the technical safeguards are in place:
#   - at rest: SSE-KMS with our CMK, so we control who can decrypt
#   - access: all four public-access flags blocked, no public policy
#   - in transit: bucket policy denies non-TLS requests
#   - integrity: versioning makes an overwrite or delete recoverable
#   - audit: NOT covered here. S3 data events and access logging are off, so
#     audit_logs rows are the only record of a download. Phase 3.
#
# Contract with the backend (Bella):
#   1. Object keys must be UUIDs, never filenames — keys appear in CloudTrail
#      and ALB logs. Human-readable name goes in documents.original_filename.
#   2. Downloads via presigned URLs, 15 min max. Never make an object public.
#   3. Task and Lambda roles need kms:Decrypt as well as s3:GetObject. Granting
#      only the S3 action fails with an access-denied that looks like S3.
#
# Inherits common tags via the provider default_tags block in the root config.

resource "aws_s3_bucket" "documents" {
  bucket = "${var.name_prefix}-documents"

  tags = {
    Name = "${var.name_prefix}-documents"
  }
}

# All four flags on, no exceptions. This is what prevents the "open bucket"
# headline.
resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = var.kms_key_arn
    }

    # Derives a key per bucket instead of calling KMS per object — up to 99%
    # fewer KMS calls, same encryption. Matters once OCR reads in bulk.
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Lets the browser upload/download directly via presigned URLs. Without this,
# the browser blocks the cross-origin request before it reaches S3 — the
# backend can still generate the URL, but the actual PUT fails.
resource "aws_s3_bucket_cors_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  cors_rule {
    allowed_origins = var.cors_allowed_origins
    allowed_methods = ["GET", "PUT"]

    # Broad within trusted origins so presigned PUTs (which carry the KMS and
    # content-type headers) aren't rejected on a missing-header technicality.
    allowed_headers = ["*"]

    # ETag lets the frontend confirm the upload succeeded.
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# S3 accepts plain HTTP by default. Deny-only, so it grants nothing and does
# not conflict with block_public_policy.
data "aws_iam_policy_document" "documents" {
  statement {
    sid    = "DenyInsecureTransport"
    effect = "Deny"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = ["s3:*"]

    resources = [
      aws_s3_bucket.documents.arn,
      "${aws_s3_bucket.documents.arn}/*",
    ]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "documents" {
  bucket     = aws_s3_bucket.documents.id
  policy     = data.aws_iam_policy_document.documents.json
  depends_on = [aws_s3_bucket_public_access_block.documents]
}

# Cost control, not retention — this only expires superseded versions, never
# current objects. Real HIPAA retention would be a separate rule, and Object
# Lock cannot be added to an existing bucket if we ever need write-once.
resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  # Versioning must exist before a rule can reference noncurrent versions.
  depends_on = [aws_s3_bucket_versioning.documents]

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }
  }

  rule {
    id     = "abort-incomplete-uploads"
    status = "Enabled"

    filter {}

    # Failed multipart uploads leave billable fragments behind forever.
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
