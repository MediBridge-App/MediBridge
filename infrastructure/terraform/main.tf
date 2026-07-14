# MediBridge — root module wiring.
#
# Modules are called in dependency order. They are COMMENTED OUT so the
# scaffold `terraform init` + `validate` cleanly before any resources exist.
# Uncomment and fill each module as you build it (see the phase plan in
# docs/infrastructure-implementation-plan.md).
#
# Build order:
#   Phase 1: network -> kms -> s3 -> secrets -> rds -> cognito -> ecr
#   Phase 2: alb -> ecs -> sqs -> lambda -> observability
#   Phase 3: iam review + hardening
#
# Common inputs every module should accept: name_prefix, tags (optional, since
# default_tags already applies common_tags).

# ---------------------------------------------------------------------------
# Phase 1 — network, encryption, storage, auth
# ---------------------------------------------------------------------------

# module "network" {
#   source      = "./modules/network"
#   name_prefix = local.name_prefix
#   vpc_cidr    = var.vpc_cidr
#   az_count    = var.az_count
# }

# module "kms" {
#   source      = "./modules/kms"
#   name_prefix = local.name_prefix
# }

# module "s3" {
#   source      = "./modules/s3"
#   name_prefix = local.name_prefix
#   kms_key_arn = module.kms.key_arn
# }

# module "secrets" {
#   source      = "./modules/secrets"
#   name_prefix = local.name_prefix
#   kms_key_arn = module.kms.key_arn
# }

# module "rds" {
#   source             = "./modules/rds"
#   name_prefix        = local.name_prefix
#   kms_key_arn        = module.kms.key_arn
#   vpc_id             = module.network.vpc_id
#   data_subnet_ids    = module.network.private_data_subnet_ids
#   db_secret_arn      = module.secrets.db_credentials_arn
#   allowed_source_sg  = module.network.ecs_security_group_id
# }

# module "cognito" {
#   source      = "./modules/cognito"
#   name_prefix = local.name_prefix
# }

# module "ecr" {
#   source      = "./modules/ecr"
#   name_prefix = local.name_prefix
#   repositories = ["backend", "workers"]
# }

# ---------------------------------------------------------------------------
# Phase 2 — compute, ingress, async pipeline
# ---------------------------------------------------------------------------

# module "alb" {
#   source            = "./modules/alb"
#   name_prefix       = local.name_prefix
#   vpc_id            = module.network.vpc_id
#   public_subnet_ids = module.network.public_subnet_ids
# }

# module "ecs" {
#   source            = "./modules/ecs"
#   name_prefix       = local.name_prefix
#   vpc_id            = module.network.vpc_id
#   app_subnet_ids    = module.network.private_app_subnet_ids
#   ecr_backend_url   = module.ecr.repository_urls["backend"]
#   target_group_arn  = module.alb.target_group_arn
#   security_group_id = module.network.ecs_security_group_id
# }

# module "sqs" {
#   source      = "./modules/sqs"
#   name_prefix = local.name_prefix
#   kms_key_arn = module.kms.key_arn
# }

# module "lambda" {
#   source           = "./modules/lambda"
#   name_prefix      = local.name_prefix
#   source_queue_arn = module.sqs.processing_queue_arn
#   document_bucket  = module.s3.bucket_name
#   app_subnet_ids   = module.network.private_app_subnet_ids
# }

# module "observability" {
#   source      = "./modules/observability"
#   name_prefix = local.name_prefix
#   kms_key_arn = module.kms.key_arn
# }
