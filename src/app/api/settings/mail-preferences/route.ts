import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const updateSchema = z.object({
  signature: z.string().max(10000).optional(),
  vacationEnabled: z.boolean().optional(),
  vacationMessage: z.string().max(5000).optional(),
  defaultSender: z.string().email().optional(),
})

export async function GET() {
  try {
    const user = await requireAuth()
    const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } })
    return NextResponse.json({
      signature: settings?.signature ?? "",
      vacationEnabled: settings?.vacationEnabled ?? false,
      vacationMessage: settings?.vacationMessage ?? "",
      defaultSender: settings?.defaultSender ?? user.email,
    })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = updateSchema.parse(body)

    const data: Record<string, any> = {}
    if (parsed.signature !== undefined) data.signature = parsed.signature
    if (parsed.vacationEnabled !== undefined) data.vacationEnabled = parsed.vacationEnabled
    if (parsed.vacationMessage !== undefined) data.vacationMessage = parsed.vacationMessage
    if (parsed.defaultSender !== undefined) data.defaultSender = parsed.defaultSender

    if (Object.keys(data).length > 0) {
      await prisma.userSettings.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...data },
        update: data,
      })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
