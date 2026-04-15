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
  const searchUrl = escapeHtml(`${BASE_URL}/search`)

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
        `Start exploring: ${BASE_URL}/search`,
        '',
        'Thanks for joining,',
        APP_NAME,
      ].join('\n'),
    })
  } catch (error) {
    logger.error({ error, email: input.email }, 'Failed to send welcome email')
  }
}

// ── Claim status notification ──

interface ClaimStatusEmailInput {
  email: string
  name: string | null
  churchName: string
  churchSlug: string
  status: 'approved' | 'rejected'
}

export async function sendClaimStatusEmail(input: ClaimStatusEmailInput): Promise<void> {
  if (!isEmailDeliveryConfigured()) return

  const greetingName = resolveGreetingName(input.name)
  const escapedName = escapeHtml(greetingName)
  const escapedChurchName = escapeHtml(input.churchName)
  const isApproved = input.status === 'approved'

  const subject = isApproved
    ? `Your claim for ${input.churchName} has been approved`
    : `Update on your claim for ${input.churchName}`

  const portalUrl = escapeHtml(`${BASE_URL}/leaders`)
  const profileUrl = escapeHtml(`${BASE_URL}/churches/${input.churchSlug}`)

  try {
    await sendEmail({
      to: input.email,
      subject,
      html: isApproved
        ? `
          <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
            <p>Hi ${escapedName},</p>
            <p>Great news — your claim for <strong>${escapedChurchName}</strong> has been approved!</p>
            <p>You can now manage your church listing, update service times, and create events from the Leaders Portal.</p>
            <p>
              <a
                href="${portalUrl}"
                style="display: inline-block; padding: 12px 18px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;"
              >
                Open Leaders Portal
              </a>
            </p>
            <p>Thanks,<br />${APP_NAME}</p>
          </div>
        `.trim()
        : `
          <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
            <p>Hi ${escapedName},</p>
            <p>We reviewed your claim for <strong>${escapedChurchName}</strong> and were unable to approve it at this time.</p>
            <p>This usually means we could not verify your connection to the church. If you believe this is an error, you can try again with a different verification email that matches the church's public domain.</p>
            <p>
              <a
                href="${profileUrl}"
                style="display: inline-block; padding: 12px 18px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;"
              >
                View church profile
              </a>
            </p>
            <p>Thanks,<br />${APP_NAME}</p>
          </div>
        `.trim(),
      text: isApproved
        ? [
            `Hi ${greetingName},`,
            '',
            `Great news — your claim for ${input.churchName} has been approved!`,
            '',
            'You can now manage your church listing, update service times, and create events from the Leaders Portal.',
            '',
            `Open Leaders Portal: ${BASE_URL}/leaders`,
            '',
            'Thanks,',
            APP_NAME,
          ].join('\n')
        : [
            `Hi ${greetingName},`,
            '',
            `We reviewed your claim for ${input.churchName} and were unable to approve it at this time.`,
            '',
            'This usually means we could not verify your connection to the church. If you believe this is an error, you can try again with a different verification email.',
            '',
            `View church profile: ${BASE_URL}/churches/${input.churchSlug}`,
            '',
            'Thanks,',
            APP_NAME,
          ].join('\n'),
    })
  } catch (error) {
    logger.error(
      { error, email: input.email, status: input.status },
      'Failed to send claim status email',
    )
  }
}

// ── Review response notification ──

interface ReviewResponseEmailInput {
  reviewerEmail: string
  reviewerName: string | null
  churchName: string
  churchSlug: string
  responseExcerpt: string
}

