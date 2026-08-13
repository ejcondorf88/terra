terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.5.0"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "terra-link-vpc"
  }
}

resource "aws_eks_cluster" "terra_link" {
  name     = "terra-link-cluster"
  role_arn = var.eks_role_arn

  vpc_config {
    subnet_ids = var.subnet_ids
  }
}

resource "aws_rds_cluster" "postgres" {
  engine         = "aurora-postgresql"
  cluster_identifier = "terra-link-db"
  master_username = var.db_username
  master_password = var.db_password
  skip_final_snapshot = true
}
