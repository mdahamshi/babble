FROM node:current-alpine
LABEL maintainer="mohammad.dahamshi@gmail.com"

# Install dependencies
COPY package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

# Copy source code
WORKDIR /opt/app
COPY . /opt/app

# Create a volume mount point for data
VOLUME ["/opt/app/data"]

# Default start command
CMD ["npm", "start"]
