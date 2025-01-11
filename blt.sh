#!/bin/bash

if [[ $* == *--rm* ]]; then
    echo hi
    sudo docker rm $(sudo docker ps -a -q)
fi

if [[ $* == *--rmi* ]]; then
    echo hiii
    sudo docker rmi $(sudo docker images -q)
fi

if [[ $* == *--build* ]]; then
    sudo docker build . -t piconaut/blinkies.cafe
fi

if [[ $* == *--test* ]]; then
    sudo docker kill $(sudo docker ps -q)
    sudo docker run -e NODE_ENV=development -p 8080:8080 -d piconaut/blinkies.cafe:latest
fi

if [[ $* == *--pull* ]]; then
  sudo docker pull piconaut/blinkies.cafe
fi

# mount certs:
# -v /host/path/to/certs:container/path/to/certs:ro
# mount logs:
# -v /host/path/to/logs:/app/logs
if [[ $* == *--run* ]]; then
    sudo docker kill $(sudo docker ps -q)
    sudo docker run -e NODE_ENV=production -p 443:8080 -p 80:3000 -d --restart always piconaut/blinkies.cafe:latest
fi

if [[ $* == *--push* ]]; then
  sudo docker push piconaut/blinkies.cafe:latest
fi

if [[ $* == *--prod* ]]; then
  ssh blinkies.cafe ./blt.sh --pull --run
fi

sudo echo ''
