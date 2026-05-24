import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { getCsrfToken } from "@/lib/csrf"
import { z } from "zod"

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
}).strict()

export const GET = apiHandler(async (_req, { user }) => {
  const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } })
  const csrfToken = await getCsrfToken()
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      twoFactorOn: user.twoFactorOn,
    },
    settings,
    csrfToken,
  })
})

export const PATCH = apiHandler(async (req, { user }) => {
  const body = profileSchema.parse(await req.json())
  const { displayName, ...rest } = body
  if (displayName) await prisma.user.update({ where: { id: user.id }, data: { displayName } })
  await prisma.userSettings.upsert({ where: { userId: user.id }, update: rest, create: { userId: user.id, ...rest } })
  return NextResponse.json({ success: true })
})
