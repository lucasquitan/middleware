// Import necessary dependencies
import dotenv from 'dotenv'
import { FastifyReply, FastifyRequest } from 'fastify'

// Import LoggerComponent for logging
import LoggerComponent from '../../utils/loggerBuilder'

dotenv.config()
const logger = new LoggerComponent('getCPFInfo')
const validationLogger = new LoggerComponent('function-isValidCPF')

/**
 * Validates a CPF number using the Brazilian CPF verification algorithm
 *
 * The algorithm:
 * 1. Removes all non-numeric characters
 * 2. Checks if it has exactly 11 digits
 * 3. Checks if all digits are not the same
 * 4. Calculates and validates the first verification digit
 * 5. Calculates and validates the second verification digit
 *
 * @param cpf - The CPF string to validate (can contain formatting characters)
 * @returns boolean - true if CPF is valid, false otherwise
 */
function isValidCPF(cpf: string): boolean {
  // Remove all non-numeric characters
  const cleanCPF = cpf.replace(/\D/g, '')

  // Check if it has exactly 11 digits
  if (cleanCPF.length !== 11) {
    validationLogger.info('CPF validation failed - length mismatch', {
      cpf,
      status: 400,
    })
    return false
  }

  // Check if all digits are the same (e.g., 111.111.111-11, 222.222.222-22)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    validationLogger.info('CPF validation failed - all digits are the same', {
      cpf,
      status: 400,
    })
    return false
  }

  // Calculate first verification digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  const firstDigit = remainder === 10 || remainder === 11 ? 0 : remainder

  // Validate first digit
  if (firstDigit !== parseInt(cleanCPF.charAt(9))) {
    validationLogger.info('CPF validation failed - first digit mismatch', {
      cpf,
      status: 400,
    })
    return false
  }

  // Calculate second verification digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  const secondDigit = remainder === 10 || remainder === 11 ? 0 : remainder

  // Validate second digit
  if (secondDigit !== parseInt(cleanCPF.charAt(10))) {
    validationLogger.info('CPF validation failed - second digit mismatch', {
      cpf,
      status: 400,
    })
    return false
  }

  return true
}

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
  logger.info('getCPFInfo function called', { request: request.query })
  const { cpf } = request.query as GetCPFInfoRequest

  if (!cpf) {
    logger.warn('The CPF is mandatory and was not provided', {
      cpf,
      status: 400,
    })
    return reply.status(200).send({
      succes: false, // Note: typo in 'success' - should be 'success'
      original_status: 400,
      response: {
        error: 'CPF is required',
        timestamp: new Date().toISOString(),
      },
    })
  }
  // Validate CPF format and verification digits
  if (!isValidCPF(cpf)) {
    logger.info('CPF validation failed on isValidCPF function', {
      cpf,
      status: 400,
    })
    return reply.status(200).send({
      success: false,
      original_status: 400,
      response: {
        error: 'CPF is invalid',
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
      logger.info('CPF provided is valid and was found', { cpf, status: 200 })

      // Return successful response with the extracted data
      return reply.status(200).send({
        success: true,
        original_status: response.status,
        response: responseData,
        timestamp: new Date().toISOString(),
      })
    } else {
      logger.info('CPF provided is valid but was not found', {
        cpf,
        status: 404,
      })
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
