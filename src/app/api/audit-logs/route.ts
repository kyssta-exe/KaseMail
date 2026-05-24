import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    await requireAuth()

    const url = new URL(req.url)
    const take = Math.min(parseInt(url.searchParams.get("take") ?? "50"), 200)
    const skip = parseInt(url.searchParams.get("skip") ?? "0")

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        take,
        skip,
        include: {
          actor: { select: { id: true, email: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count(),
    ])

    return NextResponse.json({ logs, total })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
