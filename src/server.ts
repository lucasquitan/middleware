import dotenv from 'dotenv'
import { app } from './app'
import './database/init' // Importa para inicializar o banco de dados
import { seedDatabase } from './database/seed'
import LoggerComponent from './utils/loggerBuilder'

// Load environment variables from .env file
dotenv.config()

const port: number = parseInt(process.env.PORT || '3331')
const env: string = process.env.NODE_ENV || 'production'
const logger = new LoggerComponent('Server')
/**
 * Server startup configuration
 * This file is the entry point that starts the HTTP server
 *
 * The server listens on port 3333 and logs when it's ready
 */
app
  .listen({
    host: '0.0.0.0',
    port, // HTTP server port - can be configured via environment variables
  })
  .then(() => {
    // Log successful server startup
    logger.info(`HTTP server running on port ${port} in ${env} mode`)
    logger.debug('Token', { token: process.env.TOKEN })
    logger.info('Logger level', { level: process.env.LOGGER_LEVEL })
    seedDatabase()
  })
  .catch((error) => {
    console.error(`❌ Error starting server: ${error}`)
    process.exit(1)
  })
