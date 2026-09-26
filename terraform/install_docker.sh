#!/bin/bash
apt-get update -y
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

apt-get install -y unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 236287214134.dkr.ecr.eu-west-3.amazonaws.com

docker pull 236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react:latest
docker run -d -p 80:80 --restart unless-stopped --name mon-app-container 236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react:latest