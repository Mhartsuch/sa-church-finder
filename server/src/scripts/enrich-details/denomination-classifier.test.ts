import { classifyDenomination } from './denomination-classifier'

describe('classifyDenomination', () => {
  describe('Latter-day Saints (must win over the Spanish saint-name rule)', () => {
    it('classifies the San Antonio LDS temple as Latter-day Saints, not Catholic', () => {
      const result = classifyDenomination('San Antonio Texas Temple')
      expect(result).toEqual({
        denomination: 'Church of Jesus Christ of Latter-day Saints',
        denominationFamily: 'Latter-day Saints',
      })
    })

    it('classifies LDS meetinghouses by full name', () => {
      const result = classifyDenomination('The Church of Jesus Christ of Latter-day Saints')
      expect(result?.denominationFamily).toBe('Latter-day Saints')
    })

    it('classifies "LDS" and "Mormon" markers', () => {
      expect(classifyDenomination('LDS Chapel')?.denominationFamily).toBe('Latter-day Saints')
      expect(classifyDenomination('Mormon Church')?.denominationFamily).toBe('Latter-day Saints')
    })
  })

  describe("Jehovah's Witnesses (must win over broader rules)", () => {
    it('classifies Kingdom Halls', () => {
      const result = classifyDenomination('Kingdom Hall of Jehovah’s Witnesses')
      expect(result?.denominationFamily).toBe("Jehovah's Witnesses")
    })
  })

  describe('Spanish saint-name rule scoped to saints, not the city', () => {
    it('does not classify a church as Catholic just because "San Antonio" is in its name', () => {
      const result = classifyDenomination('Community Bible Church of San Antonio')
      expect(result?.denominationFamily).toBe('Non-denominational')
    })

    it('leaves "San Antonio" alone when no other rule matches', () => {
      expect(classifyDenomination('Grace Fellowship of San Antonio')).toBeNull()
    })

    it('still classifies the saint "San Antonio de Padua" as Catholic', () => {
      const result = classifyDenomination('San Antonio de Padua Church')
      expect(result?.denominationFamily).toBe('Catholic')
    })

    it('still classifies other Spanish saint names as Catholic', () => {
      expect(classifyDenomination('San Fernando Cathedral')?.denominationFamily).toBe('Catholic')
      expect(classifyDenomination('Santa Rosa de Lima')?.denominationFamily).toBe('Catholic')
      expect(classifyDenomination('Santo Niño Church')?.denominationFamily).toBe('Catholic')
    })
  })

  describe('existing rules still hold', () => {
    it.each([
      ['St. Mark Catholic Church', 'Catholic'],
      ['First Baptist Church', 'Baptist'],
      ['Alamo Heights United Methodist Church', 'Methodist'],
      ['Grace Lutheran Church', 'Lutheran'],
      ['First Presbyterian Church', 'Presbyterian/Reformed'],
      ['Abundant Life Assembly of God', 'Pentecostal'],
      ['Northside Church of Christ', 'Restoration Movement'],
      ['San Antonio Seventh-day Adventist Church', 'Adventist'],
    ])('classifies %s → %s', (name, family) => {
      expect(classifyDenomination(name)?.denominationFamily).toBe(family)
    })

    it('returns null for unrecognizable names', () => {
      expect(classifyDenomination('The Gathering Place')).toBeNull()
    })
  })
})
