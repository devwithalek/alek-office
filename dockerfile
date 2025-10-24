FROM node:alpine
WORKDIR /app
COPY package.json /app
RUN npm install
RUN npm install pm2 -g
COPY . /app
CMD ["pm2-runtime", "index.js"]
