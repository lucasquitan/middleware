import { FastifyReply, FastifyRequest } from 'fastify'
import LoggerComponent from '../../utils/loggerBuilder'

// Create logger instance
const logger = new LoggerComponent('handleUniversalConnection')

// Interface defining the expected structure of the request body
// This ensures type safety and documents the API contract
interface HandleConnectionRequest {
  url: string // The target URL to make the HTTP request to
  method: string // HTTP method (GET, POST, PUT, DELETE)
  headers?: Record<string, string> // Optional HTTP headers to send
  body?: string // Optional request body to send
  query?: Record<string, string> // Optional query parameters to send
}

/**
 * HTTP handler function that acts as a proxy/middleware
 * Takes a request with URL, method, headers, and body, then forwards it
 * to the specified URL and returns the response
 *
 * @param request - Fastify request object containing the proxy request details
 * @param reply - Fastify reply object for sending the response
 * @returns Always returns a 200 status with success/error information in the body
 */
export async function handleConnection(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extract and type-cast the request body to our interface
  // This provides type safety while accessing the request data
  const { url, method, headers, body } = request.body as HandleConnectionRequest
  const query = request.query as Record<string, string>

  // Debug logging when NODE_ENV is set to 'debug'
  logger.info('Universal Connection Request received', {
    url,
    method,
    headers,
    body,
    query,
  })

  // Validate that required fields are present
  // Return early with error response if validation fails
  if (!url || !method) {
    return reply.status(200).send({
      success: false,
      error: 'Invalid request; url and method are required',
      original_status: 400,
      response: null,
    })
  }

  try {
    // Make the HTTP request to the specified URL using the fetch API
    // This forwards the request with the provided method, headers, and body
    const response = await fetch(
      `${url}?${new URLSearchParams(query).toString()}`,
      {
        method,
        headers,
        body,
      },
    )

    // Parse the response JSON for logging and return
    const responseData = await response.json()

    logger.debug('Universal Connection Response Data', {
      response: responseData,
    })

    // Return successful response with the original status and parsed JSON data
    // Always returns 200 status to maintain consistent API behavior
    logger.info('Universal Connection Response received successfully', {
      success: true,
      original_status: response.status,
    })

    return reply.status(200).send({
      success: true,
      original_status: response.status, // The actual HTTP status from the target URL
      response: responseData, // The response body as JSON
    })
  } catch (error) {
    // Serialize error properly for logging
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error(
      'Universal Connection fetch error',
      { error: errorMessage },
      {
        url,
        errorMessage,
      },
    )

    // Return error response while maintaining 200 status code
    // This ensures consistent API behavior regardless of success/failure
    return reply.status(200).send({
      success: false,
      error: `Invalid request, error fetching url: ${errorMessage}`,
      original_status: 400,
      response: null,
    })
  }
}
