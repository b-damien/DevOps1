#!/bin/bash
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 236287214134.dkr.ecr.eu-west-3.amazonaws.com
docker pull 236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react:latest
docker run -d -p 80:80 --restart unless-stopped --name mon-app-container 236287214134.dkr.ecr.eu-west-3.amazonaws.com/mon-app-react:latest