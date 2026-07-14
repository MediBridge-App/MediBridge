locals {
  # Naming convention: <project>-<environment>-<resource>
  # e.g. medibridge-dev-vpc, medibridge-dev-docs-bucket
  name_prefix = "${var.project}-${var.environment}"

  # Applied to every resource via the provider default_tags block.
  common_tags = {
    Project     = "MediBridge"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = var.owner
  }
}
