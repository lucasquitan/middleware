# Middleware API

A high-performance HTTP proxy/middleware service built with Fastify, TypeScript, and SQLite. This service provides some capabilities to support external tools.

## Features

- 🚀 **Universal Proxy Endpoint**: Forward HTTP requests to any URL with custom methods, headers, and body
- 🇧🇷 **CPF Information**: Query Brazilian government transparency API (Portal da Transparência) for CPF data
- 🎫 **Ticket Management**: Retrieve ticket information by CPF with database integration
- 📊 **SQLite Database**: Lightweight database for ticket storage and retrieval
- 📝 **Comprehensive Logging**: Winston-based logging with configurable levels
- 🐳 **Docker Support**: Containerized deployment with Docker and Docker Compose
- 📚 **OpenAPI Documentation**: Complete Swagger/OpenAPI 3.0 specification
- 🔒 **Type Safety**: Full TypeScript implementation with strict typing

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 5.x
- **Language**: TypeScript 5.x
- **Database**: SQLite (better-sqlite3)
- **Logging**: Winston
- **Build Tool**: tsup
- **Development**: tsx

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lucasquitan/middleware.git
cd middleware
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env-example`:
```bash
cp .env-example .env
```

4. Configure your environment variables in `.env`:
```env
TOKEN="your token here"
PORT=3331
NODE_ENV="local"
LOGGER_LEVEL="debug"
```

## Development

Run the development server with hot-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3331` (or the port specified in your `.env` file).

## Building

Build the project for production:
```bash
npm run build
```

The compiled JavaScript will be output to the `dist/` directory.

## Production

Start the production server:
```bash
npm start
```

## API Endpoints

### POST `/api`
Universal proxy/middleware endpoint that forwards HTTP requests to any URL.

**Request Body:**
```json
{
  "url": "https://api.example.com/endpoint",
  "method": "GET",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer token"
  },
  "body": "{\"key\": \"value\"}"
}
```

**Query Parameters (optional):**
Any query parameters passed to this endpoint will be forwarded to the target URL.

**Response:**
```json
{
  "success": true,
  "original_status": 200,
  "response": { /* response data */ }
}
```

### GET `/api/cpf-info`
Retrieves CPF information from the Brazilian government transparency API.

**Query Parameters:**
- `cpf` (required): 11-digit CPF number without formatting

**Example:**
```
GET /api/cpf-info?cpf=00000000000
```

**Response:**
```json
{
  "success": true,
  "original_status": 200,
  "response": {
    "CPF": "00000000000",
    "NOME": "JOAO",
    "SITUACAO": "ATIVO",
    "ORGAO": "MINISTERIO DA FAZENDA",
    "SIGLA": "MF",
    "CODIGO": "36000"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET `/api/una`
Retrieves ticket information for a given CPF. The result is based on MOCK information.

**Query Parameters:**
- `cpf` (required): 11-digit CPF number without formatting

**Example:**
```
GET /api/una?cpf=00000000000
```

### GET `/api/ticket-info-db`
Queries ticket details from the local database by protocol ID and CPF.

**Query Parameters:**
- `id` (required): Ticket protocol ID (13 digits)
- `cpf` (required): 11-digit CPF number without formatting

**Example:**
```
GET /api/ticket-info-db?id=0000000000000&cpf=00000000000
```

**Response:**
```json
{
  "success": true,
  "original_status": 200,
  "response": {
    "nome": "JOAO SILVA",
    "descricao": "Ticket description",
    "fila": "SEGES_Voz",
    "protocolo": "0000000000000"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Docker Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

### Using Docker directly

1. Build the image:
```bash
docker build -t middleware .
```

2. Run the container:
```bash
docker run -p 10000:10000 --env-file .env middleware
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TOKEN` | Authentication token. For more details, [click here](https://portaldatransparencia.gov.br/api-de-dados) | - | Yes |
| `PORT` | Server port | `3331` | No |
| `NODE_ENV` | Environment mode (`local` or `production`) | `production` | No |
| `LOGGER_LEVEL` | Logging level (`debug`, `info`, `warn`, `error`) | `info` | No |

## Project Structure

```
middleware/
├── src/
│   ├── app.ts                 # Fastify app configuration
│   ├── server.ts              # Server entry point
│   ├── database/              # Database layer
│   │   ├── init.ts           # Database initialization
│   │   ├── seed.ts           # Database seeding
│   │   ├── ticketRepository.ts # Ticket data access
│   │   └── types.ts          # Database types
│   ├── http/                 # HTTP handlers
│   │   ├── routes.ts         # Route definitions
│   │   └── functions/        # Route handlers
│   │       ├── handleConnection.ts
│   │       ├── getCPFInfo.ts
│   │       ├── getTicketInfoByCPF.ts
│   │       └── queryTicketsDetails.ts
│   └── utils/                # Utilities
│       └── loggerBuilder.ts  # Logger configuration
├── database/                 # SQLite database files
├── dist/                     # Compiled JavaScript
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile               # Docker image definition
├── swagger.yaml             # OpenAPI specification
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## API Documentation

The complete API documentation is available in OpenAPI 3.0 format in `swagger.yaml`. You can view it using any OpenAPI viewer or import it into tools like Postman, Insomnia, or Swagger UI.

**Swagger UI Example:**
```bash
# Install swagger-ui-serve globally
npm install -g swagger-ui-serve

# Serve the documentation
swagger-ui-serve swagger.yaml
```

## Logging

The application uses Winston for structured logging. Log levels can be configured via the `LOGGER_LEVEL` environment variable:

- `debug`: Detailed debugging information
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages only

## Database

The application uses SQLite for lightweight, file-based data storage. The database is automatically initialized on server startup and can be seeded with initial data.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Author

Lucas Quintanilha

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/lucasquitan/middleware/issues).

## Production Deployment

The application is configured to run on Render.com. The production URL is:
- **Production**: https://aicc-middleware.onrender.com

For deployment, ensure all environment variables are properly configured in your hosting platform.

