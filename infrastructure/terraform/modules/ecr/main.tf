# Module: ecr
# Container repositories for backend and worker images.
#
# TODO (ecr):
#   - aws_ecr_repository per var.repositories with scan_on_push
#   - Lifecycle policy to expire untagged images
#
# Inherits common tags via the provider default_tags block in the root config.
