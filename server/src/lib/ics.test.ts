import { buildCalendarFeed, escapeIcsText, foldIcsLine, formatUtcBasic } from './ics.js'

describe('formatUtcBasic', () => {
  it('formats UTC dates into basic iCal form', () => {
    expect(formatUtcBasic(new Date('2026-05-01T14:05:06.000Z'))).toBe('20260501T140506Z')
  })

  it('zero-pads single-digit components', () => {
    expect(formatUtcBasic(new Date('2026-01-02T03:04:05.000Z'))).toBe('20260102T030405Z')
  })
})

describe('escapeIcsText', () => {
  it('escapes backslashes, newlines, commas, and semicolons', () => {
    expect(escapeIcsText('one, two; three\\four\nfive')).toBe('one\\, two\\; three\\\\four\\nfive')
  })

  it('collapses CRLF newlines', () => {
    expect(escapeIcsText('line1\r\nline2')).toBe('line1\\nline2')
  })
})

describe('foldIcsLine', () => {
  it('leaves short lines unchanged', () => {
    expect(foldIcsLine('SUMMARY:short')).toBe('SUMMARY:short')
  })

  it('folds lines longer than 73 characters with CRLF + space', () => {
    const content = 'x'.repeat(200)
    const line = `DESCRIPTION:${content}`
    const folded = foldIcsLine(line)
    expect(folded.split('\r\n').length).toBeGreaterThan(1)
    // Every continuation line starts with a single leading space per RFC 5545.
    const continuations = folded.split('\r\n').slice(1)
    for (const part of continuations) {
      expect(part.startsWith(' ')).toBe(true)
    }
  })
})

describe('buildCalendarFeed', () => {
  const now = new Date('2026-04-15T00:00:00.000Z')

  it('emits a well-formed ICS document with VCALENDAR wrapper', () => {
    const ics = buildCalendarFeed({
      calendarName: 'Grace Church — Events',
      events: [
        {
          id: 'evt-1',
          title: 'Sunday Worship',
          description: null,
          eventType: 'service',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
          endTime: new Date('2026-05-03T15:30:00.000Z'),
          location: '1234 Broadway, San Antonio, TX',
          url: 'https://sachurchfinder.com/churches/grace-church',
          isRecurring: false,
          recurrenceRule: null,
          updatedAt: new Date('2026-04-10T10:00:00.000Z'),
        },
      ],
      now,
    })

    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).toMatch(/PRODID:-\/\/SA Church Finder\/\/Events\/\/EN/)
    expect(ics).toMatch(/X-WR-CALNAME:Grace Church — Events/)
    expect(ics).toMatch(/BEGIN:VEVENT/)
    expect(ics).toMatch(/END:VEVENT/)
    expect(ics).toMatch(/UID:evt-1@sachurchfinder\.com/)
    expect(ics).toMatch(/DTSTART:20260503T140000Z/)
    expect(ics).toMatch(/DTEND:20260503T153000Z/)
    expect(ics).toMatch(/DTSTAMP:20260410T100000Z/)
    expect(ics).toMatch(/SUMMARY:Sunday Worship/)
    expect(ics).toMatch(/LOCATION:1234 Broadway\\, San Antonio\\, TX/)
    expect(ics).toMatch(/URL:https:\/\/sachurchfinder\.com\/churches\/grace-church/)
    expect(ics).toMatch(/CATEGORIES:SERVICE/)
  })

  it('emits RRULE for recurring events', () => {
    const ics = buildCalendarFeed({
      calendarName: 'Grace',
      events: [
        {
          id: 'evt-recur',
          title: 'Weekly study',
          description: 'Every Wed at 7pm',
          startTime: new Date('2026-04-15T00:00:00.000Z'),
          endTime: null,
          isRecurring: true,
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=WE',
        },
      ],
      now,
    })
    expect(ics).toMatch(/RRULE:FREQ=WEEKLY;BYDAY=WE/)
  })

  it('strips a leading RRULE: prefix from stored rules', () => {
    const ics = buildCalendarFeed({
      calendarName: 'Grace',
      events: [
        {
          id: 'evt-recur',
          title: 'Series',
          startTime: new Date('2026-04-15T00:00:00.000Z'),
          isRecurring: true,
          recurrenceRule: 'RRULE:FREQ=DAILY;INTERVAL=2',
        },
      ],
      now,
    })
    expect(ics).toMatch(/\r\nRRULE:FREQ=DAILY;INTERVAL=2\r\n/)
    expect(ics).not.toMatch(/RRULE:RRULE:/)
  })

  it('defaults DTEND to start + 1 hour when endTime is missing', () => {
    const ics = buildCalendarFeed({
      calendarName: 'Grace',
      events: [
        {
          id: 'evt-noend',
          title: 'Pop up',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
          endTime: null,
        },
      ],
      now,
    })
    expect(ics).toMatch(/DTSTART:20260503T140000Z/)
    expect(ics).toMatch(/DTEND:20260503T150000Z/)
  })

  it('falls back to now for DTSTAMP when updatedAt is omitted', () => {
    const ics = buildCalendarFeed({
      calendarName: 'Grace',
      events: [
        {
          id: 'evt-fresh',
          title: 'New',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
        },
      ],
      now,
    })
    expect(ics).toMatch(/DTSTAMP:20260415T000000Z/)
  })

  it('uses CRLF line endings', () => {
    const ics = buildCalendarFeed({
      calendarName: 'Grace',
      events: [
        {
          id: 'evt-1',
          title: 'One',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
        },
      ],
      now,
    })
    expect(ics.includes('\r\n')).toBe(true)
    // No bare LF (without CR prefix) should survive.
    const withoutCrlf = ics.replace(/\r\n/g, '')
    expect(withoutCrlf.includes('\n')).toBe(false)
  })

  it('ignores invalid endTime that predates startTime', () => {
    const ics = buildCalendarFeed({
      calendarName: 'Grace',
      events: [
        {
          id: 'evt-bad',
          title: 'Backwards',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
          endTime: new Date('2026-05-03T13:00:00.000Z'),
        },
      ],
      now,
    })
    expect(ics).toMatch(/DTSTART:20260503T140000Z/)
    expect(ics).toMatch(/DTEND:20260503T150000Z/)
  })
})
