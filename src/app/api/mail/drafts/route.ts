import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"
import { saveDraft } from "@/lib/webmail"
import { z } from "zod"

const schema = z.object({ email: z.string().email(), password: z.string(), to: z.array(z.string()).optional(), subject: z.string().optional(), textBody: z.string().optional(), draftId: z.string().optional() })

export const POST = apiHandler(async (req) => {
  const body = schema.parse(await req.json())
  await saveDraft(body.email, body.password, body.to || [], body.subject || "", body.textBody || "", body.draftId)
  return NextResponse.json({ success: true })
}, { rateLimit: { key: "mail-drafts:{ip}", max: 30, windowMs: 60000 } })
