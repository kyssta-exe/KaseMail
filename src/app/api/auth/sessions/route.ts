import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const user = await requireAuth()
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, ipAddress: true, userAgent: true, createdAt: true, expiresAt: true },
    })
    return NextResponse.json({ sessions })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth()
    const { sessionId } = await req.json()

    if (sessionId === "all") {
      await prisma.session.deleteMany({ where: { userId: user.id } })
    } else {
      const session = await prisma.session.findFirst({ where: { id: sessionId, userId: user.id } })
      if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
      await prisma.session.delete({ where: { id: sessionId } })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
