import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export const POST = apiHandler(async (req) => {
  const { email } = schema.parse(await req.json())
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    const token = crypto.randomUUID()
    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt: new Date(Date.now() + 3600000) },
    })
    console.log(`Password reset token for ${email}: ${token}`)
  }
  return NextResponse.json({ success: true })
}, { auth: false, csrf: false, rateLimit: { key: "forgot-pw:{ip}", max: 3, windowMs: 60000 } })
