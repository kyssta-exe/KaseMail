import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { z } from "zod"

const preferencesSchema = z.object({
  signature: z.string().max(10000).optional(),
  vacationEnabled: z.boolean().optional(),
  vacationMessage: z.string().max(10000).nullable().optional(),
  defaultSender: z.string().email().or(z.literal("")).nullable().optional(),
}).strict()

export const GET = apiHandler(async (_req, { user }) => {
  const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } })
  return NextResponse.json({ signature: settings?.signature || "", vacationEnabled: settings?.vacationEnabled || false, vacationMessage: settings?.vacationMessage || null, defaultSender: settings?.defaultSender || "" })
})

export const PATCH = apiHandler(async (req, { user }) => {
  const body = preferencesSchema.parse(await req.json())
  await prisma.userSettings.upsert({ where: { userId: user.id }, update: body, create: { userId: user.id, ...body } })
  return NextResponse.json({ success: true })
})
