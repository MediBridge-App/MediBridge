# Consumed by other teams. Uncomment each output as the module lands, then
# hand values off with `terraform output` (do NOT paste secrets in chat).
#
# Backend (Bella):  rds_endpoint, document_bucket_name, kms_key_arn,
#                   cognito_user_pool_id, cognito_client_id, db_secret_arn, alb_url
# Database (Raissa): rds_endpoint, db_secret_arn
# Workers (Ayesha):  processing_queue_url, ecr_workers_url
# Frontend (Vida):   alb_url, cognito_user_pool_id, cognito_client_id

output "vpc_id" {
  value = module.network.vpc_id
}

output "public_subnet_ids" {
  value = module.network.public_subnet_ids
}

output "private_app_subnet_ids" {
  value = module.network.private_app_subnet_ids
}

output "private_data_subnet_ids" {
  value = module.network.private_data_subnet_ids
}

output "document_bucket_name" {
  description = "Document bucket name — Bella needs this for uploads and presigned URLs."
  value       = module.s3.bucket_name
}

output "document_bucket_arn" {
  description = "Document bucket ARN — used in the ECS task and Lambda IAM policies."
  value       = module.s3.bucket_arn
}

output "kms_key_arn" {
  description = "CMK ARN — Ayesha needs this for the OCR/Bedrock Lambda role."
  value       = module.kms.key_arn
}

# output "rds_endpoint" {
#   value = module.rds.endpoint
# }

output "db_secret_arn" {
  description = "Secrets Manager ARN holding DB credentials. Safe to share — IAM controls who can read the value."
  value       = module.secrets.db_credentials_arn
}

output "app_secrets_arn" {
  description = "Secrets Manager ARN for application secrets (empty placeholder)."
  value       = module.secrets.app_secrets_arn
}

# output "cognito_user_pool_id" {
#   value = module.cognito.user_pool_id
# }

# output "cognito_client_id" {
#   value = module.cognito.client_id
# }

output "ecr_backend_url" {
  description = "Bella pushes the FastAPI image here."
  value       = module.ecr.repository_urls["backend"]
}

output "ecr_workers_url" {
  description = "Ayesha pushes the worker image here."
  value       = module.ecr.repository_urls["workers"]
}

output "alb_url" {
  description = "App entry point for Vida. http, not https — no domain, so no ACM cert."
  value       = module.alb.url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Backend service name. CI uses this to force a new deployment."
  value       = module.ecs.service_name
}

# output "processing_queue_url" {
#   value = module.sqs.processing_queue_url
# }
