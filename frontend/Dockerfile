FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Copy theme-system from root context
COPY frontend/theme-system ./

# Install dependencies (this will now find the theme-system)
RUN npm install

# Copy all frontend files
COPY frontend/ ./

EXPOSE 3000
CMD ["npm", "run", "dev"]