import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_SUPERADMIN_EMAIL || "superadmin@kase.local"
  const password = process.env.SEED_SUPERADMIN_PASSWORD || "ChangeMeNow!123"
  const workspaceName = process.env.SEED_WORKSPACE_NAME || "Primary Workspace"
  const workspaceSlug = process.env.SEED_WORKSPACE_SLUG || "primary"

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      displayName: process.env.SEED_SUPERADMIN_NAME || "Superadmin",
      role: "SUPERADMIN",
      passwordHash: await bcrypt.hash(password, 12),
    },
    create: {
      email,
      displayName: process.env.SEED_SUPERADMIN_NAME || "Superadmin",
      role: "SUPERADMIN",
      passwordHash: await bcrypt.hash(password, 12),
    },
  })

  const workspace = await prisma.workspace.upsert({
    where: { slug: workspaceSlug },
    update: { name: workspaceName },
    create: { name: workspaceName, slug: workspaceSlug, type: "team" },
  })

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: { role: "SUPERADMIN" },
    create: { workspaceId: workspace.id, userId: user.id, role: "SUPERADMIN" },
  })

  console.log(JSON.stringify({ superadminEmail: email, workspaceId: workspace.id }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
