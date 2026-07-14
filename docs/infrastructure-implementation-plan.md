# MediBridge — Infrastructure Implementation Plan (Role 4)

**Owner:** Olga — Infrastructure and Security
**Directory:** `infrastructure/`
**Tooling:** Terraform (IaC), AWS (`us-east-1`), single `dev` environment first
**Source of truth for design:** `docs/infrastructure-blueprint.md`

This plan turns the blueprint into an ordered, do-this-then-that build. It is scoped to the infrastructure/security role and mapped to the three project milestones so the frontend, backend, worker, and database teams get what they need, when they need it.

---

## Do I need Terraform?

Yes. The blueprint requires that "all infrastructure must be defined as code" (Dev Environment Assumptions). The stack spans a dozen interdependent AWS services (VPC, ECS, RDS, KMS, Cognito, SQS, Lambda, S3, ALB, IAM) that must be created in a specific order and torn down cleanly between demos. Terraform gives repeatable provisioning, a reviewable plan before every change, and a naming convention that extends from `dev` to `staging`/`prod` later. The repo already anticipates it (`.gitignore` has Terraform entries; the README lists "AWS and Terraform configuration" under `infrastructure/`).

**State decision (for now): local state.** Simplest to start as a solo spike. The tradeoff is that state is not shared and not locked, so only one person should run `apply`, and the `terraform.tfstate` file must never be committed (already covered by `.gitignore`). A migration path to remote state (S3 + DynamoDB lock) is included at the end — do it before a second person needs to run Terraform.

---

## Guiding principles

- **One environment first (`dev`), one region (`us-east-1`).** Get the whole pipeline working before adding environments.
- **Everything as code, nothing clicked in the console.** If you must click something to unblock the team, capture it in Terraform immediately after.
- **Least privilege from the start.** No wildcard IAM, no long-lived static keys where a task/execution role works.
- **Encrypt by default.** KMS at rest, TLS in transit. This is a HIPAA-principles project — the encryption model is not optional polish.
- **Publish outputs, not Slack messages.** Other teams consume `terraform output` values (documented), not ad-hoc strings.
- **Cost-conscious dev sizing.** Small RDS class, ECS desired count = 1, single NAT (or a documented NAT-free alternative).

---

## Module breakdown

Terraform is organized as a root configuration that calls small, single-purpose modules. Suggested layout (scaffolded in `infrastructure/terraform/`):

| Module | Provisions | Depends on |
|---|---|---|
| `network` | VPC, public/private-app/private-data subnets, IGW, NAT, route tables, base security groups | — |
| `kms` | Customer-managed KMS key(s) + aliases for S3, RDS, Secrets, logs | — |
| `s3` | Encrypted document bucket (SSE-KMS), block-public-access, versioning, lifecycle | `kms` |
| `secrets` | Secrets Manager entries (DB creds, app secrets), KMS-encrypted | `kms` |
| `rds` | PostgreSQL instance in private data subnets, SG, subnet group, KMS at rest, SSL enforced | `network`, `kms`, `secrets` |
| `cognito` | User pool, app client, groups/roles, (optional) MFA | — |
| `ecr` | Container repositories for backend and workers | — |
| `alb` | Public ALB, HTTPS/443 listener, ACM cert, target group | `network` |
| `ecs` | ECS cluster, Fargate service + task def for FastAPI backend, task role | `network`, `alb`, `ecr`, `rds`, `secrets` |
| `sqs` | Document processing queue(s) + dead-letter queue | `kms` |
| `lambda` | OCR/classification handler functions, event source mapping from SQS, exec roles | `sqs`, `s3`, `network`, `rds` |
| `iam` | Shared roles/policies not owned by a specific module (CI/CD deploy role, etc.) | varies |
| `observability` | CloudWatch log groups (KMS-encrypted), basic alarms | `kms` |

Textract and Bedrock are not provisioned as infrastructure — they are API endpoints. Your job for those is the **IAM permissions** (in `lambda`/`iam`) that let the workers call them, plus enabling Bedrock model access in the account console (a one-time manual step to document).

---

## Phase-by-phase implementation

### Phase 0 — Foundations (before Milestone 1 work starts)

