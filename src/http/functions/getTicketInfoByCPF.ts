// Import necessary types from Fastify for handling HTTP requests and responses
import { FastifyReply, FastifyRequest } from 'fastify'

// Import dotenv to load environment variables from .env file
import dotenv from 'dotenv'

// Load environment variables from .env file into process.env
dotenv.config()

// Debug flag to control verbose logging - set to true when NODE_ENV is 'debug'
// const debug: boolean = process.env.NODE_ENV === 'debug' || false

// Interface defining the structure of the request query parameters
interface GetTicketInfoByCPFRequest {
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
export async function getTicketInfoByCPF(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extract CPF from query parameters with type assertion
  const { cpf } = request.query as GetTicketInfoByCPFRequest

  // Validate that CPF parameter is provided
  if (!cpf) {
    return reply.status(200).send({
      success: false,
      original_status: 400,
      response: {
        error: 'CPF is required',
        timestamp: new Date().toISOString(),
      },
    })
  }

  let response = {}

  // Check if CPF is 807.132.450-77 or 445.777.440-58, otherwise return empty list
  if (cpf === '80713245077') {
    response = {
      total: 1,
      content: [
        {
          nuProtocoloPedido: '1765392696777',
          nmServico: 'Solicitar Aposentadoria',
          status: 1,
        },
      ],
    }
    // Log the CPF being requested for tracking purposes
    console.log(
      `${new Date().toISOString()} ✅ [INFO] CPF: ${cpf} - Response: ${JSON.stringify(response)}`,
    )
    return reply.status(200).send({
      success: true,
      original_status: 200,
      response,
      timestamp: new Date().toISOString(),
    })
  } else if (cpf === '44577744058') {
    response = {
      total: 4,
      content: [
        {
          nuProtocoloPedido: '1765392788425',
          nmServico: 'Solicitar Aposentadoria',
          status: 1,
        },
        {
          nuProtocoloPedido: '1765392795637',
          nmServico:
            'Solicitar declaração para ex-servidores e ex-pensionistas',
          status: 3,
        },
        {
          nuProtocoloPedido: '1765310358328',
          nmServico: 'Comunicar óbito de agente público ou pensionista',
          status: 2,
        },
        {
          nuProtocoloPedido: '1765392822240',
          nmServico: 'Solicitar Aposentadoria',
          status: 7,
        },
      ],
    }
    // Log the CPF being requested for tracking purposes
    console.log(
      `${new Date().toISOString()} ✅ [INFO] CPF: ${cpf} - Response: ${JSON.stringify(response)}`,
    )
    return reply.status(200).send({
      success: true,
      original_status: 200,
      response,
      timestamp: new Date().toISOString(),
    })
  } else {
    // Log the CPF being requested for tracking purposes
    console.log(
      `${new Date().toISOString()} ❌ [INFO] CPF: ${cpf} - Response: CPF not found or no tickets found`,
    )
    return reply.status(200).send({
      success: true,
      original_status: 200,
      response: { total: 0, content: [] },
      timestamp: new Date().toISOString(),
    })
  }
}
