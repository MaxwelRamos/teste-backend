FROM node:alpine3.12
 
WORKDIR /usr/src
 
COPY package*.json ./

RUN npm install
 
RUN npm ci --only=production
 
COPY . .
 
EXPOSE 3000
 
CMD [ "npm", "start" ]
