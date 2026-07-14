# Module: iam
# Shared roles/policies not owned by a specific module (e.g. CI/CD deploy).
#
# TODO (iam):
#   - CI/CD deploy role: push ECR, update ECS, run Terraform for dev
#   - Any cross-cutting policies; keep everything least-privilege
#
# Inherits common tags via the provider default_tags block in the root config.
