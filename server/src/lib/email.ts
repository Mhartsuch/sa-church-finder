import nodemailer, { type Transporter } from 'nodemailer'

type EmailMessage = {
  html: string
  subject: string
  text: string
  to: string
}

type SmtpConfig = {
  auth?: {
    pass: string
    user: string
  }
  from: string
  host: string
  port: number
  secure: boolean
}

export type EmailDeliveryStatus = {
  configured: boolean
  missingFields: string[]
  status: 'configured' | 'disabled' | 'partial'
}

const DEFAULT_SMTP_PORT = 587

let cachedTransporter: Transporter | null = null
let cachedTransporterKey: string | null = null

function normalizeEnvValue(value?: string): string | undefined {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : undefined
}

function parseSmtpPort(rawPort: string | undefined): number {
  if (!rawPort) {
    return DEFAULT_SMTP_PORT
  }

  const parsedPort = Number.parseInt(rawPort, 10)

  if (Number.isNaN(parsedPort) || parsedPort <= 0) {
    return DEFAULT_SMTP_PORT
  }

  return parsedPort
}

function resolveSmtpSecure(port: number, env: NodeJS.ProcessEnv = process.env): boolean {
  const configuredSecure = normalizeEnvValue(env.SMTP_SECURE)?.toLowerCase()

  if (configuredSecure === 'true') {
    return true
  }

  if (configuredSecure === 'false') {
    return false
  }

  return port === 465
}

export function getEmailDeliveryStatus(env: NodeJS.ProcessEnv = process.env): EmailDeliveryStatus {
  const host = normalizeEnvValue(env.SMTP_HOST)
  const from = normalizeEnvValue(env.SMTP_FROM)
  const user = normalizeEnvValue(env.SMTP_USER)
  const pass = normalizeEnvValue(env.SMTP_PASS)
  const hasAnyCoreConfig = Boolean(host || from || user || pass)

  if (!hasAnyCoreConfig) {
    return {
      configured: false,
      missingFields: [],
      status: 'disabled',
    }
  }

  const missingFields: string[] = []

  if (!host || !from) {
    if (!host) {
      missingFields.push('SMTP_HOST')
    }

    if (!from) {
      missingFields.push('SMTP_FROM')
    }
  }

  if (user && !pass) {
    missingFields.push('SMTP_PASS')
  }

  if (pass && !user) {
    missingFields.push('SMTP_USER')
  }

  if (missingFields.length > 0) {
    return {
      configured: false,
      missingFields,
      status: 'partial',
    }
  }

  return {
    configured: true,
    missingFields: [],
    status: 'configured',
  }
}

function resolveSmtpConfig(env: NodeJS.ProcessEnv = process.env): SmtpConfig | null {
  if (!getEmailDeliveryStatus(env).configured) {
    return null
  }

  const host = normalizeEnvValue(env.SMTP_HOST)
  const from = normalizeEnvValue(env.SMTP_FROM)
  const port = parseSmtpPort(normalizeEnvValue(env.SMTP_PORT))
  const user = normalizeEnvValue(env.SMTP_USER)
  const pass = normalizeEnvValue(env.SMTP_PASS)
  const auth = user && pass ? { user, pass } : undefined

  return {
    auth,
    from: from!,
    host: host!,
    port,
    secure: resolveSmtpSecure(port, env),
  }
}

function createTransporterKey(config: SmtpConfig): string {
  return JSON.stringify({
    authUser: config.auth?.user ?? null,
    from: config.from,
    host: config.host,
    port: config.port,
    secure: config.secure,
  })
}

function getTransporter(config: SmtpConfig): Transporter {
  const transporterKey = createTransporterKey(config)

  if (!cachedTransporter || cachedTransporterKey !== transporterKey) {
    cachedTransporter = nodemailer.createTransport({
      auth: config.auth,
      host: config.host,
      port: config.port,
      secure: config.secure,
    })
    cachedTransporterKey = transporterKey
  }

  return cachedTransporter
}

export function isEmailDeliveryConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return getEmailDeliveryStatus(env).configured
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const config = resolveSmtpConfig()

  if (!config) {
    throw new Error('SMTP email delivery is not configured')
  }

  const transporter = getTransporter(config)

  await transporter.sendMail({
    from: config.from,
    html: message.html,
    subject: message.subject,
    text: message.text,
    to: message.to,
  })
}
