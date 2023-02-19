# Builder Image for the services
# NodeJs w. Typescript
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json @ root and in workspaces
COPY package*.json ./
COPY api/package*.json ./api/
COPY ws/package*.json ./ws/
COPY scraper/package*.json ./scraper/

# Install dependencies
RUN npm install

# Copy services source code
COPY . .

# Generate prisma client
RUN npx prisma generate 
