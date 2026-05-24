import { NextResponse } from "next/server"
import { apiHandler } from "@/lib/api-handler"
import { getMessage, markAsRead, markAsUnread, deleteMessage } from "@/lib/webmail"
import { z } from "zod"

export const POST = apiHandler(async (req, { params }) => {
  const { email, password } = z.object({ email: z.string().email(), password: z.string() }).parse(await req.json())
  const message = await getMessage(email, password, params.id)
  return NextResponse.json({ message })
}, { rateLimit: { key: "mail-get-msg:{ip}", max: 30, windowMs: 60000 } })

export const PATCH = apiHandler(async (req, { params }) => {
  const { email, password, action } = z.object({ email: z.string().email(), password: z.string(), action: z.string() }).parse(await req.json())
  if (action === "read") await markAsRead(email, password, params.id)
  else if (action === "unread") await markAsUnread(email, password, params.id)
  else if (action === "delete") await deleteMessage(email, password, params.id)
  else return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  return NextResponse.json({ success: true })
}, { rateLimit: { key: "mail-update-msg:{ip}", max: 60, windowMs: 60000 } })
