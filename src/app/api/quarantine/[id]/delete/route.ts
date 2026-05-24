import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"
import { checkQuarantineAccess } from "@/lib/rbac"

export const DELETE = apiHandler(async (_req, { user, params }) => {
  await checkQuarantineAccess(user.id, params.id)
  const msg = await prisma.quarantineMessage.findUnique({ where: { id: params.id } })
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.quarantineMessage.update({ where: { id: params.id }, data: { status: "deleted" } })
  await logAudit({ actorUserId: user.id, action: "QUARANTINE_DELETED", targetType: "QuarantineMessage", targetId: params.id })
  return NextResponse.json({ success: true })
})
