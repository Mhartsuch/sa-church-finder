import { apiRequest } from '@/lib/api-client'
import { IChurch, ISavedChurch, ISearchParams, ISearchResponse } from '@/types/church'

type ChurchEnvelope = {
  data: IChurch
}

type SavedChurchesEnvelope = {
  data: ISavedChurch[]
}

type ToggleSavedChurchEnvelope = {
  data: {
    churchId: string
    saved: boolean
  }
}

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
  return apiRequest<ISearchResponse>(`/churches${buildQueryString(params)}`)
}

export const fetchChurchBySlug = async (slug: string): Promise<IChurch> => {
  const envelope = await apiRequest<ChurchEnvelope>(`/churches/${encodeURIComponent(slug)}`)
  return envelope.data
}

export const toggleSavedChurch = async (
  churchId: string,
): Promise<ToggleSavedChurchEnvelope['data']> => {
  const envelope = await apiRequest<ToggleSavedChurchEnvelope>(
    `/churches/${encodeURIComponent(churchId)}/save`,
    {
      method: 'POST',
    },
  )

  return envelope.data
}

export const fetchSavedChurches = async (userId: string): Promise<ISavedChurch[]> => {
  const envelope = await apiRequest<SavedChurchesEnvelope>(
    `/users/${encodeURIComponent(userId)}/saved`,
  )

  return envelope.data
}
