import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { apiHandler } from "@/lib/api-handler"
import { logAudit } from "@/lib/audit"
import { z } from "zod"

const createSchema = z.object({ name: z.string(), slug: z.string(), type: z.string().optional() })

export const GET = apiHandler(async (_req, { user }) => {
  const workspaces = await prisma.workspace.findMany({ where: { members: { some: { userId: user.id } } } })
  return NextResponse.json({ workspaces })
})

export const POST = apiHandler(async (req, { user }) => {
  const body = createSchema.parse(await req.json())
  const workspace = await prisma.workspace.create({ data: { ...body, members: { create: { userId: user.id, role: "WORKSPACE_ADMIN" } } } })
  await logAudit({ actorUserId: user.id, action: "WORKSPACE_CREATED", targetType: "Workspace", targetId: workspace.id, metadata: { name: body.name } })
  return NextResponse.json({ workspace }, { status: 201 })
}, { rateLimit: { key: "workspace-create:{userId}", max: 5, windowMs: 60000 } })
