# Module: alb
# Public entry point. The only thing in the system reachable from the
# internet — ECS and RDS sit in private subnets behind it.
#
# HTTP only, deliberately. ACM cannot issue a certificate for the raw
# *.elb.amazonaws.com name and we have no custom domain, so there is no way to
# terminate TLS here. Known gap: browser-to-ALB is plain HTTP; ALB-to-ECS and
# ECS-to-RDS are still encrypted. Closing it means registering a domain and
# adding an ACM cert plus a 443 listener.
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

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}