1. **Confirm AWS account + region access.** Dedicated MediBridge dev account, `us-east-1`. Verify you can authenticate the AWS CLI (`aws sts get-caller-identity`).
2. **Enable Bedrock model access.** In the Bedrock console, request access to the model(s) Ayesha's workers will use. Document which model IDs are enabled. (Manual, one-time.)
3. **Install pinned tooling.** Terraform (pin a version in `versions.tf`), AWS CLI v2.
4. **Lay down the Terraform skeleton** (scaffolded for you in `infrastructure/terraform/`): `versions.tf`, `providers.tf`, `variables.tf`, `locals.tf` (naming + common tags), `main.tf` (module wiring), `outputs.tf`, `terraform.tfvars.example`.
5. **Decide naming + tagging convention now.** e.g. `medibridge-dev-<resource>`; common tags `Project=MediBridge`, `Environment=dev`, `ManagedBy=Terraform`, `Owner=Olga`. Put it in `locals.tf` so every module inherits it.
6. **Run `terraform init` + `validate`** on the empty skeleton to confirm the toolchain works before adding resources.

**Exit check:** `terraform validate` passes; naming/tagging locals defined; Bedrock access documented.

---

### Phase 1 — Network, encryption, storage, auth (Milestone 1: Infra & Core Platform, Week 1)

Goal for the team by end of week 1: *users can authenticate and securely upload documents.* That means the backend needs a network to run in, a database, a bucket, secrets, and Cognito.

Build in this order (each is a module you write, `plan`, then `apply`):

1. **`network`** — VPC with three subnet tiers (public, private-app, private-data) across 2 AZs, IGW, one NAT gateway, route tables. Base security groups: ALB SG (443 from internet), ECS SG (app port from ALB SG only), RDS SG (5432 from ECS SG only).
   - *NAT cost note:* one NAT gateway is the simplest; if cost matters, document the alternative (VPC endpoints for S3/ECR/etc. instead of NAT) but don't block the team on it.
2. **`kms`** — customer-managed key(s) with alias(es). One key is fine for dev; separate keys per data class is cleaner. Grant key usage to the services that need it via key policy.
3. **`s3`** — document bucket: SSE-KMS with the CMK, block all public access, versioning on, a lifecycle rule for cost. No public policy — access is via presigned URLs the backend generates.
4. **`secrets`** — Secrets Manager entries for DB master credentials (generate the password in Terraform, store it here) and an app-secrets placeholder. KMS-encrypted.
5. **`rds`** — PostgreSQL, small instance class, in private-data subnets, `publicly_accessible = false`, storage encrypted with the CMK, `rds.force_ssl` enforced, credentials sourced from Secrets Manager. DB subnet group + the RDS SG from step 1.
6. **`cognito`** — user pool + app client. Create groups that map to the app roles (e.g. clinic-admin, staff). MFA optional in dev — note it as a security enhancement. Configure token settings the backend expects.
7. **`ecr`** — repositories for `backend` and `workers` images so Bella and Ayesha can start pushing.
8. **Publish outputs.** Add to `outputs.tf`: VPC/subnet IDs, security group IDs, S3 bucket name, KMS key ARN, RDS endpoint, Cognito user pool ID + client ID, ECR repo URLs, secret ARNs. Fill in the matching keys in the repo's `.env.example` mapping so backend/DB teams can wire their `.env`.

**Milestone 1 deliverable (infra side):** VPC + RDS + S3 + KMS + Secrets + Cognito + ECR provisioned; outputs handed to backend and database teams; documented in `infrastructure/README.md`.

**Exit check:** backend team can connect to RDS from an ECS task and read the DB secret; a test object can be written to S3 with SSE-KMS; Cognito issues a token.

---

### Phase 2 — Compute, ingress, async pipeline (Milestone 2: AI Processing & Exchange, Week 2)

Goal for the team: *documents are processed, classified, routed, and delivered.* That needs the backend actually running behind HTTPS, plus the SQS→Lambda pipeline with Textract/Bedrock permissions.

1. **`alb`** — public Application Load Balancer in public subnets, ACM certificate (DNS-validated; Route 53 optional per blueprint), HTTPS listener on 443, target group pointing at the ECS service. If no custom domain yet, use the ALB DNS name + a cert workaround, or stand up a Route 53 subdomain.
2. **`ecs`** — ECS cluster + Fargate service running the FastAPI backend task in private-app subnets. Task definition pulls from ECR, injects config/secrets via env + Secrets Manager, uses the ECS **task role** (least privilege: read specific secrets, R/W its S3 prefix + generate presigned URLs, send/receive on its queues, connect to RDS). Desired count = 1 for dev. Wire to the ALB target group.
3. **`sqs`** — document processing queue + a dead-letter queue for poison messages. KMS-encrypted. This is the handoff point between backend (enqueue) and workers (consume).
4. **`lambda`** — OCR/classification handler function(s), triggered by an SQS event source mapping. Execution role permissions: consume SQS, read the S3 document, call Textract, call Bedrock (the models enabled in Phase 0), and update status (via DB in private subnets or via the backend API — confirm with Ayesha/Bella which path). If the Lambda touches RDS directly, give it VPC access to the private-app subnets.
5. **`observability`** — CloudWatch log groups for ECS, Lambda, and the ALB, KMS-encrypted where feasible; a couple of basic alarms (Lambda errors, DLQ depth, ECS unhealthy tasks).
6. **Update outputs + docs:** ALB URL (the app entry point the frontend uses), queue URLs/ARNs, Lambda names. Hand the ALB URL to Vida (frontend) and the queue URLs to Ayesha (workers).

