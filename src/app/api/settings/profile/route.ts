import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getCsrfToken } from "@/lib/csrf"
import { z } from "zod"

const updateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  timezone: z.string().max(64).optional(),
})

export async function GET() {
  try {
    const user = await requireAuth()
    const settings = await prisma.userSettings.findUnique({ where: { userId: user.id } })
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt,
      },
      settings: settings ?? null,
      csrfToken: await getCsrfToken(),
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

    if (parsed.email && parsed.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: parsed.email } })
      if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(parsed.displayName !== undefined && { displayName: parsed.displayName }),
        ...(parsed.email !== undefined && { email: parsed.email }),
      },
    })

    if (parsed.timezone !== undefined) {
      await prisma.userSettings.upsert({
        where: { userId: user.id },
        create: { userId: user.id, timezone: parsed.timezone },
        update: { timezone: parsed.timezone },
      })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
