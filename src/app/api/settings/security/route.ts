import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { z } from "zod"

const securitySchema = z.object({
  twoFactorOn: z.boolean().optional(),
}).strict()

export const GET = apiHandler(async (_req, { user }) => {
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { twoFactorOn: true } })
  const sessions = await prisma.session.findMany({ where: { userId: user.id }, select: { id: true, createdAt: true, ipAddress: true, userAgent: true } })
  return NextResponse.json({ twoFactorEnabled: dbUser?.twoFactorOn || false, sessions })
})

export const PATCH = apiHandler(async (req, { user }) => {
  const body = securitySchema.parse(await req.json())
  if (typeof body.twoFactorOn === "boolean") {
    await prisma.user.update({ where: { id: user.id }, data: { twoFactorOn: body.twoFactorOn } })
  }
  return NextResponse.json({ success: true })
})
