import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth, verifyPassword, hashPassword } from "@/lib/auth"
import { z } from "zod"

const changeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { currentPassword, newPassword } = changeSchema.parse(body)

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })

    const passwordHash = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
