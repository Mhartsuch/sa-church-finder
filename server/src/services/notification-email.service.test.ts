import { sendEmail, isEmailDeliveryConfigured } from '../lib/email.js'
import {
  sendClaimStatusEmail,
  sendReviewResponseNotification,
  sendWelcomeEmail,
} from './notification-email.service.js'

jest.mock('../lib/email.js', () => ({
  __esModule: true,
  sendEmail: jest.fn().mockResolvedValue(undefined),
  isEmailDeliveryConfigured: jest.fn().mockReturnValue(true),
}))

const mockedSendEmail = sendEmail as jest.Mock
const mockedIsConfigured = isEmailDeliveryConfigured as jest.Mock

const originalClientUrl = process.env.CLIENT_URL

describe('notification email links', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedIsConfigured.mockReturnValue(true)
  })

  afterEach(() => {
    if (originalClientUrl === undefined) {
      delete process.env.CLIENT_URL
    } else {
      process.env.CLIENT_URL = originalClientUrl
    }
  })

  const lastMessage = (): { html: string; text: string } => {
    const call = mockedSendEmail.mock.calls.at(-1)
    if (!call) throw new Error('sendEmail was not called')
    return call[0] as { html: string; text: string }
  }

  it('uses the first origin when CLIENT_URL is a comma-separated list', async () => {
    process.env.CLIENT_URL = 'https://app.example.com,https://www.example.com'

    await sendWelcomeEmail({ email: 'visitor@example.com', name: 'Sam' })

    const { html, text } = lastMessage()
    expect(text).toContain('https://app.example.com/search')
    // The raw comma-joined value must never leak into a link.
    expect(html).not.toContain('https://www.example.com')
    expect(text).not.toContain(',https://www.example.com')
  })

  it('strips a trailing slash so links never contain a double slash', async () => {
    process.env.CLIENT_URL = 'https://app.example.com/'

    await sendClaimStatusEmail({
      email: 'leader@example.com',
      name: 'Pat',
      churchName: 'Grace Fellowship',
      churchSlug: 'grace-fellowship',
      status: 'approved',
    })

    const { text } = lastMessage()
    expect(text).toContain('https://app.example.com/leaders')
    expect(text).not.toContain('https://app.example.com//leaders')
  })

  it('falls back to the production default when CLIENT_URL is unset', async () => {
    delete process.env.CLIENT_URL

    await sendReviewResponseNotification({
      reviewerEmail: 'reviewer@example.com',
      reviewerName: 'Jordan',
      churchName: 'Grace Fellowship',
      churchSlug: 'grace-fellowship',
      responseExcerpt: 'Thanks for visiting!',
    })

    const { text } = lastMessage()
    expect(text).toContain('https://sachurchfinder.com/churches/grace-fellowship')
  })

  it('does not send when email delivery is not configured', async () => {
    mockedIsConfigured.mockReturnValue(false)

    await sendWelcomeEmail({ email: 'visitor@example.com', name: 'Sam' })

    expect(mockedSendEmail).not.toHaveBeenCalled()
  })
})
