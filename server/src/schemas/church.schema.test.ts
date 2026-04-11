import { churchSearchSchema } from './church.schema.js'

describe('churchSearchSchema', () => {
  const parseQuery = (query: Record<string, unknown>): Record<string, unknown> =>
    churchSearchSchema.parse({ query, params: {}, body: {} }).query as Record<string, unknown>

  describe('accessibility & community boolean flags', () => {
    it('coerces the string "true" to boolean true', () => {
      const result = parseQuery({ wheelchairAccessible: 'true' })
      expect(result.wheelchairAccessible).toBe(true)
    })

    it('coerces the string "1" to boolean true', () => {
      const result = parseQuery({ wheelchairAccessible: '1' })
      expect(result.wheelchairAccessible).toBe(true)
    })

    it('accepts a native boolean true', () => {
      const result = parseQuery({ goodForChildren: true })
      expect(result.goodForChildren).toBe(true)
    })

    it('coerces the string "false" to boolean false', () => {
      const result = parseQuery({ goodForGroups: 'false' })
      expect(result.goodForGroups).toBe(false)
    })

    it('leaves missing boolean flags undefined', () => {
      const result = parseQuery({})
      expect(result.wheelchairAccessible).toBeUndefined()
      expect(result.goodForChildren).toBeUndefined()
      expect(result.goodForGroups).toBeUndefined()
    })

    it('rejects non-boolean-ish strings', () => {
      expect(() => parseQuery({ wheelchairAccessible: 'yes' })).toThrow()
    })
  })

  describe('existing query params remain intact', () => {
    it('preserves text and sort filters alongside boolean filters', () => {
      const result = parseQuery({
        q: 'grace',
        denomination: 'catholic',
        sort: 'rating',
        wheelchairAccessible: 'true',
      })

      expect(result).toMatchObject({
        q: 'grace',
        denomination: 'catholic',
        sort: 'rating',
        wheelchairAccessible: true,
      })
    })
  })
})
