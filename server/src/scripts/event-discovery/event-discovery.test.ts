import crypto from 'node:crypto'

import { extractTextFromHtml, findEventPageUrls } from './website-fetcher.js'
import { parseEventsFromResponse } from './event-extractor.js'

describe('extractTextFromHtml', () => {
  it('strips script and style tags', () => {
    const html = `
      <html>
        <head><style>.foo { color: red; }</style></head>
        <body>
          <script>alert('hi')</script>
          <p>Hello World</p>
        </body>
      </html>
    `
    const text = extractTextFromHtml(html)
    expect(text).toContain('Hello World')
    expect(text).not.toContain('alert')
    expect(text).not.toContain('.foo')
  })

  it('converts block elements to newlines', () => {
    const html = '<div>First</div><p>Second</p><h1>Third</h1>'
    const text = extractTextFromHtml(html)
    expect(text).toContain('First')
    expect(text).toContain('Second')
    expect(text).toContain('Third')
  })

  it('decodes HTML entities', () => {
    const html = '<p>Tom &amp; Jerry &lt;3 &quot;movies&quot;</p>'
    const text = extractTextFromHtml(html)
    expect(text).toContain('Tom & Jerry <3 "movies"')
  })

  it('collapses excessive whitespace', () => {
    const html = '<p>Hello     World</p>\n\n\n\n<p>Goodbye</p>'
    const text = extractTextFromHtml(html)
    expect(text).not.toMatch(/\n{3,}/)
    expect(text).not.toMatch(/  +/)
  })

  it('returns empty string for empty HTML', () => {
    expect(extractTextFromHtml('')).toBe('')
  })

  it('removes HTML comments', () => {
    const html = '<p>Visible</p><!-- This is a comment --><p>Also visible</p>'
    const text = extractTextFromHtml(html)
    expect(text).toContain('Visible')
    expect(text).toContain('Also visible')
    expect(text).not.toContain('comment')
  })
})

describe('findEventPageUrls', () => {
  const baseUrl = 'https://example-church.org'

  it('finds event-related links', () => {
    const html = `
      <a href="/events">Events</a>
      <a href="/calendar">Calendar</a>
      <a href="/about">About</a>
    `
    const urls = findEventPageUrls(html, baseUrl)
    expect(urls).toContain('https://example-church.org/events')
    expect(urls).toContain('https://example-church.org/calendar')
    expect(urls).not.toContain('https://example-church.org/about')
  })

  it('handles various event path patterns', () => {
    const html = `
      <a href="/upcoming-events">Upcoming</a>
      <a href="/schedule">Schedule</a>
      <a href="/activities">Activities</a>
      <a href="/whats-happening">What's Happening</a>
    `
    const urls = findEventPageUrls(html, baseUrl)
    expect(urls).toHaveLength(4)
  })

  it('excludes external links and social media', () => {
    const html = `
      <a href="https://facebook.com/events/123">FB Event</a>
      <a href="https://other-site.com/events">Other Events</a>
      <a href="/events">Our Events</a>
    `
    const urls = findEventPageUrls(html, baseUrl)
    expect(urls).toHaveLength(1)
    expect(urls[0]).toBe('https://example-church.org/events')
  })

  it('excludes mailto, tel, and anchor links', () => {
    const html = `
      <a href="mailto:events@church.org">Email</a>
      <a href="tel:555-1234">Call</a>
      <a href="#events">Jump</a>
      <a href="/events">Events</a>
    `
    const urls = findEventPageUrls(html, baseUrl)
    expect(urls).toHaveLength(1)
  })

  it('excludes file downloads', () => {
    const html = `
      <a href="/events/flyer.pdf">Download Flyer</a>
      <a href="/events">Events</a>
    `
    const urls = findEventPageUrls(html, baseUrl)
    expect(urls).toHaveLength(1)
    expect(urls[0]).toBe('https://example-church.org/events')
  })

  it('deduplicates URLs', () => {
    const html = `
      <a href="/events">Events</a>
      <a href="/events">Events Again</a>
    `
    const urls = findEventPageUrls(html, baseUrl)
    expect(urls).toHaveLength(1)
  })

  it('resolves relative URLs', () => {
    const html = '<a href="../events/upcoming">Events</a>'
    const urls = findEventPageUrls(html, 'https://example-church.org/pages/info')
    expect(urls[0]).toBe('https://example-church.org/events/upcoming')
  })
})

