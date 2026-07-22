output "db_credentials_arn" {
  description = "ARN of the RDS master credential secret. Consumed by the rds module and the backend."
  value       = aws_secretsmanager_secret.db.arn
}

output "app_secrets_arn" {
  description = "ARN of the application secrets placeholder. Consumed by the ECS task definition."
  value       = aws_secretsmanager_secret.app.arn
}

output "db_username" {
  description = "Master username stored in the secret. The password is never exposed as an output."
  value       = var.db_username
}
