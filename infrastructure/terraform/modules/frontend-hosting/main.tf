# The bucket that holds the built frontend files (index.html, JS, CSS).
# It stays PRIVATE — only CloudFront will be allowed to read it. Users never
# touch S3 directly; they go through CloudFront.
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.name_prefix}-frontend"

  tags = {
    Name = "${var.name_prefix}-frontend"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ---------------------------------------------------------------------------
# Origin Access Control — CloudFront's identity for reaching the private
# bucket. S3 stays fully locked to the public; only requests signed with this
# OAC get in (the bucket policy in the next step enforces that).
# ---------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.name_prefix}-frontend-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ---------------------------------------------------------------------------
# Custom domain: app.<domain> served by CloudFront over HTTPS.
# The certificate MUST be in us-east-1 (CloudFront requirement), hence the
# aws.us_east_1 provider. Validation records go in the Route 53 zone (Route 53
# is global, so the default provider is fine for them).
# ---------------------------------------------------------------------------
locals {
  frontend_fqdn = "app.${var.domain_name}"
}

resource "aws_acm_certificate" "frontend" {
  provider          = aws.us_east_1
  domain_name       = local.frontend_fqdn
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.name_prefix}-frontend-cert"
  }
}

resource "aws_route53_record" "frontend_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "frontend" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.frontend.arn
  validation_record_fqdns = [for r in aws_route53_record.frontend_cert_validation : r.fqdn]
}

# ---------------------------------------------------------------------------
# CloudFront distribution — the CDN. Serves the SPA over HTTPS from edge
# locations, pulling the files from the private S3 bucket via the OAC.
# ---------------------------------------------------------------------------
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  comment             = "${var.name_prefix} frontend"

  # The custom domain(s) this distribution answers to. Must be covered by the
  # ACM certificate below, or CloudFront rejects the config.
  aliases = [local.frontend_fqdn]

  # WHERE the files come from: our private S3 bucket, reached with the OAC badge.
  origin {
    origin_id                = "s3-frontend"
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # HOW to serve requests: force HTTPS, cache aggressively, GET/HEAD only.
  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    # AWS-managed "CachingOptimized" policy — sensible caching defaults so we
    # don't hand-tune TTLs.
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # SPA routing: a React app owns its own routes. If someone hits /patients
  # directly, S3 has no such file and returns 403/404 — so we hand back
  # index.html with a 200 and let the app's router handle the path.
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  # No geo-blocking for the demo.
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Serve HTTPS on app.<domain> using the ACM cert (validated above). sni-only
  # is the standard, no-extra-cost option; modern browsers all support SNI.
  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.frontend.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.name_prefix}-frontend"
  }
}

# ---------------------------------------------------------------------------
# Bucket policy — the final link. Allows the CloudFront *service* to read
# objects, but ONLY when the request carries this specific distribution's ARN
# (the OAC signature). No public access; nobody else can read the bucket.
# ---------------------------------------------------------------------------
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontRead"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# DNS: point app.<domain> at the CloudFront distribution (alias A record).
# ---------------------------------------------------------------------------
resource "aws_route53_record" "frontend" {
  zone_id = var.hosted_zone_id
  name    = local.frontend_fqdn
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}