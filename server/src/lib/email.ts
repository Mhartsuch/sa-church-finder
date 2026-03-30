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

const DEFAULT_SMTP_PORT = 587

let cachedTransporter: Transporter | null = null
let cachedTransporterKey: string | null = null

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

function resolveSmtpSecure(port: number): boolean {
  const configuredSecure = process.env.SMTP_SECURE?.trim().toLowerCase()

  if (configuredSecure === 'true') {
    return true
  }

  if (configuredSecure === 'false') {
    return false
  }

  return port === 465
}

function resolveSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim()
  const from = process.env.SMTP_FROM?.trim()

  if (!host || !from) {
    return null
  }

  const port = parseSmtpPort(process.env.SMTP_PORT?.trim())
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const auth = user && pass ? { user, pass } : undefined

  return {
    auth,
    from,
    host,
    port,
    secure: resolveSmtpSecure(port),
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

export function isEmailDeliveryConfigured(): boolean {
  return resolveSmtpConfig() !== null
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
