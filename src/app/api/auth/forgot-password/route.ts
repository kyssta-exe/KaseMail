import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const ip = req.headers.get("x-forwarded-for") || "unknown"
    rateLimit(`forgot-pw:${ip}`, 3, 60000)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: "If that email exists, a reset link has been sent." }, { status: 200 })

    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordResetToken.create({ data: { email, token, expiresAt } })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`

    if (process.env.NODE_ENV === "development") {
      console.log(`Password reset link: ${resetUrl}`)
    }

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." })
  } catch (e: any) {
    if (e.message === "Too many requests. Try again later.") {
      return NextResponse.json({ error: e.message }, { status: 429 })
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
