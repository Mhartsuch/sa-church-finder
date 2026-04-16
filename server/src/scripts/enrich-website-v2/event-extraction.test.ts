import { parsePage } from './html-parser.js'

describe('event extraction', () => {
  const futureIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const pastIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  it('pulls future events out of JSON-LD Event objects', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        [
          {
            "@type": "Event",
            "name": "Easter Sunday Service",
            "startDate": "${futureIso}",
            "description": "Join us for a special celebration.",
            "location": { "name": "Main Sanctuary" },
            "url": "https://example.church/events/easter"
          }
        ]
        </script>
      </head><body></body></html>
    `
    const result = parsePage(html)
    expect(result.events).toHaveLength(1)
    const ev = result.events[0]
    expect(ev.title).toBe('Easter Sunday Service')
    expect(ev.locationOverride).toBe('Main Sanctuary')
    expect(ev.sourceUrl).toBe('https://example.church/events/easter')
    expect(new Date(ev.startTime).getTime()).toBeCloseTo(new Date(futureIso).getTime(), -3)
  })

  it('filters past events', () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
        {
          "@type": "Event",
          "name": "Last Year's Retreat",
          "startDate": "${pastIso}"
        }
        </script>
      </head><body></body></html>
    `
    const result = parsePage(html)
    expect(result.events).toHaveLength(0)
  })

  it('handles Event in an @graph array alongside a Church object', () => {
    const html = `
      <script type="application/ld+json">
      [
        { "@type": "Church", "name": "Hope Church", "openingHours": "Su 10:00-11:00" },
        { "@type": "Event", "name": "Men's Breakfast", "startDate": "${futureIso}" }
      ]
      </script>
    `
    const result = parsePage(html)
    expect(result.events).toHaveLength(1)
    expect(result.events[0].title).toBe("Men's Breakfast")
    expect(result.services.length).toBeGreaterThan(0)
  })
})

describe('ministry + affiliation harvesting', () => {
  it('detects common ministry keywords', () => {
    const html = `
      <body>
        <h2>Ministries</h2>
        <ul>
          <li>Celebrate Recovery — Friday nights</li>
          <li>AWANA for kids</li>
          <li>Women's Bible Study</li>
          <li>Men's Ministry breakfasts</li>
        </ul>
      </body>
    `
    const result = parsePage(html)
    expect(result.ministries).toEqual(
      expect.arrayContaining(['Celebrate Recovery', 'AWANA', "Women's Ministry", "Men's Ministry"]),
    )
  })

  it('detects denominational affiliations by name or abbreviation', () => {
    const html = '<body><p>We are affiliated with the Southern Baptist Convention (SBC).</p></body>'
    const result = parsePage(html)
    expect(result.affiliations).toContain('Southern Baptist Convention')
  })

  it('picks up service style hints', () => {
    const html = '<body><p>Join our contemporary worship service at 10am.</p></body>'
    const result = parsePage(html)
    expect(result.serviceStyle).toBe('Contemporary')
  })

  it('finds sermon/livestream/giving/visit URLs from nav links', () => {
    const html = `
      <nav></nav>
      <body>
        <a href="/sermons">Sermons</a>
        <a href="/watch-live">Watch Live</a>
        <a href="/give">Give</a>
        <a href="/plan-your-visit">Plan Your Visit</a>
        <a href="/what-we-believe">What We Believe</a>
      </body>
    `
    const result = parsePage(html, 'https://example.church/')
    expect(result.sermonUrl).toContain('/sermons')
    expect(result.livestreamUrl).toContain('/watch-live')
    expect(result.givingUrl).toContain('/give')
    expect(result.newVisitorUrl).toContain('/plan-your-visit')
    expect(result.statementOfFaithUrl).toContain('/what-we-believe')
  })
})
