import { getNeighborhood } from './neighborhood-mapper'

describe('getNeighborhood', () => {
  it('maps San Antonio zip codes to their area', () => {
    expect(getNeighborhood('78205', 'San Antonio')).toBe('Downtown')
    expect(getNeighborhood('78209', 'San Antonio')).toBe('Alamo Heights')
    expect(getNeighborhood('78258')).toBe('Stone Oak')
  })

  it('uses one spelling for the East Side', () => {
    expect(getNeighborhood('78202')).toBe('East Side')
    expect(getNeighborhood('78220')).toBe('East Side')
  })

  it('prefers an incorporated suburb over the shared zip code', () => {
    expect(getNeighborhood('78218', 'Windcrest')).toBe('Windcrest')
    expect(getNeighborhood('78233', 'Live Oak')).toBe('Live Oak')
    expect(getNeighborhood('78154', 'Selma')).toBe('Selma')
    expect(getNeighborhood('78213', 'Castle Hills')).toBe('Castle Hills')
  })

  it('normalizes military base city names', () => {
    expect(getNeighborhood('78236', 'Lackland Air Force Base')).toBe('Lackland AFB')
  })

  it('ignores a postal city outside the metro and falls back to the zip', () => {
    expect(getNeighborhood('78216', 'Alba')).toBe('Airport Area')
  })

  it('returns null for an unknown zip with no usable city', () => {
    expect(getNeighborhood('99999')).toBeNull()
    expect(getNeighborhood('99999', 'San Antonio')).toBeNull()
  })
})
