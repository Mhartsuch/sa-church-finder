type ApiLocation = {
  hostname: string
  protocol: string
}

type ResolveApiBaseUrlOptions = {
  configuredUrl?: string
  isDev?: boolean
  location?: ApiLocation | null
}

const trimTrailingSlash = (url: string): string => url.replace(/\/+$/, '')

export const inferRenderApiUrl = (
  location: ApiLocation | null | undefined,
): string | null => {
  if (!location) return null

  const { hostname, protocol } = location
  if (!hostname.endsWith('.onrender.com')) return null

  const [subdomain, ...rest] = hostname.split('.')
  if (!subdomain || subdomain.endsWith('-api') || rest.length === 0) return null

  return `${protocol}//${subdomain}-api.${rest.join('.')}`
}

export const resolveApiBaseUrl = (
  options: ResolveApiBaseUrlOptions = {},
): string => {
  const configuredUrl = options.configuredUrl ?? import.meta.env.VITE_API_URL
  const isDev = options.isDev ?? import.meta.env.DEV
  const location =
    options.location ?? (typeof window !== 'undefined' ? window.location : null)

  if (configuredUrl?.trim()) {
    return trimTrailingSlash(configuredUrl.trim())
  }

  if (isDev) {
    return ''
  }

  const inferredRenderUrl = inferRenderApiUrl(location)
  if (inferredRenderUrl) {
    return inferredRenderUrl
  }

  return ''
}

export const normalizeApiError = (error: unknown): Error => {
  if (error instanceof TypeError) {
    return new Error(
      'Network request failed. Check VITE_API_URL on the frontend and CLIENT_URL on the backend Render service.',
    )
  }

  if (error instanceof SyntaxError) {
    return new Error(
      'API returned a non-JSON response. Check that VITE_API_URL points to the backend service instead of the static site.',
    )
  }

  return error instanceof Error ? error : new Error('Unexpected API error')
}
