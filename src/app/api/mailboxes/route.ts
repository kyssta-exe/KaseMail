import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { checkDomainInWorkspace, checkWorkspaceAccess } from "@/lib/rbac"
import { z } from "zod"

const createSchema = z.object({
  workspaceId: z.string(),
  domainId: z.string(),
  localPart: z.string().trim().toLowerCase().regex(/^[a-z0-9._%+-]{1,64}$/, "Invalid mailbox local part"),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(256),
  quotaMb: z.number().int().min(128).max(1024 * 1024).optional(),
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
  await checkWorkspaceAccess(user.id, body.workspaceId)
  await checkDomainInWorkspace(user.id, body.workspaceId, body.domainId)

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

  let mailbox
  try {
    mailbox = await prisma.mailbox.create({
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
  } catch (error) {
    await mailCore.deleteMailbox(mailCoreResult.id || address).catch(() => undefined)
    throw error
  }

  await logAudit({
    actorUserId: user.id,
    workspaceId: body.workspaceId,
    action: "MAILBOX_CREATED",
    targetType: "Mailbox",
    targetId: mailbox.id,
  })

  return NextResponse.json({ mailbox })
}, { roles: ["SUPERADMIN", "WORKSPACE_ADMIN"], rateLimit: { key: "mailbox-create:{userId}", max: 10, windowMs: 60000 } })
