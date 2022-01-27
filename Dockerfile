FROM node:17-alpine3.15 AS BUILD_IMAGE

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

EXPOSE 8080

FROM node:17-alpine3.15
RUN apk add --update imagemagick=7.1.0.16-r0

WORKDIR /app

# copy from build image
COPY --from=BUILD_IMAGE /app .
#COPY --from=BUILD_IMAGE /app/node_modules ./app/node_modules

COPY ./.fonts /usr/share/fonts

CMD ["npm","start"]
