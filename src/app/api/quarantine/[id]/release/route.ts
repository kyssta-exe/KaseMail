import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"

export const POST = apiHandler(async (_req, { user, params }) => {
  const msg = await prisma.quarantineMessage.findUnique({ where: { id: params.id } })
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.quarantineMessage.update({ where: { id: params.id }, data: { status: "released", releasedAt: new Date() } })
  await logAudit({ actorUserId: user.id, action: "QUARANTINE_RELEASED", targetType: "QuarantineMessage", targetId: params.id })
  return NextResponse.json({ success: true })
})
