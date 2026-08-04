output "bucket_name" {
  description = "S3 bucket holding the frontend build. Upload the dist/ files here."
  value       = aws_s3_bucket.frontend.id
}

output "distribution_id" {
  description = "CloudFront distribution ID. Needed to invalidate the cache after a deploy."
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_url" {
  description = "Underlying *.cloudfront.net HTTPS URL. Still works; app_url is the friendly name."
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "app_url" {
  description = "Friendly HTTPS URL users visit (app.<domain>). Used as the backend's FRONTEND_URL / CORS origin."
  value       = "https://${local.frontend_fqdn}"
}