import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async (_req, { user }) => {
  const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } })
  return NextResponse.json({ theme: settings?.theme || "dark", compact: settings?.compact || false, fontSize: settings?.fontSize || "md" })
})

export const PATCH = apiHandler(async (req, { user }) => {
  const body = await req.json()
  await prisma.userSettings.upsert({ where: { userId: user.id }, update: body, create: { userId: user.id, ...body } })
  return NextResponse.json({ success: true })
})
