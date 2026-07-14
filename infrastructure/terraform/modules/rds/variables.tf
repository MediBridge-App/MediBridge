variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "kms_key_arn" {
  type        = string
  description = "CMK ARN for encryption at rest."
}

variable "data_subnet_ids" {
  type        = list(string)
  description = "Private data subnet IDs for the DB subnet group."
}

variable "allowed_source_sg" {
  type        = string
  description = "Security group allowed to reach 5432 (the ECS SG)."
}

variable "db_secret_arn" {
  type        = string
  description = "Secrets Manager ARN holding DB credentials."
}

variable "vpc_id" {
  type        = string
  description = "VPC ID."
}
