import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { checkDomainOwnership } from "@/lib/rbac"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["CREATED", "AWAITING_OWNERSHIP", "DNS_PENDING", "ACTIVE", "SUSPENDED", "ARCHIVED"]).optional(),
  catchAllMailboxId: z.string().nullable().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    const { id } = await params
    await checkDomainOwnership(user.id, id)
    const domain = await prisma.domain.findUnique({ where: { id } })
    if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    return NextResponse.json({ domain })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(["SUPERADMIN", "WORKSPACE_ADMIN"])
    const { id } = await params
    await checkDomainOwnership(user.id, id)
    const body = updateSchema.parse(await req.json())

    const domain = await prisma.domain.update({
      where: { id },
      data: body,
    })

    await logAudit({
      actorUserId: user.id,
      workspaceId: domain.workspaceId,
      action: "DOMAIN_UPDATED",
      targetType: "Domain",
      targetId: domain.id,
      metadata: body as Record<string, unknown> as Prisma.InputJsonValue,
    })

    return NextResponse.json({ domain })
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    }
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (e.code === "P2025") return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(["SUPERADMIN"])
    const { id } = await params
    await checkDomainOwnership(user.id, id)

    const domain = await prisma.domain.findUnique({ where: { id } })
    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    const mailCore = getMailCore()
    await mailCore.deleteDomain(domain.name)

    await prisma.domain.delete({ where: { id } })

    await logAudit({
      actorUserId: user.id,
      workspaceId: domain.workspaceId,
      action: "DOMAIN_DELETED",
      targetType: "Domain",
      targetId: domain.id,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
