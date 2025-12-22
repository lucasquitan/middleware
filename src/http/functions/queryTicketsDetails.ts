// Import necessary types from Fastify for handling HTTP requests and responses
import { FastifyReply, FastifyRequest } from 'fastify'
import dotenv from 'dotenv'

import LoggerComponent from '../../utils/loggerBuilder'
import { ticketRepository } from '../../database/ticketRepository'

// Load environment variables from .env file into process.env
dotenv.config()

const logger = new LoggerComponent('queryTicketsDetails')

// Interface defining the structure of the request query parameters
interface QueryTicketDetailRequest {
  id: string
  cpf: string
}

/**
 * HTTP handler function to retrieve CPF information from Portal da Transparência API
 *
 * This function:
 * 1. Validates the CPF parameter from query string
 * 2. Makes a request to the Brazilian government transparency API
 * 3. Processes the response and extracts relevant server information
 * 4. Returns formatted data or appropriate error messages
 *
 * @param request - Fastify request object containing query parameters
 * @param reply - Fastify reply object for sending HTTP responses
 * @returns Promise<void> - Sends HTTP response with CPF data or error
 */
export async function queryTicketDetails(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extract CPF from query parameters with type assertion
  const { id, cpf } = request.query as QueryTicketDetailRequest

  // Validate that CPF parameter is provided
  if (!id || !cpf) {
    const errorResponse = {
      success: false,
      original_status: 400,
      response: {
        error: 'Ticket ID and CPF are required',
        timestamp: new Date().toISOString(),
      },
    }

    logger.warn('Ticket Details validation error', {
      id,
      cpf,
      errorResponse,
    })

    return reply.status(200).send(errorResponse)
  }

  // Query the database for the ticket where cpf is the owner
  const ticket = ticketRepository.findByProtocoloAndOwner(id, cpf)
  if (!ticket) {
    // Check if CPF exists in the database
    const cpfExists = ticketRepository.findByOwner(cpf)
    if (cpfExists.length === 0) {
      logger.info('Ticket Details by protocolo and cpf Req/Res', {
        id,
        cpf,
        status: 404,
        reason: 'CPF not found',
      })

      const notFoundResponse = {
        success: false,
        original_status: 400,
        response: {
          nome: 'Titular não encontrado',
          descricao: 'Chamado não encontrado',
          fila: 'SEGES_Voz',
          protocolo: id,
        },
        timestamp: new Date().toISOString(),
      }

      return reply.status(200).send(notFoundResponse)
    }

    const invalidTicketResponse = {
      success: false,
      original_status: 404,
      response: {
        nome: cpfExists[0].nome,
        descricao: 'Chamado não encontrado',
        fila: 'SEGES_Voz',
        protocolo: id,
      },
      timestamp: new Date().toISOString(),
    }

    logger.info('Ticket Details by protocolo and cpf Req/Res', {
      id,
      cpf,
      status: 404,
      reason: 'Ticket not found',
    })

    return reply.status(200).send(invalidTicketResponse)
  }

  const successResponse = {
    success: true,
    original_status: 200,
    response: {
      nome: ticket.nome,
      descricao: ticket.descricao,
      fila: ticket.fila,
      protocolo: id,
    },
    timestamp: new Date().toISOString(),
  }

  logger.info('Ticket Details by protocolo and cpf Req/Res', {
    protocolo: id,
    cpf,
    status: 200,
  })

  return reply.status(200).send(successResponse)
}
