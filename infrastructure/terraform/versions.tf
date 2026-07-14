terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # State: LOCAL for now (solo dev spike).
  # terraform.tfstate stays on your machine and is gitignored.
  # Only one person should run `apply` while state is local.
  #
  # When a second teammate needs to run Terraform, migrate to remote state:
  #   1. Bootstrap an S3 state bucket + DynamoDB lock table.
  #   2. Uncomment and fill the block below.
  #   3. Run: terraform init -migrate-state
  #
  # backend "s3" {
  #   bucket         = "medibridge-dev-tfstate"
  #   key            = "dev/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "medibridge-dev-tflock"
  #   encrypt        = true
  # }
}
