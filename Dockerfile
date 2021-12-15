#FROM node:16 AS BUILD_IMAGE
FROM node

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

#FROM node:10-alpine
#RUN apk add --update imagemagick

#WORKDIR /app

# copy from build image
#COPY --from=BUILD_IMAGE /app .
#COPY --from=BUILD_IMAGE /app/node_modules ./app/node_modules

COPY ./.fonts /usr/share/fonts

CMD ["node","server.js"]
