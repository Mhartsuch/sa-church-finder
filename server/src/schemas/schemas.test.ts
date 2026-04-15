import {
  authRegisterSchema,
  authLoginSchema,
  authForgotPasswordSchema,
  authResetPasswordSchema,
  authVerifyEmailSchema,
} from './auth.schema.js'
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  resolveFlaggedReviewSchema,
  reviewResponseSchema,
} from './review.schema.js'
import { createChurchClaimSchema, resolveChurchClaimSchema } from './claim.schema.js'
import {
  createChurchServiceSchema,
  updateChurchServiceSchema,
} from './church-service.schema.js'
import {
  createChurchEventSchema,
  updateChurchEventSchema,
  eventsFeedSchema,
} from './event.schema.js'
import { userSavedChurchesSchema, userReviewsSchema, userClaimsSchema } from './user.schema.js'

const emptyQuery = {}
const emptyBody = {}
const emptyParams = {}

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
    body: 'A'.repeat(50), // exactly min length
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

    it('accepts rating in 0.5 increments (e.g. 3.5)', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, rating: 3.5 },
      })
      expect(result.success).toBe(true)
    })

    it('rejects rating below 1', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, rating: 0.5 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects rating above 5', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, rating: 5.5 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects rating not in 0.5 increments (e.g. 2.3)', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, rating: 2.3 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects body shorter than 50 characters', () => {
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

    it('accepts optional category ratings as integers 1-5', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: {
          ...validReviewBody,
          welcomeRating: 5,
          worshipRating: 1,
          sermonRating: 3,
          facilitiesRating: 4,
        },
      })
      expect(result.success).toBe(true)
    })

    it('accepts null category ratings', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: {
          ...validReviewBody,
          welcomeRating: null,
          worshipRating: null,
        },
      })
      expect(result.success).toBe(true)
    })

    it('rejects category rating of 0', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, welcomeRating: 0 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects category rating above 5', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, welcomeRating: 6 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer category rating', () => {
      const result = createReviewSchema.safeParse({
        ...validInput,
        body: { ...validReviewBody, welcomeRating: 3.5 },
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
        body: { body: 'A'.repeat(50) },
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

  describe('resolveFlaggedReviewSchema', () => {
    it('accepts "approved" status', () => {
      const result = resolveFlaggedReviewSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: { status: 'approved' },
      })
      expect(result.success).toBe(true)
    })

    it('accepts "removed" status', () => {
      const result = resolveFlaggedReviewSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: { status: 'removed' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid status', () => {
      const result = resolveFlaggedReviewSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: { status: 'pending' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('reviewResponseSchema', () => {
    it('accepts valid response body', () => {
      const result = reviewResponseSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: { body: 'Thank you for the review!' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty response body', () => {
      const result = reviewResponseSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: { body: '' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects response body longer than 2000 characters', () => {
      const result = reviewResponseSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: { body: 'A'.repeat(2001) },
      })
      expect(result.success).toBe(false)
    })

    it('accepts response body of exactly 1 character', () => {
      const result = reviewResponseSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: { body: 'x' },
      })
      expect(result.success).toBe(true)
    })

    it('accepts response body of exactly 2000 characters', () => {
      const result = reviewResponseSchema.safeParse({
        params: { id: 'review-1' },
        query: emptyQuery,
        body: { body: 'A'.repeat(2000) },
      })
      expect(result.success).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// Claim schemas
// ---------------------------------------------------------------------------
describe('Claim schemas', () => {
  describe('createChurchClaimSchema', () => {
    const validInput = {
      params: { id: 'church-1' },
      query: emptyQuery,
      body: {
        roleTitle: 'Pastor',
        verificationEmail: 'pastor@church.org',
      },
    }

    it('accepts valid input', () => {
      const result = createChurchClaimSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects roleTitle shorter than 2 characters', () => {
      const result = createChurchClaimSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, roleTitle: 'A' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects roleTitle longer than 120 characters', () => {
      const result = createChurchClaimSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, roleTitle: 'A'.repeat(121) },
      })
      expect(result.success).toBe(false)
    })

    it('accepts roleTitle of exactly 2 characters', () => {
      const result = createChurchClaimSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, roleTitle: 'Sr' },
      })
      expect(result.success).toBe(true)
    })

    it('accepts roleTitle of exactly 120 characters', () => {
      const result = createChurchClaimSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, roleTitle: 'A'.repeat(120) },
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid verificationEmail', () => {
      const result = createChurchClaimSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, verificationEmail: 'not-an-email' },
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid verificationEmail', () => {
      const result = createChurchClaimSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, verificationEmail: 'admin@example.org' },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('resolveChurchClaimSchema', () => {
    it('accepts "approved" status', () => {
      const result = resolveChurchClaimSchema.safeParse({
        params: { id: 'claim-1' },
        query: emptyQuery,
        body: { status: 'approved' },
      })
      expect(result.success).toBe(true)
    })

    it('accepts "rejected" status', () => {
      const result = resolveChurchClaimSchema.safeParse({
        params: { id: 'claim-1' },
        query: emptyQuery,
        body: { status: 'rejected' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid status', () => {
      const result = resolveChurchClaimSchema.safeParse({
        params: { id: 'claim-1' },
        query: emptyQuery,
        body: { status: 'pending' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects "removed" as status (not a valid option)', () => {
      const result = resolveChurchClaimSchema.safeParse({
        params: { id: 'claim-1' },
        query: emptyQuery,
        body: { status: 'removed' },
      })
      expect(result.success).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// Church Service schemas
// ---------------------------------------------------------------------------
describe('Church Service schemas', () => {
  describe('createChurchServiceSchema', () => {
    const validInput = {
      params: { churchId: 'church-1' },
      query: emptyQuery,
      body: {
        dayOfWeek: 0,
        startTime: '09:00',
        serviceType: 'Sunday Worship',
      },
    }

    it('accepts valid input', () => {
      const result = createChurchServiceSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('accepts dayOfWeek 0 (Sunday)', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, dayOfWeek: 0 },
      })
      expect(result.success).toBe(true)
    })

    it('accepts dayOfWeek 6 (Saturday)', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, dayOfWeek: 6 },
      })
      expect(result.success).toBe(true)
    })

    it('rejects dayOfWeek below 0', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, dayOfWeek: -1 },
      })
      expect(result.success).toBe(false)
    })

    it('rejects dayOfWeek above 6', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, dayOfWeek: 7 },
      })
      expect(result.success).toBe(false)
    })

    it('accepts startTime in HH:MM format', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, startTime: '14:30' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects startTime not in HH:MM format', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, startTime: '9:00' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects startTime with seconds', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, startTime: '09:00:00' },
      })
      expect(result.success).toBe(false)
    })

    it('requires serviceType', () => {
      const { serviceType: _serviceType, ...bodyWithout } = validInput.body
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: bodyWithout,
      })
      expect(result.success).toBe(false)
    })

    it('rejects serviceType longer than 100 characters', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, serviceType: 'A'.repeat(101) },
      })
      expect(result.success).toBe(false)
    })

    it('accepts optional endTime in HH:MM format', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, endTime: '10:30' },
      })
      expect(result.success).toBe(true)
    })

    it('accepts null endTime', () => {
      const result = createChurchServiceSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, endTime: null },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('updateChurchServiceSchema', () => {
    const baseInput = {
      params: { id: 'service-1' },
      query: emptyQuery,
    }

    it('accepts valid input with one field', () => {
      const result = updateChurchServiceSchema.safeParse({
        ...baseInput,
        body: { dayOfWeek: 3 },
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid input with multiple fields', () => {
      const result = updateChurchServiceSchema.safeParse({
        ...baseInput,
        body: { dayOfWeek: 1, startTime: '10:00', serviceType: 'Morning Prayer' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects when no fields are provided', () => {
      const result = updateChurchServiceSchema.safeParse({
        ...baseInput,
        body: {},
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid startTime format', () => {
      const result = updateChurchServiceSchema.safeParse({
        ...baseInput,
        body: { startTime: 'bad' },
      })
      expect(result.success).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// Event schemas
// ---------------------------------------------------------------------------
describe('Event schemas', () => {
  const futureStart = '2026-06-01T10:00:00Z'
  const futureEnd = '2026-06-01T12:00:00Z'

  describe('createChurchEventSchema', () => {
    const validInput = {
      params: { churchId: 'church-1' },
      query: emptyQuery,
      body: {
        title: 'Community Breakfast',
        eventType: 'community' as const,
        startTime: futureStart,
      },
    }

    it('accepts valid input', () => {
      const result = createChurchEventSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects title shorter than 2 characters', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, title: 'A' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects title longer than 200 characters', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, title: 'A'.repeat(201) },
      })
      expect(result.success).toBe(false)
    })

    it('accepts title of exactly 2 characters', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, title: 'AB' },
      })
      expect(result.success).toBe(true)
    })

    it('accepts title of exactly 200 characters', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, title: 'A'.repeat(200) },
      })
      expect(result.success).toBe(true)
    })

    it('accepts endTime after startTime', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, endTime: futureEnd },
      })
      expect(result.success).toBe(true)
    })

    it('rejects endTime before startTime', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: {
          ...validInput.body,
          startTime: '2026-06-01T12:00:00Z',
          endTime: '2026-06-01T10:00:00Z',
        },
      })
      expect(result.success).toBe(false)
    })

    it('rejects endTime equal to startTime', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: {
          ...validInput.body,
          startTime: futureStart,
          endTime: futureStart,
        },
      })
      expect(result.success).toBe(false)
    })

    it.each(['service', 'community', 'volunteer', 'study', 'youth', 'other'] as const)(
      'accepts eventType "%s"',
      (eventType) => {
        const result = createChurchEventSchema.safeParse({
          ...validInput,
          body: { ...validInput.body, eventType },
        })
        expect(result.success).toBe(true)
      },
    )

    it('rejects invalid eventType', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, eventType: 'concert' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid startTime datetime', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, startTime: 'not-a-date' },
      })
      expect(result.success).toBe(false)
    })

    it('accepts null endTime', () => {
      const result = createChurchEventSchema.safeParse({
        ...validInput,
        body: { ...validInput.body, endTime: null },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('updateChurchEventSchema', () => {
    const baseInput = {
      params: { id: 'event-1' },
      query: emptyQuery,
    }

    it('accepts valid input with one field', () => {
      const result = updateChurchEventSchema.safeParse({
        ...baseInput,
        body: { title: 'Updated Title' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects when no fields are provided', () => {
      const result = updateChurchEventSchema.safeParse({
        ...baseInput,
        body: {},
      })
      expect(result.success).toBe(false)
    })

    it('rejects endTime before startTime when both provided', () => {
      const result = updateChurchEventSchema.safeParse({
        ...baseInput,
        body: {
          startTime: '2026-06-01T12:00:00Z',
          endTime: '2026-06-01T10:00:00Z',
        },
      })
      expect(result.success).toBe(false)
    })

    it('accepts endTime after startTime when both provided', () => {
      const result = updateChurchEventSchema.safeParse({
        ...baseInput,
        body: {
          startTime: futureStart,
          endTime: futureEnd,
        },
      })
      expect(result.success).toBe(true)
    })

    it('accepts endTime without startTime (no cross-field validation)', () => {
      const result = updateChurchEventSchema.safeParse({
        ...baseInput,
        body: { endTime: futureEnd },
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid eventType', () => {
      const result = updateChurchEventSchema.safeParse({
        ...baseInput,
        body: { eventType: 'invalid' },
      })
      expect(result.success).toBe(false)
    })
  })

  describe('eventsFeedSchema', () => {
    const baseInput = {
      params: emptyParams,
      query: {},
      body: emptyBody,
    }

    it('accepts empty query (all optional)', () => {
      const result = eventsFeedSchema.safeParse(baseInput)
      expect(result.success).toBe(true)
    })

    it('accepts valid type filter', () => {
      const result = eventsFeedSchema.safeParse({
        ...baseInput,
        query: { type: 'community' },
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid type filter', () => {
      const result = eventsFeedSchema.safeParse({
        ...baseInput,
        query: { type: 'invalid' },
      })
      expect(result.success).toBe(false)
    })

    it('accepts "to" on same date as "from"', () => {
      const result = eventsFeedSchema.safeParse({
        ...baseInput,
        query: {
          from: '2026-06-01T00:00:00Z',
          to: '2026-06-01T00:00:00Z',
        },
      })
      expect(result.success).toBe(true)
    })

    it('accepts "to" after "from"', () => {
      const result = eventsFeedSchema.safeParse({
        ...baseInput,
        query: {
          from: '2026-06-01T00:00:00Z',
          to: '2026-06-02T00:00:00Z',
        },
      })
      expect(result.success).toBe(true)
    })

    it('rejects "to" before "from"', () => {
      const result = eventsFeedSchema.safeParse({
        ...baseInput,
        query: {
          from: '2026-06-02T00:00:00Z',
          to: '2026-06-01T00:00:00Z',
        },
      })
      expect(result.success).toBe(false)
    })

    it('accepts page and pageSize', () => {
      const result = eventsFeedSchema.safeParse({
        ...baseInput,
        query: { page: 1, pageSize: 20 },
      })
      expect(result.success).toBe(true)
    })

    it('accepts search query string', () => {
      const result = eventsFeedSchema.safeParse({
        ...baseInput,
        query: { q: 'breakfast' },
      })
      expect(result.success).toBe(true)
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

  describe('userClaimsSchema', () => {
    it('accepts valid params id', () => {
      const result = userClaimsSchema.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('rejects empty params id', () => {
      const result = userClaimsSchema.safeParse({
        ...validInput,
        params: { id: '' },
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing params id', () => {
      const result = userClaimsSchema.safeParse({
        ...validInput,
        params: {},
      })
      expect(result.success).toBe(false)
    })
  })
})
