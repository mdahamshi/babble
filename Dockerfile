FROM node:current-alpine
LABEL maintainer="mohammad.dahamshi@gmail.com"
EXPOSE 3000
COPY . /
CMD ["npm", "start"]