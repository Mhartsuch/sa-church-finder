import logger from '../lib/logger.js'
import { sendEmail, isEmailDeliveryConfigured } from '../lib/email.js'

const APP_NAME = 'SA Church Finder'
const BASE_URL = process.env.CLIENT_URL ?? 'https://sachurchfinder.com'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function resolveGreetingName(name: string | null): string {
  const trimmedName = name?.trim()
  return trimmedName && trimmedName.length > 0 ? trimmedName : 'there'
}

// ── Welcome email ──

interface WelcomeEmailInput {
  email: string
  name: string | null
}

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  if (!isEmailDeliveryConfigured()) return

  const greetingName = resolveGreetingName(input.name)
  const escapedName = escapeHtml(greetingName)
  const searchUrl = escapeHtml(`${BASE_URL}/`)

  try {
    await sendEmail({
      to: input.email,
      subject: `Welcome to ${APP_NAME}!`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
          <p>Hi ${escapedName},</p>
          <p>Welcome to ${APP_NAME} — your guide to finding the right church community in San Antonio.</p>
          <p>Here are a few things you can do now:</p>
          <ul>
            <li><strong>Search</strong> by denomination, neighborhood, service times, and more</li>
            <li><strong>Save</strong> churches to your favorites for easy access later</li>
            <li><strong>Review</strong> churches you have visited to help others on the same journey</li>
          </ul>
          <p>
            <a
              href="${searchUrl}"
              style="display: inline-block; padding: 12px 18px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;"
            >
              Start exploring
            </a>
          </p>
          <p>Thanks for joining,<br />${APP_NAME}</p>
        </div>
      `.trim(),
      text: [
        `Hi ${greetingName},`,
        '',
        `Welcome to ${APP_NAME} — your guide to finding the right church community in San Antonio.`,
        '',
        'Here are a few things you can do now:',
        '- Search by denomination, neighborhood, service times, and more',
        '- Save churches to your favorites for easy access later',
        '- Review churches you have visited to help others on the same journey',
        '',
        `Start exploring: ${BASE_URL}/`,
        '',
        'Thanks for joining,',
        APP_NAME,
      ].join('\n'),
    })
  } catch (error) {
    logger.error({ error, email: input.email }, 'Failed to send welcome email')
  }
}
