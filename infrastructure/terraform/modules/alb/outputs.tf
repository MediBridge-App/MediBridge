output "dns_name" {
  description = "Raw ALB hostname. This is the app URL — Vida points the frontend here."
  value       = aws_lb.this.dns_name
}

output "url" {
  description = "Full app URL. http, not https — see the note in main.tf."
  value       = "http://${aws_lb.this.dns_name}"
}

output "target_group_arn" {
  description = "Target group the ECS service registers into."
  value       = aws_lb_target_group.this.arn
}

output "listener_arn" {
  description = "HTTP listener ARN. ECS service creation fails if no listener is attached to the target group."
  value       = aws_lb_listener.http.arn
}
