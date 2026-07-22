# Module: ecr
# Container image repositories for the backend and the workers. ECR stores
# images; ECS pulls from here and runs them. Nothing executes in ECR.
#
# Images hold application code, not PHI, so default AES-256 encryption is
# sufficient — no CMK needed here.
#
# Inherits common tags via the provider default_tags block in the root config.

resource "aws_ecr_repository" "this" {
  for_each = toset(var.repositories)

  name = "${var.name_prefix}-${each.key}"

  # MUTABLE lets the team overwrite :latest while iterating. Switch to
  # IMMUTABLE before production so a deployed tag can't change underneath you.
  image_tag_mutability = "MUTABLE"

  # Scans each pushed image for known CVEs. Free, and gives us something
  # concrete to point at for vulnerability management.
  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.name_prefix}-${each.key}"
  }
}

# Without this, every build ever pushed is kept and billed forever.
resource "aws_ecr_lifecycle_policy" "this" {
  for_each = aws_ecr_repository.this

  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep only the 10 most recent images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = {
        type = "expire"
      }
    }]
  })
}
