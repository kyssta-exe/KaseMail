import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const createSchema = z.object({
  workspaceId: z.string(),
  domainId: z.string(),
  address: z.string().email(),
  targets: z.array(z.string()).min(1),
})

export const GET = apiHandler(async (_req, { user }) => {
  const aliases = await prisma.alias.findMany({
    where: {
      workspace: { members: { some: { userId: user.id } } },
    },
    include: { domain: true, workspace: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ aliases })
})

export const POST = apiHandler(async (req, { user }) => {
  const body = createSchema.parse(await req.json())
  const { checkWorkspaceAccess } = await import("@/lib/rbac")
  await checkWorkspaceAccess(user.id, body.workspaceId)
  const mailCore = getMailCore()
  await mailCore.createAlias(body.address, body.targets)
  const alias = await prisma.alias.create({
    data: {
      workspaceId: body.workspaceId,
      domainId: body.domainId,
      address: body.address,
      targets: body.targets,
    },
  })
  await logAudit({
    actorUserId: user.id,
    workspaceId: body.workspaceId,
    action: "ALIAS_CREATED",
    targetType: "Alias",
    targetId: alias.id,
  })
  return NextResponse.json({ alias })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "alias-create:{userId}", max: 20, windowMs: 60000 } })
