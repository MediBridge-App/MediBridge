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
