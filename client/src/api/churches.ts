import { IChurch, ISearchParams, ISearchResponse } from '@/types/church'
import { normalizeApiError, resolveApiBaseUrl } from '@/lib/api-url'

const API_BASE = `${resolveApiBaseUrl()}/api/v1`

const buildQueryString = (params: ISearchParams): string => {
  const qs = new URLSearchParams()

  if (params.lat !== undefined) qs.append('lat', params.lat.toString())
  if (params.lng !== undefined) qs.append('lng', params.lng.toString())
  if (params.radius !== undefined) qs.append('radius', params.radius.toString())
  if (params.q) qs.append('q', params.q)
  if (params.denomination) qs.append('denomination', params.denomination)
  if (params.day !== undefined) qs.append('day', params.day.toString())
  if (params.time) qs.append('time', params.time)
  if (params.language) qs.append('language', params.language)
  if (params.amenities) qs.append('amenities', params.amenities)
  if (params.sort) qs.append('sort', params.sort)
  if (params.page !== undefined) qs.append('page', params.page.toString())
  if (params.pageSize !== undefined) qs.append('pageSize', params.pageSize.toString())
  if (params.bounds) qs.append('bounds', params.bounds)

  const queryStr = qs.toString()
  return queryStr ? `?${queryStr}` : ''
}

export const fetchChurches = async (params: ISearchParams): Promise<ISearchResponse> => {
  const url = `${API_BASE}/churches${buildQueryString(params)}`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch churches: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export const fetchChurchBySlug = async (slug: string): Promise<IChurch> => {
  const url = `${API_BASE}/churches/${slug}`
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch church: ${response.statusText}`)
    }
    const envelope = await response.json()
    return envelope.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}
