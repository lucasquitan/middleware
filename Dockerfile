FROM node:18-alpine

# Instala dependências necessárias para compilar módulos nativos (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Env files will be passed as environment variables on Render, otherwise should uncomment the line below
# COPY .env ./

# Cria diretório para o banco de dados
RUN mkdir -p /app/database

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