**Milestone 2 deliverable (infra side):** backend reachable over HTTPS through the ALB; end-to-end async path (enqueue → Lambda → Textract → Bedrock → status update) is wired and permissioned.

**Exit check:** a document uploaded through the backend lands in S3, a message hits SQS, the Lambda fires, Textract + Bedrock calls succeed under the execution role, and status updates flow.

---

### Phase 3 — Security hardening, audit, and demo readiness (Milestone 3, Week 3)

Goal: *a secure, demo-ready MVP.* This is where the security half of your role gets its own focused pass.

1. **IAM least-privilege review.** Re-read every role/policy. Remove any wildcard actions or resources. Confirm no long-lived static keys are used where a role works. Document any temporary exception per the blueprint's trust-boundary rules.
2. **Encryption audit.** Confirm: S3 = SSE-KMS with CMK; RDS = encrypted + `force_ssl`; Secrets = KMS; CloudWatch logs = KMS where feasible; presigned URLs expire in 15 minutes (this is a backend setting — verify with Bella). No PHI in plaintext anywhere.
3. **Network audit.** Confirm RDS is not publicly accessible, security groups are tight (no `0.0.0.0/0` except ALB:443), and private workloads only egress as required.
4. **Audit logging infra.** Ensure CloudWatch retention is set (long enough for testing/demo, cost-conscious). Optionally enable CloudTrail for the account to capture API-level actions — note that application-level audit logs live in RDS (Raissa/Bella own that table); your part is the platform logging.
5. **Cognito hardening.** Turn on MFA if in scope; review password policy and token expiry.
6. **Tag + cost sweep.** Every resource tagged; check for anything oversized left running.
7. **Teardown/rebuild test.** Run `terraform destroy` then `apply` in a scratch pass (or read the plan carefully) to prove the environment is reproducible for demo day. Confirm no orphaned resources.
8. **Write the runbook.** In `infrastructure/README.md`: how to `init`/`plan`/`apply`, where outputs come from, how other teams consume them, how to tear down, and the known manual steps (Bedrock access, ACM validation).

**Milestone 3 deliverable (infra side):** hardened, audited, reproducible `dev` environment with a runbook; security checklist complete.

---

## Security checklist (map to blueprint "Security Specifications")

- [ ] All data at rest encrypted with KMS (S3, RDS, Secrets, logs)
- [ ] All transit encrypted with TLS 1.2+ (ALB HTTPS listener, RDS `force_ssl`)
- [ ] Least-privilege IAM roles/policies; no wildcards without documented exception
- [ ] RDS in private subnets, not publicly accessible
- [ ] Security groups restrict to authorized services only (ALB:443, ECS:app-port, RDS:5432)
- [ ] Secrets/DB creds in Secrets Manager, never in code or `.env` committed
- [ ] Cognito auth; MFA available/enabled
- [ ] Presigned S3 URLs expire ≤ 15 min (verify backend setting)
- [ ] Immutable audit logging path exists (app logs in RDS + platform logs in CloudWatch)
- [ ] Org-level / RBAC authorization enforced (app layer — confirm coverage)

---

## Migration path: local → remote state (do this before a second person runs Terraform)

1. Add a small bootstrap (separate Terraform config or manual): an S3 bucket for state (versioned, SSE-KMS, block public access) and a DynamoDB table for locks.
2. Add a `backend "s3"` block to `versions.tf` pointing at that bucket + lock table.
3. Run `terraform init -migrate-state` to copy local state up.
4. From then on the whole team can `plan`/`apply` safely with locking.

Until then: **one person runs `apply`, and `terraform.tfstate` is never committed** (already in `.gitignore`).

---

## Dependencies on / from other roles

- **To backend (Bella):** RDS endpoint, S3 bucket, Cognito IDs, secret ARNs, ALB URL, task role expectations.
- **To database (Raissa):** RDS endpoint + credentials via Secrets Manager; she owns schema/migrations, you own the instance.
- **To workers/AI (Ayesha):** SQS queue URLs, Lambda scaffolding + execution-role permissions, Textract/Bedrock access, ECR repo for worker images.
- **To frontend (Vida):** the public ALB/HTTPS URL and Cognito app client config.
- **From the team:** confirmation of the app port, whether Lambda updates status via DB or via backend API, and which Bedrock model IDs to enable.
