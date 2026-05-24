import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"
import { moveMessage } from "@/lib/webmail"
import { z } from "zod"

const schema = z.object({ email: z.string().email(), password: z.string(), mailboxId: z.string() })

export const POST = apiHandler(async (req, { params }) => {
  const { email, password, mailboxId } = schema.parse(await req.json())
  // Move to spam and mark as read
  await moveMessage(email, password, params.id, mailboxId)
  return NextResponse.json({ success: true })
}, { rateLimit: { key: "mail-mark-spam:{ip}", max: 30, windowMs: 60000 } })
