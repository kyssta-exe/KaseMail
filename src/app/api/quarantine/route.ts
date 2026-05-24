import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"

export const GET = apiHandler(async (_req, { user }) => {
  const accessWhere = user.role === "SUPERADMIN"
    ? {}
    : {
        OR: [
          { domain: { workspace: { members: { some: { userId: user.id } } } } },
          { mailbox: { workspace: { members: { some: { userId: user.id } } } } },
        ],
      }
  const messages = await prisma.quarantineMessage.findMany({ where: { status: "quarantined", ...accessWhere }, orderBy: { createdAt: "desc" }, take: 100 })
  return NextResponse.json({ messages })
})
