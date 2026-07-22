# Keyed by the short name ("backend", "workers") so callers can write
# module.ecr.repository_urls["backend"] rather than the full prefixed name.
output "repository_urls" {
  description = "Repository URLs to docker push to, keyed by short name."
  value       = { for k, r in aws_ecr_repository.this : k => r.repository_url }
}

output "repository_arns" {
  description = "Repository ARNs, keyed by short name. Used in IAM policies."
  value       = { for k, r in aws_ecr_repository.this : k => r.arn }
}
