import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async (_req, { user }) => {
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { twoFactorOn: true } })
  const sessions = await prisma.session.findMany({ where: { userId: user.id }, select: { id: true, createdAt: true, ipAddress: true, userAgent: true } })
  return NextResponse.json({ twoFactorEnabled: dbUser?.twoFactorOn || false, sessions })
})

export const PATCH = apiHandler(async (req, { user }) => {
  const body = await req.json()
  await prisma.userSettings.upsert({ where: { userId: user.id }, update: body, create: { userId: user.id, ...body } })
  return NextResponse.json({ success: true })
})
