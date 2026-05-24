import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const createSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1),
  defaultQuotaMb: z.number().optional(),
  catchAll: z.boolean().optional(),
})

export async function GET() {
  try {
    const user = await requireAuth()
    const domains = await prisma.domain.findMany({
      where: {
        workspace: { members: { some: { userId: user.id } } },
      },
      include: {
        dnsChecks: true,
        _count: { select: { mailboxes: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ domains })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(["SUPERADMIN", "WORKSPACE_ADMIN"])
    const body = createSchema.parse(await req.json())

    const domain = await prisma.domain.create({
      data: {
        workspaceId: body.workspaceId,
        name: body.name,
        status: "CREATED",
      },
    })

    const mailCore = getMailCore()
    await mailCore.createDomain(body.name)

    await logAudit({
      actorUserId: user.id,
      workspaceId: body.workspaceId,
      action: "DOMAIN_CREATED",
      targetType: "Domain",
      targetId: domain.id,
    })

    return NextResponse.json({ domain })
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    }
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