export async function sendReviewResponseNotification(
  input: ReviewResponseEmailInput,
): Promise<void> {
  if (!isEmailDeliveryConfigured()) return

  const greetingName = resolveGreetingName(input.reviewerName)
  const escapedName = escapeHtml(greetingName)
  const escapedChurchName = escapeHtml(input.churchName)
  const escapedExcerpt = escapeHtml(input.responseExcerpt.slice(0, 280))
  const truncated = input.responseExcerpt.length > 280
  const profileUrl = escapeHtml(`${BASE_URL}/churches/${input.churchSlug}`)

  try {
    await sendEmail({
      to: input.reviewerEmail,
      subject: `${input.churchName} replied to your review`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
          <p>Hi ${escapedName},</p>
          <p><strong>${escapedChurchName}</strong> replied to the review you left on ${APP_NAME}:</p>
          <div style="background: #f9fafb; border-left: 4px solid #0f766e; padding: 12px 16px; margin: 16px 0; border-radius: 4px; color: #4b5563;">
            ${escapedExcerpt}${truncated ? '...' : ''}
          </div>
          <p>
            <a
              href="${profileUrl}"
              style="display: inline-block; padding: 12px 18px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;"
            >
              View the reply
            </a>
          </p>
          <p>Thanks,<br />${APP_NAME}</p>
        </div>
      `.trim(),
      text: [
        `Hi ${greetingName},`,
        '',
        `${input.churchName} replied to the review you left on ${APP_NAME}:`,
        '',
        input.responseExcerpt.slice(0, 280) + (truncated ? '...' : ''),
        '',
        `View the reply: ${BASE_URL}/churches/${input.churchSlug}`,
        '',
        'Thanks,',
        APP_NAME,
      ].join('\n'),
    })
  } catch (error) {
    logger.error(
      { error, reviewerEmail: input.reviewerEmail },
      'Failed to send review response notification',
    )
  }
}

// ── New review notification ──

interface NewReviewEmailInput {
  adminEmail: string
  adminName: string | null
  churchName: string
  churchSlug: string
  reviewerName: string
  rating: number
  reviewExcerpt: string
}

export async function sendNewReviewNotification(input: NewReviewEmailInput): Promise<void> {
  if (!isEmailDeliveryConfigured()) return

  const greetingName = resolveGreetingName(input.adminName)
  const escapedName = escapeHtml(greetingName)
  const escapedChurchName = escapeHtml(input.churchName)
  const escapedReviewerName = escapeHtml(input.reviewerName)
  const escapedExcerpt = escapeHtml(input.reviewExcerpt.slice(0, 200))
  const stars = '★'.repeat(Math.round(input.rating)) + '☆'.repeat(5 - Math.round(input.rating))
  const profileUrl = escapeHtml(`${BASE_URL}/churches/${input.churchSlug}`)

  try {
    await sendEmail({
      to: input.adminEmail,
      subject: `New ${input.rating}-star review for ${input.churchName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
          <p>Hi ${escapedName},</p>
          <p><strong>${escapedReviewerName}</strong> left a new review for <strong>${escapedChurchName}</strong>:</p>
          <div style="background: #f9fafb; border-left: 4px solid #0f766e; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px;">${stars} (${input.rating}/5)</p>
            <p style="margin: 0; color: #4b5563;">${escapedExcerpt}${input.reviewExcerpt.length > 200 ? '...' : ''}</p>
          </div>
          <p>
            <a
              href="${profileUrl}"
              style="display: inline-block; padding: 12px 18px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;"
            >
              View on your profile
            </a>
          </p>
          <p>Thanks,<br />${APP_NAME}</p>
        </div>
      `.trim(),
      text: [
        `Hi ${greetingName},`,
        '',
        `${input.reviewerName} left a new review for ${input.churchName}:`,
        '',
        `${stars} (${input.rating}/5)`,
        input.reviewExcerpt.slice(0, 200) + (input.reviewExcerpt.length > 200 ? '...' : ''),
        '',
        `View on your profile: ${BASE_URL}/churches/${input.churchSlug}`,
        '',
        'Thanks,',
        APP_NAME,
      ].join('\n'),
    })
  } catch (error) {
    logger.error({ error, adminEmail: input.adminEmail }, 'Failed to send new review notification')
  }
}
