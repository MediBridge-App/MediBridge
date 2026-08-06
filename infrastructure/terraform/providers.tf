provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

# CloudFront reads ACM certificates only from us-east-1, regardless of where the
# rest of the stack lives. This aliased provider exists solely to create the
# frontend's certificate in us-east-1; everything else uses the default provider.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.common_tags
  }
}
