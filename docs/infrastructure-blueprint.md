# MediBridge Infrastructure Blueprint

This document defines the baseline AWS infrastructure design for the MediBridge development environment. It is intended to guide Terraform implementation and provide clear integration assumptions for frontend, backend, worker, and database workstreams.

## AWS Account and Region

- Environment: `dev`
- AWS account: dedicated course or team-owned AWS account for MediBridge only
- Primary region: `us-east-1`
- Reasoning:
  - broad service availability for Amazon Bedrock, Textract, Cognito, ECS, and RDS
  - straightforward access to ACM, ALB, CloudWatch, and S3 integrations
  - good default region for demos and student project support

## Service Map

The initial MediBridge AWS architecture for `dev` uses the following managed services:

- Amazon Route 53: optional DNS for a friendly application subdomain
- AWS Certificate Manager: TLS certificate for HTTPS access
- Amazon VPC: isolated network for application and data services
- Application Load Balancer: public HTTPS entry point for the web API
- Amazon ECS Fargate: hosts the FastAPI backend container
- Amazon ECR: stores backend and worker container images
- Amazon Cognito: user authentication and token issuance
- Amazon S3: encrypted document storage
- Amazon RDS PostgreSQL: encrypted relational metadata store
- AWS Secrets Manager: database credentials and application secrets
- AWS KMS: customer-managed encryption keys
- Amazon SQS: async document processing queue
- AWS Lambda: OCR and classification pipeline handlers
- Amazon Textract: OCR extraction from uploaded PDFs
- Amazon Bedrock: AI-powered document classification and recommendations
- Amazon CloudWatch: application logs, metrics, and alarms
- AWS IAM: service roles and least-privilege access control

## Network Boundaries

The development environment is deployed into one VPC with separation between internet-facing and internal services.

- Public subnets:
  - Application Load Balancer
  - NAT Gateway, if used
- Private application subnets:
  - ECS Fargate backend tasks
  - Lambda functions that require VPC access
- Private data subnets:
  - Amazon RDS PostgreSQL

Network rules:

- Only the ALB accepts inbound traffic from the public internet on `443`
- ECS tasks do not receive direct public traffic
- RDS is not publicly accessible
- Security groups allow backend-to-database access only on PostgreSQL port `5432`
- Security groups allow ALB-to-ECS access only on the application port
- Private workloads use outbound access only as required for AWS APIs, image pulls, patching, and service integrations

## Public vs Private Subnet Placement

Public subnet components:

- Application Load Balancer
- NAT Gateway, if the dev environment uses private subnet egress through NAT

Private subnet components:

- FastAPI backend on ECS Fargate
- Lambda functions that need database or internal service access
- RDS PostgreSQL

Not subnet-bound or managed outside the VPC:

- Amazon S3
- Amazon Cognito
- AWS KMS
- AWS Secrets Manager
- Amazon SQS
- Amazon Textract
- Amazon Bedrock
- Amazon CloudWatch

## Encryption Model

MediBridge follows encryption in transit and encryption at rest by default.

- In transit:
  - all client-to-application traffic uses HTTPS with TLS 1.2 or higher, targeting TLS 1.3 where supported
  - backend-to-RDS connections require SSL/TLS
  - AWS service-to-service communication uses AWS-managed TLS endpoints
- At rest:
  - S3 document bucket uses SSE-KMS with a customer-managed KMS key
  - RDS PostgreSQL uses AWS KMS encryption at rest
  - Secrets Manager secrets use AWS KMS encryption
  - CloudWatch log groups use KMS encryption if feasible in `dev`
- Access pattern:
  - document downloads use short-lived presigned S3 URLs
  - no PHI is stored in plaintext outside approved encrypted services

## IAM Trust Boundaries

IAM access is separated by workload and follows least privilege.

- Human access:
  - team members use named IAM identities or AWS IAM Identity Center access
  - infrastructure changes are limited to approved maintainers
- ECS task role:
  - read specific secrets from Secrets Manager
  - read and write required document metadata or queues
  - generate presigned S3 URLs and access only approved buckets and prefixes
- Lambda execution roles:
  - consume from SQS
  - read documents from S3
  - call Textract and Bedrock
  - update document status in the database or through the backend API, depending on implementation
- CI/CD or deployment role:
  - push images to ECR
  - update ECS services
  - run Terraform plan and apply for approved environments

Trust boundary rules:

- no shared admin credentials in code or local config
- no wildcard IAM permissions unless a temporary exception is documented
- application services do not use long-lived static AWS keys when task roles can be used instead

## Development Environment Assumptions

The `dev` environment is optimized for team velocity, cost control, and simple demos.

- Single AWS region: `us-east-1`
- Single environment first: `dev`, with naming conventions that can later support `staging` and `prod`
- Lower-cost sizing is acceptable:
  - small RDS instance class
  - minimal ECS desired count
  - one NAT Gateway or a documented cost-saving alternative if necessary
- Sample or synthetic documents only; no real PHI
- Manual deployment is acceptable at the start, but all infrastructure must be defined as code
- Backend, worker, and frontend teams receive environment values through documented outputs, not ad hoc messages
- Logs and audit events should be retained long enough for testing and demos, but with cost-conscious defaults

## Initial Non-Goals

The first infrastructure iteration does not need to include:

- multi-region failover
- production disaster recovery
- cross-account environment promotion
- full SIEM integration
- advanced zero-trust network controls beyond standard VPC and security group isolation

These can be added later if the project scope expands.
