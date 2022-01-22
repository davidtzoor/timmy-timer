FROM node:latest
# Create app directory
WORKDIR /timmy-timer

# Install app dependencies
# Copy package.json AND package-lock.json
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

CMD [ "npm", "run", "start"]