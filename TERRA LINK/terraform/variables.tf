variable "aws_region" {
  description = "AWS region for infrastructure deployment"
  type        = string
  default     = "us-east-1"
}

variable "eks_role_arn" {
  description = "ARN of the IAM role for EKS control plane"
  type        = string
}

variable "subnet_ids" {
  description = "List of private subnet IDs for EKS"
  type        = list(string)
}

variable "db_username" {
  description = "PostgreSQL master username"
  type        = string
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}
