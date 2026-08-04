output "dns_name" {
  description = "Raw ALB hostname. The DNS record api.<domain> points here."
  value       = aws_lb.this.dns_name
}

output "url" {
  description = "Full backend API URL over HTTPS (api.<domain>) — Vida sets VITE_API_URL to this; the worker uses it as BACKEND_API_URL."
  value       = "https://${local.backend_fqdn}"
}

output "target_group_arn" {
  description = "Target group the ECS service registers into."
  value       = aws_lb_target_group.this.arn
}

output "listener_arn" {
  description = "HTTPS listener ARN — the ECS service depends on a listener being attached to the target group."
  value       = aws_lb_listener.https.arn
}
