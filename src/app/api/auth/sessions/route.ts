import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"

export const GET = apiHandler(async (_req, { user }) => {
  const sessions = await prisma.session.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
  return NextResponse.json({ sessions })
})

export const DELETE = apiHandler(async (req, { user }) => {
  const { sessionId } = await req.json()
  if (sessionId === "all") {
    await prisma.session.deleteMany({ where: { userId: user.id } })
    await logAudit({ actorUserId: user.id, action: "ALL_SESSIONS_REVOKED", targetType: "Session" })
  } else {
    await prisma.session.deleteMany({ where: { id: sessionId, userId: user.id } })
    await logAudit({ actorUserId: user.id, action: "SESSION_REVOKED", targetType: "Session", targetId: sessionId })
  }
  return NextResponse.json({ success: true })
}, { csrf: true })
