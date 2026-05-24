import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { getCsrfToken } from "@/lib/csrf"
import { cookies } from "next/headers"

export const GET = apiHandler(async (_req, { user }) => {
  const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } })
  const csrfToken = await getCsrfToken()
  return NextResponse.json({ user, settings, csrfToken })
})

export const PATCH = apiHandler(async (req, { user }) => {
  const body = await req.json()
  const { displayName, ...rest } = body
  if (displayName) await prisma.user.update({ where: { id: user.id }, data: { displayName } })
  await prisma.userSettings.upsert({ where: { userId: user.id }, update: rest, create: { userId: user.id, ...rest } })
  return NextResponse.json({ success: true })
})
