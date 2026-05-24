import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { checkAliasOwnership } from "@/lib/rbac"
import { z } from "zod"

const updateSchema = z.object({
  targets: z.array(z.string()).min(1),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(["SUPERADMIN", "WORKSPACE_ADMIN"])
    const { id } = await params
    await checkAliasOwnership(user.id, id)
    const body = updateSchema.parse(await req.json())

    const alias = await prisma.alias.update({
      where: { id },
      data: { targets: body.targets },
    })

    await logAudit({
      actorUserId: user.id,
      workspaceId: alias.workspaceId,
      action: "ALIAS_UPDATED",
      targetType: "Alias",
      targetId: alias.id,
    })

    return NextResponse.json({ alias })
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    }
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (e.code === "P2025") return NextResponse.json({ error: "Alias not found" }, { status: 404 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(["SUPERADMIN", "WORKSPACE_ADMIN"])
    const { id } = await params
    await checkAliasOwnership(user.id, id)

    const alias = await prisma.alias.findUnique({ where: { id } })
    if (!alias) {
      return NextResponse.json({ error: "Alias not found" }, { status: 404 })
    }

    const mailCore = getMailCore()
    await mailCore.deleteAlias(alias.id)

    await prisma.alias.delete({ where: { id } })

    await logAudit({
      actorUserId: user.id,
      workspaceId: alias.workspaceId,
      action: "ALIAS_DELETED",
      targetType: "Alias",
      targetId: alias.id,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
