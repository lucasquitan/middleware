import { FastifyInstance } from 'fastify'
import { getCPFInfo } from './functions/getCPFInfo'
import { getTicketInfoByCPF } from './functions/getTicketInfoByCPF'
import { handleConnection } from './functions/handleConnection'
import { queryTicketDetails } from './functions/queryTicketsDetails'

/**
 * Routes configuration function that registers all API endpoints
 * This function is called during app initialization to set up the routing
 *c
 * @param app - Fastify application instance to register routes on
 */
export async function routes(app: FastifyInstance) {
  // Register the proxy/middleware endpoint
  // POST /api - Accepts requests with URL, method, headers, and body
  // Forwards the request to the specified URL and returns the response
  app.post('/api', handleConnection)
  app.get('/api/cpf-info', getCPFInfo)
  app.get('/api/una', getTicketInfoByCPF)
  app.get('/api/ticket-info-db', queryTicketDetails)
}
