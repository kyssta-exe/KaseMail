import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createSession } from "@/lib/auth"
import { cookies } from "next/headers"
import { apiHandler } from "@/lib/api-handler"
import { z } from "zod"

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

export const POST = apiHandler(async (req) => {
  const body = loginSchema.parse(await req.json())
  const user = await prisma.user.findUnique({ where: { email: body.email } })
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const valid = await verifyPassword(body.password, user.passwordHash)
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const token = await createSession(user.id)
  const cookieStore = await cookies()
  cookieStore.set("session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" })

  return NextResponse.json({ user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } })
}, { auth: false, csrf: false, rateLimit: { key: "login:{ip}", max: 5, windowMs: 60000 } })
