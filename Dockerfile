FROM node:lts-alpine
RUN addgroup -g 1001 -S nonroot && \
    adduser -u 1001 -S nonroot -G nonroot
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY front ./front
COPY back ./back
EXPOSE 8000
USER nonroot
CMD [ "npm", "start" ]