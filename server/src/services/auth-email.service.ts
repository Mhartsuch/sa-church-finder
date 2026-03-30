import { sendEmail } from '../lib/email.js'

type AuthEmailRecipient = {
  email: string
  name: string | null
}

type PasswordResetEmailInput = AuthEmailRecipient & {
  resetUrl: string
}

type VerificationEmailInput = AuthEmailRecipient & {
  verificationUrl: string
}

const APP_NAME = 'SA Church Finder'

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

function buildPasswordResetCopy(input: PasswordResetEmailInput): {
  html: string
  subject: string
  text: string
} {
  const greetingName = resolveGreetingName(input.name)
  const escapedName = escapeHtml(greetingName)
  const escapedResetUrl = escapeHtml(input.resetUrl)

  return {
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <p>Hi ${escapedName},</p>
        <p>We received a request to reset your ${APP_NAME} password.</p>
        <p>
          <a
            href="${escapedResetUrl}"
            style="display: inline-block; padding: 12px 18px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;"
          >
            Reset your password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p><a href="${escapedResetUrl}">${escapedResetUrl}</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Thanks,<br />${APP_NAME}</p>
      </div>
    `.trim(),
    subject: `Reset your ${APP_NAME} password`,
    text: [
      `Hi ${greetingName},`,
      '',
      `We received a request to reset your ${APP_NAME} password.`,
      '',
      `Reset your password: ${input.resetUrl}`,
      '',
      'If you did not request this, you can safely ignore this email.',
      '',
      'Thanks,',
      APP_NAME,
    ].join('\n'),
  }
}

function buildVerificationCopy(input: VerificationEmailInput): {
  html: string
  subject: string
  text: string
} {
  const greetingName = resolveGreetingName(input.name)
  const escapedName = escapeHtml(greetingName)
  const escapedVerificationUrl = escapeHtml(input.verificationUrl)

  return {
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <p>Hi ${escapedName},</p>
        <p>Thanks for creating your ${APP_NAME} account.</p>
        <p>Please verify your email address to finish setting up your account.</p>
        <p>
          <a
            href="${escapedVerificationUrl}"
            style="display: inline-block; padding: 12px 18px; background: #0f766e; color: #ffffff; text-decoration: none; border-radius: 8px;"
          >
            Verify your email
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p><a href="${escapedVerificationUrl}">${escapedVerificationUrl}</a></p>
        <p>If you did not create this account, you can ignore this email.</p>
        <p>Thanks,<br />${APP_NAME}</p>
      </div>
    `.trim(),
    subject: `Verify your ${APP_NAME} email`,
    text: [
      `Hi ${greetingName},`,
      '',
      `Thanks for creating your ${APP_NAME} account.`,
      'Please verify your email address to finish setting up your account.',
      '',
      `Verify your email: ${input.verificationUrl}`,
      '',
      'If you did not create this account, you can ignore this email.',
      '',
      'Thanks,',
      APP_NAME,
    ].join('\n'),
  }
}

export async function sendPasswordResetEmail(
  input: PasswordResetEmailInput,
): Promise<void> {
  const message = buildPasswordResetCopy(input)

  await sendEmail({
    html: message.html,
    subject: message.subject,
    text: message.text,
    to: input.email,
  })
}

export async function sendEmailVerificationEmail(
  input: VerificationEmailInput,
): Promise<void> {
  const message = buildVerificationCopy(input)

  await sendEmail({
    html: message.html,
    subject: message.subject,
    text: message.text,
    to: input.email,
  })
}
