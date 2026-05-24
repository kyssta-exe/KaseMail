import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { hashPassword } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { checkMailboxOwnership } from "@/lib/rbac"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const schema = z.object({ newPassword: z.string().min(8).max(256) })

export const POST = apiHandler(async (req, { user, params }) => {
  await checkMailboxOwnership(user.id, params.id)
  const mailbox = await prisma.mailbox.findUnique({ where: { id: params.id } })
  if (!mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 })
  const { newPassword } = schema.parse(await req.json())
  const hashed = await hashPassword(newPassword)
  await getMailCore().resetMailboxPassword(mailbox.mailCoreId || mailbox.address, newPassword)
  await prisma.mailbox.update({ where: { id: params.id }, data: { passwordHash: hashed } as any })
  await logAudit({
    actorUserId: user.id,
    workspaceId: mailbox.workspaceId,
    action: "MAILBOX_PASSWORD_RESET",
    targetType: "Mailbox",
    targetId: mailbox.id,
  })
  return NextResponse.json({ success: true })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "mailbox-reset-pw:{userId}", max: 5, windowMs: 60000 } })
