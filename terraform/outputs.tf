output "instance_public_ip" {
  description = "Adresse IP publique de l'instance"
  value       = aws_instance.web.public_ip
}