import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword } from "@/lib/auth"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"
import { z } from "zod"

const schema = z.object({ currentPassword: z.string(), newPassword: z.string().min(8) })

export const POST = apiHandler(async (req, { user }) => {
  const body = schema.parse(await req.json())
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const valid = await verifyPassword(body.currentPassword, dbUser.passwordHash)
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(body.newPassword) } })
  await logAudit({ actorUserId: user.id, action: "PASSWORD_CHANGED", targetType: "User", targetId: user.id })
  return NextResponse.json({ success: true })
}, { csrf: true, rateLimit: { key: "change-pw:{userId}", max: 3, windowMs: 60000 } })
