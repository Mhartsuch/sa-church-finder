import { cleanWebsiteUrl, normalizeChurchName } from './normalizers'

describe('normalizeChurchName', () => {
  it.each([
    ['ARABIC BAPTIST CHURCH OF SAN ANTONIO', 'Arabic Baptist Church of San Antonio'],
    [
      'IGLESIA MISIÓN CRISTIANA EL RENUEVO SAN ANTONIO',
      'Iglesia Misión Cristiana el Renuevo San Antonio',
    ],
    ['MÁS VIDA IGLESIA CRISTIANA', 'Más Vida Iglesia Cristiana'],
    ['GRACE TRUTH & GRACIA VERDAD', 'Grace Truth & Gracia Verdad'],
    ['st francis of assisi', 'St Francis of Assisi'],
    ['laurel street church of christ', 'Laurel Street Church of Christ'],
    ['little church la villita san antonio tx', 'Little Church la Villita San Antonio TX'],
    ['sold out believers cf', 'Sold Out Believers CF'],
    ['THE ROCK', 'The Rock'],
  ])('title-cases %s', (input, expected) => {
    expect(normalizeChurchName(input)).toBe(expected)
  })

  it.each([
    'CrossingPoint Church',
    'ct|church (Calvary Temple Assembly of God)',
    'NorthRock Church',
    'RCCG, Salvation Center San Antonio',
    "St. Mary's Catholic Church",
    'CRC',
    'SABA',
  ])('leaves deliberate styling alone: %s', (name) => {
    expect(normalizeChurchName(name)).toBe(name)
  })

  it('collapses stray whitespace', () => {
    expect(normalizeChurchName('  Grace   Church ')).toBe('Grace Church')
  })
})

describe('cleanWebsiteUrl', () => {
  it('strips tracking parameters and keeps real ones', () => {
    expect(
      cleanWebsiteUrl(
        'http://www.fbcsa.org/?utm_source=google&utm_medium=seacr&utm_campaign=local',
      ),
    ).toBe('http://www.fbcsa.org/')
    expect(cleanWebsiteUrl('https://example.org/visit?campus=north&fbclid=abc123')).toBe(
      'https://example.org/visit?campus=north',
    )
  })

  it('leaves a clean URL unchanged', () => {
    expect(cleanWebsiteUrl('https://www.trinitysa.org/')).toBe('https://www.trinitysa.org/')
  })

  it('rejects anything that is not an http(s) link', () => {
    expect(cleanWebsiteUrl('javascript:alert(1)')).toBeNull()
    expect(cleanWebsiteUrl('not a url')).toBeNull()
    expect(cleanWebsiteUrl(null)).toBeNull()
  })
})
