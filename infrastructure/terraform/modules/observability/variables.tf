variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "kms_key_arn" {
  type        = string
  description = "CMK ARN. Reserved for KMS-encrypting log groups in a later phase."
}

variable "alarm_email" {
  type        = string
  description = "Email that receives alarm notifications. AWS emails a confirmation link on first apply — you must click it."
}

variable "lambda_function_name" {
  type        = string
  description = "Worker Lambda function name to watch for errors."
}

variable "dlq_arn" {
  type        = string
  description = "Dead-letter queue ARN. Its depth is the top pipeline-failure signal."
}
