import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"
import { sendMessage } from "@/lib/webmail"
import { logAudit } from "@/lib/audit"
import { z } from "zod"

const schema = z.object({ email: z.string().email(), password: z.string(), to: z.array(z.string()), subject: z.string(), textBody: z.string(), htmlBody: z.string().optional(), cc: z.array(z.string()).optional(), bcc: z.array(z.string()).optional(), inReplyTo: z.string().optional() })

export const POST = apiHandler(async (req, { user }) => {
  const body = schema.parse(await req.json())
  await sendMessage(body.email, body.password, body.to, body.subject, body.textBody, body.htmlBody, body.cc, body.bcc, body.inReplyTo)
  await logAudit({ actorUserId: user.id, action: "EMAIL_SENT", targetType: "Mail", metadata: { to: body.to.join(","), subject: body.subject } })
  return NextResponse.json({ success: true })
}, { rateLimit: [{ key: "send:{userId}", max: 30, windowMs: 60000 }, { key: "send-ip:{ip}", max: 100, windowMs: 60000 }] })
