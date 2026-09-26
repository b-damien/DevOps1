#!/bin/bash
docker stop mon-app-container || true
docker rm mon-app-container || true