output "eks_cluster_name" {
  value = aws_eks_cluster.terra_link.name
}

output "rds_endpoint" {
  value = aws_rds_cluster.postgres.endpoint
}
