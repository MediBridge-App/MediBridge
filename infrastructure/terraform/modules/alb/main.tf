# Module: alb
# Public ALB, HTTPS/443 listener, ACM cert, target group.
#
# TODO (alb):
#   - ACM certificate (DNS-validated; Route53 optional)
#   - aws_lb (application) in public subnets
#   - HTTPS:443 listener -> target group (ip target type for Fargate)
#   - Optional HTTP:80 -> 443 redirect
#
# Inherits common tags via the provider default_tags block in the root config.
