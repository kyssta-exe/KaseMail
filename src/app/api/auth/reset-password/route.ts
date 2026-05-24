import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { apiHandler } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({ token: z.string(), password: z.string().min(8) })

export const POST = apiHandler(async (req) => {
  const { token, password } = schema.parse(await req.json())
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!resetToken || resetToken.expiresAt < new Date() || resetToken.usedAt) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
  }
  const user = await prisma.user.findUnique({ where: { email: resetToken.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } })
  await prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } })
  return NextResponse.json({ success: true })
}, { auth: false, csrf: false, rateLimit: { key: "reset-pw:{ip}", max: 3, windowMs: 60000 } })
