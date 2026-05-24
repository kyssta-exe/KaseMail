import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"
import { getMessages } from "@/lib/webmail"
import { z } from "zod"

const schema = z.object({ email: z.string().email(), password: z.string(), mailboxId: z.string(), limit: z.number().optional(), position: z.number().optional() })

export const POST = apiHandler(async (req) => {
  const body = schema.parse(await req.json())
  const result = await getMessages(body.email, body.password, body.mailboxId, body.limit, body.position)
  return NextResponse.json(result)
}, { rateLimit: { key: "mail-messages:{ip}", max: 30, windowMs: 60000 } })
