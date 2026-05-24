import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { checkMailboxOwnership } from "@/lib/rbac"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const updateSchema = z.object({
  status: z.enum(["CREATED", "ACTIVE", "SUSPENDED", "ARCHIVED", "DELETED"]).optional(),
  quotaMb: z.number().optional(),
  name: z.string().optional(),
})

export const GET = apiHandler(async (_req, { user, params }) => {
  const mailbox = await prisma.mailbox.findUnique({
    where: { id: params.id },
    include: { domain: true },
  })
  if (!mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 })
  await checkMailboxOwnership(user.id, params.id)
  return NextResponse.json({ mailbox })
})

export const PATCH = apiHandler(async (req, { user, params }) => {
  await checkMailboxOwnership(user.id, params.id)
  const body = updateSchema.parse(await req.json())
  const current = await prisma.mailbox.findUnique({ where: { id: params.id } })
  if (!current) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 })
  if (body.status && body.status !== current.status) {
    const mailCore = getMailCore()
    if (body.status === "SUSPENDED" || body.status === "ARCHIVED" || body.status === "DELETED") {
      await mailCore.suspendMailbox(current.mailCoreId || current.address)
    } else if (body.status === "ACTIVE") {
      await mailCore.unsuspendMailbox(current.mailCoreId || current.address)
    }
  }
  const mailbox = await prisma.mailbox.update({ where: { id: params.id }, data: body })
  await logAudit({
    actorUserId: user.id,
    workspaceId: mailbox.workspaceId,
    action: "MAILBOX_UPDATED",
    targetType: "Mailbox",
    targetId: mailbox.id,
    metadata: body as any,
  })
  return NextResponse.json({ mailbox })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "mailbox-update:{userId}", max: 20, windowMs: 60000 } })

export const DELETE = apiHandler(async (_req, { user, params }) => {
  await checkMailboxOwnership(user.id, params.id)
  const mailbox = await prisma.mailbox.findUnique({ where: { id: params.id } })
  if (!mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 })
  if (mailbox.mailCoreId) {
    const mailCore = getMailCore()
    await mailCore.deleteMailbox(mailbox.mailCoreId)
  }
  await prisma.mailbox.update({ where: { id: params.id }, data: { status: "DELETED" } })
  await logAudit({
    actorUserId: user.id,
    workspaceId: mailbox.workspaceId,
    action: "MAILBOX_DELETED",
    targetType: "Mailbox",
    targetId: mailbox.id,
  })
  return NextResponse.json({ success: true })
}, { roles: ["SUPERADMIN"], rateLimit: { key: "mailbox-delete:{userId}", max: 10, windowMs: 60000 } })
