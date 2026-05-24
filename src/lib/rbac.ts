import { prisma } from "./prisma"
import { ForbiddenError, NotFoundError } from "./errors"

async function isSuperadmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role === "SUPERADMIN"
}

export async function checkDomainOwnership(userId: string, domainId: string): Promise<void> {
  if (await isSuperadmin(userId)) return
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
    include: { workspace: { include: { members: { where: { userId } } } } },
  })
  if (!domain) throw new NotFoundError("Domain")
  if (domain.workspace.members.length === 0) throw new ForbiddenError()
}

export async function checkMailboxOwnership(userId: string, mailboxId: string): Promise<void> {
  if (await isSuperadmin(userId)) return
  const mailbox = await prisma.mailbox.findUnique({
    where: { id: mailboxId },
    include: { workspace: { include: { members: { where: { userId } } } } },
  })
  if (!mailbox) throw new NotFoundError("Mailbox")
  if (mailbox.workspace.members.length === 0) throw new ForbiddenError()
}

export async function checkAliasOwnership(userId: string, aliasId: string): Promise<void> {
  if (await isSuperadmin(userId)) return
  const alias = await prisma.alias.findUnique({
    where: { id: aliasId },
    include: { workspace: { include: { members: { where: { userId } } } } },
  })
  if (!alias) throw new NotFoundError("Alias")
  if (alias.workspace.members.length === 0) throw new ForbiddenError()
}

export async function checkWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
  if (await isSuperadmin(userId)) return
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  })
  if (!member) throw new ForbiddenError()
}

export async function checkDomainInWorkspace(userId: string, workspaceId: string, domainId: string): Promise<void> {
  if (await isSuperadmin(userId)) return
  const domain = await prisma.domain.findFirst({
    where: {
      id: domainId,
      workspaceId,
      workspace: { members: { some: { userId } } },
    },
    select: { id: true },
  })
  if (!domain) throw new ForbiddenError()
}

export async function checkQuarantineAccess(userId: string, messageId: string): Promise<void> {
  if (await isSuperadmin(userId)) return
  const message = await prisma.quarantineMessage.findFirst({
    where: {
      id: messageId,
      OR: [
        { domain: { workspace: { members: { some: { userId } } } } },
        { mailbox: { workspace: { members: { some: { userId } } } } },
      ],
    },
    select: { id: true },
  })
  if (!message) throw new NotFoundError("Quarantine message")
}
