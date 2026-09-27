#!/bin/bash
REPOSITORY_URI=236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react

/usr/local/bin/aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 236287214134.dkr.ecr.eu-west-3.amazonaws.com
docker pull $REPOSITORY_URI:latest

NEW_IMAGE_ID=$(docker images -q $REPOSITORY_URI:latest)
RUNNING_IMAGE_ID=$(docker inspect --format='{{.Image}}' mon-app-container 2>/dev/null | cut -c 8-19)

if [ "$NEW_IMAGE_ID" == "$RUNNING_IMAGE_ID" ]; then
    echo "Image identique, aucun redémarrage nécessaire."
else
    echo "Nouvelle image détectée, redémarrage du conteneur."
    docker stop mon-app-container 2>/dev/null
    docker rm -f mon-app-container 2>/dev/null
    docker run -d -p 80:80 --restart unless-stopped --name mon-app-container $REPOSITORY_URI:latest
fi