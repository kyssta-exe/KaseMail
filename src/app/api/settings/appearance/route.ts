import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { z } from "zod"

const appearanceSchema = z.object({
  theme: z.enum(["dark", "light"]).optional(),
  compact: z.boolean().optional(),
  fontSize: z.enum(["sm", "md", "lg"]).optional(),
}).strict()

export const GET = apiHandler(async (_req, { user }) => {
  const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } })
  return NextResponse.json({ theme: settings?.theme || "dark", compact: settings?.compact || false, fontSize: settings?.fontSize || "md" })
})

export const PATCH = apiHandler(async (req, { user }) => {
  const body = appearanceSchema.parse(await req.json())
  await prisma.userSettings.upsert({ where: { userId: user.id }, update: body, create: { userId: user.id, ...body } })
  return NextResponse.json({ success: true })
})
