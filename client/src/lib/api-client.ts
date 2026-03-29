import { normalizeApiError, resolveApiBaseUrl } from '@/lib/api-url'

const API_BASE = `${resolveApiBaseUrl()}/api/v1`

type ApiErrorEnvelope = {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

type ApiRequestOptions = RequestInit & {
  skipJsonContentType?: boolean
}

const isApiErrorEnvelope = (value: unknown): value is ApiErrorEnvelope => {
  if (!value || typeof value !== 'object') {
    return false
  }

  return 'error' in value
}

const parseJsonResponse = async (response: Response): Promise<unknown> => {
  const text = await response.text()

  if (!text) {
    return null
  }

  return JSON.parse(text) as unknown
}

export class ApiRequestError extends Error {
  status: number
  code?: string
  details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { skipJsonContentType = false, headers: rawHeaders, ...requestInit } = options
  const headers = new Headers(rawHeaders)

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (!skipJsonContentType && requestInit.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...requestInit,
      credentials: 'include',
      headers,
    })

    const payload = await parseJsonResponse(response)

    if (!response.ok) {
      const apiError = isApiErrorEnvelope(payload) ? payload.error : undefined

      throw new ApiRequestError(
        apiError?.message || `Request failed: ${response.status} ${response.statusText}`,
        response.status,
        apiError?.code,
        apiError?.details,
      )
    }

    return payload as T
  } catch (error) {
    throw normalizeApiError(error)
  }
}
