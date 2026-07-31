output "bucket_name" {
  description = "S3 bucket holding the frontend build. Upload the dist/ files here."
  value       = aws_s3_bucket.frontend.id
}

output "distribution_id" {
  description = "CloudFront distribution ID. Needed to invalidate the cache after a deploy."
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_url" {
  description = "Public HTTPS URL of the frontend."
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}