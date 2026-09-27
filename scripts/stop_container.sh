#!/bin/bash
if [ "$(docker ps -aq -f name=mon-app-container)" ]; then
    docker stop mon-app-container
    docker rm -f mon-app-container
fi
exit 0