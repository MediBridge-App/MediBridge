variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "repositories" {
  type        = list(string)
  default     = ["backend", "workers"]
  description = "Repository names to create."
}
