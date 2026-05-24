import nodemailer from "nodemailer"
import { config } from "./config"

type MailInput = {
  to: string
  subject: string
  text: string
}

export function isSmtpConfigured(): boolean {
  return Boolean(config.smtp.host && config.smtp.from)
}

export async function sendMail(input: MailInput): Promise<boolean> {
  if (!isSmtpConfigured()) return false

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user && config.smtp.pass
      ? { user: config.smtp.user, pass: config.smtp.pass }
      : undefined,
  })

  await transporter.sendMail({
    from: config.smtp.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  })

  return true
}
