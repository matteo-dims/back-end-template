# Use an official MongoDB image as the base image
# FROM mongo:latest
# Base image
FROM node:21-alpine3.17

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
# RUN npm run start:prod
