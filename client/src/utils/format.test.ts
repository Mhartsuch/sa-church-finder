import { describe, it, expect } from 'vitest'
import { formatDistance, formatRating, formatServiceTime, getDayName } from './format'

describe('format utilities', () => {
  it('formatDistance formats miles to one decimal', () => {
    expect(formatDistance(2.345)).toBe('2.3 mi')
    expect(formatDistance(0)).toBe('0.0 mi')
    expect(formatDistance(10)).toBe('10.0 mi')
  })

  it('formatRating formats rating to one decimal', () => {
    expect(formatRating(4.6)).toBe('4.6')
    expect(formatRating(5)).toBe('5.0')
  })

  it('formatServiceTime converts 24h to 12h format', () => {
    expect(formatServiceTime('09:00')).toBe('9:00 AM')
    expect(formatServiceTime('14:30')).toBe('2:30 PM')
    expect(formatServiceTime('00:00')).toBe('12:00 AM')
    expect(formatServiceTime('12:00')).toBe('12:00 PM')
  })

  it('getDayName returns correct day name', () => {
    expect(getDayName(0)).toBe('Sunday')
    expect(getDayName(6)).toBe('Saturday')
  })
})
