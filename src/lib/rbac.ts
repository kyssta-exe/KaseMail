import { prisma } from "./prisma"

export async function checkDomainOwnership(userId: string, domainId: string): Promise<void> {
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
    include: { workspace: { include: { members: { where: { userId } } } } },
  })
  if (!domain) throw new Error("Not found")
  if (domain.workspace.members.length === 0) throw new Error("Forbidden")
}

export async function checkMailboxOwnership(userId: string, mailboxId: string): Promise<void> {
  const mailbox = await prisma.mailbox.findUnique({
    where: { id: mailboxId },
    include: { workspace: { include: { members: { where: { userId } } } } },
  })
  if (!mailbox) throw new Error("Not found")
  if (mailbox.workspace.members.length === 0) throw new Error("Forbidden")
}

export async function checkAliasOwnership(userId: string, aliasId: string): Promise<void> {
  const alias = await prisma.alias.findUnique({
    where: { id: aliasId },
    include: { workspace: { include: { members: { where: { userId } } } } },
  })
  if (!alias) throw new Error("Not found")
  if (alias.workspace.members.length === 0) throw new Error("Forbidden")
}

export async function checkWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  })
  if (!member) throw new Error("Forbidden")
}
