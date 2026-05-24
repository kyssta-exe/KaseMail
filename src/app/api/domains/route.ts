import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { checkWorkspaceAccess } from "@/lib/rbac"
import { z } from "zod"

const domainNameSchema = z.string()
  .trim()
  .toLowerCase()
  .regex(/^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/, "Enter a valid root domain, such as example.com")

const createSchema = z.object({
  workspaceId: z.string().min(1),
  name: domainNameSchema,
})

export const GET = apiHandler(async (_req, { user }) => {
  const domains = await prisma.domain.findMany({
    where: {
      workspace: { members: { some: { userId: user.id } } },
    },
    include: {
      dnsChecks: { orderBy: { checkedAt: "desc" }, take: 12 },
      _count: { select: { mailboxes: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ domains })
})

export const POST = apiHandler(async (req, { user }) => {
  const body = createSchema.parse(await req.json())
  await checkWorkspaceAccess(user.id, body.workspaceId)
  const existing = await prisma.domain.findUnique({ where: { name: body.name }, select: { id: true } })
  if (existing) return NextResponse.json({ error: "Domain already exists" }, { status: 409 })

  const mailCore = getMailCore()
  try {
    await mailCore.createDomain(body.name)
  } catch (e: any) {
    return NextResponse.json({ error: `Mail server error: ${e.message}` }, { status: 502 })
  }

  let domain
  try {
    domain = await prisma.domain.create({
      data: {
        workspaceId: body.workspaceId,
        name: body.name,
        status: "CREATED",
      },
    })
  } catch (error) {
    await mailCore.deleteDomain(body.name).catch(() => undefined)
    throw error
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
