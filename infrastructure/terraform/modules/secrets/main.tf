# Module: secrets
# Secrets Manager entries (DB creds, app secrets), KMS-encrypted.
#
# TODO (secrets):
#   - random_password for DB master credential
#   - aws_secretsmanager_secret + version for DB creds (KMS-encrypted)
#   - Placeholder app-secrets entry
#
# Inherits common tags via the provider default_tags block in the root config.
