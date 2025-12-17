// Import necessary types from Fastify for handling HTTP requests and responses
import { FastifyReply, FastifyRequest } from 'fastify'

// Import dotenv to load environment variables from .env file
import dotenv from 'dotenv'
import { ticketRepository } from '../../database/ticketRepository'

// Load environment variables from .env file into process.env
dotenv.config()

// Debug flag to control verbose logging - set to true when NODE_ENV is 'debug'
const debug: boolean = process.env.NODE_ENV === 'debug'

// Interface defining the structure of the request query parameters
interface QueryTicketsInfoUsingDBRequest {
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
export async function queryTicketInfoUsingDB(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extract CPF from query parameters with type assertion
  const { id, cpf } = request.query as QueryTicketsInfoUsingDBRequest

  console.log('🔍 [INFO] Request received:', {
    protocolo: id,
    cpf,
    timestamp: new Date().toISOString(),
  })

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

    if (debug) {
      console.log('❌ [DEBUG] Validation error - Response sent:', errorResponse)
    }

    return reply.status(200).send(errorResponse)
  }

  // Query the database for the ticket where cpf is the owner
  const ticket = ticketRepository.findByProtocoloAndOwner(id, cpf)
  if (!ticket) {
    // Check if CPF exists in the database
    const cpfExists = ticketRepository.findByOwner(cpf)
    if (cpfExists.length === 0) {
      const notFoundResponse = {
        success: false,
        original_status: 404,
        response: {
          nome: 'Titular não encontrado',
          descricao: 'Chamado não encontrado',
          fila: 'SEGES_Voz',
          protocolo: id,
        },
        timestamp: new Date().toISOString(),
      }

      if (debug) {
        console.log(
          '❌ [DEBUG] CPF not found - Response sent:',
          notFoundResponse,
        )
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

    if (debug) {
      console.log(
        '✅ [DEBUG] Invalid ticket (CPF exists but not for this protocolo) - Response sent:',
        invalidTicketResponse,
      )
    }

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

  if (debug) {
    console.log('✅ [DEBUG] Ticket found - Response sent:', successResponse)
  }

  return reply.status(200).send(successResponse)
}
