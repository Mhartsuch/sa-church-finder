import {
  createVisitSchema,
  updateVisitSchema,
  deleteVisitSchema,
  userVisitsSchema,
} from './visit.schema.js'
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionIdSchema,
  addChurchToCollectionSchema,
  removeChurchFromCollectionSchema,
  userCollectionsSchema,
  userPassportSchema,
} from './collection.schema.js'

describe('visit schemas', () => {
  describe('createVisitSchema', () => {
    const valid = {
      params: { id: 'church-1' },
      body: { visitedAt: '2026-04-10' },
    }

    it('accepts a valid visit with only required fields', () => {
      const result = createVisitSchema.safeParse(valid)
      expect(result.success).toBe(true)
    })

    it('accepts a visit with all optional fields', () => {
      const result = createVisitSchema.safeParse({
        params: { id: 'church-1' },
        body: { visitedAt: '2026-04-10', notes: 'Great service', rating: 5 },
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing visitedAt', () => {
      const result = createVisitSchema.safeParse({
        params: { id: 'church-1' },
        body: {},
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid date format', () => {
      const result = createVisitSchema.safeParse({
        params: { id: 'church-1' },
        body: { visitedAt: '04/10/2026' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects rating below 1', () => {
      const result = createVisitSchema.safeParse({
        params: { id: 'church-1' },
        body: { visitedAt: '2026-04-10', rating: 0 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects rating above 5', () => {
      const result = createVisitSchema.safeParse({
        params: { id: 'church-1' },
        body: { visitedAt: '2026-04-10', rating: 6 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer rating', () => {
      const result = createVisitSchema.safeParse({
        params: { id: 'church-1' },
        body: { visitedAt: '2026-04-10', rating: 3.5 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects notes exceeding 1000 characters', () => {
      const result = createVisitSchema.safeParse({
        params: { id: 'church-1' },
        body: { visitedAt: '2026-04-10', notes: 'x'.repeat(1001) },
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty church id', () => {
      const result = createVisitSchema.safeParse({
        params: { id: '' },
        body: { visitedAt: '2026-04-10' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateVisitSchema', () => {
    it('accepts notes update', () => {
      const result = updateVisitSchema.safeParse({
        params: { id: 'visit-1' },
        body: { notes: 'Updated notes' },
      })
      expect(result.success).toBe(true)
    })

    it('accepts nullable rating', () => {
      const result = updateVisitSchema.safeParse({
        params: { id: 'visit-1' },
        body: { rating: null },
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty body', () => {
      const result = updateVisitSchema.safeParse({
        params: { id: 'visit-1' },
        body: {},
      })
      expect(result.success).toBe(true)
    })
  })

  describe('deleteVisitSchema', () => {
    it('accepts valid params', () => {
      const result = deleteVisitSchema.safeParse({ params: { id: 'visit-1' } })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = deleteVisitSchema.safeParse({ params: { id: '' } })
      expect(result.success).toBe(false)
    })
  })

  describe('userVisitsSchema', () => {
    it('accepts params with pagination', () => {
      const result = userVisitsSchema.safeParse({
        params: { id: 'user-1' },
        query: { page: '2', pageSize: '10' },
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query.page).toBe(2)
        expect(result.data.query.pageSize).toBe(10)
      }
    })

    it('defaults page and pageSize', () => {
      const result = userVisitsSchema.safeParse({
        params: { id: 'user-1' },
        query: {},
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.query.page).toBe(1)
        expect(result.data.query.pageSize).toBe(20)
      }
    })

    it('rejects pageSize above 50', () => {
      const result = userVisitsSchema.safeParse({
        params: { id: 'user-1' },
        query: { pageSize: '51' },
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('collection schemas', () => {
  describe('createCollectionSchema', () => {
    it('accepts a valid collection', () => {
      const result = createCollectionSchema.safeParse({
        body: { name: 'Best Music', description: 'My favorites', isPublic: false },
      })
      expect(result.success).toBe(true)
    })

    it('requires name', () => {
      const result = createCollectionSchema.safeParse({
        body: { description: 'No name' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const result = createCollectionSchema.safeParse({
        body: { name: '   ' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects name exceeding 100 characters', () => {
      const result = createCollectionSchema.safeParse({
        body: { name: 'x'.repeat(101) },
      })
      expect(result.success).toBe(false)
    })

    it('rejects description exceeding 500 characters', () => {
      const result = createCollectionSchema.safeParse({
        body: { name: 'Test', description: 'x'.repeat(501) },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateCollectionSchema', () => {
    it('accepts partial update', () => {
      const result = updateCollectionSchema.safeParse({
        params: { id: 'coll-1' },
        body: { isPublic: false },
      })
      expect(result.success).toBe(true)
    })

    it('accepts nullable description', () => {
      const result = updateCollectionSchema.safeParse({
        params: { id: 'coll-1' },
        body: { description: null },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('collectionIdSchema', () => {
    it('accepts valid id', () => {
      const result = collectionIdSchema.safeParse({ params: { id: 'coll-1' } })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = collectionIdSchema.safeParse({ params: { id: '' } })
      expect(result.success).toBe(false)
    })
  })

  describe('addChurchToCollectionSchema', () => {
    it('accepts valid params with notes', () => {
      const result = addChurchToCollectionSchema.safeParse({
        params: { id: 'coll-1', churchId: 'church-1' },
        body: { notes: 'Amazing choir' },
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty body', () => {
      const result = addChurchToCollectionSchema.safeParse({
        params: { id: 'coll-1', churchId: 'church-1' },
        body: {},
      })
      expect(result.success).toBe(true)
    })

    it('rejects notes exceeding 500 characters', () => {
      const result = addChurchToCollectionSchema.safeParse({
        params: { id: 'coll-1', churchId: 'church-1' },
        body: { notes: 'x'.repeat(501) },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('removeChurchFromCollectionSchema', () => {
    it('accepts valid params', () => {
      const result = removeChurchFromCollectionSchema.safeParse({
        params: { id: 'coll-1', churchId: 'church-1' },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('userCollectionsSchema', () => {
    it('accepts valid user id', () => {
      const result = userCollectionsSchema.safeParse({ params: { id: 'user-1' } })
      expect(result.success).toBe(true)
    })
  })

  describe('userPassportSchema', () => {
    it('accepts valid user id', () => {
      const result = userPassportSchema.safeParse({ params: { id: 'user-1' } })
      expect(result.success).toBe(true)
    })

    it('rejects empty user id', () => {
      const result = userPassportSchema.safeParse({ params: { id: '' } })
      expect(result.success).toBe(false)
    })
  })
})
