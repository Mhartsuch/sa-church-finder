import {
  detectNonChurch,
  DuplicateCandidate,
  distanceMeters,
  findDuplicates,
  isJunkDescription,
  normalizeNameForMatch,
} from './listing-quality'

describe('detectNonChurch', () => {
  it.each([
    ['St Pius X Parish Office', 'office'],
    ['Mission San Jose Church Parish Offices', 'office'],
    ['Episcopal Diocese-West Texas', 'office'],
    ['El Carmen Cemetery', 'cemetery'],
    ['O Z Monuments', 'business'],
    ['St. Vincent de Paul Food Pantry', 'charity'],
    ['St. Vincent de Paul Society - El Carmen', 'charity'],
    ['Christian Assistance Ministry', 'charity'],
    ["St. Mark's Catholic Main Gym", 'facility'],
    ['St. Mark the Evangelist West Campus Entrance', 'facility'],
    ['Scottish Rite Cathedral (San Antonio, Texas)', 'facility'],
    ['Henke Hall', 'facility'],
    ['Holy Rosary Convent', 'residence'],
    ['Blue Roof School', 'school'],
    ['Holy Spirit Catholic School', 'school'],
    ['St. George Episcopal School', 'school'],
    ["St. Matthew's UMC Day School", 'school'],
    ['Shearer Hills Early Learning Center', 'school'],
    ['Weekly Bible Study', 'not_a_congregation'],
    ['Rua jacinto pinto', 'not_a_congregation'],
  ])('flags %s as %s', (name, reason) => {
    expect(detectNonChurch(name)).toBe(reason)
  })

  it.each([
    'First Baptist Church of San Antonio',
    'Abiding Presence Lutheran Church and Day School',
    "St. Andrew's Church & School",
    'Shepherd of the Hills Lutheran Church, School, & Child Care',
    'St. Anthony Catholic Church & Hall',
    "Kingdom Hall of Jehovah's Witnesses--Kelly Terrace",
    'The church in San Antonio Meeting Hall',
    'Freedom Life Center',
    'Immaculate Conception Chapel - Oblate School of Theology',
    'Discalced Carmelite Monastery',
    'Mission Concepción',
    'Oblate Missions',
    'Wildfire Network',
  ])('keeps %s', (name) => {
    expect(detectNonChurch(name)).toBeNull()
  })
})

describe('normalizeNameForMatch', () => {
  it('ignores case, accents, punctuation and filler words', () => {
    expect(normalizeNameForMatch('Gateway chapel')).toBe(normalizeNameForMatch('Gateway Chapel'))
    expect(normalizeNameForMatch('The Rock of Revelation Church')).toBe('rock revelation')
    expect(normalizeNameForMatch('Saint Paul’s Episcopal Church')).toBe('st paul s episcopal')
    expect(normalizeNameForMatch('Misión Concepción')).toBe('mision concepcion')
  })
})

describe('findDuplicates', () => {
  const at = (
    id: string,
    name: string,
    lat: number,
    lng: number,
    completeness = 0,
  ): DuplicateCandidate => ({
    id,
    name,
    latitude: lat,
    longitude: lng,
    completeness,
  })

  it('pairs same-named listings within 150 m and keeps the more complete one', () => {
    const duplicates = findDuplicates([
      at('a', 'Gateway chapel', 29.3841, -98.6181, 1),
      at('b', 'Gateway Chapel', 29.3843, -98.6183, 9),
      at('c', 'First Korean Presbyterian Church', 29.49, -98.42, 5),
    ])
    expect([...duplicates]).toEqual([['a', 'b']])
  })

  it('treats same-named churches at different sites as separate congregations', () => {
    const duplicates = findDuplicates([
      at('a', 'Grace Community Church', 29.42, -98.49),
      at('b', 'Grace Community Church', 29.55, -98.6),
    ])
    expect(duplicates.size).toBe(0)
  })

  it('does not pair different churches sharing a building', () => {
    const duplicates = findDuplicates([
      at('a', 'Shavano Baptist Church', 29.58, -98.55),
      at('b', 'Sion Romanian Baptist Church', 29.58, -98.55),
    ])
    expect(duplicates.size).toBe(0)
  })
})

describe('distanceMeters', () => {
  it('measures short distances to within a metre or two', () => {
    const d = distanceMeters(
      { latitude: 29.4241, longitude: -98.4936 },
      { latitude: 29.4251, longitude: -98.4936 },
    )
    expect(d).toBeGreaterThan(109)
    expect(d).toBeLessThan(113)
  })
})

describe('isJunkDescription', () => {
  it.each([
    ['See posts, photos and more on Facebook.', 'MC Church'],
    ['Home | University Presbyterian Church San Antonio', 'University Presbyterian Church'],
    ['Brookhill Baptist Church', 'Brookhill Baptist Church'],
    ['Iglesia La Mies Pagina Web', 'Iglesia Cristiana La Mies'],
    ['BUSCANOS EN FACEBOOK@cristotellamadallas', 'Iglesia El Renuevo'],
    ['Are you free born?', 'Free Born Church'],
    ['My Friend', 'My Friend’s House Christian Fellowship'],
  ])('rejects %s', (description, name) => {
    expect(isJunkDescription(description, name)).toBe(true)
  })

  it('keeps a real description', () => {
    expect(
      isJunkDescription(
        "A Southern Baptist church committed to growing God's family and making every person count.",
        'Shavano Baptist Church',
      ),
    ).toBe(false)
    expect(
      isJunkDescription(
        'A Parish of The Holy Roman Catholic Church',
        'St Rose of Lima Catholic Church',
      ),
    ).toBe(false)
  })
})
