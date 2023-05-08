FROM node:12.15.0-stretch-slim

COPY ./bundle/ /app/
RUN ls -la /app/*

WORKDIR /app
CMD ["node", "server-main.js"]