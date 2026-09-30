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

# Création du réseau Docker partagé
docker network create web

# Dossier pour les certificats Let's Encrypt
mkdir -p /home/ubuntu/traefik/letsencrypt
touch /home/ubuntu/traefik/letsencrypt/acme.json
chmod 600 /home/ubuntu/traefik/letsencrypt/acme.json

# Lancement de Traefik
docker run -d \
  --name traefik \
  --network web \
  --restart unless-stopped \
  -p 80:80 \
  -p 443:443 \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /home/ubuntu/traefik/letsencrypt:/letsencrypt \
  traefik:v3.6 \
  --providers.docker=true \
  --providers.docker.exposedbydefault=false \
  --entrypoints.web.address=:80 \
  --entrypoints.websecure.address=:443 \
  --certificatesresolvers.myresolver.acme.tlschallenge=true \
  --certificatesresolvers.myresolver.acme.email=gypenflorian01@gmail.com \
  --certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json

# Authentification à ECR et premier lancement du conteneur
/usr/local/bin/aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 236287214134.dkr.ecr.eu-west-3.amazonaws.com
docker pull 236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react:latest
docker run -d \
  --name mon-app-container \
  --network web \
  --restart unless-stopped \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.monapp.rule=Host(\`mon-app-react.ainz05.com\`)" \
  --label "traefik.http.routers.monapp.entrypoints=websecure" \
  --label "traefik.http.routers.monapp.tls.certresolver=myresolver" \
  --label "traefik.http.services.monapp.loadbalancer.server.port=80" \
  236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react:latest