FROM node:12.16.1-alpine
COPY . .
RUN npm install
VOLUME [ "/data" ]
EXPOSE 5353
