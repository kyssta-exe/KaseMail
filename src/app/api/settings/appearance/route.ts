import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const updateSchema = z.object({
  theme: z.enum(["dark", "light"]).optional(),
  compact: z.boolean().optional(),
  fontSize: z.enum(["sm", "md", "lg"]).optional(),
})

export async function GET() {
  try {
    const user = await requireAuth()
    const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } })
    return NextResponse.json({
      theme: settings?.theme ?? "dark",
      compact: settings?.compact ?? false,
      fontSize: settings?.fontSize ?? "md",
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
    if (parsed.theme !== undefined) data.theme = parsed.theme
    if (parsed.compact !== undefined) data.compact = parsed.compact
    if (parsed.fontSize !== undefined) data.fontSize = parsed.fontSize

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
