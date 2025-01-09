FROM node:17.4.0-alpine3.15 AS build_image

RUN apk add --no-cache ca-certificates git imagemagick

ENV NODE_ENV=production

# app working directory
WORKDIR /app

# install app dependencies
# wildcard to include package.json and package-lock.json
COPY package*.json ./

RUN npm install --production

# if prod
# RUN npm ci --only=production

# bundle app source
COPY . .

# convert gif to png
RUN rm -f public/blinkies-public/blinkiesCafe-*gif && \
    rm -f assets/blinkies-frames/*png && \
    rm -rf logs/ && \
    if ls public/blinkies-public/display/*.gif 1> /dev/null 2>&1; then \
        for file in public/blinkies-public/display/*.gif; do \
            convert $file[0] ${file%.gif}.png; \
        done; \
    fi

EXPOSE 8080

FROM node:17.4.0-alpine3.15
RUN apk add --update imagemagick=7.1.0.16-r0

WORKDIR /app

# copy from build image
COPY --from=build_image /app .
#COPY --from=build_image /app/node_modules ./app/node_modules

COPY ./assets/.fonts /usr/share/fonts

CMD ["npm","test"]
