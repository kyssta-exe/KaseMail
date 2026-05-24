import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"
import { moveMessage } from "@/lib/webmail"
import { z } from "zod"

const schema = z.object({ email: z.string().email(), password: z.string(), targetMailboxId: z.string() })

export const POST = apiHandler(async (req, { params }) => {
  const { email, password, targetMailboxId } = schema.parse(await req.json())
  await moveMessage(email, password, params.id, targetMailboxId)
  return NextResponse.json({ success: true })
}, { rateLimit: { key: "mail-move:{ip}", max: 60, windowMs: 60000 } })
