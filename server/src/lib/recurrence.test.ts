import {
  RecurrenceRuleError,
  expandOccurrences,
  nextOccurrence,
  parseRRule,
  validateAndNormalizeRRule,
} from './recurrence.js'

describe('parseRRule', () => {
  it('parses a simple weekly rule', () => {
    const rule = parseRRule('FREQ=WEEKLY')
    expect(rule).toEqual({ freq: 'WEEKLY', interval: 1 })
  })

  it('parses interval, count, and byDay', () => {
    const rule = parseRRule('FREQ=WEEKLY;INTERVAL=2;BYDAY=SU,WE;COUNT=12')
    expect(rule.freq).toBe('WEEKLY')
    expect(rule.interval).toBe(2)
    expect(rule.count).toBe(12)
    expect(rule.byDay).toEqual(['SU', 'WE'])
  })

  it('sorts BYDAY values into week order', () => {
    const rule = parseRRule('FREQ=WEEKLY;BYDAY=FR,MO,WE')
    expect(rule.byDay).toEqual(['MO', 'WE', 'FR'])
  })

  it('parses UNTIL in ical basic form', () => {
    const rule = parseRRule('FREQ=WEEKLY;UNTIL=20260501T000000Z')
    expect(rule.until?.toISOString()).toBe('2026-05-01T00:00:00.000Z')
  })

  it('parses UNTIL in ISO 8601 form', () => {
    const rule = parseRRule('FREQ=WEEKLY;UNTIL=2026-05-01T00:00:00.000Z')
    expect(rule.until?.toISOString()).toBe('2026-05-01T00:00:00.000Z')
  })

  it('tolerates a leading RRULE: prefix', () => {
    const rule = parseRRule('RRULE:FREQ=DAILY')
    expect(rule.freq).toBe('DAILY')
  })

  it('rejects an empty rule', () => {
    expect(() => parseRRule('')).toThrow(RecurrenceRuleError)
  })

  it('rejects a missing FREQ', () => {
    expect(() => parseRRule('INTERVAL=2')).toThrow(/FREQ/)
  })

  it('rejects unsupported FREQ values', () => {
    expect(() => parseRRule('FREQ=YEARLY')).toThrow(/FREQ/)
  })

  it('rejects COUNT combined with UNTIL', () => {
    expect(() => parseRRule('FREQ=WEEKLY;COUNT=4;UNTIL=20260501T000000Z')).toThrow(
      /COUNT and UNTIL/,
    )
  })

  it('rejects BYDAY with non-weekly frequency', () => {
    expect(() => parseRRule('FREQ=DAILY;BYDAY=MO')).toThrow(/BYDAY/)
  })

  it('rejects unsupported RRULE parts', () => {
    expect(() => parseRRule('FREQ=WEEKLY;BYMONTH=1')).toThrow(/BYMONTH/)
  })

  it('rejects invalid interval values', () => {
    expect(() => parseRRule('FREQ=WEEKLY;INTERVAL=0')).toThrow(RecurrenceRuleError)
    expect(() => parseRRule('FREQ=WEEKLY;INTERVAL=-2')).toThrow(RecurrenceRuleError)
    expect(() => parseRRule('FREQ=WEEKLY;INTERVAL=abc')).toThrow(RecurrenceRuleError)
  })
})

describe('validateAndNormalizeRRule', () => {
  it('returns a canonical string that omits default INTERVAL', () => {
    expect(validateAndNormalizeRRule('FREQ=WEEKLY;INTERVAL=1')).toBe('FREQ=WEEKLY')
  })

  it('re-serializes byDay and count together', () => {
    expect(validateAndNormalizeRRule('FREQ=WEEKLY;BYDAY=WE,SU;COUNT=10')).toBe(
      'FREQ=WEEKLY;BYDAY=SU,WE;COUNT=10',
    )
  })

  it('re-serializes UNTIL as ISO 8601', () => {
    expect(validateAndNormalizeRRule('FREQ=MONTHLY;INTERVAL=2;UNTIL=20260601T000000Z')).toBe(
      'FREQ=MONTHLY;INTERVAL=2;UNTIL=2026-06-01T00:00:00.000Z',
    )
  })

  it('throws a RecurrenceRuleError for invalid input', () => {
    expect(() => validateAndNormalizeRRule('FREQ=YEARLY')).toThrow(RecurrenceRuleError)
  })
})

