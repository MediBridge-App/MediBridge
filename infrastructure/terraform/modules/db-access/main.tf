# Module: db-access
# ---------------------------------------------------------------------------
# A tiny EC2 "jump host" that lets authorised people reach the private RDS
# instance from their laptops via SSM Session Manager port forwarding.
#
# No SSH, no open ports, no key pairs. The instance sits in a private subnet
# with no public IP. Access is entirely through AWS SSM: whoever has AWS
# credentials + permission runs one command and gets a local tunnel to the DB.
# Every session is recorded in CloudTrail — which is the audit story a bastion
# with an open port 22 can't tell.
#
# Flow:  laptop  --SSM (encrypted, AWS-managed)-->  jump host  --5432-->  RDS
#
# Cost: one t3.micro (~$7.50/mo). Stop the instance when nobody needs the DB
# (`aws ec2 stop-instances`) and start it when they do — SSM reconnects.
# ---------------------------------------------------------------------------

# Latest Amazon Linux 2023 AMI. AL2023 ships the SSM agent pre-installed, so
# the instance registers with Session Manager on boot with no user data.
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

# ---------------------------------------------------------------------------
# IAM — lets the instance talk to SSM. This is what replaces SSH keys.
# ---------------------------------------------------------------------------
data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "jump" {
  name               = "${var.name_prefix}-db-jump"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

# AWS-managed policy: exactly the permissions the SSM agent needs, nothing more.
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.jump.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "jump" {
  name = "${var.name_prefix}-db-jump"
  role = aws_iam_role.jump.name
}

# ---------------------------------------------------------------------------
# Security group — outbound only. No inbound rules at all; SSM traffic is
# outbound from the agent, so the instance never needs an open inbound port.
# ---------------------------------------------------------------------------
resource "aws_security_group" "jump" {
  name        = "${var.name_prefix}-db-jump-sg"
  description = "SSM jump host to RDS. Outbound only."
  vpc_id      = var.vpc_id

  egress {
    description = "All outbound (SSM endpoints via NAT, and 5432 to RDS)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-db-jump-sg"
  }
}

# Open a path to the database: allow 5432 from the jump host into the RDS
# security group. This is added HERE rather than in the rds module so Raissa's
# module stays untouched and the DB-access concern lives in one place.
resource "aws_vpc_security_group_ingress_rule" "rds_from_jump" {
  security_group_id            = var.rds_security_group_id
  referenced_security_group_id = aws_security_group.jump.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "PostgreSQL from the SSM db-access jump host"
}

# ---------------------------------------------------------------------------
# The jump host itself
# ---------------------------------------------------------------------------
resource "aws_instance" "jump" {
  ami                    = data.aws_ssm_parameter.al2023.value
  instance_type          = "t3.micro"
  subnet_id              = var.subnet_id
  iam_instance_profile   = aws_iam_instance_profile.jump.name
  vpc_security_group_ids = [aws_security_group.jump.id]

  # Private subnet, no public IP. Reachable only through SSM.
  associate_public_ip_address = false

  # Require IMDSv2 — closes the metadata-service attack vector that leaks the
  # instance's IAM credentials.
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  tags = {
    Name = "${var.name_prefix}-db-jump"
  }

  # The AMI comes from an SSM "latest" parameter, so it changes whenever AWS
  # publishes a new Amazon Linux image — which would otherwise destroy and
  # recreate the jump host (and break active DB tunnels) on an unrelated apply.
  # Ignore AMI drift; recreate deliberately when we actually want to patch it.
  lifecycle {
    ignore_changes = [ami]
  }
}
