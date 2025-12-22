// Import necessary dependencies
import { FastifyReply, FastifyRequest } from 'fastify'
import dotenv from 'dotenv'

// Import LoggerComponent for logging
import LoggerComponent from '../../utils/loggerBuilder'

dotenv.config()
const logger = new LoggerComponent('getCPFInfo')

// Interface defining the structure of the request query parameters
interface GetCPFInfoRequest {
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

export async function getCPFInfo(request: FastifyRequest, reply: FastifyReply) {
  const { cpf } = request.query as GetCPFInfoRequest

  if (!cpf) {
    logger.warn('The CPF parameter was not provided')
    return reply.status(200).send({
      succes: false, // Note: typo in 'success' - should be 'success'
      original_status: 400,
      response: {
        error: 'CPF is required',
        timestamp: new Date().toISOString(),
      },
    })
  }

  // Construct the API URL for Portal da Transparência servidores endpoint
  const url = `https://api.portaldatransparencia.gov.br/api-de-dados/servidores?cpf=${cpf}&pagina=1`

  // Prepare headers for the API request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'chave-api-dados': process.env.TOKEN || 'error-key-not-found', // API key from environment variables
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    // Log the CPF being requested for tracking purposes

    logger.info('Check CPF info successfully', {
      cpf,
      response: response.status,
    })

    // Parse the JSON response from the API
    const data: any = await response.json()

    // Check if the response contains valid data (not null, not empty array, and has at least one item)
    if (
      data !== null &&
      data !== undefined &&
      data.length > 0 &&
      data[0] !== undefined
    ) {
      // Extract and format server information from the API response
      // All text fields are converted to uppercase for consistency
      const name: string = (data as any)[0].servidor.pessoa.nome.toUpperCase()
      const situacao: string = (data as any)[0].servidor.situacao.toUpperCase()
      const orgao: string = (
        data as any
      )[0].servidor.orgaoServidorLotacao.nome.toUpperCase()
      const sigla: string = (
        data as any
      )[0].servidor.orgaoServidorLotacao.sigla.toUpperCase()
      const codigo: string = (
        data as any
      )[0].servidor.orgaoServidorLotacao.codigo.toUpperCase()

      // Structure the response data in a clean format
      const responseData = {
        CPF: cpf,
        NOME: name,
        SITUACAO: situacao,
        ORGAO: orgao,
        SIGLA: sigla,
        CODIGO: codigo,
      }

      // Log detailed response data if debug mode is enabled
      logger.debug(`Response for CPF: ${cpf}`, { response: responseData })

      // Return successful response with the extracted data
      return reply.status(200).send({
        success: true,
        original_status: response.status,
        response: responseData,
        timestamp: new Date().toISOString(),
      })
    } else {
      return reply.status(200).send({
        success: true,
        original_status: 404,
        response: {
          message: 'CPF não encontrado.',
          timestamp: new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    // Handle any errors that occur during the API request or data processing
    logger.error('Error', { error })
    return reply.status(200).send({
      success: false,
      original_status: 500,
      response: {
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      },
    })
  }
}
