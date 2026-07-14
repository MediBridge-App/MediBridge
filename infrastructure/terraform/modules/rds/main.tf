# Module: rds
# PostgreSQL in private data subnets, KMS at rest, SSL enforced.
#
# TODO (rds):
#   - aws_db_subnet_group across var.data_subnet_ids
#   - Security group: 5432 inbound from var.allowed_source_sg only
#   - aws_db_instance: small class, storage_encrypted w/ CMK,
#     publicly_accessible=false, parameter group with rds.force_ssl=1
#   - Credentials sourced from var.db_secret_arn
#
# Inherits common tags via the provider default_tags block in the root config.
