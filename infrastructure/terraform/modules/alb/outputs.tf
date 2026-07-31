output "dns_name" {
  description = "Raw ALB hostname. The DNS record app.<domain> points here."
  value       = aws_lb.this.dns_name
}

output "url" {
  description = "Full app URL over HTTPS — this is what Vida points the frontend at."
  value       = "https://${local.app_fqdn}"
}

output "target_group_arn" {
  description = "Target group the ECS service registers into."
  value       = aws_lb_target_group.this.arn
}

output "listener_arn" {
  description = "HTTPS listener ARN — the ECS service depends on a listener being attached to the target group."
  value       = aws_lb_listener.https.arn
}
