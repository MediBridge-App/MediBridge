variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "vpc_id" {
  type        = string
  description = "VPC ID."
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs for the ALB."
}

variable "security_group_id" {
  type        = string
  description = "ALB security group. Allows 80/443 from the internet."
}

variable "app_port" {
  type        = number
  default     = 8000
  description = "Port the FastAPI container listens on. Must match the ECS security group rule."
}

variable "health_check_path" {
  type        = string
  default     = "/health"
  description = "Path the ALB polls. The backend must return 200 here or tasks get killed and restarted."
}

variable "domain_name" {
  type        = string
  description = "Registered domain, e.g. medibridge.click. The app is served at app.<domain_name>."
}

variable "hosted_zone_id" {
  type        = string
  description = "Route 53 hosted zone ID for the domain — used for cert validation and the app DNS record."
}
