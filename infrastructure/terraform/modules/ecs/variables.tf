variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "vpc_id" {
  type        = string
  description = "VPC ID."
}

variable "app_subnet_ids" {
  type        = list(string)
  description = "Private app subnet IDs for Fargate tasks."
}

variable "ecr_backend_url" {
  type        = string
  description = "Backend image repository URL."
}

variable "target_group_arn" {
  type        = string
  description = "ALB target group to register with."
}

variable "security_group_id" {
  type        = string
  description = "ECS task security group."
}

variable "aws_region" {
  type        = string
  description = "Region, needed for the awslogs driver."
}

variable "kms_key_arn" {
  type        = string
  description = "CMK ARN. The task role needs Decrypt and GenerateDataKey to read and write encrypted objects."
}

variable "document_bucket_name" {
  type        = string
  description = "Document bucket name, passed to the app as an env var."
}

variable "document_bucket_arn" {
  type        = string
  description = "Document bucket ARN, used in the task role policy."
}

variable "db_secret_arn" {
  type        = string
  description = "RDS credentials secret. The ARN is passed to the app; the app reads the value at runtime."
}

variable "app_secrets_arn" {
  type        = string
  description = "Application secrets ARN."
}

variable "app_port" {
  type        = number
  default     = 8000
  description = "Container port. Must match the ALB target group and the ECS security group rule."
}

variable "image_tag" {
  type        = string
  default     = "latest"
  description = "Image tag to run. Pin to a digest or version tag for anything real."
}

variable "task_cpu" {
  type        = number
  default     = 512
  description = "Fargate CPU units. 512 = 0.5 vCPU."
}

variable "task_memory" {
  type        = number
  default     = 1024
  description = "Fargate memory in MiB. Must be a valid pairing with task_cpu."
}

variable "desired_count" {
  type        = number
  default     = 1
  description = "Running tasks. Set to 0 until Bella has pushed an image, otherwise the service restart-loops."
}

variable "log_retention_days" {
  type        = number
  default     = 30
  description = "CloudWatch log retention. Never zero — that means keep forever."
}

variable "events_topic_arn" {
  type        = string
  default     = ""
  description = "SNS topic the backend publishes document.sent events to. Empty = no publish permission."
}

# ---------------------------------------------------------------------------
# Backend runtime config. These map 1:1 to the os.getenv calls in the backend
# (api/database.py, api/services/*). Source of truth is the code — keep in sync.
# ---------------------------------------------------------------------------
variable "db_host" {
  type        = string
  description = "RDS endpoint hostname. Backend builds DATABASE_URL from this (DB_HOST)."
}

variable "db_port" {
  type        = number
  default     = 5432
  description = "RDS port (DB_PORT)."
}

variable "db_name" {
  type        = string
  default     = "medibridge"
  description = "Database name (DB_NAME). Matches the db_name in the rds module."
}

variable "cognito_user_pool_id" {
  type        = string
  description = "Cognito User Pool ID (COGNITO_USER_POOL_ID) — backend builds the JWKS URL and validates tokens."
}

variable "cognito_client_id" {
  type        = string
  description = "Cognito web client ID (COGNITO_CLIENT_ID) — backend verifies token audience."
}

variable "frontend_url" {
  type        = string
  description = "Frontend origin (FRONTEND_URL) — appended to the backend CORS allow-list."
}
