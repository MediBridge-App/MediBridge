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
