import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"
import { getMailboxes } from "@/lib/webmail"
import { z } from "zod"

const schema = z.object({ email: z.string().email(), password: z.string() })

export const POST = apiHandler(async (req) => {
  const { email, password } = schema.parse(await req.json())
  const folders = await getMailboxes(email, password)
  return NextResponse.json({ folders })
}, { csrf: false, rateLimit: { key: "mail-folders:{ip}", max: 20, windowMs: 60000 } })
