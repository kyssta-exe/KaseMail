import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const createSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1),
  defaultQuotaMb: z.number().optional(),
  catchAll: z.boolean().optional(),
})

export const GET = apiHandler(async (_req, { user }) => {
  const domains = await prisma.domain.findMany({
    where: {
      workspace: { members: { some: { userId: user.id } } },
    },
    include: {
      dnsChecks: true,
      _count: { select: { mailboxes: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ domains })
})

export const POST = apiHandler(async (req, { user }) => {
  const body = createSchema.parse(await req.json())
  const domain = await prisma.domain.create({
    data: {
      workspaceId: body.workspaceId,
      name: body.name,
      status: "CREATED",
    },
  })
  const mailCore = getMailCore()
  await mailCore.createDomain(body.name)
  await logAudit({
    actorUserId: user.id,
    workspaceId: body.workspaceId,
    action: "DOMAIN_CREATED",
    targetType: "Domain",
    targetId: domain.id,
  })
  return NextResponse.json({ domain })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "domain-create:{userId}", max: 10, windowMs: 60000 } })
