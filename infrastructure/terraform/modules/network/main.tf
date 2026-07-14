# Module: network
# VPC + subnets (public / private-app / private-data), IGW, NAT, routes, base SGs.
#
# TODO (network):
#   - VPC with DNS support/hostnames on
#   - Across var.az_count AZs: public, private-app, private-data subnets
#   - Internet Gateway; one NAT Gateway (or document a NAT-free VPC-endpoint alt)
#   - Route tables: public -> IGW, private -> NAT
#   - SGs: alb(443 from 0.0.0.0/0), ecs(app-port from alb SG), rds(5432 from ecs SG)
#
# Inherits common tags via the provider default_tags block in the root config.
