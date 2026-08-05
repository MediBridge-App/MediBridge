variable "name_prefix" {
  type        = string
  description = "Resource name prefix, e.g. medibridge-dev."
}

variable "domain_name" {
  type        = string
  description = "Registered domain, e.g. medibridge.click. The frontend is served at app.<domain_name>."
}

variable "hosted_zone_id" {
  type        = string
  description = "Route 53 hosted zone ID for the domain — used for cert validation and the app DNS record."
}
