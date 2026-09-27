#!/bin/bash
apt-get update -y

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Installation de la CLI AWS
apt-get install -y unzip
cd /home/ubuntu
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -o awscliv2.zip -d awscli-install
/home/ubuntu/awscli-install/aws/install

# Installation de l'agent CodeDeploy
apt-get install -y ruby-full wget
cd /home/ubuntu
wget https://aws-codedeploy-eu-west-3.s3.eu-west-3.amazonaws.com/latest/install
chmod +x ./install
./install auto
systemctl start codedeploy-agent
systemctl enable codedeploy-agent

# Authentification à ECR et premier lancement du conteneur
/usr/local/bin/aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 236287214134.dkr.ecr.eu-west-3.amazonaws.com
docker pull 236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react:latest
docker run -d -p 80:80 --restart unless-stopped --name mon-app-container 236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react:latest