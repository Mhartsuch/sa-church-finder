import { sendEmail } from '../lib/email.js'

const APP_NAME = 'SA Church Finder'
const APP_URL = process.env.CLIENT_URL?.split(',')[0]?.trim() || 'https://sachurchfinder.com'

type EmailRecipient = {
  email: string
  name: string | null
}

type WelcomeEmailInput = EmailRecipient

type ClaimApprovedEmailInput = EmailRecipient & {
  churchName: string
  churchSlug: string
}

type ClaimRejectedEmailInput = EmailRecipient & {
  churchName: string
}

type ReviewRemovedEmailInput = EmailRecipient & {
  churchName: string
}

type ReviewRestoredEmailInput = EmailRecipient & {
  churchName: string
}

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

function wrapHtmlEmail(body: string): string {
  return `<div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">${body}</div>`
}

function buildButton(href: string, label: string): string {
  const escapedHref = escapeHtml(href)

  return `<a href="${escapedHref}" style="display: inline-block; padding: 12px 18px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;">${escapeHtml(label)}</a>`
}

// --- Welcome email ---

function buildWelcomeCopy(input: WelcomeEmailInput): {
  html: string
  subject: string
  text: string
} {
  const greetingName = resolveGreetingName(input.name)
  const escapedName = escapeHtml(greetingName)
  const searchUrl = `${APP_URL}/search`

  return {
    html: wrapHtmlEmail(
      `
      <p>Hi ${escapedName},</p>
      <p>Welcome to ${APP_NAME}! We're glad you're here.</p>
      <p>${APP_NAME} helps you discover churches in San Antonio that match what you're looking for — whether it's a specific denomination, service style, or neighborhood.</p>
      <p>Here are a few things you can do:</p>
      <ul>
        <li>Search and filter churches by location, denomination, and more</li>
        <li>Save your favorite churches for easy access later</li>
        <li>Leave reviews to help others in their search</li>
      </ul>
      <p>${buildButton(searchUrl, 'Start exploring')}</p>
      <p>Thanks for joining,<br />${APP_NAME}</p>
    `.trim(),
    ),
    subject: `Welcome to ${APP_NAME}`,
    text: [
      `Hi ${greetingName},`,
      '',
      `Welcome to ${APP_NAME}! We're glad you're here.`,
      '',
      `${APP_NAME} helps you discover churches in San Antonio that match what you're looking for.`,
      '',
      'Here are a few things you can do:',
      '- Search and filter churches by location, denomination, and more',
      '- Save your favorite churches for easy access later',
      '- Leave reviews to help others in their search',
      '',
      `Start exploring: ${searchUrl}`,
      '',
      'Thanks for joining,',
      APP_NAME,
    ].join('\n'),
  }
}

// --- Claim approved email ---

function buildClaimApprovedCopy(input: ClaimApprovedEmailInput): {
  html: string
  subject: string
  text: string
} {
  const greetingName = resolveGreetingName(input.name)
  const escapedName = escapeHtml(greetingName)
  const escapedChurchName = escapeHtml(input.churchName)
  const portalUrl = `${APP_URL}/leaders`

  return {
    html: wrapHtmlEmail(
      `
      <p>Hi ${escapedName},</p>
      <p>Great news! Your claim for <strong>${escapedChurchName}</strong> has been approved.</p>
      <p>You now have access to the Leaders Portal where you can:</p>
      <ul>
        <li>Edit your church's listing details</li>
        <li>Create and manage events</li>
        <li>Keep your service schedule up to date</li>
      </ul>
      <p>${buildButton(portalUrl, 'Go to Leaders Portal')}</p>
      <p>Thanks,<br />${APP_NAME}</p>
    `.trim(),
    ),
    subject: `Your claim for ${input.churchName} has been approved`,
    text: [
      `Hi ${greetingName},`,
      '',
      `Great news! Your claim for ${input.churchName} has been approved.`,
      '',
      'You now have access to the Leaders Portal where you can:',
      '- Edit your church listing details',
      '- Create and manage events',
      '- Keep your service schedule up to date',
      '',
      `Go to Leaders Portal: ${portalUrl}`,
      '',
      'Thanks,',
      APP_NAME,
    ].join('\n'),
  }
}

// --- Claim rejected email ---

