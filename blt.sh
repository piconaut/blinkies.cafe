#!/bin/bash

if [[ $* == *--rm* ]]; then
    echo hi
    sudo docker rm $(sudo docker ps -a -q)
fi

if [[ $* == *--rmi* ]]; then
    echo hiii
    sudo docker rmi $(sudo docker images -q)
fi

if [[ $* == *-b* ]]; then
    rm public/blinkies-public/blinkiesCafe-*gif
    rm assets/blinkies-frames/*png
    rm -rf logs/
    for file in public/blinkies-public/display/*.gif
    do
        convert $file[0] ${file%.gif}.png
    done
    sudo docker build . -t piconaut/blinkies.cafe
fi

if [[ $* == *--test* ]]; then
    sudo docker kill $(sudo docker ps -q)
    sudo docker run -p 8080:8080 -d piconaut/blinkies.cafe:latest
fi

# mount certs:
# -v /host/path/to/certs:container/path/to/certs:ro
# mount logs:
# -v /host/path/to/logs:/app/logs
if [[ $* == *--run* ]]; then
    sudo docker kill $(sudo docker ps -q)
    sudo docker run -p 443:8080 -p 80:3000 -d --restart always piconaut/blinkies.cafe:latest
fi

if [[ $* == *--pull* ]]; then
  sudo docker pull piconaut/blinkies.cafe
fi

if [[ $* == *--push* ]]; then
  sudo docker push piconaut/blinkies.cafe:latest
fi

if [[ $* == *--prod* ]]; then
  ssh blinkies.cafe ./blt.sh --pull --run
fi


sudo echo ''
