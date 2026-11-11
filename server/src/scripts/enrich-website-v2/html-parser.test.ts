import { hasAnyData, parsePage, parsePages } from './html-parser.js'

describe('parsePage', () => {
  it('extracts from schema.org JSON-LD', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        {
          "@type": "Church",
          "name": "Grace Church",
          "description": "A welcoming community.",
          "email": "info@grace.example",
          "telephone": "+1-210-555-1234",
          "foundingDate": "1952-06-01",
          "openingHours": ["Su 09:00-10:00", "We 19:00-20:30"],
          "sameAs": [
            "https://facebook.com/grace",
            "https://instagram.com/grace"
          ],
          "employee": [
            { "name": "Rev. Jane Doe", "jobTitle": "Senior Pastor" },
            { "name": "John Smith", "jobTitle": "Worship Leader" }
          ]
        }
        </script>
      </head><body></body></html>
    `
    const result = parsePage(html)
    expect(result.pastorName).toBe('Rev. Jane Doe')
    expect(result.description).toBe('A welcoming community.')
    expect(result.email).toBe('info@grace.example')
    expect(result.phone).toBe('+1-210-555-1234')
    expect(result.yearEstablished).toBe(1952)
    // openingHours are office/building hours, never worship services.
    expect(result.services).toHaveLength(0)
    expect(result.socialLinks.facebook).toContain('facebook.com')
    expect(result.staff).toHaveLength(2)
    expect(result.source).toBe('json-ld')
    expect(result.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('harvests mailto/tel anchors and meta description', () => {
    const html = `
      <html><head>
        <meta name="description" content="Serving San Antonio since 1980.">
      </head><body>
        <a href="mailto:hello@example.church">Email</a>
        <a href="tel:+12105551111">Call</a>
        <a href="https://facebook.com/ourchurch">FB</a>
      </body></html>
    `
    const result = parsePage(html)
    expect(result.email).toBe('hello@example.church')
    expect(result.phone).toBe('+12105551111')
    expect(result.description).toContain('Serving San Antonio')
    expect(result.socialLinks.facebook).toContain('facebook.com')
  })

  it('reads the founding year and accessibility from prose, but never a schedule or pastor', () => {
    const html = `
      <html><body>
        <h1>Welcome</h1>
        <p>Sunday services at 9:00 AM and 11:00 AM.</p>
        <p>Senior Pastor: John Wesley</p>
        <p>Founded in 1985.</p>
        <p>Wheelchair accessible entrance on the east side.</p>
      </body></html>
    `
    const result = parsePage(html)
    // Schedules and names come only from structured data or the reading pass.
    expect(result.services).toHaveLength(0)
    expect(result.pastorName).toBeNull()
    expect(result.yearEstablished).toBe(1985)
    expect(result.amenities.wheelchairAccessible).toBe(true)
  })

  it('detects Spanish service language', () => {
    const html = '<body><p>Join us for our servicio en espa&ntilde;ol at 1:00 PM.</p></body>'
    const result = parsePage(html)
    expect(result.languages).toContain('Spanish')
  })

  it('returns empty-ish data for pages with no signal', () => {
    const result = parsePage('<html><body><p>hello</p></body></html>')
    expect(hasAnyData(result)).toBe(false)
  })
})

describe('parsePages', () => {
  it('merges data across pages, preferring highest-confidence source', () => {
    const homepage = '<body><p>Founded in 1970.</p></body>'
    const about = `
      <body>
        <p>Senior Pastor: Alice Brown</p>
        <p>Sunday services at 10:00 AM</p>
        <a href="mailto:contact@test.church">Contact</a>
      </body>
    `
    const result = parsePages([
      { url: 'https://test.church/', html: homepage },
      { url: 'https://test.church/about', html: about },
    ])
    expect(result.yearEstablished).toBe(1970)
    expect(result.email).toBe('contact@test.church')
  })

  it('does not turn announcements or office hours into weekly services', () => {
    const html = `
      <body>
        <p>All Souls' Day Masses: Monday 8:00 am and 6:30 pm</p>
        <p>Office hours: Monday - Thursday 9:00 AM to 4:00 PM</p>
        <p>God the Father and the Son. Pastor appreciation Sunday is at 10:00 AM.</p>
      </body>
    `
    const result = parsePages([{ url: 'https://x.church/', html }])
    expect(result.services).toHaveLength(0)
    expect(result.pastorName).toBeNull()
  })
})
