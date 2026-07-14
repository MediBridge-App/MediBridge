# MediBridge Infrastructure

Terraform-managed AWS infrastructure for the MediBridge `dev` environment.
**Owner:** Olga (Infrastructure and Security).

- Design reference: [`docs/infrastructure-blueprint.md`](../docs/infrastructure-blueprint.md)
- Build plan (start here): [`docs/infrastructure-implementation-plan.md`](../docs/infrastructure-implementation-plan.md)

## Layout

```
infrastructure/
└── terraform/
    ├── versions.tf              # Terraform + provider pins, backend config
    ├── providers.tf             # AWS provider + default tags
    ├── variables.tf             # Root input variables
    ├── locals.tf                # Naming convention + common tags
    ├── main.tf                  # Module wiring (commented until built)
    ├── outputs.tf               # Values handed to other teams
    ├── terraform.tfvars.example # Copy to terraform.tfvars
    └── modules/                 # One module per concern (network, kms, s3, ...)
```

## Prerequisites

- Terraform >= 1.6, AWS CLI v2
- Authenticated to the MediBridge dev account: `aws sts get-caller-identity`
- Bedrock model access enabled in the console (one-time manual step)

## Usage

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars   # adjust if needed
terraform init
terraform validate
terraform plan
terraform apply
```

Build the modules in dependency order (uncomment each in `main.tf` as you go) —
see the phase plan in the implementation doc.

## State

**Local for now.** `terraform.tfstate` lives on your machine and is gitignored.
While state is local, only one person runs `apply`. Migrate to remote state
(S3 + DynamoDB lock) before a second teammate needs Terraform — steps are in
`versions.tf` and the implementation plan.

## Handing outputs to the team

After `apply`, read values with `terraform output` and share them via the
documented `.env` keys — never paste secrets into chat.

| Consumer | Needs |
|---|---|
| Backend (Bella) | rds_endpoint, document_bucket_name, kms_key_arn, cognito ids, db_secret_arn, alb_url |
| Database (Raissa) | rds_endpoint, db_secret_arn |
| Workers/AI (Ayesha) | processing_queue_url, ecr_workers_url |
| Frontend (Vida) | alb_url, cognito_user_pool_id, cognito_client_id |

## Teardown

```bash
terraform destroy
```

## Known manual steps

- Enable Amazon Bedrock model access (console), record enabled model IDs.
- ACM certificate DNS validation (if using a custom domain / Route 53).
