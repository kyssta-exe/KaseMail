import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async (req, { user }) => {
  const url = new URL(req.url)
  const take = Math.min(parseInt(url.searchParams.get("take") || "50"), 100)
  const skip = Math.max(parseInt(url.searchParams.get("skip") || "0"), 0)
  const workspaceIds = user.role === "SUPERADMIN"
    ? undefined
    : (await prisma.workspace.findMany({ where: { members: { some: { userId: user.id } } }, select: { id: true } })).map((w) => w.id)
  const where = user.role === "SUPERADMIN" ? {} : { OR: [{ actorUserId: user.id }, { workspaceId: { in: workspaceIds } }] }
  const auditLogs = await prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take, skip, include: { actor: { select: { email: true, displayName: true } } } })
  const total = await prisma.auditLog.count({ where })
  return NextResponse.json({ auditLogs, total })
})
