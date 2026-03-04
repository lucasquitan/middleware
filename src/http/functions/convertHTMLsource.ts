import { FastifyReply, FastifyRequest } from 'fastify'
import { htmlToText } from 'html-to-text'
import LoggerComponent from '../../utils/loggerBuilder'

const logger = new LoggerComponent('convertHTMLsource')

const HUAWEI_QA_URL = process.env.HUAWEI_QA_URL || ''
if (!HUAWEI_QA_URL) {
	logger.error('HUAWEI_QA_URL is not set', {
		original_status: 500,
		response: null,
	})
}
// Interface defining the expected structure of the request body
interface convertHTMLsourceRequest {
	input: string
}

/**
 * Extracts input from the request body. Supports:
 * - JSON body with "input" key: { "input": "..." }
 * - Raw string body (e.g. text/plain): the entire body is the input.
 */
function getInputFromBody(body: unknown): string | null {
	if (typeof body === 'string') {
		return body.length > 0 ? body : null
	}
	if (
		body &&
		typeof body === 'object' &&
		'input' in body &&
		typeof (body as convertHTMLsourceRequest).input === 'string'
	) {
		return (body as convertHTMLsourceRequest).input
	}
	return null
}

/**
 * Converts HTML string to plain text when applicable.
 */
function tryHtmlToText(value: string): string {
	const trimmed = value.trim()
	if (!trimmed || !/<[a-z][\s\S]*>/i.test(trimmed)) return value
	const wrapped =
		/^\s*<html[\s>]/i.test(trimmed) || /^\s*<body[\s>]/i.test(trimmed)
			? trimmed
			: `<body>${trimmed}</body>`
	return htmlToText(wrapped, { wordwrap: false, preserveNewlines: true })
}

/**
 * Sends the question (input) to the Huawei Q&A API and returns the answer as plain text.
 * Credentials and URL come from env: HUAWEI_QA_URL, HUAWEI_X_HW_ID,
 * HUAWEI_X_HW_APPKEY, HUAWEI_COOKIE, HUAWEI_USER_ID.
 */
export async function convertHTMLsource(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const input = getInputFromBody(request.body)

	if (!input) {
		return reply.status(200).send({
			success: false,
			error: 'Body is required: input is required',
			original_status: 400,
			response: null,
		})
	}

	const appKey = process.env.HUAWEI_X_HW_APPKEY
	const hwId = process.env.HUAWEI_X_HW_ID
	const cookie = process.env.HUAWEI_COOKIE
	const userId = process.env.HUAWEI_USER_ID || 'l00958391'

	if (!appKey || !hwId) {
		return reply.status(200).send({
			success: false,
			error:
				'Server misconfiguration: HUAWEI_X_HW_APPKEY and HUAWEI_X_HW_ID are required',
			original_status: 500,
			response: null,
		})
	}

	const headers: Record<string, string> = {
		'X-HW-ID': hwId,
		'X-HW-APPKEY': appKey,
		'Content-Type': 'application/json',
	}
	if (cookie) headers.Cookie = cookie

	const body = {
		userId,
		question: input,
		language: 'pt_BR',
		field: 'ALL',
		source: 'wecare',
		operateType: '',
		hotlineId: '',
		platform: 'web',
	}

	try {
		const res = await fetch(HUAWEI_QA_URL, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
		})

		logger.debug('Huawei API response', { response: res })

		const contentType = res.headers.get('content-type') || ''
		let plainTextResponse: string

		if (contentType.includes('application/json')) {
			const data = (await res.json()) as Record<string, unknown>
			const answer = typeof data?.answer === 'string' ? data.answer : ''
			plainTextResponse = answer ? tryHtmlToText(answer) : answer
		} else {
			const text = await res.text()
			plainTextResponse = text.startsWith('<') ? tryHtmlToText(text) : text
		}

		return reply.status(200).send({
			success: res.ok,
			error: res.ok ? undefined : `Huawei API returned ${res.status}`,
			original_status: res.status,
			response: plainTextResponse,
		})
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err)
		return reply.status(200).send({
			success: false,
			error: `Huawei API request failed: ${message}`,
			original_status: 500,
			response: null,
		})
	}
}
