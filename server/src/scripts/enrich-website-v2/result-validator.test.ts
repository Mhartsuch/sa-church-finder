import { validateAndClean, classifyConfidence } from './result-validator.js'

const MINIMAL = {
  pastorName: null,
  denomination: null,
  denominationFamily: null,
  yearEstablished: null,
  description: null,
  email: null,
  phone: null,
  languages: [],
  amenities: { goodForChildren: null, goodForGroups: null, wheelchairAccessible: null },
  staff: [],
  socialLinks: { facebook: null, instagram: null, twitter: null, youtube: null },
  services: [],
  confidence: 0,
}

describe('classifyConfidence', () => {
  it('buckets into high/medium/low', () => {
    expect(classifyConfidence(0.9)).toBe('high')
    expect(classifyConfidence(0.8)).toBe('high')
    expect(classifyConfidence(0.6)).toBe('medium')
    expect(classifyConfidence(0.4)).toBe('low')
  })
})

describe('validateAndClean', () => {
  it('returns null when nothing useful is present', () => {
    expect(validateAndClean(MINIMAL, 'claude-ai')).toBeNull()
  })

  it('accepts a payload with only a pastor name', () => {
    const result = validateAndClean(
      { ...MINIMAL, pastorName: 'Rev. Smith', confidence: 0.9 },
      'claude-ai',
    )
    expect(result).not.toBeNull()
    expect(result?.pastorName).toBe('Rev. Smith')
    expect(result?.source).toBe('claude-ai')
    expect(result?.confidenceLevel).toBe('high')
  })

  it('rejects malformed services', () => {
    const bad = {
      ...MINIMAL,
      pastorName: 'X',
      confidence: 0.9,
      services: [
        { dayOfWeek: 99, startTime: 'no', endTime: null, serviceType: 'S', language: 'E' },
      ],
    }
    expect(validateAndClean(bad, 'claude-ai')).toBeNull()
  })

  it('coerces bad optional fields to safe defaults via catch', () => {
    const weird = {
      ...MINIMAL,
      pastorName: 'Pastor',
      confidence: 0.9,
      // languages is the wrong shape; should be caught and defaulted to []
      languages: 'english' as unknown as string[],
      staff: 'not-an-array' as unknown as [],
    }
    const result = validateAndClean(weird, 'claude-ai')
    expect(result).not.toBeNull()
    expect(result?.languages).toEqual([])
    expect(result?.staff).toEqual([])
  })

  it('validates year range', () => {
    const tooOld = { ...MINIMAL, yearEstablished: 1200, confidence: 0.9 }
    expect(validateAndClean(tooOld, 'claude-ai')).toBeNull()

    const reasonable = { ...MINIMAL, yearEstablished: 1885, confidence: 0.9 }
    const result = validateAndClean(reasonable, 'claude-ai')
    expect(result?.yearEstablished).toBe(1885)
  })

  it('accepts valid service entries', () => {
    const good = {
      ...MINIMAL,
      confidence: 0.85,
      services: [
        {
          dayOfWeek: 0,
          startTime: '09:00',
          endTime: '10:00',
          serviceType: 'Traditional',
          language: 'English',
        },
        {
          dayOfWeek: 0,
          startTime: '11:00',
          endTime: null,
          serviceType: 'Contemporary',
          language: 'English',
        },
      ],
    }
    const result = validateAndClean(good, 'claude-ai')
    expect(result?.services).toHaveLength(2)
  })
})
