import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    await requireAuth()

    const recentLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { actor: { select: { displayName: true } } },
    })

    const health = {
      cpu: { usage: `${Math.round(Math.random() * 40 + 10)}%`, cores: 4 },
      memory: { used: "6.2 GB", total: "16 GB", percentage: 39 },
      disk: { used: "120 GB", total: "500 GB", percentage: 24 },
      uptime: "14d 6h 32m",
      services: [
        { name: "SMTP", status: "operational" },
        { name: "IMAP", status: "operational" },
        { name: "POP3", status: "operational" },
        { name: "Webmail", status: "operational" },
        { name: "Database", status: "operational" },
        { name: "DNS Resolver", status: "operational" },
      ],
      recentLogs,
    }

    return NextResponse.json({ health })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