describe('parseEventsFromResponse', () => {
  it('parses valid JSON array of events', () => {
    const response = JSON.stringify([
      {
        title: 'Sunday Worship',
        description: 'Join us for worship',
        eventType: 'service',
        startDate: '2026-04-20',
        startTime: '10:00',
        endDate: null,
        endTime: '11:30',
        location: null,
        isRecurring: true,
        recurrenceDescription: 'Every Sunday',
      },
    ])
    const events = parseEventsFromResponse(response)
    expect(events).toHaveLength(1)
    expect(events[0].title).toBe('Sunday Worship')
    expect(events[0].eventType).toBe('service')
  })

  it('handles markdown code block wrapping', () => {
    const response =
      '```json\n[{"title":"VBS","eventType":"youth","startDate":"2026-06-15","startTime":null,"endDate":null,"endTime":null,"description":"Vacation Bible School","location":null,"isRecurring":false,"recurrenceDescription":null}]\n```'
    const events = parseEventsFromResponse(response)
    expect(events).toHaveLength(1)
    expect(events[0].title).toBe('VBS')
  })

  it('returns empty array for empty JSON array', () => {
    const events = parseEventsFromResponse('[]')
    expect(events).toHaveLength(0)
  })

  it('filters out invalid events', () => {
    const response = JSON.stringify([
      { title: 'Valid Event', eventType: 'community', startDate: '2026-05-01' },
      { title: '', eventType: 'service', startDate: '2026-05-01' },
      { title: 'No Date', eventType: 'service' },
      { title: 'Bad Type', eventType: 'unknown', startDate: '2026-05-01' },
      null,
      42,
    ])
    const events = parseEventsFromResponse(response)
    expect(events).toHaveLength(1)
    expect(events[0].title).toBe('Valid Event')
  })

  it('throws on invalid JSON', () => {
    expect(() => parseEventsFromResponse('not json')).toThrow()
  })

  it('returns empty array for non-array JSON', () => {
    const events = parseEventsFromResponse('{"title": "not an array"}')
    expect(events).toHaveLength(0)
  })
})

describe('generateSourceHash', () => {
  // Re-implement the hash function here for testing since it's not exported
  function generateSourceHash(churchId: string, title: string, startDate: string): string {
    const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, ' ')
    const dateOnly = startDate.split('T')[0]
    const input = `${churchId}:${normalizedTitle}:${dateOnly}`
    return crypto.createHash('sha256').update(input).digest('hex')
  }

  it('produces consistent hashes', () => {
    const hash1 = generateSourceHash('church-1', 'Sunday Worship', '2026-04-20')
    const hash2 = generateSourceHash('church-1', 'Sunday Worship', '2026-04-20')
    expect(hash1).toBe(hash2)
  })

  it('normalizes title case', () => {
    const hash1 = generateSourceHash('church-1', 'Sunday Worship', '2026-04-20')
    const hash2 = generateSourceHash('church-1', 'sunday worship', '2026-04-20')
    expect(hash1).toBe(hash2)
  })

  it('normalizes whitespace', () => {
    const hash1 = generateSourceHash('church-1', 'Sunday  Worship', '2026-04-20')
    const hash2 = generateSourceHash('church-1', 'Sunday Worship', '2026-04-20')
    expect(hash1).toBe(hash2)
  })

  it('strips time from date', () => {
    const hash1 = generateSourceHash('church-1', 'Event', '2026-04-20T10:00:00')
    const hash2 = generateSourceHash('church-1', 'Event', '2026-04-20')
    expect(hash1).toBe(hash2)
  })

  it('produces different hashes for different inputs', () => {
    const hash1 = generateSourceHash('church-1', 'Event A', '2026-04-20')
    const hash2 = generateSourceHash('church-1', 'Event B', '2026-04-20')
    const hash3 = generateSourceHash('church-2', 'Event A', '2026-04-20')
    expect(hash1).not.toBe(hash2)
    expect(hash1).not.toBe(hash3)
  })
})
