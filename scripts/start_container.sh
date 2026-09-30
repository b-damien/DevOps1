#!/bin/bash
REPOSITORY_URI=236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react

/usr/local/bin/aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 236287214134.dkr.ecr.eu-west-3.amazonaws.com

RUNNING_IMAGE_ID=$(docker inspect --format='{{.Image}}' mon-app-container 2>/dev/null)

docker pull $REPOSITORY_URI:latest
NEW_IMAGE_ID=$(docker inspect --format='{{.Id}}' $REPOSITORY_URI:latest)

if [ "$NEW_IMAGE_ID" == "$RUNNING_IMAGE_ID" ]; then
    echo "Image identique, aucun redémarrage nécessaire."
else
    echo "Nouvelle image détectée, redémarrage du conteneur."
    docker stop mon-app-container 2>/dev/null
    docker rm -f mon-app-container 2>/dev/null
    docker run -d \
      --name mon-app-container \
      --network web \
      --restart unless-stopped \
      --label "traefik.enable=true" \
      --label "traefik.http.routers.monapp.rule=Host(\`mon-app-react.ainz05.com\`)" \
      --label "traefik.http.routers.monapp.entrypoints=websecure" \
      --label "traefik.http.routers.monapp.tls.certresolver=myresolver" \
      --label "traefik.http.services.monapp.loadbalancer.server.port=80" \
      $REPOSITORY_URI:latest
fi