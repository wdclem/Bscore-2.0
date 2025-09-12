FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install instead of npm ci)
RUN npm install

# Copy all files
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]