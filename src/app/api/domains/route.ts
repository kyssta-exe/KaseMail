import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const createSchema = z.object({
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
      dnsChecks: { orderBy: { checkedAt: "desc" }, take: 1 },
      _count: { select: { mailboxes: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ domains })
})

export const POST = apiHandler(async (req, { user }) => {
  const body = createSchema.parse(await req.json())

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: { workspace: true },
  })
  if (!membership) return NextResponse.json({ error: "No workspace found for user" }, { status: 400 })

  const domain = await prisma.domain.create({
    data: {
      workspaceId: membership.workspaceId,
      name: body.name.toLowerCase(),
      status: "CREATED",
    },
  })

  const mailCore = getMailCore()
  try {
    await mailCore.createDomain(body.name.toLowerCase())
  } catch (e: any) {
    await prisma.domain.delete({ where: { id: domain.id } })
    return NextResponse.json({ error: `Mail server error: ${e.message}` }, { status: 502 })
  }

  await logAudit({
    actorUserId: user.id,
    workspaceId: domain.workspaceId,
    action: "DOMAIN_CREATED",
    targetType: "Domain",
    targetId: domain.id,
  })
  return NextResponse.json({ domain })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "domain-create:{userId}", max: 10, windowMs: 60000 } })
