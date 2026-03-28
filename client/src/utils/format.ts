import { IChurchService } from '@/types/church'
import { DAY_OPTIONS } from '@/constants'

export const formatDistance = (miles: number): string => {
  return `${miles.toFixed(1)} mi`
}

export const formatRating = (rating: number): string => {
  return rating.toFixed(1)
}

export const formatServiceTime = (time: string): string => {
  // Convert from 24h format (HH:MM) to 12h format (H:MM AM/PM)
  if (!time) return ''

  const [hours, minutes] = time.split(':').map(Number)
  const isPm = hours >= 12
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const period = isPm ? 'PM' : 'AM'

  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

export const getDayName = (day: number): string => {
  const dayOption = DAY_OPTIONS.find((opt) => opt.value === day)
  return dayOption ? dayOption.label : ''
}

export const getNextService = (services: IChurchService[]): string | null => {
  if (!services || services.length === 0) return null

  // For now, return the first service found with a formatted time
  const firstService = services[0]
  const dayName = getDayName(firstService.dayOfWeek)
  const time = formatServiceTime(firstService.startTime)

  if (dayName && time) {
    return `${dayName} at ${time}`
  }

  return null
}
