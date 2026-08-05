# This module needs TWO aws providers:
#   aws            — the default (us-east-2), for S3 + CloudFront.
#   aws.us_east_1  — for the ACM certificate, which CloudFront can only read
#                    from us-east-1. The root passes both in via `providers = {}`.
terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      configuration_aliases = [aws.us_east_1]
    }
  }
}
