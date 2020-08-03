FROM node:12

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build



CMD ["node","build/index.js"]