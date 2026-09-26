output "instance_public_ip" {
  description = "Adresse IP publique fixe de l'instance"
  value       = aws_eip.web_eip.public_ip
}

output "ecr_repository_url" {
  description = "URL du repository ECR"
  value       = aws_ecr_repository.app_repo.repository_url
}