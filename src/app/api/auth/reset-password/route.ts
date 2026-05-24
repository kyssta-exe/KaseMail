import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, password } = resetSchema.parse(body)

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!resetToken || resetToken.expiresAt < new Date() || resetToken.usedAt) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    await prisma.$transaction([
      prisma.user.update({ where: { email: resetToken.email }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ])

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
