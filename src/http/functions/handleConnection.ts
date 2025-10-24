import { FastifyReply, FastifyRequest } from 'fastify'

// Interface defining the expected structure of the request body
// This ensures type safety and documents the API contract
interface HandleConnectionRequest {
  url: string // The target URL to make the HTTP request to
  method: string // HTTP method (GET, POST, PUT, DELETE)
  headers?: Record<string, string> // Optional HTTP headers to send
  body?: string // Optional request body to send
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

  // Debug logging when NODE_ENV is set to 'debug'
  if (process.env.NODE_ENV === 'debug') {
    console.log('🔍 [DEBUG] Request received:', {
      url,
      method,
      headers,
      body,
      timestamp: new Date().toISOString(),
    })
  }

  // Validate that required fields are present
  // Return early with error response if validation fails
  if (!url || !method) {
    // Debug logging when NODE_ENV is set to 'debug'
    if (process.env.NODE_ENV === 'debug') {
      console.log('❌ [DEBUG] Validation error response sent:', {
        success: false,
        error: 'Invalid request, url and method are required',
        original_status: 400,
        response: null,
        timestamp: new Date().toISOString(),
      })
    }

    return reply.status(200).send({
      success: false,
      error: 'Invalid request, url and method are required',
      original_status: 400,
      response: null,
    })
  }

  try {
    // Make the HTTP request to the specified URL using the fetch API
    // This forwards the request with the provided method, headers, and body
    const response = await fetch(url, {
      method,
      headers,
      body,
    })

    // Parse the response JSON for logging and return
    const responseData = await response.json()

    // Debug logging when NODE_ENV is set to 'debug'
    if (process.env.NODE_ENV === 'debug') {
      console.log('✅ [DEBUG] Response sent:', {
        success: true,
        original_status: response.status,
        response: responseData,
        timestamp: new Date().toISOString(),
      })
    }

    // Return successful response with the original status and parsed JSON data
    // Always returns 200 status to maintain consistent API behavior
    return reply.status(200).send({
      success: true,
      original_status: response.status, // The actual HTTP status from the target URL
      response: responseData, // The response body as JSON
    })
  } catch (error) {
    // Handle any errors that occur during the fetch operation
    // This includes network errors, invalid URLs, JSON parsing errors, etc.
    console.error(error)

    // Debug logging when NODE_ENV is set to 'debug'
    if (process.env.NODE_ENV === 'debug') {
      console.log('❌ [DEBUG] Error response sent:', {
        success: false,
        error: 'Invalid request, error fetching url',
        original_status: 400,
        response: null,
        timestamp: new Date().toISOString(),
      })
    }

    // Return error response while maintaining 200 status code
    // This ensures consistent API behavior regardless of success/failure
    return reply.status(200).send({
      success: false,
      error: 'Invalid request, error fetching url',
      original_status: 400,
      response: null,
    })
  }
}
