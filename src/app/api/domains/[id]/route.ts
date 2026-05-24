import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { checkDomainOwnership } from "@/lib/rbac"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["CREATED", "AWAITING_OWNERSHIP", "DNS_PENDING", "ACTIVE", "SUSPENDED", "ARCHIVED"]).optional(),
  catchAllMailboxId: z.string().nullable().optional(),
})

export const GET = apiHandler(async (_req, { user, params }) => {
  await checkDomainOwnership(user.id, params.id)
  const domain = await prisma.domain.findUnique({ where: { id: params.id } })
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 })
  return NextResponse.json({ domain })
})

export const PATCH = apiHandler(async (req, { user, params }) => {
  await checkDomainOwnership(user.id, params.id)
  const body = updateSchema.parse(await req.json())
  const domain = await prisma.domain.update({ where: { id: params.id }, data: body })
  await logAudit({
    actorUserId: user.id,
    workspaceId: domain.workspaceId,
    action: "DOMAIN_UPDATED",
    targetType: "Domain",
    targetId: domain.id,
    metadata: body as any,
  })
  return NextResponse.json({ domain })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "domain-update:{userId}", max: 20, windowMs: 60000 } })

export const DELETE = apiHandler(async (_req, { user, params }) => {
  await checkDomainOwnership(user.id, params.id)
  const domain = await prisma.domain.findUnique({ where: { id: params.id } })
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 })
  const mailCore = getMailCore()
  await mailCore.deleteDomain(domain.name)
  await prisma.domain.delete({ where: { id: params.id } })
  await logAudit({
    actorUserId: user.id,
    workspaceId: domain.workspaceId,
    action: "DOMAIN_DELETED",
    targetType: "Domain",
    targetId: domain.id,
  })
  return NextResponse.json({ success: true })
}, { roles: ["SUPERADMIN"], rateLimit: { key: "domain-delete:{userId}", max: 10, windowMs: 60000 } })
