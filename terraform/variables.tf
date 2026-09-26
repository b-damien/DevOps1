variable "instance_type" {
    description = "Type d'instance EC2"
    type = string
    default = "t2.micro"
}

variable "key_name" {
    description = "Nom de la paire de clés SSH AWS"
    type = string
    default = "devops-key"
}