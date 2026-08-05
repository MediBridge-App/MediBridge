# Module: alb
# Public entry point. The only thing in the system reachable from the
# internet — ECS and RDS sit in private subnets behind it.
#
# HTTPS is terminated here using an ACM certificate for app.<domain>. Browsers
# connect over TLS; plain HTTP on :80 is redirected to :443. The certificate is
# validated automatically via a DNS record in the Route 53 hosted zone.
#
# Inherits common tags via the provider default_tags block in the root config.

resource "aws_lb" "this" {
  name               = "${var.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.public_subnet_ids

  # Strip malformed headers instead of forwarding them — cheap protection
  # against request-smuggling tricks.
  drop_invalid_header_fields = true

  tags = {
    Name = "${var.name_prefix}-alb"
  }
}

resource "aws_lb_target_group" "this" {
  name     = "${var.name_prefix}-tg"
  port     = var.app_port
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  # Fargate uses awsvpc networking, so tasks register by IP, not instance ID.
  target_type = "ip"

  # The backend must serve this path with a 200 or the ALB kills the task and
  # ECS restarts it in a loop. Bella needs to implement it.
  health_check {
    path                = var.health_check_path
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  # Default is 300s, which makes every deploy feel broken for five minutes.
  deregistration_delay = 30

  tags = {
    Name = "${var.name_prefix}-tg"
  }
}

# ---------------------------------------------------------------------------
# TLS certificate for app.<domain>, validated via DNS in the hosted zone
# ---------------------------------------------------------------------------
resource "aws_acm_certificate" "this" {
  domain_name       = local.backend_fqdn
  validation_method = "DNS"

  # Lets Terraform replace the cert without a gap if the domain ever changes.
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.name_prefix}-cert"
  }
}

# The DNS record that proves we own the domain. ACM tells us what record to
# create; this writes it into the Route 53 zone automatically.
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.this.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = var.hosted_zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

# Waits until the certificate is actually validated and issued before the
# HTTPS listener tries to use it. Without this the apply can fail on a
# not-yet-ready cert.
resource "aws_acm_certificate_validation" "this" {
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ---------------------------------------------------------------------------
# Listeners: HTTPS serves traffic, HTTP redirects to HTTPS
# ---------------------------------------------------------------------------
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"

  # Modern TLS only. Rejects old, weak protocol versions.
  ssl_policy      = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn = aws_acm_certificate_validation.this.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}

# Anyone who types http:// gets bounced to https:// automatically — so no
# unencrypted traffic ever reaches the app.
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      protocol    = "HTTPS"
      port        = "443"
      status_code = "HTTP_301"
    }
  }
}

# ---------------------------------------------------------------------------
# DNS: point app.<domain> at the load balancer
# ---------------------------------------------------------------------------
resource "aws_route53_record" "app" {
  zone_id = var.hosted_zone_id
  name    = local.backend_fqdn
  type    = "A"

  alias {
    name                   = aws_lb.this.dns_name
    zone_id                = aws_lb.this.zone_id
    evaluate_target_health = true
  }
}

locals {
  # Backend API lives at api.<domain>. The frontend takes app.<domain>
  # (served by CloudFront, in the frontend-hosting module).
  backend_fqdn = "api.${var.domain_name}"
}
