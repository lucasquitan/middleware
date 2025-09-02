import fastify from 'fastify'
import { routes } from './http/routes'

/**
 * Main Fastify application instance
 * This is the core server that handles HTTP requests and responses
 */
export const app = fastify()

// Register all application routes
// This sets up the API endpoints defined in the routes module
app.register(routes)
