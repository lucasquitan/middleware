// Import necessary types from Fastify for handling HTTP requests and responses
import { FastifyReply, FastifyRequest } from 'fastify'

// Import dotenv to load environment variables from .env file
import dotenv from 'dotenv'

// Load environment variables from .env file into process.env
dotenv.config()

// Debug flag to control verbose logging - set to true when NODE_ENV is 'debug'
// const debug: boolean = process.env.NODE_ENV === 'debug' || false

// Interface defining the structure of the request query parameters
interface QueryTicketsInfoRequest {
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
export async function queryTicketInfo(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extract CPF from query parameters with type assertion
  const { id, cpf } = request.query as QueryTicketsInfoRequest

  // Validate that CPF parameter is provided
  if (!id || !cpf) {
    return reply.status(200).send({
      success: false,
      original_status: 400,
      response: {
        error: 'Ticket ID and CPF are required',
        timestamp: new Date().toISOString(),
      },
    })
  }

  const ticketNotFound = {
    success: false,
    original_status: 404,
    response: {
      error: 'Ticket not found',
    },
    timestamp: new Date().toISOString(),
  } as const

  const response = {
    success: true,
    original_status: 200,
    response: {
      owner: cpf,
      protocolo: id,
      nome: 'Titular',
      descricao: 'Solicitação do chamado',
      fila: 'Fila',
    },
    timestamp: new Date().toISOString(),
  }

  if (id === '1765392696777') {
    if (cpf !== '807132459777') {
      return reply.status(200).send(ticketNotFound)
    }

    const newResponse = response

    newResponse.response.nome = 'Maria'
    newResponse.response.descricao = 'Solicitar Aposentadoria'
    newResponse.response.fila = 'SGP_Voz'

    console.log(newResponse)
    return reply.status(200).send(newResponse)
  } else if (id === '1765392788425') {
    if (cpf !== '44577744058') {
      return reply.status(200).send(ticketNotFound)
    }

    const newResponse = response

    newResponse.response.nome = 'Antônio'
    newResponse.response.descricao = 'Solicitar Aposentadoria'
    newResponse.response.fila = 'SGP_Voz'

    console.log(newResponse)
    return reply.status(200).send(newResponse)
  } else if (id === '1765392795637') {
    if (cpf !== '44577744058') {
      return reply.status(200).send(ticketNotFound)
    }

    const newResponse = response

    newResponse.response.nome = 'Antônio'
    newResponse.response.descricao =
      'Solicitar declaração para ex-servidores e ex-pensionistas'
    newResponse.response.fila = 'SGP_Voz'

    console.log(newResponse)
    return reply.status(200).send(newResponse)
  } else if (id === '1765392822240') {
    if (cpf !== '44577744058') {
      return reply.status(200).send(ticketNotFound)
    }

    const newResponse = response

    newResponse.response.nome = 'Antônio'
    newResponse.response.descricao = 'Solicitar Aposentadoria'
    newResponse.response.fila = 'SGP_Voz'

    console.log(newResponse)
    return reply.status(200).send(newResponse)
  } else if (id === '1765392781234') {
    if (cpf !== '74185296313') {
      return reply.status(200).send(ticketNotFound)
    }

    const newResponse = response

    newResponse.response.nome = 'Francisca'
    newResponse.response.descricao = 'Incluir nova entrada'
    newResponse.response.fila = 'SEGES_Voz'

    console.log(newResponse)
    return reply.status(200).send(newResponse)
  } else if (id === '1765392768526') {
    if (cpf !== '74185296313') {
      return reply.status(200).send(ticketNotFound)
    }

    const newResponse = response

    newResponse.response.nome = 'Francisca'
    newResponse.response.descricao = 'Correção de DARF'
    newResponse.response.fila = 'SPU_Voz'

    console.log(newResponse)
    return reply.status(200).send(newResponse)
  } else if (id === '1765392789856') {
    if (cpf !== '36925814720') {
      return reply.status(200).send(ticketNotFound)
    }

    const newResponse = response

    newResponse.response.nome = 'José'
    newResponse.response.descricao = 'Ratificar declaração de imóvel de domínio'
    newResponse.response.fila = 'SPU_Voz'

    console.log(newResponse)
    return reply.status(200).send(newResponse)
  } else if (id === '1765392789874') {
    if (cpf !== '79846513201') {
      return reply.status(200).send(ticketNotFound)
    }

    const newResponse = response

    newResponse.response.nome = 'Paulo'
    newResponse.response.descricao = 'Regularizar dívidas'
    newResponse.response.fila = 'SEGES_Voz'

    console.log(newResponse)
    return reply.status(200).send(newResponse)
  }

  return reply.status(200).send(ticketNotFound)
}
