import { DAY_OPTIONS, TIME_OPTIONS } from '@/constants'
import { SearchFilters } from '@/stores/search-store'

export type ActiveSearchTokenKey = 'query' | keyof SearchFilters

export interface ActiveSearchToken {
  key: ActiveSearchTokenKey
  label: string
  value: string
}

const timeLabelMap = Object.fromEntries(
  TIME_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>

export const getActiveSearchTokens = (
  query: string,
  filters: SearchFilters,
): ActiveSearchToken[] => {
  const tokens: ActiveSearchToken[] = []
  const trimmedQuery = query.trim()

  if (trimmedQuery) {
    tokens.push({
      key: 'query',
      label: 'Search',
      value: trimmedQuery,
    })
  }

  if (filters.denomination) {
    tokens.push({
      key: 'denomination',
      label: 'Tradition',
      value: filters.denomination,
    })
  }

  if (filters.day !== undefined) {
    const dayLabel = DAY_OPTIONS.find((option) => option.value === filters.day)?.label

    tokens.push({
      key: 'day',
      label: 'Day',
      value: dayLabel ?? String(filters.day),
    })
  }

  if (filters.time) {
    tokens.push({
      key: 'time',
      label: 'Time',
      value: timeLabelMap[filters.time] ?? filters.time,
    })
  }

  if (filters.language) {
    tokens.push({
      key: 'language',
      label: 'Language',
      value: filters.language,
    })
  }

  if (filters.amenities) {
    tokens.push({
      key: 'amenities',
      label: 'Amenity',
      value: filters.amenities,
    })
  }

  return tokens
}
