output "endpoint" { value = aws_db_instance.this.address }

output "instance_id" {
  description = "DB instance identifier — the DBInstanceIdentifier dimension for CloudWatch RDS metrics."
  value       = aws_db_instance.this.identifier
}
output "port" { value = aws_db_instance.this.port }

# Exposed so the db-access (SSM jump host) module can add itself as an allowed
# source on 5432. The instance only accepts connections from source security
# groups attached to it.
output "security_group_id" { value = aws_security_group.this.id }
