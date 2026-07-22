output "bucket_name" {
  description = "Document bucket name. Bella's backend needs this to put and presign objects."
  value       = aws_s3_bucket.documents.bucket
}

output "bucket_arn" {
  description = "Document bucket ARN. Used in IAM policies for the ECS task role and Lambda execution role."
  value       = aws_s3_bucket.documents.arn
}
