import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { getMailCore } from "@/lib/mail-core"
import { z } from "zod"

const createSchema = z.object({
  workspaceId: z.string(),
  domainId: z.string(),
  address: z.string().email(),
  targets: z.array(z.string()).min(1),
})

export async function GET() {
  try {
    const user = await requireAuth()
    const aliases = await prisma.alias.findMany({
      where: {
        workspace: { members: { some: { userId: user.id } } },
      },
      include: { domain: true, workspace: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ aliases })
  } catch (e: any) {
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(["SUPERADMIN", "WORKSPACE_ADMIN"])
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
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: e.issues }, { status: 400 })
    }
    if (e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (e.message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
