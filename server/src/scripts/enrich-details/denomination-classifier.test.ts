import {
  classifyDenomination,
  normalizeDenominationLabel,
  resolveDenomination,
} from './denomination-classifier'

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

  describe('explicit denominational words beat Catholic naming heuristics', () => {
    it.each([
      ['Holy Trinity Presbyterian Church', 'Presbyterian/Reformed'],
      ['The Episcopal Church of the Holy Spirit', 'Anglican/Episcopal'],
      ['Santa Fe Episcopal Church', 'Anglican/Episcopal'],
      ['San Pedro Church of Christ', 'Restoration Movement'],
      ['St Paul Baptist Church', 'Baptist'],
      ["St. Matthew's United Methodist Church", 'Methodist'],
      ['Praise Cathedral Church Of God In Christ', 'Pentecostal'],
      ['Emmanuel AME Church', 'Methodist'],
      ['Grace Orthodox Presbyterian Church', 'Presbyterian/Reformed'],
      ['St. Sophia Greek Orthodox Church', 'Orthodox'],
      ['St George Maronite Catholic Church', 'Catholic'],
    ])('classifies %s → %s', (name, family) => {
      expect(classifyDenomination(name)?.denominationFamily).toBe(family)
    })
  })

  describe('Spanish and Portuguese denominational names', () => {
    it.each([
      ['Iglesia Bautista Cristo Rey', 'Baptist'],
      ['Igreja Batista Atitude em San Antonio', 'Baptist'],
      ['Iglesia de Cristo Atascosa', 'Restoration Movement'],
      ['Alfa y Omega Asamblea De Dios', 'Pentecostal'],
      ['Primera Iglesia Pentecostal Unida San Antonio', 'Pentecostal'],
      ['2a Iglesia Apostolica de la Fe en Cristo Jesus', 'Pentecostal'],
      ['Iglesia Cristiana Metodista Libre', 'Methodist'],
      ['Iglesia Adventista del Séptimo Día Hispana de San Antonio', 'Adventist'],
      ['Salon Del Reino De Los Testigos De Jehova--Apple Valley Spanish', "Jehovah's Witnesses"],
    ])('classifies %s → %s', (name, family) => {
      expect(classifyDenomination(name)?.denominationFamily).toBe(family)
    })

    it('does not read "Jehova" in a Pentecostal church name as Jehovah\'s Witnesses', () => {
      expect(
        classifyDenomination('Iglesia pentecostal Jehova Dios De Los Ejercitos')
          ?.denominationFamily,
      ).toBe('Pentecostal')
    })
  })

  describe('saint names', () => {
    it('treats a distinctly Catholic saint name as Catholic', () => {
      expect(classifyDenomination('St John Berchmans Church')?.denominationFamily).toBe('Catholic')
      expect(classifyDenomination('St. Leo the Great')?.denominationFamily).toBe('Catholic')
      expect(classifyDenomination('st francis of assisi')?.denominationFamily).toBe('Catholic')
    })

    it('leaves saints shared across traditions unclassified', () => {
      expect(classifyDenomination("St. Andrew's Church & School")).toBeNull()
      expect(classifyDenomination("Saint Stephen's Chapel")).toBeNull()
    })
  })

  describe('ambiguous names stay unknown rather than guessed', () => {
    it.each([
      'Cathedral of Faith',
      'All Nations Church - San Antonio',
      'Vietnamese Christian Church',
      'New Covenant Fellowship',
      'Bethany Church',
    ])('returns null for %s', (name) => {
      expect(classifyDenomination(name)).toBeNull()
    })
  })

  describe('normalizeDenominationLabel', () => {
    it('canonicalizes spelling variants', () => {
      expect(normalizeDenominationLabel('Roman Catholic')).toEqual({
        denomination: 'Catholic',
        denominationFamily: 'Catholic',
      })
      expect(normalizeDenominationLabel('Non-Denominational')).toEqual({
        denomination: 'Non-denominational',
        denominationFamily: 'Non-denominational',
      })
    })

    it('keeps a specific label and derives its family', () => {
      expect(normalizeDenominationLabel('Presbyterian Church (USA)')).toEqual({
        denomination: 'Presbyterian Church (USA)',
        denominationFamily: 'Presbyterian/Reformed',
      })
      expect(normalizeDenominationLabel('Cooperative Baptist Fellowship')?.denominationFamily).toBe(
        'Baptist',
      )
    })

    it('returns null for a label it cannot place', () => {
      expect(normalizeDenominationLabel('Greater Works Ministries')).toBeNull()
      expect(normalizeDenominationLabel('  ')).toBeNull()
    })
  })

  describe('resolveDenomination', () => {
    it('clears the legacy "San Antonio" Catholic mislabel', () => {
      expect(
        resolveDenomination({
          name: 'All Nations Church - San Antonio',
          denomination: 'Catholic',
          denominationFamily: 'Catholic',
        }),
      ).toBeNull()
    })

    it('re-labels a mislabelled church from its name', () => {
      expect(
        resolveDenomination({
          name: 'First Baptist Church of San Antonio',
          denomination: 'Catholic',
          denominationFamily: 'Catholic',
        }),
      ).toEqual({ denomination: 'Baptist', denominationFamily: 'Baptist' })
    })

    it('trusts a website-extracted label when the name says nothing', () => {
      expect(
        resolveDenomination({
          name: 'Casa Del Rey Church',
          denomination: 'Assemblies of God',
          denominationFamily: 'Pentecostal',
        }),
      ).toEqual({ denomination: 'Assemblies of God', denominationFamily: 'Pentecostal' })
      expect(
        resolveDenomination({
          name: 'Mary Mother of the Church',
          denomination: 'Roman Catholic',
          denominationFamily: 'Catholic',
        })?.denominationFamily,
      ).toBe('Catholic')
    })

    it('keeps the more specific stored label within the same family', () => {
      expect(
        resolveDenomination({
          name: 'Trinity Baptist Church',
          denomination: 'Southern Baptist',
          denominationFamily: 'Baptist',
        }),
      ).toEqual({ denomination: 'Southern Baptist', denominationFamily: 'Baptist' })
    })

    it('uses the website host when the name is silent', () => {
      expect(
        resolveDenomination({ name: 'Helotes Building', website: 'http://www.lds.org/' })
          ?.denominationFamily,
      ).toBe('Latter-day Saints')
    })

    it('repairs a family that contradicts the stored label', () => {
      expect(
        resolveDenomination({
          name: 'The Promised Land Church',
          denomination: 'Non-denominational',
          denominationFamily: 'Pentecostal',
        })?.denominationFamily,
      ).toBe('Non-denominational')
    })

    it('returns null when nothing is known', () => {
      expect(resolveDenomination({ name: 'The Gathering Place' })).toBeNull()
    })
  })
})
