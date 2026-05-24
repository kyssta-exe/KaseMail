import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await requireAuth()
    return NextResponse.json({
      twoFactorEnabled: user.twoFactorOn,
      sessions: await prisma.session.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, ipAddress: true, userAgent: true, createdAt: true, expiresAt: true },
      }),
    })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth()
    const { twoFactorEnabled } = await req.json()
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorOn: !!twoFactorEnabled },
    })
    return NextResponse.json({ twoFactorEnabled: !!twoFactorEnabled })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
