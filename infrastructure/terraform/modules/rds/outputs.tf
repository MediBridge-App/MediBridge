output "endpoint" { value = aws_db_instance.this.address }
output "port" { value = aws_db_instance.this.port }

# Exposed so the db-access (SSM jump host) module can add itself as an allowed
# source on 5432. The instance only accepts connections from source security
# groups attached to it.
output "security_group_id" { value = aws_security_group.this.id }