function buildClaimRejectedCopy(input: ClaimRejectedEmailInput): {
  html: string
  subject: string
  text: string
} {
  const greetingName = resolveGreetingName(input.name)
  const escapedName = escapeHtml(greetingName)
  const escapedChurchName = escapeHtml(input.churchName)

  return {
    html: wrapHtmlEmail(
      `
      <p>Hi ${escapedName},</p>
      <p>We were unable to verify your claim for <strong>${escapedChurchName}</strong> at this time.</p>
      <p>This can happen when the verification email domain does not match the church's public contact information. If you believe this was a mistake, you're welcome to submit a new claim with an email address that matches the church's website or contact domain.</p>
      <p>Thanks,<br />${APP_NAME}</p>
    `.trim(),
    ),
    subject: `Update on your claim for ${input.churchName}`,
    text: [
      `Hi ${greetingName},`,
      '',
      `We were unable to verify your claim for ${input.churchName} at this time.`,
      '',
      "This can happen when the verification email domain does not match the church's public contact information. If you believe this was a mistake, you're welcome to submit a new claim with an email address that matches the church's website or contact domain.",
      '',
      'Thanks,',
      APP_NAME,
    ].join('\n'),
  }
}

// --- Review removed email ---

function buildReviewRemovedCopy(input: ReviewRemovedEmailInput): {
  html: string
  subject: string
  text: string
} {
  const greetingName = resolveGreetingName(input.name)
  const escapedName = escapeHtml(greetingName)
  const escapedChurchName = escapeHtml(input.churchName)

  return {
    html: wrapHtmlEmail(
      `
      <p>Hi ${escapedName},</p>
      <p>Your review for <strong>${escapedChurchName}</strong> was flagged by the community and has been removed after review by our moderation team.</p>
      <p>Reviews are removed when they violate our community guidelines. If you'd like to share your experience, you're welcome to write a new review that follows our guidelines.</p>
      <p>Thanks,<br />${APP_NAME}</p>
    `.trim(),
    ),
    subject: `Your review for ${input.churchName} has been removed`,
    text: [
      `Hi ${greetingName},`,
      '',
      `Your review for ${input.churchName} was flagged by the community and has been removed after review by our moderation team.`,
      '',
      "Reviews are removed when they violate our community guidelines. If you'd like to share your experience, you're welcome to write a new review that follows our guidelines.",
      '',
      'Thanks,',
      APP_NAME,
    ].join('\n'),
  }
}

// --- Review restored email ---

function buildReviewRestoredCopy(input: ReviewRestoredEmailInput): {
  html: string
  subject: string
  text: string
} {
  const greetingName = resolveGreetingName(input.name)
  const escapedName = escapeHtml(greetingName)
  const escapedChurchName = escapeHtml(input.churchName)

  return {
    html: wrapHtmlEmail(
      `
      <p>Hi ${escapedName},</p>
      <p>Good news — your review for <strong>${escapedChurchName}</strong> was flagged but has been reviewed by our moderation team and restored.</p>
      <p>No action is needed on your part. Thank you for contributing to the community.</p>
      <p>Thanks,<br />${APP_NAME}</p>
    `.trim(),
    ),
    subject: `Your review for ${input.churchName} has been restored`,
    text: [
      `Hi ${greetingName},`,
      '',
      `Good news — your review for ${input.churchName} was flagged but has been reviewed by our moderation team and restored.`,
      '',
      'No action is needed on your part. Thank you for contributing to the community.',
      '',
      'Thanks,',
      APP_NAME,
    ].join('\n'),
  }
}

// --- Exported send functions ---

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  const message = buildWelcomeCopy(input)

  await sendEmail({
    html: message.html,
    subject: message.subject,
    text: message.text,
    to: input.email,
  })
}

export async function sendClaimApprovedEmail(input: ClaimApprovedEmailInput): Promise<void> {
  const message = buildClaimApprovedCopy(input)

  await sendEmail({
    html: message.html,
    subject: message.subject,
    text: message.text,
    to: input.email,
  })
}

export async function sendClaimRejectedEmail(input: ClaimRejectedEmailInput): Promise<void> {
  const message = buildClaimRejectedCopy(input)

  await sendEmail({
    html: message.html,
    subject: message.subject,
    text: message.text,
    to: input.email,
  })
}

export async function sendReviewRemovedEmail(input: ReviewRemovedEmailInput): Promise<void> {
  const message = buildReviewRemovedCopy(input)

  await sendEmail({
    html: message.html,
    subject: message.subject,
    text: message.text,
    to: input.email,
  })
}

export async function sendReviewRestoredEmail(input: ReviewRestoredEmailInput): Promise<void> {
  const message = buildReviewRestoredCopy(input)

  await sendEmail({
    html: message.html,
    subject: message.subject,
    text: message.text,
    to: input.email,
  })
}
