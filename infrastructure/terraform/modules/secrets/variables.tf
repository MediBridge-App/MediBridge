variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "kms_key_arn" {
  type        = string
  description = "CMK ARN for secret encryption."
}

variable "db_username" {
  type        = string
  description = "RDS master username. Stored in the secret alongside the generated password."
  default     = "medibridge_admin"
}
