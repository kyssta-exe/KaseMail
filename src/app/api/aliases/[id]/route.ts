import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { checkAliasOwnership } from "@/lib/rbac"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const updateSchema = z.object({ targets: z.array(z.string()).min(1) })

export const GET = apiHandler(async (_req, { user, params }) => {
  const alias = await prisma.alias.findUnique({
    where: { id: params.id },
    include: { domain: true },
  })
  if (!alias) return NextResponse.json({ error: "Alias not found" }, { status: 404 })
  await checkAliasOwnership(params.id, user.id)
  return NextResponse.json({ alias })
})

export const PATCH = apiHandler(async (req, { user, params }) => {
  await checkAliasOwnership(params.id, user.id)
  const body = updateSchema.parse(await req.json())
  const alias = await prisma.alias.update({ where: { id: params.id }, data: { targets: body.targets } })
  await logAudit({
    actorUserId: user.id,
    workspaceId: alias.workspaceId,
    action: "ALIAS_UPDATED",
    targetType: "Alias",
    targetId: alias.id,
  })
  return NextResponse.json({ alias })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "alias-update:{userId}", max: 20, windowMs: 60000 } })

export const DELETE = apiHandler(async (_req, { user, params }) => {
  await checkAliasOwnership(params.id, user.id)
  const alias = await prisma.alias.findUnique({ where: { id: params.id } })
  if (!alias) return NextResponse.json({ error: "Alias not found" }, { status: 404 })
  const mailCore = getMailCore()
  await mailCore.deleteAlias(alias.id)
  await prisma.alias.delete({ where: { id: params.id } })
  await logAudit({
    actorUserId: user.id,
    workspaceId: alias.workspaceId,
    action: "ALIAS_DELETED",
    targetType: "Alias",
    targetId: alias.id,
  })
  return NextResponse.json({ success: true })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "alias-delete:{userId}", max: 10, windowMs: 60000 } })
