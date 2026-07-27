output "instance_id" {
  description = "Jump host instance ID. This is the target for the SSM port-forwarding command."
  value       = aws_instance.jump.id
}
