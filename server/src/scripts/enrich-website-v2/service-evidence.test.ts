import { isPlausiblePersonName, partitionByEvidence, timeAppearsInText } from './service-evidence'
import type { ExtractedService } from './types'

describe('timeAppearsInText', () => {
  it.each([
    ['10:30', 'Sunday Worship 10:30 AM'],
    ['10:30', 'Sundays at 10:30am in the sanctuary'],
    ['10:30', 'Domingos 10.30 a.m.'],
    ['09:00', 'Join us at 9:00 a.m. every Sunday'],
    ['09:00', 'Sunday School 9am'],
    ['09:00', 'Sunday School 9 AM'],
    ['18:30', 'Wednesday Bible study, 6:30 PM'],
    ['18:30', 'Mittwoch 18:30'],
    ['12:00', 'Daily Mass at noon'],
    ['17:00', 'Saturday Vigil 5 p.m.'],
  ])('finds %s in "%s"', (time, text) => {
    expect(timeAppearsInText(time, text)).toBe(true)
  })

  it.each([
    ['10:30', 'Sunday Worship 11:00 AM'],
    ['10:30', 'Call 210-555-1030 for details'],
    ['09:00', 'Founded in 1909, we welcome 9 new members'],
    ['09:00', 'Service at 19:00'],
    ['17:00', 'Mass at 5:30 pm'],
    ['11:00', 'Worship at 11:15 AM'],
    ['10:00', 'Saturday 10 pm youth lock-in'],
    ['25:00', 'anything'],
  ])('does not find %s in "%s"', (time, text) => {
    expect(timeAppearsInText(time, text)).toBe(false)
  })
})

describe('partitionByEvidence', () => {
  const service = (startTime: string): ExtractedService => ({
    dayOfWeek: 0,
    startTime,
    endTime: null,
    serviceType: 'Service',
    language: 'English',
  })

  it('keeps only services whose time is written on the site', () => {
    const { supported, unsupported } = partitionByEvidence(
      [service('09:00'), service('10:30'), service('11:00')],
      'Sunday services at 9:00 and 11:00 AM',
    )
    expect(supported.map((s) => s.startTime)).toEqual(['09:00', '11:00'])
    expect(unsupported.map((s) => s.startTime)).toEqual(['10:30'])
  })
})

describe('isPlausiblePersonName', () => {
  it.each([
    'John Wesley',
    'Rev. Dr. Maria de la Cruz',
    'Fr. Peter Hall',
    "Sean O'Brien Jr.",
    'Bishop T. D. Jones',
  ])('accepts %s', (name) => {
    expect(isPlausiblePersonName(name)).toBe(true)
  })

  it.each([
    'and the Son',
    'Our Pastors',
    'Pastor',
    'John',
    'the Church Staff',
    'Jesus Christ',
    'welcome to our church',
  ])('rejects %s', (name) => {
    expect(isPlausiblePersonName(name)).toBe(false)
  })
})
