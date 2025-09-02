import { app } from './app'
import dotenv from 'dotenv'

dotenv.config()

const port: number = parseInt(process.env.PORT || '3333')

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
    console.log(`🚀 HTTP server running on port ${port}`)
  })
