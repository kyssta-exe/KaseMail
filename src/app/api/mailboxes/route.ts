import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const createSchema = z.object({
  workspaceId: z.string(),
  domainId: z.string(),
  localPart: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(6),
  quotaMb: z.number().optional(),
})

export const GET = apiHandler(async (_req, { user }) => {
  const mailboxes = await prisma.mailbox.findMany({
    where: {
      workspace: { members: { some: { userId: user.id } } },
    },
    include: { domain: true, workspace: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ mailboxes })
})

export const POST = apiHandler(async (req, { user }) => {
  const body = createSchema.parse(await req.json())
  const { checkWorkspaceAccess } = await import("@/lib/rbac")
  await checkWorkspaceAccess(user.id, body.workspaceId)

  const domain = await prisma.domain.findUnique({ where: { id: body.domainId } })
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 })

  const address = `${body.localPart}@${domain.name}`
  const quota = body.quotaMb ?? 10240

  const mailCore = getMailCore()
  const mailCoreResult = await mailCore.createMailbox({
    localPart: body.localPart,
    domain: domain.name,
    name: body.name,
    password: body.password,
    quotaMb: quota,
  })

  const mailbox = await prisma.mailbox.create({
    data: {
      workspaceId: body.workspaceId,
      domainId: body.domainId,
      localPart: body.localPart,
      address,
      quotaMb: quota,
      mailCoreId: mailCoreResult.id,
      status: "ACTIVE",
    },
  })

  await logAudit({
    actorUserId: user.id,
    workspaceId: body.workspaceId,
    action: "MAILBOX_CREATED",
    targetType: "Mailbox",
    targetId: mailbox.id,
  })

  return NextResponse.json({ mailbox })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "mailbox-create:{userId}", max: 10, windowMs: 60000 } })
