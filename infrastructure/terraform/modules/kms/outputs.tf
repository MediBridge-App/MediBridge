output "key_arn" {
  description = "ARN of the customer-managed key. Consumed by s3, secrets, rds, and sqs."
  value       = aws_kms_key.main.arn
}

output "key_id" {
  description = "Key ID of the customer-managed key."
  value       = aws_kms_key.main.key_id
}

output "key_alias" {
  description = "Alias name, e.g. alias/medibridge-dev-main."
  value       = aws_kms_alias.main.name
}
