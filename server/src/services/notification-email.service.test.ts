import {
  sendWelcomeEmail,
  sendClaimApprovedEmail,
  sendClaimRejectedEmail,
  sendReviewRemovedEmail,
  sendReviewRestoredEmail,
} from './notification-email.service.js'

const mockSendEmail = jest.fn()

jest.mock('../lib/email.js', () => ({
  __esModule: true,
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

describe('notification-email.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSendEmail.mockResolvedValue(undefined)
  })

  describe('sendWelcomeEmail', () => {
    it('sends a welcome email with the correct subject and recipient', async () => {
      await sendWelcomeEmail({ email: 'jane@example.com', name: 'Jane' })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      const call = mockSendEmail.mock.calls[0][0]
      expect(call.to).toBe('jane@example.com')
      expect(call.subject).toContain('Welcome')
      expect(call.html).toContain('Jane')
      expect(call.text).toContain('Jane')
    })

    it('uses a generic greeting when name is null', async () => {
      await sendWelcomeEmail({ email: 'anon@example.com', name: null })

      const call = mockSendEmail.mock.calls[0][0]
      expect(call.html).toContain('there')
      expect(call.text).toContain('there')
    })

    it('includes a link to the search page', async () => {
      await sendWelcomeEmail({ email: 'jane@example.com', name: 'Jane' })

      const call = mockSendEmail.mock.calls[0][0]
      expect(call.html).toContain('/search')
      expect(call.text).toContain('/search')
    })
  })

  describe('sendClaimApprovedEmail', () => {
    it('sends an approval email with church name', async () => {
      await sendClaimApprovedEmail({
        email: 'pastor@church.org',
        name: 'Pastor Mike',
        churchName: 'First Baptist Church',
        churchSlug: 'first-baptist-church',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      const call = mockSendEmail.mock.calls[0][0]
      expect(call.to).toBe('pastor@church.org')
      expect(call.subject).toContain('First Baptist Church')
      expect(call.subject).toContain('approved')
      expect(call.html).toContain('First Baptist Church')
      expect(call.html).toContain('Leaders Portal')
      expect(call.text).toContain('First Baptist Church')
    })

    it('escapes HTML in church name', async () => {
      await sendClaimApprovedEmail({
        email: 'pastor@church.org',
        name: 'Pastor',
        churchName: 'Faith & Grace <Church>',
        churchSlug: 'faith-grace-church',
      })

      const call = mockSendEmail.mock.calls[0][0]
      expect(call.html).toContain('Faith &amp; Grace &lt;Church&gt;')
      expect(call.html).not.toContain('<Church>')
    })
  })

  describe('sendClaimRejectedEmail', () => {
    it('sends a rejection email with church name', async () => {
      await sendClaimRejectedEmail({
        email: 'user@example.com',
        name: 'John',
        churchName: 'Grace Community',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      const call = mockSendEmail.mock.calls[0][0]
      expect(call.to).toBe('user@example.com')
      expect(call.subject).toContain('Grace Community')
      expect(call.html).toContain('Grace Community')
      expect(call.html).toContain('unable to verify')
      expect(call.text).toContain('unable to verify')
    })
  })

  describe('sendReviewRemovedEmail', () => {
    it('sends a removal notification with church name', async () => {
      await sendReviewRemovedEmail({
        email: 'reviewer@example.com',
        name: 'Sarah',
        churchName: 'Oak Hills Church',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      const call = mockSendEmail.mock.calls[0][0]
      expect(call.to).toBe('reviewer@example.com')
      expect(call.subject).toContain('Oak Hills Church')
      expect(call.subject).toContain('removed')
      expect(call.html).toContain('Oak Hills Church')
      expect(call.html).toContain('removed')
      expect(call.text).toContain('removed')
    })
  })

  describe('sendReviewRestoredEmail', () => {
    it('sends a restoration notification with church name', async () => {
      await sendReviewRestoredEmail({
        email: 'reviewer@example.com',
        name: 'Sarah',
        churchName: 'Oak Hills Church',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      const call = mockSendEmail.mock.calls[0][0]
      expect(call.to).toBe('reviewer@example.com')
      expect(call.subject).toContain('Oak Hills Church')
      expect(call.subject).toContain('restored')
      expect(call.html).toContain('restored')
      expect(call.text).toContain('restored')
    })

    it('uses a generic greeting when name is empty whitespace', async () => {
      await sendReviewRestoredEmail({
        email: 'reviewer@example.com',
        name: '   ',
        churchName: 'Test Church',
      })

      const call = mockSendEmail.mock.calls[0][0]
      expect(call.html).toContain('there')
    })
  })

  describe('error propagation', () => {
    it('propagates sendEmail errors', async () => {
      mockSendEmail.mockRejectedValue(new Error('SMTP connection failed'))

      await expect(sendWelcomeEmail({ email: 'jane@example.com', name: 'Jane' })).rejects.toThrow(
        'SMTP connection failed',
      )
    })
  })
})