describe('expandOccurrences', () => {
  const dtstart = new Date('2026-05-03T15:00:00.000Z') // Sunday 10am CDT

  it('expands a simple weekly rule into 4 Sundays within a month window', () => {
    const occurrences = expandOccurrences({
      dtstart,
      rule: parseRRule('FREQ=WEEKLY'),
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2026-06-01T00:00:00.000Z'),
    })

    expect(occurrences.map((d) => d.toISOString())).toEqual([
      '2026-05-03T15:00:00.000Z',
      '2026-05-10T15:00:00.000Z',
      '2026-05-17T15:00:00.000Z',
      '2026-05-24T15:00:00.000Z',
      '2026-05-31T15:00:00.000Z',
    ])
  })

  it('expands a weekly rule with BYDAY across the week', () => {
    const occurrences = expandOccurrences({
      dtstart,
      rule: parseRRule('FREQ=WEEKLY;BYDAY=SU,WE'),
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2026-05-20T23:59:59.000Z'),
    })

    expect(occurrences.map((d) => d.toISOString())).toEqual([
      '2026-05-03T15:00:00.000Z', // Sun
      '2026-05-06T15:00:00.000Z', // Wed
      '2026-05-10T15:00:00.000Z',
      '2026-05-13T15:00:00.000Z',
      '2026-05-17T15:00:00.000Z',
      '2026-05-20T15:00:00.000Z',
    ])
  })

  it('skips occurrences before dtstart when BYDAY would otherwise include them', () => {
    const wednesdayStart = new Date('2026-05-06T18:00:00.000Z')
    const occurrences = expandOccurrences({
      dtstart: wednesdayStart,
      rule: parseRRule('FREQ=WEEKLY;BYDAY=SU,WE'),
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2026-05-31T00:00:00.000Z'),
    })

    // The Sunday of the first week (May 3) is before dtstart and must be skipped.
    expect(occurrences.map((d) => d.toISOString())).toEqual([
      '2026-05-06T18:00:00.000Z',
      '2026-05-10T18:00:00.000Z',
      '2026-05-13T18:00:00.000Z',
      '2026-05-17T18:00:00.000Z',
      '2026-05-20T18:00:00.000Z',
      '2026-05-24T18:00:00.000Z',
      '2026-05-27T18:00:00.000Z',
    ])
  })

  it('honors INTERVAL for weekly rules', () => {
    const occurrences = expandOccurrences({
      dtstart,
      rule: parseRRule('FREQ=WEEKLY;INTERVAL=2'),
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2026-06-30T00:00:00.000Z'),
    })

    expect(occurrences.map((d) => d.toISOString())).toEqual([
      '2026-05-03T15:00:00.000Z',
      '2026-05-17T15:00:00.000Z',
      '2026-05-31T15:00:00.000Z',
      '2026-06-14T15:00:00.000Z',
      '2026-06-28T15:00:00.000Z',
    ])
  })

  it('honors COUNT and returns no more than that many occurrences', () => {
    const occurrences = expandOccurrences({
      dtstart,
      rule: parseRRule('FREQ=WEEKLY;COUNT=3'),
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2027-01-01T00:00:00.000Z'),
    })

    expect(occurrences.map((d) => d.toISOString())).toEqual([
      '2026-05-03T15:00:00.000Z',
      '2026-05-10T15:00:00.000Z',
      '2026-05-17T15:00:00.000Z',
    ])
  })

  it('honors COUNT even when earlier occurrences are filtered out of the window', () => {
    const occurrences = expandOccurrences({
      dtstart,
      rule: parseRRule('FREQ=WEEKLY;COUNT=4'),
      windowStart: new Date('2026-05-18T00:00:00.000Z'),
      windowEnd: new Date('2026-06-30T00:00:00.000Z'),
    })

    // COUNT=4 means 4 occurrences total from dtstart; only those on or after
    // windowStart are returned.
    expect(occurrences.map((d) => d.toISOString())).toEqual(['2026-05-24T15:00:00.000Z'])
  })

  it('honors UNTIL as an inclusive ceiling', () => {
    const occurrences = expandOccurrences({
      dtstart,
      rule: parseRRule('FREQ=WEEKLY;UNTIL=20260518T000000Z'),
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2026-06-30T00:00:00.000Z'),
    })

    expect(occurrences.map((d) => d.toISOString())).toEqual([
      '2026-05-03T15:00:00.000Z',
      '2026-05-10T15:00:00.000Z',
      '2026-05-17T15:00:00.000Z',
    ])
  })

  it('expands daily rules with interval', () => {
    const occurrences = expandOccurrences({
      dtstart: new Date('2026-05-01T12:00:00.000Z'),
      rule: parseRRule('FREQ=DAILY;INTERVAL=3'),
      windowStart: new Date('2026-05-01T00:00:00.000Z'),
      windowEnd: new Date('2026-05-15T00:00:00.000Z'),
    })

    expect(occurrences.map((d) => d.toISOString())).toEqual([
      '2026-05-01T12:00:00.000Z',
      '2026-05-04T12:00:00.000Z',
      '2026-05-07T12:00:00.000Z',
      '2026-05-10T12:00:00.000Z',
      '2026-05-13T12:00:00.000Z',
    ])
  })

  it('expands monthly rules and skips months where the day does not exist', () => {
    const occurrences = expandOccurrences({
      dtstart: new Date('2026-01-31T18:00:00.000Z'),
      rule: parseRRule('FREQ=MONTHLY'),
      windowStart: new Date('2026-01-01T00:00:00.000Z'),
      windowEnd: new Date('2026-06-01T00:00:00.000Z'),
    })

    // Feb, Apr, Jun — no "Feb 31" / "Apr 31" / "Jun 31"; those months are
    // skipped and we keep Jan, Mar, May.
    expect(occurrences.map((d) => d.toISOString())).toEqual([
      '2026-01-31T18:00:00.000Z',
      '2026-03-31T18:00:00.000Z',
      '2026-05-31T18:00:00.000Z',
    ])
  })

  it('caps results at maxOccurrences', () => {
    const occurrences = expandOccurrences({
      dtstart,
      rule: parseRRule('FREQ=DAILY'),
      windowStart: new Date('2026-05-03T00:00:00.000Z'),
      windowEnd: new Date('2027-05-03T00:00:00.000Z'),
      maxOccurrences: 5,
    })

    expect(occurrences).toHaveLength(5)
  })

  it('returns an empty array when the window closes before dtstart', () => {
    const occurrences = expandOccurrences({
      dtstart,
      rule: parseRRule('FREQ=WEEKLY'),
      windowStart: new Date('2025-01-01T00:00:00.000Z'),
      windowEnd: new Date('2025-06-01T00:00:00.000Z'),
    })

    expect(occurrences).toEqual([])
  })
})

describe('nextOccurrence', () => {
  const dtstart = new Date('2026-05-03T15:00:00.000Z')

  it('returns dtstart when it is already on or after `from`', () => {
    const next = nextOccurrence(dtstart, parseRRule('FREQ=WEEKLY'), dtstart)
    expect(next?.toISOString()).toBe(dtstart.toISOString())
  })

  it('returns the following weekly occurrence', () => {
    const next = nextOccurrence(
      dtstart,
      parseRRule('FREQ=WEEKLY'),
      new Date('2026-05-04T00:00:00.000Z'),
    )
    expect(next?.toISOString()).toBe('2026-05-10T15:00:00.000Z')
  })

  it('returns null when COUNT has been exhausted before `from`', () => {
    const next = nextOccurrence(
      dtstart,
      parseRRule('FREQ=WEEKLY;COUNT=2'),
      new Date('2026-05-20T00:00:00.000Z'),
    )
    expect(next).toBeNull()
  })

  it('returns null when UNTIL has passed', () => {
    const next = nextOccurrence(
      dtstart,
      parseRRule('FREQ=WEEKLY;UNTIL=20260510T000000Z'),
      new Date('2026-05-11T00:00:00.000Z'),
    )
    expect(next).toBeNull()
  })
})
