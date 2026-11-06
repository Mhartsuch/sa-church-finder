import {
  authRegisterSchema,
  authLoginSchema,
  authForgotPasswordSchema,
  authResetPasswordSchema,
  authVerifyEmailSchema,
} from './auth.schema.js'
import { createReviewSchema, updateReviewSchema, reviewIdSchema } from './review.schema.js'
import {
  deleteAccountSchema,
  updateProfileSchema,
  userReviewsSchema,
  userSavedChurchesSchema,
} from './user.schema.js'

const emptyQuery = {}
const emptyBody = {}

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------
describe('Auth schemas', () => {
  describe('authRegisterSchema', () => {
    const validInput = {
      body: { email: 'test@example.com', password: 'password123', name: 'John Doe' },
    }

    it('accepts valid input', () => {
      const result = authRegisterSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const result = authRegisterSchema.safeParse({
        body: { ...validInput.body, email: 'not-an-email' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects password shorter than 8 characters', () => {
      const result = authRegisterSchema.safeParse({
        body: { ...validInput.body, password: 'short' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects password longer than 72 characters', () => {
      const result = authRegisterSchema.safeParse({
        body: { ...validInput.body, password: 'a'.repeat(73) },
      })
      expect(result.success).toBe(false)
    })

    it('accepts password of exactly 8 characters', () => {
      const result = authRegisterSchema.safeParse({
        body: { ...validInput.body, password: 'a'.repeat(8) },
      })
      expect(result.success).toBe(true)
    })

    it('accepts password of exactly 72 characters', () => {
      const result = authRegisterSchema.safeParse({
        body: { ...validInput.body, password: 'a'.repeat(72) },
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing name', () => {
      const result = authRegisterSchema.safeParse({
        body: { email: 'test@example.com', password: 'password123' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const result = authRegisterSchema.safeParse({
        body: { ...validInput.body, name: '' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects name longer than 100 characters', () => {
      const result = authRegisterSchema.safeParse({
        body: { ...validInput.body, name: 'a'.repeat(101) },
      })
      expect(result.success).toBe(false)
    })

    it('trims and lowercases email', () => {
      const result = authRegisterSchema.safeParse({
        body: { ...validInput.body, email: '  Test@Example.COM  ' },
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.body.email).toBe('test@example.com')
      }
    })
  })

  describe('authLoginSchema', () => {
    const validInput = {
      body: { email: 'test@example.com', password: 'password123' },
    }

    it('accepts valid input', () => {
      const result = authLoginSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const result = authLoginSchema.safeParse({
        body: { email: 'bad-email', password: 'password123' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects short password', () => {
      const result = authLoginSchema.safeParse({
        body: { email: 'test@example.com', password: '1234567' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('authForgotPasswordSchema', () => {
    it('accepts valid email', () => {
      const result = authForgotPasswordSchema.safeParse({
        body: { email: 'test@example.com' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const result = authForgotPasswordSchema.safeParse({
        body: { email: 'not-email' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('authResetPasswordSchema', () => {
    it('accepts valid input', () => {
      const result = authResetPasswordSchema.safeParse({
        body: { token: 'some-reset-token', password: 'newpassword1' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing token', () => {
      const result = authResetPasswordSchema.safeParse({
        body: { password: 'newpassword1' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty token', () => {
      const result = authResetPasswordSchema.safeParse({
        body: { token: '', password: 'newpassword1' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects short password', () => {
      const result = authResetPasswordSchema.safeParse({
        body: { token: 'some-token', password: 'short' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('authVerifyEmailSchema', () => {
    it('accepts valid token', () => {
      const result = authVerifyEmailSchema.safeParse({
        body: { token: 'verification-token-abc' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing token', () => {
      const result = authVerifyEmailSchema.safeParse({
        body: {},
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty token', () => {
      const result = authVerifyEmailSchema.safeParse({
        body: { token: '' },
      })
      expect(result.success).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// Review schemas
// ---------------------------------------------------------------------------
describe('Review schemas', () => {
  const validReviewBody = {
    rating: 4,
    body: 'A'.repeat(10), // exactly min length
  }

  describe('createReviewSchema', () => {
    const validInput = {
      params: { churchId: 'church-1' },
      query: emptyQuery,
      body: validReviewBody,
    }

    it('accepts valid input', () => {
      const result = createReviewSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('accepts rating of 1', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, rating: 1 },
      })
      expect(result.success).toBe(true)
    })

    it('accepts rating of 5', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, rating: 5 },
      })
      expect(result.success).toBe(true)
    })

    it('rejects rating below 1', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, rating: 0 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects rating above 5', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, rating: 6 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer ratings', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, rating: 3.5 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects body shorter than 10 characters', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, body: 'Too short' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects body longer than 2000 characters', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, body: 'A'.repeat(2001) },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateReviewSchema', () => {
    const validInput = {
      params: { id: 'review-1' },
      query: emptyQuery,
      body: { rating: 3 },
    }

    it('accepts valid input with one field', () => {
      const result = updateReviewSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('accepts valid input with body only', () => {
      const result = updateReviewSchema.safeParse({
        ...validInput,
        body: { body: 'A'.repeat(10) },
      })
      expect(result.success).toBe(true)
    })

    it('rejects when no fields are provided', () => {
      const result = updateReviewSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: {},
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid rating', () => {
      const result = updateReviewSchema.safeParse({
        ...validInput,
        body: { rating: 6 },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('reviewIdSchema', () => {
    it('accepts valid id', () => {
      const result = reviewIdSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: emptyBody,
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty id', () => {
      const result = reviewIdSchema.safeParse({
        params: { id: '' },
        query: emptyQuery,
        body: emptyBody,
      })
      expect(result.success).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// User schemas
// ---------------------------------------------------------------------------
describe('User schemas', () => {
  const validInput = {
    params: { id: 'user-1' },
    query: emptyQuery,
    body: emptyBody,
  }

  describe('userSavedChurchesSchema', () => {
    it('accepts valid params id', () => {
      const result = userSavedChurchesSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects empty params id', () => {
      const result = userSavedChurchesSchema.safeParse({
        ...validInput,
        params: { id: '' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing params id', () => {
      const result = userSavedChurchesSchema.safeParse({
        ...validInput,
        params: {},
      })
      expect(result.success).toBe(false)
    })
  })

  describe('userReviewsSchema', () => {
    it('accepts valid params id', () => {
      const result = userReviewsSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects empty params id', () => {
      const result = userReviewsSchema.safeParse({
        ...validInput,
        params: { id: '' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing params id', () => {
      const result = userReviewsSchema.safeParse({
        ...validInput,
        params: {},
      })
      expect(result.success).toBe(false)
    })
  })
  describe('updateProfileSchema', () => {
    it('accepts a trimmed name', () => {
      const result = updateProfileSchema.safeParse({
        params: { id: 'user-1' },
        body: { name: '  Ana ' },
      })
      expect(result.success && result.data.body.name).toBe('Ana')
    })

    it('rejects an empty name', () => {
      const result = updateProfileSchema.safeParse({
        params: { id: 'user-1' },
        body: { name: ' ' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('deleteAccountSchema', () => {
    it('accepts an optional password', () => {
      expect(deleteAccountSchema.safeParse({ params: { id: 'user-1' }, body: {} }).success).toBe(
        true,
      )
      expect(
        deleteAccountSchema.safeParse({ params: { id: 'user-1' }, body: { password: 'x' } })
          .success,
      ).toBe(true)
    })
  })
})
