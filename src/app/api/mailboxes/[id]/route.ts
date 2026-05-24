import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { checkMailboxOwnership } from "@/lib/rbac"
import { z } from "zod"

const updateSchema = z.object({
  status: z.enum(["CREATED", "ACTIVE", "SUSPENDED", "ARCHIVED", "DELETED"]).optional(),
  quotaMb: z.number().optional(),
  name: z.string().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(["SUPERADMIN", "WORKSPACE_ADMIN"])
    const { id } = await params
    await checkMailboxOwnership(user.id, id)
    const body = updateSchema.parse(await req.json())

    const mailbox = await prisma.mailbox.update({
      where: { id },
      data: body,
    })

    await logAudit({
      actorUserId: user.id,
      workspaceId: mailbox.workspaceId,
      action: "MAILBOX_UPDATED",
      targetType: "Mailbox",
      targetId: mailbox.id,
      metadata: body as Record<string, unknown> as Prisma.InputJsonValue,
    })

    return NextResponse.json({ mailbox })
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    }
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (e.code === "P2025") return NextResponse.json({ error: "Mailbox not found" }, { status: 404 })
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
    await checkMailboxOwnership(user.id, id)

    const mailbox = await prisma.mailbox.findUnique({ where: { id } })
    if (!mailbox) {
      return NextResponse.json({ error: "Mailbox not found" }, { status: 404 })
    }

    if (mailbox.mailCoreId) {
      const mailCore = getMailCore()
      await mailCore.deleteMailbox(mailbox.mailCoreId)
    }

    await prisma.mailbox.update({
      where: { id },
      data: { status: "DELETED" },
    })

    await logAudit({
      actorUserId: user.id,
      workspaceId: mailbox.workspaceId,
      action: "MAILBOX_DELETED",
      targetType: "Mailbox",
      targetId: mailbox.id,
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
